import { useState } from 'react'
import { Ph_ } from '../../ui/Phosphor'
import { FigTree, FtDivider, FtFolder, FtLeaf, FtSection } from './parts'
import { NavToggle } from '../PortalShell'
import { Layer, PanelHead } from './Organisation'

/* Guides — Figma "Guides" (64:7715): docs tree + a guide article with a
   sticky table of contents. Mock content copied from the design. */

/* ------------------------------------------------------------ tree */

const LEAVES = ['Subscription creation', 'Subscription details', 'Subscription details', 'List account subscriptions', 'Cancel subscription']
const GROUPS: { name: string; items: string[] }[] = [
  { name: 'Banking Services', items: ['Biller Search', 'Biller Details', 'Biller Categories', 'Biller Validation', 'Biller Config', 'Agent Biller Map'] },
  { name: 'Payment History', items: ['Transaction History', 'Payment Report', 'Void Payment', 'Dispute Report', 'Agent Report', 'Reconciliation'] },
  { name: 'Manage Users', items: ['Health Check', 'Service Status', 'Ping', 'Webhook Status', 'Bill Fetch Callback'] },
]

export function GuidesTree() {
  const [active, setActive] = useState(2)
  const [open, setOpen] = useState(true)
  const [menu, setMenu] = useState<number | null>(null)
  const [moving, setMoving] = useState<string | null>(null)
  return (
    <>
    {moving && <AddToGuide page={moving} onClose={() => setMoving(null)} />}
    <FigTree
      title="Guides"
      actions={
        <>
          <button className="ft-head-btn" title="Search"><Ph_ name="MagnifyingGlass" size={16} /></button>
          <button className="ft-head-btn" title="Sort"><Ph_ name="ArrowsDownUp" size={16} /></button>
          <button className="ft-head-btn" title="Add"><Ph_ name="Plus" size={16} /></button>
          <NavToggle />
        </>
      }
    >
      {['Currency Conversion', 'Investment Monitoring', 'Financial Planning', 'FOREX Solutions'].map((f) => (
        <FtFolder key={f} label={f} />
      ))}
      <FtDivider />
      <FtSection name="Subscription Management" />
      <FtFolder label="Equity Funding Finance AMD" open={open} onClick={() => setOpen(!open)} />
      {open && (
        <div className="ft-nest">
          {LEAVES.map((l, i) => (
            <div key={i} className="gd-leaf">
              <FtLeaf leaf={{ id: String(i), label: l, icon: 'BookOpen' }} active={active === i} accent onClick={() => setActive(i)} />
              <button className="gd-leaf-more" title="More" onClick={() => setMenu(menu === i ? null : i)}><Ph_ name="DotsThreeVertical" size={16} weight="bold" /></button>
              {menu === i && (
                <span className="og-menu gd-leaf-menu">
                  <button onClick={() => { setMenu(null); setMoving(l) }}><Ph_ name="ArrowSquareIn" size={14} />Add to existing guide</button>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      {GROUPS.map((g) => (
        <div key={g.name}>
          <FtDivider />
          <FtSection name={g.name} />
          {g.items.map((it) => <FtFolder key={it} label={it} />)}
        </div>
      ))}
    </FigTree>
    </>
  )
}

/* ------------------------------------------------------------ article */

const TOC: { label: string; sub?: boolean }[] = [
  { label: 'The Admin Dashboard for Chase' },
  { label: 'Dedicated pages designed for integrated applications.', sub: true },
  { label: 'Strategies for effectively managing data pagination.', sub: true },
  { label: 'Steps by step process' },
  { label: 'Open Config Management', sub: true },
  { label: 'Open Config Management', sub: true },
  { label: 'Primary interface for merchants' },
  { label: 'Shopify admin' },
  { label: 'Titles of the link shared' },
]

const ADMIN = "The Chase admin is the primary interface for merchants to manage their stores, and core Shopify objects such as products, orders, and customers. The Chase admin is also the place where merchants can manage their apps. Developers can surface their app's functionality in the Shopify admin using the following technologies"

const CODE = [
  '// Example of making an API call to retrieve account balance',
  'const accountId = "your_account_id";',
  'const balance = await bankingAPI.getAccountBalance(accountId);',
  'console.log(`Account Balance: $${balance}`);',
  'const accountId = "your_account_id";',
  'const balance = await bankingAPI.getAccountBalance(accountId);',
  'console.log(`Account Balance: $${balance}`);',
]
const LANGS = ['JS', 'C#', 'Curl', 'Python', 'Java', 'C++']

const NOTE = 'The linked content describes using the Storefront API for custom storefronts. However, most of this information also applies to using the Storefront API in apps that integrate with online stores.'
const ROWS: { text: string; tag?: string; mono?: string; note?: boolean }[] = [
  { text: 'Your app injects inline content on a page', tag: 'Connector' },
  { text: "Your app doesn't have a UI component or it adds a floating or overlaid element to a theme", tag: 'Connector' },
  { text: 'You want to retrieve customer-facing values through an API', tag: 'Connector' },
  { text: 'Your app injects inline content on a page and you want to add support for vintage themes', tag: 'Connector', note: true },
  { text: "You want to forward requests made to a route on an online store's origin to an external origin to display data on a store page", mono: 'BYPASS_EW_ORGNREQ_EVENT', note: true },
  { text: "Your app doesn't have a UI component or it adds a floating or overlaid element to a theme", tag: 'Connector' },
]
const CALLOUT = 'Build templates are the free marker templates that are used to build the proxy. The proxy you create will be generated based upon the template you designThe proxy you create will be generated based upon the template.'

function CodeExample() {
  const [lang, setLang] = useState(0)
  return (
    <div className="gd-codeset">
      <div className="gd-seg" role="tablist">
        {LANGS.map((l, i) => (
          <button key={l} role="tab" aria-selected={lang === i} onClick={() => setLang(i)}>{l}</button>
        ))}
      </div>
      <div className="gd-code">
        <pre>{CODE.join('\n')}</pre>
        <button className="gd-copy" title="Copy"><Ph_ name="Copy" size={16} /></button>
      </div>
    </div>
  )
}

function Pager({ dir }: { dir: 'back' | 'next' }) {
  const back = dir === 'back'
  return (
    <a className={`gd-pager ${back ? '' : 'is-next'}`}>
      <span className="gd-pager-ic"><Ph_ name={back ? 'CaretLeft' : 'CaretRight'} size={24} /></span>
      <span className="gd-pager-text">
        <span>{back ? 'Previous' : 'Up Next'}</span>
        <b>Topic Name</b>
      </span>
    </a>
  )
}

export function GuideDoc() {
  const [toc, setToc] = useState(3)
  const [vote, setVote] = useState<'up' | 'down' | null>(null)
  return (
    <div className="p-scroll pg gd">
      <div className="gd-page">
        <h1 className="gd-title">Start a batch of ACH transactions.</h1>
        <div className="gd-grid">
          <article className="gd-article">
            <section className="gd-block">
              <h2 className="gd-h1">Chase Administration Portal</h2>
              <p className="gd-p">The Chase admin acts as a central platform for merchants to manage their stores, including key Shopify components such as products, orders, and customer interactions.</p>
            </section>
            <ol className="gd-steps">
              <li>
                <span className="gd-step-n"><span>1</span><i /></span>
                <div><p className="gd-step-t">Integrated application pages</p><p className="gd-p0">The Chase admin acts as the central interface for merchants to manage their stores and key Shopify components</p></div>
              </li>
              <li>
                <span className="gd-step-n"><span>2</span></span>
                <div><p className="gd-step-t">Embedded app pages</p><p className="gd-p0">The Chase admin is the primary interface for merchants to manage their stores, and core Shopify objects</p></div>
              </li>
            </ol>
            <section className="gd-block gd-block-h2">
              <h3 className="gd-h2">Embedded app pages</h3>
              <p className="gd-p">{ADMIN}</p>
              <p className="gd-p">The Chase admin is the primary interface for merchants to manage their stores, and core Shopify objects such as products, orders, and customers. The Chase admin is also the place where merchants can manage their apps  Developers can surface their app's functionality in the Shopify admin using the code.</p>
            </section>
            <div className="gd-wide gd-py8"><CodeExample /></div>
            <div className="gd-spacer" />
            <section className="gd-block gd-wide">
              <h2 className="gd-h1">The Chase admin</h2>
              <p className="gd-p">{ADMIN}</p>
            </section>
            <div className="gd-wide gd-py8">
              <div className="gd-code"><pre className="gd-wrap">From the Document Reader dialog, you can quickly skim through the content of all the versions of a document. You can, then, quickly close the preview and continue browsing the library. In addition to optimizing the readability of your document, with the reader you can also:</pre></div>
            </div>
            <div className="gd-wide gd-table-wrap">
              <div className="gd-table">
                <div className="gd-tr gd-th"><span>Title</span><span>Title</span></div>
                {ROWS.map((r, i) => (
                  <div key={i} className="gd-tr">
                    <span>{r.text}</span>
                    <span className="gd-cell">
                      {r.tag && <em className="gd-tag">{r.tag}</em>}
                      {r.mono && <code className="gd-xs">{r.mono}</code>}
                      {r.note && <span className="gd-quote">{NOTE}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="gd-wide gd-py16">
              <div className="gd-callout is-info"><Ph_ name="Info" size={24} /><p>{CALLOUT}</p></div>
            </div>
            <div className="gd-wide gd-py16">
              <div className="gd-callout is-warn"><Ph_ name="Warning" size={24} /><p>{CALLOUT}</p></div>
            </div>
            <div className="gd-wide gd-meta-wrap">
              <div className="gd-meta">
                <span><Ph_ name="ClockCountdown" size={24} />Last updated 3 days ago.</span>
                <span>
                  Was this page helpful?
                  <span className="gd-votes">
                    <button aria-pressed={vote === 'up'} onClick={() => setVote(vote === 'up' ? null : 'up')} title="Yes"><Ph_ name="ThumbsUp" size={24} weight={vote === 'up' ? 'fill' : 'regular'} /></button>
                    <button aria-pressed={vote === 'down'} onClick={() => setVote(vote === 'down' ? null : 'down')} title="No"><Ph_ name="ThumbsDown" size={24} weight={vote === 'down' ? 'fill' : 'regular'} /></button>
                  </span>
                </span>
              </div>
            </div>
            <div className="gd-wide gd-pagers"><Pager dir="back" /><Pager dir="next" /></div>
          </article>
          <aside className="gd-toc">
            <p className="gd-toc-title">Table of content</p>
            <nav>
              {TOC.map((t, i) => (
                <a key={i} className={t.sub ? 'is-sub' : undefined} aria-current={toc === i || undefined} onClick={() => setToc(i)}>{t.label}</a>
              ))}
            </nav>
          </aside>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ add page to guide */

const TARGETS = [
  { name: 'Currency Conversion', live: true },
  { name: 'Investment Monitoring', live: false },
  { name: 'Financial Planning', live: true },
  { name: 'FOREX Solutions', live: false },
]

/** Pick a guide; a published one can't change in place, so offer a new
    revision (default) or unpublishing it. */
function AddToGuide({ page, onClose }: { page: string; onClose: () => void }) {
  const [guide, setGuide] = useState<(typeof TARGETS)[number] | null>(null)
  const [pending, setPending] = useState<(typeof TARGETS)[number] | null>(null)
  const [pick, setPick] = useState(false)
  const [choice, setChoice] = useState<'revision' | 'unpublish'>('revision')
  const live = guide?.live
  return (
    <Layer kind="modal" onClose={onClose}>
      <div className="og-modal gd-move" role="dialog" aria-label="Add to guide">
        {live
          ? <button className="gd-move-x" onClick={onClose} title="Close"><Ph_ name="X" size={16} /></button>
          : <PanelHead title="Add to existing guide" onClose={onClose} />}
        {!live ? (
          <div className="og-modal-body">
            <p className="gd-move-sub">Choose a guide for “{page}”.</p>
            <span className="og-menu-wrap gd-pick">
              <button className="og-input is-32 ac-select" onClick={() => setPick(!pick)}>
                <span className={pending ? '' : 'is-placeholder'}>{pending?.name ?? 'Select a guide'}</span>
                <Ph_ name="CaretDown" size={14} />
              </button>
              {pick && (
                <span className="og-menu">
                  {TARGETS.map((t) => (
                    <button key={t.name} aria-current={pending?.name === t.name || undefined} onClick={() => { setPending(t); setPick(false) }}>
                      <Ph_ name="BookOpen" size={14} /><span>{t.name}</span>
                      {t.live && <span className="og-status is-active">Published</span>}
                    </button>
                  ))}
                </span>
              )}
            </span>
            <div className="og-modal-actions">
              <button className="og-btn is-tint" onClick={onClose}>Cancel</button>
              <button className="og-btn is-brand" disabled={!pending} onClick={() => (pending!.live ? setGuide(pending) : onClose())}>Add page</button>
            </div>
          </div>
        ) : (
          <div className="og-modal-body is-live">
            <div className="gd-move-art" aria-hidden dangerouslySetInnerHTML={{ __html: REVISION_ART }} />
            <div className="gd-move-head">
              <h2 className="gd-move-title">This guide is already published</h2>
              <p className="gd-move-sub">Choose how to add “{page}”.</p>
            </div>
            <div className="gd-opts">
            {([
              ['revision', 'Add to a new revision', 'Keep the live guide. Publish the draft when ready.'],
              ['unpublish', 'Unpublish and add', 'Take the guide offline until you republish it.'],
            ] as const).map(([id, t, d]) => (
              <button key={id} className="gd-opt" aria-pressed={choice === id} onClick={() => setChoice(id)}>
                <Ph_ name={choice === id ? 'RadioButton' : 'Circle'} weight={choice === id ? 'fill' : 'regular'} size={18} />
                <span><b>{t}{id === 'revision' && <i>Recommended</i>}</b><small>{d}</small></span>
              </button>
            ))}
            </div>
            <div className="og-modal-actions">
              <button className="og-btn is-tint" onClick={() => setGuide(null)}>Back</button>
              <button className="og-btn is-brand" onClick={onClose}>{choice === 'revision' ? 'Create revision' : 'Unpublish and add'}</button>
            </div>
          </div>
        )}
      </div>
    </Layer>
  )
}

/* spotkit L12 Split: live guide (ticked) → new revision (plus). Generated. */
const REVISION_ART = `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Published guide and new revision" class="il"><defs><linearGradient id="fadeG-gd-rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0.7" stop-color="#fff"/><stop offset="0.82" stop-color="#000"/></linearGradient><mask id="fade-gd-rev"><rect width="160" height="160" fill="url(#fadeG-gd-rev)"/></mask><linearGradient id="panelG-gd-rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--il-panel-top, #FCFBF9)"/><stop offset="1" stop-color="var(--il-panel, #F7F5F2)"/></linearGradient><filter id="lift-gd-rev" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="2" stdDeviation="2.6" flood-color="var(--il-shadow-c, #4A3F33)" flood-opacity="var(--il-shadow-o, 0.16)"/></filter><filter id="liftL-gd-rev" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="var(--il-shadow-c, #4A3F33)" flood-opacity="var(--il-shadow-o, 0.16)"/></filter></defs><g mask="url(#fade-gd-rev)"><rect x="15" y="34" width="130" height="106" rx="16" fill="var(--il-ghost, #EAE7E2)" stroke="var(--il-line, #B9B1A4)" stroke-width="0.5"/><rect x="22" y="30" width="116" height="100" rx="10" fill="url(#panelG-gd-rev)" stroke="var(--il-line, #B9B1A4)" stroke-width="0.5"/><g><rect x="28.0" y="62.0" width="44.0" height="44.0" rx="8.0" fill="var(--il-surface, #FFFFFF)" stroke="var(--il-line, #B9B1A4)" stroke-width="0.5"/></g><rect x="36.0" y="71.0" width="26.0" height="4.6" rx="2.30" fill="var(--il-fill, #DCD6CE)"/><rect x="36.0" y="80.0" width="18.0" height="4.6" rx="2.30" fill="var(--il-fill, #DCD6CE)"/><g transform="translate(35.00 89.00) scale(0.03516)" fill="var(--il-accent, #3E9077)"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></g><g><rect x="88.0" y="62.0" width="44.0" height="44.0" rx="8.0" fill="var(--il-surface, #FFFFFF)" stroke="var(--il-line, #B9B1A4)" stroke-width="0.5"/></g><rect x="96.0" y="71.0" width="26.0" height="4.6" rx="2.30" fill="var(--il-fill, #DCD6CE)"/><rect x="96.0" y="80.0" width="18.0" height="4.6" rx="2.30" fill="var(--il-fill, #DCD6CE)"/><g transform="translate(95.00 89.00) scale(0.03516)" fill="var(--il-stroke-soft, #9B948A)"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/></g><g transform="translate(74.00 78.00) scale(0.04688)" fill="var(--il-stroke-soft, #9B948A)"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></g><rect x="56.0" y="116.0" width="48.0" height="4.6" rx="2.30" fill="var(--il-fill, #DCD6CE)"/></g><g><circle cx="80" cy="37" r="17" fill="var(--il-surface, #FFFFFF)" stroke="var(--il-line, #B9B1A4)" stroke-width="0.5"/></g><g transform="translate(72.50 29.50) scale(0.05859)" fill="var(--il-stroke, #35322D)"><path d="M232,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H24a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h72a8,8,0,0,0,8-8V56A8,8,0,0,0,232,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z"/></g></svg>`
