import { useState } from 'react'
import { actions, useStore } from '../store'
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
  const [choice, setChoice] = useState<string>(TEMPLATES[0].id)
  const [approach, setApproach] = useState<Approach>(() => version === 'v3' ? 'split' : 'full')
  const [fullView, setFullView] = useState<FullView>('gallery')
  const [dismissed, setDismissed] = useState(false)
  const activeApproach: Approach = version === 'v3' ? 'split' : approach
  const template = TEMPLATES.find((t) => t.id === choice)

  const go = () => actions.startWith(template ? docFromTemplate(template) : blankDoc())
  const createFromScratch = () => actions.startWith(blankDoc())

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
            <div className="modal-title">Start your portal</div>
            <div className="hint" style={{ marginTop: 2 }}>
              Pick a template to customise, or start from a blank canvas and drag sections in.
            </div>
          </div>
          <div className="start-head-actions">
            {version !== 'v3' && approachSwitch}
            <button
              className="start-close"
              title="Close"
              aria-label="Close template selection"
              onClick={() => setDismissed(true)}
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
              {TEMPLATES.map((t) => {
                const [type, variant] = t.sections[0]
                return (
                  <button
                    key={t.id}
                    className={`start-template-row ${choice === t.id ? 'on' : ''}`}
                    onClick={() => setChoice(t.id)}
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
              {template ? (
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

        <div className="modal-foot">
          {activeApproach === 'full' && fullView === 'gallery' && template && (
            <button className="btn-ui outline" onClick={() => setFullView('preview')}>
              <Ph_ name="Eye" size={15} /> Preview Selected
            </button>
          )}
          <button className="btn-ui outline start-scratch" onClick={createFromScratch}>
            Create From Scratch
          </button>
          <button className="btn-ui primary start-go" onClick={go}>
            Use This Template
            <Ph_ name="ArrowRight" size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
