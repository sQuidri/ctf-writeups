import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const ArticleTitle: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const title = fileData.frontmatter?.title
  const challengeAuthor = (fileData.frontmatter?.challenge_author ??
    fileData.frontmatter?.challengeAuthor) as string | undefined
  const writeupAuthor = (fileData.frontmatter?.writeup_author ??
    fileData.frontmatter?.writeupAuthor ??
    fileData.frontmatter?.author) as string | undefined

  if (!title) return null

  const hasBadges = Boolean(challengeAuthor || writeupAuthor)

  return (
    <div class={classNames(displayClass, "article-title-container")}>
      {hasBadges && (
        <div class="article-badges">
          {challengeAuthor && (
            <span class="author-badge author-badge--challenge">
              <span class="badge-label">Challenge Author:</span>
              <span class="badge-value">{challengeAuthor}</span>
            </span>
          )}
          {writeupAuthor && (
            <span class="author-badge author-badge--writeup">
              <span class="badge-label">Writeup Author:</span>
              <span class="badge-value">{writeupAuthor}</span>
            </span>
          )}
        </div>
      )}
      <h1 class="article-title">{title}</h1>
    </div>
  )
}

ArticleTitle.css = `
.article-title-container {
  margin: 1.8rem 0 0 0;
}

.article-badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.65rem;
}

.author-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.65rem;
  font-size: 0.72rem;
  font-family: var(--codeFont);
  font-weight: 500;
  line-height: 1.25;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(6, 182, 212, 0.06) 100%);
  border: 1px solid rgba(56, 189, 248, 0.28);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  -webkit-backdrop-filter: blur(8px) saturate(150%);
  backdrop-filter: blur(8px) saturate(150%);
  color: var(--secondary);
  letter-spacing: 0.015em;
  transition: all 0.25s ease;
}

.author-badge:hover {
  border-color: rgba(56, 189, 248, 0.55);
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.18) 0%, rgba(6, 182, 212, 0.1) 100%);
  box-shadow: 0 4px 16px rgba(56, 189, 248, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.author-badge .badge-label {
  color: rgba(255, 255, 255, 0.65);
  font-weight: 400;
  font-size: 0.7rem;
}

.author-badge .badge-value {
  color: #38bdf8;
  font-weight: 600;
}

.article-title-container .article-title {
  margin: 0;
}
`

export default (() => ArticleTitle) satisfies QuartzComponentConstructor

