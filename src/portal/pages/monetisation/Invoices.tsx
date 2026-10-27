import { useState } from 'react'
import { Ph_ } from '../../../ui/Phosphor'
import { PageHero } from '../parts'
import { Layer, PanelHead } from '../Organisation'
import { DISPUTE, Invoice, INVOICES, InvoiceStatus } from './data'
import { ListToolbar, StatusPill, useToast } from './ui'
import { SPOTS } from './spots'

/* Invoices — one per month, broken down by app and then package. Disputes
   (the old Reconciliation page) live on the invoice they are about. */

type Filter = 'all' | InvoiceStatus

export function InvoicesList() {
  const [f, setF] = useState<Filter>('all')
  const [open, setOpen] = useState<Invoice | null>(null)
  const rows = f === 'all' ? INVOICES : INVOICES.filter((i) => i.status === f)
  const count = (s: InvoiceStatus) => INVOICES.filter((i) => i.status === s).length
  const stats = [
    { label: 'This month so far', value: '$2,914', note: 'Due 15 Dec 2026' },
    { label: 'Outstanding', value: '$5,372', note: '1 overdue invoice' },
    { label: 'Top package', value: 'Instant Payments', note: '42% of October spend' },
  ]
  return (
    <>
      <PageHero spot={SPOTS.invoices} title="Invoices" sub="Monthly bills for your apps’ API usage. Raise a dispute on any invoice." />
      <div className="pg-body og-stack mn-gap-32">
        <div className="mn-stats">
          {stats.map((s) => (
            <div key={s.label} className="mn-stat">
              <p className="mn-eyebrow">{s.label}</p>
              <p className="mn-stat-value">{s.value}</p>
              <p className="mn-box-note">{s.note}</p>
            </div>
          ))}
        </div>
        <div className="og-stack">
          <ListToolbar
            title={f === 'all' ? 'Invoices' : f}
            count={rows.length}
            filter={{
              label: 'Status',
              value: f,
              onChange: setF,
              options: [
                { id: 'all', label: 'All', count: INVOICES.length },
                ...(['Paid', 'Overdue', 'Failed', 'Disputed'] as const).map((s) => ({ id: s, label: s, count: count(s) })),
              ],
            }}
          />
          <div className="og-table mn-table" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 0.8fr) minmax(0, 0.8fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) 40px' }}>
            {['Month', 'Apps', 'Packages', 'Amount', 'Due', 'Status', ''].map((h, i) => <div key={i} className="og-th">{h}</div>)}
            {rows.map((inv) => (
              <div key={inv.id} className="og-tr ac-click" onClick={() => setOpen(inv)}>
                <div className="og-td og-two"><span>{inv.month}</span><small>{inv.id}</small></div>
                <div className="og-td">{inv.lines.length}</div>
                <div className="og-td">{inv.lines.reduce((n, l) => n + l.packages.length, 0)}</div>
                <div className="og-td">{inv.amount}</div>
                <div className="og-td">{inv.due}</div>
                <div className="og-td"><StatusPill status={inv.status} /></div>
                <div className="og-td og-td-icon"><Ph_ name="CaretRight" size={14} className="mn-muted" /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {open && <InvoiceDrawer inv={open} onClose={() => setOpen(null)} />}
    </>
  )
}

function InvoiceDrawer({ inv, onClose }: { inv: Invoice; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(inv.lines[0].app)
  const [disputing, setDisputing] = useState(false)
  const [toast, show] = useToast()
  const disputed = inv.id === DISPUTE.invoice
  return (
    <Layer kind="drawer" onClose={onClose}>
      <aside className="og-drawer is-532">
        <PanelHead title={inv.month} onClose={onClose} />
        <div className="og-drawer-body">
          <section className="mn-inv-sum">
            <div className="mn-inv-top">
              <div>
                <p className="mn-stat-value">{inv.amount}</p>
                <p className="mn-box-note">{inv.id} · due {inv.due}</p>
              </div>
              <StatusPill status={inv.status} />
            </div>
            <dl className="mn-inv-meta">
              <div><dt>Apps</dt><dd>{inv.lines.length}</dd></div>
              <div><dt>Packages</dt><dd>{inv.lines.reduce((n, l) => n + l.packages.length, 0)}</dd></div>
              <div><dt>Billed to</dt><dd>Acme Fintech Ltd</dd></div>
              <div><dt>Email</dt><dd>billing@acme.com</dd></div>
            </dl>
          </section>

          <section className="mn-section">
            <h2 className="mn-h2">Breakdown</h2>
            <div className="mn-list">
              {inv.lines.map((l) => (
                <div key={l.app} className="mn-inv-line">
                  <button className="mn-row" aria-expanded={expanded === l.app} onClick={() => setExpanded(expanded === l.app ? null : l.app)}>
                    <Ph_ name={expanded === l.app ? 'CaretDown' : 'CaretRight'} size={14} className="mn-muted" />
                    <span className="mn-apps-name">{l.app}</span>
                    <b>{l.amount}</b>
                  </button>
                  {expanded === l.app && (
                    <dl className="mn-inv-pkgs">
                      {l.packages.map(([n, a]) => <div key={n}><dt><Ph_ name="Package" size={14} />{n}</dt><dd>{a}</dd></div>)}
                    </dl>
                  )}
                </div>
              ))}
            </div>
          </section>

          {disputed && (
            <section className="mn-section">
              <h2 className="mn-h2">Dispute<span className="og-status is-pending">Open</span></h2>
              <div className="mn-thread">
                <p className="mn-box-note">{DISPUTE.reason} · opened {DISPUTE.opened}</p>
                {DISPUTE.thread.map((m) => (
                  <div key={m.when} className="mn-msg">
                    <p><b>{m.who}</b><span>{m.when}</span></p>
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        <footer className="og-panel-foot mn-create-foot">
          {!disputed && <button className="og-btn is-tint" onClick={() => setDisputing(true)}><Ph_ name="Flag" size={16} />Raise a dispute</button>}
          <span className="mn-create-spacer" />
          <button className="og-btn is-brand" onClick={() => show(`${inv.id}.pdf downloaded`)}><Ph_ name="DownloadSimple" size={16} />Download PDF</button>
        </footer>
        {toast}
      </aside>
      {disputing && <DisputeModal inv={inv} onClose={() => setDisputing(false)} onSent={() => { setDisputing(false); show('Dispute sent. We’ll reply by email.') }} />}
    </Layer>
  )
}

function DisputeModal({ inv, onClose, onSent }: { inv: Invoice; onClose: () => void; onSent: () => void }) {
  const [reason, setReason] = useState('')
  const reasons = ['Charged for failed calls', 'Wrong rate applied', 'App or package I don’t recognise', 'Something else']
  return (
    <div className="og-layer is-modal mn-nested" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="og-modal mn-dispute" role="dialog" aria-label="Raise a dispute">
        <PanelHead title={`Dispute ${inv.id}`} onClose={onClose} />
        <div className="og-modal-body">
          <div className="mn-reasons">
            {reasons.map((r) => (
              <button key={r} className="gd-opt" aria-pressed={reason === r} onClick={() => setReason(r)}>
                <Ph_ name={reason === r ? 'RadioButton' : 'Circle'} weight={reason === r ? 'fill' : 'regular'} size={18} /><span><b>{r}</b></span>
              </button>
            ))}
          </div>
          <label className="ac-field"><span className="ac-label">Details</span><textarea className="mn-textarea" rows={3} placeholder="Dates, endpoints or amounts help us resolve it faster" /></label>
          <div className="og-modal-actions">
            <button className="og-btn is-tint" onClick={onClose}>Cancel</button>
            <button className="og-btn is-brand" disabled={!reason} onClick={onSent}>Send dispute</button>
          </div>
        </div>
      </div>
    </div>
  )
}
