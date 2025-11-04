# 🚀 Setup Rápido - TCC Claudia

Configuração rápida com o banco AWS RDS já configurado!

## ✅ Banco de Dados Configurado

- **Host**: tcc-claudia.cc7e46k0q7mx.us-east-1.rds.amazonaws.com
- **User**: claudiaadmin
- **Password**: tccclaudia123
- **Database**: meufuturo

---

## 📋 Passo a Passo

### 1️⃣ Copiar arquivo de configuração

```bash
# Copiar o arquivo de configuração pronto
copy .env.tcc-claudia .env
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.tcc-claudia .env
```

**Linux/Mac:**
```bash
cp .env.tcc-claudia .env
```

### 2️⃣ Criar o database no RDS (Se ainda não existir)

```bash
# Instalar psql (se necessário)
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt install postgresql-client

# Conectar ao RDS
psql -h tcc-claudia.cc7e46k0q7mx.us-east-1.rds.amazonaws.com -U claudiaadmin -d postgres

# Digitar senha quando solicitado: tccclaudia123

# Criar database
CREATE DATABASE meufuturo;

# Verificar
\l

# Sair
\q
```

### 3️⃣ Iniciar a aplicação

**Opção 1 - Script Automático (Windows):**
```cmd
start.bat
```

**Opção 2 - Script Automático (Linux/Mac):**
```bash
chmod +x start.sh
./start.sh
```

**Opção 3 - Docker Compose:**
```bash
docker-compose up -d
```

**Opção 4 - Makefile:**
```bash
make up
```

### 4️⃣ Acessar a aplicação

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🔍 Verificar se está funcionando

```bash
# Health check da API
curl http://localhost:8000/health

# Ver logs
docker-compose logs -f backend

# Status dos containers
docker-compose ps
```

---

## 🔧 Comandos Úteis

```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver logs apenas do backend
docker-compose logs -f backend

# Parar containers
docker-compose down

# Reiniciar
docker-compose restart

# Conectar no banco AWS RDS
psql -h tcc-claudia.cc7e46k0q7mx.us-east-1.rds.amazonaws.com -U claudiaadmin -d meufuturo

# Executar migrações
docker-compose exec backend alembic upgrade head

# Ver todos os comandos disponíveis
make help
```

---

## ⚠️ Troubleshooting

### Erro: "Database meufuturo does not exist"

**Solução**: Criar o database:
```bash
psql -h tcc-claudia.cc7e46k0q7mx.us-east-1.rds.amazonaws.com -U claudiaadmin -d postgres -c "CREATE DATABASE meufuturo;"
```

### Erro: "Connection refused"

**Solução**: Verificar Security Group do AWS RDS
1. AWS Console → EC2 → Security Groups
2. Procurar o security group do RDS
3. Adicionar regra de entrada:
   - Type: PostgreSQL
   - Port: 5432
   - Source: Seu IP ou 0.0.0.0/0

### Erro: "Password authentication failed"

**Solução**: Verificar se copiou o arquivo .env corretamente:
```bash
# Verificar conteúdo
cat .env | grep DATABASE_URL

# Deve mostrar:
# DATABASE_URL=postgresql+asyncpg://claudiaadmin:tccclaudia123@tcc-claudia...
```

### Backend não inicia

```bash
# Ver logs detalhados
docker-compose logs backend

# Verificar se .env existe
ls -la .env

# Verificar variáveis de ambiente
docker-compose exec backend env | grep DATABASE
```

---

## 📊 Estrutura do Projeto

```
MeuFuturoTCC/
├── .env                      # ← Copiar de .env.tcc-claudia
├── .env.tcc-claudia         # Configuração pronta
├── docker-compose.yml       # Backend + Frontend
├── start.sh                 # Script Linux/Mac
├── start.bat                # Script Windows
├── Makefile                 # Comandos úteis
├── meuFuturoBackend/        # API FastAPI
└── meuFuturoFrontend/       # Interface Next.js
```

---

## 🔐 Informações de Segurança

⚠️ **IMPORTANTE**: As credenciais estão configuradas para desenvolvimento/teste.

Para produção, considere:
1. ✅ Mudar a senha do banco
2. ✅ Gerar nova SECRET_KEY:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
3. ✅ Configurar Security Group apenas para IPs específicos
4. ✅ Habilitar SSL:
   ```env
   DATABASE_URL=...?sslmode=require
   ```
5. ✅ Usar AWS Secrets Manager

---

## 📚 Documentação Adicional

- **README_AWS_RDS.md** - Guia completo de AWS RDS
- **DOCKER_AWS_SETUP.md** - Documentação do Docker
- **QUICK_START.md** - Início rápido geral
- **Makefile** - Execute `make help`

---

## ✨ Tudo Pronto!

A configuração está pronta para uso. Basta:

1. Copiar `.env.tcc-claudia` para `.env`
2. Criar o database `meufuturo` (se necessário)
3. Executar `./start.sh` ou `start.bat`
4. Acessar http://localhost:3000

**🎉 Boa sorte com o TCC!**

