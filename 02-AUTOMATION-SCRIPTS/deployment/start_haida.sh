#!/bin/bash
echo "🚀 Iniciando HAIDA v2.0..."
echo "================================"

cd ~/Hiberus/HAIDA-PROJECT

echo ""
echo "📍 Directorio: $(pwd)"
echo ""

# Opción: Docker o Local
echo "Selecciona cómo iniciar HAIDA:"
echo "1) Docker (recomendado) - Todos los servicios"
echo "2) Solo API (local)"
echo "3) Solo Telegram Bot (local)"
echo "4) Status de servicios"
echo ""
read -p "Opción (1-4): " option

case $option in
    1)
        echo ""
        echo "🐳 Iniciando con Docker Compose..."
        docker-compose up -d
        echo ""
        echo "✅ Servicios iniciados!"
        echo ""
        echo "📊 Accede a:"
        echo "  • API: http://localhost:8000"
        echo "  • Docs: http://localhost:8000/docs"
        echo "  • Allure: http://localhost:5050"
        echo ""
        echo "Ver logs: docker-compose logs -f"
        echo "Parar: docker-compose down"
        ;;
    2)
        echo ""
        echo "🚀 Iniciando API local..."
        source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
        pip install -q -r requirements.txt
        echo ""
        echo "✅ API iniciando en http://localhost:8000"
        echo "📚 Docs: http://localhost:8000/docs"
        echo ""
        uvicorn app.main:app --reload
        ;;
    3)
        echo ""
        echo "🤖 Iniciando Telegram Bot..."
        source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
        pip install -q -r requirements.txt
        echo ""
        python3 scripts/telegram_bot_v2.py
        ;;
    4)
        echo ""
        echo "📊 Status de servicios Docker:"
        docker-compose ps
        echo ""
        echo "📊 Procesos Python:"
        ps aux | grep -E "(uvicorn|telegram_bot)" | grep -v grep
        ;;
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac
