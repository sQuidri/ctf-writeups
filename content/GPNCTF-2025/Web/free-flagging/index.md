---
title: "Free Flagging"
date: 2025-06-22
description: Exploiting PHP loose comparison (type juggling) with MD5 magic hashes to bypass authentication checks.
challenge_author: "Not specified"
writeup_author: "sleepyswords & wallsdeep13"
---

**Challenge:** Free Flagging

**Goal:** Bypass a PHP MD5 hash comparison check to receive the flag.

**Flag:**
- `GPNCTF{...}` - returned when the hash comparison evaluates to true

---

## Vulnerability

The application verifies an incoming user string against a stored hash using PHP's loose equality operator (`==`):

```php
if (md5($user_input) == $stored_hash) {
    echo $flag;
}
```

The application discloses that the expected hash begins with `0e` followed solely by numeric digits (for example, `0e123456...`).

In PHP, the loose comparison operator (`==`) performs automatic type juggling. When both strings begin with `0e` and contain only numbers, PHP parses them as numbers in scientific notation ($0 \times 10^{x}$). Because $0 \times 10^{x} = 0$, both sides evaluate to `0`:

$$0 == 0 \implies \text{true}$$

This vulnerability is known as a **Magic Hash** or **PHP Type Juggling** flaw.

## Attack Path

### 1. Identify Magic Hash String

We find a standard input string whose MD5 hash starts with `0e` followed exclusively by numbers. A well-known example is `QNKCDZO`:

$$\text{MD5}(\text{"QNKCDZO"}) = \text{"0e830400451993494058024219903391"}$$

### 2. Send Request

Submit `QNKCDZO` in the request body:

```http
POST /verify HTTP/1.1
Host: free-flagging.chal.gpnctf.com
Content-Type: application/x-www-form-urlencoded

code=QNKCDZO
```

### 3. Retrieve the Flag

PHP evaluates `"0e830400451993494058024219903391" == "0e..."` as `0 == 0` (true), passing the check and printing the flag.

---

## Notes

- Always use strict comparison (`===`) or `hash_equals()` in PHP when comparing cryptographic hashes to prevent type juggling.
