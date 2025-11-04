# 🌐 MeuFuturo - Conexão com AWS RDS

Guia completo para conectar o MeuFuturo com banco de dados PostgreSQL na AWS RDS.

## 📋 Índice

- [Criar RDS na AWS](#criar-rds-na-aws)
- [Configurar Docker Compose](#configurar-docker-compose)
- [Executar Migrações](#executar-migrações)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Criar RDS na AWS

### 1. Acessar AWS Console

1. Acesse [AWS Console](https://console.aws.amazon.com/)
2. Vá para **RDS** → **Databases** → **Create database**

### 2. Configuração Básica

```
Engine options:
  ✓ PostgreSQL
  Version: PostgreSQL 15.x (latest)

Templates:
  ✓ Free tier (para testes)
  ✓ Production (para produção)

Settings:
  DB instance identifier: meufuturo-db
  Master username: postgres (ou seu username)
  Master password: [Senha forte aqui!]
```

### 3. Configuração de Instância

```
DB instance class:
  ✓ db.t3.micro (Free tier - 1 vCPU, 1 GB RAM)
  ✓ db.t3.small (Produção leve)
  ✓ db.m5.large (Produção média/alta)

Storage:
  Storage type: General Purpose (SSD)
  Allocated storage: 20 GB (Free tier)
  ✓ Enable storage autoscaling
  Maximum storage threshold: 100 GB
```

### 4. Conectividade

```
Connectivity:
  ✓ Don't connect to an EC2 compute resource
  
Network type: IPv4

Virtual private cloud (VPC): Default VPC

Subnet group: default

Public access: YES ⚠️ (necessário para acessar de fora da AWS)

VPC security group:
  ✓ Create new
  New VPC security group name: meufuturo-db-sg

Availability Zone: No preference
```

### 5. Database Authentication

```
✓ Password authentication
```

### 6. Configuração Adicional

```
Database options:
  Initial database name: meufuturo
  
Backup:
  ✓ Enable automated backups
  Backup retention period: 7 days
  
Encryption:
  ✓ Enable encryption (recomendado para produção)
  
Monitoring:
  ✓ Enable Enhanced monitoring (opcional)
```

### 7. Criar Database

- Clique em **Create database**
- Aguarde 5-10 minutos até o status ficar **Available**

---

## 🔐 Configurar Security Group

### 1. Acessar Security Group

1. Vá para **EC2** → **Security Groups**
2. Procure pelo security group criado (ex: `meufuturo-db-sg`)

### 2. Adicionar Regra de Entrada

```
Type: PostgreSQL
Protocol: TCP
Port: 5432
Source: 
  - Seu IP: [Seu IP]/32 (mais seguro)
  - Qualquer lugar: 0.0.0.0/0 (menos seguro, apenas para testes)

Description: Allow PostgreSQL from my IP
```

**⚠️ IMPORTANTE**: Em produção, use apenas IPs específicos ou VPC peering!

---

## ⚙️ Configurar Docker Compose

### 1. Obter Endpoint do RDS

1. Console AWS → **RDS** → **Databases**
2. Clique na sua instância (`meufuturo-db`)
3. Na aba **Connectivity & security**, copie:
   - **Endpoint**: `meufuturo-db.xxxxx.us-east-1.rds.amazonaws.com`
   - **Port**: `5432`

### 2. Criar arquivo .env

Copie o arquivo de exemplo:

```bash
cp .env.aws.example .env
```

### 3. Configurar DATABASE_URL

Edite o arquivo `.env`:

```env
# Formato: postgresql+asyncpg://username:password@endpoint:port/database
DATABASE_URL=postgresql+asyncpg://postgres:SuaSenha@meufuturo-db.xxxxx.us-east-1.rds.amazonaws.com:5432/meufuturo

# Configurações de Segurança
SECRET_KEY=gere-uma-chave-segura-aqui
ENVIRONMENT=production
LOG_LEVEL=WARNING

# CORS - Adicione seus domínios
ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com

# Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=https://api.seudominio.com/api/v1
```

### 4. Gerar Secret Key Segura

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copie o resultado para `SECRET_KEY` no `.env`

---

## 🗄️ Criar Database (se necessário)

Se você não criou o database `meufuturo` durante a criação do RDS:

```bash
# Instalar psql (se não tiver)
# Ubuntu/Debian
sudo apt install postgresql-client

# macOS
brew install postgresql

# Conectar ao RDS
psql -h meufuturo-db.xxxxx.us-east-1.rds.amazonaws.com \
     -U postgres \
     -d postgres

# Criar database
CREATE DATABASE meufuturo;

# Verificar
\l

# Sair
\q
```

---

## 🚀 Executar Migrações

### 1. Iniciar Containers

```bash
# Iniciar backend e frontend
docker-compose up -d

# Ver logs
docker-compose logs -f backend
```

O entrypoint já executa as migrações automaticamente! ✅

### 2. Executar Migrações Manualmente (se necessário)

```bash
# Executar migrações
docker-compose exec backend alembic upgrade head

# Ver status das migrações
docker-compose exec backend alembic current

# Ver histórico
docker-compose exec backend alembic history
```

### 3. Criar Nova Migração

```bash
docker-compose exec backend alembic revision --autogenerate -m "Descrição da mudança"
```

---

## 🔍 Verificar Conexão

### 1. Health Check da API

```bash
curl http://localhost:8000/health
```

Deve retornar:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### 2. Conectar Diretamente no RDS

```bash
psql -h meufuturo-db.xxxxx.us-east-1.rds.amazonaws.com \
     -U postgres \
     -d meufuturo \
     -c "SELECT version();"
```

### 3. Ver Logs do Backend

```bash
docker-compose logs backend | grep -i database
```

Deve mostrar:
```
✅ DATABASE_URL is configured
📡 Connecting to database at: meufuturo-db.xxxxx.us-east-1.rds.amazonaws.com
✅ Migrations completed successfully!
```

---

## 🐛 Troubleshooting

### Erro: "Connection refused"

**Causa**: Security Group não permite conexões na porta 5432

**Solução**:
1. Vá para EC2 → Security Groups
2. Edite o security group do RDS
3. Adicione regra de entrada:
   - Type: PostgreSQL
   - Port: 5432
   - Source: Seu IP

### Erro: "Password authentication failed"

**Causa**: Credenciais incorretas

**Solução**:
1. Verifique username e password no `.env`
2. Se esqueceu a senha, pode resetar:
   - Console AWS → RDS → Modify
   - New master password

### Erro: "Database does not exist"

**Causa**: Database `meufuturo` não foi criado

**Solução**:
```bash
psql -h ENDPOINT -U postgres -d postgres -c "CREATE DATABASE meufuturo;"
```

### Erro: "Timeout" ou "No route to host"

**Causa**: 
- RDS não tem public access
- Security group bloqueando
- VPC/Subnet incorretos

**Solução**:
1. Verifique se **Public access = Yes**
2. Verifique Security Group
3. Teste conectividade:
```bash
telnet ENDPOINT 5432
# ou
nc -zv ENDPOINT 5432
```

### Erro: "SSL connection required"

**Causa**: RDS requer SSL mas a connection string não especifica

**Solução**:
```env
# Adicione ?sslmode=require ao final da URL
DATABASE_URL=postgresql+asyncpg://user:pass@endpoint:5432/db?sslmode=require
```

### Erro: "Too many connections"

**Causa**: Limite de conexões do RDS atingido

**Solução**:
1. Aumentar instância do RDS
2. Configurar pool de conexões no backend:

```python
# Em database.py ou config
engine = create_async_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10
)
```

---

## 📊 Monitoramento

### CloudWatch Metrics

No Console AWS → RDS → Sua instância → Monitoring:

- **CPUUtilization**: Uso de CPU
- **DatabaseConnections**: Conexões ativas
- **FreeStorageSpace**: Espaço disponível
- **ReadLatency/WriteLatency**: Performance

### Logs do RDS

```bash
# Ver logs do PostgreSQL na AWS
aws rds download-db-log-file-portion \
  --db-instance-identifier meufuturo-db \
  --log-file-name error/postgresql.log.2024-01-01-00 \
  --output text
```

### Backup e Restore

```bash
# Backup manual
docker-compose exec backend pg_dump $DATABASE_URL > backup.sql

# Restore
docker-compose exec -T backend psql $DATABASE_URL < backup.sql
```

---

## 💰 Custos Estimados (AWS)

### Free Tier (12 meses)
- **db.t3.micro**: 750 horas/mês
- **Storage**: 20 GB
- **Backup**: 20 GB
- **Custo**: $0/mês ✅

### Produção Mínima
- **db.t3.small**: ~$25/mês
- **Storage 50GB**: ~$5/mês
- **Backup**: Incluído
- **Total**: ~$30/mês

### Produção Média
- **db.m5.large**: ~$140/mês
- **Storage 100GB**: ~$10/mês
- **Total**: ~$150/mês

---

## 🔐 Melhores Práticas de Segurança

1. ✅ **Use senhas fortes** para o master user
2. ✅ **Limite Security Groups** aos IPs necessários
3. ✅ **Habilite SSL/TLS** nas conexões
4. ✅ **Ative encryption at rest** no RDS
5. ✅ **Configure backups automáticos**
6. ✅ **Use AWS Secrets Manager** para credenciais
7. ✅ **Monitore logs** com CloudWatch
8. ✅ **Use VPC peering** em vez de public access em produção
9. ✅ **Implemente IAM authentication** quando possível
10. ✅ **Mantenha PostgreSQL atualizado**

---

## 📚 Recursos Adicionais

- [AWS RDS PostgreSQL Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
- [PostgreSQL on AWS](https://aws.amazon.com/rds/postgresql/)

---

**✅ Pronto! Seu MeuFuturo está conectado com AWS RDS!**

Para iniciar:
```bash
docker-compose up -d
```

