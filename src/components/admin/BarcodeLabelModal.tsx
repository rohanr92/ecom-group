'use client'

import { useState, useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import jsPDF from 'jspdf'
import { X, Printer, Download, Plus, Minus } from 'lucide-react'

interface LabelItem {
  upc: string
  productName: string
  variantInfo?: string  // e.g. "S · White"
  sku?: string
  price?: number
  quantity: number
}

interface BarcodeLabelModalProps {
  open: boolean
  onClose: () => void
  items: LabelItem[]  // one entry per variant
}

// Label dimensions: 79mm × 26mm
const LABEL_WIDTH_MM = 79
const LABEL_HEIGHT_MM = 26

// Convert mm to pt (PDF uses points, 1mm = 2.83465pt)
const mmToPt = (mm: number) => mm * 2.83465

function validateUPC(upc: string): boolean {
  // UPC-A is 12 digits with valid checksum
  const cleaned = upc.replace(/\D/g, '')
  if (cleaned.length !== 12) return false
  let sum = 0
  for (let i = 0; i < 11; i++) {
    sum += parseInt(cleaned[i]) * (i % 2 === 0 ? 3 : 1)
  }
  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit === parseInt(cleaned[11])
}

export default function BarcodeLabelModal({ open, onClose, items }: BarcodeLabelModalProps) {
  const [line1Field, setLine1Field] = useState<'productName' | 'custom'>('productName')
  const [line2Field, setLine2Field] = useState<'variantInfo' | 'sku' | 'custom' | 'none'>('variantInfo')
  const [customLine1, setCustomLine1] = useState('')
  const [customLine2, setCustomLine2] = useState('')
  const [perItemQty, setPerItemQty] = useState<Record<string, number>>(() =>
    items.reduce((acc, it) => ({ ...acc, [it.upc]: it.quantity }), {} as Record<string, number>)
  )

  const previewRef = useRef<SVGSVGElement>(null)
  const previewItem = items[0]

  // Update qty when items change
  useEffect(() => {
    setPerItemQty(items.reduce((acc, it) => ({ ...acc, [it.upc]: it.quantity }), {} as Record<string, number>))
  }, [items])

  // Render live preview barcode
  useEffect(() => {
    if (!open || !previewRef.current || !previewItem?.upc) return
    try {
      if (!validateUPC(previewItem.upc)) {
        // Render an error barcode placeholder
        previewRef.current.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="red">Invalid UPC</text>'
        return
      }
      JsBarcode(previewRef.current, previewItem.upc, {
        format: 'UPC',
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 14,
        margin: 5,
        background: '#ffffff',
        lineColor: '#000000',
      })
    } catch (err) {
      console.error('Barcode render error:', err)
    }
  }, [open, previewItem, line1Field, line2Field, customLine1, customLine2])

  if (!open) return null

  const getLine1 = (item: LabelItem) =>
    line1Field === 'custom' ? customLine1 : item.productName

  const getLine2 = (item: LabelItem) => {
    if (line2Field === 'none') return ''
    if (line2Field === 'custom') return customLine2
    if (line2Field === 'sku') return item.sku || ''
    return item.variantInfo || ''
  }

  // Generate full PDF: one label per page, one page per unit
  const generatePDF = (autoPrint = false) => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [LABEL_WIDTH_MM, LABEL_HEIGHT_MM],
    })

    let firstPage = true
    const allLabels: LabelItem[] = []
    items.forEach((item) => {
      const qty = perItemQty[item.upc] ?? item.quantity
      for (let i = 0; i < qty; i++) allLabels.push(item)
    })

    allLabels.forEach((item) => {
      if (!firstPage) pdf.addPage([LABEL_WIDTH_MM, LABEL_HEIGHT_MM], 'landscape')
      firstPage = false

      const line1 = getLine1(item)
      const line2 = getLine2(item)

      // Line 1 (product name) - centered top
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      const line1Lines = pdf.splitTextToSize(line1, LABEL_WIDTH_MM - 4)
      pdf.text(line1Lines[0] || '', LABEL_WIDTH_MM / 2, 4, { align: 'center' })

      // Line 2 (variant info or sku) - centered below line 1
      if (line2) {
        pdf.setFontSize(7)
        pdf.setFont('helvetica', 'normal')
        pdf.text(line2, LABEL_WIDTH_MM / 2, 7.5, { align: 'center' })
      }

      // Generate barcode SVG, convert to data URL via canvas
      const canvas = document.createElement('canvas')
      try {
        if (!validateUPC(item.upc)) {
          pdf.setTextColor(255, 0, 0)
          pdf.text(`Invalid UPC: ${item.upc}`, LABEL_WIDTH_MM / 2, 15, { align: 'center' })
          pdf.setTextColor(0, 0, 0)
          return
        }
        JsBarcode(canvas, item.upc, {
          format: 'UPC',
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 12,
          margin: 2,
          background: '#ffffff',
          lineColor: '#000000',
        })
        const dataUrl = canvas.toDataURL('image/png')
        // Barcode: roughly 60mm wide, 14mm tall, centered horizontally, below text
        const bcWidth = 60
        const bcHeight = 14
        const bcX = (LABEL_WIDTH_MM - bcWidth) / 2
        const bcY = line2 ? 9 : 6
        pdf.addImage(dataUrl, 'PNG', bcX, bcY, bcWidth, bcHeight)
      } catch (err) {
        console.error('Barcode render error for', item.upc, err)
        pdf.setTextColor(255, 0, 0)
        pdf.text(`Error: ${item.upc}`, LABEL_WIDTH_MM / 2, 15, { align: 'center' })
        pdf.setTextColor(0, 0, 0)
      }
    })

    if (autoPrint) {
      pdf.autoPrint()
      const blobUrl = pdf.output('bloburl')
      window.open(blobUrl as unknown as string, '_blank')
    } else {
      pdf.save(`barcode-labels-${Date.now()}.pdf`)
    }
  }

  const totalLabels = items.reduce((sum, it) => sum + (perItemQty[it.upc] ?? it.quantity), 0)

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#1a1a1a]">Create Barcode Labels</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Preview */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Label Preview
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex justify-center">
              <div
                className="bg-white border border-gray-300 rounded-sm shadow-sm flex flex-col items-center justify-center p-2 text-center"
                style={{
                  width: `${LABEL_WIDTH_MM * 4}px`,
                  height: `${LABEL_HEIGHT_MM * 4}px`,
                }}
              >
                <p className="text-[10px] font-bold text-[#1a1a1a] leading-tight truncate w-full px-1">
                  {previewItem ? getLine1(previewItem) : ''}
                </p>
                {previewItem && getLine2(previewItem) && (
                  <p className="text-[9px] text-gray-600 leading-tight">
                    {getLine2(previewItem)}
                  </p>
                )}
                <svg ref={previewRef} className="mt-1" />
              </div>
            </div>
          </div>

          {/* Line 1 selector */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Line 1 (required)
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  checked={line1Field === 'productName'}
                  onChange={() => setLine1Field('productName')}
                />
                <span className="text-[13px]">Product name</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  checked={line1Field === 'custom'}
                  onChange={() => setLine1Field('custom')}
                />
                <span className="text-[13px]">Custom text</span>
                {line1Field === 'custom' && (
                  <input
                    type="text"
                    value={customLine1}
                    onChange={(e) => setCustomLine1(e.target.value)}
                    placeholder="Enter custom title..."
                    className="flex-1 ml-2 px-2 py-1 text-[12px] border border-gray-200 rounded"
                  />
                )}
              </label>
            </div>
          </div>

          {/* Line 2 selector */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Line 2 (optional)
            </label>
            <div className="space-y-2">
              {[
                { val: 'variantInfo', label: 'Size · Color' },
                { val: 'sku', label: 'SKU' },
                { val: 'custom', label: 'Custom text' },
                { val: 'none', label: 'None' },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    checked={line2Field === opt.val}
                    onChange={() => setLine2Field(opt.val as typeof line2Field)}
                  />
                  <span className="text-[13px]">{opt.label}</span>
                  {opt.val === 'custom' && line2Field === 'custom' && (
                    <input
                      type="text"
                      value={customLine2}
                      onChange={(e) => setCustomLine2(e.target.value)}
                      placeholder="Custom subtitle..."
                      className="flex-1 ml-2 px-2 py-1 text-[12px] border border-gray-200 rounded"
                    />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Quantity per item */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Labels per item
            </label>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.upc}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate">{item.productName}</p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      UPC: {item.upc} {!validateUPC(item.upc) && <span className="text-red-500">(invalid checksum)</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setPerItemQty((q) => ({ ...q, [item.upc]: Math.max(1, (q[item.upc] ?? 1) - 1) }))
                      }
                      className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50"
                    >
                      <Minus size={12} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={perItemQty[item.upc] ?? item.quantity}
                      onChange={(e) =>
                        setPerItemQty((q) => ({
                          ...q,
                          [item.upc]: Math.max(1, parseInt(e.target.value) || 1),
                        }))
                      }
                      className="w-12 px-2 py-1 text-[12px] text-center border border-gray-200 rounded"
                    />
                    <button
                      onClick={() =>
                        setPerItemQty((q) => ({ ...q, [item.upc]: (q[item.upc] ?? 1) + 1 }))
                      }
                      className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              Total labels: <span className="font-semibold text-[#1a1a1a]">{totalLabels}</span> · Label size: 79mm × 26mm
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => generatePDF(false)}
            disabled={totalLabels === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium text-[#1a1a1a] border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Download size={13} /> Download PDF
          </button>
          <button
            onClick={() => generatePDF(true)}
            disabled={totalLabels === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium text-white bg-[#1a1a1a] rounded-lg hover:bg-black disabled:opacity-50"
          >
            <Printer size={13} /> Print Now
          </button>
        </div>
      </div>
    </div>
  )
}