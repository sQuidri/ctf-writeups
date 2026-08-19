import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/visuals.scss"
// @ts-ignore
import script from "./scripts/visuals.inline"
import { classNames } from "../util/lang"

const Visuals: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div class={classNames(displayClass, "visuals-bg")} aria-hidden="true">
      <canvas class="visuals-canvas" />
    </div>
  )
}

Visuals.css = style
Visuals.afterDOMLoaded = script

export default (() => Visuals) satisfies QuartzComponentConstructor
