---
title: "Intro to Web - Part 1"
date: 2025-06-22
description: Client-controlled hidden form parameter tampering allows Local File Inclusion (LFI) to read the server's .env file.
challenge_author: "Not specified"
writeup_author: "sleepyswords & wallsdeep13"
---

**Challenge:** Intro to Web - Part 1

**Goal:** Exploit an input field in the note creation feature to read the `.env` configuration file and extract the flag.

**Flag:**
- `GPNCTF{...}` - base64-encoded inside the rendered image preview

---

## Vulnerability

When creating a new note, the web page includes a hidden form element intended to attach a default image:

```html
<input type="hidden" name="image_path" required="" value=".img/3.png">
```

The server takes `image_path`, reads the specified file from disk, and converts its binary contents into a base64-encoded `data:image/png;base64,...` URI rendered on the note view page.

Because the server performs no path sanitization or whitelisting on `image_path`, an attacker can change the path to arbitrary local files, such as `.env`.

## Attack Path

### 1. Tamper with the Form Parameter

Open browser Developer Tools (F12) and inspect the note creation form. Modify the `value` attribute of `image_path`:

```html
<input type="hidden" name="image_path" value=".env">
```

### 2. Submit the Note

Submit the form to create the note.

### 3. Decode the Base64 File Content

Open the note view page. The image element contains the base64-encoded contents of `.env`. Copy the base64 payload from the `src` attribute and decode it:

```bash
echo "<base64_data>" | base64 -d
```

The decoded text reveals the contents of `.env` along with the challenge flag and the `FLASK_APP_SECRET_KEY`.

---

## Notes

- Never trust client-submitted file paths. Use server-managed identifiers or strict whitelisting.
