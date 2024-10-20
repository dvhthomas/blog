---
title: TIL Cloud migration and terraform
date: 2021-03-16T11:34:59-06:00
tags: [terraform, leadership]
toc: true
series: []
summary: From GCP to Terraform
mermaid: false
draft: false
---

## Practical Cloud Migration

Google's Tech Infrastructure team (think SRE) released [Practical Guide to Cloud Migration](https://sre.google/resources/practices-and-processes/practical-guide-to-cloud-migration/).

  _"75% of the application development team realized that they now had valuable new skills, and they didn’t feel like Company A provided a supportive environment.
  They took their newfound skills and found profitable work elsewhere.Company A had transformed its technological stack without transforming its company culture, and the employees that did the work and made the change weren’t given a voice."_

  _"But it didn’t have to happen like that.
  What if Company A had proactively maintained a positive and supportive culture while undergoing its cloud transformation?
  With planning, resources, and empathy, it is possible to achieve a cloud transformation while maintaining both your team and your company’s momentum.
  An empowered work‐ place culture that values psychological safety can supercharge any organization."_ (p.16, _Chapter 2: Celebrating (and Tweaking) Your Culture_)

## Exporting GCP infra to terraform

Since I just got on the Terrafrom bandwagon as a user vs. a reader, this piqued my interest:

{{< twitter user="vicnastea" id="1370166601991868419" >}}

Getting [the `resource-config` API](https://cloud.google.com/sdk/gcloud/reference/alpha/resource-config) running took a couple of tries, but here's what worked on a project called traintrack that I set up using Terraform:


1. The first time I tried this, the `gcloud` component installer got the alpha component installed.
1. The second time I tried it needed to install a binary dependency called `config-connector`, so once again I let it install and update.
1. Third time's a charm:

    > Note: this assumes that you've got a JSON-formatting key file and
    > the [correct `GOOGLE_APPLICATION_CREDENTIALS` set](https://cloud.google.com/docs/authentication/getting-started)
    > for a service account in that project.

    ```shell
    $ gcloud services enable cloudasset.googleapis.com --project=exp-traintrack-tf
    Operation "operations/acf.p2-157509977548-33c2ba20-e3c7-465a-8fd3-63653de9b9ab" finished successfully.
    $ gcloud alpha resource-config bulk-export \
    --resource-format=terraform --project=exp-traintrack-tf --path=tmp/
    Exporting resource configurations to [tmp/]...done.
    Exported 30 resource configuration(s) to [tmp/].
    ```

### Results

Sure enough I get YAML-formatted TF files:

```shell
tmp
├── c18hcf6cie6p2tnltqk0.yaml
├── c18hcf6cie6p2tnltqkg.yaml
├── c18hcfecie6p2tnltql0.yaml
├── c18hcfecie6p2tnltqlg.yaml
├── c18hcfmcie6p2tnltqm0.yaml
├── c18hcfmcie6p2tnltqmg.yaml
├── c18hcfmcie6p2tnltqn0.yaml
├── c18hcfmcie6p2tnltqng.yaml
├── c18hcfucie6p2tnltqo0.yaml
├── c18hcgmcie6p2tnltqog.yaml
├── c18hchmcie6p2tnltqp0.yaml
├── c18hciecie6p2tnltqpg.yaml
├── c18hcjecie6p2tnltqq0.yaml
├── c18hck6cie6p2tnltqqg.yaml
├── c18hcl6cie6p2tnltqr0.yaml
├── c18hclucie6p2tnltqrg.yaml
├── c18hcmmcie6p2tnltqs0.yaml
├── c18hcnmcie6p2tnltqsg.yaml
├── c18hcoecie6p2tnltqt0.yaml
├── c18hcpecie6p2tnltqtg.yaml
├── c18hcq6cie6p2tnltqu0.yaml
├── c18hcr6cie6p2tnltqug.yaml
├── c18hcrucie6p2tnltqv0.yaml
├── c18hcsucie6p2tnltqvg.yaml
├── c18hctmcie6p2tnltr00.yaml
├── c18hcumcie6p2tnltr0g.yaml
├── c18hcvecie6p2tnltr10.yaml
├── c18hd0ecie6p2tnltr1g.yaml
├── c18hd16cie6p2tnltr20.yaml
└── c18hd26cie6p2tnltr2g.yaml
```

And it appears to be a faithful reproduction of my initial configuration, albeit it annoyingly split up.

For example, here's my backend service:

```hcl
resource "google_compute_backend_service" "" {
  connection_draining_timeout_sec = 300

  iap {
    oauth2_client_id = "157509977548-0rfiqhdpmnpjpa8e541hr0se0051srd5.apps.googleusercontent.com"
  }

  load_balancing_scheme = "EXTERNAL"
  name                  = "bes-traintrack"
  port_name             = "http"
  project               = "exp-traintrack-tf"
  protocol              = "HTTP"
  session_affinity      = "NONE"
  timeout_sec           = 30
}
```
