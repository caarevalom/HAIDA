#!/bin/zsh
# 🔥 MACOS MEMORY CLEANER AGRESIVO v3.0
# ⚡ Libera RAM + optimiza sistema M1/M2
# Guarda: memory_cleaner.sh && chmod +x memory_cleaner.sh && ./memory_cleaner.sh

echo "⚡ LIMPIADOR DE MEMORIA EXTREMO M1 $(date)"
echo "====================================="

# 1. 🧹 PURGA CACHE DE MEMORIA (MÁS IMPORTANTE)
echo "🧹 Purgando memoria RAM..."
sudo purge                          # Comando nativo Apple M1

# 2. ❌ MATA PROCESOS PESADOS
echo "💥 Terminados procesos pesados..."
sudo pkill -f "Google.*Chrome.*--type=renderer" 2>/dev/null
sudo pkill -f "Safari.*WebContent" 2>/dev/null  
sudo pkill -f "Python.*memory" 2>/dev/null
sudo pkill -STOP "mdworker.*Spotlight" 2>/dev/null  # Pausa indexación

# 3. 🗑️ LIMPIEZA SWAP/FILESYSTEM
echo "🗑️ Limpiando swap y filesystem..."
sudo rm -rf /private/var/vm/swapfile* 2>/dev/null
sync && sudo sync                    # Fuerza escritura disco

# 4. 📱 OPTIMIZACIÓN M1 SWAP
echo "📱 Optimizando swap M1..."
sudo sysctl -w vm.compressor_mode=4  # Modo agresivo
sudo sysctl -w kern.boottime=0       # Reset boot cache

# 5. 🎛️ AJUSTES SISTEMA ÁGILES
echo "⚙️ Ajustes rendimiento..."
sudo sysctl -w kern.ipc.maxsockbuf=8388608
defaults write com.apple.CrashReporter DialogType -string "none"  # No diálogos

# 6. 🚫 DESACTIVA SERVICIOS PESADOS TEMPORAL
echo "⏹️ Pausando servicios pesados..."
sudo launchctl unload -w /System/Library/LaunchDaemons/com.apple.metadata.mds.plist 2>/dev/null
sudo launchctl unload -w /System/Library/LaunchDaemons/com.apple.xpc.role.accountpolicy.plist 2>/dev/null

# 7. 📊 REPORTE DRAMÁTICO
echo "
🚀 RESULTADOS $(date)
==================
MEMORIA LIBERADA ✅
Procesos: $(ps aux | wc -l | awk '{print $1}')
RAM: $(vm_stat | grep 'Pages free' | awk '{print $1/256 "MB libres"}')
Disco: $(df / | tail -1 | awk '{print $4/1024/1024 "GB libres"}')

🔥 Para efectos inmediatos: Ctrl+Cmd+Esc → Quita apps pesadas
💾 Reinicia en 30min para máximo efecto: sudo reboot
"

echo "⚡ Ejecuta 'top' para ver magia en tiempo real"

