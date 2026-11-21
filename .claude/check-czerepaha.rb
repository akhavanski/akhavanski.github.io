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
PROBE = File.join(WORK, "webprobe")

STAR_TEXT = "Вы находитесь в особом отделе моего сайта, который посвящён ментальным моделям. " \
            "Черепаха, может, и двигается медленнее, но точно доходит до цели."

class Fail < StandardError; end

def ok(cond, msg)
  raise Fail, msg unless cond
end

# Modes: :empty is a copy of the repository without czerepaha/_posts, :fixtures replaces the real
# notes with .claude/fixtures/czerepaha/*.md, :bulk with 200 generated notes, :real is the
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
      200.times { |i| bulk_note(posts, i) } # filled in by the task that needs bulk data
    else raise "unknown mode #{mode}"
    end
    out, st = Open3.capture2e("bundle", "exec", "jekyll", "build", "--source", src,
                              "--config", "#{src}/_config.yml,#{CACHE}/_config.local.yml",
                              "--destination", dest)
    raise "jekyll build failed (#{mode}): #{out.lines.last(6).join}" unless st.success?
    dest
  end
end

# One generated note for the :bulk build (200 of them), enough text to be a real list row.
def bulk_note(dir, i)
  date = (Date.new(2026, 1, 1) + i).strftime("%Y-%m-%d")
  File.write(File.join(dir, "#{date}-bulk-#{i}.md"),
             "---\ntitle: Заметка #{i}\ntags: [czerepaha]\ntopic: models\n---\n\nТекст заметки #{i}.\n")
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

def probe(url, width, js, height = 900)
  out, err, st = Open3.capture3(PROBE, url, width.to_s, height.to_s, js)
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
  li = blog.css("ul.blog-posts li").find { |l| l.at_css(".post-title a")["href"].end_with?("/czerepaha/britva-okkama.html") }
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
