#!/bin/bash
# Checks for the "Черепаха и слоны" section (akh.cx/czerepaha).
# .claude/check-czerepaha.sh [name…]: runs all checks or the named ones, prints
# "PASS name" or "FAIL name: reason", exits non-zero if any check failed.
# The environment is the same as in serve.sh; webprobe is compiled once into the cache folder.
set -euo pipefail

BLOG_DIR="$(cd "$(dirname "$0")/.." && pwd)"
export BLOG_DIR
CACHE="$HOME/Library/Caches/akh-blog"

export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8
export BUNDLE_PATH="$CACHE/gems"
export BUNDLE_GEMFILE="$CACHE/Gemfile"
export CACHE

mkdir -p "$CACHE"
cat > "$BUNDLE_GEMFILE" <<'GEMS'
eval_gemfile File.join(ENV.fetch("BLOG_DIR"), "Gemfile")
gem "openssl", ">= 3.3.1"
GEMS
bundle check > /dev/null 2>&1 || bundle install --jobs 4 > /dev/null
printf 'repository: akhavanski/akhavanski.github.io\ndescription: ""\n' > "$CACHE/_config.local.yml"

# The real path (no symlinks): Jekyll refuses includes when the site folder is under a symlink such as /var.
WORK="$(cd -P "$(mktemp -d "${TMPDIR:-/tmp}/czerepaha-check.XXXXXX")" && pwd -P)"
trap 'rm -rf "$WORK"' EXIT
export WORK
# webprobe is compiled once per content of the .swift: the binary's name carries its hash, so
# worktrees and branches sharing the cache never run a stale one.
PROBE="$CACHE/webprobe-$(shasum "$BLOG_DIR/.claude/webprobe.swift" | cut -c1-12)"
export PROBE
if [ ! -x "$PROBE" ]; then
  swiftc -O -o "$PROBE.$$" "$BLOG_DIR/.claude/webprobe.swift" 2> "$WORK/swiftc.log" \
    || { cat "$WORK/swiftc.log" >&2; exit 1; }
  mv "$PROBE.$$" "$PROBE"
fi

cd "$BLOG_DIR"
bundle exec ruby "$BLOG_DIR/.claude/check-czerepaha.rb" "$@"
