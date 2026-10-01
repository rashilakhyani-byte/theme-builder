# Architecture (developers)

How the builder is put together: the data model, state, rendering, editing and theming. Read this before changing the builder.

**Stack:** React 18, TypeScript and Vite. No UI framework and no CSS-in-JS: plain CSS files with design tokens. Icons are Phosphor (`@phosphor-icons/react`). Colour generation uses `@radix-ui/colors` and `colorjs.io`.

```bash
npm install
npm run dev     # http://localhost:5173 — open Customise in the rail
npm run build   # type-check + production build
```

## File map

| Path | Responsibility |
|---|---|
| `src/types.ts` | The data model: `Doc`, `Page`, `Section`, `Theme`, `Field`, `SectionDef` |
| `src/store.ts` | The single store: state, actions, undo/redo, persistence |
| `src/registry.ts` · `src/registry.portal.ts` | Section definitions: layouts, field schema, defaults. `HOME_TYPES` = what Home can insert |
| `src/templates.ts` | Start templates (`TEMPLATES`, `docFromTemplate`, `blankDoc`) |
| `src/sections/portal.tsx` · `render.tsx` | Section render components. `SectionBody` maps `type → component` |
| `src/canvas/Canvas.tsx` | The canvas: section shells, selection tag, inserters, drag-and-drop targets, reveal/scroll |
| `src/canvas/Bits.tsx` | Editable primitives (`Ed` for inline text, pickable images and icons) |
| `src/panels/LeftPanel.tsx` | Panel shell: page/styles switch, page menu, section list, drill-down levels |
| `src/panels/SectionEditor.tsx` | Section settings. `PopupSectionEditor` is the V3 popup editor |
| `src/panels/Fields.tsx` | Generic field controls rendered from the schema |
| `src/panels/SectionLibrary.tsx` | Section library (click or drag) |
| `src/panels/StartScreen.tsx` | First-run template picker |
| `src/panels/ThemePanel.tsx` · `TypographyPanel.tsx` | Themes & Typography |
| `src/theme/palette.ts` · `generate-radix-colors.ts` | Brand colour → generated palette → CSS custom properties |
| `src/theme/fonts.ts` | Font list, loading and custom font upload |
| `src/portal/PortalShell.tsx` | The surrounding developer-portal mock (rail, reference page) |
| `src/styles/*.css` | `app.css` builder UI · `canvas.css` / `sections.css` / `portal.css` rendered site · `tokens.css` |

## Data model

```ts
Doc {
  theme: Theme                  // accent, appearance, chrome, radius, fonts, consumerThemeToggle…
  nav: Section                  // shared chrome
  footer: Section               // shared chrome
  pages: Record<PageId, Page>
  pageOrder: PageId[]
}
Page { id, name, hasChrome, insertable: SectionType[], body: Section[], disabled? }
Section { id, type, variant, surface: 'page'|'muted'|'brand'|'inverted', props, name?, hidden? }
```

- `hasChrome` decides whether nav and footer wrap the page. `insertable` lists what the library offers (empty = a fixed page, such as the sign-up form).
- `props` is free-form per section type and is shaped by its `SectionDef.fields`.
- `disabled` marks a page as turned off (Home can't be).

## State: `src/store.ts`

A small external store read with `useSyncExternalStore` through `useStore(selector)`. There's no Redux or Context. All writes go through `actions.*`.

- **Document edits** call `commit(nextDoc)`, which pushes the previous doc onto `past` (max **60**), clears `future` and persists. `setProp` and `setTheme` pass `merge` when the same field is edited within 700 ms, so typing is one undo step.
- **UI state** (`selection`, `library`, `panel`, `sidebarTab`, `preview`, `device`, `reveal`, `inspect`, `notice`) uses `patch()` and is never undoable.
- **Persistence**: `localStorage`, debounced 250 ms.

| Key | Holds |
|---|---|
| `site-builder:doc:v5:<version>` | The document, per builder version |
| `site-builder:started:<version>` | `'1'` once a template or blank start was chosen |
| `site-builder:version` | Active iteration (`v1` / `v2` / `v3`, default `v3`) |
| `builder-consumer-appearance` | Visitor's light/dark choice in the published portal |

Key actions: `insertSection`, `removeSection` (raises an Undo notice), `duplicateSection`, `moveSection`, `reorderSection`, `setVariant` (also applies the layout's designed `surface`), `setSurface`, `setProp`, `add/remove/duplicate/reorderListItem`, `setSectionHidden`, `setPage`, `setPageDisabled`, `setTheme`, `select`, `revealElement`, `undo`, `redo`, `startWith`, `restart`.

## Section definitions drive the editor

Each `SectionDef` (`registry*.ts`) declares `variants` (layouts, optionally with a designed `surface`), `defaultSurface`, `defaults()` and a **field schema**:

| `Field.kind` | Renders as |
|---|---|
| `text` (`multiline?`, `placeholder?`) | Input or textarea |
| `image` · `icon` · `select` | Upload row · icon picker · dropdown |
| `toggle` (`children?`) | Switch. Its children show only when it's on |
| `group` | Fields that read as one thing (a button's label and link) |
| `divider` | Starts a new settings group (e.g. *Buttons*, *Logos*) |
| `list` (`itemFields`, `itemTitle`, `max?`, `template`, `presets?`) | Repeating items |

Any field can carry `variants: [...]` to appear only for those layouts (`fieldsForVariant`).

The **V3 popup editor** (`PopupSectionEditor`) turns the schema into the panel: `splitSections` cuts the fields at dividers into groups. Each list becomes its own group of item cards, a group of only toggles becomes switch cards (*Buttons*), and other groups become a card that opens a popup. A few section types have hand-tuned editors (navigation tree with dropdown connectors, contact form, hero logos).

## Rendering and inline editing

`Canvas` renders the page's sections inside a `.site` element that carries the generated colour tokens. Each section is wrapped in a `sec-shell` with its surface class (`surf-page`, `surf-muted`, `surf-brand`, `surf-inverted`) and gives its props to the type's component via `SectionProvider`.

Section components never render raw text for editable content. They use `<Ed path="headline" />`:
- In edit mode `Ed` is click-to-select (`actions.select({ sectionId, path })`) and double-click to edit (`contentEditable`). On blur it commits with `setProp`.
- In preview (or thumbnails) it renders plain text.
- `data-editor-path` links canvas nodes to fields. The panel's `revealElement` uses it to scroll to and flash the matching node, and canvas clicks set `inspect` so the panel opens the matching control or popup.

## Theming

1. `paletteTokens(accent, appearance)` generates Radix-style 12-step accent and grey scales (`generate-radix-colors.ts`, contrast via APCA) and emits CSS custom properties at the app root (*layer 1*).
2. `canvas.css` maps them to **role tokens** (`--bg`, `--fg`, `--border`, `--accent`…). Surfaces and the nav/footer `chrome-surface` treatments only re-point role tokens, so no component rule is duplicated per surface.
3. Fonts: `--font-primary` (headings) and `--font-secondary` (body). Google fonts load on demand, and custom uploads are embedded as data URLs in `theme.customFonts`.

The builder's own chrome uses a separate `--ui-*` token set (`app.css`). It maps one-to-one onto the **Docuwiz Design System** library variables used in the Figma file (*Final Builder* page).

## Builder versions

Three iterations live side by side for comparison. Each keeps its own document:

| Version | Flow |
|---|---|
| V1 | Section catalogue. Every page starts filled in, and sections are added from a modal |
| V2 | Onboarding: a template or blank start, then the library in the side panel |
| **V3** (default) | V2's flow plus the compact popup editor |

Switch with the **V3** chip in the top bar. Its menu also has *Back to the start screen*.

## Known gaps and prototype stubs

- **Publish** only shows a confirmation and has no backend. Pages turned off are only marked in the builder.
- **Persistence** is the browser's `localStorage`: per device and browser, with no accounts and no sync.
- **List items in the V3 editor** show a ⋮⋮ handle but can't be reordered yet (`reorderListItem` exists in the store and is used by `Fields.tsx`, but not by `V3ListGroup`).
- **Navigation access rules** (*Visible to*, role, group) are stored, and restricted links show a lock icon on the canvas (its tooltip names the audience). They aren't enforced, because the prototype has no signed-in state.

**Related:** [Add a section type](14-dev-adding-a-section-type.md) · [How the builder works](12-explanation-how-the-builder-works.md)
