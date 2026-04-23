#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# SecuriScan – Initial VPS Setup (Ubuntu 22.04)
# Run once as root: sudo bash setup-vps.sh
#
# What this script does:
#   1. Installs PostgreSQL 16 and Redis 7
#   2. Creates the securiscan database user and database
#   3. Hardens PostgreSQL (no remote connections by default)
#   4. Configures UFW firewall (SSH, HTTP, HTTPS only)
#   5. Creates /var/www/securiscan owned by the deploy user
# ─────────────────────────────────────────────────────────────────────────────

# ── Config ────────────────────────────────────────────────────────────────────
APP_DIR="/var/www/securiscan"
DB_NAME="securiscan_prod"
DB_USER="securiscan"
DEPLOY_USER="${SUDO_USER:-$(logname 2>/dev/null || echo ubuntu)}"

# ── Colors ────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Root check ────────────────────────────────────────────────────────────────
[[ $EUID -ne 0 ]] && error "Run as root: sudo bash $0"

info "Deploy user detected: $DEPLOY_USER"
info "Starting SecuriScan VPS setup..."

# ── System update ─────────────────────────────────────────────────────────────
info "Updating package lists..."
apt-get update -qq

# ── PostgreSQL 16 ─────────────────────────────────────────────────────────────
if ! command -v psql &>/dev/null; then
  info "Installing PostgreSQL 16..."
  apt-get install -y curl ca-certificates
  install -d /usr/share/postgresql-common/pgdg
  curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc --fail \
    https://www.postgresql.org/media/keys/ACCC4CF8.asc
  sh -c 'echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] \
    https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
    > /etc/apt/sources.list.d/pgdg.list'
  apt-get update -qq
  apt-get install -y postgresql-16
  systemctl enable --now postgresql
  info "PostgreSQL 16 installed."
else
  info "PostgreSQL already installed: $(psql --version)"
fi

# ── Redis 7 ───────────────────────────────────────────────────────────────────
if ! command -v redis-cli &>/dev/null; then
  info "Installing Redis 7..."
  curl -fsSL https://packages.redis.io/gpg | \
    gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
  echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] \
    https://packages.redis.io/deb $(lsb_release -cs) main" \
    > /etc/apt/sources.list.d/redis.list
  apt-get update -qq
  apt-get install -y redis-server
  systemctl enable --now redis-server
  info "Redis 7 installed."
else
  info "Redis already installed: $(redis-cli --version)"
fi

# ── PostgreSQL: create user + database ───────────────────────────────────────
info "Configuring PostgreSQL database..."

# Prompt for password
echo ""
warn "Choose a strong PostgreSQL password for user '$DB_USER'."
read -rsp "  Password: " DB_PASS
echo ""
read -rsp "  Confirm:  " DB_PASS_CONFIRM
echo ""
[[ "$DB_PASS" != "$DB_PASS_CONFIRM" ]] && error "Passwords do not match."
[[ ${#DB_PASS} -lt 12 ]]              && error "Password must be at least 12 characters."

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE ROLE "$DB_USER" LOGIN PASSWORD '$DB_PASS';
    RAISE NOTICE 'Role $DB_USER created.';
  ELSE
    ALTER ROLE "$DB_USER" PASSWORD '$DB_PASS';
    RAISE NOTICE 'Role $DB_USER password updated.';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')
\gexec
SQL

info "Database '$DB_NAME' ready, owner '$DB_USER'."

# Save DB password hint (chmod 600 – readable only by root)
cat > /root/.securiscan-db-info <<EOF
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
EOF
chmod 600 /root/.securiscan-db-info
info "DB credentials saved to /root/.securiscan-db-info (root-only)"

# ── Redis: disable remote access (bind 127.0.0.1 only) ───────────────────────
if ! grep -q "^bind 127.0.0.1" /etc/redis/redis.conf; then
  sed -i 's/^bind .*/bind 127.0.0.1/' /etc/redis/redis.conf
  systemctl restart redis-server
fi
info "Redis bound to 127.0.0.1 only."

# ── UFW firewall ──────────────────────────────────────────────────────────────
if command -v ufw &>/dev/null; then
  info "Configuring UFW..."
  ufw --force reset
  ufw default deny incoming
  ufw default allow outgoing
  ufw allow OpenSSH
  ufw allow 'Nginx Full'
  ufw --force enable
  info "UFW enabled (SSH + HTTP + HTTPS only)."
else
  warn "UFW not found – skip firewall configuration."
fi

# ── Application directory ─────────────────────────────────────────────────────
info "Creating application directory $APP_DIR..."
mkdir -p "$APP_DIR"
chown -R "$DEPLOY_USER":"$DEPLOY_USER" "$APP_DIR"
chmod 755 "$APP_DIR"

# ── PM2 log directory ─────────────────────────────────────────────────────────
mkdir -p /var/log/pm2
chown -R "$DEPLOY_USER":"$DEPLOY_USER" /var/log/pm2

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
info "════════════════════════════════════════════════════════"
info " VPS setup complete!"
info "════════════════════════════════════════════════════════"
echo ""
echo "  Next steps:"
echo "  1. Copy the project to $APP_DIR"
echo "     git clone <repo> $APP_DIR"
echo ""
echo "  2. Create /var/www/securiscan/server/.env"
echo "     Use DATABASE_URL from /root/.securiscan-db-info"
echo ""
echo "  3. Create /var/www/securiscan/client/.env.local"
echo ""
echo "  4. Run the deployment script:"
echo "     bash $APP_DIR/deploy/deploy.sh"
echo ""
echo "  5. Copy Nginx config and enable SSL:"
echo "     sudo cp $APP_DIR/deploy/nginx/securiscan.conf /etc/nginx/sites-available/"
echo "     sudo ln -s /etc/nginx/sites-available/securiscan.conf /etc/nginx/sites-enabled/"
echo "     sudo nginx -t && sudo systemctl reload nginx"
echo "     sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo ""
