---
title: "GCP Billing API Scripting"
date: 2020-02-12T13:29:23-07:00
tags: [gcp, shell-scripting]
abstract: "Using the Google Cloud Platform billing API for (a bit of fun) and profit"
toc: true
draft: false
---

## Getting an invoice out the door

One of the things we do at [Woolpert](https://www.woolpert.com) is service Google Cloud Platform (GCP) customers. Part of that is sending them a monthly bill for their cloud spend. And part of _that_ means assembling various bits of data from the GCP billing backend into a sensible report that customers can consume either by reading it, or by ingesting the data into their own systems.

Not inconsequentially, we don't get paid until customers have an invoice.

## The specific need

As part of our internal process we have to get a rather specific slice of data from the [Billing API](https://cloud.google.com/billing/docs/):

* a list of billing accounts under our management
* a list of projects under those accounts, and
* the 'human friendly' name of those projects.

That helps our customers to understand which projects they're generating expenses on, and for our internal billing system to reconcile against.

To restate in simpler terms: we need a list of accounts, project IDs, and human readable project names as a CSV.

## `gcloud` to the rescue

Since this felt experimental up front, I decided to use `gcloud` SDK command line interface in a shell script to interrogate the API and see if I could shape it to my needs. Because the data are billing records for all customers, I had to authenticate first using my corporate credentials. Let's assume you need to do something similar using `gcloud auth login`:

1. Make sure `gcloud` is configured with an identity that has permission to read all
   all the billing data in GCP under the Woolpert master billing account.
1. Make sure the identity you're using has read access to all of the projects under those
   billing accounts.

Validate the you're on the right track:

{{< highlight bash >}}
$ gcloud beta billing accounts list
...
010CF6-497F5E-0DA98F  Woolpert - Yadda Production    True  015B3F-38FDEE-43045A
...and a lot more...
{{</ highlight >}}

So we're rolling! I have the master billing ID, the name of the billing account, the fact that it's active (`True`), and the sub-billing account ID. I need to use the sub-billing account ID to go a query the project list for that account. Meaning: I need just a part of that output, and in a way that's easier to consume programmatically. The [`format` argument](https://cloud.google.com/sdk/gcloud/reference/topic/formats) for `gcloud` lets me do that. Changing the initial attempt:

{{< highlight bash >}}
$ gcloud beta billing accounts list --format="json"
  ...lots of data...
  {
    "displayName": "Woolpert - Blah Blah",
    "masterBillingAccount": "billingAccounts/015B3F-38FDEE-43045A",
    "name": "billingAccounts/01EDBE-B8B8EA-F43F93",
    "open": true
  },
  ...and more...
{{</highlight>}}

Now we see the sub-account ID that I'm after. It's the second part of the `"name"` parameter. How do I get to that? Let's adapt a little bit from the standard `--format="json"` approach and use a more refined filter. This took a little bit of trying; I found [this blog post on formatting](https://cloud.google.com/blog/products/gcp/filtering-and-formatting-fun-with) helpful.

{{< highlight shell "hl_lines=2">}}
$ gcloud beta billing accounts list \
    --format="value(name.scope(billing_account_id).segment(1))" \
    --filter=open=true \
    --sort-by=displayName
...
01D3CA-A54FCE-D9356F
015CEC-BB2772-78C023
019738-DE1C37-060E1E
01077E-3A6CFD-6D729E
01299D-7C7837-48D1FE
01746E-C0A6C3-C51192
016BB7-37D569-B64CD8
01AF86-9B20C7-157F0F
01790C-29014A-A34F57
...
{{</highlight>}}

This is where I found it had been useful to _first_ look at the JSON output, because extracting a `value` has a slight odd syntax at first glance. But with the JSON in mind, it seems pretty simple. In plain language:

* Get the value of `name`.
* Get the `billing_account_id` value.
* Extract only the second part after the forward slash (zero-based is segement 1)

Throw in a filter, and I have exactly what I need: a list of billing account IDs. I drop these in a text file for further use.

## Looping

Our billing system also needs the familiar project name. The only way I could easily see to get that was looping through the list of accounts from the previous step, and calling  the API thus:

{{< highlight shell "hl_lines=5" >}}
while read account; do
    gcloud beta billing projects list \
        --billing-account=$account \
        --sort-by=billing_account_id,PROJECT_ID \
        --format="csv[no-heading](billingAccountName.segment(1),projectId)" >> $ACCOUNT_PROJECTS
done <accounts.txt
{{</ highlight >}}

Now, this may be blindingly obvious to you, but I didn't know before this how to do a `while...do...done` loop through lines in a text file to execute a command for each line. `sed`, `wc`, and others, yes, with pipes. But explicit looping was new to me.

I've highlight line 5 because we see a handy new `--format` to export CSV data. `gcloud` CSV export does append a trailing comma to each line--which feels unecessary--and I'll deal with that later. But for scripting this is a great approach. So now I've got a text file `$ACCOUNT_PROJECTS` containing a comman-delimeted row for each project in each billing account containing: the billing ID and the project ID.

Next I need to get that friendly name, like "my cool cloud project" vs. "my-cool-project-04329834". Unfortunately, the `gcloud beta billing projects list` command cannot access that; it's an [attribute of the project itself](https://cloud.google.com/resource-manager/reference/rest/v1/projects#Project) called `name`. So, time to loop again and ask each project for that final bit of data, this time using  the `gcloud projects describe` command:

{{< highlight shell "hl_lines=7-11">}}
$ gcloud projects describe some-project-id \
    --format="csv[no-heading](projectNumber,projectId,name)"
{{</highlight>}}

Easy enough. We have all the data we need for our 'billing record' data for our internal process. Let's write the final usable bit of data for each of these projects into a CSV.

## Putting it all together

Here's what I actually wrote up as a top-to-bottom procedural script:

{{< highlight shell >}}
# Gets billing accounts and project data from GCP at a point in time.

ACCOUNTS=./accounts.csv
[ -e $ACCOUNTS ] && rm $ACCOUNTS
touch $ACCOUNTS

getProjectId() {
    # This gets the second field in a CSV string
    # https://stackoverflow.com/a/19482148/3074
    echo $1 | cut -d , -f 2 | xargs basename
}

# Get all of the billing accounts and their projects
echo "Getting the billing account list... (look in accounts.csv)"
gcloud beta billing accounts list \
    --format="value(name.scope(billing_account_id).segment(1))" \
    --filter=open=true \
    --sort-by=displayName > $ACCOUNTS


# Get all of the projects associated with those billing accounts.
ACCOUNT_PROJECTS=./projects.csv
[ -e $ACCOUNT_PROJECTS ] && rm $ACCOUNT_PROJECTS
touch $ACCOUNT_PROJECTS

echo "Getting the project list... (look in projects.csv)"
while read account; do
    # Note: If you want to see the full API output just set the `--format`
    # argument to json, i.e., --format="json".
    gcloud beta billing projects list \
        --billing-account=$account \
        --sort-by=billing_account_id,PROJECT_ID \
        --format="csv[no-heading](billingAccountName.segment(1),projectId)" >> $ACCOUNT_PROJECTS
done <$ACCOUNTS


# The `gcloud beta billing projects...` call from the previous step does *not* include the 'friendly' name of the project,
# so we'll have to go through each one in turn in this next loop and fetch that one-at-a-time.
RESULTS=./results.csv
[ -e $RESULTS ] && rm $RESULTS
touch $RESULTS

echo "Getting project details (try tail -f ./results.csv to see it happening)"
echo 'account_id,projectId,projectNumber,projectId,projectName' >> $RESULTS

while read row; do
    projectId=$(getProjectId $row)
    echo "Getting project info for ${projectId}"
    projectInfo=$(gcloud projects describe $projectId \
        --format="csv[no-heading](projectNumber,projectId,name)")
    # gcloud command sticks a comma on the end, so no need to put one between the two strings
    billingRecord=$row$projectInfo
    echo $billingRecord >> $RESULTS
done <$ACCOUNT_PROJECTS
{{</ highlight >}}

Probably the only thing worth calling out that is new is the `getProjectId` function. There's a(n un)suprising number of answers on StackOverflow about how to pull a specific 'column' or field out of a CSV file. You probably immediately thought of [`cut`](https://linux.die.net/man/1/cut) with various options; me too. But getting that to function on a single string vs. a line from a file led to a lot of gymnastics in approach. Instead I went with the elegant solution proposed [here](https://stackoverflow.com/a/19482148/3074) which did the trick nicely.

So there you have it: a few new tidbits to learn, and a couple of csv files that are ready on a monthly cron basis to enrich customer bills via the Cloud Billing API.
