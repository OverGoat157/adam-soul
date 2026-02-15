#!/bin/bash
# =============================================================
# Adam Soul — скрипт деплоя на Ubuntu 22.04 (Timeweb Cloud)
# Запускать от root: bash deploy.sh
# =============================================================

set -e  # остановить при ошибке

echo "======================================"
echo "  Adam Soul Backend — деплой"
echo "======================================"

# ---------- Переменные (заполните перед запуском) ----------
GITHUB_REPO="https://github.com/OverGoat157/adam-soul.git"
APP_DIR="/var/www/adamsoul"
DOMAIN=""                        # например adamsoul.ru — оставьте пустым если нет домена
DB_NAME="adamsoul_db"
DB_USER="adamsoul_user"
DB_PASS="$(openssl rand -hex 16)"  # генерируем случайный пароль
SECRET_KEY="$(openssl rand -hex 32)"

# Логин/пароль суперпользователя для 1С
DJANGO_SUPERUSER_USERNAME="1c_exchange"
DJANGO_SUPERUSER_PASSWORD="exchange_$(openssl rand -hex 8)"

echo ""
echo "→ Сгенерированные данные (СОХРАНИТЕ ИХ!):"
echo "  DB пароль:    $DB_PASS"
echo "  SECRET_KEY:   $SECRET_KEY"
echo "  1С логин:     $DJANGO_SUPERUSER_USERNAME"
echo "  1С пароль:    $DJANGO_SUPERUSER_PASSWORD"
echo ""
read -p "Нажмите Enter для продолжения..."

# ---------- 1. Системные пакеты ----------
echo ""
echo "[1/8] Установка системных пакетов..."

# Исправляем зеркало apt — заменяем кастомные зеркала на официальные Ubuntu
# (на Timeweb Cloud mirror.timeweb.ru может не резолвиться)
if [ -f /etc/apt/sources.list.d/ubuntu.sources ]; then
    # Ubuntu 24.04+ (DEB822 format)
    sed -i 's|http://mirror\.timeweb\.ru/ubuntu|http://archive.ubuntu.com/ubuntu|g' \
        /etc/apt/sources.list.d/ubuntu.sources 2>/dev/null || true
elif [ -f /etc/apt/sources.list ]; then
    sed -i 's|http://mirror\.timeweb\.ru/ubuntu|http://archive.ubuntu.com/ubuntu|g' \
        /etc/apt/sources.list 2>/dev/null || true
fi

apt-get update -qq
apt-get install -y -qq \
    python3 python3-venv python3-dev python3-pip \
    postgresql postgresql-contrib \
    nginx \
    git curl \
    libpq-dev \
    certbot python3-certbot-nginx

# Определяем доступную версию Python (3.10, 3.11, 3.12...)
PYTHON_CMD=$(which python3)
PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
echo "  Используем: $PYTHON_VERSION"

# ---------- 2. PostgreSQL ----------
echo "[2/8] Настройка PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${DB_NAME};" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS ${DB_USER};" 2>/dev/null || true
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost/${DB_NAME}"

# ---------- 3. Клонирование репозитория ----------
echo "[3/8] Клонирование репозитория..."
rm -rf "$APP_DIR"
git clone "$GITHUB_REPO" "$APP_DIR"

# ---------- 4. Виртуальное окружение ----------
echo "[4/8] Установка зависимостей Python..."
cd "$APP_DIR/backend"
$PYTHON_CMD -m venv venv
source venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

# ---------- 5. .env файл ----------
echo "[5/8] Создание .env файла..."
cat > "$APP_DIR/backend/.env" << EOF
SECRET_KEY=${SECRET_KEY}
DEBUG=False
DATABASE_URL=${DATABASE_URL}
ALLOWED_HOSTS=5.129.221.75${DOMAIN:+,$DOMAIN}
CORS_ALLOWED_ORIGINS=https://front-navy-nine.vercel.app,http://5.129.221.75
SITE_URL=http://5.129.221.75${DOMAIN:+,https://$DOMAIN}
DJANGO_SUPERUSER_USERNAME=${DJANGO_SUPERUSER_USERNAME}
DJANGO_SUPERUSER_PASSWORD=${DJANGO_SUPERUSER_PASSWORD}
DJANGO_SUPERUSER_EMAIL=1c@internal.local
EOF

# ---------- 6. Django: миграции, static, суперпользователь ----------
echo "[6/8] Инициализация Django..."

# Установим python-dotenv для чтения .env
pip install --quiet python-dotenv

# Запускаем команды через env-переменные
set -a; source "$APP_DIR/backend/.env"; set +a

python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py create_default_superuser

deactivate

# ---------- 7. Gunicorn как systemd-сервис ----------
echo "[7/8] Настройка Gunicorn..."
cat > /etc/systemd/system/adamsoul.service << EOF
[Unit]
Description=Adam Soul Django Backend
After=network.target postgresql.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=${APP_DIR}/backend
EnvironmentFile=${APP_DIR}/backend/.env
ExecStart=${APP_DIR}/backend/venv/bin/gunicorn config.wsgi \
    --bind 127.0.0.1:8000 \
    --workers 2 \
    --timeout 300 \
    --access-logfile /var/log/adamsoul/access.log \
    --error-logfile /var/log/adamsoul/error.log
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

mkdir -p /var/log/adamsoul
chown -R www-data:www-data /var/log/adamsoul
chown -R www-data:www-data "$APP_DIR"

systemctl daemon-reload
systemctl enable adamsoul
systemctl start adamsoul

# ---------- 8. Nginx ----------
echo "[8/8] Настройка Nginx..."

# Удаляем дефолтный сайт
rm -f /etc/nginx/sites-enabled/default

cat > /etc/nginx/sites-available/adamsoul << EOF
server {
    listen 80;
    server_name 5.129.221.75${DOMAIN:+ $DOMAIN www.$DOMAIN};

    client_max_body_size 100M;

    # API и 1C exchange
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 600;
    }

    # Медиафайлы (изображения от 1С)
    location /media/ {
        alias ${APP_DIR}/backend/media/;
        expires 30d;
    }

    # Статика Django
    location /static/ {
        alias ${APP_DIR}/backend/staticfiles/;
        expires 30d;
    }
}
EOF

ln -sf /etc/nginx/sites-available/adamsoul /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# ---------- SSL (только если указан домен) ----------
if [ -n "$DOMAIN" ]; then
    echo "Выпуск SSL-сертификата для $DOMAIN..."
    certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m admin@$DOMAIN
fi

# ---------- Итог ----------
echo ""
echo "======================================"
echo "  Деплой завершён успешно!"
echo "======================================"
echo ""
echo "  Сайт доступен: http://5.129.221.75"
echo "  Django Admin:  http://5.129.221.75/admin/"
echo "  1C endpoint:   http://5.129.221.75/1c_exchange/"
echo ""
echo "  Логин для 1С:  $DJANGO_SUPERUSER_USERNAME"
echo "  Пароль для 1С: $DJANGO_SUPERUSER_PASSWORD"
echo ""
echo "  Для обновления кода: bash ${APP_DIR}/backend/update.sh"
echo ""

# ---------- Скрипт обновления ----------
cat > "$APP_DIR/backend/update.sh" << 'UPDATEEOF'
#!/bin/bash
git config --global --add safe.directory /var/www/adamsoul 2>/dev/null || true
cd /var/www/adamsoul
git pull origin main
cd backend
source venv/bin/activate
pip install -q -r requirements.txt
set -a; source .env; set +a
python manage.py migrate --noinput
python manage.py collectstatic --noinput
deactivate
systemctl restart adamsoul
echo "Обновление завершено!"
UPDATEEOF

chmod +x "$APP_DIR/backend/update.sh"
