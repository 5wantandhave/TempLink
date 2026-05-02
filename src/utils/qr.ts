import qrcode from 'qrcode-generator'

export function generateQrSvg(data: string, size = 6): string {
  const qr = qrcode(0, 'M')
  qr.addData(data)
  qr.make()

  const moduleCount = qr.getModuleCount()
  const margin = size * 2
  const totalSize = moduleCount * size + margin * 2

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${totalSize}" height="${totalSize}">`
  svg += `<rect width="${totalSize}" height="${totalSize}" fill="#0a0a0a" rx="8"/>`

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        const x = margin + col * size
        const y = margin + row * size
        svg += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="#e5e5e5" rx="1"/>`
      }
    }
  }

  svg += '</svg>'
  return svg
}
