# Руководство по развертыванию

## Быстрый старт

### 1. Системные требования

- Docker и Docker Compose
- 4GB RAM (минимум)
- 10GB свободного места на диске

### 2. Запуск проекта

#### Windows:
```bash
start.bat
```

#### Linux/macOS:
```bash
chmod +x start.sh
./start.sh
```

#### Ручной запуск:
```bash
# Сборка и запуск всех сервисов
docker-compose up --build -d

# Инициализация базы данных
docker-compose exec backend python init_db.py
```

### 3. Проверка работы

После запуска проверьте доступность сервисов:

- **Фронтенд**: http://localhost:3000
- **API**: http://localhost:8000/docs
- **База данных**: localhost:5432

## Разработка

### Локальная разработка без Docker

#### Бэкенд:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Настройте переменные окружения
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/legal_docs_db"
export SECRET_KEY="your-secret-key"

# Запуск сервера
uvicorn main:app --reload
```

#### Фронтенд:
```bash
cd frontend
npm install
npm run dev
```

### Работа с базой данных

#### Создание миграций:
```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

#### Откат миграций:
```bash
alembic downgrade -1
```

## Production развертывание

### 1. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# Database
DATABASE_URL=postgresql://user:password@db-host:5432/legal_docs_db

# Security
SECRET_KEY=your-very-secure-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.docx,.pdf

# AI Model settings
MODEL_NAME=bert-base-multilingual-cased
CONFIDENCE_THRESHOLD=0.7
```

### 2. Настройка Docker Compose для Production

Создайте `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: legal_docs_db
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/legal_docs_db
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - db
    volumes:
      - uploaded_docs:/app/uploads
    restart: unless-stopped

  frontend:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_API_URL=${API_URL}
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  uploaded_docs:
```

### 3. Настройка Nginx

Создайте `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 4. Запуск Production

```bash
# Запуск с production конфигурацией
docker-compose -f docker-compose.prod.yml up -d

# Инициализация базы данных
docker-compose -f docker-compose.prod.yml exec backend python init_db.py
```

## Мониторинг и логи

### Просмотр логов:
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Мониторинг ресурсов:
```bash
# Использование ресурсов
docker stats

# Информация о контейнерах
docker-compose ps
```

## Резервное копирование

### База данных:
```bash
# Создание бэкапа
docker-compose exec db pg_dump -U postgres legal_docs_db > backup.sql

# Восстановление
docker-compose exec -T db psql -U postgres legal_docs_db < backup.sql
```

### Загруженные файлы:
```bash
# Создание архива
docker-compose exec backend tar -czf /tmp/uploads.tar.gz /app/uploads

# Копирование архива
docker cp $(docker-compose ps -q backend):/tmp/uploads.tar.gz ./uploads-backup.tar.gz
```

## Обновление системы

### 1. Остановка сервисов:
```bash
docker-compose down
```

### 2. Обновление кода:
```bash
git pull origin main
```

### 3. Пересборка и запуск:
```bash
docker-compose up --build -d
```

### 4. Применение миграций (если есть):
```bash
docker-compose exec backend alembic upgrade head
```

## Устранение неполадок

### Проблемы с базой данных:
```bash
# Проверка подключения
docker-compose exec backend python -c "from app.database import engine; print(engine.execute('SELECT 1').scalar())"

# Пересоздание базы данных
docker-compose down -v
docker-compose up -d
docker-compose exec backend python init_db.py
```

### Проблемы с загрузкой файлов:
```bash
# Проверка прав доступа
docker-compose exec backend ls -la /app/uploads

# Создание директории
docker-compose exec backend mkdir -p /app/uploads
```

### Проблемы с памятью:
```bash
# Очистка неиспользуемых образов
docker system prune -a

# Очистка volumes
docker volume prune
```

## Безопасность

### 1. Смена паролей по умолчанию
- Измените пароли в переменных окружения
- Используйте сильные пароли (минимум 16 символов)

### 2. Настройка SSL
- Получите SSL сертификаты (Let's Encrypt)
- Настройте автоматическое обновление сертификатов

### 3. Firewall
```bash
# Разрешить только необходимые порты
ufw allow 80
ufw allow 443
ufw deny 5432  # Закрыть прямой доступ к БД
```

### 4. Регулярные обновления
- Обновляйте Docker образы
- Следите за уязвимостями в зависимостях
- Регулярно создавайте резервные копии
