#!/bin/bash
# Локальное превью блога: jekyll serve с livereload прямо из репозитория.
# .claude/serve.sh [порт] [папка с сайтом]: порт по умолчанию 4000,
# папка — этот репозиторий (другая нужна, чтобы открыть рядом вариант из worktree).
set -euo pipefail

PORT="${1:-4000}"
export BLOG_DIR="$(cd "${2:-$(dirname "$0")/..}" && pwd)"
CACHE="$HOME/Library/Caches/akh-blog" # вне Яндекс.Диска, чтобы он не синхронизировал гемы

export PATH="/opt/homebrew/opt/ruby/bin:$PATH" # системный Ruby 2.6 слишком старый
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8     # иначе Sass падает на не-ASCII
export BUNDLE_PATH="$CACHE/gems"
export BUNDLE_GEMFILE="$CACHE/Gemfile"

# Gemfile блога плюс свежий openssl: встроенный в Ruby 3.4 openssl 3.3.0 с OpenSSL 3.6
# падает на «unable to get certificate CRL», и remote_theme не скачивает тему.
mkdir -p "$CACHE"
cat > "$BUNDLE_GEMFILE" <<'EOF'
eval_gemfile File.join(ENV.fetch("BLOG_DIR"), "Gemfile")
gem "openssl", ">= 3.3.1"
EOF
bundle check > /dev/null 2>&1 || bundle install --jobs 4

# На GitHub Pages это подставляется само, локально без repository падает github-metadata.
printf 'repository: akhavanski/akhavanski.github.io\ndescription: ""\n' > "$CACHE/_config.local.yml"

cd "$BLOG_DIR"
exec bundle exec jekyll serve \
  --config "_config.yml,$CACHE/_config.local.yml" \
  --destination "$CACHE/site-$PORT" \
  --port "$PORT" \
  --livereload --livereload-port $((PORT + 31729))
