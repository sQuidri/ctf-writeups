;(function () {
  // Quartz bakes metadata with a fixed baseUrl at build time.
  // Rewrite og:url, canonical and twitter meta on client to match whatever domain visitor is browsing.
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
        // Skip malformed URLs
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