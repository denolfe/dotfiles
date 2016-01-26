#!/usr/bin/env bash
# 
# Slim down elementary install on chromebook

sudo -v

sudo apt-get remove --purge -y kodi kodi-bin
sudo apt-get remove --purge -y virtualbox-4.3
sudo apt-get remove --purge -y firefox
sudo apt-get remove --purge -y steam-launcher
sudo apt-get remove --purge -y simple-scan

sudo apt-get autoremove
sudo apt-get autoclean
