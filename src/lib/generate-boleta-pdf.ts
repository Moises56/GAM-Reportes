import jsPDF from "jspdf"

interface BoletaData {
  fecha: string
  hora: string
  unidad: string | null
  transportista: string
  motorista: string | null
  placa: string | null
  codigoRuta: number | null
  procedencia: string | null
  pesoBruto: number
  pesoTara: number
  pesoNeto: number
  noBoleta: number
  boletaPeso: string
  pesador: string
  observacion: string | null
}

function fmtFecha(fechaStr: string) {
  const d = new Date(fechaStr)
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ]
  return `${d.getUTCDate()} de ${meses[d.getUTCMonth()]} del ${d.getUTCFullYear()}`
}

function fmtHora(horaStr: string | null) {
  if (!horaStr) return "00:00 AM"
  const d = new Date(horaStr)
  const h = d.getUTCHours()
  const m = d.getUTCMinutes().toString().padStart(2, "0")
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12.toString().padStart(2, "0")}:${m} ${ampm}`
}

function fmtNum(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function loadImg(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const c = document.createElement("canvas")
      // Scale down for smaller file size
      const maxSize = 200
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
      c.width = img.width * scale
      c.height = img.height * scale
      const ctx = c.getContext("2d")!
      ctx.drawImage(img, 0, 0, c.width, c.height)
      resolve(c.toDataURL("image/png"))
    }
    img.onerror = reject
    img.src = url
  })
}

// Primary blue from AMDC branding
const TEAL: [number, number, number] = [0, 63, 186]
const BLACK: [number, number, number] = [0, 0, 0]
const DGRAY: [number, number, number] = [80, 80, 80]
const LGRAY: [number, number, number] = [180, 180, 180]
const WHITE: [number, number, number] = [255, 255, 255]

export async function generateBoletaPDF(data: BoletaData) {
  // Letter-like format, landscape-ish to match the ticket proportion
  const W = 180
  const H = 140
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [H, W] })

  const M = 8 // margin
  const CW = W - M * 2 // content width
  const midX = M + CW * 0.52 // divider between left/right columns

  let logoData: string | null = null
  try {
    logoData = await loadImg("/LOGO-AMDC.png")
  } catch { /* no logo */ }

  // ── OUTER BORDER ──
  doc.setDrawColor(...LGRAY)
  doc.setLineWidth(0.4)
  doc.rect(M - 1, 4, CW + 2, H - 8)

  // ══════════════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════════════
  let y = 7

  // Logo left
  if (logoData) {
    doc.addImage(logoData, "PNG", M + 2, y, 14, 14)
  }

  // Title
  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.setTextColor(...BLACK)
  doc.text("Alcaldía Municipal del Distrito Central", W / 2, y + 5, { align: "center" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(...DGRAY)
  doc.text(
    `Creada en Tegucigalpa, M.D.C ${fmtFecha(data.fecha)} a las ${fmtHora(data.hora)}`,
    W / 2, y + 10, { align: "center" }
  )

  y += 16

  // ── Horizontal line under header ──
  doc.setDrawColor(...LGRAY)
  doc.setLineWidth(0.3)
  doc.line(M, y, W - M, y)

  y += 2

  // ══════════════════════════════════════════════
  // TRANSPORTISTA BAR
  // ══════════════════════════════════════════════
  doc.setFillColor(237, 241, 250)
  doc.rect(M, y, CW, 8, "F")
  doc.setDrawColor(...LGRAY)
  doc.rect(M, y, CW, 8)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...BLACK)
  doc.text("Transportista :", M + 3, y + 5.5)
  doc.setFontSize(10)
  doc.text(data.transportista, M + 30, y + 5.5)

  // Boleta de Peso on the right
  doc.setFontSize(8)
  doc.setTextColor(...TEAL)
  doc.text("Boleta de Peso :", midX + 10, y + 3.5)
  doc.setFontSize(10)
  doc.setTextColor(...BLACK)
  doc.text(data.boletaPeso, W - M - 3, y + 5.5, { align: "right" })

  y += 10

  // ══════════════════════════════════════════════
  // TWO-COLUMN SECTION
  // ══════════════════════════════════════════════
  const leftX = M
  const leftW = midX - M - 1
  const rightX = midX + 1
  const rightW = W - M - rightX

  const rowStartY = y

  // ── LEFT: Unidad / Placa box ──
  doc.setDrawColor(...LGRAY)
  doc.setLineWidth(0.3)
  doc.rect(leftX, y, leftW, 9)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.setTextColor(...BLACK)
  doc.text("Unidad:", leftX + 2, y + 4)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.text(data.unidad || "—", leftX + 17, y + 4)

  // Vertical divider in unidad/placa box
  const placaX = leftX + leftW * 0.45
  doc.line(placaX, y, placaX, y + 9)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.text("Placa:", placaX + 3, y + 4)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.text(data.placa || "—", placaX + 15, y + 4)

  // ── RIGHT: Relleno Sanitario header ──
  doc.setFillColor(...TEAL)
  doc.rect(rightX, y, rightW, 9, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...WHITE)
  doc.text("Relleno Sanitario", rightX + rightW / 2, y + 4, { align: "center" })
  doc.setFontSize(8)
  doc.text("Tegucigalpa", rightX + rightW / 2, y + 8, { align: "center" })

  y += 11

  // ── LEFT: Motorista ──
  doc.setDrawColor(...LGRAY)
  doc.rect(leftX, y, leftW, 8)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.setTextColor(...BLACK)
  doc.text("Motorista:", leftX + 2, y + 5.5)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  const motorista = (data.motorista || "—").substring(0, 28)
  doc.text(motorista, leftX + 20, y + 5.5)

  // ── RIGHT: Boleto No. ──
  doc.rect(rightX, y, rightW, 8)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.text("Boleto No.", rightX + 3, y + 5.5)
  doc.setFontSize(11)
  doc.text(String(data.noBoleta), rightX + rightW - 3, y + 6, { align: "right" })

  y += 10

  // ── LEFT: Micro-ruta ──
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.setTextColor(...BLACK)
  doc.text("Micro-ruta:", leftX + 4, y + 4)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text(data.codigoRuta ? String(data.codigoRuta) : "—", leftX + 24, y + 4)

  // ── RIGHT: Peso Bruto ──
  doc.setDrawColor(...LGRAY)
  doc.rect(rightX, y, rightW, 8)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.setTextColor(...BLACK)
  doc.text("Peso Bruto:", rightX + 3, y + 5.5)
  doc.setFontSize(10)
  doc.text(`${fmtNum(data.pesoBruto)} LB`, rightX + rightW - 3, y + 5.5, { align: "right" })

  y += 10

  // ── LEFT: Procedencia ──
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.text("Procedencia:", leftX + 4, y + 2)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(...DGRAY)
  const procText = (data.procedencia || "—").replace(/,\s*$/, "").replace(/,\s{4}/g, ", ")
  const procLines = doc.splitTextToSize(procText, leftW - 6)
  doc.text(procLines.slice(0, 3), leftX + 4, y + 7)

  // ── RIGHT: Peso Tara ──
  doc.setDrawColor(...LGRAY)
  doc.rect(rightX, y, rightW, 8)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.setTextColor(...BLACK)
  doc.text("Peso Tara:", rightX + 3, y + 5.5)
  doc.setFontSize(10)
  doc.text(`${fmtNum(data.pesoTara)} LB`, rightX + rightW - 3, y + 5.5, { align: "right" })

  y += 10

  // ── RIGHT: Peso Neto (highlighted) ──
  doc.setFillColor(224, 233, 250)
  doc.rect(rightX, y, rightW, 8, "F")
  doc.setDrawColor(...TEAL)
  doc.setLineWidth(0.5)
  doc.rect(rightX, y, rightW, 8)
  doc.setLineWidth(0.3)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(...TEAL)
  doc.text("Peso Neto:", rightX + 3, y + 5.5)
  doc.setFontSize(11)
  doc.setTextColor(...BLACK)
  doc.text(`${fmtNum(data.pesoNeto)} LB`, rightX + rightW - 3, y + 5.5, { align: "right" })

  y += 10

  // ── RIGHT: Pesador ──
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.setTextColor(...BLACK)
  doc.text("Pesador:", rightX + 3, y + 4)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text(data.pesador || "—", rightX + 20, y + 4)

  y += 8

  // ── Vertical divider line between columns ──
  doc.setDrawColor(...LGRAY)
  doc.setLineWidth(0.2)
  doc.line(midX, rowStartY, midX, y - 2)

  // ══════════════════════════════════════════════
  // OBSERVACIÓN BAR
  // ══════════════════════════════════════════════
  doc.setDrawColor(...LGRAY)
  doc.setLineWidth(0.3)
  doc.rect(M, y, CW, 9)
  doc.setFillColor(248, 250, 252)
  doc.rect(M, y, CW, 9, "F")
  doc.setDrawColor(...LGRAY)
  doc.rect(M, y, CW, 9)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.setTextColor(...BLACK)
  doc.text("Observación:", M + 3, y + 6)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  const obs = (data.observacion || "NINGUNA").substring(0, 70)
  doc.text(obs, M + 28, y + 6)

  y += 12

  // ══════════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════════

  // Gerencia de Aseo Municipal badge
  const badgeW = 52
  const badgeX = W / 2 - badgeW / 2
  doc.setFillColor(...TEAL)
  doc.roundedRect(badgeX, y, badgeW, 7, 1.5, 1.5, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...WHITE)
  doc.text("GERENCIA DE ASEO MUNICIPAL", W / 2, y + 4.8, { align: "center" })

  y += 10

  // Emission date bar
  doc.setFillColor(...TEAL)
  doc.roundedRect(M + 20, y, CW - 40, 6, 1, 1, "F")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(...WHITE)
  doc.text(
    `Emitido el ${fmtFecha(data.fecha)} a las ${fmtHora(data.hora)}`,
    W / 2, y + 4, { align: "center" }
  )

  // ── Save ──
  doc.save(`Boleta-${data.boletaPeso}.pdf`)
}
