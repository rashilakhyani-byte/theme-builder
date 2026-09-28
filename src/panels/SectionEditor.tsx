import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { actions, useStore } from '../store'
import { REGISTRY } from '../registry'
import type { Field, Section, Surface } from '../types'
import type { GeneratedPalette as Palette } from '../theme/palette'
import { buildPalette } from '../theme/palette'
import { Icon } from '../ui/Icon'
import { Ph_ } from '../ui/Phosphor'
import { FieldList } from './Fields'
import { SectionPreview } from './SectionPreview'
import { useDismiss } from '../ui/useDismiss'
import { createPortal } from 'react-dom'

/** `swatch` picks the colour to show from the generated palette. */
const SURFACES: { id: Surface; label: string; swatch: (p: Palette, dark: Palette) => string }[] = [
  { id: 'page', label: 'Page', swatch: (p) => p.background },
  { id: 'muted', label: 'Tinted', swatch: (p) => p.accentScale[1] },
  { id: 'brand', label: 'Brand', swatch: (p) => p.accentScale[8] },
  { id: 'inverted', label: 'Dark', swatch: (_p, dark) => dark.grayScale[1] },
]

function SurfacePicker({ sectionId, current }: { sectionId: string; current: Surface }) {
  const theme = useStore((s) => s.doc.theme)
  const palette = useMemo(
    () => buildPalette(theme.appearance, { accent: theme.accent }),
    [theme.accent, theme.appearance],
  )
  const darkPalette = useMemo(
    () => (theme.appearance === 'dark' ? palette : buildPalette('dark', { accent: theme.accent })),
    [theme.appearance, theme.accent, palette],
  )
  return (
    <div className="surface-grid">
      {SURFACES.map((s) => (
        <button
          key={s.id}
          className={`surf-swatch ${current === s.id ? 'on' : ''}`}
          onClick={() => {
            actions.setSurface(sectionId, s.id)
            actions.revealElement(sectionId)
          }}
          aria-pressed={current === s.id}
        >
          <span className="surf-chip" style={{ background: s.swatch(palette, darkPalette) }} />
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  )
}

function VariantPicker({ section }: { section: Section }) {
  const def = REGISTRY[section.type]
  return (
    <div className="variant-list">
      {def.variants.map((variant) => {
        const on = section.variant === variant.id
        return (
          <button
            key={variant.id}
            className={`variant ${on ? 'on' : ''}`}
            onClick={() => {
              actions.setVariant(section.id, variant.id)
              actions.revealElement(section.id)
            }}
            aria-pressed={on}
          >
            <SectionPreview
              type={section.type}
              variant={variant.id}
              props={section.props}
              surface={on ? section.surface : variant.surface ?? section.surface}
              maxHeight={96}
            />
            {on && <Ph_ name="CheckCircle" size={16} weight="fill" className="variant-check" />}
            <span className="variant-name">{variant.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/** Keep the panel relevant to the selected layout, including nested fields. */
function fieldsForVariant(fields: Field[], variant: string): Field[] {
  const visible: Field[] = []
  for (const field of fields) {
    if (field.variants && !field.variants.includes(variant)) continue
    if (field.kind === 'toggle' || field.kind === 'group') {
      visible.push({ ...field, children: field.children ? fieldsForVariant(field.children, variant) : field.children } as Field)
      continue
    }
    if (field.kind === 'list') {
      visible.push({ ...field, itemFields: fieldsForVariant(field.itemFields, variant) })
      continue
    }
    visible.push(field)
  }
  return visible
}

/** Each divider in a schema starts a new titled panel section. */
function splitSections(fields: Field[]) {
  const out: { title: string; fields: Field[] }[] = [{ title: 'Content', fields: [] }]
  for (const f of fields) {
    if (f.kind === 'divider') out.push({ title: f.label ?? '', fields: [] })
    else out[out.length - 1].fields.push(f)
  }
  return out.filter((s) => s.fields.length)
}

/** Level two of the left panel: everything about one section. */
export function SectionEditor({ section, pinned }: { section: Section; pinned: boolean }) {
  const def = REGISTRY[section.type]
  const count = def.variants.length
  const version = useStore((s) => s.version)
  const groups = useMemo(
    () => splitSections(fieldsForVariant(def.fields, section.variant)),
    [def, section.variant],
  )

  if (version === 'v3') {
    return <PopupSectionEditor section={section} pinned={pinned} groups={groups} />
  }

  return (
    <>
      {count > 1 && (
        <div className="sect">
          <div className="sect-label">
            Layout
          </div>
          <div className="variant-list">
            {def.variants.map((v) => {
              const on = section.variant === v.id
              return (
                <button
                  key={v.id}
                  className={`variant ${on ? 'on' : ''}`}
                  onClick={() => {
                    actions.setVariant(section.id, v.id)
                    actions.revealElement(section.id)
                  }}
                  aria-pressed={on}
                  title={v.label}
                >
                  <SectionPreview
                    type={section.type}
                    variant={v.id}
                    props={section.props}
                    surface={on ? section.surface : v.surface ?? section.surface}
                    maxHeight={96}
                  />
                  {on && <Ph_ name="CheckCircle" size={16} weight="fill" className="variant-check" />}
                  <span className="variant-name">{v.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="sect">
        <div className="sect-label">Background</div>
        <SurfacePicker sectionId={section.id} current={section.surface} />
      </div>

      {groups.map((g) => (
        <div className="sect" key={g.title}>
          <div className="sect-label">{g.title}</div>
          <FieldList sectionId={section.id} fields={g.fields} />
        </div>
      ))}

      {!pinned && (
        <div className="sect">
          <button className="btn-ui danger delete-section-btn" onClick={() => actions.removeSection(section.id)}>
            <Icon name="trash" size={13} /> Delete section
          </button>
        </div>
      )}
    </>
  )
}

type EditorGroup = { title: string; fields: Field[]; listLabel?: string }
type PopupKey = 'layout' | 'background' | `group-${number}` | `item-${number}-${number}` | `child-${number}-${number}-${number}` | `action-${number}-${number}`

function fieldOwnsPath(field: Field, path: string): boolean {
  if (field.kind === 'divider') return false
  if (field.kind === 'group') return field.children.some((child) => fieldOwnsPath(child, path))
  if (field.kind === 'list') return path === field.path || path.startsWith(`${field.path}[`)
  return path === field.path || path.startsWith(`${field.path}.`)
}

function togglePopupLabel(sectionType: Section['type'], field: Extract<Field, { kind: 'toggle' }>) {
  if (sectionType === 'nav' && field.path === 'showCta') return 'Primary CTA'
  if (sectionType === 'nav' && field.path === 'showSecondary') return 'Secondary CTA'
  return field.label
}

const NAV_VISIBILITY_OPTIONS = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'logged-in', label: 'Logged-in users only' },
  { value: 'logged-out', label: 'Logged-out users only' },
  { value: 'role', label: 'Specific permission role' },
  { value: 'group', label: 'Specific user group' },
]
const NAV_ROLE_OPTIONS = [
  { value: 'any', label: 'Any role' }, { value: 'admin', label: 'Administrator' },
  { value: 'developer', label: 'Developer' }, { value: 'partner', label: 'Partner' },
  { value: 'viewer', label: 'Viewer' },
]
const NAV_GROUP_OPTIONS = [
  { value: 'any', label: 'Any group' }, { value: 'internal', label: 'Internal team' },
  { value: 'partners', label: 'Partners' }, { value: 'customers', label: 'Customers' },
  { value: 'beta', label: 'Beta testers' },
]

function NavAttributeEditor({
  sectionId,
  basePath,
  value,
  hideLink = false,
}: {
  sectionId: string
  basePath: string
  value: any
  hideLink?: boolean
}) {
  const set = (key: string, next: any) => actions.setProp(sectionId, `${basePath}.${key}`, next)
  const visibility = String(value?.visibility ?? 'everyone')
  return (
    <div className="v3-nav-attributes">
      <label className="v3-attribute-field">
        <span>Label</span>
        <input className="control" value={String(value?.label ?? '')} onChange={(event) => set('label', event.target.value)} />
      </label>
      {!hideLink && (
        <label className="v3-attribute-field">
          <span>Link</span>
          <input className="control" value={String(value?.href ?? '')} placeholder="https:// or /path" onChange={(event) => set('href', event.target.value)} />
        </label>
      )}
      <label className="v3-check-row">
        <input type="checkbox" checked={Boolean(value?.newTab)} onChange={(event) => set('newTab', event.target.checked)} />
        <span>Open in new tab</span>
      </label>
      <div className="v3-permissions">
        <div className="v3-permissions-title">Access permissions</div>
        <label className="v3-attribute-field">
          <span>Visible to</span>
          <select className="control" value={visibility} onChange={(event) => set('visibility', event.target.value)}>
            {NAV_VISIBILITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className={`v3-attribute-field ${visibility === 'everyone' ? 'is-disabled' : ''}`}>
          <span>Permission role</span>
          <select className="control" value={String(value?.role ?? 'any')} disabled={visibility === 'everyone'} onChange={(event) => set('role', event.target.value)}>
            {NAV_ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className={`v3-attribute-field ${visibility === 'everyone' ? 'is-disabled' : ''}`}>
          <span>User group</span>
          <select className="control" value={String(value?.group ?? 'any')} disabled={visibility === 'everyone'} onChange={(event) => set('group', event.target.value)}>
            {NAV_GROUP_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>
    </div>
  )
}

function PopupSectionEditor({
  section,
  pinned,
  groups: sourceGroups,
}: {
  section: Section
  pinned: boolean
  groups: EditorGroup[]
}) {
  const def = REGISTRY[section.type]
  const isNavigation = section.type === 'nav'
  const groups = useMemo(() => sourceGroups.flatMap((group) => {
    const lists = group.fields.filter((field): field is Extract<Field, { kind: 'list' }> => field.kind === 'list')
    if (!lists.length) return [group]
    const remaining = group.fields.filter((field) => field.kind !== 'list')
    const listGroups: EditorGroup[] = lists.map((field) => ({
      title: remaining.length || lists.length > 1 ? field.label : group.title,
      fields: [field],
      ...(remaining.length || lists.length > 1 ? {} : { listLabel: field.label }),
    }))
    return remaining.length ? [{ title: group.title, fields: remaining }, ...listGroups] : listGroups
  }), [sourceGroups])
  const selectedPath = useStore((s) => (
    s.selection?.sectionId === section.id ? s.selection.path : undefined
  ))
  const [open, setOpen] = useState<PopupKey | null>(null)
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(null), [])
  useDismiss(open !== null, popupRef, close)

  const openPopup = useCallback((key: PopupKey, target?: HTMLElement | null) => {
    const row = target ?? editorRef.current?.querySelector<HTMLElement>(`[data-popup-key="${key}"]`)
    if (row) setAnchor(row.getBoundingClientRect())
    setOpen(key)
  }, [])

  useEffect(() => {
    if (!selectedPath) return
    const index = groups.findIndex((group) => group.fields.some((field) => fieldOwnsPath(field, selectedPath)))
    if (index < 0) return
    const isToggleGroup = groups[index].fields.length > 0
      && groups[index].fields.every((field) => field.kind === 'toggle' && field.children?.length)
    if (isToggleGroup) {
      const actionIndex = groups[index].fields.findIndex((field) => (
        field.kind === 'toggle'
        && (selectedPath === field.path || field.children?.some((child) => fieldOwnsPath(child, selectedPath)))
      ))
      if (actionIndex >= 0) {
        openPopup(`action-${index}-${actionIndex}`)
        return
      }
    }
    const list = groups[index].fields.length === 1 && groups[index].fields[0].kind === 'list'
      ? groups[index].fields[0]
      : null
    const match = list && selectedPath.startsWith(`${list.path}[`)
      ? selectedPath.slice(list.path.length).match(/^\[(\d+)\]/)
      : null
    if (match) {
      const itemIndex = Number(match[1])
      const childMatch = selectedPath.match(/\.children\[(\d+)\]/)
      openPopup(childMatch ? `child-${index}-${itemIndex}-${Number(childMatch[1])}` : `item-${index}-${itemIndex}`)
    } else {
      openPopup(`group-${index}`)
    }
  }, [selectedPath, groups, openPopup, isNavigation])

  const groupIndex = open?.startsWith('group-') ? Number(open.slice(6)) : -1
  const itemMatch = open?.match(/^item-(\d+)-(\d+)$/)
  const childMatch = open?.match(/^child-(\d+)-(\d+)-(\d+)$/)
  const actionMatch = open?.match(/^action-(\d+)-(\d+)$/)
  const activeItemMatch = itemMatch ?? childMatch
  const itemGroupIndex = activeItemMatch ? Number(activeItemMatch[1]) : -1
  const itemIndex = activeItemMatch ? Number(activeItemMatch[2]) : -1
  const childIndex = childMatch ? Number(childMatch[3]) : -1
  const itemField = itemGroupIndex >= 0 && groups[itemGroupIndex]?.fields[0]?.kind === 'list'
    ? groups[itemGroupIndex].fields[0]
    : null
  const item = itemField && itemIndex >= 0
    ? ((section.props as any)[itemField.path] ?? [])[itemIndex]
    : null
  const childItem = childIndex >= 0 ? item?.children?.[childIndex] : null
  const attributeFields = itemField?.itemFields.map((field) => (
    field.kind === 'toggle' && field.path === 'dropdown' ? { ...field, children: undefined } : field
  ))
  const actionGroupIndex = actionMatch ? Number(actionMatch[1]) : -1
  const actionFieldIndex = actionMatch ? Number(actionMatch[2]) : -1
  const actionField = actionGroupIndex >= 0 && groups[actionGroupIndex]?.fields[actionFieldIndex]?.kind === 'toggle'
    ? groups[actionGroupIndex].fields[actionFieldIndex]
    : null
  const actionTitle = actionField?.kind === 'toggle'
    ? togglePopupLabel(section.type, actionField)
    : ''
  const popupTitle = open === 'layout'
    ? 'Layout'
    : open === 'background'
      ? 'Background'
      : itemField
        ? String((childMatch ? childItem : item)?.[itemField.itemTitle] ?? '') || `${childMatch ? 'Child' : 'Item'} ${childMatch ? childIndex + 1 : itemIndex + 1}`
        : actionField
          ? actionTitle
          : groups[groupIndex]?.title ?? ''

  return (
    <div className="v3-editor" ref={editorRef}>
      <div className="v3-setting-list">
        {def.variants.length > 1 && (
          <V3InlineGroup title="Layout">
            <VariantPicker section={section} />
          </V3InlineGroup>
        )}
        <div className="v3-inline-group">
          <div className="v3-inline-title">Background</div>
          <SurfacePicker sectionId={section.id} current={section.surface} />
        </div>
        {groups.map((group, index) => {
          const list = group.fields.length === 1 && group.fields[0].kind === 'list'
            ? group.fields[0]
            : null
          if (isNavigation && group.title === 'Content') {
            const logoFields = group.fields
              .filter((field) => field.kind === 'image')
              .map((field) => ({ ...field, label: '' }))
            return (
              <V3InlineGroup key={`${group.title}-${index}`} title="Brand logo">
                <FieldList sectionId={section.id} fields={logoFields} />
              </V3InlineGroup>
            )
          }
          if (group.title === 'Content') {
            return (
              <V3InlineGroup key={`${group.title}-${index}`} title="Content">
                <FieldList sectionId={section.id} fields={group.fields} />
              </V3InlineGroup>
            )
          }
          const isToggleGroup = group.fields.length > 0
            && group.fields.every((field) => field.kind === 'toggle' && field.children?.length)
          if (isToggleGroup) {
            return (
              <V3ActionGroup
                key={`${group.title}-${index}`}
                section={section}
                group={group}
                groupIndex={index}
                openPopup={openPopup}
              />
            )
          }
          return list ? (
            <V3ListGroup
              key={`${group.title}-${index}`}
              section={section}
              group={group}
              groupIndex={index}
              field={list}
              openPopup={openPopup}
            />
          ) : (
            <SettingRow
              key={`${group.title}-${index}`}
              icon={group.title === 'Artwork' ? undefined : group.title === 'Content' ? 'TextT' : 'SlidersHorizontal'}
              label={group.title}
              value={`${group.fields.length} ${group.fields.length === 1 ? 'setting' : 'settings'}`}
              popupKey={`group-${index}`}
              onClick={(target) => openPopup(`group-${index}`, target)}
            />
          )
        })}
      </div>

      {!pinned && (
        <button className="v3-delete" onClick={() => actions.removeSection(section.id)}>
          <Icon name="trash" size={13} /> Delete section
        </button>
      )}

      {open && anchor && createPortal(
        <div
          className="v3-popup"
          ref={popupRef}
          role="dialog"
          aria-modal="false"
          aria-label={`Edit ${popupTitle}`}
          style={{
            left: Math.min(anchor.right + 10, window.innerWidth - 354),
            top: 66,
            maxHeight: window.innerHeight - 78,
          }}
        >
            <div className="v3-popup-head">
              <div>
                <span className="v3-popup-kicker">Edit section</span>
                <h3>{popupTitle}</h3>
              </div>
              <button className="v3-popup-close" onClick={close} aria-label="Close popup" title="Close">
                <Ph_ name="X" size={16} />
              </button>
            </div>
            <div className="v3-popup-body">
              {open === 'layout' && (
                <VariantPicker section={section} />
              )}
              {open === 'background' && <SurfacePicker sectionId={section.id} current={section.surface} />}
              {groupIndex >= 0 && groups[groupIndex] && (
                <FieldList sectionId={section.id} fields={groups[groupIndex].fields} />
              )}
              {itemField && itemIndex >= 0 && (
                isNavigation && itemField.path === 'links' ? (
                  <NavAttributeEditor
                    sectionId={section.id}
                    basePath={childMatch
                      ? `${itemField.path}[${itemIndex}].children[${childIndex}]`
                      : `${itemField.path}[${itemIndex}]`}
                    value={childMatch ? childItem : item}
                    hideLink={!childMatch && (item?.children?.length ?? 0) > 0}
                  />
                ) : (
                  <FieldList
                    sectionId={section.id}
                    fields={attributeFields ?? itemField.itemFields}
                    prefix={`${itemField.path}[${itemIndex}].`}
                  />
                )
              )}
              {actionField?.kind === 'toggle' && (
                <FieldList sectionId={section.id} fields={actionField.children ?? []} />
              )}
            </div>
            <div className="v3-popup-foot">
              {itemField && (
                <button
                  className="btn-ui danger v3-popup-delete"
                  onClick={() => {
                    close()
                    actions.removeListItem(
                      section.id,
                      childMatch ? `${itemField.path}[${itemIndex}].children` : itemField.path,
                      childMatch ? childIndex : itemIndex,
                    )
                    if (isNavigation && childMatch && (item?.children?.length ?? 0) === 1) {
                      actions.setProp(section.id, `${itemField.path}[${itemIndex}].dropdown`, false)
                    }
                  }}
                >
                  <Icon name="trash" size={13} /> Delete
                </button>
              )}
              <button className="btn-ui primary" onClick={close}>Done</button>
            </div>
        </div>
      , document.querySelector('.app-root') ?? document.body)}
    </div>
  )
}

function V3ActionGroup({
  section,
  group,
  groupIndex,
  openPopup,
}: {
  section: Section
  group: EditorGroup
  groupIndex: number
  openPopup: (key: PopupKey, target?: HTMLElement | null) => void
}) {
  let actionFields = group.fields
    .filter((field): field is Extract<Field, { kind: 'toggle' }> => field.kind === 'toggle')
  if (section.type === 'nav') {
    actionFields = [...actionFields].sort((a, b) => Number(b.path === 'showCta') - Number(a.path === 'showCta'))
  }

  return (
    <div className="v3-inline-group v3-action-group">
      <div className="v3-inline-title">{group.title}</div>
      <div className="v3-action-list">
        {actionFields.map((field) => {
          const fieldIndex = group.fields.indexOf(field)
          const key: PopupKey = `action-${groupIndex}-${fieldIndex}`
          const enabled = Boolean((section.props as any)[field.path])
          const label = togglePopupLabel(section.type, field)
          return (
            <div
              className="v3-action-item"
              key={field.path}
              role="button"
              tabIndex={0}
              data-popup-key={key}
              onClick={(event) => openPopup(key, event.currentTarget)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') openPopup(key, event.currentTarget)
              }}
            >
              <span className="v3-action-copy">
                <strong>{label}</strong>
                <span>{enabled ? 'Enabled' : 'Disabled'}</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={label}
                className={`switch ${enabled ? 'on' : ''}`}
                onClick={(event) => {
                  event.stopPropagation()
                  actions.setProp(section.id, field.path, !enabled)
                  if (!enabled) openPopup(key, event.currentTarget.closest<HTMLElement>('.v3-action-item'))
                }}
              >
                <span />
              </button>
              <Ph_ name="CaretRight" size={13} className="v3-list-item-caret" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function V3InlineGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="v3-inline-group">
      <div className="v3-inline-title">{title}</div>
      <div className="v3-inline-body">{children}</div>
    </div>
  )
}

function V3ListGroup({
  section,
  group,
  groupIndex,
  field,
  openPopup,
}: {
  section: Section
  group: EditorGroup
  groupIndex: number
  field: Extract<Field, { kind: 'list' }>
  openPopup: (key: PopupKey, target?: HTMLElement | null) => void
}) {
  const items = ((section.props as any)[field.path] ?? []) as any[]
  const atMax = field.max !== undefined && items.length >= field.max
  const isNavLinks = section.type === 'nav' && field.path === 'links'
  const dropdownToggle = isNavLinks
    ? field.itemFields.find((itemField) => itemField.kind === 'toggle' && itemField.path === 'dropdown')
    : null
  const childList = dropdownToggle?.kind === 'toggle'
    ? dropdownToggle.children?.find((itemField) => itemField.kind === 'list')
    : null

  return (
    <div className="v3-list-group">
      <div className="v3-nav-list-head">
        <span>{group.title}</span>
        <span className="v3-nav-list-count">{items.length}</span>
        <button
          title={field.addLabel ?? 'Add item'}
          aria-label={field.addLabel ?? 'Add item'}
          disabled={atMax}
          onClick={() => {
            if (!atMax) actions.addListItem(section.id, field.path, field.template())
          }}
        >
          <Ph_ name="Plus" size={16} />
        </button>
      </div>
      {items.map((item, index) => {
        const key: PopupKey = `item-${groupIndex}-${index}`
        const title = String(item?.[field.itemTitle] ?? '') || `Item ${index + 1}`
        return (
          <div
            className={`v3-list-node ${isNavLinks ? 'is-nav' : ''} ${isNavLinks && item?.children?.length ? 'has-children' : ''}`}
            key={index}
          >
            <div
              className="v3-list-item"
              role="button"
              tabIndex={0}
              data-popup-key={key}
              onClick={(event) => openPopup(key, event.currentTarget)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') openPopup(key, event.currentTarget)
              }}
            >
              <span className="v3-list-item-icon"><Ph_ name="DotsSixVertical" size={14} weight="bold" /></span>
              <span className="v3-list-item-title">{title}</span>
              <span className="v3-list-tools" onClick={(event) => event.stopPropagation()}>
                {isNavLinks ? (
                <button
                  title="Add child link"
                  aria-label={`Add child link to ${title}`}
                  disabled={!childList || (childList.max !== undefined && (item?.children?.length ?? 0) >= childList.max)}
                  onClick={() => {
                    if (!childList) return
                    if (!item?.dropdown) actions.setProp(section.id, `${field.path}[${index}].dropdown`, true)
                    actions.addListItem(section.id, `${field.path}[${index}].children`, childList.template())
                  }}
                >
                  <Icon name="plus" size={13} />
                </button>
                ) : (
                  <button title="Duplicate" onClick={() => actions.duplicateListItem(section.id, field.path, index)}>
                    <Icon name="copy" size={12} />
                  </button>
                )}
              </span>
              <Ph_ name="CaretRight" size={13} className="v3-list-item-caret" />
            </div>
            {isNavLinks && (item?.children ?? []).map((child: any, childIndex: number) => {
              const childKey: PopupKey = `child-${groupIndex}-${index}-${childIndex}`
              const childTitle = String(child?.label ?? '') || `Child ${childIndex + 1}`
              return (
                <div
                  className="v3-list-item v3-nav-child"
                  key={childIndex}
                  role="button"
                  tabIndex={0}
                  data-popup-key={childKey}
                  onClick={(event) => openPopup(childKey, event.currentTarget)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') openPopup(childKey, event.currentTarget)
                  }}
                >
                  <span className="v3-nav-child-branch" aria-hidden="true" />
                  <span className="v3-list-item-title">{childTitle}</span>
                  <Ph_ name="CaretRight" size={13} className="v3-list-item-caret" />
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function SettingRow({
  icon,
  label,
  value,
  popupKey,
  onClick,
}: {
  icon?: string
  label: string
  value: string
  popupKey: PopupKey
  onClick: (target: HTMLElement) => void
}) {
  return (
    <button
      className="v3-setting"
      data-popup-key={popupKey}
      onClick={(event) => onClick(event.currentTarget)}
    >
      {icon && <span className="v3-setting-icon"><Ph_ name={icon} size={17} /></span>}
      <span className="v3-setting-copy">
        <strong>{label}</strong>
        <span>{value}</span>
      </span>
      <Ph_ name="CaretRight" size={14} className="v3-setting-caret" />
    </button>
  )
}
