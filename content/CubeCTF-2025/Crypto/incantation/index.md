---
title: "Incantation"
date: 2025-07-07
description: Reverse engineering an embedded UPX-packed ELF binary reveals a time-seeded PRNG; synchronizing the PRNG locally and accounting for network latency reconstructs the flag.
challenge_author: "Not specified"
writeup_author: "sleepyswords & wallsdeep13"
---

**Challenge:** Incantation

**Goal:** Reverse engineer a remote cryptographic service to recover the original flag string.

**Flag:**
- `cube{4br4c4d4br4_sh3z4m_pr3st0_98f814ff}` - reconstructed through synchronized PRNG simulation

---

## Vulnerability

Examining the provided challenge binary in a hex editor reveals that an ELF executable is embedded within the file:

![Hex editor view of binary headers](CubeCTF-2025/images/11_Screenshot_2025-07-07_at_1.39.34_pm.png)

Further inspection reveals the binary was packed with **UPX**:

![UPX packing header identified in hex dump](CubeCTF-2025/images/12_Screenshot_2025-07-07_at_1.40.25_pm.png)

Unpacking the executable using `upx -d`:

![Unpacking binary using upx -d](CubeCTF-2025/images/13_Screenshot_2025-07-07_at_1.44.25_pm.png)

Decompiling the unpacked binary in Ghidra / IDA reveals the encryption mechanism:

![Decompiled C pseudocode showing srand and rand logic](CubeCTF-2025/images/14_Screenshot_2025-07-07_at_1.45.19_pm.png)

The vulnerability is an **insecure pseudo-random number generator (PRNG)**. The binary initializes the random seed using the current Unix epoch time:

```c
srand(time(NULL));
```

For each round, it computes `rand() % 0x42` and uses the result as an index into the string buffer. Because `time(NULL)` has a low resolution (1-second granularity) and the C standard library's linear congruential generator (`rand()`) is completely deterministic given the seed, anyone who knows the server's approximate time can reproduce the exact same pseudo-random sequence.

Whenever `rand() % 0x42 == 0`, the output character at position `i` reveals the $i$-th character of the flag.

## Attack Path

### 1. Prototype Local Solver

Using Python's `ctypes` to call the standard C library (`libc.so.6`), we can seed `libc.srand` with our local timestamp and simulate the indexing logic:

```python
from pwn import *
from ctypes import CDLL

libc = CDLL('libc.so.6')

p = process(["./incantation", "CTF{test}"])
epoch_time_direct = libc.time(None)
print("Epoch time (direct):", epoch_time_direct)

inp = p.recvall()
l = len(inp)
libc.srand(epoch_time_direct)

known = [None for _ in range(l)]

def found():
    return all(x is not None for x in known)

i = 0
while True:
    if libc.rand() % 0x42 == 0:
        known[i] = inp[i]
        if found():
            break
    i = (i + 1) % l
```

### 2. Handle Network Latency on the Remote Target

When targeting the remote challenge server (`incantation.chal.cubectf.com:5757`), network transmission delay causes a small discrepancy between the client's local timestamp and the remote server's `time(NULL)` timestamp.

To overcome this, we first collect the entire stream of encrypted lines from the server, and then test a window of possible epoch time offsets (`range(-200, 200)`). Any invalid seed will quickly produce character collisions (inconsistent values at the same index), allowing us to discard wrong seeds immediately and lock onto the true seed:

```python
from pwn import *
from ctypes import CDLL

libc = CDLL('libc.so.6')

p = remote('incantation.chal.cubectf.com', 5757)
epoch_time_direct = libc.time(None)
print("Epoch time (direct):", epoch_time_direct)

inp = p.recvall()
da = inp.split(b"\r")[1:]

def attempt(seed):
    i = 0
    d_i = 0
    current_line = da[d_i]
    l = len(current_line)
    libc.srand(seed)

    known = [None for _ in range(l)]

    def found():
        return all(x is not None for x in known)

    while True:
        if libc.rand() % 0x42 == 0:
            if known[i] is None:
                known[i] = current_line[i]
            else:
                if known[i] != current_line[i]:
                    return False  # Inconsistent character, invalid seed
            
            if found():
                result = "".join(map(chr, known))
                if result.startswith("cube{"):
                    print("Flag recovered:", result)
                    return True
                else:
                    return False
        i = i + 1

        if i == l:
            i = 0
            d_i += 1
            if d_i >= len(da):
                return False
            current_line = da[d_i]

for offset in range(-200, 200):
    if attempt(epoch_time_direct + offset):
        break
```

### 3. Recover the Flag

Executing the solver against the remote server tests the offset window and reconstructs the full flag:

![Script executing and recovering characters](CubeCTF-2025/images/15_Screenshot_2025-07-07_at_1.55.29_pm.png)
![Flag output generated](CubeCTF-2025/images/16_Screenshot_2025-07-07_at_1.56.30_pm.png)

Flag:
```
cube{4br4c4d4br4_sh3z4m_pr3st0_98f814ff}
```

---

## Notes

- Never use standard PRNG functions like C's `rand()` or Python's `random` for security-sensitive operations or cryptographic indexing.
- Use cryptographically secure pseudo-random number generators (CSPRNGs) such as `/dev/urandom`, `getrandom()`, or `secrets` in Python.
