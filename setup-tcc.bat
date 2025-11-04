@echo off
REM =============================================================================
REM Setup Rapido - TCC Claudia (Windows)
REM =============================================================================

echo.
echo ========================================
echo    MeuFuturo - TCC Claudia
echo    Setup Rapido
echo ========================================
echo.

REM Copiar arquivo .env
echo [1/4] Configurando arquivo .env...
if exist .env (
    echo [!] Arquivo .env ja existe.
    set /p overwrite="Deseja sobrescrever? (S/N): "
    if /i "%overwrite%"=="S" (
        copy /Y .env.tcc-claudia .env >nul
        echo [OK] Arquivo .env atualizado!
    ) else (
        echo [OK] Mantendo .env existente
    )
) else (
    copy .env.tcc-claudia .env >nul
    echo [OK] Arquivo .env criado!
)
echo.

REM Criar database (instrucoes)
echo [2/4] Database Configuration
echo.
echo Para criar o database 'meufuturo', execute:
echo.
echo   psql -h tcc-claudia.cc7e46k0q7mx.us-east-1.rds.amazonaws.com -U claudiaadmin -d postgres
echo   Password: tccclaudia123
echo.
echo   Depois execute: CREATE DATABASE meufuturo;
echo.
set /p skip="Pressione ENTER para continuar..."

REM Iniciar containers
echo.
echo [3/4] Deseja iniciar os containers Docker agora? (S/N)
set /p start="Iniciar? (S/N): "
if /i "%start%"=="S" (
    echo.
    echo [+] Parando containers existentes...
    docker-compose down 2>nul
    
    echo [+] Iniciando containers...
    docker-compose up -d --build
    
    echo [+] Aguardando servicos iniciarem...
    timeout /t 10 /nobreak >nul
    
    echo.
    echo ========================================
    echo    MeuFuturo - TCC Claudia
    echo    Aplicacao iniciada!
    echo ========================================
    echo.
    echo URLs de Acesso:
    echo   Frontend:  http://localhost:3000
    echo   Backend:   http://localhost:8000
    echo   API Docs:  http://localhost:8000/docs
    echo.
    echo Comandos Uteis:
    echo   docker-compose logs -f          - Ver logs
    echo   docker-compose down             - Parar containers
    echo.
) else (
    echo.
    echo [OK] Pulando inicializacao dos containers
    echo Para iniciar depois, execute: docker-compose up -d
    echo.
)

echo [4/4] Setup concluido com sucesso!
echo.
pause

