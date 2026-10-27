import { actions, useStore } from '../../../store'
import { CardNavToggle, FigTree, FtLeaf } from '../parts'
import { PackageDetail, PackagesList } from './Packages'
import { ProductDetail, ProductsList } from './Products'
import { AppDetail, AppsList } from './Apps'
import { InvoicesList } from './Invoices'
import { AppsPage } from '../Apps'

/* Monetisation — the API consumer's side: the apps they build, the packages
   and products those apps use, and what they are billed for it. */

const TABS = [
  { id: 'packages', label: 'Packages', icon: 'Package' },
  { id: 'products', label: 'Products', icon: 'Cube' },
  { id: 'invoices', label: 'Invoices', icon: 'Receipt' },
] as const

export function MonTree() {
  const tab = useStore((s) => s.monTab)
  return (
    <FigTree title="Monetisation">
      {TABS.map((t) => (
        <FtLeaf key={t.id} leaf={t} iconSize={16} accent active={tab === t.id} onClick={() => actions.openMon(t.id)} />
      ))}
    </FigTree>
  )
}

/** Apps rail: the consumer's apps plus, for providers, the approval queue. */
export function AppsTree() {
  const view = useStore((s) => s.appsView)
  return (
    <FigTree title="Apps">
      <FtLeaf leaf={{ id: 'mine', label: 'My apps', icon: 'SquaresFour' }} iconSize={16} accent active={view === 'mine'} onClick={() => actions.setAppsView('mine')} />
      <FtLeaf leaf={{ id: 'approvals', label: 'Approvals', icon: 'ShieldCheck' }} iconSize={16} accent active={view === 'approvals'} onClick={() => actions.setAppsView('approvals')} />
    </FigTree>
  )
}

export function AppsRailPage() {
  const view = useStore((s) => s.appsView)
  return view === 'approvals' ? <AppsPage /> : <MonetisationPage />
}

export function MonetisationPage() {
  const tab = useStore((s) => s.monTab)
  const id = useStore((s) => s.monId)
  // Going into a record slides in from the right; coming back, from the left.
  const dir = useStore((s) => s.monDir)
  return (
    // Keyed by record so tabs and scroll reset when a cross-link opens another.
    <div key={`${tab}/${id}`} className={`p-scroll pg mn mn-page is-${dir}`}>
      <CardNavToggle />
      {tab === 'packages' && (id ? <PackageDetail id={id} /> : <PackagesList />)}
      {tab === 'products' && (id ? <ProductDetail id={id} /> : <ProductsList />)}
      {tab === 'apps' && (id ? <AppDetail id={id} /> : <AppsList />)}
      {tab === 'invoices' && <InvoicesList />}
    </div>
  )
}
