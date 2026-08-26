---
title: "Discord"
date: 2025-07-05
description: Forensic analysis of a disk image (.ad1) reveals encrypted Discord cache files, leading to PyInstaller extraction, decompilation, and AES-CBC key derivation from a Discord Snowflake ID.
challenge_author: "Not specified"
writeup_author: "sleepyswords & wallsdeep13"
---

**Challenge:** Discord

**Goal:** Analyze a forensic disk image (`final.ad1`), reverse-engineer a custom encryption executable, and decrypt the victim's cached Discord images to retrieve the flag.

**Flag:**
- Flag retrieved from decrypted Discord cache image.

---

## Vulnerability & Forensic Evidence

The forensic artifact provided is an AccessData image (`final.ad1`). Opening the image in **FTK Imager** allows extracting the entire directory structure:

![FTK Imager showing directory structure of final.ad1](CubeCTF-2025/images/17_image.png)

Two anomalies are immediately evident:
1. **Encrypted Cache Files:** In Discord's local cache directory (`%APPDATA%\discord\Cache\Cache_Data`), files that should be standard PNG/JPEG image assets instead have a `.enc` file extension:

![Discord cache directory containing .enc files](CubeCTF-2025/images/18_image.png)

2. **Suspicious Binaries in Downloads:** The `Downloads` folder contains two executable files: `DiscordSetup.exe` and a standalone file encryption tool:

![Downloads directory showing DiscordSetup and encryptor tool](CubeCTF-2025/images/19_image.png)

## Attack Path

### 1. Reverse-Engineer the Encryptor Executable

Running `strings` on the encryption executable shows internal references to `python3.dll` and PyInstaller archive headers, identifying it as a compiled Python binary:

![Running strings on the binary to identify Python runtime](CubeCTF-2025/images/20_image.png)

We use **pyinstxtractor** to unpack the PyInstaller archive and extract the compiled Python bytecode:

![Extracting compiled bytecode using pyinstxtractor](CubeCTF-2025/images/21_image.png)

Decompiling the resulting `encrypt.pyc` using an online Python bytecode decompiler exposes the exact cryptographic routine:

![Decompiled Python source code of encrypt.py](CubeCTF-2025/images/22_image.png)

The encryption scheme functions as follows:
- **Algorithm:** AES-256 in CBC mode.
- **Key Derivation:** PBKDF2 applied to the victim's Discord User ID.
- **Salt:** `b'BBBBBBBBBBBBBBBB'` (16 bytes).
- **Iterations:** 1,000,000.
- **Key Length:** 32 bytes (256 bits).
- **IV:** `b'BBBBBBBBBBBBBBBB'`.

### 2. Retrieve the Discord User ID

To derive the correct key, we need the target's Discord User ID (Snowflake).

Examining the `DiscordSetup.exe` download and local configuration files reveals the user's Discord handle:

![DiscordSetup metadata indicating username](CubeCTF-2025/images/23_image.png)

Querying or looking up this Discord handle retrieves their 18-digit Snowflake User ID: `1334198101459861555`:

![Retrieving the numerical Discord Snowflake ID](CubeCTF-2025/images/24_image.png)

### 3. Decrypt the Cached Images

Using `pycryptodome`, we write a Python decryption script that derives the key via PBKDF2 and decrypts all `.enc` files back to PNG images:

```python
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Util.Padding import unpad
import os

user_id = "1334198101459861555"
salt = b'BBBBBBBBBBBBBBBB'
key = PBKDF2(user_id.encode(), salt, 32, 1000000)
iv = b'BBBBBBBBBBBBBBBB'

for filename in os.listdir('.'):
    if filename.endswith('.enc'):
        with open(filename, 'rb') as f:
            ciphertext = f.read()
        cipher = AES.new(key, AES.MODE_CBC, iv)
        try:
            plaintext = unpad(cipher.decrypt(ciphertext), 16)
        except ValueError as e:
            print(f"Error decrypting {filename}: {e}")
            continue
        output_name = filename.replace('.enc', '.png')
        with open(output_name, 'wb') as f:
            f.write(plaintext)
        print(f"Decrypted {filename} -> {output_name}")

print("All decryption complete.")
```

### 4. Recover the Flag

Opening the decrypted image files reveals the secret image containing the challenge flag:

![Decrypted Discord cache image revealing flag](CubeCTF-2025/images/25_image.png)

---

## Notes

- PyInstaller executables are easily reversed using `pyinstxtractor` and bytecode decompilers (`decompyle++`, `pycdc`).
- Deriving encryption keys from predictable or publicly queryable identifiers (like Discord IDs) with static salts provides no real confidentiality against forensic analysis.
