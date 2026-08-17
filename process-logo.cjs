const sharp = require("sharp")
;(async () => {
  const src = process.argv[2]
  const dst = process.argv[3]
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const out = Buffer.alloc(info.width * info.height * 4)
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    const lum = (r + g + b) / 3
    const a = Math.max(0, Math.min(1, (lum - 95) / 85))
    out[i * 4] = 255
    out[i * 4 + 1] = 255
    out[i * 4 + 2] = 255
    out[i * 4 + 3] = Math.round(a * 255)
  }

  await sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(dst)
  console.log("wrote", dst)
})()
