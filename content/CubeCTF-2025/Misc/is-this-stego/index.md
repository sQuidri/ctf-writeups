---
title: "Is this stego?"
date: 2025-07-05
description: An OSINT geolocation challenge masquerading as steganography, resolved by identifying the Oasis Cable Car Station in Santiago and extracting its coordinates.
challenge_author: "Not specified"
writeup_author: "sleepyswords & wallsdeep13"
---

**Challenge:** Is this stego?

**Goal:** Determine the real-world geographic coordinates of the location depicted in the challenge image and convert them into the required flag format.

**Flag:**
- Coordinates formatted as requested by the challenge specification.

---

## Vulnerability & Methodology

The challenge provides a single image file (`stego.png`) and poses the question whether hidden data is embedded inside it:

![Challenge photograph showing cable car structure](CubeCTF-2025/images/6_stego.png)

Standard steganographic inspection (file carving with `binwalk`, LSB plane extraction with `zsteg`, and metadata analysis with `exiftool`) yields no hidden archives or flags. The challenge is actually an **OSINT (Open-Source Intelligence) & Geolocation** puzzle.

### Visual Clues
1. On the building facade and surrounding signage, the abbreviation **"STGO"** is visible. "STGO" is the standard abbreviation for **Santiago**, the capital of Chile.
2. The infrastructure features a modern cable car terminal system situated at the base of a hill.

## Attack Path

### 1. Identify the Landmark

Searching for cable car networks in Santiago points to the **Teleférico Santiago** (Santiago Cable Car) located in Parque Metropolitano on San Cristóbal Hill. 

A query for the terminal stations reveals the **Oasis Cable Car Station** (*Estación Oasis*). Comparing photos of Estación Oasis confirms an exact match with the architectural structure, lighting, and layout seen in the challenge photo:

![Reference image confirming Estación Oasis](CubeCTF-2025/images/7_image.png)

### 2. Extract Coordinates

Locating Estación Oasis on Google Maps provides the precise GPS coordinates for the station entrance:

![Google Maps satellite view with exact coordinates](CubeCTF-2025/images/8_image.png)

### 3. Format Flag

Convert the latitude and longitude into the coordinate format specified by the challenge prompt to submit the final flag.

---

## Notes

- In CTFs, titles often serve as misdirection. When technical steganography analysis turns up dry, inspect the physical details of the media for OSINT identifiers (signage, language, architecture, terrain).
