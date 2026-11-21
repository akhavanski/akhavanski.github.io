# Checks for the "Черепаха и слоны" section (akh.cx/czerepaha), run by check-czerepaha.sh.
# Helpers: build(mode) makes a Jekyll build in a temp folder, page(dir, path) parses a built page,
# serve(dir) serves a build over WEBrick, probe(url, width, js) runs JS in a WKWebView (webprobe).
# Each check is `check "name" do … end`; it fails by raising Fail (see `ok`).
require "json"
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

# Modes: :empty is the repository as is, :fixtures adds .claude/fixtures/czerepaha/*.md as
# czerepaha/_posts, :bulk adds 200 generated notes. Builds are cached per mode.
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
    when :fixtures
      FileUtils.mkdir_p(posts)
      Dir[File.join(ROOT, ".claude", "fixtures", "czerepaha", "*.md")].each { |f| FileUtils.cp(f, posts) }
    when :bulk
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
