import { useState } from 'react'
import { actions, useStore } from '../../store'
import { Ph_ } from '../../ui/Phosphor'
import { ArtItem, CardNavToggle, FigTree, FtLeaf, PageHero } from './parts'
import { Avatar, Dots, Layer, listArt, PanelHead, Search } from './Organisation'

/* API Access — Figma "Gateways" (84:41140, users drawer 115:25129 /
   168:41113) and "Gateways / Products" (85:45974, product drawer 85:46711 /
   85:47626 / 85:49216). Mock data copied from the boards. */

export function AccessTree() {
  const tab = useStore((s) => s.accessTab)
  return (
    <FigTree title="API Access">
      <FtLeaf leaf={{ id: 'gateways', label: 'Gateways', icon: 'SignOut' }} iconSize={16} accent active={tab === 'gateways'} onClick={() => actions.setAccessTab('gateways')} />
      <FtLeaf leaf={{ id: 'products', label: 'Products', icon: 'Cube' }} iconSize={16} accent active={tab === 'products'} onClick={() => actions.setAccessTab('products')} />
    </FigTree>
  )
}

/** Gateway vendor tabs shared by Gateways, Products and App Approval. */
export const VENDORS: [string, number][] = [['Apigee', 23], ['Kong', 3], ['Azure', 2], ['Nginx', 2], ['AWS', 12]]

export function VendorTabs() {
  const [v, setV] = useState(0)
  return (
    <div className="og-seg" role="tablist">
      {VENDORS.map(([name, n], i) => (
        <button key={name} role="tab" aria-selected={v === i} onClick={() => setV(i)}>{name}<span className="og-count">{n}</span></button>
      ))}
    </div>
  )
}

export const Tags = ({ items }: { items: string[] }) => (
  <div className="og-tags">{items.map((t, i) => <span key={i}>{t}</span>)}</div>
)

/* ------------------------------------------------------------ banner art */

const disc = (x: number, y: number, s: number, tint: 'blue' | 'green' | 'red' | 'orange'): ArtItem => ({
  k: 'disc', x, y, s, n: 'User',
  bg: { blue: '#e0f2ff', green: '#dff7e9', red: '#ffebe7', orange: '#fff5e5' }[tint],
  fg: { blue: '#0265dc', green: '#007a4d', red: '#d31510', orange: '#b14c00' }[tint],
})

const ART_GATEWAY: ArtItem[] = [
  { k: 'card', x: 12, y: 54, w: 110, h: 80, r: 0, c: [
    disc(13, 6.4, 21, 'blue'), disc(28.2, 6.4, 21, 'green'), disc(44.5, 6.4, 21, 'red'), disc(59.9, 6.4, 21, 'orange'),
    { k: 'disc', x: 76.5, y: 6.4, s: 21, bg: '#cb7253', fg: '#fdfcfc', t: '+7' },
    { k: 'hline', x: 13, y: 34, len: 84 },
    disc(13, 39.9, 13, 'blue'), disc(13, 55.5, 13, 'green'), disc(13, 71.1, 13, 'red'),
    { k: 'bar', x: 29, y: 44, w: 51, h: 5 }, { k: 'bar', x: 29, y: 59, w: 51, h: 5 }, { k: 'bar', x: 29, y: 75, w: 51, h: 5 },
    { k: 'icon', n: 'CheckCircle', x: 86, y: 41, s: 11, dim: true }, { k: 'icon', n: 'CheckCircle', x: 86, y: 57, s: 11, dim: true },
    { k: 'icon', n: 'CheckCircle', x: 86, y: 71, s: 11, dim: true },
  ] },
  { k: 'card', x: -20.5, y: 10, w: 174, h: 37, r: 5.7, strong: true, c: [
    { k: 'icon', n: 'DoorOpen', x: 11, y: 9, s: 19 },
    { k: 'vline', x: 38.5, y: 11, len: 15 },
    { k: 'img', x: 47.5, y: 6, w: 24, h: 24, src: '/portal/gateways/logo-1.png' },
    { k: 'img', x: 78.5, y: 9, w: 25, h: 19, src: '/portal/gateways/logo-2.png' },
    { k: 'img', x: 110.5, y: 7, w: 22, h: 22, src: '/portal/gateways/logo-3.png' },
    { k: 'icon', n: 'MagnifyingGlass', x: 145.5, y: 10, s: 16 },
  ] },
]

/* ------------------------------------------------------------ users drawer */

function UsersDrawer({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('')
  const [added, setAdded] = useState<boolean[]>([false, true, false, true, false])
  return (
    <Layer kind="drawer" onClose={onClose}>
      <aside className="og-drawer is-660">
        <PanelHead title="Users" onClose={onClose} />
        <div className="og-drawer-body is-tight">
          <label className="og-search is-block">
            <Ph_ name="MagnifyingGlass" size={16} />
            <input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
            {q && <button onClick={() => setQ('')} title="Clear"><Ph_ name="X" size={14} /></button>}
          </label>
          {q ? (
            <div className="ac-results">
              <p className="ac-results-title">Results for “{q}”</p>
              <div>
                {added.map((on, i) => (
                  <div key={i} className="ac-result">
                    <Avatar />
                    <span className="og-two"><span>Open Banking</span><small>Open banking partner</small></span>
                    <button
                      className={`ac-pill ${on ? 'is-remove' : 'is-add'}`}
                      onClick={() => setAdded(added.map((v, j) => (j === i ? !v : v)))}
                    >
                      {on ? 'Remove' : 'Add'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="og-table" style={{ gridTemplateColumns: '234fr 129fr 234fr 40px' }}>
              {['User', 'Added On', 'Associations', ''].map((h, i) => <div key={i} className="og-th">{h}</div>)}
              {Array.from({ length: 11 }, (_, i) => (
                <div key={i} className="og-tr">
                  <div className="og-td og-who"><Avatar /><span className="og-two"><span>Open Banking</span><small>Open banking partner</small></span></div>
                  <div className="og-td">23 Oct, 2024</div>
                  <div className="og-td"><Tags items={['Trusted Partner', 'Internal', '+3']} /></div>
                  <div className="og-td og-td-icon"><Dots /></div>
                </div>
              ))}
            </div>
          )}
        </div>
        <footer className="og-panel-foot">
          <button className="og-btn is-brand is-block" onClick={onClose}>Save Changes</button>
        </footer>
      </aside>
    </Layer>
  )
}

/* ------------------------------------------------------------ gateways */

function Gateways() {
  const [users, setUsers] = useState(false)
  return (
    <>
      <PageHero art={ART_GATEWAY} title="Gateways" sub="Map users and organisations to the API gateways they can access." />
      <div className="pg-body og-body og-stack">
        <div className="og-toolbar">
          <VendorTabs />
          <div className="og-toolbar-end">
            <Search width={142} />
            <button className="og-btn is-tint"><Ph_ name="ArrowsClockwise" size={16} />Sync</button>
          </div>
        </div>
        <div className="og-table is-compact" style={{ gridTemplateColumns: '324fr 324fr 185fr 324fr 40px' }}>
          {['Organisation Name', 'Environments', 'Type', 'Associated Users', ''].map((h, i) => <div key={i} className="og-th">{h}</div>)}
          {Array.from({ length: 11 }, (_, i) => (
            <div key={i} className="og-tr">
              <div className="og-td ac-name">apiwiz-nonprod{i === 3 && <span className="og-status is-invited">Default</span>}</div>
              <div className="og-td"><Tags items={['apiwiz-test-env', 'apiwiz-test']} /></div>
              <div className="og-td">On Prem</div>
              <div className="og-td">
                <span className="ac-stack">
                  <span>A</span><span>A</span>
                  {i === 0
                    ? <span>+7</span>
                    : <button className="is-add" onClick={() => setUsers(true)} title="Manage users"><Ph_ name="UserPlus" size={12} /></button>}
                </span>
              </div>
              <div className="og-td og-td-icon"><Dots /></div>
            </div>
          ))}
        </div>
      </div>
      {users && <UsersDrawer onClose={() => setUsers(false)} />}
    </>
  )
}

/* ------------------------------------------------------------ products */

function Field({ label, placeholder, children }: { label: string; placeholder?: string; children?: React.ReactNode }) {
  return (
    <div className="ac-field">
      <span className="ac-label">{label}</span>
      {children ?? <label className="og-input is-32"><input placeholder={placeholder} /></label>}
    </div>
  )
}

function ProductDrawer({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<0 | 1>(0)
  const [linkOpen, setLinkOpen] = useState(false)
  const [subs, setSubs] = useState(true)
  const [swagger, setSwagger] = useState<string | null>(null)
  const [menu, setMenu] = useState(false)
  return (
    <Layer kind="drawer" onClose={onClose}>
      <aside className="og-drawer is-532">
        <header className="og-panel-head">
          <nav className="ac-crumbs">
            <button aria-current={step === 0 || undefined} onClick={() => setStep(0)}>Product Details</button>
            <Ph_ name="CaretRight" size={13} />
            <button aria-current={step === 1 || undefined} onClick={() => setStep(1)}>Select Swagger</button>
          </nav>
          <button onClick={onClose} title="Close"><Ph_ name="X" size={16} /></button>
        </header>
        <div className="og-drawer-body">
          {step === 0 ? (
            <div className="ac-form">
              <Field label="Product Name" placeholder="Enter Name" />
              <Field label="Description" placeholder="Enter Description" />
              <div className={`ac-box ${linkOpen ? 'is-open' : ''}`}>
                <div className="ac-box-row">
                  <span className="ac-label">External Links</span>
                  <button className="ac-link" onClick={() => setLinkOpen(true)}><Ph_ name="Link" size={16} />Add External Link</button>
                </div>
                {linkOpen && (
                  <>
                    <div className="ac-pair">
                      <label className="og-input is-32"><Ph_ name="MagnifyingGlass" size={16} /><input placeholder="Name" /></label>
                      <label className="og-input is-32"><Ph_ name="MagnifyingGlass" size={16} /><input placeholder="Link" /></label>
                    </div>
                    <label className="og-input is-32"><Ph_ name="MagnifyingGlass" size={16} /><input placeholder="Description" /></label>
                    <div className="ac-box-actions">
                      <button className="ac-link" onClick={() => setLinkOpen(false)}>Save</button>
                      <button className="ac-link" onClick={() => setLinkOpen(false)}>Cancel</button>
                    </div>
                  </>
                )}
              </div>
              <button className="ac-box ac-check" role="checkbox" aria-checked={subs} onClick={() => setSubs(!subs)}>
                <Ph_ name={subs ? 'CheckSquare' : 'Square'} size={22} />
                <span>
                  <b>Enable Subscriptions</b>
                  <small>On checking this option, developers are required to select a subscription during the app creation process for this product.</small>
                </span>
              </button>
            </div>
          ) : (
            <Field label="Select Swagger">
              <span className="og-menu-wrap">
                <button className="og-input is-32 ac-select" onClick={() => setMenu(!menu)}>
                  <span className={swagger ? '' : 'is-placeholder'}>{swagger ?? 'Swagger'}</span>
                  <Ph_ name="CaretDown" size={14} />
                </button>
                {menu && (
                  <span className="og-menu">
                    {['Billing API v2', 'Payments API', 'Accounts API'].map((s) => (
                      <button key={s} aria-current={swagger === s || undefined} onClick={() => { setSwagger(s); setMenu(false) }}>{s}</button>
                    ))}
                  </span>
                )}
              </span>
            </Field>
          )}
        </div>
        <footer className="og-panel-foot">
          {step === 0
            ? <button className="og-btn is-brand is-block" onClick={() => setStep(1)}>Next</button>
            : <button className="og-btn is-brand is-block" onClick={onClose}>Save &amp; Continue</button>}
        </footer>
      </aside>
    </Layer>
  )
}

function Products() {
  const [editing, setEditing] = useState(false)
  return (
    <>
      <PageHero art={listArt('Cube', ['FileText', 'BookOpenText', 'User'])} title="Products" sub="Package and monetise APIs into products that users can discover and subscribe to." />
      <div className="pg-body og-body og-stack">
        <div className="og-toolbar">
          <VendorTabs />
          <Search width={142} />
        </div>
        <div className="og-table" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr)) 40px' }}>
          {['Product Name', 'Swagger', ''].map((h, i) => <div key={i} className="og-th">{h}</div>)}
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="og-tr ac-click" onClick={() => setEditing(true)}>
              <div className="og-td og-two"><span>apiwiz-nonprod</span><small>User_name</small></div>
              <div className="og-td"><Tags items={['apiwiz-test-env', 'apiwiz-test']} /></div>
              <div className="og-td og-td-icon" onClick={(e) => e.stopPropagation()}><Dots /></div>
            </div>
          ))}
        </div>
      </div>
      {editing && <ProductDrawer onClose={() => setEditing(false)} />}
    </>
  )
}

export function AccessPage() {
  const tab = useStore((s) => s.accessTab)
  return (
    <div className="p-scroll pg">
      <CardNavToggle />
      {tab === 'gateways' ? <Gateways /> : <Products />}
    </div>
  )
}
