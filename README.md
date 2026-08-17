# SIGSEGV

Writeups for CTF challenges Ibrahim and I (along with people we've met along the way) have solved, built with [Quartz](https://quartz.jzhao.xyz/) and hosted on GitHub Pages.

## Site

**https://sQuidri.github.io/ctf-writeups/**

## Structure

```
content/
  SRCTF-2026/
    15th/          # Day 1
      whats-up-doc
    16th/          # Day 2
```

## Adding a writeup

1. Add a folder under `content/<ctf-name>/` and drop in an `index.md` with frontmatter (`title`, `date`, `tags`).
2. Build locally to check it: `npx quartz build`
3. Push to `main` - GitHub Actions builds and deploys automatically.

## Local dev

```bash
npm ci
npx quartz build --serve
```

## Updating Quartz

```bash
npx quartz update
```
