---
title: "operator"
date: 2025-07-05
description: Network packet capture (PCAP) analysis reconstructs a multi-stage backdoor binary sent over TCP and replays payload streams to extract a secret flag.
challenge_author: "Not specified"
writeup_author: "sleepyswords & wallsdeep13"
---

**Challenge:** operator

**Goal:** Analyze a network packet capture file (`pcap`), reconstruct a multi-stage payload delivery mechanism, and extract the secret flag.

**Flag:**
- `cube{c00l_0p3r4t0rs_us3_mult1_st4g3_p4yl04ds_8ab49338}` - written to `/tmp/supersecret` by the staged receiver

---

## Vulnerability & Network Analysis

Opening the capture file in Wireshark shows traffic between client port `58338` and remote service port `1776`:

![Wireshark showing command execution traffic on port 1776](CubeCTF-2025/images/26_Screenshot_2025-07-05_at_9.41.05_pm.png)

The command channel issues instructions to start a raw TCP listener on port `2025` and redirect incoming output to `/tmp/xcat`:

![Command channel creating listener redirected to /tmp/xcat](CubeCTF-2025/images/27_Screenshot_2025-07-05_at_9.42.41_pm.png)

Examining the TCP stream on port `2025`, multiple TCP packets with the `PSH` flag set transmit a full 64-bit ELF binary in raw byte chunks:

![Wireshark showing TCP PSH packets delivering ELF binary](CubeCTF-2025/images/28_Screenshot_2025-07-05_at_9.54.51_pm.png)

## Attack Path

### 1. Extract and Reconstruct the Binary

We copy the raw byte streams from the TCP PSH packets (as escaped C string byte sequences) and assemble them using Python:

```python
# Reconstruct ELF executable from packet chunks
with open('final', 'wb') as f:
    f.write(FIRST)
    f.write(SECOND)
    f.write(THIRD)
```

Running the `file` command verifies that the file is a valid 64-bit x86_64 ELF shared object:

![File command confirming valid ELF binary](CubeCTF-2025/images/29_Screenshot_2025-07-05_at_9.50.18_pm.png)

### 2. Trace Subsequent Commands

Further down the PCAP stream on port `1776`, the operator makes the binary executable and starts it listening on port `2025`, piping output into `/tmp/supersecret`:

```bash
chmod +x /tmp/xcat
/tmp/xcat -l 2025 > /tmp/supersecret
```

![Running /tmp/xcat listener directed to /tmp/supersecret](CubeCTF-2025/images/30_Screenshot_2025-07-05_at_9.51.14_pm.png)

### 3. Replay Multi-Stage Payload Packets

Subsequent packets in the PCAP show multiple encrypted/packed data blobs being transmitted to port `2025`. Using `pwntools`, we construct a replay script that connects to our local listener and sends the exact sequence of data packets captured in the trace:

```python
from pwn import *

conn = remote("localhost", 2025)

conn.send(b"Ln;V+\x1a\x90\x7f\xb6qP\x02\x7f\xcd\x84\xcbgre\x13b\x05\xd9e\xbb')")
conn.send(b"M'd\x030\x0c\x90c\xb1hF\x02m\x82\xfd")
conn.send(b"\x96\x00\x04o"\xd8\xd2t\x7fn7\xe3\x08\x00E\x00\x00\x81\xdf\\@\x00:\x06\x926\x05\xa1_\x89\x05\xa1d\x19\xd2\xaa\x07\xe99Wv\xa7OOS\x8d\x80\x18\x01\xf6:\xab\x00\x00\x01\x01\x08\x0a'5\xe0\xfb\x99\xeb9\x14Por\x05'I\xd1y\xbb8PMs\x88\xd7\xd8aunV1\x0c\xdex\xb7lJT{\xcd\x99\xc1pbdV1\x06\x90B\xfeoBLj\xcd\x83\xc1$erV1\x1c\xc2n\xfelKGg\xca\x85\xcb$ix\x02b\x0c\xc8{\xb1kFF\x14")
conn.send(b"Ein\x01#\x10\x9c+\xb6}QG9\x9e\xd7\xc3}'c\x192I\xc3n\xbdjFV>\x84\x99\xc8kuz\x176\x00\xdfe\xe4\x12")
conn.send(b"gru\x139\x0a\x80;\xb2G\x13R-\x9f\xc3\xda4ud)7\x1a\x83T\xb3mOV/\xb2\x84\xda0`$)2]\xc9g\xee,GQA\xd5\x96\xcc0>$Ez\x14\xba")
conn.send(b"M'\x7f\x192\x0c\x90e\xb1zLFg\xcd\x91\xc7jcdV6\x01\xd1\x7f\xf06\x0d(")

conn.close()
```

### 4. Execute and Read the Flag

We launch the reconstructed `xcat` listener:

```bash
./final -l 2025 > /tmp/supersecret
```

And run the Python replay script:

![Running the replay script in virtual environment](CubeCTF-2025/images/31_Screenshot_2025-07-05_at_9.58.33_pm.png)
![Server receiving replayed data packets](CubeCTF-2025/images/32_Screenshot_2025-07-05_at_9.58.25_pm.png)

Finally, displaying the contents of `/tmp/supersecret`:

![Reading flag from /tmp/supersecret](CubeCTF-2025/images/33_Screenshot_2025-07-05_at_9.59.26_pm.png)

Flag:
```
cube{c00l_0p3r4t0rs_us3_mult1_st4g3_p4yl04ds_8ab49338}
```

---

## Notes

- Multi-stage payload delivery splits malware functionality into initial dropper scripts, intermediate listener binaries, and subsequent data payloads to evade static perimeter defenses.
- Network packet analysis allows complete reconstruction of dropped binaries and captured payload traffic for offline execution and reverse engineering.
