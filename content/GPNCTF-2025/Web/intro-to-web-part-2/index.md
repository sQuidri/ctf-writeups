---
title: "Intro to Web - Part 2"
date: 2025-06-22
description: Forging a Flask session cookie using a leaked secret key to escalate privileges to Moderator and access restricted notes.
challenge_author: "Not specified"
writeup_author: "sleepyswords & wallsdeep13"
---

**Challenge:** Intro to Web - Part 2

**Goal:** Escalate privileges to access the `/moderator` dashboard and view hidden moderator notes.

**Flag:**
- `GPNCTF{...}` - located inside a moderator-only note

---

## Vulnerability

In Flask web applications, client sessions are stored in client-side cookies signed cryptographically with `FLASK_APP_SECRET_KEY`. 

From **Intro to Web - Part 1**, we obtained the application's secret key from `.env`. Because Flask session cookies are only signed (not encrypted), knowing the secret key allows an attacker to tamper with the session payload and re-sign a valid cookie containing arbitrary session variables (such as `is_moderator: true` or `role: "moderator"`).

## Attack Path

### 1. Extract Secret Key

Using the LFI from Part 1, we read `.env` to retrieve `FLASK_APP_SECRET_KEY`.

### 2. Forge Moderator Session Cookie

Using `flask-unsign` or a Python script with Flask's `itsdangerous` serializer, sign a new cookie with elevated privileges:

```bash
flask-unsign --sign --cookie "{'role': 'moderator', 'logged_in': True}" --secret "<FLASK_APP_SECRET_KEY>"
```

### 3. Replace Cookie and Access Dashboard

1. Open DevTools > Application > Cookies and replace the `session` cookie with the forged moderator cookie.
2. Navigate to `/moderator`.
3. The dashboard displays the restricted moderator notes containing the flag.

---

## Notes

- Keep application secret keys strictly confidential and rotate them immediately if compromised.
- Store sensitive authorization roles server-side rather than relying solely on client-side session state.
