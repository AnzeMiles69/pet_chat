# Активация виртуального окружения и запуск бэкенда
$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot; .\.venv\Scripts\Activate.ps1; python -m uvicorn app.main:app --reload" -PassThru

# Запуск фронтенда (после установки Node.js)
$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot\frontend; npm install; npm run dev" -PassThru

Write-Host "Серверы запускаются..."
Write-Host "Бэкенд будет доступен по адресу: http://localhost:8000"
Write-Host "Фронтенд будет доступен по адресу: http://localhost:5173"
Write-Host "Нажмите Ctrl+C чтобы остановить серверы"

try {
    Wait-Process -Id $backendJob.Id, $frontendJob.Id
} catch {
    # При нажатии Ctrl+C останавливаем процессы
    if ($backendJob) { Stop-Process -Id $backendJob.Id -Force }
    if ($frontendJob) { Stop-Process -Id $frontendJob.Id -Force }
    Write-Host "`nСерверы остановлены"
} 