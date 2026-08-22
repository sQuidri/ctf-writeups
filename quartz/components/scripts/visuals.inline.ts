;(function () {
  const root = document.querySelector(".visuals-bg") as HTMLElement | null
  if (!root) return

  const canvas = root.querySelector("canvas") as HTMLCanvasElement | null
  if (!canvas) return

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  let width = 0
  let height = 0
  let dpr = Math.min(window.devicePixelRatio || 1, 2)
  let raf = 0
  let particles: Particle[] = []
  const mouse = { x: -9999, y: -9999 }

  const palette = {
    primary: "#38bdf8",
    cyan: "#06b6d4",
    blue: "#818cf8",
    text: getComputedStyle(document.documentElement).getPropertyValue("--dark").trim(),
  }

  type Particle = {
    x: number
    y: number
    vx: number
    vy: number
    r: number
    color: string
    pulse: number
  }

  function readPalette() {
    const cs = getComputedStyle(document.documentElement)
    palette.primary = cs.getPropertyValue("--secondary").trim() || palette.primary
    palette.cyan = cs.getPropertyValue("--secondary").trim() || palette.cyan
    palette.blue = cs.getPropertyValue("--tertiary").trim() || palette.blue
    palette.text = cs.getPropertyValue("--dark").trim() || palette.text
  }

  function makeParticle(): Particle {
    const hue = Math.random()
    const color = hue < 0.5 ? palette.cyan : hue < 0.8 ? palette.blue : palette.primary
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 2.2 + 1,
      color,
      pulse: Math.random() * Math.PI * 2,
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const count = Math.min(110, Math.max(45, Math.floor((width * height) / 18000)))
    particles = Array.from({ length: count }, () => makeParticle())
  }

  function step() {
    ctx.clearRect(0, 0, width, height)

    const linkDist = Math.max(110, Math.min(170, width / 9))

    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.pulse += 0.02

      if (p.x < -30) p.x = width + 30
      if (p.x > width + 30) p.x = -30
      if (p.y < -30) p.y = height + 30
      if (p.y > height + 30) p.y = -30

      // gentle mouse repulsion
      const dx = p.x - mouse.x
      const dy = p.y - mouse.y
      const md = Math.hypot(dx, dy)
      if (md < 140 && md > 0.01) {
        p.x += (dx / md) * 0.8
        p.y += (dy / md) * 0.8
      }
    }

    // links
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i]
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const d = Math.hypot(dx, dy)
        if (d < linkDist) {
          const alpha = (1 - d / linkDist) * 0.16
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
    }

    // nodes
    for (const p of particles) {
      const glow = (Math.sin(p.pulse) + 1) / 2
      const r = p.r + glow * 1.1
      ctx.fillStyle = p.color
      ctx.globalAlpha = 0.35 + glow * 0.4
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    raf = requestAnimationFrame(step)
  }

  function onThemeChange() {
    readPalette()
    for (const p of particles) {
      const hue = Math.random()
      p.color = hue < 0.5 ? palette.cyan : hue < 0.8 ? palette.blue : palette.primary
    }
  }

  window.addEventListener("resize", resize, { passive: true })
  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX
    mouse.y = e.clientY
  })
  window.addEventListener("pointerleave", () => {
    mouse.x = -9999
    mouse.y = -9999
  })
  document.addEventListener("themechange", onThemeChange)

  resize()
  step()

  // Staggered scroll-reveal for content blocks (CSIT-style "staggeredScroll" feel)
  function setupReveal() {
    const targets = document.querySelectorAll<HTMLElement>(
      "article > *, .page-header > .popover-hint > *, .page-footer, li.section-li",
    )

    const reveal = (el: Element) => {
      el.classList.add("reveal-in")
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target)
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    )

    for (const el of targets) {
      if (el instanceof HTMLElement) {
        el.classList.add("reveal")
        observer.observe(el)
      }
    }
  }

  const ALL_FEATURED_WRITEUPS = [
    {
      href: "/SRCTF-2026/Day-1/death-by-latex/",
      event: "SRCTF 2026 · Day 1",
      tag: "Filter Smuggling",
      title: "Death by LaTeX",
      desc: "\\lccode lowercase character smuggling to bypass source filters and exfiltrate server logs via compiled PDF.",
    },
    {
      href: "/SRCTF-2026/Day-1/whats-up-doc/",
      event: "SRCTF 2026 · Day 1",
      tag: "IDOR",
      title: "What's Up Doc?",
      desc: "Practice management system authentication and IDOR access control flaws on the AussieMed endpoint.",
    },
    {
      href: "/SRCTF-2026/Day-1/robot-rock/",
      event: "SRCTF 2026 · Day 1",
      tag: "Info Disclosure",
      title: "Robot Rock",
      desc: "robots.txt Disallow entry advertises a hidden staging page, leaking the flag to anyone who reads it.",
    },
    {
      href: "/SRCTF-2026/Day-1/welcome-home/",
      event: "SRCTF 2026 · Day 1",
      tag: "Info Disclosure",
      title: "Welcome Home",
      desc: "Flag left in an HTML comment on the AussieMed homepage — visible to anyone who views the page source.",
    },
    {
      href: "/SRCTF-2026/Day-1/hidden-secrets/",
      event: "SRCTF 2026 · Day 1",
      tag: "Dir Enumeration",
      title: "Hidden Secrets",
      desc: "Directory bruteforcing uncovers the unlisted /about/ page — a WIP endpoint left exposed with the flag in its body.",
    },
    {
      href: "/SRCTF-2026/Day-1/help-desk/",
      event: "SRCTF 2026 · Day 1",
      tag: "SQL Injection",
      title: "Help Desk",
      desc: "UNION-based SQLi in the unauthenticated help search enumerates sqlite_master and dumps the flag from system_config.",
    },
    {
      href: "/SRCTF-2026/Day-1/patient-zero/",
      event: "SRCTF 2026 · Day 1",
      tag: "Auth Bypass",
      title: "Patient Zero",
      desc: "Client-controlled isLicensed field allows registration of arbitrary medical licenses to gain authenticated dashboard access.",
    },
    {
      href: "/SRCTF-2026/Day-2/operational-oversharing/",
      event: "SRCTF 2026 · Day 2",
      tag: "API Leak",
      title: "Operational Oversharing",
      desc: "API endpoint reveals an unprotected operator report URL containing a base64-encoded internal flag.",
    },
    {
      href: "/SRCTF-2026/Day-2/this-seems-odd/",
      event: "SRCTF 2026 · Day 2",
      tag: "Roster IDOR",
      title: "This Seems Odd",
      desc: "Numeric IDOR on /dashboard/patient/?ref= allowing complete roster enumeration to discover hidden VIP patients.",
    },
    {
      href: "/SRCTF-2026/Day-2/i-see-you/",
      event: "SRCTF 2026 · Day 2",
      tag: "Ref Forgery",
      title: "I See You",
      desc: "Base64 record reference forgery (medicare + name) unlocking high-value patient PDF records.",
    },
    {
      href: "/SRCTF-2026/Day-2/ill-be-reading-that/",
      event: "SRCTF 2026 · Day 2",
      tag: "XXE Injection",
      title: "I'll Be Reading That",
      desc: "XXE injection in the eRx prescription XML parser leaking .env and Flask session signing keys.",
    },
    {
      href: "/SRCTF-2026/Day-2/the-auditor/",
      event: "SRCTF 2026 · Day 2",
      tag: "GraphQL / RCE",
      title: "The Auditor",
      desc: "GraphQL alias ordering authorization bypass chained with command injection in a diagnostic worker.",
    },
  ]

  function renderFeaturedWriteups() {
    const container = document.getElementById("featured-writeups")
    if (!container) return

    const shuffled = [...ALL_FEATURED_WRITEUPS].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 3)

    container.innerHTML = selected
      .map(
        (w) => `
      <a class="featured-card" href="${w.href}">
        <div class="featured-card-header">
          <span class="featured-card-event">${w.event}</span>
          <span class="featured-card-tag">${w.tag}</span>
        </div>
        <h4 class="featured-card-title">${w.title}</h4>
        <p class="featured-card-desc">${w.desc}</p>
      </a>
    `,
      )
      .join("")
  }

  setupReveal()
  renderFeaturedWriteups()

  document.addEventListener("nav", () => {
    setupReveal()
    renderFeaturedWriteups()
  })
})()
