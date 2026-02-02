#!/bin/bash

# Script para limpar todos os caches e arquivos temporários dos três projetos
# Uso: ./clean-all.sh

set -e  # Para o script se houver erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir mensagens
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Diretório base
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_info "Iniciando limpeza dos projetos..."
print_info "Diretório base: $BASE_DIR"
echo ""

# Função para limpar um projeto
clean_project() {
    local project_dir=$1
    local project_name=$2
    
    if [ ! -d "$project_dir" ]; then
        print_warning "Diretório $project_dir não encontrado, pulando..."
        return
    fi
    
    print_info "Limpando $project_name..."
    cd "$project_dir"
    
    # node_modules
    if [ -d "node_modules" ]; then
        print_info "  Removendo node_modules..."
        rm -rf node_modules
    fi
    
    # Build outputs
    if [ -d "dist" ]; then
        print_info "  Removendo dist/..."
        rm -rf dist
    fi
    
    if [ -d "build" ]; then
        print_info "  Removendo build/..."
        rm -rf build
    fi
    
    # Cache directories
    if [ -d ".vite" ]; then
        print_info "  Removendo .vite/..."
        rm -rf .vite
    fi
    
    if [ -d ".cache" ]; then
        print_info "  Removendo .cache/..."
        rm -rf .cache
    fi
    
    if [ -d ".next" ]; then
        print_info "  Removendo .next/..."
        rm -rf .next
    fi
    
    if [ -d ".turbo" ]; then
        print_info "  Removendo .turbo/..."
        rm -rf .turbo
    fi
    
    # Coverage reports
    if [ -d "coverage" ]; then
        print_info "  Removendo coverage/..."
        rm -rf coverage
    fi
    
    if [ -d ".nyc_output" ]; then
        print_info "  Removendo .nyc_output/..."
        rm -rf .nyc_output
    fi
    
    # Logs
    print_info "  Removendo arquivos de log..."
    find . -maxdepth 1 -type f \( -name "*.log" -o -name "yarn-error.log" -o -name "npm-debug.log*" -o -name "lerna-debug.log*" \) -delete
    
    # Arquivos temporários do sistema
    print_info "  Removendo arquivos temporários do sistema..."
    find . -type f -name ".DS_Store" -delete
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -type f -name "*.pyc" -delete 2>/dev/null || true
    find . -type f -name "*.pyo" -delete 2>/dev/null || true
    find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
    
    # Arquivos de lock (opcional - descomente se quiser limpar)
    # if [ -f "package-lock.json" ]; then
    #     print_info "  Removendo package-lock.json..."
    #     rm -f package-lock.json
    # fi
    # if [ -f "yarn.lock" ]; then
    #     print_info "  Removendo yarn.lock..."
    #     rm -f yarn.lock
    # fi
    
    # TypeScript build info
    if [ -f "tsconfig.tsbuildinfo" ]; then
        print_info "  Removendo tsconfig.tsbuildinfo..."
        rm -f tsconfig.tsbuildinfo
    fi
    
    find . -type f -name "*.tsbuildinfo" -delete 2>/dev/null || true
    
    # Editor directories
    if [ -d ".idea" ]; then
        print_warning "  Diretório .idea/ encontrado (IDE), mantendo..."
    fi
    
    if [ -d ".vscode" ]; then
        print_warning "  Diretório .vscode/ encontrado (IDE), mantendo..."
    fi
    
    cd "$BASE_DIR"
    print_info "$project_name limpo!"
    echo ""
}

# Limpar agent-assist-widget
clean_project "$BASE_DIR/agent-assist-widget" "agent-assist-widget"

# Limpar chat-server (não limpa uploads/ e chat.db por padrão, mas pode ser configurado)
print_info "Limpando chat-server..."
cd "$BASE_DIR/chat-server"

if [ -d "node_modules" ]; then
    print_info "  Removendo node_modules..."
    rm -rf node_modules
fi

# Logs
print_info "  Removendo arquivos de log..."
find . -maxdepth 1 -type f -name "*.log" -delete

# Arquivos temporários
find . -type f -name ".DS_Store" -delete

# Opcional: limpar uploads (descomente se quiser)
# if [ -d "uploads" ]; then
#     print_warning "  Removendo uploads/..."
#     rm -rf uploads/*
# fi

# Opcional: limpar banco de dados (descomente se quiser)
# if [ -f "chat.db" ]; then
#     print_warning "  Removendo chat.db..."
#     rm -f chat.db
# fi

cd "$BASE_DIR"
print_info "chat-server limpo!"
echo ""

# Limpar react-chat-app
clean_project "$BASE_DIR/react-chat-app" "react-chat-app"

# Limpeza adicional no diretório raiz
print_info "Limpando arquivos temporários no diretório raiz..."
cd "$BASE_DIR"

find . -maxdepth 1 -type f -name ".DS_Store" -delete
find . -maxdepth 1 -type f -name "*.log" -delete

print_info "Limpeza concluída!"
echo ""
print_info "Para reinstalar dependências, execute:"
echo "  cd agent-assist-widget && npm install"
echo "  cd chat-server && npm install"
echo "  cd react-chat-app && npm install"

