#!/bin/bash

# APOFlow AWS Terraform Setup Script
# Este script automatiza o setup inicial de credenciais e configuração

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${BLUE}╔═══════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ $1${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Função para setup AWS Credentials
setup_aws_credentials() {
    print_header "Setup AWS Credentials (~/.aws/credentials)"
    
    mkdir -p ~/.aws
    
    if [[ -f ~/.aws/credentials ]]; then
        print_warning "~/.aws/credentials já existe!"
        read -p "Deseja sobrescrever? (s/n): " -r
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            print_info "Pulando setup de credentials"
            return
        fi
    fi
    
    cp aws-credentials.example ~/.aws/credentials
    chmod 600 ~/.aws/credentials
    
    print_success "Arquivo criado: ~/.aws/credentials"
    print_warning "⚠️ IMPORTANTE: Edite com suas credenciais reais!"
    print_info "Execute: nano ~/.aws/credentials"
    
    read -p "Pressione ENTER quando terminar de editar..."
}

# Função para setup AWS Config
setup_aws_config() {
    print_header "Setup AWS Config (~/.aws/config)"
    
    mkdir -p ~/.aws
    
    if [[ -f ~/.aws/config ]]; then
        print_warning "~/.aws/config já existe!"
        print_info "Pulando setup de config"
        return
    fi
    
    cp aws-config.example ~/.aws/config
    chmod 644 ~/.aws/config
    
    print_success "Arquivo criado: ~/.aws/config"
}

# Função para setup SSH Key
setup_ssh_key() {
    print_header "Setup SSH Key (~/.ssh/apoflow-key.pem)"
    
    mkdir -p ~/.ssh
    
    if [[ -f ~/.ssh/apoflow-key.pem ]]; then
        print_warning "~/.ssh/apoflow-key.pem já existe!"
        read -p "Deseja sobrescrever? (s/n): " -r
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            print_info "Pulando setup de SSH key"
            return
        fi
    fi
    
    cp aws-ssh-key.pem.example ~/.ssh/apoflow-key.pem
    chmod 600 ~/.ssh/apoflow-key.pem
    
    print_success "Arquivo criado: ~/.ssh/apoflow-key.pem"
    print_warning "⚠️ IMPORTANTE: Esta é uma chave de teste!"
    print_info "Substitua pela sua chave real da AWS"
}

# Função para setup Terraform variables
setup_terraform_vars() {
    print_header "Setup Terraform Variables (terraform.tfvars)"
    
    if [[ -f terraform.tfvars ]]; then
        print_warning "terraform.tfvars já existe!"
        read -p "Deseja sobrescrever? (s/n): " -r
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            print_info "Pulando setup de terraform.tfvars"
            return
        fi
    fi
    
    cp terraform.tfvars.example terraform.tfvars
    
    print_success "Arquivo criado: terraform.tfvars"
    print_warning "⚠️ IMPORTANTE: Revise e customize conforme necessário!"
    print_info "Execute: nano terraform.tfvars"
    
    read -p "Pressione ENTER quando terminar de editar..."
}

# Função para setup Environment variables
setup_env_file() {
    print_header "Setup Environment Variables (.env)"
    
    if [[ -f .env ]]; then
        print_warning ".env já existe!"
        read -p "Deseja sobrescrever? (s/n): " -r
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            print_info "Pulando setup de .env"
            return
        fi
    fi
    
    cp .env.example .env
    
    print_success "Arquivo criado: .env"
    print_warning "⚠️ IMPORTANTE: Customize com seus valores!"
    print_info "Execute: nano .env"
    
    read -p "Pressione ENTER quando terminar de editar..."
}

# Função para validar setup
validate_setup() {
    print_header "Validando Setup"
    
    local errors=0
    
    # Verificar AWS credentials
    if [[ ! -f ~/.aws/credentials ]]; then
        print_error "~/.aws/credentials não encontrado"
        errors=$((errors + 1))
    else
        print_success "~/.aws/credentials ✓"
        
        # Testar credenciais
        if ! aws sts get-caller-identity &>/dev/null; then
            print_error "AWS credentials inválidas ou expiradas"
            errors=$((errors + 1))
        else
            print_success "AWS credentials válidas ✓"
        fi
    fi
    
    # Verificar SSH key
    if [[ ! -f ~/.ssh/apoflow-key.pem ]]; then
        print_error "~/.ssh/apoflow-key.pem não encontrado"
        errors=$((errors + 1))
    else
        print_success "~/.ssh/apoflow-key.pem ✓"
    fi
    
    # Verificar terraform.tfvars
    if [[ ! -f terraform.tfvars ]]; then
        print_error "terraform.tfvars não encontrado"
        errors=$((errors + 1))
    else
        print_success "terraform.tfvars ✓"
    fi
    
    # Verificar Terraform
    if ! command -v terraform &>/dev/null; then
        print_error "Terraform não está instalado"
        errors=$((errors + 1))
    else
        print_success "Terraform instalado ✓"
    fi
    
    if [[ $errors -eq 0 ]]; then
        print_success "\n✅ Setup validado com sucesso!"
        return 0
    else
        print_error "\n❌ $errors erro(s) encontrado(s)"
        return 1
    fi
}

# Função para testar Terraform
test_terraform() {
    print_header "Testando Terraform"
    
    if ! terraform validate; then
        print_error "Terraform validation falhou!"
        return 1
    fi
    
    print_success "Terraform validation passou ✓"
    
    read -p "Deseja ver terraform plan? (s/n): " -r
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        terraform plan
    fi
}

# Função para menu
show_menu() {
    echo ""
    echo "╔═══════════════════════════════════════╗"
    echo "║      APOFlow AWS Setup Menu           ║"
    echo "╚═══════════════════════════════════════╝"
    echo ""
    echo "1. Setup AWS Credentials (recomendado)"
    echo "2. Setup AWS Config"
    echo "3. Setup SSH Key"
    echo "4. Setup Terraform Variables (recomendado)"
    echo "5. Setup Environment Variables"
    echo "6. Setup TUDO (recomendado na 1ª vez)"
    echo "7. Validar Setup"
    echo "8. Testar Terraform"
    echo "9. Sair"
    echo ""
}

# Main Menu
main() {
    if [[ $# -eq 1 ]]; then
        case "$1" in
            all)
                setup_aws_credentials
                setup_aws_config
                setup_ssh_key
                setup_terraform_vars
                setup_env_file
                validate_setup
                ;;
            validate)
                validate_setup
                ;;
            *)
                print_error "Opção desconhecida: $1"
                echo "Uso: $0 [all|validate]"
                exit 1
                ;;
        esac
    else
        # Menu interativo
        while true; do
            show_menu
            read -p "Escolha uma opção (1-9): " -r option
            
            case $option in
                1) setup_aws_credentials ;;
                2) setup_aws_config ;;
                3) setup_ssh_key ;;
                4) setup_terraform_vars ;;
                5) setup_env_file ;;
                6)
                    setup_aws_credentials
                    setup_aws_config
                    setup_ssh_key
                    setup_terraform_vars
                    setup_env_file
                    validate_setup
                    ;;
                7) validate_setup ;;
                8) test_terraform ;;
                9)
                    print_info "Saindo..."
                    exit 0
                    ;;
                *)
                    print_error "Opção inválida!"
                    ;;
            esac
        done
    fi
}

# Executar
main "$@"
