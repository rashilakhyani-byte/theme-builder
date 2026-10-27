import { useState } from 'react'
import { Ph_ } from '../../ui/Phosphor'
import { CardNavToggle, FigTree, FtLeaf, PageHero } from './parts'

/* Categories — Figma 78:23779: category list + the guides and APIs linked
   to the selected category. */

const CATEGORIES = ['Subscription creation', 'Subscription details', 'Subscription details', 'List account subscriptions', 'Cancel subscription']

export function CategoriesTree() {
  const [active, setActive] = useState(2)
  return (
    <FigTree title="Categories">
      {CATEGORIES.map((c, i) => (
        <FtLeaf key={i} leaf={{ id: String(i), label: c, icon: 'Stack' }} active={active === i} onClick={() => setActive(i)} />
      ))}
    </FigTree>
  )
}

function Linked({ title, icon, kind, count }: { title: string; icon: string; kind: 'guide' | 'api'; count: number }) {
  return (
    <section className="ct-section">
      <h2 className="ct-h2">{title}</h2>
      <div className="ct-grid">
        {Array.from({ length: count }, (_, i) => (
          <a key={i} className="ct-card">
            <Ph_ name={icon} size={16} className={`ct-ic is-${kind}`} />
            <span className="ct-name">Handling Failed Transfers</span>
            <span className="ct-ver">V.1.2</span>
          </a>
        ))}
      </div>
    </section>
  )
}

export function CategoriesPage() {
  return (
    <div className="p-scroll pg">
      <CardNavToggle />
      <PageHero art="categories" title="Categories" sub="Organise guides into categories to help users discover relevant content faster." />
      <div className="pg-body ct-body">
        <Linked title="Guides Linked" icon="BookOpen" kind="guide" count={7} />
        <Linked title="APIs Linked" icon="BracketsCurly" kind="api" count={6} />
      </div>
    </div>
  )
}
