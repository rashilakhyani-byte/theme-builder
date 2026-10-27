import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Ph_ } from '../../../ui/Phosphor'
import { useDismiss } from '../../../ui/useDismiss'
import { actions } from '../../../store'
import { CreateAppDrawer } from './CreateApp'
import { Layer, PanelHead, Search } from '../Organisation'
import { Access, APPS, Endpoint, Method as Verb, MeteringRule, Package, RateCard, RULES, endpointCount, packageById, productById } from './data'

/* Pieces shared by the Monetisation pages. Everything sits on the --ui-*
   DocuWiz tokens; the method badges reuse the reference page's colours. */

/* ------------------------------------------------------------ atoms */

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export const Method = ({ m }: { m: Verb }) => <span className={`method m-${m.toLowerCase()}`}>{m}</span>

export const Tile = ({ icon, size = 'md' }: { icon: string; size?: 'sm' | 'md' | 'lg' }) => (
  <span className={`mn-tile is-${size}`}><Ph_ name={icon} size={size === 'lg' ? 24 : size === 'md' ? 18 : 14} /></span>
)

export function Stars({ value }: { value: number }) {
  return (
    <span className="mn-stars" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ph_ key={i} name={value >= i ? 'Star' : value >= i - 0.5 ? 'StarHalf' : 'Star'} weight={value >= i - 0.5 ? 'fill' : 'regular'} size={14} />
      ))}
    </span>
  )
}

export function AccessPill({ access }: { access: Access }) {
  if (access === 'open') return <span className="og-status is-active">Available</span>
  if (access === 'requested') return <span className="og-status is-pending">Requested</span>
  return <span className="og-status is-invited mn-locked"><Ph_ name="LockSimple" size={12} />Restricted</span>
}

/** Underline tabs that sit on the bottom edge of a detail header. */
export function Tabs<T extends string>({ tabs, value, onChange }: {
  tabs: { id: T; label: string; count?: number }[]
  value: T
  onChange: (id: T) => void
}) {
  // The underline is one element that glides to the selected tab.
  const bar = useRef<HTMLDivElement>(null)
  const [ink, setInk] = useState<{ left: number; width: number } | null>(null)
  useLayoutEffect(() => {
    const el = bar.current?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (el) setInk({ left: el.offsetLeft, width: el.offsetWidth })
  }, [value])
  return (
    <div className="mn-tabs" role="tablist" ref={bar}>
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}>
          {t.label}
          {t.count != null && <span className="mn-tab-count">{t.count}</span>}
        </button>
      ))}
      {ink && <i className="mn-ink" style={{ transform: `translateX(${ink.left}px)`, width: ink.width }} />}
    </div>
  )
}

/* ------------------------------------------------------------ detail header */

export function DetailHead({ crumb, onCrumb, title, desc, actions, children }: {
  crumb: string
  onCrumb: () => void
  title: string
  desc: string
  actions: React.ReactNode
  /** The tab strip; it sits at the top of the body, below the banner. */
  children: React.ReactNode
}) {
  return (
    <>
      <header className="pg-hero mn-head">
        <div className="pg-hero-text">
          <nav className="mn-crumbs" aria-label="Breadcrumb">
            <button className="mn-back" onClick={onCrumb} title={`Back to ${crumb}`}><Ph_ name="ArrowLeft" size={14} /></button>
            <button onClick={onCrumb}>{crumb}</button>
            <Ph_ name="CaretRight" size={12} />
            <span aria-current="page">{title}</span>
          </nav>
          <h1 className="pg-title">{title}</h1>
          <p className="pg-sub">{desc}</p>
        </div>
        <div className="pg-hero-actions">{actions}</div>
      </header>
      <div className="mn-tabbar">{children}</div>
    </>
  )
}

/* ------------------------------------------------------------ toast */

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  const timer = useRef<number>()
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const show = (m: string) => {
    setMsg(m)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMsg(null), 2600)
  }
  const node = msg && createPortal(
    <div className="pg mn-toast" role="status"><Ph_ name="CheckCircle" size={16} weight="fill" />{msg}</div>,
    document.body,
  )
  return [node, show] as const
}

/* ------------------------------------------------------------ add to app */

/** The one action on a package or product: attach it to one of my apps.
    Apps that already reach it are ticked and can't be picked again. */
export function AddToApp({ kind, id, name }: { kind: 'package' | 'product'; id: string; name: string }) {
  const [open, setOpen] = useState(false)
  const [added, setAdded] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [toast, show] = useToast()
  const wrap = useRef<HTMLSpanElement>(null)
  useDismiss(open, wrap, () => setOpen(false))

  const has = (appId: string) => {
    const app = APPS.find((a) => a.id === appId)!
    return added.includes(appId) || (kind === 'package'
      ? app.packages.includes(id)
      : app.products.includes(id) || app.packages.some((p) => packageById(p).products.includes(id)))
  }

  return (
    <span className="og-menu-wrap" ref={wrap}>
      <button className="og-btn is-brand" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Ph_ name="Plus" size={16} />Add to app<Ph_ name="CaretDown" size={12} />
      </button>
      {open && (
        <div className="og-menu mn-appmenu" role="menu">
          <p className="mn-menu-title">Add to an app</p>
          {APPS.map((a) => {
            const on = has(a.id)
            return (
              <button
                key={a.id}
                role="menuitem"
                disabled={on}
                onClick={() => { setAdded([...added, a.id]); setOpen(false); show(`${name} added to ${a.name}`) }}
              >
                <Tile icon="SquaresFour" size="sm" />
                <span className="og-two"><span>{a.name}</span><small>{a.status}</small></span>
                {on && <span className="mn-added"><Ph_ name="Check" size={12} weight="bold" />Added</span>}
              </button>
            )
          })}
          <hr />
          <button role="menuitem" className="mn-menu-new" onClick={() => { setOpen(false); setCreating(true) }}><Ph_ name="Plus" size={14} />Create a new app</button>
        </div>
      )}
      {toast}
      {creating && <CreateAppDrawer initial={[{ kind, id }]} onClose={() => setCreating(false)} />}
    </span>
  )
}

/** Restricted products need the provider's say-so before any app can use them. */
export function RequestAccess({ access }: { access: Access }) {
  const [sent, setSent] = useState(access === 'requested')
  return sent
    ? <button className="og-btn is-tint" disabled><Ph_ name="Clock" size={16} />Access requested</button>
    : <button className="og-btn is-brand" onClick={() => setSent(true)}><Ph_ name="LockSimpleOpen" size={16} />Request access</button>
}

/* ------------------------------------------------------------ pricing */

const MODEL_NOTE: Record<RateCard['model'], string> = {
  'Flat rate': 'A fixed monthly price, plus any per-call fees.',
  'Per call': 'Every call is charged at the same rate.',
  Graduated: 'Each call is charged at the rate of the tier it falls in.',
  Volume: 'All calls in the month are charged at the rate of the tier the total reaches.',
}

export function RateCardView({ card, title }: { card: RateCard; title?: string }) {
  return (
    <section className="mn-rate">
      <header className="mn-rate-head">
        <div>
          {title && <p className="mn-eyebrow">{title}</p>}
          <h3>{card.model}</h3>
        </div>
        <p>{MODEL_NOTE[card.model]}</p>
      </header>
      <dl className="mn-tiers">
        {card.base.map((t) => (
          <div key={t.range}><dt>{t.range}</dt><dd>{t.price}</dd></div>
        ))}
      </dl>
      {card.fee && (
        <>
          <p className="mn-rate-sub">Additional fees</p>
          <dl className="mn-tiers">
            {card.fee.map((t) => (
              <div key={t.range}><dt>{t.range}</dt><dd>{t.price}</dd></div>
            ))}
          </dl>
        </>
      )}
    </section>
  )
}

/** Conditions are OR-ed inside a group; groups are AND-ed. */
export function RuleExpression({ rule }: { rule: MeteringRule }) {
  return (
    <div className="mn-expr">
      {rule.when.map((group, g) => (
        <div key={g} className="mn-expr-step">
          {g > 0 && <span className="mn-join is-and">and</span>}
          <div className="mn-expr-group">
            {group.map((c, i) => (
              <span key={i} className="mn-expr-item">
                {i > 0 && <span className="mn-join">or</span>}
                <code className="mn-cond">{c.field}<i>{c.op}</i><b>{c.value}</b></code>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function MeteringDrawer({ ruleId, endpoints, onClose }: { ruleId: string; endpoints: Endpoint[]; onClose: () => void }) {
  const rule = RULES[ruleId]
  const [tab, setTab] = useState<'when' | 'rate'>('when')
  return (
    <Layer kind="drawer" onClose={onClose}>
      <aside className="og-drawer is-532">
        <PanelHead title="Metering rule" onClose={onClose} />
        <div className="og-drawer-body">
          <div className="mn-drawer-intro">
            <h2>{rule.name}</h2>
            <p>{rule.desc}</p>
            <div className="mn-chips">
              {endpoints.map((e) => (
                <span key={e.path} className="mn-ep-chip"><Method m={e.method} /><code>{e.path}</code></span>
              ))}
            </div>
          </div>
          <div className="og-seg mn-seg-fit" role="tablist">
            <button role="tab" aria-selected={tab === 'when'} onClick={() => setTab('when')}>Conditions</button>
            <button role="tab" aria-selected={tab === 'rate'} onClick={() => setTab('rate')}>Rate card</button>
          </div>
          {tab === 'when' ? (
            <div className="mn-panel">
              <p className="mn-panel-note">This rule applies when all of these are true:</p>
              <RuleExpression rule={rule} />
            </div>
          ) : (
            <RateCardView card={rule.rate} />
          )}
        </div>
      </aside>
    </Layer>
  )
}

/* ------------------------------------------------------------ endpoints */

/** Endpoints grouped under the product that provides them. Inside a package
    the last column says how each endpoint is priced; a product on its own
    has no price, so the column goes. */
export function EndpointTable({ productIds, rules, onRule }: {
  productIds: string[]
  rules?: string[]
  onRule?: (ruleId: string) => void
}) {
  const priced = !!rules
  const head = ['Method', 'Endpoint', 'Path', 'Description', ...(priced ? ['Pricing'] : [])]
  return (
    <div
      className="og-table mn-eps"
      style={{ gridTemplateColumns: `84px minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1.5fr)${priced ? ' 120px' : ''}` }}
    >
      {head.map((h) => <div key={h} className="og-th">{h}</div>)}
      {productIds.map((pid) => {
        const p = productById(pid)
        return (
          <div key={pid} className="og-tr">
            {productIds.length > 1 && (
              <div className="mn-group">
                <Ph_ name="Cube" size={14} />
                <b>{p.name}</b>
                <span>{plural(p.endpoints.length, 'endpoint')}</span>
                {p.access === 'restricted' && <span className="mn-group-lock"><Ph_ name="LockSimple" size={12} />Restricted</span>}
              </div>
            )}
            {p.endpoints.map((e) => (
              <div key={e.path + e.method} className="og-tr">
                <div className="og-td"><Method m={e.method} /></div>
                <div className="og-td"><span className="mn-ep-name">{e.name}</span></div>
                <div className="og-td"><code className="mn-path">{e.path}</code></div>
                <div className="og-td mn-muted">{e.desc}</div>
                {priced && (
                  <div className="og-td">
                    {e.rule && rules.includes(e.rule)
                      ? <button className="mn-rule-btn" onClick={() => onRule?.(e.rule!)}><Ph_ name="Gauge" size={14} />Metered</button>
                      : <span className="mn-muted">Default rate</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------ list toolbar */

export type View = 'table' | 'cards'

/** A list's toolbar: what is shown on the left; filter, search and (for lists
    that also have cards) the view switch on the right, all 32px tall. */
export function ListToolbar<T extends string>({ title, count, filter, view, onView, actions: extra }: {
  title: string
  actions?: React.ReactNode
  count: number
  filter: { label: string; options: { id: T; label: string; count: number }[]; value: T; onChange: (id: T) => void }
  view?: View
  onView?: (v: View) => void
}) {
  return (
    <div className="mn-toolbar">
      <h2 className="mn-h2">{title}<span className="og-count">{count}</span></h2>
      <div className="mn-toolbar-end">
        <FilterMenu {...filter} />
        <Search width={200} />
        {view && onView && <ViewSwitch view={view} onView={onView} />}
        {extra}
      </div>
    </div>
  )
}

export function ViewSwitch({ view, onView }: { view: View; onView: (v: View) => void }) {
  return (
    <div className="mn-view" role="radiogroup" aria-label="View">
      <button role="radio" aria-checked={view === 'table'} title="Table view" onClick={() => onView('table')}><Ph_ name="Rows" size={16} /></button>
      <button role="radio" aria-checked={view === 'cards'} title="Card view" onClick={() => onView('cards')}><Ph_ name="SquaresFour" size={16} /></button>
    </div>
  )
}

function FilterMenu<T extends string>({ label, options, value, onChange }: {
  label: string
  options: { id: T; label: string; count: number }[]
  value: T
  onChange: (id: T) => void
}) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLSpanElement>(null)
  useDismiss(open, wrap, () => setOpen(false))
  return (
    <span className="og-menu-wrap" ref={wrap}>
      <button className="mn-filter" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Ph_ name="Funnel" size={16} />
        <span>{label}:</span>
        <b>{options.find((o) => o.id === value)?.label}</b>
        <Ph_ name="CaretDown" size={12} />
      </button>
      {open && (
        <div className="og-menu mn-filter-menu" role="menu">
          {options.map((o) => (
            <button key={o.id} role="menuitemradio" aria-checked={o.id === value} onClick={() => { onChange(o.id); setOpen(false) }}>
              <span>{o.label}</span>
              <span className="mn-filter-count">{o.count}</span>
              <Ph_ name="Check" size={14} className="mn-filter-check" />
            </button>
          ))}
        </div>
      )}
    </span>
  )
}

/* ------------------------------------------------------------ packages table */

/** Packages as table rows; the cards are the alternative view. */
export function PackageTable({ packages }: { packages: Package[] }) {
  return (
    <div className="og-table mn-table" style={{ gridTemplateColumns: 'minmax(0, 2.4fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.7fr) minmax(0, 1fr) minmax(0, 0.9fr) 40px' }}>
      {['Package', 'Category', 'Contents', 'Rating', 'Starting at', 'Your apps', ''].map((h, i) => <div key={i} className="og-th">{h}</div>)}
      {packages.map((p) => {
        const inUse = APPS.filter((a) => a.packages.includes(p.id)).length
        return (
          <div key={p.id} className="og-tr ac-click" onClick={() => actions.openMon('packages', p.id)}>
            <div className="og-td og-who"><Tile icon="Package" size="sm" /><span className="og-two"><span>{p.name}</span><small>{p.desc}</small></span></div>
            <div className="og-td"><span className="mn-tag">{p.category}</span></div>
            <div className="og-td og-two"><span>{plural(p.products.length, 'product')}</span><small>{plural(endpointCount(p), 'endpoint')}</small></div>
            <div className="og-td"><span className="mn-rating"><Ph_ name="Star" size={13} weight="fill" />{p.rating}</span></div>
            <div className="og-td"><span className="mn-from">{p.from}{!p.from.includes('/') && <small>/ call</small>}</span></div>
            <div className="og-td">{inUse ? <span className="mn-inuse">{plural(inUse, 'app')}</span> : <span className="mn-muted">—</span>}</div>
            <div className="og-td og-td-icon"><Ph_ name="CaretRight" size={14} className="mn-muted" /></div>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------ package card */

export function PackageCard({ pkg, onOpen }: { pkg: Package; onOpen: () => void }) {
  const inUse = APPS.filter((a) => a.packages.includes(pkg.id)).length
  return (
    <button className="mn-card" onClick={onOpen}>
      <div className="mn-card-top">
        <Tile icon="Package" />
        {inUse > 0 && <span className="mn-inuse"><Ph_ name="SquaresFour" size={12} />In {inUse} {inUse === 1 ? 'app' : 'apps'}</span>}
      </div>
      <div className="mn-card-text">
        <h3>{pkg.name}</h3>
        <p>{pkg.desc}</p>
      </div>
      <div className="mn-card-meta">
        <span className="mn-rating"><Ph_ name="Star" size={13} weight="fill" />{pkg.rating}<small>({pkg.reviews})</small></span>
        <span className="mn-dot" />
        <span>{pkg.category}</span>
      </div>
      <div className="mn-card-foot">
        <span className="mn-from"><small className="is-pre">from</small>{pkg.from}{!pkg.from.includes('/') && <small>/ call</small>}</span>
        <span>{plural(endpointCount(pkg), 'endpoint')}</span>
      </div>
    </button>
  )
}

/* ------------------------------------------------------------ charts */

/** Tiny bar sparkline for table rows. */
export function Spark({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  return (
    <svg className="mn-spark" viewBox="0 0 90 24" preserveAspectRatio="none" aria-hidden>
      {data.map((v, i) => <rect key={i} x={i * 3} y={24 - (v / max) * 22 - 1} width="2" height={(v / max) * 22 + 1} rx="1" />)}
    </svg>
  )
}

/** Area chart for a 30-day series, with a light grid and day labels. */
export function AreaChart({ data, unit }: { data: number[]; unit: string }) {
  const max = Math.max(...data) * 1.15
  const pts = data.map((v, i) => [(i / (data.length - 1)) * 600, 200 - (v / max) * 200])
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('')
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((f) => Math.round((max * f) / 100) * 100)
  return (
    <div className="mn-chart">
      <div className="mn-chart-y">{ticks.map((t) => <span key={t}>{t.toLocaleString()}</span>)}</div>
      <div className="mn-chart-plot">
        <svg viewBox="0 0 600 200" preserveAspectRatio="none" aria-label={`Daily ${unit}`}>
          <defs>
            <linearGradient id="mn-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--ui-brand)" stopOpacity="0.18" />
              <stop offset="1" stopColor="var(--ui-brand)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 50, 100, 150].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} className="mn-grid-line" />)}
          <path d={`${line}L600 200L0 200Z`} fill="url(#mn-area)" />
          <path d={line} className="mn-line" />
        </svg>
        <div className="mn-chart-x">{[1, 5, 10, 15, 20, 25, 30].map((d) => <span key={d}>{d}</span>)}</div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ credentials */

export function SecretField({ label, value, secret }: { label: string; value: string; secret?: boolean }) {
  const [shown, setShown] = useState(!secret)
  const [copied, setCopied] = useState(false)
  return (
    <div className="mn-secret">
      <span className="mn-secret-label">{label}</span>
      <code>{shown ? value : value.slice(0, 8) + '•'.repeat(16)}</code>
      {secret && <button title={shown ? 'Hide' : 'Show'} onClick={() => setShown(!shown)}><Ph_ name={shown ? 'EyeSlash' : 'Eye'} size={16} /></button>}
      <button title="Copy" onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200) }}>
        <Ph_ name={copied ? 'Check' : 'Copy'} size={16} />
      </button>
    </div>
  )
}

export const StatusPill = ({ status }: { status: string }) => {
  const tone = { Approved: 'active', Paid: 'active', Pending: 'pending', Overdue: 'pending', Failed: 'locked', Disputed: 'invited' }[status] ?? 'invited'
  return <span className={`og-status is-${tone}`}>{status}</span>
}

/* ------------------------------------------------------------ settings card */

export type Field = { label: string; value: string; editable?: boolean; multiline?: boolean; wide?: boolean }

/** Settings card (Figma "Workspace Settings"): read-only label/value grid with
    Edit Details; editing turns editable values into inputs and swaps the
    action for Save / Cancel Changes. */
export function SettingsCard({ title, fields }: { title: string; fields: Field[] }) {
  const [editing, setEditing] = useState(false)
  const [values, setValues] = useState(fields.map((f) => f.value))
  const [draft, setDraft] = useState(values)
  return (
    <section className="mn-set">
      <header className="mn-set-head">
        <h2>{title}</h2>
        {editing ? (
          <span className="mn-set-actions">
            <button className="og-btn is-brand is-xs" onClick={() => { setValues(draft); setEditing(false) }}>Save Changes</button>
            <button className="og-btn is-tint is-xs" onClick={() => { setDraft(values); setEditing(false) }}>Cancel Changes</button>
          </span>
        ) : (
          <button className="ac-link" onClick={() => { setDraft(values); setEditing(true) }}><Ph_ name="PencilSimple" size={14} />Edit Details</button>
        )}
      </header>
      <dl className={`mn-set-grid ${editing ? 'is-editing' : ''}`}>
        {fields.map((f, i) => (
          <div key={f.label} className={f.wide ? 'is-wide' : ''}>
            <dt>{f.label}</dt>
            <dd>
              {editing && f.editable ? (
                f.multiline
                  ? <textarea className="mn-textarea" rows={3} value={draft[i]} onChange={(e) => setDraft(draft.map((v, j) => (j === i ? e.target.value : v)))} />
                  : <span className="og-input is-32"><input value={draft[i]} onChange={(e) => setDraft(draft.map((v, j) => (j === i ? e.target.value : v)))} /></span>
              ) : (
                values[i]
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
