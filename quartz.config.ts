import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

const config: QuartzConfig = {
  configuration: {
    pageTitle: "SIGSEGV",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    locale: "en-US",
    analytics: {
      provider: "plausible"
    },
    baseUrl: "https://writeups.wis-ctf.duckdns.org",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Rubik",
        body: "Rubik",
        code: "Space Mono",
      },
      colors: {
        lightMode: {
          light: "#fff4f4",
          lightgray: "#f1dada",
          gray: "#b8a3a3",
          darkgray: "#5c4a4a",
          dark: "#191925",
          secondary: "#b22222",
          tertiary: "#6985b3",
          highlight: "rgba(217, 144, 144, 0.16)",
          textHighlight: "#edc3c788",
        },
        darkMode: {
          light: "#1a1416",
          lightgray: "#3a2a2e",
          gray: "#8a7074",
          darkgray: "#e9d5d5",
          dark: "#fff4f4",
          secondary: "#f1b5b5",
          tertiary: "#9ab4dd",
          highlight: "rgba(241, 181, 181, 0.15)",
          textHighlight: "#b2222288",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
