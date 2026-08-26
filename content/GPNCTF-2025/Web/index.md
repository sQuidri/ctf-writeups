---
title: Web
date: 2025-06-22
---

Writeups for the Web Exploitation challenges from GPNCTF 2025.

## Challenges

- [Free Flagging](GPNCTF-2025/Web/free-flagging/) - PHP type juggling / magic hash equality vulnerability (`0e... == 0e...`).
- [Intro to Web - Part 1](GPNCTF-2025/Web/intro-to-web-part-1/) - Client-side parameter tampering to Local File Inclusion (LFI) reading `.env`.
- [Intro to Web - Part 2](GPNCTF-2025/Web/intro-to-web-part-2/) - Flask session cookie forgery using leaked secret keys to access moderator endpoints.
- [Intro to Web - Part 3](GPNCTF-2025/Web/intro-to-web-part-3/) - Stored XSS inside textarea reports to exfiltrate administrator session cookies to a webhook.
- [Intro to Web - Part 4](GPNCTF-2025/Web/intro-to-web-part-4/) - Admin XSS / CSRF triggering internal `/settings` updates to enable `/development` routes.
- [Real Christmas](GPNCTF-2025/Web/real-christmas/) - GraphQL injection in string concatenation mutations allowing unauthorized administrative privilege escalation.

## Back to [GPNCTF 2025](GPNCTF-2025/)
