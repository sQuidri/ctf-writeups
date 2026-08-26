---
title: "mini-dsp"
date: 2025-06-22
description: Static string extraction from a compiled binary revealing the plaintext flag embedded directly within read-only data.
challenge_author: "Not specified"
writeup_author: "sleepyswords & wallsdeep13"
---

**Challenge:** mini-dsp

**Goal:** Extract the flag from the provided executable `FUUUNNN_SURLEY`.

**Flag:**
- `GPNCTF{...}` - embedded as a printable ASCII string inside the binary

---

## Vulnerability & Analysis

The challenge provides a compiled binary named `FUUUNNN_SURLEY`. Before attempting dynamic analysis or in-depth decompilation, standard triage begins with inspecting printable strings stored in the binary's data sections.

## Attack Path

### 1. Run Strings on Binary

Execute the `strings` command across the binary:

```bash
strings FUUUNNN_SURLEY | grep -i "GPNCTF"
```

### 2. Retrieve the Flag

The flag is stored in plaintext within the `.rodata` section and appears directly in the command output.

---

## Notes

- Always perform basic static analysis (`file`, `strings`, `checksec`) as the first step when analyzing unknown binaries.
