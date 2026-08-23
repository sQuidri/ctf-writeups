;(function () {
  // The site is served from multiple domains (sigsev.site / sigsev.au / duckdns).
  // Quartz bakes og:url / twitter:url / og:image / canonical from a single hardcoded
  // baseUrl, so rewrite them on the client to match whichever host the visitor is
  // actually on. This keeps shared-link metadata consistent no matter which domain.
  function rewriteCanonicalHost() {
    const host = window.location.host
    if (!host) return

    function rewriteHost(to: string): string | null {
      try {
        const url = new URL(to)
        if (url.host !== host) {
          url.host = host
          return url.toString()
        }
      } catch {
        // ignore malformed values
      }
      return null
    }

    for (const el of document.querySelectorAll<HTMLMetaElement>(
      'meta[property="og:url"], meta[property="twitter:url"], meta[property="og:image"], meta[property="og:image:url"], meta[name="twitter:image"]',
    )) {
      const content = el.getAttribute("content")
      if (!content) continue
      const rewritten = rewriteHost(content)
      if (rewritten) el.setAttribute("content", rewritten)
    }

    const domain = document.querySelector<HTMLMetaElement>('meta[property="twitter:domain"]')
    if (domain) {
      domain.setAttribute("content", host)
    }

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (canonical) {
      const rewritten = rewriteHost(canonical.getAttribute("href") || "")
      if (rewritten) canonical.setAttribute("href", rewritten)
    }
  }

  rewriteCanonicalHost()
  document.addEventListener("nav", rewriteCanonicalHost)
})()