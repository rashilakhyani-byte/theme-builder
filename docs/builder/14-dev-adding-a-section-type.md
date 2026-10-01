# Add a section type (developers)

How to add a new section, from type to library card. The example adds a **Testimonials** section to Home.

## 1. Add the type

In `src/types.ts`, add it to the `SectionType` union:

```ts
export type SectionType =
  // …
  | 'testimonials'
```

## 2. Define it in the registry

In `src/registry.portal.ts`, add an entry to `PORTAL_REGISTRY`. The field schema *is* the editor: you don't write any panel UI.

```ts
testimonials: {
  type: 'testimonials',
  label: 'Testimonials',
  description: 'Quotes from developers using your APIs',   // shown on hover in the library
  icon: 'Quotes',                                          // Phosphor icon name for the section list
  defaultSurface: 'page',
  variants: [
    { id: 'grid', label: 'Quote grid' },
    { id: 'spotlight', label: 'Single spotlight', surface: 'brand' }, // brings its background along
  ],
  fields: [
    ...eyebrow,                                            // the shared "Label above title" toggle
    { kind: 'text', path: 'title', label: 'Title' },
    {
      kind: 'list', path: 'quotes', label: 'Quotes', itemTitle: 'author', max: 6, addLabel: 'Add quote',
      itemFields: [
        { kind: 'text', path: 'quote', label: 'Quote', multiline: true },
        { kind: 'text', path: 'author', label: 'Author' },
        { kind: 'text', path: 'role', label: 'Role', variants: ['grid'] },
        { kind: 'image', path: 'avatar', label: 'Photo' },
      ],
      template: () => ({ quote: 'New quote', author: 'Name', role: '', avatar: '' }),
    },
  ],
  defaults: () => ({
    showEyebrow: true, eyebrow: 'Loved by developers', title: 'What builders say',
    quotes: [{ quote: '…', author: 'Ada', role: 'CTO', avatar: '' }],
  }),
},
```

Guidelines:
- Use `divider` fields to start new settings groups (*Buttons*, *Image*…). In V3 each group becomes a card or popup.
- Give every list a `max` when the design breaks past a count, and an `itemTitle` so item cards show a useful name.
- Keep `defaults()` realistic. The library thumbnail and the first insert render from it.

## 3. Render it

In `src/sections/portal.tsx`, write the component. Use `Ed` for every editable string, so canvas editing and reveal work:

```tsx
export function Testimonials({ p, variant }: { p: any; variant: string }) {
  return (
    <div className={`ptesti ptesti-${variant}`}>
      {p.showEyebrow && <Ed path="eyebrow" className="ptag" />}
      <Ed path="title" as="h2" className="ptitle" />
      <div className="ptesti-list">
        {p.quotes.map((_: any, i: number) => (
          <figure key={i}>
            <Ed path={`quotes[${i}].quote`} as="blockquote" multiline />
            <Ed path={`quotes[${i}].author`} as="figcaption" />
          </figure>
        ))}
      </div>
    </div>
  )
}
```

Then map it in `SectionBody` (`src/sections/render.tsx`):

```tsx
case 'testimonials': return <Testimonials p={p} variant={v} />
```

Style it in `src/styles/sections.css` with **role tokens only** (`var(--fg)`, `var(--bg)`, `var(--border)`, `var(--accent)`, `var(--radius)`), never hex values. That's what makes it work on every surface and in dark mode.

## 4. Make it available

- **Home:** add `'testimonials'` to `HOME_TYPES` in `registry.portal.ts`.
- **Other pages:** add it to that page's `insertable` list in `defaultDoc()` (`src/store.ts`).
- **Library art:** add an SVG thumbnail to `ILLUSTRATIONS` in `src/ui/illustrations.ts` (keyed by type).
- **Templates (optional):** add `['testimonials', 'grid']` to a template's `sections` in `src/templates.ts`.

## 5. Check it

- [ ] It appears in the library with art and a description, and click and drag both insert it.
- [ ] Every layout renders, and layout-only fields appear and disappear correctly.
- [ ] It looks right on Page, Tinted, Brand and Dark, in light and dark mode, and with Subtle, Solid and Neutral styles.
- [ ] Every string is editable on the canvas, and clicking text opens the right popup.
- [ ] Desktop, tablet and mobile previews hold up.
- [ ] `npm run build` passes.

> **Saved documents:** existing documents simply won't contain the new section. If you *rename* or *remove* a type, bump the document key in `store.ts` (`site-builder:doc:v5`). Otherwise old documents reference a type that no longer exists.

**Related:** [Architecture](13-dev-architecture.md) · [Section types](11-reference-section-types.md)
