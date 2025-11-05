# 🚀 MeuFuturo - Sistema de Gestão Financeira

Sistema completo de gestão financeira pessoal com foco em acessibilidade, desenvolvido com Next.js (frontend) e FastAPI (backend).

## 📁 Estrutura do Projeto

```
MeuFuturo/
├── 📂 meuFuturoBackend/          # Backend Python (FastAPI)
│   ├── 📄 main.py                # Entry point da API
│   ├── 📄 requirements.txt       # Dependências Python
│   ├── 📄 README.md              # Documentação do backend
│   ├── 📄 SETUP_PYCHARM.md       # Guia de configuração PyCharm
│   ├── 📄 alembic.ini            # Configuração de migrations
│   ├── 📂 api/                   # Endpoints REST
│   ├── 📂 core/                  # Configuração, database, security
│   ├── 📂 models/                # Modelos SQLAlchemy
│   ├── 📂 schemas/               # Schemas Pydantic
│   ├── 📂 repositories/          # Camada de dados
│   ├── 📂 services/              # Lógica de negócio
│   ├── 📂 migrations/            # Migrations Alembic
│   └── 📂 tests/                 # Testes automatizados
│
└── 📂 meuFuturoFrontend/         # Frontend Next.js
    ├── 📂 app/                   # App Router Next.js 14
    ├── 📂 components/            # Componentes React
    ├── 📂 contexts/              # Context providers
    ├── 📂 lib/                   # Utilitários
    ├── 📄 package.json           # Dependências Node.js
    └── 📄 README.md              # Documentação do frontend
```

## 🎯 Funcionalidades

### 🔐 Autenticação & Segurança
- ✅ Login/Registro com JWT
- ✅ Gestão de perfil de usuário
- ✅ Controle de sessões

### 💰 Gestão Financeira
- ✅ CRUD completo de transações
- ✅ Sistema de categorias flexível
- ✅ Filtros e paginação avançados
- ✅ Dashboard financeiro
- ✅ Relatórios detalhados

### 🤖 Inteligência Artificial
- ✅ Score de saúde financeira
- ✅ Projeções de poupança
- ✅ Análise de padrões de gastos
- ✅ Recomendações personalizadas

### 🔔 Alertas & Notificações
- ✅ Sistema completo de alertas
- ✅ Prioridades e recorrência
- ✅ Notificações personalizadas

### ♿ Acessibilidade
- ✅ Suporte a leitores de tela
- ✅ Navegação por teclado
- ✅ Múltiplos temas e contrastes
- ✅ Configurações de UI personalizáveis

## 🚀 Como Executar

### Backend (FastAPI)
```bash
cd meuFuturoBackend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend (Next.js)
```bash
cd meuFuturoFrontend
npm install
npm run dev
```

## 📖 Documentação

- **Backend:** [meuFuturoBackend/README.md](./meuFuturoBackend/README.md)
- **Frontend:** [meuFuturoFrontend/README.md](./meuFuturoFrontend/README.md)
- **PyCharm Setup:** [meuFuturoBackend/SETUP_PYCHARM.md](./meuFuturoBackend/SETUP_PYCHARM.md)

## 🌐 URLs Importantes

Após executar ambos os projetos:

### Backend (FastAPI)
- **📖 API Docs:** http://localhost:8000/api/v1/docs
- **💚 Health Check:** http://localhost:8000/health
- **🔍 ReDoc:** http://localhost:8000/api/v1/redoc

### Frontend (Next.js)
- **🌐 Aplicação:** http://localhost:3000
- **📱 Interface móvel responsiva**

## 🏗️ Arquitetura

### Backend - Clean Architecture
- **API Layer:** FastAPI routes e endpoints
- **Service Layer:** Lógica de negócio
- **Repository Layer:** Abstração de dados
- **Model Layer:** Entidades SQLAlchemy
- **Core Layer:** Configuração e infraestrutura

### Frontend - Next.js 14
- **App Router:** Roteamento baseado em arquivos
- **React Components:** Interface de usuário
- **Context API:** Gerenciamento de estado
- **TailwindCSS:** Estilização e responsividade

## 🎨 Personas Atendidas

### 👨‍💼 João (45 anos)
- Microempreendedor
- Pouca familiaridade tecnológica
- Interface simples e intuitiva

### 👩‍🎓 Camila (21 anos)  
- Universitária
- Deficiência auditiva
- Recursos visuais e VLibras

### 👩‍🏫 Ana (32 anos)
- Professora
- Deficiência visual
- Compatibilidade com leitores de tela

## 🔧 Tecnologias

### Backend
- **FastAPI** - Framework web moderno
- **SQLAlchemy 2.0** - ORM async
- **PostgreSQL** - Banco de dados
- **Alembic** - Migrations
- **Pydantic** - Validação de dados
- **JWT** - Autenticação
- **Pytest** - Testes

### Frontend
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **Recharts** - Gráficos
- **React Hook Form** - Formulários

## 📝 Licença

Este projeto foi desenvolvido como parte de um sistema de gestão financeira com foco em acessibilidade.

---

**✨ MeuFuturo - Sua jornada financeira começa aqui!**
