# 🐳 MeuFuturo - Docker Setup Guide

Este guia mostra como configurar e executar o projeto MeuFuturo usando Docker e Docker Compose.

## 📋 Pré-requisitos

- **Docker**: versão 20.10 ou superior
- **Docker Compose**: versão 2.0 ou superior
- **Git**: para clonar o repositório

### Instalação do Docker

#### Windows
- Baixe e instale o [Docker Desktop](https://www.docker.com/products/docker-desktop)

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install docker.io docker-compose-plugin
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

#### macOS
- Baixe e instale o [Docker Desktop](https://www.docker.com/products/docker-desktop)

## 🚀 Quick Start

### 1. Clone o Repositório
```bash
git clone <url-do-repositorio>
cd MeuFuturoTCC
```

### 2. Configure as Variáveis de Ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example.docker .env

# Edite o arquivo .env com suas configurações
# Importante: Altere SECRET_KEY e POSTGRES_PASSWORD em produção
```

### 3. Inicie os Containers
```bash
# Construir as imagens e iniciar os containers
docker-compose up -d

# Ver os logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 4. Acesse a Aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432

## 📦 Estrutura dos Containers

O docker-compose cria 3 serviços:

### 1. PostgreSQL (postgres)
- **Imagem**: postgres:15-alpine
- **Porta**: 5432
- **Volume**: `meufuturo-postgres-data` (persistência de dados)
- **Health Check**: Verifica se o banco está pronto

### 2. Backend (FastAPI)
- **Build**: ./meuFuturoBackend/Dockerfile
- **Porta**: 8000
- **Depende de**: postgres (aguarda health check)
- **Health Check**: GET http://localhost:8000/health
- **Volume**: Logs em `meufuturo-backend-logs`

### 3. Frontend (Next.js)
- **Build**: ./meuFuturoFrontend/Dockerfile
- **Porta**: 3000
- **Depende de**: backend (aguarda health check)
- **Health Check**: GET http://localhost:3000

## 🔧 Comandos Úteis

### Gerenciamento de Containers

```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga os dados!)
docker-compose down -v

# Reiniciar um serviço específico
docker-compose restart backend

# Ver status dos containers
docker-compose ps

# Ver logs
docker-compose logs -f

# Ver logs dos últimos 100 linhas
docker-compose logs --tail=100

# Executar comandos dentro de um container
docker-compose exec backend bash
docker-compose exec postgres psql -U postgres -d meufuturo
```

### Build e Rebuild

```bash
# Rebuild das imagens (após mudanças no código)
docker-compose build

# Rebuild sem cache
docker-compose build --no-cache

# Rebuild e restart
docker-compose up -d --build

# Rebuild de um serviço específico
docker-compose build backend
```

### Migrações do Banco de Dados

```bash
# Executar migrações dentro do container backend
docker-compose exec backend alembic upgrade head

# Criar uma nova migração
docker-compose exec backend alembic revision --autogenerate -m "Descrição da migração"

# Ver histórico de migrações
docker-compose exec backend alembic history

# Reverter última migração
docker-compose exec backend alembic downgrade -1
```

### Backup e Restore do Banco

```bash
# Backup do banco de dados
docker-compose exec postgres pg_dump -U postgres meufuturo > backup.sql

# Restore do banco de dados
docker-compose exec -T postgres psql -U postgres meufuturo < backup.sql
```

## 🔍 Troubleshooting

### Container não inicia

```bash
# Verificar logs do container com problema
docker-compose logs backend

# Verificar status detalhado
docker-compose ps

# Verificar health checks
docker inspect meufuturo-backend | grep -A 10 Health
```

### Erro de conexão com o banco

1. Verifique se o postgres está healthy:
```bash
docker-compose ps postgres
```

2. Teste a conexão manual:
```bash
docker-compose exec postgres psql -U postgres -d meufuturo -c "SELECT 1;"
```

3. Verifique as variáveis de ambiente:
```bash
docker-compose exec backend env | grep DATABASE
```

### Limpar tudo e recomeçar

```bash
# Parar containers
docker-compose down

# Remover imagens construídas
docker-compose down --rmi local

# Limpar volumes (CUIDADO: apaga dados!)
docker-compose down -v

# Limpar cache do Docker
docker system prune -a

# Reconstruir tudo do zero
docker-compose up -d --build
```

### Erros de permissão (Linux)

```bash
# Adicionar seu usuário ao grupo docker
sudo usermod -aG docker $USER

# Logout e login novamente
# Ou execute:
newgrp docker
```

### Frontend não conecta com o Backend

1. Verifique a variável `NEXT_PUBLIC_API_URL` no `.env`
2. Certifique-se de usar `http://localhost:8000/api/v1` (não `http://backend:8000`)
3. Verifique CORS no backend

## ⚙️ Configurações Avançadas

### Variáveis de Ambiente Importantes

#### Database
- `POSTGRES_DB`: Nome do banco de dados
- `POSTGRES_USER`: Usuário do PostgreSQL
- `POSTGRES_PASSWORD`: Senha do PostgreSQL (altere em produção!)

#### Backend
- `SECRET_KEY`: Chave secreta JWT (gere uma nova em produção!)
- `ALLOWED_ORIGINS`: URLs permitidas pelo CORS
- `LOG_LEVEL`: Nível de log (DEBUG, INFO, WARNING, ERROR)
- `AI_PREDICTION_ENABLED`: Habilitar IA
- `OPENAI_API_KEY`: Chave da API OpenAI (opcional)

#### Frontend
- `NEXT_PUBLIC_API_URL`: URL da API (acessível do navegador)
- `NEXT_PUBLIC_APP_NAME`: Nome da aplicação

### Executar em Produção

1. Copie e edite o arquivo `.env`:
```bash
cp .env.example.docker .env
```

2. Altere as seguintes variáveis:
```env
ENVIRONMENT=production
SECRET_KEY=<gere-uma-chave-segura>
POSTGRES_PASSWORD=<senha-forte>
LOG_LEVEL=WARNING
ALLOWED_ORIGINS=https://seudominio.com
NEXT_PUBLIC_API_URL=https://api.seudominio.com/api/v1
```

3. Gere uma chave secreta segura:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

4. Execute com as novas configurações:
```bash
docker-compose up -d
```

### Volumes e Persistência

Os dados são persistidos em volumes Docker:

- **meufuturo-postgres-data**: Dados do PostgreSQL
- **meufuturo-backend-logs**: Logs do backend

Para backup dos volumes:
```bash
# Backup do volume do PostgreSQL
docker run --rm -v meufuturo-postgres-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### Logs Rotativos

Os logs são automaticamente gerenciados com:
- Tamanho máximo: 10MB por arquivo
- Arquivos mantidos: 3 últimos

## 🔐 Segurança

### Boas Práticas

1. **Nunca** commit o arquivo `.env` com credenciais reais
2. **Sempre** altere `SECRET_KEY` em produção
3. **Use** senhas fortes para `POSTGRES_PASSWORD`
4. **Configure** CORS adequadamente (`ALLOWED_ORIGINS`)
5. **Habilite** HTTPS em produção
6. **Limite** rate limiting apropriadamente
7. **Monitore** logs regularmente

### Gerar Credenciais Seguras

```bash
# Secret Key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Password
openssl rand -base64 32
```

## 📊 Monitoramento

### Health Checks

Todos os serviços têm health checks configurados:

```bash
# Verificar status de health
docker-compose ps

# Ver detalhes do health check
docker inspect meufuturo-backend --format='{{json .State.Health}}'
```

### Métricas e Logs

```bash
# Stats em tempo real
docker stats

# Logs estruturados (JSON)
docker-compose logs backend | jq

# Monitorar erros
docker-compose logs backend | grep ERROR
```

## 🆘 Suporte

### Comandos de Diagnóstico

```bash
# Informações do sistema
docker info
docker-compose version

# Verificar redes
docker network ls
docker network inspect meufuturo-network

# Verificar volumes
docker volume ls
docker volume inspect meufuturo-postgres-data

# Ver processos dentro dos containers
docker-compose top
```

### Links Úteis

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 📝 Notas

- O primeiro build pode demorar alguns minutos
- O backend aguarda o PostgreSQL estar pronto antes de iniciar
- O frontend aguarda o backend estar pronto antes de iniciar
- Em desenvolvimento, você pode usar hot reload montando volumes

## 🔄 Atualizações

Quando houver atualizações no código:

```bash
# Atualizar código
git pull

# Rebuild e restart
docker-compose up -d --build

# Ver logs para verificar
docker-compose logs -f
```

---

**✨ Pronto!** Sua aplicação MeuFuturo está rodando em containers Docker!

