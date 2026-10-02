# akh.cx

Personal blog on Jekyll and GitHub Pages.

## Fixes and comments in posts

A corrected passage is written as a link to `#fix`, with the reason in the quotes and the old text in `data-was`:

```markdown
[new text](#fix "Changed because…"){: data-was="old text"}
```

On the site the text has a red wavy underline, and a click shows a card with the old text cut out and glued on it, and the reason under it.

A comment on a passage is a link to `#comment`:

```markdown
[text](#comment "Comment")
```

On the site the text is highlighted in yellow, and a click shows a sticky note with the comment.

Both are made by `assets/js/notes.js`, styles in `assets/css/main.scss`. If the note contains double quotes, wrap it in single ones:

```markdown
[text](#comment 'It is "so"')
```

Words in `*asterisks*` inside the note are shown in italics. To put a picture under the note text:

```markdown
[text](#comment "Note"){: data-img="/assets/img/pic.png"}
```

## Glossary terms

A term in a post is written as a link to `#glossary`. Its entry lives in `_data/glossary.yml`, where only `def` is required:

```markdown
[PBI](#glossary)
[PBIs](#glossary "PBI")
```

Use the second form when the word in the text differs from the term in the glossary. On the site the term is underlined with red dots, and a click slides out a catalog card with the entry (`assets/js/glossary.js`, styles in `assets/css/main.scss`). If the term is not in the glossary, the word stays plain text. Mark only the first occurrence of a term in a post.
