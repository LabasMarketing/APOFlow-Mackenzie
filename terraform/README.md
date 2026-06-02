# APOFlow AWS Terraform Infrastructure

Infraestrutura completa na AWS para rodar o APOFlow em produção com Docker, EC2, VPC, e MongoDB RDS.

## 📋 Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS Account (us-east-1)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          VPC APOFlow (10.0.0.0/16)                   │   │
│  │                                                      │   │
│  │  ┌────────────────────────┐   ┌────────────────┐   │   │
│  │  │  Public Subnet         │   │ Private Subnets│   │   │
│  │  │  (10.0.1.0/24)         │   │ (10.0.2.0/24)  │   │   │
│  │  │                        │   │ (10.0.3.0/24)  │   │   │
│  │  │  ┌────────────────┐   │   │                │   │   │
│  │  │  │  EC2 Instance │   │   │  ┌──────────┐ │   │   │
│  │  │  │  (APOFlow)    │   │   │  │RDS MongoDB│ │   │   │
│  │  │  │               │   │   │  │(DocumentDB)    │   │   │
│  │  │  │ - Docker      │   │   │  │(Encrypted)     │   │   │
│  │  │  │ - Backend     │   │   │  └──────────┘ │   │   │
│  │  │  │ - Frontend    │   │   │                │   │   │
│  │  │  └────────────────┘   │   │                │   │   │
│  │  │                        │   │                │   │   │
│  │  └────────────────────────┘   └────────────────┘   │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │        Internet Gateway                      │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  AWS Secrets Manager: Credenciais MongoDB                   │
│  CloudWatch Logs: Monitoramento                             │
│  KMS: Criptografia de dados                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Componentes Criados

### VPC & Networking
- **VPC APOFlow**: 10.0.0.0/16
- **Public Subnet**: 10.0.1.0/24 (para EC2)
- **Private Subnets**: 10.0.2.0/24 e 10.0.3.0/24 (para RDS)
- **Internet Gateway**: Acesso à internet
- **Security Groups**:
  - EC2: Permite SSH (22), HTTP (80), HTTPS (443)
  - RDS: Permite MongoDB (27017) apenas da EC2

### EC2
- **Instância**: t3.small (customizável)
- **AMI**: Ubuntu 22.04 LTS
- **Volume**: 20GB GP3 (criptografado)
- **User Data**: Instala Docker, Docker Compose, e prepara ambiente
- **Elastic IP**: ✅ IP público **fixo e permanente** (apoflow-eip)
  - Mesmo IP após reinicializações
  - Gratuito enquanto em uso
  - Nunca muda!
- **IAM Role**: Permissões para CloudWatch e Secrets Manager

### RDS MongoDB (DocumentDB)
- **Engine**: DocumentDB 4.0.0
- **Classe**: db.t3.small (customizável)
- **Storage**: 100GB (até 200GB com auto-scaling)
- **Criptografia**: KMS encryption habilitada
- **Backups**: 7 dias de retenção
- **CloudWatch Logs**: Audit, error, general, slowquery
- **Secrets Manager**: Credenciais armazenadas seguramente

## 📦 Arquivos Terraform

```
terraform/
├── main.tf                      # Configuração principal do Terraform
├── variables.tf                 # Definição de variáveis
├── vpc.tf                       # VPC, Subnets, Security Groups
├── ec2.tf                       # Instância EC2 e configurações
├── rds.tf                       # RDS MongoDB e Secrets Manager
├── outputs.tf                   # Outputs para uso posterior
├── terraform.tfvars.example     # Exemplo de valores de variáveis
├── user_data.sh                 # Script de inicialização da EC2
└── README.md                    # Este arquivo
```

## 🚀 Como Usar

### Pré-requisitos

1. **AWS CLI configurado**:
```bash
aws configure
# Fornece: AWS Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)
```

2. **Terraform instalado** (v1.0+):
```bash
terraform version
```

3. **SSH Key Pair criado** na AWS (console ou CLI):
```bash
aws ec2 create-key-pair --key-name apoflow-key --query 'KeyMaterial' --output text > apoflow-key.pem
chmod 600 apoflow-key.pem
```

### Instalação

1. **Clonar ou navegar para diretório do Terraform**:
```bash
cd /workspaces/APOFlow/terraform
```

2. **Criar arquivo de variáveis**:
```bash
# Copiar do exemplo
cp terraform.tfvars.example terraform.tfvars

# Editar com seus valores
nano terraform.tfvars
```

3. **Inicializar Terraform**:
```bash
terraform init
```

4. **Validar configuração**:
```bash
terraform validate
```

5. **Visualizar plano**:
```bash
terraform plan
```

6. **Aplicar infraestrutura**:
```bash
# Com senha interativa
terraform apply

# OU com variável inline
terraform apply -var="mongodb_password=SenhaForteAqui123!"

# OU com arquivo de variáveis
terraform apply -var-file="terraform.tfvars"
```

### Pós-Deploy

1. **Obter outputs**:
```bash
terraform output
# ou
terraform output ec2_public_ip
```

2. **Conectar na EC2**:
```bash
SSH_KEY="path/to/apoflow-key.pem"
EC2_IP=$(terraform output -raw ec2_public_ip)
ssh -i $SSH_KEY ubuntu@$EC2_IP
```

3. **Preparar ambiente na EC2**:
```bash
cd /opt/apoflow

# Editar arquivo .env com valores reais
nano .env

# Editar docker-compose.yml se necessário
nano docker-compose.yml

# Fazer deploy (requer código clonado)
./deploy.sh
```

4. **Recuperar credenciais MongoDB** do Secrets Manager:
```bash
aws secretsmanager get-secret-value \
  --secret-id apoflow/mongodb/credentials \
  --region us-east-1
```

## 🔧 Variáveis Customizáveis

### Principais em `terraform.tfvars`:

```hcl
aws_region    = "us-east-1"          # Região AWS
environment   = "production"         # Ambiente

# VPC
vpc_cidr               = "10.0.0.0/16"
public_subnet_cidr     = "10.0.1.0/24"
private_subnet_cidr    = "10.0.2.0/24"
private_subnet_2_cidr  = "10.0.3.0/24"

# EC2
instance_type       = "t3.small"     # t3.micro, t3.small, t3.medium, etc
ec2_key_pair_name   = "apoflow-key"

# RDS
db_allocated_storage    = 100         # GB inicial
db_max_allocated_storage = 200        # GB máximo (auto-scaling)
db_instance_class       = "db.t3.small" # db.t3.micro, db.t3.small, db.t3.medium, etc
backup_retention_period = 7           # Dias
enable_multi_az         = false        # true para alta disponibilidade

# MongoDB
mongodb_username = "apoflowadmin"
# mongodb_password  (passar via linha de comando ou arquivo seguro)
```

## 🛡️ Segurança

- ✅ **VPC Privada**: RDS em subnets privadas, sem acesso público
- ✅ **Criptografia**: Dados do RDS criptografados com KMS
- ✅ **Secrets Manager**: Credenciais armazenadas seguramente
- ✅ **Security Groups**: Isolamento de tráfego
- ✅ **IAM**: EC2 com permissões mínimas necessárias
- ✅ **SSL/TLS**: DocumentDB com SSL habilitado
- ✅ **Backups**: Retenção automática de backups

## 📊 Custos Estimados (por mês)

| Recurso | Instância | Custo |
|---------|-----------|-------|
| EC2 | t3.small | ~$10 |
| RDS | db.t3.small | ~$50 |
| Storage (EC2) | 20GB | ~$2 |
| Storage (RDS) | 100GB | ~$10 |
| Data Transfer | - | ~$5 |
| **Total** | - | **~$77** |

*Preços aproximados para us-east-1 (consulte AWS Pricing para valores atuais)*

## 🔄 Gerenciamento

### Destruir Infraestrutura
```bash
terraform destroy
```

### Reconstruir com Novo State
```bash
terraform destroy
rm terraform.tfstate*
terraform init
terraform apply
```

### Backup do State
```bash
cp terraform.tfstate terraform.tfstate.backup
```

### Ver Recursos Criados
```bash
terraform show
```

## 🐛 Troubleshooting

### Erro: "InvalidKeyPair.NotFound"
- A key pair "apoflow-key" não existe na AWS
- Solução: Criar key pair ou alterar nome em `variables.tf`

### Erro: "Service is not available"
- RDS levando tempo para ficar disponível (5-10 minutos)
- Solução: Aguardar e tentar novamente

### Erro: "terraform: No such file or directory"
- Terraform não está no PATH
- Solução: Instalar Terraform globalmente

### Erro: "InvalidAMI.NotFound"
- AMI do Ubuntu não existe na região
- Solução: Alterar `aws_region` em `variables.tf`

## 📚 Referências

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS DocumentDB](https://docs.aws.amazon.com/documentdb/)
- [AWS EC2](https://docs.aws.amazon.com/ec2/)
- [Docker Compose](https://docs.docker.com/compose/)

## 📝 Próximos Passos

1. Clonar repositório APOFlow na EC2
2. Configurar GitHub Actions ou GitLab CI/CD
3. Adicionar Load Balancer para alta disponibilidade
4. Configurar Domain Name (Route 53)
5. Adicionar SSL/TLS com ACM
6. Configurar CloudFront para CDN
7. Monitoramento com CloudWatch dashboards

## 🤝 Suporte

Para dúvidas ou problemas, abra uma issue no repositório do APOFlow.
