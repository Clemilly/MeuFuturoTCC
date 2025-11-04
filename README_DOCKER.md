# 🐳 Docker Compose - MeuFuturo

Configuração completa do Docker Compose para executar Backend, Frontend e PostgreSQL.

## 🚀 Quick Start

### 1️⃣ Criar arquivo .env

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# Database
POSTGRES_DB=meufuturo
POSTGRES_USER=postgres
POSTGRES_PASSWORD=meufuturo123
POSTGRES_PORT=5432

# Backend
BACKEND_PORT=8000
SECRET_KEY=your-super-secret-jwt-key-change-in-production
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
LOG_LEVEL=INFO

# Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=MeuFuturo
```

### 2️⃣ Iniciar os containers

```bash
# Build e start
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 3️⃣ Acessar a aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432

## 📦 Serviços

### 🐘 PostgreSQL
- **Porta**: 5432
- **Banco**: meufuturo
- **Usuário**: postgres
- **Volume**: Dados persistidos

### 🐍 Backend (FastAPI)
- **Porta**: 8000
- **Health Check**: `/health`
- **Aguarda**: PostgreSQL estar pronto

### ⚛️ Frontend (Next.js)
- **Porta**: 3000
- **Aguarda**: Backend estar pronto

## 🔧 Comandos Úteis

```bash
# Parar containers
docker-compose down

# Rebuild
docker-compose up -d --build

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Acessar container
docker-compose exec backend bash
docker-compose exec postgres psql -U postgres -d meufuturo

# Limpar tudo (⚠️ apaga dados!)
docker-compose down -v
```

## 📊 Status dos Containers

```bash
# Ver status e health
docker-compose ps

# Ver recursos
docker stats
```

## 🔐 Segurança em Produção

**⚠️ IMPORTANTE**: Antes de colocar em produção, altere:

```env
SECRET_KEY=<gerar-chave-segura>
POSTGRES_PASSWORD=<senha-forte>
ENVIRONMENT=production
LOG_LEVEL=WARNING
```

Gerar chave segura:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 🐛 Troubleshooting

### Backend não conecta no PostgreSQL

```bash
# Verificar se postgres está healthy
docker-compose ps postgres

# Testar conexão
docker-compose exec postgres psql -U postgres -d meufuturo -c "SELECT 1;"
```

### Frontend não conecta no Backend

1. Verifique se `NEXT_PUBLIC_API_URL` está correto
2. Verifique CORS em `ALLOWED_ORIGINS`
3. Teste: http://localhost:8000/docs

### Limpar e recomeçar

```bash
docker-compose down -v
docker-compose up -d --build
```

## 📝 Variáveis de Ambiente Completas

### Database
- `POSTGRES_DB`: Nome do banco
- `POSTGRES_USER`: Usuário
- `POSTGRES_PASSWORD`: Senha
- `POSTGRES_PORT`: Porta (padrão: 5432)

### Backend
- `BACKEND_PORT`: Porta do backend (padrão: 8000)
- `SECRET_KEY`: Chave JWT (**altere em produção!**)
- `ALGORITHM`: Algoritmo JWT (padrão: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Tempo de expiração (padrão: 30)
- `ENVIRONMENT`: development | production
- `ALLOWED_ORIGINS`: URLs permitidas pelo CORS
- `LOG_LEVEL`: DEBUG | INFO | WARNING | ERROR
- `AI_PREDICTION_ENABLED`: true | false
- `OPENAI_API_KEY`: Chave OpenAI (opcional)

### Frontend
- `FRONTEND_PORT`: Porta do frontend (padrão: 3000)
- `NEXT_PUBLIC_API_URL`: URL da API
- `NEXT_PUBLIC_APP_NAME`: Nome da aplicação
- `NODE_ENV`: production | development

---

Para mais detalhes, consulte o arquivo `DOCKER_SETUP.md`

