#!/bin/bash
# Ставит гемы для Jekyll в облачных сессиях Claude Code.
# Состояние контейнера кешируется после хука, так что полная установка нужна только раз.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

if ! bundle check > /dev/null 2>&1; then
  bundle install --jobs 4 --retry 3
fi

# Исполняемые файлы гемов (jekyll и др.) ставятся в каталог, которого нет в PATH.
GEM_BIN="$(ruby -e 'print Gem.bindir')"
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export PATH=\"$GEM_BIN:\$PATH\"" >> "$CLAUDE_ENV_FILE"
fi
