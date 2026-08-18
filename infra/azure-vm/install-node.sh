#!/usr/bin/env bash
# install-node.sh — idempotent installer para Node.js 20.x, npm y git en Ubuntu 22.04 LTS
# - Diseñado para ejecución manual por un operador.
# - No clona ni construye la aplicación.
# - No contiene secretos.
# - Ajusta permisos de /var/www/abbarrotes/data a 770 y propiedad deployer.
#
# Uso:
#   sudo ./install-node.sh
#
# Requisitos: conexión a Internet durante la instalación para descargar paquetes y el script NodeSource.

set -euo pipefail

REQUIRED_NODE_MAJOR=20
APP_DIR="/var/www/abbarrotes"
DATA_DIR="${APP_DIR}/data"
USER="deployer"
APT_OPTS="--no-install-recommends -y"

log() {
  printf '%s\n' "$*"
}

is_ubuntu_22() {
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    case "${VERSION_ID:-}" in
      "22.04"|"22.04.1"|"22.04.2"|"22.04.3"|"22.04.4") return 0 ;;
      *) return 1 ;;
    esac
  fi
  return 1
}

ensure_user() {
  if id -u "$USER" >/dev/null 2>&1; then
    log "User $USER exists"
  else
    log "Creating user $USER"
    sudo useradd -m -s /bin/bash "$USER"
    # Intentionally do NOT add to sudo group, do NOT set password or add SSH keys here.
  fi
}

current_node_major() {
  if command -v node >/dev/null 2>&1; then
    local v
    v=$(node -v | sed 's/^v//')
    echo "${v%%.*}"
  else
    echo ""
  fi
}

install_node() {
  local installed
  installed=$(current_node_major || echo "")
  if [ -n "$installed" ] && [ "$installed" -eq "$REQUIRED_NODE_MAJOR" ] 2>/dev/null; then
    log "Node.js major version $installed already instalado: $(node -v)"
    return 0
  fi

  log "Installing Node.js ${REQUIRED_NODE_MAJOR}.x via NodeSource"
  curl -fsSL "https://deb.nodesource.com/setup_${REQUIRED_NODE_MAJOR}.x" | sudo -E bash -
  sudo apt-get update -y
  sudo apt-get install $APT_OPTS nodejs
  log "Node installed: $(node -v) (npm: $(npm -v))"
}

install_git() {
  if command -v git >/dev/null 2>&1; then
    log "git already installed: $(git --version)"
    return 0
  fi
  log "Installing git"
  sudo apt-get update -y
  sudo apt-get install $APT_OPTS git
  log "git installed: $(git --version)"
}

create_dirs() {
  log "Ensuring application directories exist and have correct ownership/permissions"
  sudo mkdir -p "$APP_DIR"
  sudo mkdir -p "$DATA_DIR"
  sudo chown -R "${USER}:${USER}" "$APP_DIR"
  sudo chmod 0750 "$APP_DIR"
  sudo chmod 0770 "$DATA_DIR"
  log "Created ${APP_DIR} and ${DATA_DIR} with owner ${USER} and permissions (app:750, data:770)"
}

preflight_checks() {
  if is_ubuntu_22; then
    log "Detected Ubuntu 22.04 LTS"
  else
    log "Warning: This script targets Ubuntu 22.04 LTS. Continuing anyway."
  fi

  if [ "$(id -u)" -ne 0 ]; then
    log "Nota: No estás ejecutando como root. El script utilizará sudo cuando sea necesario."
  fi
}

main() {
  preflight_checks
  ensure_user
  install_node
  install_git
  create_dirs
  log "install-node.sh: finalizado correctamente."
}

main "$@"
