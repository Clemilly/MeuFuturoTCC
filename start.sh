#!/bin/bash
# =============================================================================
# MeuFuturo - Script de Inicialização Rápida
# =============================================================================

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
cat << "EOF"
  __  __            _____      _                  
 |  \/  |          |  ___|    | |                 
 | \  / | ___ _   _| |__ _   _| |_ _   _ _ __ ___ 
 | |\/| |/ _ \ | | |  __| | | | __| | | | '__/ _ \
 | |  | |  __/ |_| | |  | |_| | |_| |_| | | | (_) |
 |_|  |_|\___|\__,_\_|   \__,_|\__|\__,_|_|  \___/ 
                                                    
EOF
echo -e "${NC}"
echo -e "${GREEN}🚀 Inicializando MeuFuturo...${NC}\n"

# Verificar se Docker está instalado
echo -e "${YELLOW}📋 Verificando pré-requisitos...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado!${NC}"
    echo -e "${YELLOW}Por favor, instale o Docker: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não está instalado!${NC}"
    echo -e "${YELLOW}Por favor, instale o Docker Compose${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker instalado: $(docker --version)${NC}"
echo -e "${GREEN}✅ Docker Compose instalado: $(docker-compose --version)${NC}\n"

# Verificar se arquivo .env existe
if [ ! -f .env ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    echo -e "${YELLOW}Por favor, copie o arquivo de exemplo e configure:${NC}"
    echo -e "  ${BLUE}cp .env.aws.example .env${NC}"
    echo -e ""
    echo -e "${YELLOW}Configure a variável DATABASE_URL com seu endpoint AWS RDS:${NC}"
    echo -e "  ${BLUE}DATABASE_URL=postgresql+asyncpg://user:pass@seu-rds-endpoint.rds.amazonaws.com:5432/meufuturo${NC}"
    echo -e ""
    echo -e "${YELLOW}Consulte README_AWS_RDS.md para mais detalhes.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Arquivo .env encontrado!${NC}\n"

# Verificar se DATABASE_URL está configurada
if ! grep -q "DATABASE_URL=postgresql" .env; then
    echo -e "${RED}⚠️  DATABASE_URL não está configurada corretamente no .env${NC}"
    echo -e "${YELLOW}Configure com seu endpoint AWS RDS:${NC}"
    echo -e "  ${BLUE}DATABASE_URL=postgresql+asyncpg://user:pass@seu-rds-endpoint.rds.amazonaws.com:5432/meufuturo${NC}"
    echo -e ""
    echo -e "${YELLOW}Deseja continuar mesmo assim? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Parar containers existentes
echo -e "${YELLOW}🛑 Parando containers existentes (se houver)...${NC}"
docker-compose down 2>/dev/null || true

# Construir e iniciar containers
echo -e "${YELLOW}🔨 Construindo e iniciando containers...${NC}"
docker-compose up -d --build

# Aguardar containers estarem prontos
echo -e "${YELLOW}⏳ Aguardando serviços iniciarem...${NC}"
sleep 5

# Verificar status dos containers
echo -e "\n${YELLOW}📊 Status dos containers:${NC}"
docker-compose ps

# Verificar health dos containers
echo -e "\n${YELLOW}🏥 Verificando saúde dos serviços...${NC}"
echo -e "${BLUE}Aguardando containers iniciarem (30 segundos)...${NC}"
sleep 10

# Verificar se backend está respondendo
MAX_RETRIES=15
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend está saudável e conectado ao banco!${NC}"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -e "${YELLOW}⏳ Aguardando backend conectar ao AWS RDS... ($RETRY_COUNT/$MAX_RETRIES)${NC}"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}⚠️  Timeout aguardando backend. Verifique:${NC}"
    echo -e "${YELLOW}  1. DATABASE_URL está correto no .env?${NC}"
    echo -e "${YELLOW}  2. AWS RDS está acessível?${NC}"
    echo -e "${YELLOW}  3. Security Group permite conexão na porta 5432?${NC}"
    echo -e ""
    echo -e "${YELLOW}Ver logs: docker-compose logs backend${NC}"
fi

# Mostrar URLs de acesso
echo -e "\n${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ MeuFuturo iniciado com sucesso!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}🌐 URLs de Acesso:${NC}"
echo -e "  ${YELLOW}Frontend:${NC}  http://localhost:3000"
echo -e "  ${YELLOW}Backend:${NC}   http://localhost:8000"
echo -e "  ${YELLOW}API Docs:${NC}  http://localhost:8000/docs"
echo -e "  ${YELLOW}Database:${NC}  AWS RDS (configurado no .env)\n"

echo -e "${BLUE}📋 Comandos Úteis:${NC}"
echo -e "  ${YELLOW}make logs${NC}          - Ver logs de todos os serviços"
echo -e "  ${YELLOW}make logs-backend${NC}  - Ver logs do backend"
echo -e "  ${YELLOW}make logs-frontend${NC} - Ver logs do frontend"
echo -e "  ${YELLOW}make down${NC}          - Parar todos os containers"
echo -e "  ${YELLOW}make help${NC}          - Ver todos os comandos\n"

echo -e "${BLUE}🔍 Para verificar os logs em tempo real:${NC}"
echo -e "  ${YELLOW}docker-compose logs -f${NC}\n"

echo -e "${GREEN}🎉 Pronto para começar a desenvolver!${NC}\n"

