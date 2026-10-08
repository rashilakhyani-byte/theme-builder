import { useState } from 'react'
import { actions, useStore } from '../store'
import type { Doc } from '../types'
import { TEMPLATES, blankDoc, docFromTemplate } from '../templates'
import { Ph_ } from '../ui/Phosphor'
import { SectionPreview } from './SectionPreview'
import { TemplatePreview } from './TemplatePreview'

type Approach = 'full' | 'split'
type FullView = 'gallery' | 'preview'

/**
 * v2's first run, shown over the builder the first time Customise is opened.
 * The cards are the preview and a generic name — everything else about a
 * template is visible the moment it's applied.
 */
export function StartScreen() {
  const version = useStore((s) => s.version)
  const started = useStore((s) => s.started)
  const saved = useStore((s) => s.templates)
  const activeId = useStore((s) => s.activeTemplateId)
  // A saved template keeps itself up to date, so only a portal that isn't one
  // yet can have work that a switch would lose.
  const dirty = useStore((s) => !s.activeTemplateId && s.doc !== s.cleanDoc)
  const [choice, setChoice] = useState<string>(() => activeId ?? TEMPLATES[0].id)
  // A switch waiting on "save your changes first?", and small manage states.
  const [pending, setPending] = useState<{ doc: Doc; id: string | null; name?: string } | null>(null)
  const [saveName, setSaveName] = useState('')
  const [renaming, setRenaming] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [approach, setApproach] = useState<Approach>(() => version === 'v3' ? 'split' : 'full')
  const [fullView, setFullView] = useState<FullView>('gallery')
  const [dismissed, setDismissed] = useState(false)
  const activeApproach: Approach = version === 'v3' ? 'split' : approach
  const template = TEMPLATES.find((t) => t.id === choice)
  const mine = saved.find((t) => t.id === choice)

  const pick = (id: string) => {
    setChoice(id)
    setRenaming(null)
    setConfirmDelete(false)
  }
  // First run just starts. Later, switching replaces the working portal, so
  // unsaved changes get a chance to be kept first.
  // `name` is set for a new portal (a starter or a blank one): it is saved as
  // a template of the admin's straight away, so it keeps itself up to date.
  const open = (doc: Doc, id: string | null, name?: string) => {
    if (started) actions.switchTo(doc, id)
    else actions.startWith(doc)
    if (name) actions.saveUntitledTemplate(name)
  }
  // Only reachable when the current portal couldn't be saved as a template
  // (the list is full): switching would lose it, so ask first.
  const apply = (doc: Doc, id: string | null, name?: string) => {
    if (started && dirty) {
      setSaveName('My portal')
      setPending({ doc, id, name })
    } else open(doc, id, name)
  }
  const go = () => (mine ? apply(mine.doc, mine.id) : template ? apply(docFromTemplate(template), null, template.name) : createFromScratch())
  const createFromScratch = () => apply(blankDoc(), null, 'Untitled template')
  const close = () => (started ? actions.closeTemplates() : setDismissed(true))

  const chooseForFullPreview = (id: string) => {
    setChoice(id)
    setFullView('preview')
  }

  const approachSwitch = (
    <div className="start-approach-switch" role="tablist" aria-label="Template preview approach">
      <button
        role="tab"
        aria-selected={approach === 'full'}
        className={approach === 'full' ? 'on' : ''}
        onClick={() => {
          setApproach('full')
          setFullView('gallery')
        }}
      >
        <Ph_ name="ArrowsOut" size={14} /> Full preview
      </button>
      <button
        role="tab"
        aria-selected={approach === 'split'}
        className={approach === 'split' ? 'on' : ''}
        onClick={() => setApproach('split')}
      >
        <Ph_ name="SidebarSimple" size={14} /> Split view
      </button>
    </div>
  )

  const gallery = (
    <div className="start-grid">
      {TEMPLATES.map((t) => {
        const on = choice === t.id
        const [type, variant] = t.sections[0]
        return (
          <button
            key={t.id}
            className={`start-card ${on ? 'on' : ''}`}
            onClick={() => chooseForFullPreview(t.id)}
            aria-pressed={on}
          >
            <span className="start-art">
              <SectionPreview
                type={type}
                variant={variant}
                maxHeight={150}
                theme={{ accent: t.accent, chrome: t.chrome, fontPrimary: t.fontPrimary, fontSecondary: t.fontSecondary }}
              />
            </span>
            <span className="start-name">
              {t.short}
            </span>
          </button>
        )
      })}
    </div>
  )

  const previewHeader = template && (
    <div className="start-preview-head">
      <div>
        <div className="start-preview-title">{template.name}</div>
        <div className="start-preview-tagline">{template.tagline}</div>
        <p>{template.description}</p>
      </div>
      <div className="start-preview-meta">
        <span style={{ background: template.accent }} />
        {template.sections.length} sections
      </div>
    </div>
  )

  if (dismissed) return null

  return (
    <div className="overlay start-overlay">
      <div className={`modal start-modal ${(activeApproach === 'split' || fullView === 'preview') ? 'is-wide' : ''}`}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{started ? 'Templates' : 'Start your portal'}</div>
            <div className="hint" style={{ marginTop: 2 }}>
              {started
                ? 'Switch to one of your templates, or start a new one from a starter. Your templates save automatically.'
                : 'Pick a template to customise, or start from a blank canvas and drag sections in.'}
            </div>
          </div>
          <div className="start-head-actions">
            {version !== 'v3' && approachSwitch}
            <button
              className="start-close"
              title="Close"
              aria-label="Close template selection"
              onClick={close}
            >
              <Ph_ name="X" size={18} />
            </button>
          </div>
        </div>

        {activeApproach === 'full' ? (
          <div className={`modal-body ${fullView === 'preview' ? 'start-full-preview' : ''}`}>
            {fullView === 'gallery' ? gallery : template && (
              <>
                <div className="start-detail-bar">
                  <button className="btn-ui outline" onClick={() => setFullView('gallery')}>
                    <Ph_ name="ArrowLeft" size={15} /> Back to Templates
                  </button>
                  {previewHeader}
                </div>
                <div className="template-preview-scroll">
                  <TemplatePreview template={template} />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="modal-body start-split">
            <aside className="start-template-list" aria-label="Templates">
              {saved.length > 0 && <div className="start-list-label">My templates</div>}
              {saved.map((t) => {
                const first = t.doc.pages.home.body[0] ?? t.doc.nav
                const on = choice === t.id
                const isRenaming = on && renaming !== null
                return (
                  <div
                    key={t.id}
                    role="button"
                    tabIndex={0}
                    className={`start-template-row is-mine ${on ? 'on' : ''}`}
                    onClick={() => pick(t.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) pick(t.id) }}
                    aria-pressed={on}
                    aria-label={t.name}
                  >
                    <span className="start-template-thumb">
                      <SectionPreview
                        type={first.type}
                        variant={first.variant}
                        props={first.props}
                        surface={first.surface}
                        maxHeight={112}
                        fit="cover"
                        theme={{ accent: t.doc.theme.accent, chrome: t.doc.theme.chrome, fontPrimary: t.doc.theme.fontPrimary, fontSecondary: t.doc.theme.fontSecondary }}
                      />
                    </span>
                    {isRenaming ? (
                      <input
                        autoFocus
                        className="start-rename-input"
                        value={renaming}
                        aria-label="Template name"
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setRenaming(e.target.value)}
                        onBlur={(e) => { actions.renameTemplate(t.id, e.target.value); setRenaming(null) }}
                        onKeyDown={(e) => {
                          e.stopPropagation()
                          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                          if (e.key === 'Escape') setRenaming(null)
                        }}
                      />
                    ) : (
                      <span className="start-template-name">
                        <span className="start-template-name-text">{t.name}</span>
                        {t.id === activeId && <span className="start-template-badge">In use</span>}
                      </span>
                    )}
                    {/* Shown on hover and on the selected card. */}
                    <span className="start-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button title="Rename" aria-label={`Rename ${t.name}`} onClick={() => { pick(t.id); setRenaming(t.name) }}>
                        <Ph_ name="PencilSimple" size={14} />
                      </button>
                      <button title="Duplicate" aria-label={`Duplicate ${t.name}`} onClick={() => actions.duplicateTemplate(t.id)}>
                        <Ph_ name="Copy" size={14} />
                      </button>
                      <button
                        className={`danger ${on && confirmDelete ? 'confirm' : ''}`}
                        title={on && confirmDelete ? 'Click again to delete' : 'Delete'}
                        aria-label={`Delete ${t.name}`}
                        onClick={() => {
                          if (!(on && confirmDelete)) { pick(t.id); setConfirmDelete(true); return }
                          actions.deleteTemplate(t.id)
                          pick(TEMPLATES[0].id)
                        }}
                      >
                        <Ph_ name="Trash" size={14} />
                        {on && confirmDelete && <span>Delete?</span>}
                      </button>
                    </span>
                  </div>
                )
              })}
              {saved.length > 0 && <div className="start-list-label">Starter templates</div>}
              {TEMPLATES.map((t) => {
                const [type, variant] = t.sections[0]
                return (
                  <button
                    key={t.id}
                    className={`start-template-row ${choice === t.id ? 'on' : ''}`}
                    onClick={() => pick(t.id)}
                    aria-pressed={choice === t.id}
                    aria-label={t.name}
                  >
                    <span className="start-template-thumb">
                      <SectionPreview
                        type={type}
                        variant={variant}
                        maxHeight={112}
                        fit="cover"
                        theme={{ accent: t.accent, chrome: t.chrome, fontPrimary: t.fontPrimary, fontSecondary: t.fontSecondary }}
                      />
                    </span>
                  </button>
                )
              })}
            </aside>
            <div className="start-split-main">
              {mine ? (
                <div className="start-v3-preview">
                  <TemplatePreview key={mine.id} doc={mine.doc} />
                </div>
              ) : template ? (
                version === 'v3' ? (
                  <div className="start-v3-preview">
                    <TemplatePreview template={template} />
                  </div>
                ) : (
                  <>
                    {previewHeader}
                    <div className="template-preview-scroll">
                      <TemplatePreview template={template} />
                    </div>
                  </>
                )
              ) : (
                <div className="start-blank-preview">
                  <span className="start-blank-mark"><Ph_ name="Plus" size={22} /></span>
                  <b>Blank canvas</b>
                  <span>Start with navigation and footer, then drag in the sections you need.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {pending ? (
          <div className="modal-foot start-confirm">
            <span className="start-confirm-text">This portal isn’t saved as a template yet. Save it before switching?</span>
            <input
              className="control start-name-input"
              value={saveName}
              aria-label="Template name"
              onChange={(e) => setSaveName(e.target.value)}
            />
            <button
              className="btn-ui primary start-go"
              onClick={() => {
                // Keep the current work first; only switch if the save went through.
                if (actions.saveTemplate(saveName)) open(pending.doc, pending.id, pending.name)
                setPending(null)
              }}
            >
              Save and switch
            </button>
            <button className="btn-ui outline" onClick={() => { open(pending.doc, pending.id, pending.name); setPending(null) }}>
              Switch without saving
            </button>
            <button className="btn-ui outline" onClick={() => setPending(null)}>Cancel</button>
          </div>
        ) : (
        <div className="modal-foot">
          {activeApproach === 'full' && fullView === 'gallery' && template && (
            <button className="btn-ui outline" onClick={() => setFullView('preview')}>
              <Ph_ name="Eye" size={15} /> Preview Selected
            </button>
          )}
          <button className="btn-ui outline start-scratch" onClick={createFromScratch}>
            Create From Scratch
          </button>
          <button className="btn-ui primary start-go" onClick={go} disabled={!!mine && mine.id === activeId}>
            {mine && mine.id === activeId ? 'In use' : 'Use This Template'}
            <Ph_ name="ArrowRight" size={15} />
          </button>
        </div>
        )}
      </div>
    </div>
  )
}
