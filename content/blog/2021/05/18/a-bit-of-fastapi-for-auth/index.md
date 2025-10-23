---
title: A Bit of Fastapi for Auth
date: 2021-05-18T13:54:13-06:00
tags: [python, auth, fastapi]
toc: true
series: []
summary: |-
    Learning more about JWT as a way to encode claims by getting hands-on with FastAPI, a relative newcomer to the Python family of web frameworks.
mermaid: false
mathjax: false
draft: false
---

> JSON Web Tokens are an open, industry standard RFC 7519 method for representing claims securely between two parties. ([source](https://jwt.io/))

{{< figure src="success.jpg" title="Log in, get a token, and share the claims!" >}}

Rather than trying to write up the details, I'm just pasting the `README.md` from a small experiment I ran.
I was trying to understand how JWT works by interacting with it as an HTTP client.

Future work could involve trying to be a full-on identity provider (or IDP in the SAML world), and [this walkthrough using Python and `python3-saml`](https://medium.com/@gohberg/okta-authentication-using-saml-simplified-python-version-74ea9d5b4be7) seems like a great starting point.

Or I suppose I could trying using a 3rd party IdP like Okta and trying to use it from inside a FastAPI; [they've got a sample for that](https://developer.okta.com/blog/2020/12/17/build-and-secure-an-api-in-python-with-fastapi).

Without further ado, here's the `README` content.

---

## Dev environment

Depends on:

- Python 3.x
- SQLite3 for dev

Note that we're install DEV dependencies:

```sh
python3 -m venv venv
source venv/bin/activate
pip3 install dev-requirements.txt
```

## Configuration


Make a copy of the `.env.example` and call it `.env`.

```txt
APP_SECRET=secret
DATABASE_URL=sqlite:///./test.db
```

Update the value of `APP_SECRET` with a secret.
You can generate a string for dev purposes using this:

```sh
openssl rand -hex 32
```

In production that secret will come from a secret manager and be injected into the production servers via an environment setting.

## Developing

Use the `serve.sh` script to start a hot-reloading server:

```sh
cd api
./serve.sh
```

> The `serve.sh` is currently a very simple one-liner: `uvicorn main:app --reload`.

That will automatically create a SQLite3 database named whatever you decided in the `.env` configuration.

You can use your favorite tool or just `sqlite3 test.db` to examine this database during app development.

## Create a user and get an access token

### Create a user

The API is authenticated so you'll need a user.
Use curl or [HTTPie](https://httpie.io/).
HTTPie is included in the `dev-requirements.txt` so the follow should just work.

```sh
$ http POST :8000/auth/register email=first@user.com password=blurp
...
{
    "email": "first@user.com",
    "id": "56df201e-7ab6-4edf-abb4-55fbed3e6c01",
    "is_active": true,
    "is_superuser": false,
    "is_verified": false
}
```

You can validate this worked:

```sh
$ sqlite3 test.db 'select * from user'
56df201e-7ab6-4edf-abb4-55fbed3e6c01|first@user.com|$2b$12$PVSEOW70pNVKHqmeZeHqsehk0rSl6yMPxwE/x1dV.1RwF42B7kFoG|1|0|0
```

### Login to get an access token

```sh
$ http --form POST :8000/auth/jwt/login username=first@user.com password=blurp
...
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiNTZkZjIwMWUtN2FiNi00ZWRmLWFiYjQtNTVmYmVkM2U2YzAxIiwiYXVkIjoiZmFzdGFwaS11c2VyczphdXRoIiwiZXhwIjoxNjIyNDg0OTI3fQ.coEGC1o8SylYVCjeOrJnmFrxUIqeoz7ujvjw7ZEd8TY",
    "token_type": "bearer"
}
```

Or just save to a variable:

```sh
$ token=$(http --form POST :8000/auth/jwt/login username=first@user.com password=blurp | jq --raw-output '.access_token')
$ echo $token
...same result
```

Make an authorized call. Note that support for JWT auth in `HTTPie` is provided by the [`httpie-jwt-auth`](https://github.com/teracyhq/httpie-jwt-auth) library.
So make sure that's been `pip install`-ed first.

```sh
$ http :8000/users/me --auth-type=jwt --auth=$token
HTTP/1.1 200 OK
content-length: 128
content-type: application/json
date: Mon, 31 May 2021 17:46:21 GMT
server: uvicorn

{
    "email": "first@user.com",
    "id": "56df201e-7ab6-4edf-abb4-55fbed3e6c01",
    "is_active": true,
    "is_superuser": false,
    "is_verified": false
}
```

### More user management

[The FastAPI Users](https://frankie567.github.io/fastapi-users/usage/flow/#6-logout) documentation covers other API requests you'll need.

As they note, the first superuser must be created directly via code or the database.
For example:

```sql
update user set is_superuser=1 where id='9ff2f365-7c30-4d56-8c92-173650fb93ae';
```
