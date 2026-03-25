import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    })
  })
}

export function parseXLSX(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' })
        const firstSheet = workbook.SheetNames[0]
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet])
        resolve(data)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export function parseJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        resolve(JSON.parse(e.target.result))
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export function parseTXT(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  switch (ext) {
    case 'csv':
      return parseCSV(file)
    case 'xlsx':
    case 'xls':
      return parseXLSX(file)
    case 'json':
      return parseJSON(file)
    case 'txt':
      return parseTXT(file)
    default:
      return parseTXT(file)
  }
}
