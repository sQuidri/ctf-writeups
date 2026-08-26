---
title: "The old way"
date: 2025-06-22
description: Reversing a 40x40 linear system of simultaneous equations in a cryptographic verification routine using matrix inversion.
challenge_author: "Not specified"
writeup_author: "sleepyswords & wallsdeep13"
---

**Challenge:** The old way

**Goal:** Reverse engineer the verification algorithm in `the_old_way` to find the correct input string that satisfies the secret computation.

**Flag:**
- `GPNCTF{...}` - recovered by solving the linear transformation matrix $A x = y$

---

## Vulnerability & Mathematical Analysis

Opening the binary `the_old_way` in a disassembler / decompiler (such as Binary Ninja or Ghidra) leads to the core verification function `compute_secret()`.

Analyzing the decompiled C pseudocode reveals that the routine takes a 40-character input array $\mathbf{x}$ and computes an output array $\mathbf{y}$ of length 40. Each output element $y_i$ is a linear combination of all 40 input characters:

$$\begin{aligned}
y_0 &= M_{0,0} x_0 + M_{0,1} x_1 + \dots + M_{0,39} x_{39} \\
y_1 &= M_{1,0} x_0 + M_{1,1} x_1 + \dots + M_{1,39} x_{39} \\
&\;\,\vdots \\
y_{39} &= M_{39,0} x_0 + M_{39,1} x_1 + \dots + M_{39,39} x_{39}
\end{aligned}$$

Where the coefficient matrix $M$ is defined as:

$$M_{i,j} = \begin{cases} i \cdot j + i + j + 1 & \text{if } i \neq j \\ 0 & \text{if } i = j \end{cases}$$

Because the transformation is a system of 40 linear equations with 40 unknowns ($M \mathbf{x} = \mathbf{y}$), we can represent this as a matrix equation and solve for $\mathbf{x}$ by computing the matrix inverse:

$$\mathbf{x} = M^{-1} \mathbf{y}$$

## Attack Path

### 1. Extract Target Array

Extract the 40 expected integer values $\mathbf{y}$ from the binary's comparison table in `.rodata`.

### 2. Construct Matrix and Solve

We write a Python script using `numpy` to generate matrix $M$, compute the inverse, and solve for the character array $\mathbf{x}$:

```python
import numpy as np

# 40 expected values from binary
expected_y = np.array([
    # ... extracted integer array ...
], dtype=np.float64)

N = 40
M = np.zeros((N, N), dtype=np.float64)

for i in range(N):
    for j in range(N):
        if i == j:
            M[i][j] = 0
        else:
            M[i][j] = (i * j) + i + j + 1

# Solve linear system M * x = y
x_solution = np.linalg.solve(M, expected_y)

# Convert to characters
flag_chars = [chr(int(round(val))) for val in x_solution]
print("Flag:", "".join(flag_chars))
```

### 3. Verify Flag Output

Solving the linear system yields the exact character sequence satisfying the constraint, matching the flag format ending with `}`.

---

## Notes

- Linear transformations without non-linear cryptographic primitives (S-boxes, modular reductions, non-linear bitwise operations) provide no cryptographic security and are easily reversible using basic linear algebra.
