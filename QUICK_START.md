# 🚀 Quick Start - MeuFuturo com AWS RDS

Guia rápido para rodar o projeto em 3 minutos!

## ⚡ Opção 1: Usando Docker Compose + AWS RDS (Recomendado)

### 1️⃣ Pré-requisitos
```bash
# Verificar se Docker está instalado
docker --version
docker-compose --version

# Ter uma instância AWS RDS PostgreSQL criada
# Ver README_AWS_RDS.md para detalhes de como criar
```

### 2️⃣ Configurar ambiente
```bash
# Copiar arquivo de exemplo
cp .env.aws.example .env

# Editar com seu endpoint AWS RDS
nano .env  # ou vim, code, notepad++, etc
```

Configure o arquivo `.env`:
```env
# AWS RDS Connection
DATABASE_URL=postgresql+asyncpg://user:password@seu-rds-endpoint.rds.amazonaws.com:5432/meufuturo

# Security
SECRET_KEY=gere-uma-chave-segura
ENVIRONMENT=production

# Outros...
```

### 3️⃣ Iniciar aplicação
```bash
# Usando docker-compose
docker-compose up -d

# OU usando Makefile (mais fácil!)
make up
```

### 4️⃣ Acessar
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: AWS RDS (configurado no .env)

### 5️⃣ Ver logs
```bash
# Ver logs de todos os serviços
make logs

# Ver logs específicos
make logs-backend
make logs-frontend

# Conectar ao AWS RDS
make db-connect
```

---

## 🌐 Criar AWS RDS (Se ainda não tiver)

Para criar uma instância PostgreSQL na AWS:

```bash
# Ver guia completo
cat README_AWS_RDS.md
```

**Resumo rápido:**
1. AWS Console → RDS → Create database
2. PostgreSQL 15.x
3. db.t3.micro (Free tier)
4. Public access: Yes
5. Security Group: Permitir porta 5432
6. Copiar endpoint e configurar no .env

## 🛠️ Opção 2: Desenvolvimento Local

### Backend

```bash
cd meuFuturoBackend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar .env
cp desenvolvimento.env .env

# Rodar migrações
alembic upgrade head

# Iniciar servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd meuFuturoFrontend

# Instalar dependências
pnpm install
# ou
npm install

# Iniciar desenvolvimento
pnpm dev
# ou
npm run dev
```

## 📋 Comandos Úteis

### Com Docker Compose

```bash
# Ver todos os comandos disponíveis
make help

# Parar containers
make down

# Rebuild
make rebuild

# Executar migrações
make migrate

# Backup do banco
make backup

# Ver status
make ps

# Acessar shell do backend
make shell-backend

# Acessar PostgreSQL
make shell-db
```

### Sem Docker

```bash
# Backend - Criar migração
cd meuFuturoBackend
alembic revision --autogenerate -m "Descrição"

# Backend - Executar migrações
alembic upgrade head

# Frontend - Build de produção
cd meuFuturoFrontend
pnpm build
pnpm start
```

## 🔧 Troubleshooting

### Porta já em uso
```bash
# Mudar portas no .env
BACKEND_PORT=8001
FRONTEND_PORT=3001
POSTGRES_PORT=5433
```

### Limpar tudo e recomeçar
```bash
make clean  # Remove containers e volumes
make up     # Inicia novamente
```

### Erro de conexão com banco
```bash
# Verificar se postgres está rodando
docker-compose ps postgres

# Ver logs do postgres
make logs-db
```

## 📚 Documentação Completa

- **Docker**: Ver `DOCKER_SETUP.md`
- **Backend**: Ver `meuFuturoBackend/README.md`
- **Frontend**: Ver `meuFuturoFrontend/README.md`

## ✅ Verificar Instalação

```bash
# Health check de todos os serviços
make health

# Testar backend
curl http://localhost:8000/health

# Testar frontend
curl http://localhost:3000

# Ver API docs
# Abrir http://localhost:8000/docs no navegador
```

---

**🎉 Pronto! Sua aplicação está rodando!**

Para desenvolvimento, recomendamos usar o Docker Compose que já configura tudo automaticamente.

