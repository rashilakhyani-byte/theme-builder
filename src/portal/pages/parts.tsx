import { actions } from '../../store'
import { Ph_ } from '../../ui/Phosphor'

/* Pieces shared by the Figma-built portal pages (Guides, Recipes, Categories). */

/** SidebarSimple button in the content card's top-left corner (Figma 16,16). */
export function CardNavToggle() {
  return (
    <button className="pg-navtoggle" onClick={() => actions.toggleNav()} title="Toggle navigation">
      <Ph_ name="SidebarSimple" size={16} />
    </button>
  )
}

/* ------------------------------------------------------------ tree */

export type TreeLeaf = { id: string; label: string; icon: string; tag?: string }

/** Figma "Sidebar": label bar + scrolling content. Colours come from the
    portal chrome tokens so the tree follows the brand like the rail does. */
export function FigTree({ title, back, actions: headActions, children }: {
  title: string
  back?: () => void
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <aside className="ft">
      <div className="ft-head">
        {back && (
          <button className="ft-head-btn" onClick={back} title="Back">
            <Ph_ name="ArrowLeft" size={20} />
          </button>
        )}
        <span className="ft-title">{title}</span>
        {headActions}
      </div>
      <div className="ft-scroll">{children}</div>
    </aside>
  )
}

/** Bold section header with a Stack icon ("Subscription Management"). */
export const FtSection = ({ name }: { name: string }) => (
  <div className="ft-section"><Ph_ name="Stack" size={14} /><span>{name}</span></div>
)

export const FtDivider = () => <div className="ft-divider" />

/** Collapsible "OAS" row with a caret. */
export function FtFolder({ label, open, onClick }: { label: string; open?: boolean; onClick?: () => void }) {
  return (
    <button className="ft-item" onClick={onClick}>
      <Ph_ name={open ? 'CaretDown' : 'CaretRight'} size={14} />
      <span className="ft-label">{label}</span>
    </button>
  )
}

export function FtLeaf({ leaf, active, nested, accent, iconSize = 14, onClick }: {
  leaf: TreeLeaf
  active?: boolean
  nested?: boolean
  iconSize?: number
  /** Guides mark the open page with a 2px accent bar; recipes/categories don't. */
  accent?: boolean
  onClick?: () => void
}) {
  return (
    <button
      className={`ft-item ft-leaf ${nested ? 'is-nested' : ''} ${accent ? 'has-accent' : ''}`}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
    >
      <Ph_ name={leaf.icon} size={iconSize} />
      <span className="ft-label">{leaf.label}</span>
      {leaf.tag && <span className="ft-tag">{leaf.tag}</span>}
    </button>
  )
}

/* ------------------------------------------------------------ hero */

/** The illustrated banner atop Recipes / Categories (Figma 259:19796).
    `spot` takes a spotkit SVG instead, drawn inside the same framed box. */
export function PageHero({ art, spot, title, sub, children }: {
  art?: 'recipes' | 'categories' | ArtItem[]
  spot?: string
  title: string
  sub: string
  /** Actions on the right of the banner. */
  children?: React.ReactNode
}) {
  return (
    <header className="pg-hero">
      {spot ? (
        <div className="pg-art is-spot" aria-hidden dangerouslySetInnerHTML={{ __html: spot }} />
      ) : (
        <div className="pg-art" aria-hidden>
          {Array.isArray(art) ? (
            <ArtLayer items={art} />
          ) : art === 'recipes' ? (
            <>
              <span className="pg-art-card a1"><Ph_ name="BookOpen" size={19} /><i style={{ width: 38 }} /><i style={{ width: 66, top: 19 }} /></span>
              <span className="pg-art-card a2"><Ph_ name="BracketsCurly" size={15} /><i style={{ width: 34 }} /><i style={{ width: 52, top: 16 }} /></span>
              <span className="pg-art-card a3"><Ph_ name="BookOpen" size={10.7} /><i style={{ width: 21.6 }} /><i style={{ width: 37, top: 10.7 }} /></span>
            </>
          ) : (
            <>
              <span className="pg-art-card c1">
                <Ph_ name="Stack" size={19} />
                <b style={{ left: 41, width: 27 }} /><b className="on" style={{ left: 72, width: 35 }} />
                <b style={{ left: 111, width: 23 }} /><b style={{ left: 138, width: 23 }} />
              </span>
              <span className="pg-art-list">
                {[0, 29, 58].map((y) => (
                  <span key={y} style={{ top: 7 + y }}>
                    <Ph_ name="BookOpen" size={15} /><i /><i className="long" />
                  </span>
                ))}
              </span>
            </>
          )}
        </div>
      )}
      <div className="pg-hero-text">
        <h1 className="pg-title">{title}</h1>
        <p className="pg-sub">{sub}</p>
      </div>
      {children && <div className="pg-hero-actions">{children}</div>}
    </header>
  )
}

/* ------------------------------------------------------------ art */

/** One shape in a banner illustration, positioned in Figma's 134×134 frame.
    card: a raised white tile · bar: grey skeleton line · icon: Phosphor glyph
    · vline/hline: hairline connector. */
export type ArtItem =
  | { k: 'card'; x: number; y: number; w: number; h: number; r: number; strong?: boolean; c?: ArtItem[] }
  | { k: 'bar'; x: number; y: number; w: number; h: number }
  | { k: 'icon'; x: number; y: number; s: number; n: string; dim?: boolean }
  | { k: 'vline' | 'hline'; x: number; y: number; len: number }
  | { k: 'img'; x: number; y: number; w: number; h: number; src: string }
  /** Round avatar disc in an accent tint, holding an icon or a short label. */
  | { k: 'disc'; x: number; y: number; s: number; bg: string; fg?: string; n?: string; t?: string }

function ArtLayer({ items }: { items: ArtItem[] }) {
  return (
    <>
      {items.map((it, i) => {
        const pos = { left: it.x, top: it.y }
        switch (it.k) {
          case 'card':
            return (
              <span key={i} className={`art-card ${it.strong ? 'is-strong' : ''}`} style={{ ...pos, width: it.w, height: it.h, borderRadius: it.r }}>
                {it.c && <ArtLayer items={it.c} />}
              </span>
            )
          case 'bar':
            return <i key={i} className="art-bar" style={{ ...pos, width: it.w, height: it.h }} />
          case 'icon':
            return <span key={i} className={`art-icon ${it.dim ? 'is-dim' : ''}`} style={pos}><Ph_ name={it.n} size={it.s} /></span>
          case 'img':
            return <img key={i} className="art-img" src={it.src} alt="" style={{ ...pos, width: it.w, height: it.h }} />
          case 'disc':
            return (
              <span key={i} className="art-disc" style={{ ...pos, width: it.s, height: it.s, background: it.bg, color: it.fg }}>
                {it.n ? <Ph_ name={it.n} size={Math.round(it.s * 0.6)} /> : it.t}
              </span>
            )
          default:
            return <i key={i} className={`art-${it.k}`} style={{ ...pos, [it.k === 'vline' ? 'height' : 'width']: it.len }} />
        }
      })}
    </>
  )
}
