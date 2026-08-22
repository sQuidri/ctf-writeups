---
title: SRCTF 2026 - Day 2
---

Writeups from Day 2 of SRCTF 2026, held on 16/08/2026

## Challenges

- [Operational Oversharing](SRCTF-2026/Day-2/operational-oversharing/) - API endpoint leaks link to unprotected internal operator report
- [This Seems Odd](SRCTF-2026/Day-2/this-seems-odd/) - IDOR in the patient roster exposes a hidden high-value patient
- [I See You](SRCTF-2026/Day-2/i-see-you/) - the record endpoint's base64 ref lets you read the high-value patient's record PDF
- [I'll Be Reading That](SRCTF-2026/Day-2/ill-be-reading-that/) - XXE in the eRx prescription import leaks the .env with the Flask session signing key
- [The Auditor](SRCTF-2026/Day-2/the-auditor/) - GraphQL alias ordering bypass leaks the diagnostic token, unlocking command injection on the worker

## Back to [SRCTF 2026](SRCTF-2026/)
