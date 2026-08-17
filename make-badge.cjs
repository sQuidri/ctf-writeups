const sharp = require("sharp")
;(async () => {
  const size = 128
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: "#b22222",
    },
  })
    .composite([{ input: "quartz/static/sigsegv-mark.png" }])
    .png()
    .toFile("quartz/static/sigsegv-badge.png")
  console.log("wrote sigsegv-badge.png")
})()
