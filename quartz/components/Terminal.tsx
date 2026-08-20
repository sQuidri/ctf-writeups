import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/terminal.scss"
// @ts-ignore
import script from "./scripts/terminal.inline"
import { classNames } from "../util/lang"
import { FullSlug, simplifySlug } from "../util/path"

const Terminal: QuartzComponent = ({ allFiles, displayClass }: QuartzComponentProps) => {
  const challenges = allFiles
    .filter((f) => f.frontmatter?.description && f.slug !== "index")
    .sort((a, b) => (a.slug ?? "").localeCompare(b.slug ?? ""))

  const toUrl = (slug: FullSlug) => {
    const s = simplifySlug(slug)
    if (s === "/") return "/"
    const clean = s.replace(/\/+$/, "")
    return `/${clean}/`
  }

  const toName = (slug: FullSlug) => {
    const s = simplifySlug(slug)
    return s === "/" ? "home" : s.split("/").filter(Boolean).pop() ?? s
  }

  return (
    <div class={classNames(displayClass, "terminal")}>
      <div class="terminal-header">
        <div class="terminal-status-dot" aria-hidden="true" />
        <h3 class="terminal-title">Terminal</h3>
        <span class="terminal-id">sigsegv@ctf:~/challenges</span>
      </div>
      <div class="terminal-output" tabindex={0} role="region" aria-label="Terminal output">
        <div class="terminal-line">
          <span class="terminal-prompt">$</span>
          <span class="terminal-cmd">ls</span>
        </div>
        {challenges.map((c, i) => (
          <div class="terminal-line terminal-line--out" key={c.slug}>
            <span class="terminal-list-index">[{i + 1}]</span>
            <a class="terminal-link" href={toUrl(c.slug!)}>
              {toName(c.slug!)}/
            </a>
          </div>
        ))}
      </div>
      <div class="terminal-input-row">
        <span class="terminal-prompt">$</span>
        <input
          class="terminal-input"
          type="text"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck={false}
          placeholder="ls, cd, 1-9, help..."
          aria-label="Terminal input"
        />
      </div>
      <div class="terminal-hint">Enter # or cmd · 'help' for info</div>
      <ul class="terminal-list" hidden>
        {challenges.map((c, i) => (
          <li class="terminal-list-item" key={c.slug}>
            <span class="terminal-list-index">[{i + 1}]</span>
            <a href={toUrl(c.slug!)} data-challenge={i + 1} data-name={toName(c.slug!)}>
              {c.frontmatter?.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

Terminal.css = style
Terminal.afterDOMLoaded = script

export default (() => Terminal) satisfies QuartzComponentConstructor
