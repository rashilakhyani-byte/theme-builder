import { useState } from 'react'
import { actions } from '../../../store'
import { Ph_ } from '../../../ui/Phosphor'
import { PageHero } from '../parts'
import { Layer, PanelHead } from '../Organisation'
import { APPS, CREDENTIALS, LOGS, LogEntry, RULES, appById, endpointCount, packageById, productById } from './data'
import { AreaChart, DetailHead, ListToolbar, Method, plural, RateCardView, RuleExpression, SecretField, SettingsCard, Spark, StatusPill, Tabs, Tile } from './ui'
import { CreateAppDrawer } from './CreateApp'
import { SPOTS } from './spots'

/* Apps — the consumer's apps, each holding its credentials and the packages
   and products it can call. Validity lives on the app. */

type Filter = 'all' | 'Approved' | 'Pending'

export function AppsList() {
  const [f, setF] = useState<Filter>('all')
  const [creating, setCreating] = useState(false)
  const rows = f === 'all' ? APPS : APPS.filter((a) => a.status === f)
  return (
    <>
      <PageHero spot={SPOTS.apps} title="Apps" sub="Your applications, their credentials and the APIs they can call." />
      <div className="pg-body og-stack">
        <ListToolbar
          title={f === 'all' ? 'Apps' : f}
          count={rows.length}
          filter={{
            label: 'Status',
            value: f,
            onChange: setF,
            options: [
              { id: 'all', label: 'All', count: APPS.length },
              { id: 'Approved', label: 'Approved', count: APPS.filter((a) => a.status === 'Approved').length },
              { id: 'Pending', label: 'Pending', count: APPS.filter((a) => a.status === 'Pending').length },
            ],
          }}
          actions={<button className="og-btn is-brand" onClick={() => setCreating(true)}><Ph_ name="Plus" size={16} />New app</button>}
        />
        <div className="og-table mn-table" style={{ gridTemplateColumns: 'minmax(0, 2.2fr) minmax(0, 0.9fr) minmax(0, 1.1fr) minmax(0, 1.4fr) minmax(0, 0.9fr) minmax(0, 1fr) 40px' }}>
          {['App', 'Status', 'Access', 'Calls · 30 days', 'Spend', 'Valid until', ''].map((h, i) => <div key={i} className="og-th">{h}</div>)}
          {rows.map((a) => (
            <div key={a.id} className="og-tr ac-click" onClick={() => actions.openMon('apps', a.id)}>
              <div className="og-td og-who"><Tile icon="SquaresFour" size="sm" /><span className="og-two"><span>{a.name}</span><small>{a.desc}</small></span></div>
              <div className="og-td"><StatusPill status={a.status} /></div>
              <div className="og-td og-two"><span>{plural(a.packages.length, 'package')}</span><small>{plural(a.products.length, 'product')}</small></div>
              <div className="og-td mn-calls"><span>{a.calls}</span>{a.status === 'Approved' && <Spark data={a.trend} />}</div>
              <div className="og-td">{a.spend}</div>
              <div className="og-td">{a.validUntil}</div>
              <div className="og-td og-td-icon"><Ph_ name="CaretRight" size={14} className="mn-muted" /></div>
            </div>
          ))}
        </div>
      </div>
      {creating && <CreateAppDrawer onClose={() => setCreating(false)} />}
    </>
  )
}

/* ------------------------------------------------------------ detail */

type Tab = 'overview' | 'analytics' | 'logs' | 'settings'

export function AppDetail({ id }: { id: string }) {
  const app = appById(id)
  const [tab, setTab] = useState<Tab>('overview')
  const [adding, setAdding] = useState(false)
  const pending = app.status === 'Pending'
  return (
    <>
      <DetailHead
        crumb="Apps"
        onCrumb={() => actions.openMon('apps')}
        title={app.name}
        desc={app.desc}
        actions={<button className="og-btn is-tint" onClick={() => setAdding(true)}><Ph_ name="Plus" size={16} />Add APIs</button>}
      >
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'logs', label: 'Logs' },
            { id: 'settings', label: 'Settings' },
          ]}
        />
      </DetailHead>
      <div key={tab} className="pg-body mn-pane">
        {tab === 'overview' && <Overview id={id} pending={pending} />}
        {tab === 'analytics' && <Analytics id={id} />}
        {tab === 'logs' && <Logs />}
        {tab === 'settings' && <Settings id={id} />}
      </div>
      {adding && <CreateAppDrawer app={app.name} onClose={() => setAdding(false)} />}
    </>
  )
}

function Overview({ id, pending }: { id: string; pending: boolean }) {
  const app = appById(id)
  const rows = [
    ...app.packages.map((p) => ({ kind: 'Package', icon: 'Package', name: packageById(p).name, n: endpointCount(packageById(p)), go: () => actions.openMon('packages', p) })),
    ...app.products.map((p) => ({ kind: 'Product', icon: 'Cube', name: productById(p).name, n: productById(p).endpoints.length, go: () => actions.openMon('products', p) })),
  ]
  return (
    <div className="mn-split">
      <div className="mn-main">
        <section className="mn-section">
          <div>
            <h2 className="mn-h2">Credentials</h2>
            <p className="mn-h2-sub">Use these to request tokens for the APIs below.</p>
          </div>
          {pending ? (
            <div className="mn-banner"><Ph_ name="Clock" size={16} /><span>Credentials appear once the provider approves this app.</span></div>
          ) : (
            CREDENTIALS.map((c) => (
              <div key={c.label} className="mn-cred">
                <header><b>{c.label}</b><button className="ac-link"><Ph_ name="ArrowsClockwise" size={14} />Regenerate secret</button></header>
                {c.fields.map(([l, v]) => <SecretField key={l} label={l} value={v} secret={l !== 'App ID'} />)}
              </div>
            ))
          )}
        </section>
        <section className="mn-section">
          <h2 className="mn-h2">APIs<span className="og-count">{rows.length}</span></h2>
          <div className="og-table mn-table" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) 40px' }}>
            {['Name', 'Type', 'Endpoints', ''].map((h, i) => <div key={i} className="og-th">{h}</div>)}
            {rows.map((r) => (
              <div key={r.name} className="og-tr ac-click" onClick={r.go}>
                <div className="og-td og-who"><Tile icon={r.icon} size="sm" /><span>{r.name}</span></div>
                <div className="og-td">{r.kind}</div>
                <div className="og-td">{r.n}</div>
                <div className="og-td og-td-icon"><Ph_ name="CaretRight" size={14} className="mn-muted" /></div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <aside className="mn-aside">
        <section className="mn-box">
          <p className="mn-eyebrow">This month</p>
          <p className="mn-price">{app.spend}</p>
          <p className="mn-box-note">{app.calls} calls in the last 30 days</p>
        </section>
        <dl className="mn-facts">
          <div><dt>Status</dt><dd>{app.status}</dd></div>
          <div><dt>Created</dt><dd>{app.created}</dd></div>
          <div><dt>Valid until</dt><dd>{app.validUntil}</dd></div>
          <div><dt>Owner</dt><dd>lavanya@apiwiz.com</dd></div>
        </dl>
      </aside>
    </div>
  )
}

function Analytics({ id }: { id: string }) {
  const app = appById(id)
  const usage = app.packages.map((p, i) => ({ name: packageById(p).name, share: [62, 38, 20][i] ?? 10, spend: ['$1,310', '$532', '$100'][i] ?? '$0' }))
  const stats = [
    { label: 'Spend this month', value: app.spend, trend: '+18.5%', up: true },
    { label: 'Metered calls', value: '148K', trend: '+14.2%', up: true },
    { label: 'Unmetered calls', value: '64K', trend: '-2.5%', up: false },
  ]
  return (
    <div className="mn-main mn-analytics">
      <div className="mn-stats">
        {stats.map((s) => (
          <div key={s.label} className="mn-stat">
            <p className="mn-eyebrow">{s.label}</p>
            <p className="mn-stat-value">{s.value}</p>
            <p className={`mn-delta ${s.up ? 'is-up' : 'is-down'}`}><Ph_ name={s.up ? 'TrendUp' : 'TrendDown'} size={14} />{s.trend}<span>vs last month</span></p>
          </div>
        ))}
      </div>
      <section className="mn-box mn-chart-box">
        <header className="mn-chart-head"><h2 className="mn-h2">Daily calls</h2><span className="mn-tag">Last 30 days</span></header>
        <AreaChart data={app.trend} unit="calls" />
      </section>
      <section className="mn-section">
        <h2 className="mn-h2">By package</h2>
        <div className="og-table mn-table" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 2fr) minmax(0, 1fr)' }}>
          {['Package', 'Share of calls', 'Spend'].map((h) => <div key={h} className="og-th">{h}</div>)}
          {usage.map((u) => (
            <div key={u.name} className="og-tr">
              <div className="og-td og-who"><Tile icon="Package" size="sm" /><span>{u.name}</span></div>
              <div className="og-td mn-share"><i><b style={{ width: `${u.share}%` }} /></i><span>{u.share}%</span></div>
              <div className="og-td">{u.spend}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Logs() {
  const [open, setOpen] = useState<LogEntry | null>(null)
  return (
    <div className="og-stack">
      <div className="og-table mn-table is-compact" style={{ gridTemplateColumns: '92px 80px minmax(0, 1.8fr) minmax(0, 1.5fr) minmax(0, 1.1fr) 76px 80px' }}>
        {['Time', 'Method', 'Path', 'Package', 'Rule', 'Status', ''].map((h, i) => <div key={i} className="og-th">{h}</div>)}
        {LOGS.map((l, i) => (
          <div key={i} className="og-tr">
            <div className="og-td mn-num">{l.time}</div>
            <div className="og-td"><Method m={l.method} /></div>
            <div className="og-td"><code className="mn-path">{l.path}</code></div>
            <div className="og-td">{l.pkg}</div>
            <div className="og-td">{l.rule}</div>
            <div className="og-td"><span className={`mn-code is-${String(l.code)[0]}xx`}>{l.code}</span></div>
            <div className="og-td"><button className="ac-link" onClick={() => setOpen(l)}>Inspect</button></div>
          </div>
        ))}
      </div>
      {open && <InspectDrawer log={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

function InspectDrawer({ log, onClose }: { log: LogEntry; onClose: () => void }) {
  const [tab, setTab] = useState<'traffic' | 'rule' | 'rate'>('traffic')
  const rule = log.rule === 'High usage' ? RULES['high-usage'] : null
  const body = `{\n  "customerId": "cus_81Kd20",\n  "amount": 25000,\n  "tenureMonths": 24\n}`
  const res = `{\n  "x-log-id": "696f6040be74b83c",\n  "traceid": "2a6ffe668c5e78d"\n}`
  return (
    <Layer kind="drawer" onClose={onClose}>
      <aside className="og-drawer is-660">
        <PanelHead title={`Inspect · ${log.time}`} onClose={onClose} />
        <div className="og-drawer-body">
          <div className="mn-inspect-head">
            <Method m={log.method} /><code className="mn-path">{log.path}</code>
            <span className={`mn-code is-${String(log.code)[0]}xx`}>{log.code}</span>
            <span className="mn-muted">{log.ms} ms · {log.cost}</span>
          </div>
          <div className="og-seg mn-seg-fit" role="tablist">
            <button role="tab" aria-selected={tab === 'traffic'} onClick={() => setTab('traffic')}>Traffic</button>
            <button role="tab" aria-selected={tab === 'rule'} onClick={() => setTab('rule')}>Rule</button>
            <button role="tab" aria-selected={tab === 'rate'} onClick={() => setTab('rate')}>Rate card</button>
          </div>
          {tab === 'traffic' && (
            <div className="mn-traffic">
              <div><p className="mn-eyebrow">Request body</p><pre>{body}</pre></div>
              <div><p className="mn-eyebrow">Response headers</p><pre>{res}</pre></div>
            </div>
          )}
          {tab === 'rule' && (rule
            ? <div className="mn-panel"><p className="mn-panel-note">Billed under <b>{rule.name}</b> because all of these were true:</p><RuleExpression rule={rule} /></div>
            : <p className="mn-empty">No metering rule matched. This call used the package’s default rate card.</p>)}
          {tab === 'rate' && <RateCardView card={rule?.rate ?? packageById('lending-suite').pricing} title={rule ? rule.name : 'Default rate card'} />}
        </div>
      </aside>
    </Layer>
  )
}

function Settings({ id }: { id: string }) {
  const app = appById(id)
  return (
    <div className="mn-settings">
      <SettingsCard
        title="General"
        fields={[
          { label: 'App name', value: app.name, editable: true },
          { label: 'App ID', value: CREDENTIALS[0].fields[0][1] },
          { label: 'Owner', value: 'lavanya@apiwiz.com' },
          { label: 'Created', value: app.created },
          { label: 'Valid until', value: app.validUntil },
          { label: 'Status', value: app.status },
          { label: 'Description', value: app.desc, editable: true, multiline: true, wide: true },
        ]}
      />
      <section className="mn-set">
        <header className="mn-set-head"><h2>Permanent setting</h2></header>
        <div className="mn-set-body">
          <button className="og-btn mn-btn-danger"><Ph_ name="Trash" size={16} />Delete App</button>
        </div>
      </section>
    </div>
  )
}
