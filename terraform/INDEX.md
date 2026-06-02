# 📑 Índice da Infraestrutura APOFlow AWS Terraform

## 🎯 Começar Aqui

👉 **[QUICKSTART.md](./QUICKSTART.md)** - 5 minutos para ter tudo rodando!  
👉 **[AWS_SETUP_QUICK.md](./AWS_SETUP_QUICK.md)** - Configurar credenciais AWS (3 min)

---

## 📚 Documentação por Tipo

### 🚀 Guias & Tutoriais

| Arquivo | Propósito | Tempo |
|---------|-----------|-------|
| [QUICKSTART.md](./QUICKSTART.md) | Começar em 5 minutos | 5 min |
| [AWS_SETUP_QUICK.md](./AWS_SETUP_QUICK.md) | Configurar credenciais AWS | 3 min |
| [AWS_CREDENTIALS_SETUP.md](./AWS_CREDENTIALS_SETUP.md) | Guia completo de credenciais | 5 min |
| [ELASTIC_IP.md](./ELASTIC_IP.md) | IP Fixo Permanente 🌐 | 5 min |
| [README.md](./README.md) | Documentação completa | 15 min |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Passo a passo detalhado | 30 min |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Entender a arquitetura | 10 min |
| [SECRETS.md](./SECRETS.md) | Gerenciar credenciais | 10 min |

### 📝 Código Terraform

| Arquivo | O quê | Responsável Por |
|---------|-------|-----------------|
| [main.tf](./main.tf) | Configuração principal | Provider AWS, Terraform config |
| [variables.tf](./variables.tf) | Definição de variáveis | Input variables customizáveis |
| [vpc.tf](./vpc.tf) | Networking | VPC, Subnets, Security Groups, IGW |
| [ec2.tf](./ec2.tf) | Servidor | EC2 Instance, IAM, Elastic IP |
| [rds.tf](./rds.tf) | Database | MongoDB DocumentDB, KMS, Backups |
| [outputs.tf](./outputs.tf) | Saídas | Valores para usar depois |
| [terraform.tfvars.example](./terraform.tfvars.example) | Exemplo de variáveis | Template de valores |

### 🔧 Scripts & Helpers

| Arquivo | Tipo | Uso |
|---------|------|-----|
| [terraform-helper.sh](./terraform-helper.sh) | Bash Script | `./terraform-helper.sh [command]` |
| [user_data.sh](./user_data.sh) | Bash Script | Executado na EC2 (auto) |

### 🔐 Configuração

| Arquivo | Propósito |
|---------|-----------|
| [.gitignore](./.gitignore) | Arquivos a ignorar no Git |
| [terraform.tfstate*](./terraform.tfstate*) | **NÃO COMMITAR** - Estado do Terraform |
| [terraform.tfvars](./terraform.tfvars) | **NÃO COMMITAR** - Seus valores reais |

---

## 🗂️ Estrutura Completa de Arquivos

```
terraform/
│
├── 📖 Documentação
│   ├── QUICKSTART.md          ⭐ Comece aqui
│   ├── AWS_SETUP_QUICK.md     ⚡ Setup AWS rápido
│   ├── AWS_CREDENTIALS_SETUP.md 🔐 Credenciais AWS
│   ├── ELASTIC_IP.md          🌐 IP Fixo Permanente
│   ├── README.md              📋 Documentação completa
│   ├── DEPLOYMENT_GUIDE.md    📋 Guia passo a passo
│   ├── ARCHITECTURE.md        📐 Diagrama & explicação
│   ├── SECRETS.md             🔒 Gerenciamento de credenciais
│   └── INDEX.md               📑 Este arquivo
│
├── 🏗️ Configuração Terraform
│   ├── main.tf                🔧 Config principal
│   ├── variables.tf           📝 Variáveis
│   ├── vpc.tf                 🌐 VPC & Networking
│   ├── ec2.tf                 🖥️ EC2 Instance
│   ├── rds.tf                 💾 Database
│   └── outputs.tf             📤 Outputs
│
├── 📋 Exemplo & Template
│   ├── terraform.tfvars.example      📋 Template Terraform variables
│   ├── aws-credentials.example        🔑 Template AWS CLI credentials
│   ├── aws-config.example             ⚙️ Template AWS CLI config
│   ├── aws-ssh-key.pem.example        🔐 Template SSH private key
│   └── .env.example                   📝 Template environment variables
│
├── 🔧 Scripts
│   ├── terraform-helper.sh       ⚙️ Helper script
│   └── user_data.sh              🚀 EC2 initialization
│
├── 🔐 Arquivo de Configuração
│   └── .gitignore                🔒 Ignorar arquivos sensíveis
│
└── 📦 Gerado pelo Terraform (ignore)
    ├── terraform.tfstate         ⚠️ NÃO COMMITAR
    ├── terraform.tfstate.backup  ⚠️ NÃO COMMITAR
    ├── .terraform/               ⚠️ Já em .gitignore
    └── .terraform.lock.hcl       ✅ Commitar (opcional)
```

---

## 🎯 Fluxo de Uso

### 1️⃣ **Primeira Vez** → Ler [QUICKSTART.md](./QUICKSTART.md)

```
1. Ler QUICKSTART.md (5 min)
2. Executar comandos de setup (2 min)
3. Fazer deploy com terraform (5-15 min)
4. Verificar outputs
```

### 2️⃣ **Entender a Arquitetura** → Ler [ARCHITECTURE.md](./ARCHITECTURE.md)

```
1. Ver diagrama gráfico
2. Entender data flow
3. Conhecer security layers
4. Planejar scaling
```

### 3️⃣ **Deploy Detalhado** → Ler [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

```
1. Pré-requisitos completos
2. Setup passo a passo
3. Deploy da aplicação
4. Troubleshooting
```

### 4️⃣ **Gerenciar Secrets** → Ler [SECRETS.md](./SECRETS.md)

```
1. Fornecer senhas ao Terraform
2. Usar AWS Secrets Manager
3. Melhores práticas de segurança
4. Rotação de credenciais
```

### 5️⃣ **Referência Completa** → Ler [README.md](./README.md)

```
1. Visão geral detalhada
2. Todos os componentes
3. Customizações possíveis
4. Troubleshooting
```

---

## 💻 Comandos Rápidos

### Via Script Helper (Recomendado)

```bash
chmod +x terraform-helper.sh

./terraform-helper.sh check          # Verificar dependências
./terraform-helper.sh init           # Inicializar Terraform
./terraform-helper.sh validate       # Validar configuração
./terraform-helper.sh plan           # Planejar deploy
./terraform-helper.sh apply          # Fazer deploy
./terraform-helper.sh outputs        # Ver informações
./terraform-helper.sh ssh            # SSH na EC2
./terraform-helper.sh creds          # Ver credenciais MongoDB
./terraform-helper.sh destroy        # Destruir infraestrutura
```

### Via Terraform Direto

```bash
terraform init                        # Inicializar
terraform validate                    # Validar
terraform plan                        # Planejar
terraform apply                       # Aplicar
terraform output                      # Ver outputs
terraform show                        # Status dos recursos
terraform destroy                     # Destruir
```

---

## 📊 Variáveis Principais

Editar em `terraform.tfvars`:

```hcl
# AWS
aws_region    = "us-east-1"
environment   = "production"

# VPC
vpc_cidr               = "10.0.0.0/16"
public_subnet_cidr     = "10.0.1.0/24"
private_subnet_cidr    = "10.0.2.0/24"
private_subnet_2_cidr  = "10.0.3.0/24"

# EC2
instance_type     = "t3.small"        # t3.micro, t3.small, t3.medium, ...
ec2_key_pair_name = "apoflow-key"

# RDS
db_instance_class       = "db.t3.small"   # Tamanho do banco
db_allocated_storage    = 100             # GB iniciais
db_max_allocated_storage = 200            # GB máximos
backup_retention_period = 7               # Dias de backup
enable_multi_az         = false           # Alta disponibilidade

# MongoDB
mongodb_username = "apoflowadmin"
# mongodb_password = (será solicitado interativamente)
```

---

## 🔐 Segurança

### Antes de Commitar

```bash
# ❌ NUNCA commitar:
terraform.tfvars          # Contém senhas!
terraform.tfstate*        # Contém credenciais!
.env                      # Contém secrets!
*.pem ou *.key           # Chaves privadas!

# ✅ Já em .gitignore:
git status
# Deve estar limpo, sem arquivos sensíveis
```

### Credenciais Seguras

```bash
# Usar Secrets Manager
aws secretsmanager get-secret-value --secret-id apoflow/mongodb/credentials

# Ou AWS CLI com credenciais do IAM
aws configure
export AWS_PROFILE=apoflow

# Rotar senhas regularmente
# Ver SECRETS.md para mais detalhes
```

---

## 🆘 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| "terraform not found" | `brew install terraform` ou instalador oficial |
| "Invalid credentials" | `aws configure` com credenciais corretas |
| "RDS taking forever" | Aguardar 10-15 min, é normal na primeira vez |
| "Cannot SSH" | Verificar security group e key permissions: `chmod 600 key.pem` |
| "MongoDB password rejected" | Usar senha sem caracteres especiais problemáticos |

---

## 📈 Customizações Comuns

### Alterar Tamanho da Instância EC2

```hcl
# Em terraform.tfvars
instance_type = "t3.medium"  # Mais poderosa (mais cara)
```

### Habilitar Multi-AZ (Alta Disponibilidade)

```hcl
# Em terraform.tfvars
enable_multi_az = true
```

### Alterar Região AWS

```hcl
# Em terraform.tfvars
aws_region = "eu-west-1"
```

### Aumentar Backup Retention

```hcl
# Em terraform.tfvars
backup_retention_period = 30  # 30 dias ao invés de 7
```

---

## 🚀 Próximas Melhorias

- [ ] Adicionar Application Load Balancer
- [ ] Implementar Auto Scaling
- [ ] Configurar SSL/TLS com ACM
- [ ] Setup CI/CD com GitHub Actions
- [ ] Monitoramento com DataDog
- [ ] Read replicas para RDS
- [ ] ElastiCache para caching
- [ ] Cross-region replication

---

## 📞 Referências & Links

### Documentação Oficial
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS DocumentDB](https://docs.aws.amazon.com/documentdb/)
- [AWS VPC](https://docs.aws.amazon.com/vpc/)
- [Docker Compose](https://docs.docker.com/compose/)

### Ferramentas Úteis
- [AWS Console](https://console.aws.amazon.com/)
- [Terraform Cloud](https://app.terraform.io/)
- [AWS CLI](https://aws.amazon.com/cli/)

### Community & Suporte
- [Terraform Community](https://discuss.hashicorp.com/c/terraform/)
- [AWS Forums](https://forums.aws.amazon.com/)
- [Stack Overflow - terraform tag](https://stackoverflow.com/questions/tagged/terraform)

---

## 📝 Changelog

| Data | Versão | Mudanças |
|------|--------|----------|
| 2026-05-13 | 1.0 | Inicial - Infraestrutura completa |
| | | - VPC, EC2, RDS |
| | | - Security Groups & KMS |
| | | - Documentação completa |

---

## ✅ Checklist Pré-Deploy

```
Dependências:
☐ Terraform instalado (v1.0+)
☐ AWS CLI instalado (v2+)
☐ Credentials AWS configuradas
☐ SSH key pair criada

Configuração:
☐ terraform.tfvars criado e preenchido
☐ Senhas fortes geradas
☐ VPC CIDR reviado
☐ Instance types definidos

Segurança:
☐ .gitignore presente
☐ terraform.tfstate em .gitignore
☐ .env em .gitignore
☐ Permissões de arquivo corretas (600 para sensíveis)

Terraform:
☐ terraform init executado
☐ terraform validate passou
☐ terraform plan revisado
☐ Pronto para terraform apply
```

---

**Última atualização**: 2026-05-13  
**Versão**: 1.0  
**Status**: ✅ Pronto para Produção

Para começar: 👉 [QUICKSTART.md](./QUICKSTART.md)
