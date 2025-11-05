# MeuFuturo Backend API

Sistema de gestão financeira pessoal com foco em acessibilidade, desenvolvido com FastAPI e PostgreSQL.

## 🚀 Características

- **API RESTful completa** com FastAPI e documentação automática
- **Arquitetura Clean** com separação de responsabilidades
- **Acessibilidade** como prioridade no design da API
- **IA Preditiva** para insights financeiros personalizados  
- **Autenticação robusta** com JWT
- **PostgreSQL** com SQLAlchemy 2.0 e async/await
- **Testes abrangentes** com pytest e cobertura completa
- **Migrations** com Alembic para evolução do banco
- **Documentação** interativa com Swagger/OpenAPI

## 🏗️ Arquitetura

```
app/
├── main.py              # FastAPI app entry point
├── core/               # Configuração e infraestrutura
│   ├── config.py       # Settings com Pydantic BaseSettings
│   ├── database.py     # Configuração async do PostgreSQL
│   └── security.py     # JWT e autenticação
├── models/             # Modelos SQLAlchemy (Entities)
│   ├── user.py        # Modelo de usuário
│   ├── transaction.py # Transações financeiras
│   ├── category.py    # Categorias de transações
│   └── ai_prediction.py # Predições da IA
├── schemas/            # Schemas Pydantic (DTOs)
│   ├── user.py        # Validação de usuários
│   ├── transaction.py # Validação de transações
│   └── common.py      # Schemas compartilhados
├── repositories/       # Camada de acesso a dados
│   ├── base.py        # Repository genérico
│   ├── user.py        # Operações de usuário
│   └── transaction.py # Operações de transação
├── services/          # Lógica de negócio (Use Cases)
│   ├── auth_service.py     # Serviços de autenticação
│   ├── financial_service.py # Serviços financeiros
│   └── ai_service.py       # Serviços de IA
└── api/               # Controllers/Routes
    ├── auth.py        # Endpoints de autenticação
    ├── financial.py   # Endpoints financeiros
    └── ai_predictions.py # Endpoints de IA
```

## 🛠️ Tecnologias

- **[FastAPI](https://fastapi.tiangolo.com/)** - Framework web moderno e rápido
- **[SQLAlchemy 2.0](https://www.sqlalchemy.org/)** - ORM async para Python
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional robusto
- **[Pydantic v2](https://docs.pydantic.dev/)** - Validação de dados com type hints
- **[Alembic](https://alembic.sqlalchemy.org/)** - Migrations de banco de dados
- **[JWT](https://jwt.io/)** - Autenticação stateless
- **[bcrypt](https://github.com/pyca/bcrypt/)** - Hash seguro de senhas
- **[pytest](https://docs.pytest.org/)** - Framework de testes
- **[structlog](https://www.structlog.org/)** - Logging estruturado

## 📋 Pré-requisitos

- Python 3.11+
- PostgreSQL 13+
- pip ou poetry para gerenciamento de dependências

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <repository-url>
cd MeuFuturo
```

### 2. Instale as dependências

```bash
pip install -r requirements.txt
```

### 3. Configure o banco de dados

Crie um banco PostgreSQL:

```sql
CREATE DATABASE meufuturo;
CREATE DATABASE meufuturo_test; -- Para testes
```

### 4. Configure as variáveis de ambiente

Copie o arquivo de exemplo e configure:

```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/meufuturo
TEST_DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/meufuturo_test

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API
PROJECT_NAME=MeuFuturo API
VERSION=1.0.0
ENVIRONMENT=development

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 5. Execute as migrations

```bash
# Gerar migration inicial
alembic revision --autogenerate -m "Initial migration"

# Aplicar migrations
alembic upgrade head
```

### 6. Inicie o servidor

```bash
# Desenvolvimento
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Produção
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

A API estará disponível em:
- **Documentação Swagger**: http://localhost:8000/api/v1/docs
- **Documentação ReDoc**: http://localhost:8000/api/v1/redoc
- **Health Check**: http://localhost:8000/health

## 🧪 Executando Testes

```bash
# Todos os testes
pytest

# Testes específicos
pytest tests/test_auth.py
pytest tests/test_financial.py

# Com cobertura
pytest --cov=app --cov-report=html

# Apenas testes marcados
pytest -m "auth"
pytest -m "financial"
```

## 📚 Documentação da API

### Endpoints Principais

#### 🔐 Autenticação (`/api/v1/auth`)

- `POST /register` - Registrar novo usuário
- `POST /login` - Login e obtenção de token
- `GET /profile` - Obter perfil do usuário
- `PUT /profile` - Atualizar perfil
- `POST /change-password` - Alterar senha

#### 💰 Financeiro (`/api/v1/financial`)

- `POST /transactions` - Criar transação
- `GET /transactions` - Listar transações (com filtros)
- `GET /transactions/{id}` - Obter transação específica
- `PUT /transactions/{id}` - Atualizar transação
- `DELETE /transactions/{id}` - Excluir transação
- `POST /categories` - Criar categoria
- `GET /categories` - Listar categorias
- `GET /summary` - Resumo financeiro
- `GET /summary/categories` - Resumo por categoria
- `GET /overview` - Visão geral para dashboard

#### 🤖 IA e Predições (`/api/v1/ai`)

- `POST /generate` - Gerar predições com IA
- `GET /insights` - Insights financeiros completos
- `GET /predictions` - Listar predições
- `GET /predictions/active` - Predições ativas
- `POST /predictions/{id}/archive` - Arquivar predição

### Exemplos de Uso

#### Registrar usuário

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "name": "João Silva",
    "password": "senha123456"
  }'
```

#### Fazer login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "senha123456"
  }'
```

#### Criar transação

```bash
curl -X POST "http://localhost:8000/api/v1/financial/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "expense",
    "amount": 150.00,
    "description": "Compra no supermercado",
    "transaction_date": "2025-01-24",
    "notes": "Compras da semana"
  }'
```

## 🔧 Configuração de Desenvolvimento

### Estrutura de Branches

- `main` - Branch principal de produção
- `develop` - Branch de desenvolvimento
- `feature/*` - Features específicas
- `hotfix/*` - Correções urgentes

### Padrões de Código

O projeto segue:

- **PEP 8** para estilo de código Python
- **Type hints** em todas as funções
- **Docstrings** detalhadas
- **Clean Architecture** princípios
- **SOLID** princípios de design

### Ferramentas de Qualidade

```bash
# Formatação de código
black app/ tests/

# Imports organizados
isort app/ tests/

# Linting
flake8 app/ tests/

# Type checking
mypy app/
```

## 🎯 Regras de Negócio Implementadas

### 1. Gestão de Usuários
- Registro com validação de email
- Autenticação JWT com expiração
- Preferências de acessibilidade
- Perfil financeiro personalizado

### 2. Transações Financeiras
- Receitas e despesas com categorização
- Validação de valores e datas
- Filtros avançados e paginação
- Relacionamento com categorias

### 3. Categorização
- Categorias do sistema predefinidas
- Categorias personalizadas por usuário
- Hierarquia com subcategorias
- Controle de acesso e permissões

### 4. Relatórios e Análises
- Resumos por período
- Análise por categorias
- Visão geral para dashboard
- Estatísticas consolidadas

### 5. IA Preditiva
- Projeções de poupança
- Previsões de gastos
- Score de saúde financeira
- Recomendações personalizadas

### 6. Acessibilidade
- Configurações de tema e contraste
- Suporte a leitores de tela
- Navegação por teclado
- Preferências de fonte e animações

## 🔒 Segurança

- **Autenticação JWT** com chaves seguras
- **Hash bcrypt** para senhas
- **Validação rigorosa** de entrada
- **Rate limiting** configurável
- **CORS** configurado para frontend
- **SQL Injection** prevenção via ORM

## 🚀 Deploy

### Docker (Recomendado)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Variáveis de Ambiente para Produção

```env
ENVIRONMENT=production
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
ALLOWED_ORIGINS=https://yourdomain.com
LOG_LEVEL=INFO
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 🆘 Suporte

Para dúvidas e suporte:

- Abra uma [issue](https://github.com/your-repo/issues)
- Consulte a [documentação da API](http://localhost:8000/api/v1/docs)
- Entre em contato: meufuturo@example.com

## 🙏 Reconhecimentos

- **FastAPI** pela excelente framework
- **SQLAlchemy** pelo ORM robusto
- **Pydantic** pela validação elegante
- Comunidade Python pela inspiração

---

**MeuFuturo** - Sua plataforma de gestão financeira acessível e inteligente! 🚀
