import { useState } from 'react'
import { actions } from '../../../store'
import { Ph_ } from '../../../ui/Phosphor'
import { PageHero } from '../parts'
import { Access, APPS, PRODUCTS, appsUsingProduct, packagesWithProduct, productById } from './data'
import { AccessPill, AddToApp, DetailHead, EndpointTable, ListToolbar, plural, RequestAccess, Tabs, Tile, View, ViewSwitch } from './ui'
import { PackageList } from './Packages'
import { SPOTS } from './spots'

/* Products — gateway API products an app can use directly, without a
   package. Restricted products need the provider's approval first. */

type Filter = 'all' | 'open' | 'restricted'

const FILTERS: { id: Filter; label: string; title: string; match: (a: Access) => boolean }[] = [
  { id: 'all', label: 'All', title: 'Products', match: () => true },
  { id: 'open', label: 'Available', title: 'Available', match: (a) => a === 'open' },
  { id: 'restricted', label: 'Restricted', title: 'Restricted', match: (a) => a !== 'open' },
]

export function ProductsList() {
  const [f, setF] = useState<Filter>('all')
  const filter = FILTERS.find((x) => x.id === f)!
  const rows = PRODUCTS.filter((p) => filter.match(p.access))
  return (
    <>
      <PageHero spot={SPOTS.products} title="Products" sub="Groups of API resources from your gateways. Add a product to an app to call its endpoints." />
      <div className="pg-body og-stack">
        <ListToolbar
          title={filter.title}
          count={rows.length}
          filter={{
            label: 'Access',
            value: f,
            onChange: setF,
            options: FILTERS.map((x) => ({ id: x.id, label: x.label, count: PRODUCTS.filter((p) => x.match(p.access)).length })),
          }}
        />
        <div className="og-table mn-table" style={{ gridTemplateColumns: 'minmax(0, 2.4fr) minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 1fr) minmax(0, 1fr) 48px' }}>
          {['Product', 'Gateway', 'Endpoints', 'In packages', 'Access', ''].map((h, i) => <div key={i} className="og-th">{h}</div>)}
          {rows.map((p) => (
            <div key={p.id} className="og-tr ac-click" onClick={() => actions.openMon('products', p.id)}>
              <div className="og-td og-who"><Tile icon="Cube" size="sm" /><span className="og-two"><span>{p.name}</span><small>{p.desc}</small></span></div>
              <div className="og-td"><span className="mn-tag">{p.gateway}</span></div>
              <div className="og-td mn-num">{p.endpoints.length}</div>
              <div className="og-td mn-num">{packagesWithProduct(p.id).length}</div>
              <div className="og-td"><AccessPill access={p.access} /></div>
              <div className="og-td og-td-icon"><Ph_ name="CaretRight" size={14} className="mn-muted" /></div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------ detail */

type Tab = 'endpoints' | 'packages' | 'apps'

export function ProductDetail({ id }: { id: string }) {
  const p = productById(id)
  const [tab, setTab] = useState<Tab>('endpoints')
  const [view, setView] = useState<View>('table')
  const pkgs = packagesWithProduct(id)
  const apps = appsUsingProduct(id)

  return (
    <>
      <DetailHead
        crumb="Products"
        onCrumb={() => actions.openMon('products')}
        title={p.name}
        desc={p.desc}
        actions={p.access === 'open' ? <AddToApp kind="product" id={p.id} name={p.name} /> : <RequestAccess access={p.access} />}
      >
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'endpoints', label: 'Endpoints', count: p.endpoints.length },
            { id: 'packages', label: 'Packages', count: pkgs.length },
            { id: 'apps', label: 'Your apps', count: apps.length },
          ]}
        />
      </DetailHead>

      <div key={tab} className="pg-body og-stack mn-pane">
        {tab === 'endpoints' && (
          <>
            {p.access !== 'open' && (
              <div className="mn-banner">
                <Ph_ name="LockSimple" size={16} />
                <span>{p.access === 'requested'
                  ? 'Your access request is with the provider. You can add this product to an app once it is approved.'
                  : 'This product is restricted. Request access and the provider will review it before any of your apps can call these endpoints.'}</span>
              </div>
            )}
            <dl className="mn-factbar">
              <div><dt>Gateway</dt><dd>{p.gateway}</dd></div>
              <div><dt>Endpoints</dt><dd>{p.endpoints.length}</dd></div>
              <div><dt>Packages</dt><dd>{pkgs.length}</dd></div>
              <div><dt>Access</dt><dd><AccessPill access={p.access} /></dd></div>
            </dl>
            <EndpointTable productIds={[p.id]} />
          </>
        )}

        {tab === 'packages' && (
          pkgs.length ? (
            <>
              <div className="mn-toolbar">
                <h2 className="mn-h2">Packages<span className="og-count">{pkgs.length}</span></h2>
                <ViewSwitch view={view} onView={setView} />
              </div>
              <PackageList packages={pkgs} view={view} />
            </>
          ) : (
            <p className="mn-empty">This product isn’t part of any package. Add it to an app on its own.</p>
          )
        )}

        {tab === 'apps' && (
          apps.length ? (
            <div className="og-table" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 1.4fr) 48px' }}>
              {['App', 'Status', 'Access through', ''].map((h, i) => <div key={i} className="og-th">{h}</div>)}
              {apps.map((a) => {
                const via = a.products.includes(id) ? null : a.packages.find((k) => pkgs.some((x) => x.id === k))
                return (
                  <div key={a.id} className="og-tr ac-click" onClick={() => actions.openMon('apps', a.id)}>
                    <div className="og-td og-who"><Tile icon="SquaresFour" size="sm" /><span>{a.name}</span></div>
                    <div className="og-td"><span className={`og-status ${a.status === 'Approved' ? 'is-active' : 'is-pending'}`}>{a.status}</span></div>
                    <div className="og-td">{via ? <span className="mn-via"><Ph_ name="Package" size={14} />{pkgs.find((x) => x.id === via)!.name}</span> : 'Direct'}</div>
                    <div className="og-td og-td-icon"><Ph_ name="CaretRight" size={14} className="mn-muted" /></div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="mn-empty">None of your {APPS.length} apps use this product yet.</p>
          )
        )}
      </div>
    </>
  )
}
