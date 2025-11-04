# =============================================================================
# MeuFuturo - Makefile
# =============================================================================
# Comandos úteis para gerenciar o projeto com Docker Compose

.PHONY: help up down restart logs build rebuild clean ps exec-backend exec-frontend exec-db migrate shell test backup restore

# Cores para output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m # No Color

## help: Mostra esta mensagem de ajuda
help:
	@echo "$(GREEN)MeuFuturo - Comandos Disponíveis:$(NC)"
	@echo ""
	@echo "$(YELLOW)Gerenciamento de Containers:$(NC)"
	@echo "  make up           - Inicia todos os containers"
	@echo "  make down         - Para todos os containers"
	@echo "  make restart      - Reinicia todos os containers"
	@echo "  make build        - Constrói as imagens"
	@echo "  make rebuild      - Reconstrói e inicia os containers"
	@echo "  make clean        - Para containers e remove volumes (⚠️ apaga dados!)"
	@echo ""
	@echo "$(YELLOW)Logs e Monitoramento:$(NC)"
	@echo "  make logs         - Mostra logs de todos os serviços"
	@echo "  make logs-backend - Mostra logs do backend"
	@echo "  make logs-frontend- Mostra logs do frontend"
	@echo "  make ps           - Lista status dos containers"
	@echo ""
	@echo "$(YELLOW)Acesso aos Containers:$(NC)"
	@echo "  make shell-backend - Abre shell no container do backend"
	@echo "  make shell-frontend- Abre shell no container do frontend"
	@echo ""
	@echo "$(YELLOW)Banco de Dados (AWS RDS):$(NC)"
	@echo "  make migrate      - Executa migrações do banco"
	@echo "  make migrate-create MSG='descrição' - Cria nova migração"
	@echo "  make db-connect   - Conecta ao AWS RDS via psql"
	@echo ""
	@echo "$(YELLOW)Desenvolvimento:$(NC)"
	@echo "  make test         - Executa testes"
	@echo "  make lint         - Executa linter no backend"
	@echo ""

## up: Inicia todos os containers em background
up:
	@echo "$(GREEN)🚀 Iniciando MeuFuturo...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✅ Containers iniciados!$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:3000$(NC)"
	@echo "$(YELLOW)Backend:  http://localhost:8000$(NC)"
	@echo "$(YELLOW)API Docs: http://localhost:8000/docs$(NC)"

## down: Para todos os containers
down:
	@echo "$(YELLOW)⏸️  Parando containers...$(NC)"
	docker-compose down
	@echo "$(GREEN)✅ Containers parados!$(NC)"

## restart: Reinicia todos os containers
restart:
	@echo "$(YELLOW)🔄 Reiniciando containers...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✅ Containers reiniciados!$(NC)"

## build: Constrói as imagens Docker
build:
	@echo "$(GREEN)🔨 Construindo imagens...$(NC)"
	docker-compose build
	@echo "$(GREEN)✅ Build concluído!$(NC)"

## rebuild: Reconstrói e reinicia os containers
rebuild:
	@echo "$(GREEN)🔨 Reconstruindo e reiniciando...$(NC)"
	docker-compose up -d --build
	@echo "$(GREEN)✅ Rebuild concluído!$(NC)"

## clean: Para containers e remove volumes (⚠️ APAGA DADOS!)
clean:
	@echo "$(RED)⚠️  ATENÇÃO: Isso irá apagar TODOS OS DADOS!$(NC)"
	@read -p "Tem certeza? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "$(GREEN)✅ Limpeza concluída!$(NC)"; \
	else \
		echo "$(YELLOW)❌ Cancelado$(NC)"; \
	fi

## ps: Mostra status dos containers
ps:
	@docker-compose ps

## logs: Mostra logs de todos os serviços
logs:
	docker-compose logs -f

## logs-backend: Mostra logs do backend
logs-backend:
	docker-compose logs -f backend

## logs-frontend: Mostra logs do frontend
logs-frontend:
	docker-compose logs -f frontend

## shell-backend: Abre shell no container do backend
shell-backend:
	@echo "$(GREEN)🐚 Abrindo shell no backend...$(NC)"
	docker-compose exec backend bash

## shell-frontend: Abre shell no container do frontend
shell-frontend:
	@echo "$(GREEN)🐚 Abrindo shell no frontend...$(NC)"
	docker-compose exec frontend sh

## db-connect: Conecta ao AWS RDS via psql
db-connect:
	@echo "$(GREEN)🐘 Conectando ao AWS RDS...$(NC)"
	@if [ -z "$(DATABASE_URL)" ]; then \
		echo "$(RED)❌ Erro: DATABASE_URL não está definida no .env$(NC)"; \
		exit 1; \
	fi
	docker-compose exec backend psql $(DATABASE_URL)

## migrate: Executa migrações do banco de dados
migrate:
	@echo "$(GREEN)🔄 Executando migrações...$(NC)"
	docker-compose exec backend alembic upgrade head
	@echo "$(GREEN)✅ Migrações concluídas!$(NC)"

## migrate-create: Cria uma nova migração
migrate-create:
	@if [ -z "$(MSG)" ]; then \
		echo "$(RED)❌ Erro: Use 'make migrate-create MSG=\"descrição\"'$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)📝 Criando migração: $(MSG)$(NC)"
	docker-compose exec backend alembic revision --autogenerate -m "$(MSG)"
	@echo "$(GREEN)✅ Migração criada!$(NC)"

## backup: Faz backup do banco de dados (AWS RDS)
backup:
	@echo "$(GREEN)💾 Criando backup do AWS RDS...$(NC)"
	@mkdir -p backups
	@if [ -z "$(DATABASE_URL)" ]; then \
		echo "$(RED)❌ Erro: DATABASE_URL não está definida no .env$(NC)"; \
		exit 1; \
	fi
	docker-compose exec -T backend pg_dump $(DATABASE_URL) > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Backup criado em backups/$(NC)"

## restore: Restaura backup do banco de dados (AWS RDS)
restore:
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)❌ Erro: Use 'make restore FILE=backups/backup.sql'$(NC)"; \
		exit 1; \
	fi
	@if [ -z "$(DATABASE_URL)" ]; then \
		echo "$(RED)❌ Erro: DATABASE_URL não está definida no .env$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)⚠️  Restaurando backup no AWS RDS: $(FILE)$(NC)"
	@read -p "Tem certeza? Isso irá sobrescrever os dados! [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose exec -T backend psql $(DATABASE_URL) < $(FILE); \
		echo "$(GREEN)✅ Restore concluído!$(NC)"; \
	else \
		echo "$(YELLOW)❌ Cancelado$(NC)"; \
	fi

## test: Executa testes
test:
	@echo "$(GREEN)🧪 Executando testes...$(NC)"
	docker-compose exec backend pytest
	@echo "$(GREEN)✅ Testes concluídos!$(NC)"

## lint: Executa linter no backend
lint:
	@echo "$(GREEN)🔍 Executando linter...$(NC)"
	docker-compose exec backend flake8 .
	@echo "$(GREEN)✅ Lint concluído!$(NC)"

## health: Verifica saúde dos containers
health:
	@echo "$(GREEN)🏥 Verificando saúde dos containers...$(NC)"
	@docker inspect --format='{{.Name}}: {{.State.Health.Status}}' $$(docker-compose ps -q) 2>/dev/null || echo "Health checks não disponíveis"

## stats: Mostra estatísticas de recursos
stats:
	@echo "$(GREEN)📊 Estatísticas de recursos:$(NC)"
	docker stats --no-stream $$(docker-compose ps -q)

.DEFAULT_GOAL := help

