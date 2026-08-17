import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/siteHeader.scss"
import { classNames } from "../util/lang"

interface NavLink {
  label: string
  href: string
}

const defaultLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "SRCTF 2026", href: "/SRCTF-2026/" },
]

const SiteHeader: QuartzComponent = ({ cfg, displayClass }: QuartzComponentProps) => {
  const links = defaultLinks
  return (
    <div class={classNames(displayClass, "site-header")}>
      <a class="site-header-logo" href="/" aria-label={cfg.pageTitle}>
        <img
          class="site-header-mark"
          src="/static/sigsegv-badge.png"
          alt=""
          aria-hidden="true"
        />
        <span class="site-header-title">{cfg.pageTitle}</span>
      </a>
      <nav class="site-header-nav" aria-label="Primary navigation">
        {links.map((link) => (
          <a href={link.href} class="site-header-link">
            {link.label}
          </a>
        ))}
      </nav>
      <span class="site-header-tag" aria-hidden="true">
        CTF writeups by SIGSEGV
      </span>
    </div>
  )
}

SiteHeader.css = style

export default (() => SiteHeader) satisfies QuartzComponentConstructor
