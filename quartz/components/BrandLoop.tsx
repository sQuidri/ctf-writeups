import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/brandLoop.scss"
import { classNames } from "../util/lang"

const BrandLoop: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div class={classNames(displayClass, "brand-loop")} aria-hidden="true">
      <div class="brand-loop-block">
        <div class="brand-loop-inner">
          <p class="brand-loop-text">SIGSEGV</p>
          <span class="brand-loop-cursor" />
        </div>
        <div class="brand-loop-users">
          <span class="brand-loop-user">wallsdeep13</span>
          <span class="brand-loop-user">sleepyswords</span>
        </div>
      </div>
    </div>
  )
}

BrandLoop.css = style

export default (() => BrandLoop) satisfies QuartzComponentConstructor
