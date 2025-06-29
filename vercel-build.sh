#!/bin/bash

# Script de build para Vercel
# Este script garante que o build funcione corretamente

echo "🚀 Iniciando build para Vercel..."

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Compilar TypeScript
echo "🔨 Compilando TypeScript..."
npx tsc

# Verificar se o build foi bem-sucedido
if [ -f "dist/main.js" ]; then
    echo "✅ Build concluído com sucesso!"
    echo "📁 Arquivos gerados em dist/"
    ls -la dist/
else
    echo "❌ Erro no build!"
    exit 1
fi 