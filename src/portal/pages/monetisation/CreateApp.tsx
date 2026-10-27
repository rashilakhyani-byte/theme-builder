import { useState } from 'react'
import { Ph_ } from '../../../ui/Phosphor'
import { Layer } from '../Organisation'
import { PACKAGES, PRODUCTS, endpointCount, packageById, productById } from './data'
import { plural, Tile, useToast } from './ui'

/* Create app — one form. An app is built from packages or from products,
   so the form asks which, then lists only that kind. */

type Kind = 'package' | 'product'
type Pick = { kind: Kind; id: string }

const KINDS: { id: Kind; icon: string; title: string; note: string }[] = [
  { id: 'package', icon: 'Package', title: 'Packages', note: 'Priced bundles of products' },
  { id: 'product', icon: 'Cube', title: 'Products', note: 'Individual sets of endpoints' },
]

/** With `app`, the same drawer adds APIs to an existing app and skips the
    name and description. */
export function CreateAppDrawer({ initial = [], app, onClose }: { initial?: Pick[]; app?: string; onClose: () => void }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [kind, setKind] = useState<Kind>(initial[0]?.kind ?? 'package')
  const [picked, setPicked] = useState<string[]>(initial.map((p) => p.id))
  const [q, setQ] = useState('')
  const [toast, show] = useToast()

  const items = (kind === 'package' ? PACKAGES : PRODUCTS).filter((it) => it.name.toLowerCase().includes(q.toLowerCase()))
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  const switchKind = (k: Kind) => { if (k !== kind) { setKind(k); setPicked([]) } }
  const ready = (app || name.trim()) && picked.length > 0
  const eps = picked.reduce((n, id) => n + (kind === 'package' ? endpointCount(packageById(id)) : productById(id).endpoints.length), 0)

  const submit = () => {
    show(app ? `${plural(picked.length, kind)} added to ${app}` : `${name} created and sent for approval`)
    setTimeout(onClose, 1400)
  }

  return (
    <Layer kind="drawer" onClose={onClose}>
      <aside className="og-drawer is-560 mn-create">
        <header className="og-panel-head">
          <span>{app ? `Add APIs to ${app}` : 'Create app'}</span>
          <button onClick={onClose} title="Close"><Ph_ name="X" size={16} /></button>
        </header>

        <div className="og-drawer-body mn-form">
          {!app && (
            <section className="mn-form-sec">
              <label className="ac-field">
                <span className="ac-label">App name</span>
                <span className="og-input is-32"><input autoFocus placeholder="e.g. Instant Loan App" value={name} onChange={(e) => setName(e.target.value)} /></span>
              </label>
              <label className="ac-field">
                <span className="ac-label">Description <i className="mn-muted">· optional</i></span>
                <textarea className="mn-textarea" rows={2} placeholder="What does this app do?" value={desc} onChange={(e) => setDesc(e.target.value)} />
              </label>
            </section>
          )}

          <section className="mn-form-sec">
            <div>
              <p className="ac-label">Build with</p>
              <p className="mn-form-hint">An app uses either packages or products.</p>
            </div>
            <div className="mn-kinds" role="radiogroup">
              {KINDS.map((k) => (
                <button key={k.id} role="radio" aria-checked={kind === k.id} className="mn-kind" onClick={() => switchKind(k.id)}>
                  <Tile icon={k.icon} size="sm" />
                  <span><b>{k.title}</b><small>{k.note}</small></span>
                  <i className="mn-kind-dot" />
                </button>
              ))}
            </div>
          </section>

          <section className="mn-form-sec is-grow">
            <div className="mn-form-row">
              <p className="ac-label">Select {kind === 'package' ? 'packages' : 'products'}</p>
              <label className="og-search mn-form-search">
                <Ph_ name="MagnifyingGlass" size={14} />
                <input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
              </label>
            </div>
            <div className="mn-options">
              {items.map((it) => {
                const locked = kind === 'product' && productById(it.id).access !== 'open'
                const on = picked.includes(it.id)
                return (
                  <button key={it.id} className="mn-option" aria-pressed={on} disabled={locked} onClick={() => toggle(it.id)}>
                    <span className="og-check" aria-hidden data-on={on || undefined}>{on && <Ph_ name="Check" size={12} weight="bold" />}</span>
                    <span className="og-two">
                      <span>{it.name}</span>
                      <small>
                        {kind === 'package'
                          ? `${plural(endpointCount(packageById(it.id)), 'endpoint')} · from ${packageById(it.id).from}`
                          : `${plural(productById(it.id).endpoints.length, 'endpoint')} · ${productById(it.id).gateway}`}
                      </small>
                    </span>
                    {locked && <span className="mn-option-tag"><Ph_ name="LockSimple" size={12} />Restricted</span>}
                  </button>
                )
              })}
              {!items.length && <p className="mn-empty">No {kind === 'package' ? 'packages' : 'products'} match “{q}”.</p>}
            </div>
          </section>
        </div>

        <footer className="og-panel-foot mn-create-foot">
          <span className="mn-picked">
            {picked.length ? <><b>{plural(picked.length, kind)}</b> · {plural(eps, 'endpoint')}</> : `No ${kind === 'package' ? 'packages' : 'products'} selected`}
          </span>
          <span className="mn-create-spacer" />
          <button className="og-btn is-tint" onClick={onClose}>Cancel</button>
          <button className="og-btn is-brand" disabled={!ready} onClick={submit}>{app ? 'Add to app' : 'Create app'}</button>
        </footer>
        {toast}
      </aside>
    </Layer>
  )
}
