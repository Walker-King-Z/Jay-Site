#!/usr/bin/env bash

set -euo pipefail

HOME_DIR="${HOME}"
TARGET_DIR="${HOME_DIR}"
FIRST_AUTO_DIR=""

for candidate in "${HOME_DIR}"/auto*; do
  if [[ -d "${candidate}" ]]; then
    FIRST_AUTO_DIR="${candidate}"
    break
  fi
done

if [[ -n "${FIRST_AUTO_DIR}" ]]; then
  TARGET_DIR="${FIRST_AUTO_DIR}"
fi

cd "${TARGET_DIR}"

mkdir -p .hidden
cat <<'PYEOF' > .hidden/hello.py
print("Hello, world!")
PYEOF

if ! command -v python3 >/dev/null 2>&1; then
  export DEBIAN_FRONTEND=noninteractive
  sudo apt-get update
  sudo apt-get install -y python3 python3-pip python3-venv
fi

if ! python3 -m venv .hidden/.venv >/dev/null 2>&1; then
  export DEBIAN_FRONTEND=noninteractive
  sudo apt-get update
  sudo apt-get install -y python3-venv
  python3 -m venv .hidden/.venv
fi

source .hidden/.venv/bin/activate

python -m pip install --upgrade pip setuptools wheel
python -m pip install playwright

python -m playwright install
sudo env PATH="${PATH}" .hidden/.venv/bin/playwright install-deps

printf 'ready: %s\n' "${TARGET_DIR}/.hidden/hello.py"
