# Checks for the "Черепаха и слоны" section (akh.cx/czerepaha), run by check-czerepaha.sh.
# Helpers: build(mode) makes a Jekyll build in a temp folder, page(dir, path) parses a built page,
# serve(dir) serves a build over WEBrick, probe(url, width, js) runs JS in a WKWebView (webprobe).
# Each check is `check "name" do … end`; it fails by raising Fail (see `ok`).
require "json"
require "yaml"
require "date"
require "fileutils"
require "tmpdir"
require "open3"
require "nokogiri"
require "webrick"

ROOT = ENV.fetch("BLOG_DIR")
CACHE = ENV.fetch("CACHE")
WORK = ENV.fetch("WORK")
PROBE = ENV.fetch("PROBE")

STAR_TEXT = "Вы находитесь в особом отделе моего сайта, который посвящён ментальным моделям. " \
            "Черепаха, может, и двигается медленнее, но точно доходит до цели."

class Fail < StandardError; end

def ok(cond, msg)
  raise Fail, msg unless cond
end

# Modes: :empty is a copy of the repository without czerepaha/_posts, :fixtures replaces the real
# notes with .claude/fixtures/czerepaha/*.md, :bulk with 200 generated notes (one has 30 footnotes), :real is the
# repository as is. Builds are cached per mode.
FIXTURE_COUNT = 5
REAL_NOTES = 14
BUILDS = {}
def build(mode)
  BUILDS[mode] ||= begin
    src = File.join(WORK, "src-#{mode}")
    dest = File.join(WORK, "site-#{mode}")
    FileUtils.mkdir_p(src)
    system("rsync", "-a", "--exclude=.git", "--exclude=_site", "--exclude=.jekyll-cache",
           "--exclude=.superpowers", "#{ROOT}/", "#{src}/") or raise "rsync failed"
    posts = File.join(src, "czerepaha", "_posts")
    case mode
    when :empty
      FileUtils.rm_rf(posts)
    when :real
      nil
    when :fixtures
      FileUtils.rm_rf(posts)
      FileUtils.mkdir_p(posts)
      Dir[File.join(ROOT, ".claude", "fixtures", "czerepaha", "*.md")].each { |f| FileUtils.cp(f, posts) }
    when :bulk
      FileUtils.rm_rf(posts)
      FileUtils.mkdir_p(posts)
      199.times { |i| bulk_note(posts, i) }
      bulk_footnotes_note(posts)
    else raise "unknown mode #{mode}"
    end
    out, st = Open3.capture2e("bundle", "exec", "jekyll", "build", "--source", src,
                              "--config", "#{src}/_config.yml,#{CACHE}/_config.local.yml",
                              "--destination", dest)
    raise "jekyll build failed (#{mode}): #{out.lines.last(6).join}" unless st.success?
    dest
  end
end

# The :bulk build: 199 plain notes (alternating topics models/biases, a title, an excerpt and a few
# paragraphs, as a real list row) and one long note with 30 footnotes (/czerepaha/bulk-footnotes.html).
BULK_FOOTNOTES = 30
def bulk_note(dir, i)
  date = (Date.new(2026, 1, 1) + i).strftime("%Y-%m-%d")
  topic = i.even? ? "models" : "biases"
  body = (1..4).map { |k| "Абзац #{k} заметки #{i}. " + "Модель упрощает мир, и потому полезна, пока мы помним о её границах. " * 3 }.join("\n\n")
  File.write(File.join(dir, "#{date}-bulk-#{i}.md"),
             "---\ntitle: Заметка #{i}\ndescription: Короткое описание заметки #{i}, как в ленте.\ntags: [czerepaha]\ntopic: #{topic}\n---\n\n#{body}\n")
end

def bulk_footnotes_note(dir)
  parts = (1..BULK_FOOTNOTES).map do |n|
    "## Раздел #{n}\n\nАбзац раздела #{n}, где есть сноска[^n#{n}]. " + "Ещё немного текста, чтобы строка была настоящей. " * 6
  end
  notes = (1..BULK_FOOTNOTES).map { |n| "[^n#{n}]: Сноска номер #{n}, довольно длинная, чтобы занять на полях несколько строк. " + "Пояснение. " * 8 }
  File.write(File.join(dir, "2026-06-30-bulk-footnotes.md"),
             "---\ntitle: Заметка со сносками\ndescription: Тридцать сносок.\ntags: [czerepaha]\ntopic: models\n---\n\n#{parts.join("\n\n")}\n\n#{notes.join("\n\n")}\n")
end

def page(dir, path)
  file = File.join(dir, path)
  file = File.join(file, "index.html") if File.directory?(file)
  ok(File.exist?(file), "no #{path}")
  Nokogiri::HTML(File.read(file))
end

# Serves a build on a free port in a thread; returns the base URL.
SERVERS = {}
def serve(dir)
  SERVERS[dir] ||= begin
    server = WEBrick::HTTPServer.new(Port: 0, DocumentRoot: dir, AccessLog: [], Logger: WEBrick::Log.new(File::NULL))
    Thread.new { server.start }
    "http://127.0.0.1:#{server.config[:Port]}"
  end
end

def probe(url, width, js, height = 900, at_start = nil)
  out, err, st = Open3.capture3(PROBE, url, width.to_s, height.to_s, js, *at_start)
  raise Fail, "webprobe failed: #{err.strip}" unless st.success?
  JSON.parse(out)
end

CHECKS = {}
def check(name, &block)
  CHECKS[name] = block
end

check "empty_section" do
  dir = build(:empty)
  doc = page(dir, "czerepaha/index.html")
  ok(doc.at_css("html")["lang"] == "ru", "html lang is not ru")
  hrefs = doc.css("link[rel=stylesheet]").map { |l| l["href"].to_s }
  ok(hrefs.any? { |h| h.start_with?("/assets/css/czerepaha.css") }, "czerepaha.css is not linked")
  ok(hrefs.none? { |h| h.include?("/assets/css/main.css") }, "main.css is linked")
  empty = doc.at_css(".cz-empty")
  ok(empty, "no .cz-empty")
  ok(empty.text.include?("Скоро здесь будут заметки"), "empty text is wrong: #{empty.text.strip}")
  ok(doc.at_css(".cz-topics").nil?, ".cz-topics is present in an empty section")
  link = doc.at_css('a[href="https://akh.cx"]')
  ok(link && link.text.strip == "Алексей Хованский", "footer link is missing or has the wrong text")
  ok(link.parent.text.strip.end_with?("Алексей Хованский, 2026"), "footer text is not 'Алексей Хованский, 2026'")
  %w[blog.html index.html].each { |f| ok(File.exist?(File.join(dir, f)), "no #{f}") }
end

check "header_star" do
  dir = build(:empty)
  js = <<~JS
    var star = document.querySelector('.cz-star'), about = document.getElementById('cz-about');
    var r = {};
    star.click();
    r.open = !about.hidden; r.text = about.textContent.trim();
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    r.escape = about.hidden;
    star.click();
    r.reopen = !about.hidden;
    document.body.click();
    r.outside = about.hidden;
    star.click(); star.click();
    r.toggle = about.hidden;
    r
  JS
  r = probe("#{serve(dir)}/czerepaha/", 1440, js)
  ok(r["open"], "click on .cz-star does not open #cz-about")
  ok(r["text"] == STAR_TEXT, "note text differs: #{r['text']}")
  ok(r["escape"], "Escape does not close the note")
  ok(r["reopen"], "the note does not open a second time")
  ok(r["outside"], "click on body does not close the note")
  ok(r["toggle"], "a second click on the star does not close the note")
end

# The test notes: [slug, front matter hash] in the order of the feed (newest first).
def fixture_files
  Dir[File.join(ROOT, ".claude", "fixtures", "czerepaha", "*.md")].sort.reverse
end

def fixture_slug(file)
  File.basename(file, ".md").sub(/\A\d{4}-\d{2}-\d{2}-/, "")
end

def front_matter(file)
  YAML.safe_load(File.read(file)[/\A---\n(.*?)\n---/m, 1], permitted_classes: [Date, Time]) || {}
end

def script_srcs(doc)
  doc.css("script[src]").map { |s| File.basename(s["src"].to_s.sub(/\?.*/, "")) }
end

check "note_urls" do
  dir = build(:fixtures)
  files = fixture_files
  ok(files.size == FIXTURE_COUNT, "expected #{FIXTURE_COUNT} fixtures, found #{files.size}")
  files.each do |f|
    path = "czerepaha/#{fixture_slug(f)}.html"
    ok(File.exist?(File.join(dir, path)), "no /#{path} for #{File.basename(f)}")
    ok(page(dir, path).at_css("article.cz-note"), "/#{path} is not built with the note layout")
  end
end

check "tag_matches_folder" do
  folders = [File.join(ROOT, "czerepaha", "_posts"), File.join(ROOT, ".claude", "fixtures", "czerepaha")]
  notes = folders.flat_map { |d| Dir[File.join(d, "*.md")] }
  notes.each do |f|
    tags = Array(front_matter(f)["tags"]).map { |t| t.to_s.downcase }
    ok(tags.include?("czerepaha"), "#{File.basename(f)}: a note of the section has no tag czerepaha")
  end
  Dir[File.join(ROOT, "_posts", "**", "*.md")].each do |f|
    tags = Array(front_matter(f)["tags"]).map { |t| t.to_s.downcase }
    ok(!tags.include?("czerepaha"), "#{File.basename(f)}: a post outside czerepaha/_posts has the tag czerepaha")
  end
end

check "feed_only_section" do
  doc = page(build(:fixtures), "czerepaha/index.html")
  want = fixture_files.map { |f| "/czerepaha/#{fixture_slug(f)}.html" }
  got = doc.css(".cz-post h2 a").map { |a| a["href"] }
  ok(got == want, "feed links differ:\n  got  #{got.inspect}\n  want #{want.inspect}")
  ok(doc.css(".cz-post").size == FIXTURE_COUNT, "expected #{FIXTURE_COUNT} .cz-post, found #{doc.css('.cz-post').size}")
  ok(doc.at_css(".cz-empty").nil?, ".cz-empty is shown with notes")
end

check "topic_counts" do
  doc = page(build(:fixtures), "czerepaha/index.html")
  buttons = doc.css(".cz-topics button[data-topic]")
  all = buttons.find { |b| b["data-topic"].to_s.empty? }
  ok(all, "no button 'Все заметки' (empty data-topic)")
  ok(all.text.include?("Все заметки"), "the empty-topic button is not 'Все заметки': #{all.text}")
  ok(all.at_css(".n").text.strip == FIXTURE_COUNT.to_s, "'Все заметки' count is #{all.at_css('.n').text.strip}, not #{FIXTURE_COUNT}")
  want = fixture_files.map { |f| front_matter(f)["topic"].to_s }.reject { |t| t.empty? || t == "mystery" }.tally
  shown = buttons.reject { |b| b["data-topic"].to_s.empty? }
  ok(shown.map { |b| b["data-topic"] } == %w[models biases].select { |k| want[k] },
     "topic buttons are #{shown.map { |b| b['data-topic'] }.inspect}")
  shown.each do |b|
    n = b.at_css(".n").text.strip.to_i
    ok(n == want[b["data-topic"]], "#{b['data-topic']}: count #{n}, expected #{want[b['data-topic']]}")
    ok(doc.css(".cz-post[data-topic='#{b['data-topic']}']").size == n, "#{b['data-topic']}: count differs from the notes shown")
  end
end

check "unknown_topic" do
  doc = page(build(:fixtures), "czerepaha/index.html")
  post = doc.css(".cz-post").find { |a| a.at_css("h2 a")["href"].end_with?("/inversiya.html") }
  ok(post, "the note with an unknown topic is not in the feed")
  ok(post["data-topic"] == "", "data-topic is #{post['data-topic'].inspect}, not empty")
  dot = post.at_css(".cz-dot")
  ok(dot, "no .cz-dot")
  ok(dot["style"].to_s !~ /color|background|--dot/, "the dot has its own colour: #{dot['style']}")
  ok(post.at_css(".cz-meta").text.strip =~ /\A30\.10\.2026 · \d+ мин\z/, "meta of an unknown topic: #{post.at_css('.cz-meta').text.strip}")
end

check "excerpt_without_footnote_numbers" do
  dir = build(:fixtures)
  feed = page(dir, "czerepaha/index.html")
  post = feed.css(".cz-post").find { |a| a.at_css("h2 a")["href"].end_with?("/britva-okkama.html") }
  ok(post, "the note without description is not in the feed")
  text = post.at_css(".cz-ex").text.strip
  ok(text.start_with?("Правило"), "feed description starts with #{text[0, 20].inspect}")
  ok(text !~ /\d/, "feed description has digits: #{text}")
  blog = page(dir, "blog.html")
  li = blog.css("ul.blog-posts li").find { |l| l.at_css(".post-title a:not(.cz-turtle)")["href"].end_with?("/czerepaha/britva-okkama.html") }
  ok(li, "the note is not in /blog.html")
  ex = li.at_css(".post-excerpt").text.strip
  ok(ex.start_with?("Правило"), "/blog.html excerpt starts with #{ex[0, 20].inspect}")
  ok(ex !~ /\d/, "/blog.html excerpt has digits: #{ex}")
end

check "note_page" do
  dir = build(:fixtures)
  feed = page(dir, "czerepaha/index.html")
  doc = page(dir, "czerepaha/karta-ne-territoriya.html")
  ok(doc.at_css("html")["lang"] == "ru", "html lang is not ru")
  art = doc.at_css("article")
  ok(art, "no <article>")
  links = art.css(".cz-back a").map { |a| a["href"] }
  ok(links == ["/czerepaha/", "/blog"], ".cz-back links are #{links.inspect}")
  meta = art.at_css(".cz-meta")&.text.to_s.strip
  ok(meta =~ /\d{2}\.\d{2}\.\d{4} · \d+ мин\z/, "meta is #{meta.inspect}")
  feed_meta = feed.css(".cz-post").find { |a| a.at_css("h2 a")["href"].end_with?("/karta-ne-territoriya.html") }.at_css(".cz-meta").text.strip
  ok(meta == feed_meta, "meta on the note (#{meta}) differs from the feed (#{feed_meta})")
  ok(art.at_css("h1")&.text.to_s.start_with?("Карта"), "h1 is missing or wrong")
  ok(art.at_css(".cz-dek")&.text.to_s.strip.start_with?("Любая модель"), ".cz-dek is missing or has no description")
  ok(art.at_css("nav.toc .toc-toggle"), "no nav.toc .toc-toggle")
  ok(art.at_css(".cz-prose"), "no .cz-prose")
  ok(art.at_css("p.post-signature")&.text.to_s.strip == "— Aliaksei", "signature is not '— Aliaksei'")
  srcs = script_srcs(doc)
  %w[toc.js notes.js sources.js anchors.js share.js Hyphenopoly_Loader.js hyphenate.js].each do |s|
    ok(srcs.include?(s), "#{s} is not loaded (have #{srcs.inspect})")
  end
  # Same conditions as in post.html: a note with one h2 has no table of contents, no notes, no sources
  one = page(dir, "czerepaha/pyat-pochemu.html")
  ok(one.at_css("nav.toc").nil?, "a note with one h2 has a table of contents")
  s1 = script_srcs(one)
  ok(!s1.include?("toc.js") && !s1.include?("notes.js") && !s1.include?("sources.js"), "one-h2 note loads toc/notes/sources: #{s1.inspect}")
  ok(s1.include?("anchors.js"), "one-h2 note does not load anchors.js")
  short = page(dir, "czerepaha/krug-kompetentsii.html")
  s2 = script_srcs(short)
  ok(%w[toc.js notes.js sources.js anchors.js].none? { |s| s2.include?(s) }, "short note loads scripts it does not need: #{s2.inspect}")
  ok(s2.include?("share.js") && s2.include?("hyphenate.js"), "short note lacks share.js or hyphenate.js")
end

# The real notes of the section and the topic each must have (nil: none).
REAL_TOPICS = {
  "circle-of-competence" => "models", "map-not-territory" => "models", "model-is-not-the-original" => "models",
  "razors" => "models", "entropy" => "models", "leverage" => "models", "simplicity" => "models",
  "simplicity-again" => "models",
  "confirmation-bias" => "biases", "collectors-fallacy" => "biases", "diderot-effect" => "biases",
  "risky-bubble" => "biases", "on-the-hook" => "biases",
  "we-start-digging" => nil
}

def stylesheet_hrefs(doc)
  doc.css("link[rel=stylesheet]").map { |l| l["href"].to_s }
end

def on_section_layout(doc, what)
  hrefs = stylesheet_hrefs(doc)
  ok(hrefs.any? { |h| h.start_with?("/assets/css/czerepaha.css") }, "#{what}: czerepaha.css is not linked")
  ok(hrefs.none? { |h| h.include?("/assets/css/main.css") }, "#{what}: main.css is linked")
end

check "real_notes" do
  dir = build(:real)
  files = Dir[File.join(ROOT, "czerepaha", "_posts", "*.md")]
  ok(files.size == REAL_NOTES, "expected #{REAL_NOTES} real notes, found #{files.size}")
  files.each do |f|
    slug = fixture_slug(f)
    doc = page(dir, "czerepaha/#{slug}.html")
    ok(doc.at_css("article.cz-note .cz-back"), "#{slug}: not on the section layout (no .cz-back)")
    on_section_layout(doc, slug)
    ok(REAL_TOPICS.key?(slug), "#{slug}: no expected topic in REAL_TOPICS")
    ok(front_matter(f)["topic"] == REAL_TOPICS[slug], "#{slug}: topic is #{front_matter(f)['topic'].inspect}, expected #{REAL_TOPICS[slug].inspect}")
  end
  feed = page(dir, "czerepaha/index.html")
  posts = feed.css(".cz-post")
  ok(posts.size == REAL_NOTES, "the feed has #{posts.size} notes, expected #{REAL_NOTES}")
  posts.each do |post|
    slug = post.at_css("h2 a")["href"][%r{/czerepaha/(.*)\.html}, 1]
    ok(post["data-topic"] == REAL_TOPICS[slug].to_s, "#{slug}: data-topic is #{post['data-topic'].inspect}")
  end
  ok(posts.find { |p| p.at_css("h2 a")["href"].end_with?("/we-start-digging.html") }["data-topic"] == "", "we-start-digging has a topic in the feed")
  counts = feed.css(".cz-topics button[data-topic]").to_h { |b| [b["data-topic"], b.at_css(".n").text.strip.to_i] }
  ok(counts == { "" => 14, "models" => 8, "biases" => 5 }, "topic counts are #{counts.inspect}")
  names = feed.css(".cz-topics button[data-topic]").to_h { |b| [b["data-topic"], b.text.gsub(/\d+\z/, "").strip] }
  ok(names["models"] == "Ментальные модели" && names["biases"] == "Когнитивные искажения", "topic names are #{names.inspect}")
end

check "list_pages" do
  dir = build(:real)
  { "mental-models" => "Ментальные модели", "cognitive-biases" => "Когнитивные искажения" }.each do |slug, title|
    doc = page(dir, "czerepaha/#{slug}.html")
    ok(doc.at_css("html")["lang"] == "ru", "#{slug}: html lang is not ru")
    on_section_layout(doc, slug)
    ok(doc.at_css(".cz-top"), "#{slug}: no section header")
    ok(doc.at_css(".cz-foot"), "#{slug}: no section footer")
    ok(doc.at_css("h1")&.text.to_s.strip == title, "#{slug}: h1 is #{doc.at_css('h1')&.text.inspect}")
    hrefs = doc.css(".cz-main a[href^='/czerepaha/']").map { |a| a["href"].sub(/#.*/, "") }.uniq
    ok(hrefs.size > 1, "#{slug}: no links to notes")
    hrefs.each do |h|
      path = h.end_with?("/") ? "#{h}index.html" : h
      ok(File.exist?(File.join(dir, path)), "#{slug}: the link #{h} leads nowhere")
    end
  end
  feed = page(dir, "czerepaha/index.html")
  links = feed.css(".cz-intro a").map { |a| a["href"] }
  ok(links.include?("/czerepaha/mental-models.html") && links.include?("/czerepaha/cognitive-biases.html"),
     "the feed has no links to the list pages: #{links.inspect}")
end

check "note_image" do
  dir = build(:real)
  doc = page(dir, "czerepaha/circle-of-competence.html")
  img = doc.at_css("img")
  ok(img && img["src"], "no img on circle-of-competence")
  ok(File.exist?(File.join(dir, img["src"].sub(/\?.*/, ""))), "img src #{img['src']} leads nowhere")
end

check "blog_turtles" do
  dir = build(:fixtures)
  %w[blog.html index.html].each do |f|
    doc = page(dir, f)
    hrefs = doc.css("link[rel=stylesheet]").map { |l| l["href"].to_s }
    ok(hrefs.any? { |h| h.include?("/assets/css/main.css") }, "#{f}: main.css is not linked")
    ok(hrefs.none? { |h| h.include?("czerepaha.css") }, "#{f}: czerepaha.css is linked")
    items = doc.css("ul.blog-posts li")
    section, other = items.partition { |li| li.at_css("a[href^='/czerepaha/']:not(.cz-turtle)") }
    ok(section.size == FIXTURE_COUNT, "#{f}: #{section.size} section notes, expected #{FIXTURE_COUNT}") if f == "blog.html"
    ok(!section.empty?, "#{f}: no section notes in the list")
    ok(!other.empty?, "#{f}: no ordinary posts in the list")
    section.each do |li|
      marks = li.css("a.cz-turtle")
      ok(marks.size == 1, "#{f}: #{marks.size} turtles in #{li.at_css('.post-title a:not(.cz-turtle)').text.strip}")
      m = marks.first
      ok(m["href"] == "/czerepaha/" && m["title"] == "Черепаха и слоны" && m["aria-label"] == "Черепаха и слоны", "#{f}: wrong turtle attributes")
      ok(m.at_css("svg .t-shell"), "#{f}: the turtle has no drawing")
      ok(m.next_element&.name == "time", "#{f}: the turtle is not right before <time>")
    end
    ok(other.all? { |li| li.at_css(".cz-turtle").nil? }, "#{f}: an ordinary post has a turtle")
  end
end

check "turtle_hangs_left" do
  dir = build(:fixtures)
  js = <<~JS
    var lis = Array.prototype.slice.call(document.querySelectorAll('ul.blog-posts li'));
    function info(li) {
      var t = li.querySelector('.cz-turtle'), d = li.querySelector('time');
      var tr = t && t.getBoundingClientRect(), dr = d.getBoundingClientRect();
      return t ? {tr: tr.right, tl: tr.left, tt: tr.top, tw: tr.width, th: tr.height, dl: dr.left, dt: dr.top} : {dl: dr.left, dt: dr.top};
    }
    var s = lis.filter(function (l) { return l.querySelector('a[href^="/czerepaha/"]'); })[0];
    var o = lis.filter(function (l) { return !l.querySelector('a[href^="/czerepaha/"]'); })[0];
    ({s: info(s), o: info(o), vw: window.innerWidth})
  JS
  r = probe("#{serve(dir)}/blog.html", 1280, js)
  ok(r["s"]["tr"], "wide: no turtle")
  ok(r["s"]["tr"] <= r["s"]["dl"], "wide: turtle right #{r['s']['tr']} is not left of the date #{r['s']['dl']}")
  ok((r["s"]["dl"] - r["o"]["dl"]).abs < 0.5, "wide: date left differs: #{r['s']['dl']} vs #{r['o']['dl']}")
  ok(r["s"]["tl"] > 0, "wide: turtle is off the screen")
  ok((r["s"]["tw"] - 22).abs < 2 && (r["s"]["th"] - 15).abs < 2, "wide: turtle size #{r['s']['tw']}x#{r['s']['th']}, expected about 22x15")
  [840, 928].each do |w|
    mid = probe("#{serve(dir)}/blog.html", w, js)
    ok(mid["s"]["tl"] >= 0, "#{w}: turtle is off the screen (left #{mid['s']['tl']})")
  end
  n = probe("#{serve(dir)}/blog.html", 390, js)
  ok((n["s"]["tt"] - n["s"]["dt"]).abs < 4, "narrow: turtle top #{n['s']['tt']} and date top #{n['s']['dt']} are on different lines")
  ok(n["s"]["tr"] <= n["s"]["dl"], "narrow: turtle is not before the date")
end

check "flat_share_turtle" do
  dir = build(:fixtures)
  js = <<~JS
    var svg = document.querySelector('.share-turtle-btn svg');
    var shell = svg.querySelector('.t-shell');
    ({stroke: getComputedStyle(svg).stroke, fill: getComputedStyle(shell).fill, plates: getComputedStyle(svg.querySelector('.t-plates')).stroke})
  JS
  r = probe("#{serve(dir)}/2023-10-18-telling-a-good-job-story.html", 1280, js)
  ok(r["stroke"] == "none", "share turtle stroke is #{r['stroke']}")
  ok(r["fill"] == "rgb(47, 125, 79)", "share turtle shell fill is #{r['fill']}")
  ok(r["plates"] != "none", "share turtle has no seams")
end

# Labels of the shared scripts (toc.js, share.js, anchors.js): the section passes Russian ones
# through data attributes, the main site keeps its English defaults.
LABELS_JS = <<~JS
  var r = {};
  // The probe does not wait for promises: a stub whose then() calls back at once keeps it synchronous.
  Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText: function () { return {then: function (ok) { ok(); }}; }}});
  r.toggle = document.querySelector('.toc-toggle').textContent;
  r.title = document.querySelector('.toc-title').textContent;
  r.word = document.querySelector('.share-word').textContent;
  var btn = document.querySelector('.anchor-copy');
  r.after = getComputedStyle(btn, '::after').content;
  btn.click();
  r.status = document.querySelector('.anchor-status').textContent;
  r.copied = btn.classList.contains('is-copied');
  document.querySelector('.share-copy').click();
  r.thanks = document.querySelector('.share-word').textContent;
  r.shareStatus = document.querySelector('.share-status').textContent;
  r
JS

check "labels_ru" do
  dir = build(:real)
  r = probe("#{serve(dir)}/czerepaha/map-not-territory.html", 1000, LABELS_JS)
  ok(r["toggle"] == "Содержание", "toc toggle is #{r['toggle']}")
  ok(r["title"] == "Содержание", "toc title is #{r['title']}")
  ok(r["word"] == "Поделиться", "share word is #{r['word']}")
  ok(r["after"] == '"Скопировано"', "anchor ::after is #{r['after']}")
  ok(r["copied"], "anchor button did not get is-copied")
  ok(r["status"] == "Ссылка на раздел скопирована", "anchor status is #{r['status']}")
  ok(r["thanks"] == "Спасибо!", "share thanks is #{r['thanks']}")
  ok(r["shareStatus"] == "Ссылка скопирована", "share status is #{r['shareStatus']}")
  narrow = probe("#{serve(dir)}/czerepaha/map-not-territory.html", 390, "document.querySelector('.share-word').textContent")
  ok(narrow == "Поделиться", "share word at 390 is #{narrow}")
end

check "labels_en_unchanged" do
  dir = build(:fixtures)
  r = probe("#{serve(dir)}/2023-10-18-telling-a-good-job-story.html", 1300, LABELS_JS)
  ok(r["toggle"] == "Table of contents", "toc toggle is #{r['toggle']}")
  ok(r["title"] == "Contents", "toc title is #{r['title']}")
  ok(r["word"] == "Share", "share word is #{r['word']}")
  ok(r["after"] == '"Copied"', "anchor ::after is #{r['after']}")
  ok(r["status"] == "Link to the section copied", "anchor status is #{r.inspect}")
  ok(r["thanks"] == "Thank you!", "share thanks is #{r['thanks']}")
  ok(r["shareStatus"] == "Link copied", "share status is #{r['shareStatus']}")
end

# The filter on /blog: the section is a third place in "Published on" (Task 3b).
PLACES_JS = <<~JS
  var g = document.querySelector('[data-group="source"]');
  var opts = Array.prototype.slice.call(g.querySelectorAll('.filter-option'));
  var lis = Array.prototype.slice.call(document.querySelectorAll('ul.blog-posts li'));
  function shown() { return lis.filter(function (l) { return !l.hidden; }); }
  function src(l) { return l.dataset.source; }
  var tagOpts = Array.prototype.slice.call(document.querySelectorAll('.filter-option[data-filter="tag"]'));
  var r = {
    values: opts.map(function (o) { return o.dataset.value; }),
    labels: opts.map(function (o) { return Array.prototype.filter.call(o.childNodes, function (n) { return n.nodeType === 3 && n.nodeValue.trim(); })[0].nodeValue.trim(); }),
    hint: g.querySelector('.filter-hint').textContent.trim(),
    svg: opts.map(function (o) { return !!o.querySelector('svg .t-shell'); }),
    counts: opts.map(function (o) { return o.querySelector('.filter-option-count').textContent; }),
    sources: lis.map(src),
    external: lis.map(function (l) { return l.classList.contains('external'); }),
    section: lis.map(function (l) { return !!l.querySelector('a[href^="/czerepaha/"]:not(.cz-turtle)'); }),
    tagValues: tagOpts.map(function (o) { return o.dataset.value; }),
    fills: tagOpts.map(function (o) { return o.dataset.fill; }),
    pressed: opts.map(function (o) { return o.getAttribute('aria-checked'); }),
    shownSources: shown().map(src), shownCount: shown().length,
    search: location.search,
    summary: document.querySelector('.filter-summary').textContent
  };
  r
JS

check "place_options" do
  r = probe("#{serve(build(:real))}/blog.html", 1280, PLACES_JS)
  ok(r["values"] == %w[guest local czerepaha], "place values are #{r['values'].inspect}")
  ok(r["labels"][2] == "Черепаха и слоны", "third place is #{r['labels'][2].inspect}")
  ok(r["svg"] == [false, false, true], "turtle svg in the places: #{r['svg'].inspect}")
  ok(r["hint"] == "· one of them", "place hint is #{r['hint'].inspect}")
  want = { "guest" => r["external"].count(true), "czerepaha" => r["section"].count(true) }
  want["local"] = r["sources"].size - want["guest"] - want["czerepaha"]
  ok(want["czerepaha"] == REAL_NOTES, "expected #{REAL_NOTES} section notes in the list, found #{want['czerepaha']}")
  got = r["values"].zip(r["counts"]).to_h { |v, n| [v, n.to_i] }
  ok(got == want, "place counts are #{got.inspect}, expected #{want.inspect}")
  r["sources"].each_with_index do |s, i|
    e = r["section"][i] ? "czerepaha" : (r["external"][i] ? "guest" : "local")
    ok(s == e, "post #{i} has data-source #{s.inspect}, expected #{e}")
  end
end

check "place_filter" do
  dir = serve(build(:real))
  r = probe("#{dir}/blog.html", 1280, PLACES_JS + "; document.querySelector('[data-value=czerepaha]').click(); var a = {n: shown().length, s: shown().map(src), q: location.search, sum: document.querySelector('.filter-summary').textContent}; document.querySelector('[data-value=local]').click(); ({a: a, local: shown().map(src), q2: location.search, total: lis.length})")
  ok(r["a"]["n"] == REAL_NOTES && r["a"]["s"].uniq == ["czerepaha"], "czerepaha place shows #{r['a']['s'].tally.inspect}")
  ok(r["a"]["q"] == "?source=czerepaha", "address after czerepaha is #{r['a']['q']}")
  ok(r["a"]["sum"].include?("published on Черепаха и слоны"), "summary is #{r['a']['sum']}")
  ok(r["local"].size > 0 && r["local"].uniq == ["local"], "akh.cx place shows #{r['local'].tally.inspect}")
  ok(r["q2"] == "?source=local", "address after akh.cx is #{r['q2']}")
end

check "old_tag_link" do
  r = probe("#{serve(build(:real))}/blog.html?tag=czerepaha", 1280, PLACES_JS)
  ok(r["pressed"] == %w[false false true], "places pressed: #{r['pressed'].inspect}")
  ok(r["shownCount"] == REAL_NOTES && r["shownSources"].uniq == ["czerepaha"], "shown: #{r['shownSources'].tally.inspect}")
  ok(r["search"] == "?source=czerepaha", "address is #{r['search']}")
end

check "no_czerepaha_tag" do
  r = probe("#{serve(build(:real))}/blog.html", 1280, PLACES_JS)
  ok(!r["tagValues"].include?("czerepaha"), "tag czerepaha is in the Tags group")
  ok(r["fills"] == (0...r["fills"].size).map(&:to_s), "tag fills are #{r['fills'].inspect}")
  want = r["tagValues"].each_index.to_a
  ok(r["fills"].map(&:to_i) == want, "tag fills skip a number")
end

check "tag_link_on_note" do
  dir = build(:real)
  Dir[File.join(dir, "**", "*.html")].each do |f|
    ok(!File.read(f).include?("tag=czerepaha"), "#{f.sub(dir, '')} links to ?tag=czerepaha")
  end
  Dir[File.join(ROOT, "czerepaha", "_posts", "*.md")].each do |f|
    doc = page(dir, "czerepaha/#{fixture_slug(f)}.html")
    doc.css("a[href*='/blog?']").each { |a| ok(a["href"].include?("source=czerepaha"), "#{fixture_slug(f)}: tag link #{a['href']}") }
  end
  src = File.read(File.join(ROOT, "_layouts", "post.html"))
  ok(src.include?("source=czerepaha"), "post.html does not send the czerepaha tag to ?source=czerepaha")
end

check "empty_filter" do
  r = probe("#{serve(build(:empty))}/blog.html", 1280, PLACES_JS)
  ok(r["values"] == %w[guest local], "empty build place values are #{r['values'].inspect}")
  ok(r["hint"] == "· one of them", "empty build place hint is #{r['hint'].inspect}")
end

# ── The note page (Task 5) ──────────────────────────────────────────────────────────────────────
# WKWebView in the probe plays no CSS transitions and runs no requestAnimationFrame, so the checks
# switch transitions off before reading geometry and wait with setTimeout, not frames.
NO_MOTION = <<~JS
  (function () {
    var s = document.createElement('style');
    s.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }';
    document.head.appendChild(s);
  })();
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function box(el) { var r = el.getBoundingClientRect(); return {l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, h: r.height}; }
JS

GREEN = "rgb(47, 125, 79)"

# For each <p> in the prose: the colour of its first letter and of its text, and whether it should
# have the big first letter: the first <p> right in the prose and the first one right after an h2.
DROP_CAPS_JS = <<~JS
  var prose = document.querySelector('.cz-prose');
  var first = prose.querySelector(':scope > p');
  [].map.call(prose.querySelectorAll('p'), function (p) {
    var prev = p.previousElementSibling;
    return {
      want: p.parentNode === prose && (p === first || (prev && prev.tagName === 'H2')),
      letter: getComputedStyle(p, '::first-letter').color,
      text: getComputedStyle(p).color,
      start: p.textContent.trim().slice(0, 24)
    };
  })
JS

def check_drop_caps(ps, where)
  ok(ps.count { |p| p["want"] } >= 2, "#{where}: fewer than two paragraphs should get the big letter")
  ps.each do |p|
    if p["want"]
      ok(p["letter"] == GREEN, "#{where}: first letter of «#{p['start']}» is #{p['letter']}, not green")
    else
      ok(p["letter"] == p["text"], "#{where}: first letter of «#{p['start']}» is #{p['letter']}, text is #{p['text']}")
    end
  end
end

check "drop_caps" do
  dir = build(:real)
  url = "#{serve(dir)}/czerepaha/map-not-territory.html"
  starts = probe(url, 1440, "document.querySelector('.cz-prose').firstElementChild.tagName")
  ok(starts == "BLOCKQUOTE", "map-not-territory starts with #{starts}, not a blockquote")
  check_drop_caps(probe(url, 1440, DROP_CAPS_JS), "map-not-territory")
end

check "one_heading" do
  url = "#{serve(build(:fixtures))}/czerepaha/pyat-pochemu.html"
  ok(probe(url, 1440, "!!document.querySelector('.toc')") == false, "a note with one h2 has .toc")
  ps = probe(url, 1440, DROP_CAPS_JS)
  ok(ps.size >= 2 && ps[0]["want"] && ps[1]["want"], "pyat-pochemu: expected the big letter on the first two paragraphs")
  check_drop_caps(ps, "pyat-pochemu")
end

LAYOUT_JS = NO_MOTION + <<~JS
  var prose = document.querySelector('.cz-prose'), head = document.querySelector('header');
  var toggle = document.querySelector('.toc-toggle');
  ({
    vw: innerWidth,
    headPos: getComputedStyle(head).position, head: box(head),
    sheetInHeader: !!head.querySelector('.toc-sheet'),
    prose: box(prose),
    notes: [].map.call(document.querySelectorAll('.sidenote'), function (n) { return {d: getComputedStyle(n).display, b: box(n)}; }),
    back: [].map.call(document.querySelectorAll('.cz-back a'), function (a) { return {b: box(a), vis: getComputedStyle(a).visibility}; }),
    toggle: toggle && {b: box(toggle), d: getComputedStyle(toggle).display, font: getComputedStyle(toggle).fontFamily}
  })
JS

def notes_in_margin(r, where)
  ok(!r["notes"].empty?, "#{where}: no .sidenote")
  r["notes"].each do |n|
    ok(n["d"] != "none", "#{where}: a side note is hidden")
    ok(n["b"]["l"] >= r["prose"]["r"], "#{where}: side note left #{n['b']['l']} is not right of the text (#{r['prose']['r']})")
    ok(n["b"]["r"] <= r["vw"], "#{where}: side note runs off the window (#{n['b']['r']})")
  end
end

check "wide_layout" do
  r = probe("#{serve(build(:fixtures))}/czerepaha/karta-ne-territoriya.html", 1440, LAYOUT_JS)
  ok(r["headPos"] == "fixed", "1440: header is #{r['headPos']}, not fixed")
  ok(r["sheetInHeader"], "1440: the table of contents is not in the header")
  ok(r["head"]["r"] <= r["prose"]["l"], "1440: the header (right #{r['head']['r']}) runs into the text (left #{r['prose']['l']})")
  ok((r["prose"]["w"] - 680).abs < 1, "1440: text column is #{r['prose']['w']}px, not 680")
  ok(((r["prose"]["l"] + r["prose"]["r"]) / 2 - r["vw"] / 2).abs < 1, "1440: text column is not centred")
  notes_in_margin(r, "1440")
  ok(r["back"].size == 2, "1440: #{r['back'].size} .cz-back links")
  r["back"].each { |b| ok(b["b"]["w"] > 0 && b["vis"] == "visible" && b["b"]["t"] >= 0, "1440: a .cz-back link is hidden") }
end

check "mid_layout" do
  url = "#{serve(build(:fixtures))}/czerepaha/karta-ne-territoriya.html"
  r = probe(url, 1200, LAYOUT_JS)
  ok(r["headPos"] == "sticky", "1200: header is #{r['headPos']}, not a strip on top")
  ok(r["head"]["t"].abs < 1 && (r["head"]["w"] - r["vw"]).abs < 1, "1200: header is not a strip across the top: #{r['head'].inspect}")
  ok(!r["sheetInHeader"], "1200: the table of contents is in the header")
  notes_in_margin(r, "1200")
  ok(r["toggle"] && r["toggle"]["d"] != "none" && r["toggle"]["b"]["w"] > 0, "1200: no visible .toc-toggle")
  ok(r["toggle"]["font"].include?("Inter"), "1200: .toc-toggle font is #{r['toggle']['font']}")
  o = probe(url, 1200, NO_MOTION + <<~JS)
    document.querySelector('.toc-toggle').click();
    var sheet = document.querySelector('.toc-sheet');
    ({open: document.querySelector('.toc').classList.contains('is-open'), vis: getComputedStyle(sheet).visibility,
      opacity: getComputedStyle(sheet).opacity, b: box(sheet), vw: innerWidth,
      markers: [].map.call(sheet.querySelectorAll('ol'), function (o) { return getComputedStyle(o).listStyleType; })})
  JS
  ok(o["open"] && o["vis"] == "visible" && o["opacity"] == "1", "1200: the sheet does not come out on a click: #{o.inspect}")
  ok(o["b"]["l"] >= 0 && o["b"]["r"] <= o["vw"], "1200: the sheet is off the window: #{o['b'].inspect}")
  ok(o["markers"].uniq == ["none"], "1200: list markers in the sheet: #{o['markers'].inspect}")
end

# Below $left-header the button of the table of contents goes along while you read (sticky in the
# left column from 60rem, tucked at the window's bottom right below): halfway down the note it is in
# the window and nothing covers it; a click brings the numbered sheet out inside the window.
check "toc_reachable" do
  url = "#{serve(build(:fixtures))}/czerepaha/karta-ne-territoriya.html"
  [390, 960, 1200].each do |w|
    r = probe(url, w, NO_MOTION + <<~JS, 700)
      (async function () {
        var toggle = document.querySelector('.toc-toggle'), nav = document.querySelector('.toc');
        scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 2);
        await wait(300);
        var t = box(toggle), hit = document.elementFromPoint(t.l + 8, (t.t + t.b) / 2);
        var top = document.querySelector('header').getBoundingClientRect().bottom;
        toggle.click();
        var sheet = document.querySelector('.toc-sheet');
        return {t: t, hit: !!hit && toggle.contains(hit), headerBottom: top, scrolled: scrollY > 100,
          open: nav.classList.contains('is-open'), vis: getComputedStyle(sheet).visibility, s: box(sheet),
          inNav: nav.contains(sheet), nums: [].filter.call(sheet.querySelectorAll('.toc-num'), function (n) { return n.textContent; }).length,
          vw: innerWidth, vh: innerHeight};
      })()
    JS
    t = r["t"]
    ok(r["scrolled"], "#{w}: the page did not scroll")
    ok(t["l"] >= 0 && t["l"] <= r["vw"] - 16 && t["t"] >= r["headerBottom"] && t["b"] <= r["vh"], "#{w}: mid page the button is out of reach: #{t.inspect}")
    ok(r["hit"], "#{w}: mid page something covers the button")
    ok(r["open"] && r["vis"] == "visible" && r["inNav"], "#{w}: the sheet does not come out: #{r.slice('open', 'vis', 'inNav').inspect}")
    s = r["s"]
    ok(s["l"] >= 0 && s["r"] <= r["vw"] && s["t"] >= 0 && s["b"] <= r["vh"], "#{w}: the sheet is out of the window: #{s.inspect}")
    ok(r["nums"] >= 3, "#{w}: the sections in the sheet are not numbered")
  end
end

check "toc_in_header" do
  r = probe("#{serve(build(:real))}/czerepaha/map-not-territory.html", 1440, NO_MOTION + <<~JS)
    var sheet = document.querySelector('header .toc-sheet'), toggle = document.querySelector('.toc-toggle');
    var a = sheet.querySelector('a');
    [].forEach.call(sheet.querySelectorAll('a'), function (x) { x.removeAttribute('aria-current'); });
    var quiet = getComputedStyle(a).borderLeftColor;
    a.setAttribute('aria-current', 'location');
    ({
      markers: [].map.call(sheet.querySelectorAll('ol, li'), function (o) { return getComputedStyle(o).listStyleType; }),
      nums: [].filter.call(sheet.querySelectorAll('.toc-num'), function (n) { return n.offsetWidth > 0; }).length,
      opacity: parseFloat(getComputedStyle(sheet).opacity),
      font: getComputedStyle(sheet).fontFamily,
      toggleShown: toggle.offsetWidth > 0 && toggle.offsetHeight > 0,
      quiet: quiet, current: getComputedStyle(a).borderLeftColor
    })
  JS
  ok(r["markers"].uniq == ["none"], "list markers in the header's contents: #{r['markers'].uniq.inspect}")
  ok(r["nums"].zero?, "#{r['nums']} section numbers shown in the header's contents")
  ok(r["opacity"] < 1, "the contents are not quiet without the mouse (opacity #{r['opacity']})")
  ok(r["font"].include?("Inter"), "the contents' font is #{r['font']}")
  ok(!r["toggleShown"], "the .toc-toggle button shows on a wide screen")
  ok(r["current"] == GREEN && r["quiet"] != GREEN, "the current section's line is #{r['current']} (others #{r['quiet']})")
end

check "narrow_layout" do
  r = probe("#{serve(build(:fixtures))}/czerepaha/karta-ne-territoriya.html", 390, NO_MOTION + <<~JS)
    var end = document.querySelector('.notes-end'), ref = document.querySelector('.fn-ref');
    var note = document.getElementById(ref.getAttribute('aria-controls'));
    var before = getComputedStyle(note).display;
    ref.click();
    ({end: end && {d: getComputedStyle(end).display, h: end.offsetHeight, items: end.querySelectorAll('li').length},
      before: before, after: getComputedStyle(note).display, ref: box(ref), note: box(note),
      sw: document.documentElement.scrollWidth, vw: innerWidth})
  JS
  ok(r["end"] && r["end"]["d"] != "none" && r["end"]["h"] > 0 && r["end"]["items"] == 3, "390: the notes are not listed at the end: #{r['end'].inspect}")
  ok(r["before"] == "none", "390: a side note shows before a tap")
  ok(r["after"] != "none" && r["note"]["h"] > 0, "390: a tap on the number does not open the note")
  ok(r["note"]["t"] > r["ref"]["t"], "390: the opened note is not under the line")
  ok(r["sw"] <= r["vw"], "390: the page is #{r['sw']}px wide in a #{r['vw']}px window")
end

check "note_image_style" do
  r = probe("#{serve(build(:real))}/czerepaha/circle-of-competence.html", 390, NO_MOTION + <<~JS)
    var img = document.querySelector('.cz-prose img'), prose = document.querySelector('.cz-prose');
    ({img: box(img), prose: box(prose), radius: parseFloat(getComputedStyle(img).borderTopLeftRadius),
      max: getComputedStyle(img).maxWidth, sw: document.documentElement.scrollWidth, vw: innerWidth})
  JS
  ok(r["max"] == "100%", "img max-width is #{r['max']}")
  ok(r["img"]["r"] <= r["prose"]["r"] + 0.5, "img runs out of the text column")
  ok(r["radius"] > 0, "img has square corners")
  ok(r["sw"] <= r["vw"], "390: the page is #{r['sw']}px wide in a #{r['vw']}px window")
end

# The share turtle of the section: fixed at the bottom of the window, out only at the end of a note.
SHARE_JS = NO_MOTION + <<~JS
  var share = document.querySelector('.share'), area = document.querySelector('.share-turtle');
  var btn = document.querySelector('.share-turtle-btn'), bubble = document.querySelector('.share-bubble');
  function state(withFocus) {
    return {atEnd: share.classList.contains('at-end'), open: share.classList.contains('is-open'),
      btn: box(btn), pe: getComputedStyle(btn).pointerEvents, areaPe: getComputedStyle(area).pointerEvents,
      bubble: box(bubble), bubbleOpacity: getComputedStyle(bubble).opacity, vh: innerHeight, vw: innerWidth,
      vis: getComputedStyle(btn).visibility, focus: withFocus ? focusable() : null};
  }
  // Whether the turtle or a button of its bubble can take the focus (then gives it back).
  function focusable() {
    var was = document.activeElement, got = false;
    [btn].concat([].slice.call(share.querySelectorAll('.share-links a, .share-links button'))).forEach(function (el) {
      el.focus(); if (document.activeElement === el) got = true;
    });
    if (was && was.focus) was.focus(); else document.activeElement.blur();
    return got;
  }
JS

check "share_pinned" do
  r = probe("#{serve(build(:real))}/czerepaha/map-not-territory.html", 1440, SHARE_JS + <<~JS)
    (async function () {
      var pos = getComputedStyle(share).position;
      scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 2);
      await wait(300);
      var mid = box(share);
      scrollTo(0, document.documentElement.scrollHeight);
      await wait(300);
      btn.click();
      return {pos: pos, mid: mid, end: state()};
    })()
  JS
  ok(r["pos"] == "fixed", ".share is #{r['pos']}, not fixed")
  ok((r["mid"]["b"] - r["end"]["vh"]).abs <= 1, "mid page: .share bottom #{r['mid']['b']}, window #{r['end']['vh']}")
  ok(r["end"]["open"], "a click on the turtle at the end does not open the bubble")
  ok((r["end"]["btn"]["b"] - r["end"]["vh"]).abs <= 1, "open turtle bottom #{r['end']['btn']['b']}, window #{r['end']['vh']}")
end

check "share_hidden_until_end" do
  dir = serve(build(:real))
  [1440, 390].each do |w|
    r = probe("#{dir}/czerepaha/map-not-territory.html", w, SHARE_JS + <<~JS)
      (async function () {
        var top = state(true);
        scrollTo(0, document.documentElement.scrollHeight);
        await wait(300);
        var end = state();
        if (innerWidth >= 1152) btn.click(); else share.classList.add('is-open');
        var opened = share.classList.contains('is-open');
        scrollTo(0, 0);
        await wait(300);
        return {top: top, end: end, opened: opened, back: state()};
      })()
    JS
    ok(!r["top"]["atEnd"] && r["top"]["btn"]["t"] >= r["top"]["vh"], "#{w} top of the note: turtle top #{r['top']['btn']['t']} in a #{r['top']['vh']}px window")
    ok(r["top"]["pe"] == "none" && r["top"]["areaPe"] == "none", "#{w} top of the note: the turtle catches the pointer")
    ok(r["top"]["vis"] == "hidden" && !r["top"]["focus"], "#{w} top of the note: the turtle can take the focus: #{r['top'].slice('vis', 'focus').inspect}")
    ok(r["end"]["atEnd"] && r["end"]["btn"]["t"] < r["end"]["vh"], "#{w} end of the note: turtle is not out (#{r['end']['btn']['t']})")
    ok(r["end"]["pe"] != "none", "#{w} end of the note: the turtle does not catch the pointer")
    ok(r["opened"], "#{w}: the bubble did not open")
    ok(!r["back"]["atEnd"] && !r["back"]["open"] && r["back"]["btn"]["t"] >= r["back"]["vh"], "#{w} back on top: turtle or bubble still out: #{r['back'].slice('atEnd', 'open').inspect}")
  end
  short = probe("#{serve(build(:fixtures))}/czerepaha/krug-kompetentsii.html", 1440, SHARE_JS + "state()")
  ok(short["atEnd"] && short["btn"]["t"] < short["vh"], "a short note does not show the turtle at once")
end

check "share_bubble_inside" do
  dir = serve(build(:real))
  [390, 1440].each do |w|
    r = probe("#{dir}/czerepaha/map-not-territory.html", w, SHARE_JS + <<~JS)
      (async function () {
        scrollTo(0, document.documentElement.scrollHeight);
        await wait(300);
        if (innerWidth >= 1152) btn.click();
        var clip = [];
        for (var el = bubble.parentElement; el && el !== document.body; el = el.parentElement) {
          var cs = getComputedStyle(el);
          if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') clip.push(el.className);
        }
        var s = state(); s.clip = clip; return s;
      })()
    JS
    b = r["bubble"]
    ok(r["bubbleOpacity"] == "1", "#{w}: the bubble is not shown (opacity #{r['bubbleOpacity']})")
    ok(b["l"] >= 0 && b["r"] <= r["vw"] && b["t"] >= 0 && b["b"] <= r["vh"], "#{w}: the bubble is out of the window: #{b.inspect}")
    ok(r["clip"].empty?, "#{w}: the bubble's ancestors clip it: #{r['clip'].inspect}")
  end
end

check "share_main_unchanged" do
  doc = page(build(:fixtures), "2023-10-18-telling-a-good-job-story.html")
  share = doc.at_css(".share")
  ok(share && share["data-pin"].nil?, "the main site's .share has data-pin")
  ok(doc.at_css(".share-end").nil?, "the main site has .share-end")
  labels = doc.css(".share-links [aria-label]").map { |a| a["aria-label"] }
  ok(labels == ["Post in LinkedIn", "Send in Telegram", "Send in WhatsApp", "Post in X", "Send by email", "Copy link"], "main share labels are #{labels.inspect}")
  ok(doc.at_css(".share-turtle-btn")["aria-label"] == "Share this post", "main share turtle label changed")
end

check "share_labels_ru" do
  doc = page(build(:real), "czerepaha/map-not-territory.html")
  labels = doc.css(".share-links [aria-label]").map { |a| a["aria-label"] }
  ok(labels == ["Поделиться в LinkedIn", "Отправить в Telegram", "Отправить в WhatsApp", "Поделиться в X", "Отправить по почте", "Скопировать ссылку"],
     "section share labels are #{labels.inspect}")
  titles = doc.css(".share-links [title]").map { |a| a["title"] }
  ok(titles == labels, "section share titles are #{titles.inspect}")
  ok(doc.at_css(".share")["data-pin"] == "end", "the section's .share has no data-pin=end")
  ok(doc.at_css(".share-end"), "no .share-end marker")
end

check "anchors_quiet" do
  r = probe("#{serve(build(:real))}/czerepaha/map-not-territory.html", 1440, <<~JS)
    Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText: function () { return {then: function (ok) { ok(); }}; }}});
    var btn = document.querySelector('.anchor-copy');
    var r = {chain: getComputedStyle(btn).opacity, before: getComputedStyle(btn, '::before').content,
      after: getComputedStyle(btn, '::after').opacity, pos: getComputedStyle(btn, '::after').position};
    btn.click();
    r.copied = btn.classList.contains('is-copied');
    r.anim = getComputedStyle(btn, '::after').animationName;
    r
  JS
  ok(r["chain"] == "0", "the chain shows without hover (opacity #{r['chain']})")
  ok(r["before"].include?("🔗"), "the chain is #{r['before']}")
  ok(r["after"] == "0", "«Скопировано» shows before a click (opacity #{r['after']})")
  ok(r["pos"] == "absolute", "«Скопировано» takes room in the line")
  ok(r["copied"] && r["anim"] != "none", "«Скопировано» does not fade in after a click: #{r.inspect}")
end

check "note_signoff" do
  dir = build(:real)
  email = YAML.safe_load(File.read(File.join(ROOT, "_config.yml")))["contact_email"]
  doc = page(dir, "czerepaha/map-not-territory.html")
  s = doc.at_css(".cz-signoff")
  ok(s, "no .cz-signoff")
  text = s.text.gsub(/\s+/, " ").strip
  ok(text.start_with?("Опубликовано 07.11.2025. Не согласны или нашли ошибку — напишите мне."), "signoff is #{text.inspect}")
  mail = s.at_css("a[href^='mailto:']")
  ok(mail && mail.text == "напишите мне" && mail["href"] == "mailto:#{email}", "mail link is #{mail&.to_html}")
  tags = s.at_css(".post-tags")
  ok(tags && tags.text.strip.start_with?("Теги:") && tags.at_css("svg.key[aria-hidden=true]"), "no «Теги:» with the key")
  ok(tags.css("a").map { |a| a["href"] } == ["/blog?source=czerepaha"], "tag links are #{tags.css('a').map { |a| a['href'] }.inspect}")
  ok(script_srcs(doc).include?("post-tags.js"), "post-tags.js is not loaded")
  fx = page(build(:fixtures), "czerepaha/karta-ne-territoriya.html")
  ok(fx.css(".cz-signoff .post-tags a").map { |a| a["href"] } == ["/blog?source=czerepaha", "/blog?tag=product"],
     "fixture tag links are #{fx.css('.cz-signoff .post-tags a').map { |a| a['href'] }.inspect}")
end

check "footer_aligned" do
  url = "#{serve(build(:real))}/czerepaha/map-not-territory.html"
  [390, 1200, 1440].each do |w|
    r = probe(url, w, NO_MOTION + "({foot: box(document.querySelector('.cz-foot a')), prose: box(document.querySelector('.cz-prose'))})")
    ok((r["foot"]["l"] - r["prose"]["l"]).abs < 1, "#{w}: footer starts at #{r['foot']['l']}, text at #{r['prose']['l']}")
  end
end

check "about_tail" do
  url = "#{serve(build(:empty))}/czerepaha/"
  [390, 1440].each do |w|
    r = probe(url, w, NO_MOTION + <<~JS)
      var star = document.querySelector('.cz-star'), about = document.getElementById('cz-about');
      star.click();
      var a = box(about), s = box(star), tail = getComputedStyle(about, '::before');
      ({tail: a.l + parseFloat(tail.left) + parseFloat(tail.width) / 2, star: (s.l + s.r) / 2})
    JS
    ok((r["tail"] - r["star"]).abs <= 2, "#{w}: the tail is at #{r['tail'].round(1)}, the star at #{r['star'].round(1)}")
  end
end

# ── The topic filter (Task 6) ───────────────────────────────────────────────────────────────────
# What the feed shows now: the topics of the visible notes, which buttons are pressed, the address.
FEED_STATE_JS = <<~JS
  function state() {
    return {
      shown: [].filter.call(document.querySelectorAll('.cz-post'), function (p) { return !p.hidden; })
        .map(function (p) { return p.dataset.topic; }),
      pressed: [].filter.call(document.querySelectorAll('.cz-topics button'), function (b) { return b.getAttribute('aria-pressed') === 'true'; })
        .map(function (b) { return b.dataset.topic; }),
      search: location.search
    };
  }
JS

check "topic_filter" do
  r = probe("#{serve(build(:fixtures))}/czerepaha/", 1200, FEED_STATE_JS + <<~JS)
    var out = {topics: document.querySelector('.cz-topics').hidden};
    document.querySelector('[data-topic="models"]').click();
    out.models = state();
    document.querySelector('[data-topic="biases"]').click();
    out.biases = state();
    document.querySelector('.cz-topics button[data-topic=""]').click();
    out.all = state();
    out
  JS
  ok(r["topics"] == false, ".cz-topics is still hidden after the script ran")
  ok(r["models"]["shown"] == %w[models models], "models shows #{r['models']['shown'].inspect}")
  ok(r["models"]["pressed"] == %w[models], "models: pressed #{r['models']['pressed'].inspect}")
  ok(r["models"]["search"] == "?topic=models", "models: address #{r['models']['search'].inspect}")
  ok(r["biases"]["shown"] == %w[biases biases], "biases shows #{r['biases']['shown'].inspect}")
  ok(r["biases"]["pressed"] == %w[biases], "biases: pressed #{r['biases']['pressed'].inspect}")
  ok(r["all"]["shown"].size == FIXTURE_COUNT, "'Все заметки' shows #{r['all']['shown'].size} notes")
  ok(r["all"]["pressed"] == [""], "'Все заметки' is not the only pressed button: #{r['all']['pressed'].inspect}")
  ok(r["all"]["search"] == "", "'Все заметки' leaves the address #{r['all']['search'].inspect}")
end

check "topic_from_url" do
  r = probe("#{serve(build(:fixtures))}/czerepaha/?topic=biases", 1200, FEED_STATE_JS + "state()")
  ok(r["shown"] == %w[biases biases], "?topic=biases shows #{r['shown'].inspect}")
  ok(r["pressed"] == %w[biases], "?topic=biases: pressed #{r['pressed'].inspect}")
end

check "bad_topic_param" do
  r = probe("#{serve(build(:fixtures))}/czerepaha/?topic=nope", 1200, FEED_STATE_JS + "state()")
  ok(r["shown"].size == FIXTURE_COUNT, "?topic=nope shows #{r['shown'].size} notes")
  ok(r["pressed"] == [""], "?topic=nope: pressed #{r['pressed'].inspect}, not 'Все заметки'")
end

check "topics_in_header" do
  url = "#{serve(build(:fixtures))}/czerepaha/"
  js = <<~JS
    var t = document.querySelector('.cz-topics'), menu = document.querySelector('header .cz-menu');
    ({inHeader: !!t.closest('header'), inMain: !!t.closest('main'),
      afterMenu: !!menu && !!(menu.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING)})
  JS
  r = probe(url, 1440, js)
  ok(r["inHeader"] && r["afterMenu"], "1440: .cz-topics is not in the header after the menu (#{r.inspect})")
  r = probe(url, 1000, js)
  ok(r["inMain"] && !r["inHeader"], "1000: .cz-topics is not in main (#{r.inspect})")
end

check "no_js_shows_all" do
  doc = page(build(:fixtures), "czerepaha/index.html")
  ok(doc.at_css(".cz-topics")&.key?("hidden"), ".cz-topics has no hidden attribute")
  ok(doc.css(".cz-post").none? { |p| p.key?("hidden") }, "a note is hidden in the HTML")
end

check "topics_hidden_without_js" do
  r = probe("#{serve(build(:empty))}/czerepaha/", 1200, <<~JS)
    var a = document.createElement('aside');
    a.className = 'cz-topics'; a.hidden = true; document.querySelector('main').appendChild(a);
    a.hidden = false; var shown = getComputedStyle(a).display; a.hidden = true;
    shown + '/' + getComputedStyle(a).display
  JS
  ok(r.split("/").first == "flex", "the test element is not styled as .cz-topics: #{r}")
  ok(r.split("/").last == "none", "a hidden .cz-topics has display #{r.split('/').last}")
end

check "feed_column" do
  url = "#{serve(build(:real))}/czerepaha/"
  js = NO_MOTION + <<~JS
    var l = box(document.querySelector('.cz-list')), t = box(document.querySelector('.cz-topics'));
    ({list: l, topics: t, w: innerWidth})
  JS
  r = probe(url, 1440, js)
  ok(r["list"]["w"] >= 600, "1440: the list is #{r['list']['w'].round}px wide")
  ok(((r["list"]["l"] + r["list"]["r"]) / 2 - r["w"] / 2).abs <= 2, "1440: the list is not centred (#{r['list'].inspect})")
  r = probe(url, 1200, js)
  ok(r["list"]["w"] >= 600, "1200: the list is #{r['list']['w'].round}px wide")
  ok(r["topics"]["r"] <= r["list"]["l"] && (r["topics"]["t"] - r["list"]["t"]).abs <= 4,
     "1200: the topics are not in a column left of the list (#{r['topics'].inspect} #{r['list'].inspect})")
end

# The offscreen WebKit view is not the key window, so :focus-visible never matches there; the check
# reads the rule instead.
check "topic_focus" do
  r = probe("#{serve(build(:fixtures))}/czerepaha/", 1200, <<~JS)
    var found = [];
    [].forEach.call(document.styleSheets, function (sh) {
      var rules = [];
      try { rules = sh.cssRules; } catch (e) {} // the fonts' stylesheet is cross-origin
      [].forEach.call(rules, function (rule) {
        if (rule.selectorText && /\.cz-topics button:focus-visible/.test(rule.selectorText)) {
          found.push(rule.style.cssText);
        }
      });
    });
    found
  JS
  ok(r.size == 1, "no rule '.cz-topics button:focus-visible' (#{r.inspect})")
  ok(r[0] =~ /outline:\s*(\d+)px solid (var\(--green\)|rgb\(47, 125, 79\))/ && $1.to_i >= 2, "the focus ring is #{r[0].inspect}")
end

check "first_visible_note_flush" do
  r = probe("#{serve(build(:fixtures))}/czerepaha/", 1200, FEED_STATE_JS + <<~JS)
    function edge() {
      var vis = [].filter.call(document.querySelectorAll('.cz-post'), function (p) { return !p.hidden; });
      return vis.map(function (p) { var c = getComputedStyle(p); return [c.borderTopWidth, c.paddingTop]; });
    }
    var out = {all: edge()};
    document.querySelector('[data-topic="biases"]').click(); out.biases = edge();
    document.querySelector('[data-topic="models"]').click(); out.models = edge();
    out
  JS
  %w[all biases models].each do |k|
    e = r[k]
    ok(e.first == %w[0px 0px], "#{k}: the first visible note has top border/padding #{e.first.inspect}")
    ok(e.drop(1).all? { |x| x == %w[1px 20px] }, "#{k}: later notes have #{e.drop(1).inspect}, not a rule and 20px")
  end
end

check "topic_keeps_address" do
  r = probe("#{serve(build(:fixtures))}/czerepaha/?utm=x#top", 1200, <<~JS)
    document.querySelector('[data-topic="biases"]').click();
    var a = location.search + '|' + location.hash;
    document.querySelector('.cz-topics button[data-topic=""]').click();
    [a, location.search + '|' + location.hash]
  JS
  ok(r[0] == "?utm=x&topic=biases|#top", "after a topic click the address is #{r[0].inspect}")
  ok(r[1] == "?utm=x|#top", "after 'Все заметки' the address is #{r[1].inspect}")
end

check "topic_click_wide" do
  r = probe("#{serve(build(:fixtures))}/czerepaha/", 1440, FEED_STATE_JS + <<~JS)
    var inHeader = !!document.querySelector('.cz-topics').closest('header');
    document.querySelector('[data-topic="biases"]').click();
    ({inHeader: inHeader, state: state()})
  JS
  ok(r["inHeader"], "1440: the topics are not in the header")
  ok(r["state"]["shown"] == %w[biases biases], "1440: a click shows #{r['state']['shown'].inspect}")
  ok(r["state"]["search"] == "?topic=biases", "1440: address #{r['state']['search'].inspect}")
end

# ── Speed, size, build time (Task 7) ────────────────────────────────────────────────────────────
def median(a)
  v = a.sort
  v.size.odd? ? v[v.size / 2] : (v[v.size / 2 - 1] + v[v.size / 2]) / 2.0
end

PERF_NOTES = {} # measured numbers, printed by the checks that take them (PERF=1)
def note_perf(name, text)
  puts "  #{name}: #{text}" if ENV["PERF"]
end

check "perf_topic_click" do
  r = probe("#{serve(build(:bulk))}/czerepaha/", 1200, FEED_STATE_JS + <<~JS)
    var all = document.querySelector('.cz-topics button[data-topic=""]'), m = document.querySelector('[data-topic="models"]');
    var times = [];
    // 20 clicks, alternating a topic and 'Все заметки'; each one includes the layout it forces.
    for (var i = 0; i < 20; i++) {
      var b = i % 2 ? all : m;
      var t0 = performance.now(); b.click(); document.body.offsetHeight; times.push(performance.now() - t0);
    }
    ({times: times, n: document.querySelectorAll('.cz-post').length})
  JS
  ok(r["n"] == 200, "#{r['n']} notes in the bulk build")
  med = median(r["times"])
  note_perf("perf_topic_click", "median #{med.round(2)} ms, max #{r['times'].max.round(2)} ms over #{r['times'].size} clicks, 200 notes")
  ok(med <= 16, "a topic click takes #{med.round(1)} ms (median of 20) on 200 notes")
end

# Dirties the layout, then times a synchronous resize event plus a forced layout, 20 times.
RESIZE_JS = <<~JS
  var times = [];
  for (var i = 0; i < 20; i++) {
    document.body.style.paddingTop = (i % 2) + 'px';
    var t0 = performance.now();
    window.dispatchEvent(new Event('resize'));
    document.body.offsetHeight;
    times.push(performance.now() - t0);
  }
  // The timer ticks in whole milliseconds, so the same loop 200 times gives the finer mean.
  var t1 = performance.now();
  for (var j = 0; j < 200; j++) {
    document.body.style.paddingTop = (j % 2) + 'px';
    window.dispatchEvent(new Event('resize'));
    document.body.offsetHeight;
  }
  var mean = (performance.now() - t1) / 200;
  document.body.style.paddingTop = '';
  ({times: times, mean: mean, notes: document.querySelectorAll('.sidenote').length})
JS

check "perf_notes_layout" do
  base = "#{serve(build(:bulk))}/czerepaha/bulk-footnotes.html"
  [1440, 1000, 400].each do |w|
    r = probe(base, w, RESIZE_JS)
    ok(r["notes"] >= BULK_FOOTNOTES, "#{w}: #{r['notes']} side notes, expected #{BULK_FOOTNOTES}")
    med = median(r["times"])
    note_perf("perf_notes_layout", "#{w}px, 30 footnotes: median #{med.round(2)} ms, max #{r['times'].max.round(2)} ms, mean of 200 #{r['mean'].round(2)} ms")
    ok(med <= 16 && r["mean"] <= 16, "#{w}: resize + layout takes #{med.round(1)} ms (median of 20) with 30 footnotes")
  end
  # The longest real note (no footnotes in it), as the worst real data.
  r = probe("#{serve(build(:real))}/czerepaha/map-not-territory.html", 1440, RESIZE_JS)
  med = median(r["times"])
  note_perf("perf_notes_layout", "1440px, real map-not-territory: median #{med.round(2)} ms, max #{r['times'].max.round(2)} ms, mean of 200 #{r['mean'].round(2)} ms")
  ok(med <= 16 && r["mean"] <= 16, "1440: resize + layout takes #{med.round(1)} ms (median of 20) on map-not-territory")
end

# Safari 17.3 has no 'longtask' entries (PerformanceObserver.supportedEntryTypes lacks it). Instead a
# message loop starts at the very beginning of the document (webprobe's document-start script) and
# runs 3 s: a gap between two of its messages is the time the main thread was blocked, which is what a long
# task is. Budget 100 ms. The probe then reads the result.
HEARTBEAT_JS = <<~JS
  (function () {
    // A message loop, not setInterval: WebKit stretches the timers of a page that is not on screen to 1 s.
    var ch = new MessageChannel(), last = performance.now(), start = last, worst = 0, gaps = [], ticks = 0;
    ch.port1.onmessage = function () {
      var t = performance.now(), gap = t - last;
      ticks++;
      if (gap > 30) gaps.push([Math.round(last), Math.round(gap)]);
      worst = Math.max(worst, gap); last = t;
      if (t - start < 3000) ch.port2.postMessage(0);
      else window.__beat = {worst: worst, gaps: gaps, ticks: ticks};
    };
    ch.port2.postMessage(0);
  })();
JS

check "long_tasks" do
  # An empty page stalls the main thread for ~75-90 ms at the start of the load (the web view's own
  # start-up, seen on <p>x</p> too). That stall is the floor: the budget is for what a page adds to it.
  bulk = build(:bulk)
  File.write(File.join(bulk, "blank.html"), "<!doctype html><p>x</p>")
  floor = median(Array.new(3) { probe("#{serve(bulk)}/blank.html", 1440, "window.__beat", 900, HEARTBEAT_JS)["worst"] })
  note_perf("long_tasks", "floor (an empty page): #{floor.round(1)} ms")
  pages = {
    "feed, 200 notes" => ["#{serve(bulk)}/czerepaha/", 1440],
    "note, 30 footnotes" => ["#{serve(bulk)}/czerepaha/bulk-footnotes.html", 1440],
    "feed, real" => ["#{serve(build(:real))}/czerepaha/", 1440],
    "note, real map-not-territory" => ["#{serve(build(:real))}/czerepaha/map-not-territory.html", 1440]
  }
  pages.each do |what, (url, w)|
    r = Array.new(3) { probe(url, w, "window.__beat", 900, HEARTBEAT_JS) }.min_by { |x| x["worst"] } # the quietest of 3: a stall that repeats is the page's
    net = r["worst"] - floor
    note_perf("long_tasks", "#{what}: longest stall #{r['worst'].round(1)} ms, #{net.round(1)} ms over the floor (#{r['ticks']} ticks, gaps over 30 ms: #{r['gaps'].inspect})")
    ok(net <= 100, "#{what}: the main thread was blocked #{net.round}ms over the floor in the first 3 s #{r['gaps'].inspect}")
  end
end

check "asset_sizes" do
  dir = build(:real)
  css = File.size(File.join(dir, "assets/css/czerepaha.css"))
  js = File.size(File.join(dir, "assets/js/czerepaha.js"))
  note_perf("asset_sizes", "czerepaha.css #{css} bytes (budget 20480), czerepaha.js #{js} bytes (budget 4096)")
  ok(css <= 20_480, "czerepaha.css is #{css} bytes, over 20480")
  ok(js <= 4_096, "czerepaha.js is #{js} bytes, over 4096")
  faces = File.read(File.join(dir, "assets/css/czerepaha.css")).scan("@font-face").size
  ok(faces == 0, "czerepaha.css declares #{faces} @font-face (the font comes from Google Fonts)")
  ["czerepaha/index.html", "czerepaha/map-not-territory.html", "czerepaha/confirmation-bias.html"].each do |f|
    doc = page(dir, f)
    inter = doc.css("head link[href]").select { |l| l["href"].include?("fonts.googleapis.com/css") }
    ok(inter.size == 1, "#{f}: #{inter.size} Google Fonts stylesheets in head")
    weights = inter.first["href"][/wght@([\d;]+)/, 1].to_s.split(";")
    note_perf("asset_sizes", "#{f}: Inter weights #{weights.join(',')}")
    ok(inter.first["href"].include?("family=Inter") && weights.size <= 3 && !weights.empty?, "#{f}: Inter weights #{weights.inspect}")
    ok(doc.css("head link[href]").count { |l| l["href"].include?("fonts.g") && l["rel"] == "stylesheet" } == 1, "#{f}: other font stylesheets in head")
  end
end

# Median of 3 jekyll builds of the empty section (:empty) on this branch and on main, alternating.
def timed_build(src_root, tag)
  src = File.join(WORK, "bt-#{tag}-src")
  dest = File.join(WORK, "bt-#{tag}-site")
  FileUtils.rm_rf([src, dest])
  FileUtils.mkdir_p(src)
  system("rsync", "-a", "--exclude=.git", "--exclude=_site", "--exclude=.jekyll-cache",
         "--exclude=.superpowers", "--exclude=czerepaha/_posts", "#{src_root}/", "#{src}/") or raise "rsync failed"
  t0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  out, st = Open3.capture2e("bundle", "exec", "jekyll", "build", "--source", src,
                            "--config", "#{src}/_config.yml,#{CACHE}/_config.local.yml", "--destination", dest)
  dt = Process.clock_gettime(Process::CLOCK_MONOTONIC) - t0
  raise Fail, "jekyll build failed (#{tag}): #{out.lines.last(4).join}" unless st.success?
  dt
end

check "build_time" do
  main = File.join(WORK, "main-worktree")
  out, st = Open3.capture2e("git", "-C", ROOT, "worktree", "add", "--detach", main, "main")
  raise Fail, "git worktree add main failed: #{out}" unless st.success?
  begin
    branch = []
    base = []
    3.times do |i|
      branch << timed_build(ROOT, "branch#{i}")
      base << timed_build(main, "main#{i}")
    end
    b, m = median(branch), median(base)
    note_perf("build_time", "branch #{b.round(2)} s (#{branch.map { |x| x.round(2) }.join(', ')}), main #{m.round(2)} s (#{base.map { |x| x.round(2) }.join(', ')}); limit #{[m * 1.1, m + 1].max.round(2)} s")
    ok(b <= [m * 1.1, m + 1].max, "an empty-section build takes #{b.round(2)} s on the branch, #{m.round(2)} s on main (limit #{[m * 1.1, m + 1].max.round(2)} s)")
  ensure
    system("git", "-C", ROOT, "worktree", "remove", "--force", main, out: File::NULL, err: File::NULL)
  end
end

names = ARGV.empty? ? CHECKS.keys : ARGV
unknown = names - CHECKS.keys
abort "unknown checks: #{unknown.join(', ')}" unless unknown.empty?
failed = 0
names.each do |name|
  begin
    CHECKS[name].call
    puts "PASS #{name}"
  rescue Fail => e
    failed += 1
    puts "FAIL #{name}: #{e.message}"
  rescue StandardError => e
    failed += 1
    puts "FAIL #{name}: #{e.class}: #{e.message.lines.first(8).join.strip}"
  end
end
exit(failed.zero? ? 0 : 1)
