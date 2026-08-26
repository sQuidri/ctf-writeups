---
title: GPNCTF 2025
date: 2025-06-22
---

**GPNCTF 2025** was an annual cybersecurity competition featuring challenges across Web Exploitation, Reverse Engineering, Binary Exploitation (Pwn), and Miscellaneous categories.

- **Placement:** **42nd Place** (*RMIT Computing* / *RMITC* - 772 pts)
- **Team:** [Sadiq](https://www.linkedin.com/in/sadiq-quadri-71795a33b/) (`wallsdeep13`) & [Ibrahim](https://www.linkedin.com/in/ibrahim-hizamul-ansari-4809b226a/) (`sleepyswords`)

This writeup archive documents the vulnerability mechanisms, exploitation paths, and step-by-step methodologies used to solve each challenge during the competition.

## Categories

- [Web](GPNCTF-2025/Web/) - PHP type juggling / magic hashes (Free Flagging), client-side parameter tampering to LFI, Flask session signing key forgery, stored XSS account takeover, internal CSRF settings manipulation (Intro to Web Parts 1-4), and GraphQL mutation injection (Real Christmas).
- [Reverse](GPNCTF-2025/Rev/) - Static string extraction (mini-dsp) and solving linear systems of simultaneous equations using matrix inversion for cryptographic verification (The old way).
- [Pwn](GPNCTF-2025/Pwn/) - Stack buffer overflow in a note editor binary overflowing return pointers to execute a hidden win() function.
- [Misc](GPNCTF-2025/Misc/) - Git precedence confusion between branch names and commit hashes during automated checkout (Check-it-out).
