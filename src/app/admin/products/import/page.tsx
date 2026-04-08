'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

import { ArrowLeft, Upload, Download, CheckCircle2, AlertCircle, Loader2, FileSpreadsheet, X } from 'lucide-react'

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-[13px] font-medium
      ${type === 'success' ? 'bg-[#4a6741] text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  )
}

// Generate and download sample CSV
function downloadSampleCSV() {
  const headers = [
    'name', 'description', 'price', 'compare_price', 'category', 'badge',
    'details', 'tags', 'is_grouped', 'is_active',
    'image_1', 'image_2', 'image_3',
    'variant_color', 'variant_color_hex', 'variant_size', 'variant_sku', 'variant_inventory',
  ]

  const rows = [
    [
      'Classic Crew Sweatshirt',
      'Comfortable everyday sweatshirt in premium fleece',
      '88', '110', 'Tops', 'Best Seller',
      'Material: 80% cotton 20% polyester | Machine wash cold',
      'sweatshirt,casual,bestseller',
      'true', 'true',
      'https://cdn.example.com/sweatshirt-pink-1.webp',
      'https://cdn.example.com/sweatshirt-pink-2.webp',
      '',
      'Baby Pink', '#f4c2c2', 'XS', 'CCN-BP-XS', '12',
    ],
    [
      '', '', '', '', '', '', '', '', '', '',
      '', '', '',
      'Baby Pink', '#f4c2c2', 'S', 'CCN-BP-S', '18',
    ],
    [
      '', '', '', '', '', '', '', '', '', '',
      '', '', '',
      'Baby Pink', '#f4c2c2', 'M', 'CCN-BP-M', '22',
    ],
    [
      '', '', '', '', '', '', '', '', '', '',
      'https://cdn.example.com/sweatshirt-black-1.webp',
      'https://cdn.example.com/sweatshirt-black-2.webp',
      '',
      'Black', '#1a1a1a', 'XS', 'CCN-BK-XS', '12',
    ],
    [
      '', '', '', '', '', '', '', '', '', '',
      '', '', '',
      'Black', '#1a1a1a', 'S', 'CCN-BK-S', '18',
    ],
    [
      'Silk Wrap Midi Dress',
      'Elegant wrap dress in premium silk blend',
      '218', '', 'Dresses', 'New',
      'Material: 100% silk | Dry clean only',
      'dress,silk,new',
      'true', 'true',
      'https://cdn.example.com/dress-ivory-1.webp',
      '', '',
      'Ivory', '#fffff0', 'XS', 'SWD-IV-XS', '8',
    ],
    [
      '', '', '', '', '', '', '', '', '', '',
      '', '', '',
      'Ivory', '#fffff0', 'S', 'SWD-IV-S', '12',
    ],
  ]

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'solomon-lawrence-product-import-sample.csv'
  a.click()
  URL.revokeObjectURL(url)
}

interface ParsedProduct {
  name: string
  description: string
  price: number
  comparePrice: number | null
  category: string
  badge: string
  details: string[]
  tags: string[]
  isGrouped: boolean
  isActive: boolean
  images: string[]
  variants: { color: string; colorHex: string; size: string; sku: string; inventory: number; images: string[] }[]
}

function parseCSV(text: string): ParsedProduct[] {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return []

  const parseRow = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim()); current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const headers = parseRow(lines[0])
  const idx = (name: string) => headers.indexOf(name)

  const products: ParsedProduct[] = []
  let current: ParsedProduct | null = null

  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i])
    const get = (col: string) => row[idx(col)]?.trim() ?? ''

    const name = get('name')
    if (name) {
      // New product row
      const images = [get('image_1'), get('image_2'), get('image_3')].filter(Boolean)
      current = {
        name,
        description:  get('description'),
        price:        parseFloat(get('price')) || 0,
        comparePrice: get('compare_price') ? parseFloat(get('compare_price')) : null,
        category:     get('category'),
        badge:        get('badge'),
        details:      get('details') ? get('details').split('|').map(d => d.trim()).filter(Boolean) : [],
        tags:         get('tags') ? get('tags').split(',').map(t => t.trim()).filter(Boolean) : [],
        isGrouped:    get('is_grouped') !== 'false',
        isActive:     get('is_active') !== 'false',
        images,
        variants: [],
      }
      products.push(current)
    }

    // Add variant (whether new product row or continuation row)
    if (current && get('variant_sku')) {
      // Collect variant images from image columns if this is a continuation row
      const varImages = !name
        ? [get('image_1'), get('image_2'), get('image_3')].filter(Boolean)
        : []
      current.variants.push({
        color:     get('variant_color'),
        colorHex:  get('variant_color_hex') || '#1a1a1a',
        size:      get('variant_size'),
        sku:       get('variant_sku'),
        inventory: parseInt(get('variant_inventory')) || 0,
        images:    varImages,
      })
    }
  }

  return products
}

export default function ProductImportPage() {
  const [file,       setFile]       = useState<File | null>(null)
  const [parsed,     setParsed]     = useState<ParsedProduct[] | null>(null)
  const [importing,  setImporting]  = useState(false)
  const [results,    setResults]    = useState<{ name: string; status: 'ok' | 'error'; error?: string }[]>([])
  const [toast,      setToast]      = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [dragOver,   setDragOver]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleFile = (f: File) => {
    setFile(f)
    setResults([])
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const products = parseCSV(text)
      setParsed(products)
    }
    reader.readAsText(f)
  }

  const handleImport = async () => {
    if (!parsed?.length) return
    setImporting(true)
    setResults([])
    const res: typeof results = []

    for (const p of parsed) {
      try {
        const response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:         p.name,
            description:  p.description,
            price:        p.price,
            comparePrice: p.comparePrice,
            category:     p.category,
            badge:        p.badge || null,
            images:       p.images,
            details:      p.details,
            tags:         p.tags,
            isGrouped:    p.isGrouped,
            isActive:     p.isActive,
          }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error ?? 'Failed')

        // Save variants if any
        if (p.variants.length > 0 && data.product?.id) {
          await fetch('/api/admin/variants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: data.product.id,
              variants:  p.variants,
              replace:   true,
            }),
          })
        }

        res.push({ name: p.name, status: 'ok' })
      } catch (err: any) {
        res.push({ name: p.name, status: 'error', error: err.message })
      }
      setResults([...res])
    }

    setImporting(false)
    const ok = res.filter(r => r.status === 'ok').length
    const fail = res.filter(r => r.status === 'error').length
    showToast(
      fail === 0
        ? `${ok} product${ok !== 1 ? 's' : ''} imported successfully`
        : `${ok} imported, ${fail} failed`,
      fail === 0 ? 'success' : 'error'
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {toast && <Toast {...toast} />}

      {/* Header */}
      <div className="bg-white border border-gray-200 p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/products"
            className="w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-500 hover:border-[#1a1a1a] no-underline transition-colors">
            <ArrowLeft size={15} strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className="text-[18px] font-semibold text-[#1a1a1a] flex items-center gap-2">
              <FileSpreadsheet size={18} strokeWidth={1.5} className="text-[#c8a882]" />
              Bulk Product Import
            </h1>
            <p className="text-[12px] text-gray-500 mt-0.5">Import products from CSV — same format as Shopify</p>
          </div>
        </div>
        <button onClick={downloadSampleCSV}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-[12px] text-[#1a1a1a] bg-white hover:border-[#1a1a1a] cursor-pointer transition-colors">
          <Download size={13} /> Download Sample CSV
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-[#f8f6f1] border border-[#e8e0d0] p-5 text-[12px] text-[#6b5d4f] space-y-2 leading-relaxed">
        <p className="font-semibold text-[13px] text-[#1a1a1a]">How to use:</p>
        <ol className="list-decimal list-inside space-y-1.5">
          <li>Download the sample CSV file above and open in Excel or Google Sheets</li>
          <li>Fill in your product data — one row per variant, leave product fields blank for continuation rows</li>
          <li>For multiple colors: add a new row with same product name and different variant fields, OR use continuation rows (leave name blank)</li>
          <li>Image URLs must be publicly accessible (CDN, S3, etc.)</li>
          <li>Upload your completed CSV and review the preview before importing</li>
        </ol>
      </div>

      {/* CSV Column Reference */}
      <div className="bg-white border border-gray-200">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-[13px] font-semibold text-[#1a1a1a]">CSV Column Reference</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-2.5 font-semibold text-gray-500 tracking-wide uppercase text-[10px]">Column</th>
                <th className="text-left px-4 py-2.5 font-semibold text-gray-500 tracking-wide uppercase text-[10px]">Required</th>
                <th className="text-left px-4 py-2.5 font-semibold text-gray-500 tracking-wide uppercase text-[10px]">Example</th>
                <th className="text-left px-4 py-2.5 font-semibold text-gray-500 tracking-wide uppercase text-[10px]">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { col: 'name', req: 'Yes*', ex: 'Classic Sweatshirt', note: 'Leave blank for variant continuation rows' },
                { col: 'description', req: 'No', ex: 'Comfortable everyday...', note: '' },
                { col: 'price', req: 'Yes*', ex: '88', note: 'Number only, no $ sign' },
                { col: 'compare_price', req: 'No', ex: '110', note: 'Original price for sale items' },
                { col: 'category', req: 'No', ex: 'Tops', note: 'Tops, Dresses, Pants, Jeans, etc.' },
                { col: 'badge', req: 'No', ex: 'Best Seller', note: 'New, Best Seller, Sale, Limited' },
                { col: 'details', req: 'No', ex: 'Material: cotton | Machine wash', note: 'Separate multiple details with |' },
                { col: 'tags', req: 'No', ex: 'casual,summer', note: 'Comma separated' },
                { col: 'is_grouped', req: 'No', ex: 'true', note: 'true = group colors as swatches, false = separate cards' },
                { col: 'is_active', req: 'No', ex: 'true', note: 'false = draft' },
                { col: 'image_1', req: 'No', ex: 'https://cdn.com/img.webp', note: 'Main product image URL' },
                { col: 'image_2', req: 'No', ex: 'https://cdn.com/img2.webp', note: 'Additional image' },
                { col: 'image_3', req: 'No', ex: 'https://cdn.com/img3.webp', note: 'Additional image' },
                { col: 'variant_color', req: 'No', ex: 'Baby Pink', note: 'Color name' },
                { col: 'variant_color_hex', req: 'No', ex: '#f4c2c2', note: 'Hex color code' },
                { col: 'variant_size', req: 'No', ex: 'S', note: 'XS, S, M, L, XL, XXL' },
                { col: 'variant_sku', req: 'No', ex: 'CCN-BP-S', note: 'Must be unique' },
                { col: 'variant_inventory', req: 'No', ex: '18', note: 'Stock quantity' },
              ].map(r => (
                <tr key={r.col}>
                  <td className="px-4 py-2 font-mono text-[11px] text-[#c8a882]">{r.col}</td>
                  <td className="px-4 py-2 text-gray-500">{r.req}</td>
                  <td className="px-4 py-2 text-gray-400 font-mono text-[11px]">{r.ex}</td>
                  <td className="px-4 py-2 text-gray-400">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed cursor-pointer transition-all p-12 text-center
          ${dragOver ? 'border-[#1a1a1a] bg-[#f8f6f1]' : 'border-gray-300 bg-white hover:border-gray-400'}`}>
        <input ref={inputRef} type="file" accept=".csv" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        <Upload size={32} strokeWidth={1.5} className="mx-auto mb-3 text-[#c8a882]" />
        {file ? (
          <div>
            <p className="text-[14px] font-medium text-[#1a1a1a]">{file.name}</p>
            <p className="text-[12px] text-gray-400 mt-1">{parsed?.length ?? 0} products parsed — click to change file</p>
          </div>
        ) : (
          <div>
            <p className="text-[14px] font-medium text-[#1a1a1a]">Drop your CSV file here</p>
            <p className="text-[12px] text-gray-400 mt-1">or click to browse — .csv files only</p>
          </div>
        )}
      </div>

      {/* Preview */}
      {parsed && parsed.length > 0 && (
        <div className="bg-white border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a]">
              Preview — {parsed.length} product{parsed.length !== 1 ? 's' : ''} found
            </h2>
            <button onClick={handleImport} disabled={importing}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white text-[12px] font-semibold border-none cursor-pointer hover:bg-gray-800 disabled:opacity-50 transition-colors">
              {importing
                ? <><Loader2 size={13} className="animate-spin" /> Importing...</>
                : <><Upload size={13} /> Import {parsed.length} Product{parsed.length !== 1 ? 's' : ''}</>}
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {parsed.map((p, i) => (
              <div key={i} className="px-5 py-3 flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-medium text-[#1a1a1a]">{p.name}</p>
                    {p.badge && <span className="text-[10px] bg-[#1a1a1a] text-white px-2 py-0.5">{p.badge}</span>}
                    {!p.isActive && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5">Draft</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-0.5 text-[11px] text-gray-400">
                    <span>${p.price}{p.comparePrice ? ` / $${p.comparePrice}` : ''}</span>
                    <span>{p.category}</span>
                    <span>{p.variants.length} variant{p.variants.length !== 1 ? 's' : ''}</span>
                    <span>{p.images.length} image{p.images.length !== 1 ? 's' : ''}</span>
                  </div>
                  {p.variants.length > 0 && (
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {[...new Set(p.variants.map(v => v.color))].map(color => {
                        const v = p.variants.find(x => x.color === color)!
                        return (
                          <span key={color} className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                            <span className="w-2.5 h-2.5 rounded-full inline-block border border-gray-200" style={{ background: v.colorHex }} />
                            {color} ({p.variants.filter(x => x.color === color).length} sizes)
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
                {/* Import result */}
                {results[i] && (
                  <div className={`flex items-center gap-1.5 text-[11px] font-medium shrink-0
                    ${results[i].status === 'ok' ? 'text-[#4a6741]' : 'text-red-500'}`}>
                    {results[i].status === 'ok'
                      ? <><CheckCircle2 size={13} /> Imported</>
                      : <><X size={13} /> {results[i].error}</>}
                  </div>
                )}
                {importing && !results[i] && i === results.length && (
                  <Loader2 size={13} className="animate-spin text-gray-400 shrink-0 mt-0.5" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}