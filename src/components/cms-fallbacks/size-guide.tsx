// Save as: src/components/cms-fallbacks/size-guide.tsx
export default function SizeguideFallback() {
  return (
    <div style={{ maxWidth: '820px' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-mid)', lineHeight: 1.9, marginBottom: '40px' }}>
        Measure yourself and compare against the charts below. If you're between sizes, size up. All measurements are in inches.
      </p>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontStyle: 'italic', fontWeight: 400, marginBottom: '16px' }}>Women's Clothing</h2>
      <div style={{ overflowX: 'auto', marginBottom: '48px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-charcoal)' }}>
              {['Size', 'US Size', 'Bust', 'Waist', 'Hips'].map(h => (
                <th key={h} style={{ padding: '10px 16px 10px 0', textAlign: 'left', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--color-charcoal)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['XS', '0–2', '32–33"', '24–25"', '34–35"'],
              ['S',  '4–6', '34–35"', '26–27"', '36–37"'],
              ['M',  '8–10', '36–37"', '28–29"', '38–39"'],
              ['L',  '12–14', '38–40"', '30–32"', '40–42"'],
              ['XL', '16–18', '41–43"', '33–35"', '43–45"'],
              ['XXL','20–22', '44–46"', '36–38"', '46–48"'],
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f0ece6' }}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: '13px 16px 13px 0', color: j === 0 ? 'var(--color-charcoal)' : 'var(--color-mid)', fontWeight: j === 0 ? 600 : 400 }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontStyle: 'italic', fontWeight: 400, marginBottom: '16px' }}>How to Measure</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '24px', paddingTop: '16px', borderTop: '1px solid #e8e4de' }}>
        {[
          { label: 'Bust', text: 'Measure around the fullest part of your chest, keeping the tape parallel to the floor.' },
          { label: 'Waist', text: 'Measure around your natural waistline, the narrowest part of your torso.' },
          { label: 'Hips', text: 'Measure around the fullest part of your hips, about 8" below your waist.' },
        ].map((m, i) => (
          <div key={i}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-charcoal)', marginBottom: '8px' }}>{m.label}</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-mid)', lineHeight: 1.7 }}>{m.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}