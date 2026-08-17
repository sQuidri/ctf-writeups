// Fake terminal: type a challenge number and press Enter to navigate.
;(function () {
  document.addEventListener("nav", () => {
    const screen = document.querySelector(".terminal-screen")
    const input = document.querySelector(".terminal-input") as HTMLInputElement | null
    const feedback = document.querySelector(".terminal-feedback")

    if (!screen || !input) return

    const navigate = (raw: string) => {
      const value = raw.trim()
      const link = document.querySelector(
        `.terminal-list-item a[data-challenge="${value}"]`,
      ) as HTMLAnchorElement | null

      if (!link) {
        if (feedback) {
          feedback.textContent = value
            ? `bash: ${value}: command not found — try a challenge number`
            : ""
        }
        input.classList.remove("terminal-input--error")
        void input.offsetWidth
        input.classList.add("terminal-input--error")
        return
      }

      if (feedback) feedback.textContent = ""
      input.value = ""
      const href = link.getAttribute("href")
      if (href) window.spaNavigate(new URL(href, window.location.toString()))
    }

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        navigate(input.value)
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
