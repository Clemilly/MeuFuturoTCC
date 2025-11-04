@echo off
echo ========================================
echo    MeuFuturo - TCC Claudia
echo    Inicializacao Rapida
echo ========================================
echo.

echo [1/3] Verificando arquivo .env...
if exist .env (
    echo [OK] Arquivo .env encontrado!
) else (
    echo [ERRO] Arquivo .env nao encontrado!
    echo Criando arquivo .env...
    copy .env.tcc-claudia .env
    echo [OK] Arquivo .env criado!
)
echo.

echo [2/3] Iniciando containers Docker...
docker-compose down 2>nul
docker-compose up -d
echo.

echo [3/3] Aguardando servicos iniciarem...
timeout /t 15 /nobreak >nul
echo.

echo ========================================
echo    Aplicacao Iniciada!
echo ========================================
echo.
echo URLs de Acesso:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo.
echo Ver logs: docker-compose logs -f
echo Parar:    docker-compose down
echo.
pause
