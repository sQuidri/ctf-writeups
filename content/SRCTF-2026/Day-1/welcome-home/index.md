---
title: "Welcome Home"
date: 2026-08-15
description: flag hidden in an HTML comment inside the homepage source
challenge_author: "James"
writeup_author: "wallsdeep13"
---
**Challenge:** https://ctf.urisc.club/challenges#Welcome%20Home-26

**Goal:** A whistleblower let us know that AussieMed is hiding some deep secrets but wouldn't specify what, so it's up to you to figure that out. Speaking of secrets, I wonder if we can find anything hidden in the home page?

**Flag:**
- `SRCTF!{rZcAxiPGf0CBVxAq}` — embedded as an HTML comment in the homepage

---

## Vulnerability

The developer left the flag inside an HTML comment in the rendered homepage. Because HTML comments are sent verbatim to the browser, any user who views the page source can read them.

## Attack Path

### View the page source

Navigate to the homepage and open the browser's *View Page Source* (Ctrl+U), or send a plain HTTP request:

```
GET /
```

Scan the returned HTML for comments. Inside the Security First info-card there is a developer note that was accidentally committed with the flag in it:

```html
<div class="info-card">
    <h2>Security First</h2>
    <p>
        Patient privacy is the highest priority for our business to operate with integrity.
        Our platform securely stores sensitive information so your organisation can operate with peace of mind.
    </p> <!-- read above! SRCTF!{rZcAxiPGf0CBVxAq} -->
</div>
```

## Notes

- Don't store secrets in HTML comments?