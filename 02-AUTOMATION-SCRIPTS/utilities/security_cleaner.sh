#!/bin/zsh
# 🔒 MACOS SECURITY CLEANER v2.0
echo "🔥 LIMPIADOR SEGURIDAD $(date)"
read -p "¿Continuar? [s/N]: " confirm && [[ $confirm != [sS]* ]] && exit 0

echo "📦 Backup..."
mkdir -p ~/Desktop/Security_Backup_$(date +%H%M)
sudo cp -r /var/log ~/Desktop/Security_Backup_$(date +%H%M) 2>/dev/null

echo "🗡️ Terminados procesos sospechosos..."
sudo pkill -f "plugin.*zsh|module.*zsh|OriginalModuled" 2>/dev/null

echo "🧹 Limpieza temporales..."
sudo rm -rf /tmp/* /var/tmp/* 2>/dev/null
rm -rf ~/Downloads/*.dmg ~/Downloads/*.pkg 2>/dev/null

echo "🍪 Cookies y cache..."
rm -rf ~/Library/Cookies/* ~/Library/Caches/* 2>/dev/null

echo "✅ LIMPIO! Procesos: $(ps -u $USER | wc -l)"

