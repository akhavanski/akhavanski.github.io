# Fixes and comments in posts

Tried and put aside: now a footnote is used instead, with the old text crossed out inside it (`<del>old text</del>`). The code is in `notes-fix-comment.js` and `fix-comment.scss`.


A corrected passage is written as a link to `#fix`, with the reason in the quotes and the old text in `data-was`:

```markdown
[new text](#fix "Changed because…"){: data-was="old text"}
```

On the site the text has a red wavy underline, and a note in the right margin, on a red line, shows the old text crossed out and the reason under it.

A comment on a passage is a link to `#comment`:

```markdown
[text](#comment "Comment")
```

On the site the text is highlighted in yellow, and the comment stands in the right margin on a yellow line.

On a narrow screen the notes are hidden, and a tap on the marked text opens the note under the line. Both are made by `assets/js/notes.js`, styles in `assets/css/main.scss`. If the note contains double quotes, wrap it in single ones:

```markdown
[text](#comment 'It is "so"')
```

Words in `*asterisks*` inside the note are shown in italics. To put a picture under the note text:

```markdown
[text](#comment "Note"){: data-img="/assets/img/pic.png"}
```

