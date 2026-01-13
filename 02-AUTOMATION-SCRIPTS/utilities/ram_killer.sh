#!/bin/zsh
echo "💥 MATANDO TODO PESADO"
sudo pkill -9 syspolicyd
sudo pkill -9 tccd  
sudo pkill -9 fileprovider
sudo pkill -9 trustd
sudo purge
sudo pkill -STOP mdworker
echo "¡top NUEVAMENTE!"
