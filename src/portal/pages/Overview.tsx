import { useState } from 'react'
import { Ph_ } from '../../ui/Phosphor'

/* Overview dashboard — a static replica of Figma "Overview" (node 28:12833).
   All data below is mock content copied from the design. */

const ASSET = '/portal/overview'

/* ------------------------------------------------------------ shared bits */

function CardHead({ icon, label, count, action = 'View All', children }: {
  icon: string
  label: string
  count?: React.ReactNode
  action?: string
  children?: React.ReactNode
}) {
  return (
    <header className="ov-card-head">
      <div className="ov-card-title">
        <span className="ov-icon-box"><Ph_ name={icon} size={24} /></span>
        <div>
          <p className="ov-card-label">{label}</p>
          <div className="ov-card-count">{count}{children}</div>
        </div>
      </div>
      <button className="ov-btn-xs">{action}</button>
    </header>
  )
}

function SectionHead({ icon, title, sub, children }: {
  icon: string
  title: string
  sub: string
  children?: React.ReactNode
}) {
  return (
    <header className="ov-card-head">
      <div className="ov-card-title">
        <span className="ov-icon-box"><Ph_ name={icon} size={24} /></span>
        <div className="ov-section-text">
          <p className="ov-h2">{title}</p>
          <p className="ov-body-m">{sub}</p>
        </div>
      </div>
      {children}
    </header>
  )
}

const Badge = ({ children }: { children: React.ReactNode }) => <span className="ov-badge">{children}</span>

/* ------------------------------------------------------- getting started */

const STEPS = [
  { icon: 'CloudArrowUp', title: 'Setup Guides & References', sub: 'Your documentation content will be managed through this repo', done: false },
  { icon: 'PaintBrushBroad', title: 'Customise your workspace', sub: 'Change the name, theme, domain of your workspace', done: true },
  { icon: 'UserPlus', title: 'Invite Team Members', sub: 'Grow your team by inviting them to the workspace and improve collaboration', done: false },
]

function GettingStarted() {
  const [step, setStep] = useState(0)
  return (
    <section className="ov-start">
      <div className="ov-start-head">
        <div>
          <h1 className="ov-h1">Getting Started With Docuwiz</h1>
          <p className="ov-body-l">A complete snapshot of your documentation workspace.</p>
        </div>
        <div className="ov-actions">
          <button className="ov-btn ov-btn-text">Skip Onboarding</button>
          <button className="ov-btn ov-btn-tint">I’ll Do It Later</button>
        </div>
      </div>
      <div className="ov-start-body">
        <div className="ov-steps">
          {STEPS.map((s, i) => (
            <button key={s.title} className="ov-step" aria-current={step === i || undefined} onClick={() => setStep(i)}>
              <span className="ov-step-icon"><Ph_ name={s.icon} size={28} /></span>
              <span className="ov-step-text">
                <span className="ov-step-title">
                  <span>{s.title}</span>
                  {s.done
                    ? <Ph_ name="CheckCircle" size={16} className="ov-ic-success" />
                    : <Ph_ name="CircleDashed" size={16} />}
                </span>
                <span className="ov-step-sub">{s.sub}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="ov-drop">
          <span className="ov-drop-icon"><Ph_ name="FileArrowUp" size={30} /></span>
          <div className="ov-drop-text">
            <p className="ov-action-s">Drag and drop your spec file. We'll handle the rest.</p>
            <p className="ov-xs ov-fg-4">
              Supports .yaml and .json formats — no configs required. <a className="ov-fg-1">Browse Files.</a>
            </p>
          </div>
          <div className="ov-or"><i />OR<i /></div>
          <button className="ov-btn ov-btn-text">Connect Source Control</button>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- list cards */

type Doc = { title: string; meta: string; status: 'Draft' | 'Published'; when: string }

const GUIDES: Doc[] = [
  { title: 'Quick Start Guide', meta: '5 pages', status: 'Draft', when: '4 hours ago' },
  { title: 'Authentication & API Keys', meta: '5 pages', status: 'Draft', when: '4 hours ago' },
  { title: 'Quick Start Guide', meta: '5 pages', status: 'Draft', when: '1 month ago' },
  { title: 'Rate Limiting & Quotas', meta: '5 pages', status: 'Draft', when: '1 month ago' },
]
const APIS: Doc[] = [
  { title: 'Users API', meta: '5 endpoints', status: 'Draft', when: '4 hours ago' },
  { title: 'Billing API', meta: '5 endpoints', status: 'Draft', when: '4 hours ago' },
  { title: 'Quick Start Guide', meta: '5 endpoints', status: 'Draft', when: '1 month ago' },
  { title: 'Rate Limiting & Quotas', meta: '5 endpoints', status: 'Published', when: '6 Jan 2026' },
]

function DocCard({ icon, label, items }: { icon: string; label: string; items: Doc[] }) {
  return (
    <article className="ov-card">
      <CardHead icon={icon} label={label} count="12" />
      <div className="ov-card-body ov-doclist">
        <p className="ov-list-title">Recently Edited</p>
        {items.map((d, i) => (
          <a key={i} className="ov-doc">
            <span className="ov-tile"><Ph_ name={icon} size={16} /></span>
            <span className="ov-doc-main">
              <span className="ov-doc-name">{d.title}<Ph_ name="CaretRight" size={12} className="ov-caret" /></span>
              <span className="ov-doc-meta">
                <span className="ov-doc-tags">{d.meta}<Badge>{d.status}</Badge></span>
                <span>{d.when}</span>
              </span>
            </span>
          </a>
        ))}
      </div>
    </article>
  )
}

const RECIPES = [
  ['Secure Access for Banking Users', 'Step-by-Step Guide to Secure User Access in Banking'],
  ['User Authentication in Banking Systems', 'Implementing User Authentication Strategies for Banks'],
  ['Financial Services', 'Authentication Methods for Banking Applications'],
  ['Authentication Protocols in Banking', 'Best Practices for User Authentication in Banking'],
  ['Flow Techniques for Secure Banking', 'A Robust User Authentication Framework for Banks'],
]

function RecipeCard() {
  return (
    <article className="ov-card">
      <CardHead icon="Cube" label="Recipe" count="12" />
      <div className="ov-recipes">
        {RECIPES.map(([t, s]) => (
          <a key={t} className="ov-recipe">
            <span className="ov-recipe-text">
              <span className="ov-doc-name">{t}</span>
              <span className="ov-xs ov-fg-2">{s}</span>
            </span>
            <span className="ov-recipe-meta">
              <span><Ph_ name="FileText" size={12} />11 Pages</span>
              <span><Ph_ name="BracketsCurly" size={12} />2 Endpoints</span>
            </span>
          </a>
        ))}
      </div>
    </article>
  )
}

const MEMBERS: { role: string; invited?: boolean }[] = [
  { role: 'Owner' }, { role: 'Editor' }, { role: 'Guest' }, { role: 'Invited', invited: true },
]

function TeamCard() {
  return (
    <article className="ov-card ov-team">
      <CardHead icon="Users" label="Team Members" count="5" action="Manage">
        <span className="ov-pill ov-pill-warn">1 pending</span>
      </CardHead>
      <div className="ov-team-body">
        <p className="ov-list-title">Members</p>
        {MEMBERS.map((m, i) => (
          <div key={i} className="ov-member">
            <span className="ov-avatar">JD</span>
            <span className="ov-member-text">
              <b>Jane Doe</b>
              <span>jane@acme.io</span>
            </span>
            <span className={`ov-pill ov-pill-sm ${m.invited ? 'ov-pill-warn' : ''}`}>
              {m.invited && <Ph_ name="EnvelopeSimple" size={12} />}
              {m.role}
            </span>
          </div>
        ))}
        <div className="ov-seats">
          <span className="ov-avatar ov-avatar-28"><Ph_ name="UserPlus" size={16} /></span>
          <span className="ov-seats-text">1 user seat remaining</span>
          <a className="ov-upgrade"><Ph_ name="CrownSimple" size={12} />Upgrade to add more</a>
        </div>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------- activity */

type Chip = { icon: string; label: string }
type Act = { who: string; initials: string; verb: string; chips: (Chip | string)[]; rev?: string; when: string }

const ACTIVITY: Act[] = [
  { who: 'Avery Lane', initials: 'JD', verb: 'created', chips: [{ icon: 'BracketsCurly', label: 'Twitter API V2' }], when: '4 hours ago' },
  { who: 'Jordan Hill', initials: 'JD', verb: 'unpublished', chips: [{ icon: 'BookOpenText', label: 'API Use Cases' }], rev: 'Revision 1', when: '8 Oct 2025 . 05:25 PM' },
  { who: 'Casey Ridge', initials: 'CR', verb: 'published', chips: [{ icon: 'BookOpenText', label: 'API Use Cases' }], rev: 'Revision 1', when: '8 Oct 2025 . 05:25 PM' },
  { who: 'Taylor Brook', initials: 'TB', verb: 'deleted', chips: [{ icon: 'BookOpenText', label: 'Docuwiz Intro Guide' }], when: '8 Oct 2025 . 05:25 PM' },
  { who: 'Morgan Field', initials: 'JD', verb: 'renamed', chips: [{ icon: 'BookOpenText', label: 'Intro Guide' }, 'to', { icon: 'BookOpenText', label: 'Quick Start Guide' }], when: '8 Oct 2025 . 05:25 PM' },
  { who: 'Skylar Grove', initials: 'JD', verb: 'added page', chips: [{ icon: 'FileText', label: 'Docs as code simplified page' }, 'to', { icon: 'BookOpen', label: 'Docuwiz Platform Guide' }], when: '8 Oct 2025 . 05:25 PM' },
  { who: 'Quinn Meadow', initials: 'JD', verb: 'created', chips: [{ icon: 'FileText', label: 'Quick Start Guide' }], when: '8 Oct 2025' },
  { who: 'Riley Park', initials: 'JD', verb: 'created', chips: [{ icon: 'FileText', label: 'Quick Start Guide' }], when: '8 Oct 2025' },
]

function Select({ icon, value }: { icon: string; value: string }) {
  return (
    <button className="ov-select">
      <Ph_ name={icon} size={16} />
      <span>{value}</span>
      <Ph_ name="CaretDown" size={14} />
    </button>
  )
}

function ActivityCard() {
  return (
    <article className="ov-card ov-activity">
      <span className="ov-timeline" aria-hidden />
      <SectionHead icon="FileText" title="Recent Activity" sub="Get a birds’ eye view of your workspace">
        <div className="ov-actions">
          <Select icon="CalendarBlank" value="8 Oct 2025" />
          <Select icon="User" value="All" />
        </div>
      </SectionHead>
      <div className="ov-acts">
        {ACTIVITY.map((a, i) => (
          <div key={i} className="ov-act">
            <div className="ov-act-main">
              <span className="ov-avatar ov-avatar-xs">{a.initials}</span>
              <span className="ov-act-text">
                <b>{a.who}</b>
                <span>{a.verb}</span>
                {a.chips.map((c, j) =>
                  typeof c === 'string'
                    ? <span key={j}>{c}</span>
                    : <span key={j} className="ov-chip"><Ph_ name={c.icon} size={12} />{c.label}</span>,
                )}
                {a.rev && <><span className="ov-dot">•</span><span className="ov-fg-3">{a.rev}</span></>}
              </span>
            </div>
            <span className="ov-act-when">{a.when}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

/* ----------------------------------------------------------- categories */

const CATEGORIES = [
  'Webhook Setup', 'User Authentication', 'Billing Integration', 'Payment Gateway',
  'Invoice Management', 'Subscription Services', 'Online Learning Programs',
]
const CAT_GUIDES: { title: string; rev?: 'approved' | 'draft'; when: string }[] = [
  { title: 'Quick Start Guide', rev: 'approved', when: '4 hours ago' },
  { title: 'Authentication & API Keys', when: '4 hours ago' },
  { title: 'Getting Started Manual', rev: 'draft', when: '1 month ago' },
  { title: "Beginner's Handbook", rev: 'draft', when: '1 month ago' },
]

function CategoriesCard() {
  const [cat, setCat] = useState(1)
  const [tab, setTab] = useState<'guides' | 'apis'>('guides')
  return (
    <article className="ov-card ov-span-3">
      <CardHead icon="CirclesThree" label="Categories" count="12" />
      <div className="ov-cats">
        <div className="ov-cat-list">
          <p className="ov-cat-title">Categories</p>
          <div className="ov-cat-items">
            {CATEGORIES.map((c, i) => (
              <button key={c} className="ov-cat" aria-current={cat === i || undefined} onClick={() => setCat(i)}>
                <Ph_ name="CirclesThree" size={16} />
                <span>{c}</span>
              </button>
            ))}
          </div>
          <div className="ov-cat-add">
            <button className="ov-dashed-btn"><Ph_ name="Plus" size={16} />Add Category</button>
          </div>
        </div>
        <div className="ov-cat-main">
          <div className="ov-tabs" role="tablist">
            {([['guides', 'BookOpenText', 'Guides'], ['apis', 'BracketsCurly', 'APIs']] as const).map(([id, icon, label]) => (
              <button key={id} role="tab" aria-selected={tab === id} className="ov-tab" onClick={() => setTab(id)}>
                <Ph_ name={icon} size={12} />{label}<span className="ov-count">3</span>
              </button>
            ))}
          </div>
          <div className="ov-cat-docs">
            {CAT_GUIDES.slice(0, 4).map((g, i) => (
              <a key={i} className="ov-doc ov-doc-tight">
                <span className="ov-tile"><Ph_ name={tab === 'guides' ? 'FileText' : 'BracketsCurly'} size={16} /></span>
                <span className="ov-doc-main">
                  <span className="ov-doc-name">
                    <span className="ov-doc-name-row">
                      {g.title}
                      {g.rev && (
                        <span className={`ov-rev ov-rev-${g.rev}`}>
                          <img src={`${ASSET}/${g.rev === 'approved' ? 'status-approved.svg' : 'status-draft.png'}`} alt="" />
                          rev.1.2
                        </span>
                      )}
                    </span>
                    <Ph_ name="CaretRight" size={12} className="ov-caret" />
                  </span>
                  <span className="ov-doc-meta">
                    <span className="ov-doc-tags">{tab === 'guides' ? '5 pages' : '5 endpoints'}</span>
                    <span>{g.when}</span>
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

/* --------------------------------------------------------- demographics */

const COUNTRIES = [
  ['germany', 'Germany', '12k', '8%', 31],
  ['india', 'India', '10k', '7.5%', 25],
  ['brazil', 'Brazil', '8k', '7%', 16],
  ['usa', 'USA', '6k', '6.7%', 10],
  ['sri-lanka', 'Sri-lanka', '5.5k', '6.2%', 10],
  ['united-kingdom', 'United Kingdom', '5k', '6%', 10],
  ['south-africa', 'South Africa', '4k', '5%', 10],
  ['brazil-2', 'Brazil', '2k', '3.1%', 10],
] as const

function DemographicsCard() {
  return (
    <article className="ov-card ov-span-3">
      <SectionHead icon="FileText" title="Developer Demographics" sub="Traffic across different regions" />
      <div className="ov-geo">
        <img className="ov-map" src={`${ASSET}/world-map.png`} alt="World map of developer traffic" />
        <div className="ov-legend">
          <p className="ov-legend-title">Insecure Traffic by Country</p>
          {COUNTRIES.map(([flag, name, value, pct, bar], i) => (
            <div key={i} className="ov-country">
              <img src={`${ASSET}/flags/${flag}.svg`} alt="" />
              <span className="ov-country-name">{name}</span>
              <span className="ov-country-value">{value}<span className="ov-pct">{pct}</span></span>
              <span className="ov-bar"><i style={{ width: bar }} /></span>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

/* ---------------------------------------------------------------- page */

export function Overview() {
  return (
    <div className="p-scroll ov">
      <div className="ov-page">
        <GettingStarted />
        <div className="ov-grid">
          <div className="ov-head ov-span-3">
            <div>
              <h1 className="ov-h1">Hi Devesh, Good Morning!</h1>
              <p className="ov-body-m">See the complete snapshot of your documentation workspace.</p>
            </div>
            <div className="ov-actions">
              <button className="ov-btn ov-btn-tint">Create API Doc <Ph_ name="CaretDown" size={16} /></button>
              <button className="ov-btn ov-btn-brand">Create Guide <Ph_ name="CaretDown" size={16} /></button>
            </div>
          </div>
          <DocCard icon="FileText" label="API Guides" items={GUIDES} />
          <DocCard icon="BracketsCurly" label="API Reference" items={APIS} />
          <RecipeCard />
          <TeamCard />
          <ActivityCard />
          <CategoriesCard />
          <DemographicsCard />
        </div>
      </div>
    </div>
  )
}
