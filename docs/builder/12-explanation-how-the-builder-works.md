# How the builder works

This page explains the ideas behind the builder: why it's organised the way it is, and what happens when you change something. You don't need it to get things done, but it makes the builder's behaviour predictable.

## Pages are stacks of sections

A page isn't a free-form canvas. It's an ordered stack of **sections**, each a complete, designed block (a hero, an API catalogue, an FAQ). You choose *which* blocks, *in what order*, and *what goes in them*. You can't nudge individual elements around.

This is deliberate:
- **Everything stays aligned and responsive.** Each section is designed for desktop, tablet and mobile, so the page works on every device without extra effort.
- **Content and design stay separate.** You edit words, images and links. The section decides spacing, sizes and how things wrap.
- **Changing your mind is cheap.** Switching a section's layout keeps its content, so you can try the same words in a card grid, a list or a table.

## Shared chrome: the navigation bar and footer

The navigation bar and footer aren't part of any one page. They're shared by every page that shows site navigation (Home and Contact us). That's why they sit apart from the page's sections in the list (under **Header** and **Footer**), can't be moved or deleted, and can only be hidden. Edit them once and every page updates.

The **Sign-up form** page is different. It's a focused, single-purpose screen with no navigation around it, so it has no section list at all.

## One colour, a whole palette

You choose one **brand colour**. The builder generates a full, accessible palette from it: twelve steps from a barely-there tint to a deep shade, plus a matching neutral grey family. It does this separately for light and dark mode. Text colours are picked by contrast, not by eye, so a light brand colour automatically gets dark text on its buttons.

Sections never use your hex code directly. They use **roles**: *background*, *text*, *border*, *accent*. Each role points to a step in the generated palette. That's why changing one colour restyles the whole portal consistently, and why dark mode just works.

## Backgrounds are surfaces, not colours

A section's **Background** (Page, Tinted, Brand, Dark) is a *surface*. Each surface re-points the colour roles for everything inside the section. On **Brand**, for example, text becomes light and buttons invert. So any section can sit on any surface and stay readable, and alternating surfaces is the easiest way to give a long page rhythm.

**Style** (Subtle, Solid, Neutral) applies the same idea to the shared navigation bar and footer only. It never affects the sections in between, even when one of them uses the same tint.

## Two fonts, two roles

Typography has two roles rather than many settings. The **primary** font is for headings and display text, and the **secondary** font is for body and interface text. Every section's text belongs to one of those two roles, so two choices restyle every word on the portal.

## Editing happens in three places

The same field can be edited from the canvas or from the panel, and they stay in sync:

1. **On the canvas**: double-click text to type in place. This is fastest for wording.
2. **In a popup**: click a group card, or an element on the canvas, to edit related fields together (a button's label *and* link).
3. **In the panel**: layout, background, lists and switches, the structural choices.

Clicking an element on the canvas selects it *and* opens the matching popup. Choosing a field in the panel scrolls the canvas to it and highlights it. You always see both sides of what you're editing.

## Every change is a step you can undo

Each edit becomes one step in the undo history, which holds the last 60. Bursts of typing in the same field merge into a single step, so undo takes back a word or sentence rather than one letter. Deletions show an **Undo** prompt too, because they're the change people most often regret.

## Saving and publishing are separate

Your work is saved continuously as you edit. **Publishing** is the deliberate step that makes it live for visitors, so you can work on changes without anyone seeing them half-finished. Turning a page off works the same way: the page and its content are kept, they're just not shown to visitors.

**Related:** [Brand and appearance](07-brand-and-appearance.md) · [Architecture (developers)](13-dev-architecture.md)
