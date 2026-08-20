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
          light: "#0c1017",
          lightgray: "#1e2638",
          gray: "#6b7c96",
          darkgray: "#d1d7e0",
          dark: "#f0f6fc",
          secondary: "#38bdf8",
          tertiary: "#818cf8",
          highlight: "rgba(56, 189, 248, 0.14)",
          textHighlight: "rgba(56, 189, 248, 0.30)",
        },
        darkMode: {
          light: "#0c1017",
          lightgray: "#1e2638",
          gray: "#6b7c96",
          darkgray: "#d1d7e0",
          dark: "#f0f6fc",
          secondary: "#38bdf8",
          tertiary: "#818cf8",
          highlight: "rgba(56, 189, 248, 0.14)",
          textHighlight: "rgba(56, 189, 248, 0.30)",
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
          light: "github-dark",
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
      Plugin.CustomOgImages({
        colorScheme: "darkMode",
      }),
    ],
  },
}

export default config
