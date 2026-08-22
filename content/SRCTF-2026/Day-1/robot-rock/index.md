---
title: "Robot Rock"
date: 2026-08-15
description: robots.txt discloses a hidden staging path that contains the flag — security through obscurity fails when you advertise the secret.
challenge_author: "Not specified"
writeup_author: "wallsdeep13"
---
**Challenge:** https://ctf.urisc.club/challenges#Robot%20Rock-33

**Goal:** If we tell the robots to stay out the humans might hear too!

**Flag:**
- `SRCTF!{r0b0ts_txt_1s_n0t_s3cur1ty}` - on the hidden staging page

---

## Vulnerability

`/robots.txt` is a public file intended to instruct web crawlers which paths to avoid indexing. It is publicly readable by anyone, including attackers.

## Attack Path

### 1. Read robots.txt

```
GET /robots.txt
```

```
User-agent: *
Disallow: /portal-preview/
Disallow: /upload
```

Two paths are disallowed. `/portal-preview/` sounds like it's worth checking out.

### 2. Visit the disallowed path

```
GET /portal-preview/
```

The page renders an internal staging build that was never meant to be public:

```
Portal Preview — Internal Build

This staging page is not linked anywhere on the live site and has not been
approved for public release. If you can read this, it was left exposed by
mistake.

Build note left by the dev team:
SRCTF!{r0b0ts_txt_1s_n0t_s3cur1ty}
```

---

## Notes

- Anything you want to keep secret should be protected by authentication, not just excluded from the crawl list.
