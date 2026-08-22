---
title: "Hidden Secrets"
date: 2026-08-15
description: directory bruteforcing with ffuf/dirb uncovers the unlisted /about/ page which contains the flag and tells you exactly how it was found.
challenge_author: "James"
writeup_author: "wallsdeep13"
---
**Challenge:** https://ctf.urisc.club/challenges#Hidden%20Secrets-28

**Goal:** How do you find a subdirectory if you don't know its name?

**Flag:**
- `SRCTF!{T00ls_l1kke_DIRB_are_great_f0r_webs1tes}` — on the hidden `/about/` page

---

## Vulnerability

The `/about/` page exists on the server but is not linked anywhere in the public navigation. The only way to discover it is directory enumeration - systematically requesting paths from a wordlist until a non-404 response comes back.

## Attack Path

### 1. Run a directory bruteforce

Using a common wordlist with **ffuf** (or dirb, gobuster, feroxbuster etc):

```
ffuf -u https://sigsegv-ctf.duckdns.org/FUZZ -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -fc 404
```

```
about                   [Status: 308, Size: 231, Words: 18, Lines: 6]
```

`/about` returns a redirect (308) to `/about/`.

### 2. Visit the discovered path

```
GET /about/
```

The page renders an unfinished "About" section with a developer note that 'accidentally' contains the flag:

```html
<h1>About</h1>
<p>This page is a work in progress and should not be visible. If you can see it, please
    send error code SRCTF!{T00ls_l1kke_DIRB_are_great_f0r_webs1tes} to an admin
</p>
```

---

## Notes

- Any endpoint that should be restricted must be protected by authentication, not just kept off the navigation menu
- Directory bruteforcing is a standard recon step so assume attackers will fuzz every path
- Dirbuster is my personal favourite due to the UI, though it is deprecated and hence hard to find
