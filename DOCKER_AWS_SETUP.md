# 🐳 Docker Compose com AWS RDS - Setup Rápido

## ✅ O que foi configurado

✅ **Docker Compose** sem PostgreSQL local  
✅ **Backend (FastAPI)** conecta ao AWS RDS  
✅ **Frontend (Next.js)** conecta ao Backend  
✅ **Migrações automáticas** no startup  
✅ **Scripts de inicialização** (Linux/Mac/Windows)  
✅ **Makefile** com comandos úteis  

---

## 🚀 Como Usar

### 1️⃣ Configure o .env

```bash
# Copie o exemplo
cp .env.aws.example .env
```

Edite o arquivo `.env` e configure:

```env
# IMPORTANTE: Configure com seu AWS RDS endpoint
DATABASE_URL=postgresql+asyncpg://user:password@seu-rds.rds.amazonaws.com:5432/meufuturo

# Gere uma chave segura
SECRET_KEY=sua-chave-secreta-aqui

# Outros
ENVIRONMENT=production
BACKEND_PORT=8000
FRONTEND_PORT=3000
```

### 2️⃣ Inicie os containers

```bash
# Opção 1: Script automático (Linux/Mac)
./start.sh

# Opção 2: Script automático (Windows)
start.bat

# Opção 3: Docker Compose direto
docker-compose up -d

# Opção 4: Makefile
make up
```

### 3️⃣ Acesse

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📋 Comandos Úteis

```bash
# Ver logs
make logs
make logs-backend
make logs-frontend

# Parar containers
make down

# Rebuild
make rebuild

# Conectar no AWS RDS
make db-connect

# Executar migrações
make migrate

# Criar nova migração
make migrate-create MSG="adicionar nova tabela"

# Backup do banco AWS RDS
make backup

# Ver todos os comandos
make help
```

---

## 🗄️ Estrutura

```
MeuFuturoTCC/
├── docker-compose.yml          # Apenas Backend + Frontend
├── .env                        # Configurações (copie de .env.aws.example)
├── .env.aws.example            # Template com instruções
├── Makefile                    # Comandos úteis
├── start.sh                    # Script Linux/Mac
├── start.bat                   # Script Windows
├── README_AWS_RDS.md           # Guia completo AWS RDS
├── QUICK_START.md              # Início rápido
└── meuFuturoBackend/
    ├── Dockerfile              # Build do backend
    ├── entrypoint.sh           # Conecta AWS RDS + migrações
    └── ...
```

---

## 🌐 AWS RDS

### Criar Instância

Veja o guia completo: `README_AWS_RDS.md`

**Resumo:**
1. AWS Console → RDS → Create database
2. PostgreSQL 15.x
3. db.t3.micro (Free tier)
4. Public access: **Yes**
5. Security Group: Permitir porta **5432**
6. Copiar **Endpoint**

### Configurar Security Group

```
Type: PostgreSQL
Protocol: TCP
Port: 5432
Source: Seu IP ou 0.0.0.0/0
```

### Obter Connection String

```
Endpoint: meufuturo-db.xxxxx.us-east-1.rds.amazonaws.com
Port: 5432
Username: postgres (ou o que você configurou)
Password: [sua senha]
Database: meufuturo

DATABASE_URL:
postgresql+asyncpg://postgres:senha@meufuturo-db.xxxxx.us-east-1.rds.amazonaws.com:5432/meufuturo
```

---

## 🔧 Troubleshooting

### ❌ "DATABASE_URL is not set"

Configure no arquivo `.env`:
```env
DATABASE_URL=postgresql+asyncpg://user:pass@endpoint:5432/database
```

### ❌ "Connection refused"

1. Verifique Security Group (porta 5432)
2. Verifique se RDS tem "Public access: Yes"
3. Teste: `telnet seu-endpoint 5432`

### ❌ "Password authentication failed"

Verifique username e password no `.env`

### ❌ "Database does not exist"

Crie o database:
```bash
psql -h ENDPOINT -U postgres -d postgres -c "CREATE DATABASE meufuturo;"
```

### ❌ Backend não inicia

```bash
# Ver logs
docker-compose logs backend

# Verificar entrypoint
docker-compose exec backend cat /entrypoint.sh
```

---

## 🔐 Segurança

### ⚠️ IMPORTANTE em Produção

1. ✅ **Gerar SECRET_KEY segura**:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. ✅ **Usar senha forte** no RDS

3. ✅ **Limitar Security Group** ao seu IP específico

4. ✅ **Habilitar SSL** na conexão:
   ```env
   DATABASE_URL=...?sslmode=require
   ```

5. ✅ **Configurar CORS** corretamente:
   ```env
   ALLOWED_ORIGINS=https://seudominio.com
   ```

6. ✅ **Usar AWS Secrets Manager** para credenciais

---

## 📊 Verificar Instalação

```bash
# Health check
curl http://localhost:8000/health

# Status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Testar conexão com RDS
make db-connect
```

---

## 📚 Documentação Completa

- **README_AWS_RDS.md** - Guia completo de AWS RDS
- **DOCKER_SETUP.md** - Documentação detalhada do Docker
- **QUICK_START.md** - Início rápido
- **Makefile** - `make help` para ver todos os comandos

---

## ✨ Diferenças da Configuração Anterior

### Antes (PostgreSQL Local):
- 3 containers: postgres + backend + frontend
- Banco de dados rodando no Docker
- Dados perdidos ao remover volumes

### Agora (AWS RDS):
- 2 containers: backend + frontend
- Banco de dados na AWS (gerenciado)
- Dados persistidos na nuvem
- Escalável e com backup automático
- Melhor para produção

---

**🎉 Pronto! Sua aplicação está rodando com AWS RDS!**

Para iniciar rapidamente:
```bash
./start.sh  # Linux/Mac
start.bat   # Windows
make up     # Com Makefile
```

