# ⚡ APOFlow AWS Terraform - Quick Start

## 📦 O que foi criado?

Uma **infraestrutura completa de produção** para rodar APOFlow na AWS com:

- ✅ **VPC APOFlow**: Rede isolada (10.0.0.0/16)
- ✅ **EC2 Ubuntu**: Servidor com Docker (t3.small)
- ✅ **Elastic IP**: IP público **fixo e permanente** 🌐 (nunca muda!)
- ✅ **RDS MongoDB**: Database DocumentDB criptografado (100GB)
- ✅ **Security Groups**: Firewall e isolamento de tráfego
- ✅ **Secrets Manager**: Armazenamento seguro de credenciais
- ✅ **KMS**: Criptografia de dados em repouso
- ✅ **CloudWatch**: Logs e monitoramento

---

## 🚀 Começar em 5 minutos

### 1️⃣ Pré-requisitos (2 min)

```bash
# Instalar Terraform
brew install terraform          # macOS
# OU apt install terraform      # Linux

# Instalar AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configurar AWS
aws configure
# Forneça: Access Key ID, Secret Access Key, Region: us-east-1, Format: json

# Criar SSH Key
aws ec2 create-key-pair --key-name apoflow-key \
  --query 'KeyMaterial' --output text > apoflow-key.pem
chmod 600 apoflow-key.pem
```

### 2️⃣ Configurar Terraform (1 min)

```bash
cd /workspaces/APOFlow/terraform

# Preparar variáveis
cp terraform.tfvars.example terraform.tfvars

# Verificar a AWS region e outras opções (opcional)
# nano terraform.tfvars
```

### 3️⃣ Deploy (2 min)

```bash
# Inicializar
terraform init

# Validar
terraform validate

# Deploy! (será pedida senha do MongoDB)
terraform apply

# Quando pedir, digitar senha forte:
# Ex: ApOflowMongo2024!SecurePassword123
```

---

## 📋 Usar Script Helper (Recomendado)

```bash
# Tornar executável
chmod +x terraform-helper.sh

# Verificar tudo
./terraform-helper.sh check

# Fazer deploy
./terraform-helper.sh apply

# Ver IP e informações
./terraform-helper.sh outputs

# SSH na EC2
./terraform-helper.sh ssh
```

---

## 🔑 Recuperar Informações

```bash
# Via script helper
./terraform-helper.sh outputs

# OU via terraform direto
terraform output ec2_public_ip
terraform output mongodb_endpoint
terraform output secrets_manager_secret_name
```

---

## 🖥️ SSH na EC2

```bash
# Via script helper
EC2_KEY_PATH="./apoflow-key.pem" ./terraform-helper.sh ssh

# OU manualmente
EC2_IP=$(terraform output -raw ec2_public_ip)
ssh -i apoflow-key.pem ubuntu@$EC2_IP
```

---

## 🐳 Deploy da Aplicação (na EC2)

```bash
# Conectado na EC2
cd /opt/apoflow

# 1. Atualizar .env com credenciais reais
nano .env

# 2. Clonar/copiar código APOFlow
# (requer que Backend/ e Frontend/ estejam lá)

# 3. Deploy
./deploy.sh

# 4. Verificar status
docker-compose ps
docker-compose logs -f backend
```

---

## 📊 URLs & Acessos

```bash
# Frontend (depois de fazer deploy)
http://<EC2_PUBLIC_IP>

# Backend API (direto)
http://<EC2_PUBLIC_IP>/api/

# SSH
ssh -i apoflow-key.pem ubuntu@<EC2_PUBLIC_IP>

# MongoDB Connection String (do Secrets Manager)
mongodb://apoflowadmin:PASSWORD@<RDS_HOST>:27017/apoflow?ssl=true
```

---

## 💾 Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `main.tf` | Configuração principal do Terraform |
| `variables.tf` | Variáveis customizáveis |
| `vpc.tf` | VPC, Subnets, Security Groups |
| `ec2.tf` | EC2 e configurações |
| `rds.tf` | RDS MongoDB |
| `outputs.tf` | Informações de saída |
| `user_data.sh` | Script executado ao iniciar EC2 |
| `terraform.tfvars` | **Seus valores (NÃO COMMITAR)** |
| `terraform.tfstate*` | **Estado do Terraform (NÃO COMMITAR)** |

---

## 🛑 Destruir Tudo

```bash
# Se precisar parar (para economizar custos)
terraform destroy

# Responder "yes" quando solicitado
```

---

## 📚 Documentação Completa

- 📖 [README.md](./README.md) - Documentação detalhada
- 📋 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guia passo a passo
- 🔒 [SECRETS.md](./SECRETS.md) - Gerenciamento de credenciais
- 📐 [ARCHITECTURE.md](./ARCHITECTURE.md) - Diagrama da arquitetura

---

## ⚠️ Cuidados Importantes

```bash
# NÃO COMMITAR:
❌ terraform.tfvars (com senhas)
❌ terraform.tfstate (com credenciais)
❌ .env (com senhas)
❌ apoflow-key.pem (chave privada)

# Arquivos já no .gitignore:
✅ *.tfstate*
✅ terraform.tfvars
✅ .env
✅ *.key, *.pem
```

---

## 💡 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| "terraform: command not found" | Instalar terraform: `brew install terraform` |
| "InvalidKeyPair.NotFound" | Criar key: `aws ec2 create-key-pair --key-name apoflow-key` |
| "Error: error reading S3 Backend" | Remover state: `rm terraform.tfstate*` |
| "RDS taking too long" | Aguardar 10-15 minutos é normal |
| "Cannot connect to EC2" | Verificar security group e IP elástico |
| "Containers not starting" | Verificar `.env` com credenciais corretas |

---

## 🎯 Próximos Passos

1. ✅ Deploy infraestrutura (você está aqui!)
2. ⏭️ Clonar repositório APOFlow na EC2
3. ⏭️ Configurar domínio + SSL
4. ⏭️ Setup CI/CD (GitHub Actions)
5. ⏭️ Monitoramento avançado
6. ⏭️ Auto-scaling & Load balancer

---

## 📞 Suporte

- **AWS Console**: https://console.aws.amazon.com/
- **Terraform Docs**: https://www.terraform.io/docs
- **Issues**: https://github.com/JP18090/APOFlow/issues

---

**Status**: ✅ Pronto para produção!

Qualquer dúvida, consulte `DEPLOYMENT_GUIDE.md` para instruções detalhadas.
