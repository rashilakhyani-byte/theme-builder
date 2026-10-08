import { useCallback, useEffect, useMemo, useState } from 'react'
import { actions, useStore } from './store'
import { paletteTokens } from './theme/palette'
import { DEFAULT_FONT, fontStack, useCustomFonts, useFonts } from './theme/fonts'
import { Canvas } from './canvas/Canvas'
import { LeftPanel } from './panels/LeftPanel'
import { AddSection } from './panels/AddSection'
import { PortalShell } from './portal/PortalShell'
import { StartScreen } from './panels/StartScreen'
import { Icon } from './ui/Icon'
import { Ph_ } from './ui/Phosphor'

const DEVICES = [
  { id: 'desktop', label: 'Desktop' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'mobile', label: 'Mobile' },
] as const

/** Which template the admin is working on. Opens the template window to switch or manage. */
function TemplatesButton() {
  const active = useStore((s) => s.templates.find((t) => t.id === s.activeTemplateId))
  const open = useStore((s) => s.templatesOpen)

  return (
    <button
      className={`templates-btn ${open ? 'on' : ''}`}
      onClick={() => actions.openTemplates()}
      aria-haspopup="dialog"
      title="Switch or manage templates"
    >
      <Ph_ name="SquaresFour" size={16} />
      <span className="templates-btn-text">
        <span className="templates-btn-kicker">Template</span>
        <span className="templates-btn-name">{active ? active.name : 'Not saved'}</span>
      </span>
    </button>
  )
}

function BuilderBar({ onToast }: { onToast: (msg: string) => void }) {
  const device = useStore((s) => s.device)
  const preview = useStore((s) => s.preview)
  const canUndo = useStore((s) => s.past.length > 0)
  const canRedo = useStore((s) => s.future.length > 0)
  const navOpen = useStore((s) => s.navOpen)
  const version = useStore((s) => s.version)

  return (
    <header className="topbar">
      <div className="topbar-side">
        {/* The portal's top bar is hidden in here, so this is the only way back
            to the navigation. */}
        <button className="btn-ui icon" onClick={() => actions.toggleNav()} title={navOpen ? 'Hide navigation' : 'Show navigation'}>
          <Ph_ name="SidebarSimple" size={20} />
        </button>
        <span className="topbar-title">Builder</span>
        <span className="divider-v" />
        <button className="btn-ui icon" title="Undo (⌘Z)" disabled={!canUndo} onClick={() => actions.undo()}>
          <Ph_ name="ArrowUUpLeft" size={16} />
        </button>
        <button className="btn-ui icon" title="Redo (⇧⌘Z)" disabled={!canRedo} onClick={() => actions.redo()}>
          <Ph_ name="ArrowUUpRight" size={16} />
        </button>
      </div>

      <div className="mode-switch" role="group" aria-label="Builder mode">
        <button
          className={!preview ? 'on' : ''}
          aria-pressed={!preview}
          onClick={() => actions.setPreview(false)}
        >
          <Ph_ name="NotePencil" size={16} />
          Edit
        </button>
        <button
          className={preview ? 'on' : ''}
          aria-pressed={preview}
          onClick={() => actions.setPreview(true)}
        >
          <Ph_ name="Eye" size={17} />
          Preview
        </button>
      </div>

      <div className="topbar-side end">
        {preview && (
          <div className="preview-devices" role="group" aria-label="Preview device">
            {DEVICES.map((d) => {
              const icon = d.id === 'desktop' ? 'Desktop' : d.id === 'tablet' ? 'DeviceTablet' : 'DeviceMobile'
              return (
                <button
                  key={d.id}
                  className={device === d.id ? 'on' : ''}
                  aria-label={`${d.label} preview`}
                  aria-pressed={device === d.id}
                  title={d.label}
                  onClick={() => actions.setDevice(d.id)}
                >
                  <Ph_ name={icon} size={16} />
                </button>
              )
            })}
          </div>
        )}
        {version !== 'v1' && <TemplatesButton />}
        <button className="btn-ui primary" onClick={() => onToast('Published')}>
          <Ph_ name="RocketLaunch" size={16} /> Publish Changes
        </button>
      </div>
    </header>
  )
}

function Builder({ onToast }: { onToast: (msg: string) => void }) {
  const preview = useStore((s) => s.preview)
  const version = useStore((s) => s.version)
  const started = useStore((s) => s.started)
  const templatesOpen = useStore((s) => s.templatesOpen)
  const [addAt, setAddAt] = useState<number | null>(null)

  // v1 picks sections from a modal; v2/v3 keep the library in the side panel,
  // where it can be dragged onto the canvas.
  const onAdd = (i: number) => (version !== 'v1' ? actions.openLibrary(i) : setAddAt(i))

  return (
    <div className="builder">
      <BuilderBar onToast={onToast} />
      <div className={`workspace ${preview ? 'preview-mode' : ''}`}>
        <LeftPanel onAdd={onAdd} />
        <Canvas onAdd={onAdd} />
      </div>
      {addAt !== null && <AddSection index={addAt} onClose={() => setAddAt(null)} />}
      {/* First run: the builder is already behind it, so the choice reads as a
          starting point rather than a separate step. */}
      {version !== 'v1' && (!started || templatesOpen) && <StartScreen key={templatesOpen ? 'switch' : 'start'} />}
    </div>
  )
}

export default function App() {
  const theme = useStore((s) => s.doc.theme)
  const appMode = useStore((s) => s.appMode)
  const selection = useStore((s) => s.selection)
  const [toast, setToast] = useState<string | null>(null)
  const notice = useStore((s) => s.notice)

  // A deletion notice stays long enough to reach for Undo.
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => actions.dismissNotice(), 6000)
    return () => window.clearTimeout(timer)
  }, [notice?.n])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 1800)
  }, [])

  const fontPrimary = theme.fontPrimary ?? DEFAULT_FONT
  const fontSecondary = theme.fontSecondary ?? DEFAULT_FONT
  useFonts([fontPrimary, fontSecondary])
  useCustomFonts(theme.customFonts)

  // Layer 1 of the token system, applied once at the root so the portal chrome
  // and the previewed site read from the same generated palette. The two font
  // roles ride along, so the canvas only has to consume them.
  const primitives = useMemo(
    () => ({
      ...paletteTokens(theme.accent, theme.appearance),
      '--font-primary': fontStack(fontPrimary),
      '--font-secondary': fontStack(fontSecondary),
    }),
    [theme.accent, theme.appearance, fontPrimary, fontSecondary],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (appMode !== 'builder') return
      const el = document.activeElement as HTMLElement | null
      const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (typing) return
        e.preventDefault()
        e.shiftKey ? actions.redo() : actions.undo()
        return
      }
      if (e.key === 'Escape') {
        if (typing) return
        actions.panelBack()
        return
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !typing && selection?.sectionId) {
        e.preventDefault()
        actions.removeSection(selection.sectionId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selection?.sectionId, appMode])

  return (
    <div className="app-root" data-appearance={theme.appearance} style={primitives as React.CSSProperties}>
      <PortalShell>
        {appMode === 'builder' && <Builder onToast={showToast} />}
      </PortalShell>

      {toast && !notice && (
        <div className="toast">
          <Icon name="check" size={14} /> {toast}
        </div>
      )}
      {notice && (
        <div className="toast" role="status">
          <Icon name={notice.undo ? 'trash' : 'check'} size={14} /> {notice.msg}
          {notice.undo && (
            <button
              className="toast-action"
              onClick={() => {
                actions.undo()
                actions.dismissNotice()
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  )
}
