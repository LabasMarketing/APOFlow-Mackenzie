# 🔒 Secrets & Environment Variables Guide

Este documento explica como gerenciar de forma segura as credenciais e variáveis de ambiente do APOFlow.

## 📋 Índice

1. [Overview](#overview)
2. [Terraform Secrets](#terraform-secrets)
3. [AWS Secrets Manager](#aws-secrets-manager)
4. [EC2 Environment Variables](#ec2-environment-variables)
5. [Docker Secrets](#docker-secrets)
6. [Melhores Práticas](#melhores-práticas)

---

## Overview

A aplicação APOFlow trabalha com múltiplas camadas de secrets:

```
Terraform
    ↓ (providers access key)
    ↓ (mongodb password)
AWS
    ↓
EC2 (application runs here)
    ↓ (.env file)
    ↓ (docker-compose.yml)
    ↓
Containers (backend, frontend, nginx)
```

---

## 🔑 Terraform Secrets

### Variáveis Sensíveis

As seguintes variáveis são marcadas como `sensitive = true`:

```hcl
variable "mongodb_username" {
  sensitive = true
}

variable "mongodb_password" {
  sensitive = true
}
```

Estas não aparecem em output do terminal.

### Fornecer Senha do MongoDB

#### Opção 1: Interactivo (Recomendado)
```bash
terraform apply
# Será solicitado: var.mongodb_password
# Digite a senha quando solicitado
```

#### Opção 2: Linha de Comando
```bash
terraform apply -var="mongodb_password=SenhaForte123!"
```

#### Opção 3: Arquivo de Variáveis (Não Seguro!)
```bash
# terraform.tfvars (NÃO COMMITAR!)
mongodb_password = "SenhaForte123!"

# Aplicar
terraform apply
```

#### Opção 4: Variável de Ambiente
```bash
export TF_VAR_mongodb_password="SenhaForte123!"
terraform apply

# Ou em uma linha
TF_VAR_mongodb_password="SenhaForte123!" terraform apply
```

### Proteger Arquivo de State

O `terraform.tfstate` contém informações sensíveis:

```bash
# Fazer backup seguro
cp terraform.tfstate terraform.tfstate.backup
chmod 600 terraform.tfstate terraform.tfstate.backup

# Usar S3 Remote State (Recomendado):
# Descomentar em main.tf:
# backend "s3" {
#   bucket         = "apoflow-terraform-state"
#   key            = "prod/terraform.tfstate"
#   region         = "us-east-1"
#   encrypt        = true
# }

# Depois:
terraform init
```

---

## 🔐 AWS Secrets Manager

### Recuperar Credenciais MongoDB

As credenciais são automaticamente armazenadas no AWS Secrets Manager:

```bash
# Ver nome do secret
terraform output secrets_manager_secret_name
# Output: apoflow/mongodb/credentials

# Recuperar credenciais (via AWS CLI)
aws secretsmanager get-secret-value \
  --secret-id apoflow/mongodb/credentials \
  --region us-east-1

# Output: JSON com todas as credenciais
{
  "username": "apoflowadmin",
  "password": "...",
  "engine": "docdb",
  "host": "apoflow-mongodb.xxxx.us-east-1.rds.amazonaws.com",
  "port": 27017,
  "dbname": "apoflow",
  "connection_string": "mongodb://..."
}
```

### Usar Secrets Manager na EC2

```bash
# Na EC2, instalar AWS CLI
sudo apt-get install awscli

# Recuperar secret
aws secretsmanager get-secret-value \
  --secret-id apoflow/mongodb/credentials \
  --query SecretString \
  --output text | jq '.'

# Usar em script
DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id apoflow/mongodb/credentials \
  --query 'SecretString | fromjson.password' \
  --output text)
```

### Rotação de Senhas

```bash
# Atualizar senha no Secrets Manager
aws secretsmanager update-secret \
  --secret-id apoflow/mongodb/credentials \
  --secret-string '{
    "username": "apoflowadmin",
    "password": "NovaSenha123!",
    ...
  }'

# Atualizar senha no RDS também
aws rds modify-db-instance \
  --db-instance-identifier apoflow-mongodb \
  --master-user-password NovaSenha123! \
  --apply-immediately
```

---

## 🖥️ EC2 Environment Variables

### Arquivo .env

Localizado em `/opt/apoflow/.env`:

```bash
# MongoDB
MONGODB_HOST=apoflow-mongodb.xxxx.us-east-1.rds.amazonaws.com
MONGODB_PORT=27017
MONGODB_USER=apoflowadmin
MONGODB_PASSWORD=SenhaForte123!
MONGODB_DATABASE=apoflow

# Backend
BACKEND_PORT=8080
BACKEND_PROFILE=prod
SPRING_PROFILES_ACTIVE=prod

# Frontend
FRONTEND_PORT=3000

# JWT
JWT_SECRET=32CharacterSecretKeyGeneratedByOpenSSL!
JWT_EXPIRATION=86400

# Logging
LOG_LEVEL=info

# Email (se aplicável)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=noreply@apoflow.com
MAIL_PASSWORD=SenhaDeAplicacao123!

# Tracking/Analytics (opcional)
ANALYTICS_ID=UA-XXXX-X
SENTRY_DSN=https://...@sentry.io/...
```

### Proteger .env

```bash
# Na EC2
chmod 600 /opt/apoflow/.env
sudo chown root:root /opt/apoflow/.env

# Verificar permissões
ls -la /opt/apoflow/.env
# Output: -rw------- root root
```

### Gerar Secrets Fortes

```bash
# JWT_SECRET
openssl rand -hex 32

# Senha MongoDB
openssl rand -base64 32

# API Keys
openssl rand -hex 16

# HMAC Secret
openssl rand -hex 64
```

---

## 🐳 Docker Secrets

### Docker Compose com Secrets

Arquivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    environment:
      MONGODB_URI: mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:27017/${MONGODB_DATABASE}
      JWT_SECRET: ${JWT_SECRET}
      LOG_LEVEL: ${LOG_LEVEL}
    env_file:
      - .env
```

### Usar .env no Docker Compose

```bash
# Na EC2
cd /opt/apoflow

# Docker Compose lê automaticamente .env
docker-compose up -d

# Verificar se variáveis foram aplicadas
docker-compose config

# Ver variáveis num container
docker exec apoflow-backend env | grep MONGODB
```

### Secrets Seguros (Swarm Mode)

Se usar Docker Swarm:

```bash
# Criar secret
echo "SenhaForte123!" | docker secret create mongodb_password -

# Usar no compose (stack mode)
# services:
#   backend:
#     secrets:
#       - mongodb_password
# 
# secrets:
#   mongodb_password:
#     external: true
```

---

## 🛡️ Melhores Práticas

### ✅ Fazer

- ✅ **Use AWS Secrets Manager** para armazenar credenciais
- ✅ **Gire senhas regularmente** (a cada 90 dias)
- ✅ **Use HTTPS** para todas as comunicações
- ✅ **Mantenha .env local** (nunca commitar)
- ✅ **Use variáveis de ambiente** em vez de hardcode
- ✅ **Implemente logging seguro** (sem exposição de secrets)
- ✅ **Faça audit de accesso** a secrets
- ✅ **Use IAM policies** para limitar acesso

### ❌ Não Fazer

- ❌ **Não commite** arquivo .env ou terraform.tfvars
- ❌ **Não exiba secrets** em logs ou output
- ❌ **Não use senhas fracas** (mínimo 32 caracteres)
- ❌ **Não compartilhe** credenciais via email/Slack
- ❌ **Não hardcode** secrets no código
- ❌ **Não deixe RDS público** (sempre privado na VPC)
- ❌ **Não reutilize** senhas em diferentes sistemas

### 📋 Checklist de Segurança

```bash
# Antes de fazer deploy para produção:

# 1. Verificar que .env não está commitado
git status
# Deve mostrar .env como ignorado

# 2. Verificar .gitignore
cat .gitignore | grep -E '\.env|tfvars'

# 3. Verificar permissões do arquivo .env
ls -la /opt/apoflow/.env
# Deve ser: -rw------- ou -rw-r-----

# 4. Verificar terraform.tfstate
ls -la terraform.tfstate*
# Deve estar em .gitignore

# 5. Testar Secrets Manager
aws secretsmanager get-secret-value --secret-id apoflow/mongodb/credentials

# 6. Testar conexão com RDS
mongosh "mongodb://user:pass@host:27017/apoflow?ssl=true"

# 7. Verificar logs (sem exposição de secrets)
docker-compose logs | grep -i error

# 8. Verificar security groups
aws ec2 describe-security-groups --group-names apoflow-rds-sg
# RDS deve permitir apenas porta 27017 do SG da EC2
```

---

## 🔄 Workflow de Secrets

### Inicial (Setup)

```
1. Gerar senha forte
   ↓
2. Fornecedor ao Terraform (interactivo)
   ↓
3. Terraform armazena em Secrets Manager
   ↓
4. EC2 lê de Secrets Manager via AWS CLI
   ↓
5. Aplicação usa via .env
```

### Rotina (Rotation)

```
1. Gerar nova senha
   ↓
2. Atualizar em Secrets Manager
   ↓
3. Atualizar RDS
   ↓
4. Atualizar .env na EC2
   ↓
5. Reiniciar containers
```

### Emergência (Comprometimento)

```
1. Gerar senha IMEDIATAMENTE
   ↓
2. Rotacioná-la em Secrets Manager
   ↓
3. Revogar antiga token/chaves
   ↓
4. Atualizar RDS
   ↓
5. Restart de tudo
   ↓
6. Investigar logs para detect acesso não-autorizado
```

---

## 📚 Referências

- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [Terraform Sensitive Variables](https://www.terraform.io/language/values/variables#sensitive)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)

---

**Última atualização**: 2026-05-13
