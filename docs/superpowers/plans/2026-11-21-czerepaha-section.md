# Черепаха и слоны — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Раздел сайта `akh.cx/czerepaha`: русская лента заметок о ментальных моделях со своим видом. Заметки живут по адресам `/czerepaha/<имя>.html` и видны в общем блоге с черепахой перед датой.

**Architecture:** Заметки лежат в `czerepaha/_posts/`. Jekyll даёт им категорию `czerepaha`, а `defaults` — layout, адрес и `lang: ru`. У раздела свои лэйауты и стили `czerepaha.scss`, без темы `no-style-please`. Общие скрипты постов (`toc.js`, `notes.js`, `sources.js`, `anchors.js`, `share.js`) переиспользуются с тем же DOM-контрактом. Им добавлены подписи из `data-*`. Своё у раздела только `czerepaha.js`: фильтр тем, звёздочка и перенос тем в шапку.

**Tech Stack:** Jekyll (github-pages), Liquid, SCSS, vanilla JS. Проверки — Ruby + Nokogiri (уже в гемах сборки) и Swift-утилита на WKWebView для проверки DOM в браузере.

**Spec:** `docs/superpowers/specs/2026-11-21-czerepaha-section-design.md`. Вид — по макету `docs/superpowers/specs/2026-11-21-czerepaha-mock.html`.

## Global Constraints

- Работа в ветке `czerepaha`, в отдельном worktree (`superpowers:using-git-worktrees`). Мерж в `main` — только после ревью, QA и чек-листа владельца.
- Цвета: зелёный `#2f7d4f`. Черепаха: панцирь `#2f7d4f`, кожа `#8fc4a1`, обод и швы `#1f5c39`, без чёрного контура.
- Шрифт раздела — Inter с Google Fonts: начертания 400, 600, 700, `display=swap`, не больше трёх.
- Ширины как на основном сайте: `52rem` (узкий / не узкий), `72rem` (сноски на полях), `84rem` (шапка закреплена слева, оглавление и темы в шапке).
- Подписи раздела: «Содержание», «Поделиться», «Спасибо!», «Скопировано», «Ссылка скопирована», «Ссылка на раздел скопирована». Основной сайт остаётся на английском.
- Текст звёздочки дословно: «Вы находитесь в особом отделе моего сайта, который посвящён ментальным моделям. Черепаха, может, и двигается медленнее, но точно доходит до цели.»
- Подвал раздела: «Алексей Хованский, 2026», имя — ссылка на `https://akh.cx`.
- Пустой раздел: «Скоро здесь будут заметки», фильтр тем спрятан.
- Бюджеты: клик по теме ≤ 16 мс на 200 заметок; расстановка сносок ≤ 16 мс на 30 сносок; `czerepaha.css` ≤ 20 КБ, `czerepaha.js` ≤ 4 КБ; сборка не дольше main больше чем на max(10%, 1 с).
- Каждый новый файл начинается с комментария о том, что он делает (правило блога). Описание раздела добавляется в `CLAUDE.md` блога.
- Тестовые заметки в `czerepaha/_posts` не коммитятся. Они живут в `.claude/fixtures/czerepaha/`, а Jekyll не собирает папки с точкой.

## Review Focus

1. **Пустая папка `czerepaha/_posts`** (так раздел запускается) — сборка проходит, лента показывает пустое состояние, на `/blog` ничего не ломается. Тест: Task 1, `empty_section`.
2. **Заметка без `description:` и со сносками в начале** — в ленте и на `/blog` описание берётся из начала текста без цифр сносок, как в `posts.html`. Тест: Task 2, `excerpt_without_footnote_numbers`.
3. **Неизвестный ключ `topic:` или его нет** — заметка показывается в «Все заметки», точка серая, сборка не падает. Тест: Task 2, `unknown_topic`.
4. **`?topic=` с несуществующим ключом** — показаны все заметки, выбрано «Все заметки». Тест: Task 6, `bad_topic_param`.
5. **Заметка с одним заголовком h2** — оглавления нет (как в `post.html`: нужно два и больше). Буквица есть у первого абзаца и у абзаца после этого h2. Тест: Task 5, `one_heading`.

---

## Файлы

| Файл | Что делает |
|---|---|
| `_config.yml` | `defaults` для `path: czerepaha, type: posts`: `layout: czerepaha-post`, `permalink: /czerepaha/:title.html`, `lang: ru` |
| `czerepaha/index.html` | Лента раздела, `permalink: /czerepaha/` |
| `_layouts/czerepaha.html` | Страница раздела: `head.html` со стилями раздела, шапка, контент, подвал, goatcounter |
| `_layouts/czerepaha-post.html` | Заметка, DOM-контракт как у `post.html` |
| `_includes/czerepaha-header.html` | Черепаха, название, звёздочка с запиской, меню Blog и About |
| `_includes/head.html` | Параметр `css` (по умолчанию `main`) и шрифт Inter при `css="czerepaha"` |
| `_includes/posts.html` | Черепаха перед `<time>` у постов с категорией `czerepaha` |
| `_data/czerepaha.yml` | Темы: `key`, `name`, `color` |
| `assets/css/czerepaha.scss` | Все стили раздела |
| `assets/css/main.scss` | Черепаха в списке и плоская черепаха «Поделиться» |
| `assets/js/czerepaha.js` | Фильтр тем, звёздочка, перенос тем в шапку |
| `assets/js/toc.js`, `share.js`, `anchors.js` | Подписи из `data-*`, по умолчанию английские |
| `.claude/check-czerepaha.sh` | Входная точка проверок: окружение как в `serve.sh`, запуск Ruby |
| `.claude/check-czerepaha.rb` | Сборки (пустая, с фикстурами, 200 заметок), статические и браузерные проверки |
| `.claude/webprobe.swift` | Утилита: открыть URL в WKWebView нужной ширины, выполнить JS, напечатать JSON |
| `.claude/fixtures/czerepaha/*.md` | Тестовые заметки |

---

### Task 1: Каркас проверок и пустой раздел

**Files:**
- Create: `.claude/check-czerepaha.sh`, `.claude/check-czerepaha.rb`, `.claude/webprobe.swift`, `czerepaha/index.html`, `_layouts/czerepaha.html`, `_includes/czerepaha-header.html`, `assets/css/czerepaha.scss`
- Modify: `_config.yml` (defaults), `_includes/head.html`

**Interfaces:**
- Produces:
  - `bash .claude/check-czerepaha.sh [name…]` — запускает все проверки или выбранные по имени, печатает `PASS name` / `FAIL name: причина`, код выхода ≠ 0 при любом FAIL.
  - В Ruby: `build(mode) -> dir`, где `mode` — `:empty` (копия репозитория без фикстур), `:fixtures` (плюс `.claude/fixtures/czerepaha/*.md` в `czerepaha/_posts`), `:bulk` (плюс 200 сгенерированных заметок). Копия делается через rsync без `.git` и `_site` во временную папку, сборка `jekyll build` с конфигом как в `serve.sh`. `page(dir, path) -> Nokogiri::HTML::Document`. `serve(dir) -> base_url` поднимает WEBrick в потоке на свободном порту. `probe(url, width, js) -> parsed JSON` вызывает скомпилированный `webprobe`.
  - `webprobe <url> <width> <height> <js>` печатает в stdout `JSON.stringify` результата JS, выполненного через 1,5 с после загрузки. Код выхода 1 при ошибке JS.
  - `head.html` принимает `css`: `{% include head.html css="czerepaha" %}`.

- [ ] **Step 1: Написать проверки**

`empty_section`: в сборке `:empty` есть `czerepaha/index.html`. У `<html>` атрибут `lang="ru"`, подключён `/assets/css/czerepaha.css`, `main.css` не подключён. Есть `.cz-empty` с текстом «Скоро здесь будут заметки». `.cz-topics` отсутствует. Подвал: `a[href="https://akh.cx"]` с текстом «Алексей Хованский», за ним «, 2026». `/blog.html` и `/index.html` собрались.
`header_star` (браузер, ширина 1440): клик по `.cz-star` → у `#cz-about` нет `hidden`, текст дословно из Global Constraints. Escape → `hidden`. Повторное открытие и клик по `body` → `hidden`.

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `bash .claude/check-czerepaha.sh empty_section header_star`
Expected: `FAIL empty_section: no czerepaha/index.html`

- [ ] **Step 3: Сделать каркас**

Defaults в `_config.yml`, `head.html` с параметром `css`, лэйаут, шапка и лента с пустым состоянием. В `czerepaha.scss` — токены цветов и шрифта, шапка (полоса сверху до `84rem`, фиксированная слева от `84rem`), записка звёздочки, подвал. Логика звёздочки — в `assets/js/czerepaha.js`: `initStar()`, закрытие по повторному клику, клику мимо и Escape.

- [ ] **Step 4: Проверки проходят**

Run: `bash .claude/check-czerepaha.sh empty_section header_star`
Expected: `PASS` у обеих.

- [ ] **Step 5: Commit** — `git commit -m "Черепаха и слоны: empty section, checks harness"`

---

### Task 2: Заметки, адреса и лента

**Files:**
- Create: `_layouts/czerepaha-post.html`, `_data/czerepaha.yml`, `.claude/fixtures/czerepaha/` (5 заметок: со сносками и источниками и 3 h2; без `description:`, начинается со сноски; с неизвестным `topic:`; с одним h2; короткая)
- Modify: `czerepaha/index.html`, `assets/css/czerepaha.scss`, `.claude/check-czerepaha.rb`

**Interfaces:**
- Consumes: `build`, `page` из Task 1.
- Produces: разметка ленты — `.cz-topics button[data-topic]` (пустой `data-topic` = «Все заметки») со `.n`-счётчиком; `.cz-list > article.cz-post[data-topic]`. Разметка заметки: `article` содержит `.cz-back` с двумя ссылками (`/czerepaha/` и `/blog`), `.cz-meta`, `h1`, `.cz-dek`, `nav.toc > .toc-toggle`, `.cz-prose`, `p.post-signature`. DOM для скриптов — как в `_layouts/post.html`.
- `_data/czerepaha.yml`: список `{key, name, color}`. Первые три — `think` «Мышление» `#2f7d4f`, `decide` «Решения» `#111311`, `sys` «Системы» `#9fd2b0`.

- [ ] **Step 1: Написать проверки**

`note_urls`: каждая фикстура собрана в `/czerepaha/<slug>.html`, где `slug` — имя файла без даты.
`tag_matches_folder`: у каждой заметки из папки есть тег `czerepaha`. Ни у одного поста вне папки его нет. Нарушение — FAIL с именем файла.
`feed_only_section`: ссылки `.cz-post h2 a` на ленте ровно совпадают с URL фикстур, по дате, новые сверху. Общих постов нет.
`topic_counts`: у «Все заметки» `.n` = 5, у каждой темы — число её заметок. Темы без заметок не показаны.
`unknown_topic`: заметка с неизвестным `topic:` есть в ленте, у её `.cz-dot` цвет по умолчанию, у неё `data-topic=""`.
`excerpt_without_footnote_numbers`: у заметки без `description:` описание в ленте и в `.post-excerpt` на `/blog.html` начинается с её первого слова и не содержит цифры сноски.
`note_page`: `lang="ru"`. Есть `.cz-back` с двумя ссылками. Мета в формате `ДД.ММ.ГГГГ` и `N мин`. Подпись `— Aliaksei`. Подключены `toc.js`, `notes.js`, `sources.js`, `anchors.js`, `share.js` и hyphenate — по тем же условиям, что в `post.html`.

- [ ] **Step 2: Проверки падают** — `bash .claude/check-czerepaha.sh note_urls tag_matches_folder feed_only_section topic_counts unknown_topic excerpt_without_footnote_numbers note_page`, ожидается FAIL у всех.

- [ ] **Step 3: Сделать лэйаут заметки, ленту из `site.categories.czerepaha` с темами из `_data/czerepaha.yml` и проверку тега в Ruby.**

Описание без цифр сносок — той же Liquid-техникой, что в `posts.html` (разрез по `<sup id="fnref:`). Время чтения: слов / 180, вверх.

- [ ] **Step 4: Проверки проходят** (та же команда, ожидается PASS у всех и у проверок Task 1).

- [ ] **Step 5: Commit** — `git commit -m "Черепаха и слоны: notes, URLs, feed with topics"`

---

### Task 3: Черепахи на основном сайте

**Files:**
- Modify: `_includes/posts.html`, `assets/css/main.scss`, `.claude/check-czerepaha.rb`

**Interfaces:**
- Consumes: `build(:fixtures)`, `probe`.
- Produces: в `posts.html` у `li` поста раздела перед `<time>` стоит `a.cz-turtle[href="/czerepaha/"][title="Черепаха и слоны"][aria-label="Черепаха и слоны"]` с `{% include turtle-svg.html %}`.

- [ ] **Step 1: Написать проверки**

`blog_turtles`: на `/blog.html` и `/index.html` у каждого `li` заметки раздела ровно одна `a.cz-turtle` перед `time`. У остальных постов её нет. Метка `RU` — по существующей логике, не трогаем.
`turtle_hangs_left` (браузер, 1280): `right` черепахи ≤ `left` у `time`, и `left` у `time` одинаковый у поста раздела и у обычного. При 390: черепаха в строке, `top` у неё и у `time` отличается меньше чем на 4px.
`flat_share_turtle` (браузер, обычный пост на 1280): у `.share-turtle-btn svg` `stroke` = `none`, у `.t-shell` `fill` = `rgb(47, 125, 79)`.

- [ ] **Step 2: Проверки падают**

- [ ] **Step 3: Сделать.** Черепаха в списке — `position: absolute` левее даты от `52rem`, ниже — в строке. Цвета и размеры по макету. Плоская черепаха «Поделиться» — цвета из Global Constraints, `stroke: none`, швы и улыбка своим `stroke`.

- [ ] **Step 4: Проверки проходят, проверки Task 1–2 тоже**

- [ ] **Step 5: Commit** — `git commit -m "Main blog: section turtle before the date, flat green share turtle"`

---

### Task 4: Подписи общих скриптов из data-атрибутов

**Files:**
- Modify: `assets/js/toc.js`, `assets/js/share.js`, `assets/js/anchors.js`, `_includes/share.html`, `_layouts/czerepaha-post.html`, `.claude/check-czerepaha.rb`

**Interfaces:**
- Produces:
  - `nav.toc` читает `data-label-long` (по умолчанию «Table of contents»), `data-label-short` («Contents»), `data-label-title` («Contents»).
  - `.share` читает `data-label-share` («Share»), `data-label-thanks` («Thank you!»), `data-label-copied` («Link copied»). `share.html` принимает параметры include с теми же именами и по умолчанию их не выводит.
  - Скрипт `anchors.js` читает `data-label-copied` у `<article>` (по умолчанию «Link to the section copied»). Видимое «Copied» рисует CSS, раздел задаёт своё `content` в `czerepaha.scss`.

- [ ] **Step 1: Написать проверки** (браузер)

`labels_ru` на заметке раздела: `.toc-toggle` = «Содержание» (на 1000px), `.share-word` = «Поделиться» (на 390), `::after` у кнопки якоря после копирования = «Скопировано».
`labels_en_unchanged` на обычном посте: «Table of contents», «Share», «Copied».

- [ ] **Step 2: Падает** `labels_ru`, проходит `labels_en_unchanged`.

- [ ] **Step 3: Сделать.** В скриптах замена строк на `el.dataset.x || "English"`. Логика не меняется.

- [ ] **Step 4: Проходят обе и все прежние**

- [ ] **Step 5: Commit** — `git commit -m "toc, share, anchors: labels from data attributes"`

---

### Task 5: Вид заметки

**Files:**
- Modify: `assets/css/czerepaha.scss`, `_layouts/czerepaha-post.html`, `.claude/check-czerepaha.rb`

**Interfaces:**
- Consumes: разметка Task 2, подписи Task 4.

- [ ] **Step 1: Написать проверки** (браузер, заметка с 3 h2 и сносками)

`drop_caps`: у `::first-letter` первого абзаца и абзаца сразу после каждого h2 цвет `rgb(47, 125, 79)`. У остальных абзацев — цвет текста.
`one_heading`: на заметке с одним h2 нет `.toc`, буквица у первого абзаца и у абзаца после h2.
`wide_layout` (1440): у `header` `position: fixed`, в нём список оглавления (`header .toc-sheet` или тот, что переносит `toc.js`). Сноски (`.sidenote` — как называет их `notes.js`) правее колонки текста. Обе ссылки `.cz-back` видны.
`mid_layout` (1200): шапка — полоса сверху, сноски на правом поле, кнопка оглавления есть.
`narrow_layout` (390): список сносок в конце видим, тап по цифре открывает заметку под строкой. Ширина документа не больше ширины окна.
`share_pinned`: у `.share` (или её контейнера с черепахой) `position: fixed`. При прокрутке к середине страницы `bottom` черепахи = высота окна ± 1px.

- [ ] **Step 2: Падают**

- [ ] **Step 3: Сделать стили по макету.** Колонка текста 680px. От `84rem` шапка фиксирована слева шириной около 290px, текст по центру, сноски на поле справа. Черепаха «Поделиться» — `position: fixed` у нижнего края окна по центру колонки, с `env(safe-area-inset-bottom)`. Все анимации выключаются при `prefers-reduced-motion`.

- [ ] **Step 4: Проходят все проверки**

- [ ] **Step 5: Commit** — `git commit -m "Черепаха и слоны: note styles"`

---

### Task 6: Фильтр тем и темы в шапке

**Files:**
- Modify: `assets/js/czerepaha.js`, `assets/css/czerepaha.scss`, `czerepaha/index.html`, `.claude/check-czerepaha.rb`

**Interfaces:**
- Produces: `initTopics()` в `czerepaha.js`. Один слушатель `click` на `.cz-topics` (делегирование). Выбор пишет `?topic=<key>` через `history.replaceState`, «Все заметки» убирает параметр. От `84rem` `.cz-topics` переносится в `header` после меню, ниже — обратно на место (как `toc.js`, через `matchMedia('(min-width: 84rem)')`). Без JS у `.cz-topics` есть `hidden`, скрипт его снимает.

- [ ] **Step 1: Написать проверки** (браузер, сборка `:fixtures`)

`topic_filter`: клик по `decide` → видны только заметки `decide`, у кнопки `aria-pressed="true"`, в адресе `?topic=decide`. Клик по «Все заметки» → видны все, параметра нет.
`topic_from_url`: открытие `/czerepaha/?topic=think` → видны только `think`.
`bad_topic_param`: `?topic=nope` → видны все, выбрано «Все заметки».
`topics_in_header` (1440): `.cz-topics` внутри `header`. На 1000 — внутри `main`.
`no_js_shows_all` (статически): в HTML у `.cz-topics` есть `hidden`, у заметок его нет.

- [ ] **Step 2: Падают**

- [ ] **Step 3: Сделать `initTopics()`.** Узлы заметок собрать один раз при загрузке. Клик меняет только `hidden`.

- [ ] **Step 4: Проходят все**

- [ ] **Step 5: Commit** — `git commit -m "Черепаха и слоны: topic filter"`

---

### Task 7: Скорость, вес, сборка

**Files:**
- Modify: `.claude/check-czerepaha.rb`

**Interfaces:**
- Consumes: `build(:bulk)` (200 заметок по три темы и одна заметка с 30 сносками), `probe`.

- [ ] **Step 1: Написать проверки**

`perf_topic_click`: на ленте из 200 заметок медиана времени `performance.now()` вокруг `button.click()` по 20 кликам ≤ 16 мс.
`perf_notes_layout`: на заметке с 30 сносками медиана времени синхронного `dispatchEvent(new Event('resize'))` плюс `document.body.offsetHeight` ≤ 16 мс.
`long_tasks`: `PerformanceObserver` для `longtask` за первые 3 с на ленте и на заметке — ни одной задачи дольше 100 мс.
`asset_sizes`: `czerepaha.css` ≤ 20 480 байт, `czerepaha.js` ≤ 4 096 байт. В `head` раздела подключено ≤ 3 начертаний Inter.
`build_time`: время `jekyll build` в режиме `:empty` на ветке против того же на worktree `main`, ≤ max(110%, +1 с). Медиана из 3 сборок.

- [ ] **Step 2: Запустить.** Если что-то за бюджетом — это дефект: исправить код соответствующей задачи, а не порог.

- [ ] **Step 3: Все проверки проходят**

Run: `bash .claude/check-czerepaha.sh`
Expected: только `PASS`, код выхода 0.

- [ ] **Step 4: Commit** — `git commit -m "Черепаха и слоны: speed and size checks"`

---

### Task 8: Документация и уборка

**Files:**
- Modify: `CLAUDE.md` (блог), `.claude/launch.json`

- [ ] **Step 1: Дописать в `CLAUDE.md` раздел «Черепаха и слоны».** Папка, шаблон заметки из спеки, темы в `_data/czerepaha.yml`, `check-czerepaha.sh`, свои лэйауты и стили, переиспользуемые скрипты и их `data-*` подписи. В «Устройство» дописать новые файлы.
- [ ] **Step 2: Убрать из `.claude/launch.json` временную запись `cz-variants`.**
- [ ] **Step 3: `bash .claude/check-czerepaha.sh` — всё PASS.**
- [ ] **Step 4: Commit** — `git commit -m "CLAUDE.md: Черепаха и слоны"`

После Task 8 — по глобальному процессу: `requesting-code-review` (ревьюер сверяет дифф с блоком «Скорость и память»), итог в спеку, затем `qa`, итог в спеку, чек-лист владельцу, мерж.
