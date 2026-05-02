// Save as: src/components/cms-fallbacks/jobs.tsx
const OPENINGS = [
  { title: 'Senior Fashion Designer', dept: 'Design', location: 'Los Angeles, CA', type: 'Full-time' },
  { title: 'E-Commerce Manager', dept: 'Digital', location: 'Remote', type: 'Full-time' },
  { title: 'Wholesale Account Executive', dept: 'Sales', location: 'New York, NY', type: 'Full-time' },
  { title: 'Social Media Coordinator', dept: 'Marketing', location: 'Remote', type: 'Full-time' },
  { title: 'Customer Service Representative', dept: 'Support', location: 'Remote', type: 'Full-time' },
]
export default function JobsFallback() {
  return (
    <div style={{ maxWidth: '720px' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-mid)', lineHeight: 1.9, marginBottom: '40px' }}>
        We're a fast-growing California fashion brand building something real. We work hard, care deeply about our product, and believe great people make great brands.
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontStyle: 'italic', fontWeight: 400, marginBottom: '20px' }}>Open Positions</h2>
      {OPENINGS.map((job, i, arr) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #f0ece6', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--color-charcoal)', marginBottom: '4px' }}>{job.title}</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-mid)' }}>{job.dept} · {job.location} · {job.type}</p>
          </div>
          <a href={`mailto:support@solomonlawrencegroup.com?subject=Application: ${job.title}`} className="btn-outline" style={{ fontSize: '10px', padding: '8px 18px', flexShrink: 0 }}>Apply</a>
        </div>
      ))}
      <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid #e8e4de' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-mid)', lineHeight: 1.8 }}>
          Don't see your role? Send your resume to <a href="mailto:support@solomonlawrencegroup.com" style={{ color: 'var(--color-charcoal)', textDecoration: 'underline' }}>careerssupport@solomonlawrencegroup.com</a>
        </p>
      </div>
    </div>
  )
}