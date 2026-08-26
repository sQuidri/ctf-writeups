---
title: CubeCTF 2025
date: 2025-07-07
---

**CubeCTF 2025** was an annual cybersecurity competition featuring challenges across Web Exploitation, Reverse Engineering, Cryptography, Forensics, and OSINT/Misc.

- **Placement:** **19th Place** (*RMIT Computing* / *RMITC* - 2,997 pts)
- **Team:** [Sadiq](https://www.linkedin.com/in/sadiq-quadri-71795a33b/) (`wallsdeep13`) & [Ibrahim](https://www.linkedin.com/in/ibrahim-hizamul-ansari-4809b226a/) (`sleepyswords`)

This writeup archive documents the vulnerability mechanisms, exploitation paths, and step-by-step methodologies used to solve each challenge during the competition.

## Categories

- [Web](CubeCTF-2025/Web/) - Business logic bypass via negative quantity manipulation (Legal Snacks) and runtime prototype/attribute traversal leading to webhook exfiltration in Django-Unicorn (Todo).
- [Misc](CubeCTF-2025/Misc/) - Visual reconnaissance and geolocation OSINT identifying the Oasis Cable Car Station in Santiago, Chile (Is this stego?).
- [Rev](CubeCTF-2025/Rev/) - Exploiting an unfiltered standard error (stderr) stream in an assembly execution sandbox to leak environment variables (Gnisrever).
- [Crypto](CubeCTF-2025/Crypto/) - Decompiling an unpacked ELF binary to identify a time-seeded pseudo-random number generator (PRNG) and reconstructing the flag across network latency (Incantation).
- [Forensics](CubeCTF-2025/Forensics/) - Investigating an AccessData AD1 disk image to reverse a PyInstaller AES encryptor using Discord Snowflake IDs (Discord), and extracting a multi-stage backdoor binary from raw TCP packet captures (operator).
