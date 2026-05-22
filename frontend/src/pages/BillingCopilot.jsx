import { Receipt, ShieldCheck, Download, ExternalLink } from 'lucide-react';

export default function BillingCopilot() {
  const bills = [
    { id: 'INV-2026-881', date: 'May 02, 2026', type: 'Specialist Consultation', amount: '$250.00', status: 'Paid', coverage: '80%' },
    { id: 'INV-2026-892', date: 'May 12, 2026', type: 'Lab Test (Complete Blood Count)', amount: '$85.00', status: 'Pending', coverage: '100%' }
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Billing & Insurance Copilot</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your invoices and let AI negotiate and estimate your insurance coverage.</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', padding: '10px 20px', borderRadius: '8px', fontWeight: 600 }}>
          <Download size={18} /> Export All
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {bills.map(bill => (
            <div key={bill.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="avatar" style={{ backgroundColor: bill.status === 'Paid' ? 'var(--bg-color)' : 'rgba(15, 98, 254, 0.1)', color: bill.status === 'Paid' ? 'var(--text-secondary)' : 'var(--primary-color)' }}>
                  <Receipt size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 600 }}>{bill.type}</h4>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{bill.id} • {bill.date}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{bill.amount}</div>
                <div style={{ 
                  fontSize: '12px', fontWeight: 600,
                  color: bill.status === 'Paid' ? 'var(--success-color)' : 'var(--warning-color)' 
                }}>
                  {bill.status}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ backgroundColor: 'var(--primary-color)', color: 'white', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: 600, opacity: 0.9 }}>
              <ShieldCheck size={20} /> AI Insurance Copilot
            </div>
            <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>You saved $200 this month!</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.5, opacity: 0.9, marginBottom: '20px' }}>
              Aura AI successfully pre-authorized your latest lab test, resulting in 100% coverage by Blue Cross Blue Shield.
            </p>
            <button style={{ width: '100%', backgroundColor: 'white', color: 'var(--primary-color)', padding: '10px', borderRadius: '8px', fontWeight: 600 }}>
              View Explanation of Benefits
            </button>
          </div>

          <div className="card">
            <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Current Plan Limits</h4>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                <span>Deductible Met</span>
                <span style={{ fontWeight: 600 }}>$1,200 / $2,000</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--bg-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '60%', height: '100%', backgroundColor: 'var(--secondary-color)' }}></div>
              </div>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '10px', color: 'var(--primary-color)', fontWeight: 500, border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-color)' }}>
              Check Eligibility <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
