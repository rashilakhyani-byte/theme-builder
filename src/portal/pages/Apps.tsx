import { actions, useStore } from '../../store'
import { Ph_ } from '../../ui/Phosphor'
import { ArtItem, CardNavToggle, FigTree, FtLeaf, PageHero } from './parts'
import { Dots, Search } from './Organisation'
import { VendorTabs } from './Access'

/* App Approval (Figma 85:49984) and Billing & Pricing (449:23221). */

const icon = (n: string, x: number, y: number, s: number, dim = false): ArtItem => ({ k: 'icon', n, x, y, s, dim })
const bar = (x: number, y: number, w: number, h: number): ArtItem => ({ k: 'bar', x, y, w, h })

const ART_APPS: ArtItem[] = [
  { k: 'card', x: 15, y: 62, w: 104, h: 67, r: 4.6, c: [9, 24, 39, 54].flatMap((y): ArtItem[] => [
    icon('AppWindow', 1, y - 3, 11), bar(20, y, 20, 5), bar(45, y, 36, 5), icon('Checks', 89, y - 3, 11),
  ]) },
  { k: 'card', x: -17.8, y: 17, w: 168.6, h: 40, r: 6.1, strong: true, c: [
    icon('ShieldCheck', 18.4, 7.6, 24.9), bar(57.3, 8.6, 41.5, 7.7), bar(57.3, 21.6, 71.4, 7.6),
  ] },
]

const BILL_DOTS: [number, number, boolean][] = [
  [19, 37, false], [19, 54, true], [19, 71, false], [20, 88, false],
  [51, 37, false], [82, 37, false], [51, 54, false], [82, 54, false],
  [51, 71, true], [82, 71, true], [51, 88, false], [81, 88, false],
]
const ART_BILLING: ArtItem[] = [
  { k: 'card', x: 13, y: 53, w: 108, h: 81, r: 0, c: [
    icon('BookOpen', 16, 7, 13), icon('Code', 48, 8, 13), icon('ChartLine', 79, 8, 13),
    { k: 'hline', x: -6, y: 28, len: 120 },
    ...BILL_DOTS.map(([x, y, dashed]) => icon(dashed ? 'CircleDashed' : 'Circle', x, y, 8, true)),
  ] },
  { k: 'card', x: 49, y: 10, w: 35, h: 35, r: 36, strong: true, c: [icon('Money', 8, 8, 19)] },
]

/* ------------------------------------------------------------ app approval */

export function AppsPage() {
  return (
    <div className="p-scroll pg">
      <CardNavToggle />
      <PageHero art={ART_APPS} title="App Approval" sub="Review and manage applications requesting access to your APIs." />
      <div className="pg-body og-body og-stack">
        <div className="og-toolbar">
          <VendorTabs />
          <Search width={142} />
        </div>
        <div className="og-table is-compact" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr)) 40px' }}>
          {['App Name', 'Status', 'Created At', 'Created By', 'Credential Count', ''].map((h, i) => <div key={i} className="og-th">{h}</div>)}
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="og-tr">
              <div className="og-td">App Name</div>
              <div className="og-td"><span className="og-status is-active">Approved</span></div>
              <div className="og-td">23 Oct, 2024</div>
              <div className="og-td">lavanya@apiwiz.com</div>
              <div className="og-td"><a className="ap-cred">1<Ph_ name="ArrowUpRight" size={12} /></a></div>
              <div className="og-td og-td-icon"><Dots /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ billing */

export function BillingTree() {
  const tab = useStore((s) => s.billingTab)
  return (
    <FigTree title="Billing & Pricing">
      <FtLeaf leaf={{ id: 'plans', label: 'Pricing Plan', icon: 'Money' }} iconSize={16} accent active={tab === 'plans'} onClick={() => actions.setBillingTab('plans')} />
      <FtLeaf leaf={{ id: 'invoices', label: 'Invoices', icon: 'SignOut' }} iconSize={16} accent active={tab === 'invoices'} onClick={() => actions.setBillingTab('invoices')} />
    </FigTree>
  )
}

const PLANS = [
  { name: 'Free', desc: 'For individuals getting started with API documentation.', current: true,
    features: ['Rest API docs', 'API Guides', 'Up to 5 members', 'OAS validation', 'Limited AI credits', 'Single workspace', 'Starter customization', 'Sub-domain', 'Starter templates', 'Rest API docs', 'API Guides', 'Up to 5 members', 'OAS validation'] },
  { name: 'Pro+', desc: 'For growing teams that need collaboration and customization.',
    features: ['Linting and validation for APIs', 'Upload your files easily', 'Synchronize with Git repositories', 'Customize your theme', 'Collaborate in real-time', 'Access version history', 'Support for dark mode', 'Automated backup system', 'Support for multiple languages', 'Use keyboard shortcuts', 'Drag-and-drop user interface', 'Edit offline without internet', 'In-depth analytics'] },
  { name: 'Enterprise', desc: 'For large orgs managing complex, secure API ecosystems.',
    features: ['REST & GraphQL docs', 'API Workflow Docs', 'API Testing', 'API Design Studio', 'API Monetization', 'Access Key Approval', 'Integrated Forum', 'On Premises Deployment', 'Advanced Access Control', 'Everything in Pro+', 'REST & GraphQL docs', 'API Workflow Docs', 'API Testing'] },
]

export function BillingPage() {
  const tab = useStore((s) => s.billingTab)
  return (
    <div className="p-scroll pg">
      <CardNavToggle />
      <PageHero art={ART_BILLING} title={tab === 'plans' ? 'Pricing Plan' : 'Invoices'} sub="Define and manage the plans available for your portal and APIs." />
      <div className="pg-body og-body">
        {tab === 'plans' ? (
          <div className="bl-plans">
            {PLANS.map((p) => (
              <section key={p.name} className="bl-plan">
                <div className="bl-plan-head">
                  <div>
                    <h2>{p.name}</h2>
                    <p>{p.desc}</p>
                  </div>
                  {p.current
                    ? <button className="og-btn is-tint is-block"><Ph_ name="Check" size={16} />Current Plan</button>
                    : <button className="og-btn is-brand is-block"><Ph_ name="EnvelopeSimple" size={16} />Contact Us</button>}
                </div>
                <ul>
                  {p.features.map((f, i) => <li key={i}><Ph_ name="CheckCircle" size={24} />{f}</li>)}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <div className="bl-empty">
            <Ph_ name="Receipt" size={28} />
            <b>No invoices yet</b>
            <span>Invoices appear here once a paid plan is active.</span>
          </div>
        )}
      </div>
    </div>
  )
}
