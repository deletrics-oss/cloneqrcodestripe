#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}>>> Atualizando sistema...${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${GREEN}>>> Instalando Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo -e "${GREEN}>>> Instalando PM2...${NC}"
sudo npm install -g pm2

echo -e "${GREEN}>>> Instalando dependências do projeto...${NC}"
npm ci --omit=dev

echo -e "${GREEN}>>> Configurando .env...${NC}"
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "Arquivo .env criado a partir do exemplo."
        echo "POR FAVOR, EDITE O ARQUIVO .env COM SUAS CREDENCIAIS DO BANCO DE DADOS AGORA."
    else
        echo "Aviso: .env.example não encontrado."
    fi
else
    echo ".env já existe."
fi

echo -e "${GREEN}>>> Iniciando aplicação...${NC}"
# Inicia/Reinicia a aplicação
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo -e "${GREEN}>>> Instalação Concluída!${NC}"
echo "A aplicação deve estar rodando em http://SEU_IP:3000"
