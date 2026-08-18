---
title: "Operational Oversharing"
date: 2026-08-16
description: An API endpoint leaks more information than displayed.
---

**Challenge:** https://ctf.urisc.club/challenges#Operational%20Oversharing-37 (SRCTF 2026, Day 2)

**Goal:** "AussieMed has launched a public status dashboard so clinics can monitor its production services. The page promises to show only the approved public summary, but the browser may receive more than it displays. Find the note that operations did not mean to publish. Visit: /service-status"

**Flag:**
- `SRCTF!{all_systems_operational_said_the_flaming_server}` - on the hidden patient's detail page

---

## Vulnerability

`GET /api/service-status` contains a link to the operator report, which is `GET
/api/service-status/reports/ops-2026-08`, this endpoint is not protected against
unauthorised access.

## Attack Path

### 1. Find the Operator Link Using the Network Tab.

The service status page makes a request to an API endpoint that can be found in
the Network tab. Inspecting this request reveals the operator report link.

![Firefox Network Tab](/SRCTF-2026/images/service_status.png)

### 2. Fetch the Operator Report

`GET /api/service-status/reports/ops-2026-08` has the following response:

```json
{
    "classification":"internal-operations",
    "operatorNote":"U1JDVEYhe2FsbF9zeXN0ZW1zX29wZXJhdGlvbmFsX3NhaWRfdGhlX2ZsYW1pbmdfc2VydmVyfQ==",
    "operatorNoteEncoding":"base64",
    "reportId":"ops-2026-08"
}
```

### 3. Decrypting the String

Decrypting the base 64 string reveals the flag `U1JDVEYhe2FsbF9zeXN0ZW1zX29wZXJhdGlvbmFsX3NhaWRfdGhlX2ZsYW1pbmdfc2VydmVyfQ==`.

```
$ base64 -d
U1JDVEYhe2FsbF9zeXN0ZW1zX29wZXJhdGlvbmFsX3NhaWRfdGhlX2ZsYW1pbmdfc2VydmVyfQ==
SRCTF!{all_systems_operational_said_the_flaming_server}
```

---

