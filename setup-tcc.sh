#!/bin/bash
# =============================================================================
# Setup Rápido - TCC Claudia
# =============================================================================

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
  __  __            _____      _                  
 |  \/  |          |  ___|    | |                 
 | \  / | ___ _   _| |__ _   _| |_ _   _ _ __ ___ 
 | |\/| |/ _ \ | | |  __| | | | __| | | | '__/ _ \
 | |  | |  __/ |_| | |  | |_| | |_| |_| | | | (_) |
 |_|  |_|\___|\__,_\_|   \__,_|\__|\__,_|_|  \___/ 
                                                    
         TCC Claudia - Setup Rápido
EOF
echo -e "${NC}"

# Copiar arquivo .env
echo -e "${GREEN}1️⃣  Configurando arquivo .env...${NC}"
if [ -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env já existe. Deseja sobrescrever? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        cp .env.tcc-claudia .env
        echo -e "${GREEN}✅ Arquivo .env atualizado!${NC}"
    else
        echo -e "${YELLOW}⏭️  Mantendo .env existente${NC}"
    fi
else
    cp .env.tcc-claudia .env
    echo -e "${GREEN}✅ Arquivo .env criado!${NC}"
fi

# Verificar conexão com o banco (opcional)
echo -e "\n${GREEN}2️⃣  Verificar conexão com AWS RDS? (y/N)${NC}"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Testando conexão com tcc-claudia.cc7e46k0q7mx.us-east-1.rds.amazonaws.com...${NC}"
    if command -v psql &> /dev/null; then
        PGPASSWORD=tccclaudia123 psql -h tcc-claudia.cc7e46k0q7mx.us-east-1.rds.amazonaws.com -U claudiaadmin -d postgres -c "SELECT 1;" > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Conexão com AWS RDS OK!${NC}"
        else
            echo -e "${YELLOW}⚠️  Não foi possível conectar ao banco. Verifique:${NC}"
            echo -e "  1. Security Group permite conexão na porta 5432"
            echo -e "  2. Seu IP está autorizado"
        fi
    else
        echo -e "${YELLOW}⚠️  psql não instalado. Pulando teste de conexão.${NC}"
    fi
fi

# Criar database (opcional)
echo -e "\n${GREEN}3️⃣  Criar database 'meufuturo' no RDS? (y/N)${NC}"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    if command -v psql &> /dev/null; then
        echo -e "${BLUE}Criando database...${NC}"
        PGPASSWORD=tccclaudia123 psql -h tcc-claudia.cc7e46k0q7mx.us-east-1.rds.amazonaws.com -U claudiaadmin -d postgres -c "CREATE DATABASE meufuturo;" 2>&1 | grep -v "already exists" || true
        echo -e "${GREEN}✅ Database pronto!${NC}"
    else
        echo -e "${YELLOW}⚠️  psql não instalado. Crie manualmente:${NC}"
        echo -e "  psql -h tcc-claudia.cc7e46k0q7mx.us-east-1.rds.amazonaws.com -U claudiaadmin -d postgres -c \"CREATE DATABASE meufuturo;\""
    fi
fi

# Iniciar containers
echo -e "\n${GREEN}4️⃣  Iniciar containers Docker? (Y/n)${NC}"
read -r response
if [[ ! "$response" =~ ^[Nn]$ ]]; then
    echo -e "${BLUE}Iniciando containers...${NC}"
    docker-compose down 2>/dev/null || true
    docker-compose up -d --build
    
    echo -e "\n${BLUE}Aguardando serviços iniciarem...${NC}"
    sleep 10
    
    # Verificar backend
    MAX_RETRIES=15
    RETRY_COUNT=0
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend está rodando!${NC}"
            break
        fi
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo -e "${YELLOW}⏳ Aguardando backend... ($RETRY_COUNT/$MAX_RETRIES)${NC}"
        sleep 2
    done
    
    echo -e "\n${GREEN}═══════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✨ MeuFuturo - TCC Claudia está rodando!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}\n"
    
    echo -e "${BLUE}🌐 URLs de Acesso:${NC}"
    echo -e "  ${YELLOW}Frontend:${NC}  http://localhost:3000"
    echo -e "  ${YELLOW}Backend:${NC}   http://localhost:8000"
    echo -e "  ${YELLOW}API Docs:${NC}  http://localhost:8000/docs\n"
    
    echo -e "${BLUE}📋 Comandos Úteis:${NC}"
    echo -e "  ${YELLOW}docker-compose logs -f${NC}          - Ver logs"
    echo -e "  ${YELLOW}docker-compose down${NC}             - Parar containers"
    echo -e "  ${YELLOW}make help${NC}                       - Ver todos os comandos\n"
else
    echo -e "${YELLOW}⏭️  Pulando inicialização dos containers${NC}"
    echo -e "Para iniciar depois, execute: ${BLUE}docker-compose up -d${NC}"
fi

echo -e "${GREEN}🎉 Setup concluído com sucesso!${NC}\n"

