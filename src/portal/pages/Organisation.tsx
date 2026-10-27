import { useState } from 'react'
import { createPortal } from 'react-dom'
import { actions, useStore } from '../../store'
import { Ph_ } from '../../ui/Phosphor'
import { ArtItem, CardNavToggle, FigTree, FtLeaf, PageHero } from './parts'

/* Organisation — Figma "All Teams" (79:23987), "Invite Users" (79:28503),
   "Roles" (81:32774 + modal 130:36094), "Partner Group" (81:29418) and
   "Companies" (81:31788). Mock data copied from the boards. */

type Tab = 'team' | 'roles' | 'partners' | 'companies'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'team', label: 'Team', icon: 'UsersThree' },
  { id: 'roles', label: 'Roles & Access', icon: 'UserCircleGear' },
  { id: 'partners', label: 'Partner Groups', icon: 'Users' },
  { id: 'companies', label: 'Companies', icon: 'Buildings' },
]

export function OrgTree() {
  const tab = useStore((s) => s.orgTab)
  return (
    <FigTree title="Manage Teams" actions={<button className="ft-head-btn" title="Add"><Ph_ name="Plus" size={16} /></button>}>
      {TABS.map((t) => (
        <FtLeaf key={t.id} leaf={{ id: t.id, label: t.label, icon: t.icon }} iconSize={16} accent active={tab === t.id} onClick={() => actions.setOrgTab(t.id)} />
      ))}
    </FigTree>
  )
}

/* ------------------------------------------------------------ banners */

const raised = (x: number, y: number, w: number, h: number, r: number, c: ArtItem[], strong = false): ArtItem =>
  ({ k: 'card', x, y, w, h, r, c, strong })
const bar = (x: number, y: number, w: number, h: number): ArtItem => ({ k: 'bar', x, y, w, h })
const icon = (n: string, x: number, y: number, s: number, dim = false): ArtItem => ({ k: 'icon', n, x, y, s, dim })

const ART_TEAM: ArtItem[] = [
  raised(49, 11, 36, 36, 36, [icon('UsersThree', 5, 5, 25)], true),
  raised(-11, 53, 156, 28, 5.7, [icon('UserCircle', 21, 6, 17), bar(53, 10, 66, 7), icon('PencilSimpleLine', 129, 7, 13)]),
  raised(13, 86, 110, 22, 4.6, [icon('UserCircle', 14, 4, 13), bar(36, 8, 46, 6), icon('PencilSimpleLine', 93, 6, 9)]),
  raised(24, 112, 88, 16, 3.2, [icon('UserCircle', 12, 4, 8), bar(30, 6, 28, 4), icon('PencilSimpleLine', 72, 3, 9)]),
]

/** Partner Groups and Companies share a layout: a header tile over a list
    of three rows strung on a vertical connector. */
export const listArt = (head: string, rows: [string, string, string]): ArtItem[] => [
  { k: 'vline', x: 24, y: 53, len: 61 },
  raised(-17.8, 13, 168.6, 40, 6.1, [icon(head, 30.4, 7.6, 24.9), bar(64.3, 8.6, 41.5, 7.7), bar(64.3, 21.6, 71.4, 7.6)], true),
  ...[0, 1, 2].flatMap((i): ArtItem[] => {
    const y = [64, 85, 106][i]
    return [icon('Circle', 20, y + 3, 9, true), icon(rows[i], 34, y, 15), bar(54, y + 5, 59, 6)]
  }),
]

const ART_ACCESS: ArtItem[] = [
  { k: 'card', x: 9, y: 47, w: 116, h: 81, r: 4.6, c: [
    ...[40, 60, 80, 100].map((x): ArtItem => ({ k: 'vline', x, y: 4, len: 75 })),
    { k: 'hline', x: 0, y: 17, len: 116 },
    icon('BookOpen', 47, 6, 7), icon('Code', 67, 6, 7), icon('GearSix', 87, 6, 7), icon('ChartLine', 107, 6, 7),
    ...[22, 37, 52, 67].flatMap((y, r): ArtItem[] => [
      icon('User', 1, y, 11), bar(17, y + 3, 16, 5),
      ...[48, 68, 88, 108].map((x, c): ArtItem => icon((r + c) % 3 === 2 ? 'CircleDashed' : 'Circle', x, y + 3, 6, true)),
    ]),
  ] },
  raised(-11, 10, 156, 37, 5.7, [icon('UserCircleGear', 17, 7, 23), bar(53, 8, 38.4, 7.1), bar(53, 20, 66, 7)], true),
]

/* ------------------------------------------------------------ shared bits */

export function Search({ width }: { width: number }) {
  return (
    <label className="og-search" style={{ width }}>
      <Ph_ name="MagnifyingGlass" size={16} />
      <input placeholder="Search" />
    </label>
  )
}

export const Avatar = () => <span className="og-avatar">A</span>
export const Dots = () => <button className="og-dots" title="More"><Ph_ name="DotsThreeVertical" size={20} weight="bold" /></button>

/** Overlay + panel, rendered at the document root so it covers the portal
    chrome exactly like the Figma boards (40% black + 12px backdrop blur). */
export function Layer({ children, onClose, kind }: { children: React.ReactNode; onClose: () => void; kind: 'drawer' | 'modal' }) {
  return createPortal(
    <div className={`pg og-layer is-${kind}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      {children}
    </div>,
    document.body,
  )
}

export function PanelHead({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <header className="og-panel-head">
      <span>{title}</span>
      <button onClick={onClose} title="Close"><Ph_ name="X" size={16} /></button>
    </header>
  )
}

/* ------------------------------------------------------------ team */

type Status = 'Pending Approval' | 'Active' | 'Invited' | 'Locked'
const STATUS_ORDER: Status[] = ['Pending Approval', 'Active', 'Active', 'Active', 'Invited', 'Locked', 'Active']
const MEMBERS = Array.from({ length: 12 }, (_, i) => ({ email: 'lavanya@apiwiz.com', role: 'Site Admin', status: STATUS_ORDER[i % STATUS_ORDER.length] }))
const FILTERS: { label: string; count: number; match?: Status }[] = [
  { label: 'All Members', count: 23 },
  { label: 'Pending Approval', count: 3, match: 'Pending Approval' },
  { label: 'Invited', count: 2, match: 'Invited' },
  { label: 'Locked', count: 2, match: 'Locked' },
]

const STATS = [
  { icon: 'SignIn', label: 'Sign Ups', value: 0 },
  { icon: 'Users', label: 'Active Users', value: 4 },
  { icon: 'UserCircleMinus', label: 'Inactive Users', value: 4 },
]

function InviteDrawer({ onClose }: { onClose: () => void }) {
  const [emails, setEmails] = useState(['devesh@mail.com', 'anurag@mail.com', 'raj@mail.com'])
  const [roles, setRoles] = useState<Record<string, string>>({})
  const [draft, setDraft] = useState('')
  const [menu, setMenu] = useState<string | null>(null)
  const add = () => {
    const v = draft.trim()
    if (v && !emails.includes(v)) setEmails([...emails, v])
    setDraft('')
  }
  return (
    <Layer kind="drawer" onClose={onClose}>
      <aside className="og-drawer">
        <PanelHead title="Invite Team Members" onClose={onClose} />
        <div className="og-drawer-body">
          <section className="og-invite">
            <div>
              <p className="og-invite-title">Enter Email Address</p>
              <p className="og-invite-sub">To get started, log in with your GitHub account</p>
            </div>
            <label className="og-input">
              <Ph_ name="EnvelopeSimple" size={16} />
              <input
                placeholder="Email Addresses"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && add()}
              />
            </label>
            <div className="og-invitees">
              {emails.map((m) => (
                <div key={m} className="og-invitee">
                  <span className="og-chip">
                    {m}
                    <button onClick={() => setEmails(emails.filter((x) => x !== m))} title="Remove"><Ph_ name="X" size={12} /></button>
                  </span>
                  <span className="og-menu-wrap">
                    <button className="og-chip" onClick={() => setMenu(menu === m ? null : m)}>
                      {roles[m] ?? 'Select Role Type'}<Ph_ name="CaretDown" size={12} />
                    </button>
                    {menu === m && (
                      <span className="og-menu">
                        {['Site Admin', 'Editor', 'Viewer'].map((r) => (
                          <button key={r} aria-current={roles[m] === r || undefined} onClick={() => { setRoles({ ...roles, [m]: r }); setMenu(null) }}>{r}</button>
                        ))}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <footer className="og-panel-foot">
          <button className="og-btn is-brand is-block" onClick={onClose}><Ph_ name="EnvelopeSimple" size={16} />Send Invite</button>
        </footer>
      </aside>
    </Layer>
  )
}

function Team() {
  const [filter, setFilter] = useState(0)
  const [inviting, setInviting] = useState(false)
  const match = FILTERS[filter].match
  const rows = match ? MEMBERS.filter((m) => m.status === match) : MEMBERS
  return (
    <>
      <PageHero art={ART_TEAM} title="Teams" sub="Manage the people in your organisation and their access to the portal." />
      <div className="pg-body og-body og-gap-40">
        <div className="og-stats">
          {STATS.map((s) => (
            <div key={s.label} className="og-stat">
              <div className="ov-card-title">
                <span className="ov-icon-box"><Ph_ name={s.icon} size={24} /></span>
                <div><p className="ov-card-label">{s.label}</p><p className="ov-card-count">{s.value}</p></div>
              </div>
              <span className="og-trend">-100% vs last month</span>
            </div>
          ))}
        </div>
        <div className="og-stack">
          <div className="og-toolbar">
            <div className="og-seg" role="tablist">
              {FILTERS.map((f, i) => (
                <button key={f.label} role="tab" aria-selected={filter === i} onClick={() => setFilter(i)}>
                  {f.label}<span className="og-count">{f.count}</span>
                </button>
              ))}
            </div>
            <div className="og-toolbar-end">
              <Search width={142} />
              <button className="og-btn is-tint" onClick={() => setInviting(true)}><Ph_ name="UserPlus" size={16} />Invite</button>
            </div>
          </div>
          <div className="og-table" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr)) 40px' }}>
            {['Member', 'Invitee', 'Status', 'Partner Group', ''].map((h, i) => <div key={i} className="og-th">{h}</div>)}
            {rows.map((m, i) => (
              <div key={i} className="og-tr">
                <div className="og-td og-two"><span>{m.email}</span><small>{m.role}</small></div>
                <div className="og-td og-two"><span>{m.email}</span><small>{m.role}</small></div>
                <div className="og-td"><span className={`og-status is-${m.status.split(' ')[0].toLowerCase()}`}>{m.status}</span></div>
                <div className="og-td og-tags"><span>Trusted Partner</span><span>Internal</span></div>
                <div className="og-td og-td-icon"><Dots /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {inviting && <InviteDrawer onClose={() => setInviting(false)} />}
    </>
  )
}

/* ------------------------------------------------------------ roles */

const PERMS = ['Sync', 'List', 'Create', 'Read', 'Delete', 'Update']
const MATRIX = ['011111', '110111', '111001', '101111', '111111', '010101', '111111', '001101', '111011']
const ROLES = MATRIX.map((m, i) => ({ name: i === 1 ? 'name_role' : 'Open Banking', perms: [...m].map((c) => c === '1') }))

function RoleModal({ onClose }: { onClose: () => void }) {
  return (
    <Layer kind="modal" onClose={onClose}>
      <div className="og-modal" role="dialog" aria-label="Role Permissions">
        <PanelHead title="Role Permissions" onClose={onClose} />
        <div className="og-modal-body">
          {['Enter Role Name', 'Enter Role Description', 'Enter Role Code'].map((p) => (
            <label key={p} className="og-input is-32"><input placeholder={p} /></label>
          ))}
          <div className="og-modal-actions">
            <button className="og-btn is-tint" onClick={onClose}>Cancel</button>
            <button className="og-btn is-brand" onClick={onClose}>Save</button>
          </div>
        </div>
      </div>
    </Layer>
  )
}

function Roles() {
  const [roles, setRoles] = useState(ROLES)
  const [sel, setSel] = useState(1)
  const [creating, setCreating] = useState(false)
  const toggle = (r: number, p: number) =>
    setRoles(roles.map((x, i) => (i === r ? { ...x, perms: x.perms.map((v, j) => (j === p ? !v : v)) } : x)))
  return (
    <>
      <PageHero art={ART_ACCESS} title="Roles & Access" sub="Define roles and control which features each user can access." />
      <div className="pg-body og-body og-stack">
        <div className="og-toolbar">
          <Search width={142} />
          <button className="og-btn is-tint" onClick={() => setCreating(true)}><Ph_ name="Plus" size={16} />Create Role</button>
        </div>
        <div className="og-table og-roles" style={{ gridTemplateColumns: `240px 40px minmax(0, 1fr) repeat(${PERMS.length}, 80px)` }}>
          <div className="og-th is-side">Role</div>
          <div className="og-th is-side is-split" />
          <div className="og-th">{roles[sel].name}<Ph_ name="CaretRight" size={14} />Features</div>
          {PERMS.map((p) => <div key={p} className="og-th is-center">{p}</div>)}
          {roles.map((r, i) => (
            <div key={i} className="og-tr" aria-selected={sel === i} onClick={() => setSel(i)}>
              <div className="og-td is-side og-who"><Avatar /><span className="og-two"><span>{r.name}</span><small>Open banking partner</small></span></div>
              <div className="og-td is-side is-split og-td-icon"><Dots /></div>
              <div className="og-td og-two"><span className="og-feature">Activity</span><small>Description of the feature comes here</small></div>
              {r.perms.map((on, j) => (
                <div key={j} className="og-td is-center">
                  <button
                    className="og-check"
                    role="checkbox"
                    aria-checked={on}
                    aria-label={`${PERMS[j]} for ${r.name}`}
                    onClick={(e) => { e.stopPropagation(); toggle(i, j) }}
                  >
                    {on && <Ph_ name="Check" size={12} weight="bold" />}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {creating && <RoleModal onClose={() => setCreating(false)} />}
    </>
  )
}

/* ------------------------------------------------------------ partners / companies */

function Directory({ kind }: { kind: 'partners' | 'companies' }) {
  const partners = kind === 'partners'
  const cols = partners ? ['Partner Name', 'Display Name', 'Is Default?'] : ['Partner Name', 'Display Name', '']
  return (
    <>
      <PageHero
        art={partners ? listArt('UsersFour', ['Users', 'Users', 'Users']) : listArt('Buildings', ['UsersThree', 'Cube', 'ShieldCheck'])}
        title={partners ? 'Partner Groups' : 'Company'}
        sub={partners
          ? 'Organise partners into groups and manage their access to APIs and resources.'
          : 'Manage your organisation’s profile, configuration, and account details.'}
      />
      <div className="pg-body og-body og-stack">
        <div className="og-toolbar">
          <Search width={partners ? 208 : 142} />
          <button className="og-btn is-tint"><Ph_ name="ArrowsClockwise" size={16} />{partners ? 'Sync Partners' : 'Sync Companies'}</button>
        </div>
        <div className="og-table" style={{ gridTemplateColumns: partners ? 'repeat(3, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr)) 40px' }}>
          {cols.map((h, i) => <div key={i} className="og-th">{h}</div>)}
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="og-tr">
              <div className="og-td og-who"><Avatar /><span className="og-two"><span>Open Banking</span><small>Open banking partner</small></span></div>
              <div className="og-td">Display_name</div>
              {partners ? <div className="og-td">No</div> : <div className="og-td og-td-icon"><Dots /></div>}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------ page */

export function OrganisationPage() {
  const tab = useStore((s) => s.orgTab)
  return (
    <div className="p-scroll pg">
      <CardNavToggle />
      {tab === 'team' && <Team />}
      {tab === 'roles' && <Roles />}
      {tab === 'partners' && <Directory kind="partners" />}
      {tab === 'companies' && <Directory kind="companies" />}
    </div>
  )
}
