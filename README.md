# akh.cx

Personal blog on Jekyll and GitHub Pages.

## Fixes in posts

A corrected passage is written as a link to `#fix`, with the note in the quotes:

```markdown
[corrected text](#fix "Was: «old text». Changed because…")
```

On the site the text is highlighted in yellow, and a click shows a sticky note with the note text (`assets/js/fixes.js`, styles in `assets/css/main.scss`).

If the note contains double quotes, wrap it in single ones:

```markdown
[corrected text](#fix 'Was: "old text"')
```

Words in `*asterisks*` inside the note are shown in italics. To put a picture under the note text:

```markdown
[corrected text](#fix "Note"){: data-img="/assets/img/pic.png"}
```

## Glossary terms

A term in a post is written as a link to `#glossary`. Its entry lives in `_data/glossary.yml`, where only `def` is required:

```markdown
[PBI](#glossary)
[PBIs](#glossary "PBI")
```

Use the second form when the word in the text differs from the term in the glossary. On the site the term is underlined with red dots, and a click slides out a catalog card with the entry (`assets/js/glossary.js`, styles in `assets/css/main.scss`). If the term is not in the glossary, the word stays plain text. Mark only the first occurrence of a term in a post.
