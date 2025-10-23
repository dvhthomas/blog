---
title: Multiple ssh keypairs and how to use them
date: 2021-03-12T17:51:48-07:00
tags: [ssh, security]
toc: true
series: []
summary: Finally learning more about ssh keypairs and how to manage them using ssh-agent.
mermaid: false
draft: false
---

## ssh tips

> This _seems_ to be working for now, but I think there's a lot I'm missing on `Host` vs `HostName`, and more.

I want to have multiple ssh key pairs to keep the scope of each key limited.
I also don't want to have to remember which one to use for which sites.

[Github has some helpful starter docs](https://docs.github.com/en/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#adding-your-ssh-key-to-the-ssh-agent).
And [this blog post](https://www.redhat.com/sysadmin/manage-multiple-ssh-key-pairs) got into some detail about how to use the `.ssh/config` file.

### The quick answer

```shell
ssh-keygen -t ed25519 -f ~/.ssh/id_gcp_csr_someproject -C "dylan.thomas@woolpert.com"
# Edit ~/.ssh/config if needed - see below
ssh-add ~/.ssh/id_gcp_csr_someproject
# git workflow
```

### Generate a meaningful key pair

> First tip: use a meaningful name for the key pair.

For example, I want to create one for use with my corporate email and for a specific source code repository on GCP:

```shell
ssh-keygen -t ed25519 -f ~/.ssh/id_gcp_csr_someproject -C "dylan.thomas@woolpert.com"
```

The `-f` option lets me give a useful name to the ID.

Now I have a key pair `~/.ssh/id_gcp_csr_someproject` to work with. How do I use it on the relevant site(s)?
That's where [`ssh-config`](https://man.openbsd.org/ssh_config) comes in.


### Get the public key value

Now, I have a real git repo that I'm trying to clone.
I followed the process to create the key.
Here's the public key:

```shell
$ cat ~/.ssh/id_gcp_csr_fleetrouting.pub
ssh-ed25519 AAAAblahblahblahC3MgZ/UF dylan.thomas@woolpert.com
```

Copy that key and follow your provider's advice for setting up the public key.
For example, in Clouse Source Repositories it looks like this:

{{< figure src="create-key-gcp.png" title="Creating the public key in Google Cloud Platform" >}}

### Configure `.ssh/config`

I've already got a GitHub setup for my personal account.
Using `ssh-agent` gives us a way to config all this using the `~/.ssh/config` files.

> If it does not already exist just `touch ~/.ssh/config` to create it.

Adding the Cloud Source Repo section for this specific repository looks like this.
Note the hostname that this ssh keypair will apply to:

```txt
Host *.github.com
  AddKeysToAgent yes
  IdentityFile ~/.ssh/id_github_personal
# New bit
Host *.source.cloud.google.com:2022/fleetrouting-app-ops/fleetrouting-app
  IdentityFile ~/.ssh/id_gcp_csr_fleetrouting
```

Now if you try your `git clone` it'll fail, even though it found the correct key to us based on the host:

```shell
$ git clone ssh://dylan.thomas@woolpert.com@source.developers.google.com:2022/p/fleetrouting-app-ops/r/fleetrouting-app
Cloning into 'fleetrouting-app'...
The authenticity of host '[source.developers.google.com]:2022 ([74.125.126.82]:2022)' can't be established.
ECDSA key fingerprint is SHA256:AGvEpqYNMqsRNIviwyk4J4HM0lEylomDBKOWZsBn434.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '[source.developers.google.com]:2022,[74.125.126.82]:2022' (ECDSA) to the list of known hosts.
dylan.thomas@woolpert.com@source.developers.google.com: Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights and the repository exists.
```

### Load the key into `ssh-agent`

We need to let the `ssh-agent` know about this new key by adding it thus (the [GitHub documentation on this point](https://docs.github.com/en/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#adding-your-ssh-key-to-the-ssh-agent) is really great):

```shell
ssh-add ~/.ssh/id_gcp_csr_fleetrouting
```

> Until I figure out a better way, you need to do this for each session.

And now our clone operation works:

```shell
$ git clone ssh://dylan.thomas@woolpert.com@source.developers.google.com:2022/p/fleetrouting-app-ops/r/fleetrouting-app
Cloning into 'fleetrouting-app'...
remote: Counting objects: 2, done
remote: Total 11267 (delta 9245), reused 11267 (delta 9245)
Receiving objects: 100% (11267/11267), 6.15 MiB | 20.38 MiB/s, done.
Resolving deltas: 100% (9245/9245), done.
```

### Two keypairs and git on the same host

I used this for github.com as well.
The problem there is a single domain (HostName) with two different keys. What to do?

Previously I did **not** have the `IdentitiesOnly yes` in there, and even though I was not attempting to push changes to a repository under github.com/woolpert, my Woolpert identity was getting used.

```shell
$ git push
ERROR: Permission to dvhthomas/bitsby.me.git denied to dylanthomas-woolpert.
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
```

Grrr. A [footnote to a StackOverflow post](https://stackoverflow.com/a/7927828) pointed me in the right direction.
So by adding the `IdentitiesOnly yes` to both entries:

```shell
Host *.github.com
  User git@github.com
  IdentitiesOnly yes
  AddKeysToAgent yes
  IdentityFile ~/.ssh/id_github_personal
Host *.github.com/woolpert
  HostName *.github.com/woolpert
  AddKeysToAgent yes
  IdentitiesOnly yes
  IdentityFile ~/.ssh/id_github_woolpert
```

It's worth noting that I also did:

```shell
git config user.name "Dylan Thomas"
git config user.email "dylant@hey.com"
git commit --amend --reset-author
```

Which sets _local_ config for the repo.
Now clear up `ssh-add` and re-try:

```shell
ssh-add -D
ssh-add ~/.ssh/id_github_personal
ssh-add ~/.ssh/id_github_woolpert
```

And try again:

```shell
git push
... stuff
remote: Resolving deltas: 100% (2/2), completed with 2 local objects.
To github.com:dvhthomas/bitsby.me.git
   9e6ab9f..02856f5  master -> master
```

Woohoo!
Now I'm consuming the correct ssh keypair now based on the hostname, and **not** worrying about the identity of the user making the push.

{{< figure src="git-log.png" title="Finally got the right identity pushing changes" >}}

### Current configuration

{{% code file="ssh-config" lang="ini" %}}