import { useState } from 'react'
import { actions } from '../../../store'
import { Ph_ } from '../../../ui/Phosphor'
import { PageHero } from '../parts'
import { CATEGORIES, Package, PACKAGES, RATING_SPLIT, REVIEWS, RULES, appsUsingPackage, endpointCount, packageById, productById } from './data'
import { AddToApp, DetailHead, EndpointTable, ListToolbar, MeteringDrawer, PackageCard, PackageTable, plural, RateCardView, Stars, Tabs, Tile, View } from './ui'
import { SPOTS } from './spots'

/* Packages — the catalogue (list) and one package (detail). Replaces the old
   marketing hero, category page and the two subscription-scoped package
   pages with one list and one detail. */

export function PackagesList() {
  const [cat, setCat] = useState('all')
  const [view, setView] = useState<View>('table')
  const shown = cat === 'all' ? PACKAGES : PACKAGES.filter((p) => p.category === cat)
  return (
    <>
      <PageHero spot={SPOTS.packages} title="Packages" sub="Bundles of API products with simple, usage-based pricing. Add one to an app to start building." />
      <div className="pg-body og-stack">
        <ListToolbar
          title={cat === 'all' ? 'Packages' : cat}
          count={shown.length}
          filter={{
            label: 'Category',
            value: cat,
            onChange: setCat,
            options: [
              { id: 'all', label: 'All', count: PACKAGES.length },
              ...CATEGORIES.map((c) => ({ id: c, label: c, count: PACKAGES.filter((p) => p.category === c).length })),
            ],
          }}
          view={view}
          onView={setView}
        />
        <PackageList packages={shown} view={view} />
      </div>
    </>
  )
}

/** The package list in either view; also used on a product's Packages tab. */
export function PackageList({ packages, view }: { packages: Package[]; view: View }) {
  return view === 'table'
    ? <PackageTable packages={packages} />
    : <div className="mn-grid">{packages.map((p) => <PackageCard key={p.id} pkg={p} onOpen={() => actions.openMon('packages', p.id)} />)}</div>
}

/* ------------------------------------------------------------ detail */

type Tab = 'overview' | 'endpoints' | 'pricing' | 'reviews'

export function PackageDetail({ id }: { id: string }) {
  const pkg = packageById(id)
  const [tab, setTab] = useState<Tab>('overview')
  const [rule, setRule] = useState<string | null>(null)
  const apps = appsUsingPackage(id)
  const products = pkg.products.map(productById)
  const eps = endpointCount(pkg)
  const restricted = products.filter((p) => p.access !== 'open')

  return (
    <>
      <DetailHead
        crumb="Packages"
        onCrumb={() => actions.openMon('packages')}
        title={pkg.name}
        desc={pkg.desc}
        actions={<AddToApp kind="package" id={pkg.id} name={pkg.name} />}
      >
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'endpoints', label: 'Endpoints', count: eps },
            { id: 'pricing', label: 'Pricing' },
            { id: 'reviews', label: 'Reviews', count: pkg.reviews },
          ]}
        />
      </DetailHead>

      <div key={tab} className="pg-body mn-pane">
        {tab === 'overview' && (
          <div className="mn-split">
            <div className="mn-main">
              <section className="mn-section">
                <h2 className="mn-h2">About</h2>
                <p className="mn-prose">{pkg.about}</p>
              </section>
              <section className="mn-section">
                <h2 className="mn-h2">Included products<span className="og-count">{products.length}</span></h2>
                <div className="mn-list">
                  {products.map((p) => (
                    <button key={p.id} className="mn-row" onClick={() => actions.openMon('products', p.id)}>
                      <Tile icon="Cube" size="sm" />
                      <span className="og-two"><span>{p.name}</span><small>{p.desc}</small></span>
                      {p.access !== 'open' && <span className="mn-row-lock"><Ph_ name="LockSimple" size={12} />Restricted</span>}
                      <span className="mn-row-meta">{plural(p.endpoints.length, 'endpoint')}</span>
                      <Ph_ name="CaretRight" size={14} className="mn-row-caret" />
                    </button>
                  ))}
                </div>
              </section>
              <section className="mn-section">
                <h2 className="mn-h2">Guides</h2>
                <div className="mn-guides">
                  {pkg.guides.map((g) => (
                    <a key={g} className="ct-card" onClick={() => actions.setRail('guides')}>
                      <Ph_ name="BookOpen" size={16} className="ct-ic is-guide" />
                      <span className="ct-name">{g}</span>
                      <Ph_ name="ArrowUpRight" size={14} className="mn-muted" />
                    </a>
                  ))}
                </div>
              </section>
            </div>

            <aside className="mn-aside">
              <section className="mn-box">
                <p className="mn-eyebrow">Pricing</p>
                <p className="mn-price">{pkg.from}{!pkg.from.includes('/') && <small> / call</small>}</p>
                <p className="mn-box-note">Starting rate · {pkg.pricing.model.toLowerCase()} pricing</p>
                <button className="ac-link" onClick={() => setTab('pricing')}>View rate card<Ph_ name="ArrowRight" size={14} /></button>
              </section>
              {restricted.length > 0 && (
                <section className="mn-box is-warn">
                  <Ph_ name="LockSimple" size={16} />
                  <p>Includes {restricted.map((p) => p.name).join(', ')}, which is restricted. The provider reviews access when you add this package to an app.</p>
                </section>
              )}
              <section className="mn-box">
                <p className="mn-eyebrow">In your apps</p>
                {apps.length ? (
                  <div className="mn-apps">
                    {apps.map((a) => (
                      <button key={a.id} onClick={() => actions.openMon('apps', a.id)}>
                        <Tile icon="SquaresFour" size="sm" />
                        <span className="mn-apps-name">{a.name}</span>
                        <i className={`mn-state is-${a.status.toLowerCase()}`} title={a.status} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mn-box-note">Not used by any of your apps yet.</p>
                )}
              </section>
              <dl className="mn-facts">
                <div><dt>Rating</dt><dd><span className="mn-rating"><Ph_ name="Star" size={13} weight="fill" />{pkg.rating}<small>({pkg.reviews})</small></span></dd></div>
                <div><dt>Category</dt><dd>{pkg.category}</dd></div>
                <div><dt>Contents</dt><dd>{plural(products.length, 'product')} · {plural(eps, 'endpoint')}</dd></div>
                <div><dt>Used by</dt><dd>{pkg.usedBy}</dd></div>
                <div><dt>Gateways</dt><dd>{[...new Set(products.map((p) => p.gateway))].join(', ')}</dd></div>
                <div><dt>Last updated</dt><dd>{pkg.updated}</dd></div>
              </dl>
            </aside>
          </div>
        )}

        {tab === 'endpoints' && <EndpointTable productIds={pkg.products} rules={pkg.rules} onRule={setRule} />}

        {tab === 'pricing' && (
          <div className="mn-pricing">
            <RateCardView card={pkg.pricing} title="Default rate card" />
            <section className="mn-section">
              <div>
                <h2 className="mn-h2">Metering rules</h2>
                <p className="mn-h2-sub">Some endpoints are priced by their own rule when its conditions are met. Everything else uses the default rate card.</p>
              </div>
              {pkg.rules.length ? (
                <div className="og-table" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr) 140px 160px 40px' }}>
                  {['Rule', 'Applies to', 'Model', 'Rate', ''].map((h, i) => <div key={i} className="og-th">{h}</div>)}
                  {pkg.rules.map((rid) => {
                    const r = RULES[rid]
                    const on = products.flatMap((p) => p.endpoints).filter((e) => e.rule === rid)
                    return (
                      <div key={rid} className="og-tr ac-click" onClick={() => setRule(rid)}>
                        <div className="og-td og-two"><span>{r.name}</span><small>{r.desc}</small></div>
                        <div className="og-td og-tags">{on.map((e) => <span key={e.path}>{e.path}</span>)}</div>
                        <div className="og-td">{r.rate.model}</div>
                        <div className="og-td">{r.rate.base[0].price}</div>
                        <div className="og-td og-td-icon"><Ph_ name="CaretRight" size={14} className="mn-muted" /></div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="mn-empty">This package has no metering rules. Every call uses the default rate card.</p>
              )}
            </section>
          </div>
        )}

        {tab === 'reviews' && <Reviews rating={pkg.rating} count={pkg.reviews} />}
      </div>

      {rule && (
        <MeteringDrawer
          ruleId={rule}
          endpoints={products.flatMap((p) => p.endpoints).filter((e) => e.rule === rule)}
          onClose={() => setRule(null)}
        />
      )}
    </>
  )
}

/* ------------------------------------------------------------ reviews */

function Reviews({ rating, count }: { rating: number; count: number }) {
  const max = Math.max(...RATING_SPLIT.map(([, n]) => n))
  return (
    <div className="mn-reviews">
      <aside className="mn-score">
        <p className="mn-score-big">{rating}</p>
        <Stars value={rating} />
        <p className="mn-box-note">{count} reviews</p>
        <dl className="mn-bars">
          {RATING_SPLIT.map(([s, n]) => (
            <div key={s}>
              <dt>{s}</dt>
              <dd><i style={{ width: `${(n / max) * 100}%` }} /></dd>
              <span>{n}</span>
            </div>
          ))}
        </dl>
        <button className="og-btn is-tint is-block"><Ph_ name="PencilSimpleLine" size={16} />Write a review</button>
      </aside>
      <div className="mn-review-list">
        {REVIEWS.map((r) => (
          <article key={r.name} className="mn-review">
            <header>
              <span className="og-avatar">{r.name.split(' ').map((w) => w[0]).join('')}</span>
              <span className="og-two"><span>{r.name}</span><small>{r.date}</small></span>
              <Stars value={r.rating} />
            </header>
            <p>{r.text}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
