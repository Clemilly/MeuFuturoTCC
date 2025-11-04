# 🎓 MeuFuturo - TCC Claudia

Sistema de gestão financeira pessoal com IA - Configurado para AWS RDS

---

## 🚀 Início Rápido (3 passos)

### 1️⃣ Execute o script de setup

**Windows:**
```cmd
setup-tcc.bat
```

**Linux/Mac:**
```bash
chmod +x setup-tcc.sh
./setup-tcc.sh
```

### 2️⃣ Aguarde os containers iniciarem (30 segundos)

### 3️⃣ Acesse a aplicação

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📋 Configuração Manual (Se preferir)

### Passo 1: Copiar arquivo .env

**Windows:**
```cmd
copy .env.tcc-claudia .env
```

**Linux/Mac:**
```bash
cp .env.tcc-claudia .env
```

### Passo 2: Criar database (primeira vez)

```bash
# Conectar ao RDS
psql -h tcc-claudia.cc7e46k0q7mx.us-east-1.rds.amazonaws.com -U claudiaadmin -d postgres

# Senha: tccclaudia123

# Criar database
CREATE DATABASE meufuturo;

# Sair
\q
```

### Passo 3: Iniciar containers

```bash
docker-compose up -d
```

---

## 🔍 Informações do Banco

- **Host**: tcc-claudia.cc7e46k0q7mx.us-east-1.rds.amazonaws.com
- **User**: claudiaadmin
- **Password**: tccclaudia123
- **Database**: meufuturo
- **Port**: 5432

**Connection String:**
```
postgresql+asyncpg://claudiaadmin:tccclaudia123@tcc-claudia.cc7e46k0q7mx.us-east-1.rds.amazonaws.com:5432/meufuturo
```

---

## 📊 Arquitetura

```
┌─────────────────┐
│   Frontend      │  http://localhost:3000
│   (Next.js)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Backend       │  http://localhost:8000
│   (FastAPI)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   AWS RDS       │  tcc-claudia....rds.amazonaws.com
│   (PostgreSQL)  │
└─────────────────┘
```

---

## 🔧 Comandos Úteis

```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver logs do backend
docker-compose logs -f backend

# Ver logs do frontend
docker-compose logs -f frontend

# Parar containers
docker-compose down

# Reiniciar containers
docker-compose restart

# Ver status
docker-compose ps

# Acessar shell do backend
docker-compose exec backend bash

# Conectar no banco de dados
psql -h tcc-claudia.cc7e46k0q7mx.us-east-1.rds.amazonaws.com -U claudiaadmin -d meufuturo

# Executar migrações
docker-compose exec backend alembic upgrade head

# Criar nova migração
docker-compose exec backend alembic revision --autogenerate -m "descrição"
```

---

## 🐛 Troubleshooting

### ❌ Erro: "Database meufuturo does not exist"

```bash
# Criar o database
psql -h tcc-claudia.cc7e46k0q7mx.us-east-1.rds.amazonaws.com -U claudiaadmin -d postgres -c "CREATE DATABASE meufuturo;"
```

### ❌ Erro: "Connection refused" ou timeout

**Causa**: Security Group do AWS RDS bloqueando conexão

**Solução**:
1. AWS Console → EC2 → Security Groups
2. Encontrar o security group do RDS `tcc-claudia`
3. Adicionar regra de entrada:
   - Type: PostgreSQL
   - Port: 5432
   - Source: Seu IP ou `0.0.0.0/0` (menos seguro)

### ❌ Erro: "Password authentication failed"

Verifique se o arquivo `.env` foi copiado corretamente:
```bash
cat .env | grep DATABASE_URL
```

### ❌ Backend não inicia

```bash
# Ver logs detalhados
docker-compose logs backend

# Verificar se .env existe
ls -la .env

# Verificar variáveis de ambiente
docker-compose config
```

---

## 📁 Estrutura do Projeto

```
MeuFuturoTCC/
├── .env.tcc-claudia          # Configuração pronta com credenciais
├── docker-compose.yml        # Backend + Frontend (sem PostgreSQL local)
├── setup-tcc.sh              # Script de setup (Linux/Mac)
├── setup-tcc.bat             # Script de setup (Windows)
├── README_TCC_CLAUDIA.md     # Este arquivo
├── SETUP_RAPIDO_TCC_CLAUDIA.md  # Guia detalhado
│
├── meuFuturoBackend/         # API FastAPI
│   ├── api/                  # Endpoints
│   ├── models/               # Modelos do banco
│   ├── services/             # Lógica de negócio
│   ├── core/                 # Configurações
│   ├── Dockerfile            # Build do backend
│   └── entrypoint.sh         # Script de inicialização
│
└── meuFuturoFrontend/        # Interface Next.js
    ├── app/                  # Páginas
    ├── components/           # Componentes React
    ├── hooks/                # Hooks customizados
    └── Dockerfile            # Build do frontend
```

---

## 🔐 Segurança

⚠️ **IMPORTANTE**: As credenciais atuais são para desenvolvimento/demonstração.

Para ambiente de produção:
1. ✅ Alterar senha do banco RDS
2. ✅ Gerar nova SECRET_KEY
3. ✅ Configurar Security Group apenas para IPs específicos
4. ✅ Habilitar SSL na conexão
5. ✅ Usar AWS Secrets Manager

---

## 📚 Documentação Adicional

- **SETUP_RAPIDO_TCC_CLAUDIA.md** - Guia passo a passo detalhado
- **README_AWS_RDS.md** - Informações sobre AWS RDS
- **DOCKER_AWS_SETUP.md** - Documentação Docker
- **QUICK_START.md** - Início rápido geral

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker-compose logs -f`
2. Consulte a documentação: `SETUP_RAPIDO_TCC_CLAUDIA.md`
3. Verifique Security Group do AWS RDS
4. Teste conexão com o banco:
   ```bash
   psql -h tcc-claudia.cc7e46k0q7mx.us-east-1.rds.amazonaws.com -U claudiaadmin -d meufuturo
   ```

---

## ✅ Checklist de Verificação

Antes de apresentar o TCC, verifique:

- [ ] Containers rodando: `docker-compose ps`
- [ ] Backend respondendo: `curl http://localhost:8000/health`
- [ ] Frontend acessível: http://localhost:3000
- [ ] Banco de dados conectado
- [ ] Migrações executadas: `docker-compose exec backend alembic current`
- [ ] API Docs funcionando: http://localhost:8000/docs
- [ ] Logs sem erros: `docker-compose logs backend | grep ERROR`

---

**🎉 Sucesso no TCC!**

Para iniciar rapidamente:
```bash
./setup-tcc.sh      # Linux/Mac
setup-tcc.bat       # Windows
```

