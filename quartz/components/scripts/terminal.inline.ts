// Virtual shell for the fake terminal: ls, cd, pwd, open, clear, and number navigation.
;(function () {
  document.addEventListener("nav", () => {
    const screen = document.querySelector(".terminal") as HTMLElement | null
    const output = document.querySelector(".terminal-output") as HTMLElement | null
    const row = document.querySelector(".terminal-input-row") as HTMLElement | null
    const input = document.querySelector(".terminal-input") as HTMLInputElement | null
    const list = document.querySelector(".terminal-list")
    const idEl = document.querySelector(".terminal-id") as HTMLElement | null

    if (!screen || !output || !row || !input || !list) return

    const challenges = Array.from(list.querySelectorAll<HTMLAnchorElement>("a")).map((a, i) => ({
      num: i + 1,
      name: a.dataset.name || "",
      title: a.textContent?.trim() || a.dataset.name || "",
      href: a.getAttribute("href") || "/",
    }))
    const byName = new Map(challenges.map((c) => [c.name, c]))
    const byNum = new Map(challenges.map((c) => [c.num, c]))

    let cwd = "/challenges"
    const displayPath = () => (cwd === "/" ? "~" : "~/challenges")
    const promptText = () => `$`

    const syncId = () => {
      if (idEl) idEl.textContent = `sigsegv@ctf:${displayPath()}`
    }

    const el = (tag: string, cls?: string, text?: string): HTMLElement => {
      const e = document.createElement(tag)
      if (cls) e.className = cls
      if (text !== undefined) e.textContent = text
      return e
    }

    const scrollBottom = () => {
      output.scrollTop = output.scrollHeight
    }

    const echoCommand = (cmd: string) => {
      const line = el("div", "terminal-line")
      line.appendChild(el("span", "terminal-prompt", promptText()))
      line.appendChild(el("span", "terminal-cmd", cmd))
      output.appendChild(line)
      scrollBottom()
    }

    const echoLine = (text: string, cls = "terminal-line--out") => {
      const line = el("div", `terminal-line ${cls}`)
      line.appendChild(el("span", "terminal-text", text))
      output.appendChild(line)
      scrollBottom()
    }

    const echoError = (text: string) => {
      const line = el("div", "terminal-line terminal-line--err")
      line.appendChild(el("span", "terminal-text", text))
      output.appendChild(line)
      scrollBottom()
    }

    const normalize = (raw: string): string => {
      let p = raw.trim()
      if (!p) return cwd
      if (p === "~") p = "/"
      else if (p.startsWith("~/")) p = "/" + p.slice(2)
      else if (!p.startsWith("/")) p = cwd === "/challenges" ? `/challenges/${p}` : `/${p}`
      const segs = p.split("/").filter(Boolean)
      const out: string[] = []
      for (const s of segs) {
        if (s === ".") continue
        if (s === "..") out.pop()
        else out.push(s)
      }
      return "/" + out.join("/")
    }

    const listDir = (path: string) => {
      if (path === "/" || path === "") {
        echoLine("challenges/", "terminal-dir-line")
        return
      }
      if (path === "/challenges") {
        for (const c of challenges) {
          const line = el("div", "terminal-line terminal-line--out")
          line.appendChild(el("span", "terminal-list-index", `[${c.num}]`))
          const a = el("a", "terminal-link", `${c.name}/`)
          a.href = c.href
          line.appendChild(a)
          output.appendChild(line)
        }
        scrollBottom()
        return
      }
      if (path.startsWith("/challenges/")) {
        const name = path.slice("/challenges/".length)
        const c = byName.get(name)
        if (c) {
          echoLine(`${c.name}: ${c.title}`)
          echoLine(`open with: open ${c.name}  or type ${c.num}`)
          return
        }
      }
      echoError(`ls: cannot access '${path}': No such file or directory`)
    }

    const openChallenge = (arg: string) => {
      const target = byNum.get(Number(arg)) || byName.get(arg)
      if (target) {
        window.spaNavigate(new URL(target.href, window.location.toString()))
      } else {
        echoError(`open: ${arg}: no such challenge`)
      }
    }

    const run = (raw: string) => {
      const value = raw.trim()
      echoCommand(value)
      if (!value) return

      const parts = value.split(/\s+/)
      const cmd = parts[0]
      const args = parts.slice(1)

      if (/^\d+$/.test(cmd)) {
        openChallenge(cmd)
        return
      }

      switch (cmd) {
        case "ls": {
          const targetArg = args.find((a) => !a.startsWith("-"))
          listDir(targetArg ? normalize(targetArg) : cwd)
          return
        }
        case "cd": {
          const target = args.length ? normalize(args[0]) : "/"
          if (target === "/") {
            cwd = "/"
          } else if (target === "/challenges") {
            cwd = "/challenges"
          } else if (target.startsWith("/challenges/") && byName.has(target.slice("/challenges/".length))) {
            echoError(`cd: ${args[0]}: Not a directory`)
            return
          } else {
            echoError(`cd: ${args[0]}: No such file or directory`)
            return
          }
          syncId()
          return
        }
        case "pwd":
          echoLine(displayPath())
          return
        case "open":
          if (args[0]) openChallenge(args[0])
          else echoError("usage: open <name|number>")
          return
        case "clear":
          output.replaceChildren()
          syncId()
          return
        case "help":
          for (const h of [
            "ls [path]       list directory contents",
            "cd [path]       change directory",
            "pwd             print working directory",
            "open <name|#>   open a challenge writeup",
            "<number>        open challenge by number",
            "clear           clear the screen",
            "help            show this help",
          ]) {
            echoLine(h)
          }
          return
        default:
          echoError(`bash: ${cmd}: command not found`)
          return
      }
    }

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        run(input.value)
        input.value = ""
      }
    }

    const focusInput = () => input.focus()

    input.addEventListener("keydown", onKeydown)
    screen.addEventListener("click", focusInput)

    window.addCleanup(() => {
      input.removeEventListener("keydown", onKeydown)
      screen.removeEventListener("click", focusInput)
    })
  })
})()
