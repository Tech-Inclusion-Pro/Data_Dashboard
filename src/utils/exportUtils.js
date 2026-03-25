import { Document, Packer, Paragraph, TextRun, HeadingLevel, TableCell, TableRow, Table, WidthType, AlignmentType } from 'docx'

function parseInlineFormatting(text) {
  const runs = []
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*)/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push(new TextRun(text.slice(lastIndex, match.index)))
    }
    if (match[2]) {
      // ***bold italic***
      runs.push(new TextRun({ text: match[2], bold: true, italics: true }))
    } else if (match[3]) {
      // **bold**
      runs.push(new TextRun({ text: match[3], bold: true }))
    } else if (match[4]) {
      // *italic*
      runs.push(new TextRun({ text: match[4], italics: true }))
    }
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    runs.push(new TextRun(text.slice(lastIndex)))
  }

  return runs.length > 0 ? runs : [new TextRun(text)]
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function downloadBlobDirect(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportAsText(data, filename = 'export.txt') {
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  downloadBlob(text, filename, 'text/plain')
}

export function exportAsCSV(data, filename = 'export.csv') {
  if (!Array.isArray(data) || data.length === 0) {
    downloadBlob('', filename, 'text/csv')
    return
  }
  const headers = Object.keys(data[0])
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = String(row[h] ?? '')
      return val.includes(',') || val.includes('"') || val.includes('\n')
        ? `"${val.replace(/"/g, '""')}"`
        : val
    }).join(',')
  )
  downloadBlob([headers.join(','), ...rows].join('\n'), filename, 'text/csv')
}

export function exportAsMarkdown(data, filename = 'export.md') {
  let md = ''
  if (Array.isArray(data)) {
    data.forEach((item, i) => {
      if (item.title) md += `### ${item.title}\n`
      if (item.summary) md += `${item.summary}\n`
      if (item.description) md += `${item.description}\n`
      if (item.severity) md += `**Severity:** ${item.severity}\n`
      if (item.category) md += `**Category:** ${item.category}\n`
      md += '\n---\n\n'
    })
  } else if (typeof data === 'string') {
    md = data
  } else {
    md = JSON.stringify(data, null, 2)
  }
  downloadBlob(md, filename, 'text/markdown')
}

export async function exportAsDocx(data, filename = 'export.docx') {
  const paragraphs = []

  if (typeof data === 'string') {
    // Split string content into paragraphs
    data.split('\n').forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed) {
        paragraphs.push(new Paragraph({ text: '' }))
        return
      }
      // Detect markdown-style headings
      if (trimmed.startsWith('# ')) {
        paragraphs.push(new Paragraph({
          children: parseInlineFormatting(trimmed.slice(2)),
          heading: HeadingLevel.HEADING_1,
        }))
      } else if (trimmed.startsWith('## ')) {
        paragraphs.push(new Paragraph({
          children: parseInlineFormatting(trimmed.slice(3)),
          heading: HeadingLevel.HEADING_2,
        }))
      } else if (trimmed.startsWith('### ')) {
        paragraphs.push(new Paragraph({
          children: parseInlineFormatting(trimmed.slice(4)),
          heading: HeadingLevel.HEADING_3,
        }))
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        paragraphs.push(new Paragraph({
          children: parseInlineFormatting(trimmed.slice(2)),
          bullet: { level: 0 },
        }))
      } else if (trimmed === '---' || trimmed === '===') {
        // Skip dividers
      } else if (trimmed.startsWith('_') && trimmed.endsWith('_')) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: trimmed.slice(1, -1), italics: true })],
        }))
      } else {
        paragraphs.push(new Paragraph({ children: parseInlineFormatting(trimmed) }))
      }
    })
  } else if (Array.isArray(data) && data.length > 0) {
    // Build a table from array of objects
    const headers = Object.keys(data[0])
    const headerRow = new TableRow({
      children: headers.map((h) =>
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: h, bold: true })],
            alignment: AlignmentType.LEFT,
          })],
          width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
        })
      ),
    })
    const dataRows = data.map((row) =>
      new TableRow({
        children: headers.map((h) =>
          new TableCell({
            children: [new Paragraph({ text: String(row[h] ?? '') })],
            width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
          })
        ),
      })
    )
    paragraphs.push(new Table({ rows: [headerRow, ...dataRows] }))
  } else {
    paragraphs.push(new Paragraph({ text: JSON.stringify(data, null, 2) }))
  }

  const doc = new Document({
    sections: [{ children: paragraphs }],
  })

  const blob = await Packer.toBlob(doc)
  downloadBlobDirect(blob, filename)
}
