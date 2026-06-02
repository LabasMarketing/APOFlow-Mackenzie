#!/bin/bash

# APOFlow Terraform Helper Script
# Facilita operações comuns com Terraform

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de helper
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

# Verificar se Terraform está instalado
check_terraform() {
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform não está instalado!"
        exit 1
    fi
    print_success "Terraform encontrado: $(terraform version | head -n 1)"
}

# Verificar se AWS CLI está configurado
check_aws() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI não está instalado!"
        exit 1
    fi
    print_success "AWS CLI encontrado: $(aws --version | cut -d' ' -f1,2)"
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI não está configurado corretamente!"
        exit 1
    fi
    print_success "AWS credenciais válidas"
}

# Inicializar Terraform
init() {
    print_header "Inicializando Terraform"
    terraform init
    print_success "Terraform inicializado com sucesso!"
}

# Validar configuração
validate() {
    print_header "Validando Configuração Terraform"
    terraform validate
    print_success "Configuração válida!"
}

# Planejar deployment
plan() {
    print_header "Planejando Deployment"
    
    if [[ -z "$MONGODB_PASSWORD" ]]; then
        print_warning "MONGODB_PASSWORD não definido. Será solicitado interativamente."
        terraform plan -out=tfplan
    else
        terraform plan -var="mongodb_password=$MONGODB_PASSWORD" -out=tfplan
    fi
    
    print_success "Plano salvo em tfplan"
    print_info "Execute 'apply' para aplicar as mudanças"
}

# Aplicar deployment
apply() {
    print_header "Aplicando Terraform"
    
    if [[ -f "tfplan" ]]; then
        terraform apply tfplan
    else
        if [[ -z "$MONGODB_PASSWORD" ]]; then
            print_warning "MONGODB_PASSWORD não definido. Será solicitado interativamente."
            terraform apply
        else
            terraform apply -var="mongodb_password=$MONGODB_PASSWORD" -auto-approve
        fi
    fi
    
    print_success "Infraestrutura aplicada com sucesso!"
    print_info "Execute 'show-outputs' para ver informações de conexão"
}

# Destruir infraestrutura
destroy() {
    print_header "Destruindo Infraestrutura"
    
    read -p "Tem certeza que deseja destruir a infraestrutura? (sim/nao): " -r
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        if [[ -z "$MONGODB_PASSWORD" ]]; then
            terraform destroy
        else
            terraform destroy -var="mongodb_password=$MONGODB_PASSWORD" -auto-approve
        fi
        print_success "Infraestrutura destruída!"
    else
        print_info "Operação cancelada."
    fi
}

# Mostrar outputs
show_outputs() {
    print_header "Informações de Conexão e Configuração"
    
    if terraform output -json &> /dev/null; then
        terraform output
    else
        print_warning "Nenhum output disponível. Execute 'apply' primeiro."
    fi
}

# Conectar à EC2 via SSH
ssh_ec2() {
    print_header "Conectando à EC2"
    
    if [[ -z "$EC2_KEY_PATH" ]]; then
        read -p "Caminho para a chave SSH (ex: ./apoflow-key.pem): " EC2_KEY_PATH
    fi
    
    if [[ ! -f "$EC2_KEY_PATH" ]]; then
        print_error "Arquivo de chave não encontrado: $EC2_KEY_PATH"
        exit 1
    fi
    
    EC2_IP=$(terraform output -raw ec2_public_ip 2>/dev/null || echo "")
    
    if [[ -z "$EC2_IP" ]]; then
        print_error "Não foi possível obter IP da EC2. Execute 'apply' primeiro."
        exit 1
    fi
    
    chmod 600 "$EC2_KEY_PATH"
    print_info "Conectando a $EC2_IP..."
    ssh -i "$EC2_KEY_PATH" ubuntu@"$EC2_IP"
}

# Obter credenciais MongoDB do Secrets Manager
get_mongodb_credentials() {
    print_header "Obtendo Credenciais MongoDB"
    
    SECRET_NAME=$(terraform output -raw secrets_manager_secret_name 2>/dev/null || echo "")
    REGION=$(grep "aws_region" terraform.tfvars 2>/dev/null | cut -d'"' -f2 || echo "us-east-1")
    
    if [[ -z "$SECRET_NAME" ]]; then
        print_error "Não foi possível obter nome do secret. Execute 'apply' primeiro."
        exit 1
    fi
    
    print_info "Recuperando secret do AWS Secrets Manager..."
    aws secretsmanager get-secret-value \
        --secret-id "$SECRET_NAME" \
        --region "$REGION" \
        --query SecretString \
        --output text | jq '.'
}

# Monitorar logs da EC2
tail_logs() {
    print_header "Logs da EC2"
    
    EC2_IP=$(terraform output -raw ec2_public_ip 2>/dev/null || echo "")
    
    if [[ -z "$EC2_IP" ]]; then
        print_error "Não foi possível obter IP da EC2."
        exit 1
    fi
    
    read -p "Caminho para a chave SSH: " EC2_KEY_PATH
    
    if [[ ! -f "$EC2_KEY_PATH" ]]; then
        print_error "Arquivo de chave não encontrado: $EC2_KEY_PATH"
        exit 1
    fi
    
    chmod 600 "$EC2_KEY_PATH"
    ssh -i "$EC2_KEY_PATH" ubuntu@"$EC2_IP" "sudo tail -f /opt/apoflow/logs/application.log"
}

# Status dos recursos
status() {
    print_header "Status dos Recursos AWS"
    
    terraform show
}

# Help
show_help() {
    cat << 'EOF'

╔═══════════════════════════════════════╗
║   APOFlow Terraform Helper Script     ║
╚═══════════════════════════════════════╝

Comandos disponíveis:

  init                  - Inicializar Terraform
  validate              - Validar configuração
  plan                  - Planejar deployment
  apply                 - Aplicar deployment
  destroy               - Destruir infraestrutura
  outputs               - Mostrar informações de conexão
  ssh                   - Conectar à EC2 via SSH
  creds                 - Obter credenciais MongoDB
  logs                  - Ver logs da EC2
  status                - Status dos recursos
  check                 - Verificar dependências
  help                  - Mostrar esta mensagem

Exemplos:

  ./terraform-helper.sh init
  ./terraform-helper.sh validate
  ./terraform-helper.sh plan
  ./terraform-helper.sh apply
  
  # Com variáveis de ambiente
  MONGODB_PASSWORD="senha123" ./terraform-helper.sh apply
  EC2_KEY_PATH="./apoflow-key.pem" ./terraform-helper.sh ssh

EOF
}

# Verificar todas as dependências
check() {
    print_header "Verificando Dependências"
    check_terraform
    check_aws
    print_success "Todas as dependências estão ok!"
}

# Main
main() {
    case "${1:-help}" in
        init)
            check_terraform && init
            ;;
        validate)
            check_terraform && validate
            ;;
        plan)
            check_terraform && check_aws && plan
            ;;
        apply)
            check_terraform && check_aws && apply
            ;;
        destroy)
            check_terraform && check_aws && destroy
            ;;
        outputs)
            show_outputs
            ;;
        ssh)
            ssh_ec2
            ;;
        creds)
            get_mongodb_credentials
            ;;
        logs)
            tail_logs
            ;;
        status)
            status
            ;;
        check)
            check
            ;;
        help)
            show_help
            ;;
        *)
            print_error "Comando desconhecido: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
