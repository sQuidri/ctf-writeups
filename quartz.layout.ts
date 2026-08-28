import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// Shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [Component.SiteHeader()],
  afterBody: [Component.Visuals()],
  footer: Component.Footer(),
}

// Single page & writeup layout
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Explorer({
      title: "",
      folderDefaultState: "collapsed",
    }),
  ],
  right: [
    Component.DesktopOnly(Component.BrandLoop()),
    Component.DesktopOnly(Component.Terminal()),
    Component.Backlinks(),
  ],
}

// Folder, tag and index listing layout
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),
    Component.Explorer({
      title: "",
      folderDefaultState: "collapsed",
    }),
  ],
  right: [
    Component.DesktopOnly(Component.BrandLoop()),
    Component.DesktopOnly(Component.Terminal()),
  ],
}
