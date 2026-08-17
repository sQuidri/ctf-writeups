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

  return (
    <div class={classNames(displayClass, "terminal")}>
      <div class="terminal-bar">
        <span class="terminal-dot terminal-dot--red" />
        <span class="terminal-dot terminal-dot--yellow" />
        <span class="terminal-dot terminal-dot--green" />
        <span class="terminal-bar-title">sigsegv@ctf: ~/writeups</span>
      </div>
      <div class="terminal-screen">
        <div class="terminal-line">
          <span class="terminal-prompt">
            <span class="terminal-prompt-user">sigsegv@ctf</span>
            <span class="terminal-prompt-colon">:</span>
            <span class="terminal-prompt-path">~</span>
            <span class="terminal-prompt-dollar">$</span>
          </span>
          <span class="terminal-cmd">ls challenges/</span>
        </div>
        <ul class="terminal-list">
          {challenges.map((c, i) => (
            <li class="terminal-list-item">
              <span class="terminal-list-index">[{i + 1}]</span>
              <a href={toUrl(c.slug!)} data-challenge={i + 1}>
                {c.frontmatter?.title}
              </a>
            </li>
          ))}
        </ul>
        <div class="terminal-line terminal-line--input">
          <span class="terminal-prompt">
            <span class="terminal-prompt-user">sigsegv@ctf</span>
            <span class="terminal-prompt-colon">:</span>
            <span class="terminal-prompt-path">~</span>
            <span class="terminal-prompt-dollar">$</span>
          </span>
          <input
            class="terminal-input"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            spellcheck={false}
            placeholder="type a number + enter"
            aria-label="Select a challenge by number"
          />
        </div>
        <div class="terminal-feedback" aria-live="polite" />
      </div>
    </div>
  )
}

Terminal.css = style
Terminal.afterDOMLoaded = script

export default (() => Terminal) satisfies QuartzComponentConstructor
