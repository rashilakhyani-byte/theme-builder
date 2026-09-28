import { useCallback, useMemo, useRef, useState } from 'react'
import { actions, useStore } from '../store'
import { DEFAULT_FONT, FONTS, FONT_KINDS, fontStack, useFonts } from '../theme/fonts'
import { Ph_ } from '../ui/Phosphor'
import { useDismiss } from '../ui/useDismiss'

const ALL_FAMILIES = FONTS.map((f) => f.family)

function FontSelect({
  label,
  help,
  value,
  onChange,
  customFamilies,
}: {
  label: string
  help: string
  value: string
  onChange: (family: string) => void
  customFamilies: string[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(open, ref, close)
  // Load the whole shelf only once someone opens the menu.
  useFonts(open ? ALL_FAMILIES : [value])

  const def = FONTS.find((f) => f.family === value)

  return (
    <div className="field-ui">
      <label>{label}</label>
      <div className="font-select" ref={ref}>
        <button
          type="button"
          className={`input-area font-trigger ${open ? 'open' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <Ph_ name="TextAa" size={16} />
          <span className="font-trigger-name" style={{ fontFamily: fontStack(value) }}>{value}</span>
          <span className="font-trigger-kind">{def?.kind}</span>
          <Ph_ name="CaretDown" size={14} />
        </button>

        {open && (
          <div className="font-menu" role="listbox" aria-label={label}>
            {FONT_KINDS.map((kind) => (
              <div key={kind}>
                <div className="font-menu-label">{kind}</div>
                {FONTS.filter((f) => f.kind === kind).map((f) => (
                  <button
                    key={f.family}
                    type="button"
                    role="option"
                    aria-selected={f.family === value}
                    className={`font-option ${f.family === value ? 'on' : ''}`}
                    onClick={() => {
                      onChange(f.family)
                      setOpen(false)
                    }}
                  >
                    <span className="font-option-aa" style={{ fontFamily: fontStack(f.family) }}>Aa</span>
                    <span className="font-option-name" style={{ fontFamily: fontStack(f.family) }}>{f.family}</span>
                    {f.family === value && <Ph_ name="Check" size={14} className="font-option-check" />}
                  </button>
                ))}
              </div>
            ))}
            {!!customFamilies.length && (
              <div>
                <div className="font-menu-label">Uploaded</div>
                {customFamilies.map((family) => (
                  <button
                    key={family}
                    type="button"
                    role="option"
                    aria-selected={family === value}
                    className={`font-option ${family === value ? 'on' : ''}`}
                    onClick={() => {
                      onChange(family)
                      setOpen(false)
                    }}
                  >
                    <span className="font-option-aa" style={{ fontFamily: fontStack(family) }}>Aa</span>
                    <span className="font-option-name" style={{ fontFamily: fontStack(family) }}>{family}</span>
                    {family === value && <Ph_ name="Check" size={14} className="font-option-check" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="hint">{help}</div>
    </div>
  )
}

export function TypographyPanel() {
  const theme = useStore((s) => s.doc.theme)
  const uploadRef = useRef<HTMLInputElement>(null)
  const [uploadMessage, setUploadMessage] = useState('')
  const primary = theme.fontPrimary ?? DEFAULT_FONT
  const secondary = theme.fontSecondary ?? DEFAULT_FONT
  const customFamilies = useMemo(() => (theme.customFonts ?? []).map((font) => font.family), [theme.customFonts])

  useFonts([primary, secondary])

  return (
    <div className="sect">
      <div className="sect-label">Typography</div>
      <div className="tp-upload-row">
        <div className="tp-upload-copy">
          <label>Custom fonts</label>
          <span className="hint">Upload WOFF, WOFF2, TTF or OTF.</span>
          {uploadMessage && <span className="tp-upload-message">{uploadMessage}</span>}
        </div>
        <input
          ref={uploadRef}
          className="tp-upload-input"
          type="file"
          accept=".woff,.woff2,.ttf,.otf,font/woff,font/woff2,font/ttf,font/otf"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            const family = file.name.replace(/\.(woff2?|ttf|otf)$/i, '').replace(/[-_]+/g, ' ').trim()
            const reader = new FileReader()
            reader.onload = () => {
              const dataUrl = String(reader.result ?? '')
              if (!dataUrl || !family) return
              const customFonts = [...(theme.customFonts ?? []).filter((font) => font.family !== family), { family, dataUrl }]
              actions.setTheme({ customFonts })
              setUploadMessage(`${family} uploaded. Choose it for either font.`)
            }
            reader.onerror = () => setUploadMessage('This font could not be uploaded.')
            reader.readAsDataURL(file)
            event.target.value = ''
          }}
        />
        <button type="button" className="btn-ui outline tp-upload-btn" onClick={() => uploadRef.current?.click()}>
          <Ph_ name="UploadSimple" size={14} /> Upload font
        </button>
      </div>

      <FontSelect
        label="Primary font"
        value={primary}
        onChange={(f) => actions.setTheme({ fontPrimary: f })}
        help="Headings and display text — titles, card headings, big numbers."
        customFamilies={customFamilies}
      />
      <FontSelect
        label="Secondary font"
        value={secondary}
        onChange={(f) => actions.setTheme({ fontSecondary: f })}
        help="Body and interface text — paragraphs, links, buttons, forms."
        customFamilies={customFamilies}
      />

    </div>
  )
}
