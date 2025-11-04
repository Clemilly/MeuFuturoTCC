@echo off
REM =============================================================================
REM MeuFuturo - Script de Inicializacao Rapida (Windows)
REM =============================================================================

echo.
echo ========================================
echo    MeuFuturo - Iniciando...
echo ========================================
echo.

REM Verificar se Docker esta instalado
echo [+] Verificando pre-requisitos...

where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker nao esta instalado!
    echo Por favor, instale o Docker Desktop: https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker Compose nao esta instalado!
    pause
    exit /b 1
)

echo [OK] Docker instalado
echo [OK] Docker Compose instalado
echo.

REM Verificar se arquivo .env existe
if not exist .env (
    echo [ERROR] Arquivo .env nao encontrado!
    echo.
    echo Por favor, copie o arquivo de exemplo e configure:
    echo   copy .env.aws.example .env
    echo.
    echo Configure a variavel DATABASE_URL com seu endpoint AWS RDS:
    echo   DATABASE_URL=postgresql+asyncpg://user:pass@seu-rds.rds.amazonaws.com:5432/meufuturo
    echo.
    echo Consulte README_AWS_RDS.md para mais detalhes.
    echo.
    pause
    exit /b 1
)

echo [OK] Arquivo .env encontrado!
echo.

REM Parar containers existentes
echo [+] Parando containers existentes (se houver)...
docker-compose down 2>nul

REM Construir e iniciar containers
echo.
echo [+] Construindo e iniciando containers...
docker-compose up -d --build

REM Aguardar containers estarem prontos
echo.
echo [+] Aguardando servicos iniciarem...
timeout /t 5 /nobreak >nul

REM Verificar status dos containers
echo.
echo [+] Status dos containers:
docker-compose ps

REM Mostrar URLs de acesso
echo.
echo ========================================
echo    MeuFuturo iniciado com sucesso!
echo ========================================
echo.
echo URLs de Acesso:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo   Database:  AWS RDS (configurado no .env)
echo.
echo Comandos Uteis:
echo   docker-compose logs -f          - Ver logs
echo   docker-compose logs -f backend  - Ver logs do backend
echo   docker-compose logs -f frontend - Ver logs do frontend
echo   docker-compose down             - Parar containers
echo.
echo Pronto para comecar a desenvolver!
echo.

pause

