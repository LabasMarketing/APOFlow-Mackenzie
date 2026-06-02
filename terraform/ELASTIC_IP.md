# 🌐 Elastic IP - IP Fixo Permanente

## O que é Elastic IP?

**Elastic IP** é um endereço IPv4 público **estático** que permanece o mesmo mesmo que você:
- ✅ Reinicie a instância EC2
- ✅ Pare e inicie novamente
- ✅ Faça updates
- ✅ Recrie a instância

## ✨ Benefícios

| Aspecto | Sem Elastic IP | Com Elastic IP |
|--------|--------|--------|
| **IP Público** | Muda a cada reinicialização | Sempre o mesmo ✓ |
| **DNS** | Precisa atualizar sempre | Pode usar fixed domain ✓ |
| **SSH** | IP muda frequentemente | Sempre o mesmo ✓ |
| **Firewall Rules** | Precisa reconfigurar | Configuração permanente ✓ |
| **Domínio** | Mais complexo | Simples e estável ✓ |
| **Custo** | Gratuito | $0.005/hora (pausado) ou gratuito (em uso) |

---

## 🔧 Como está configurado no APOFlow

### Arquivo: `ec2.tf`

```hcl
# Elastic IP para EC2
resource "aws_eip" "apoflow_eip" {
  instance = aws_instance.apoflow_server.id
  domain   = "vpc"

  tags = {
    Name = "apoflow-eip"
  }

  depends_on = [aws_internet_gateway.apoflow_igw]
}
```

### O que isso faz:

1. ✅ Cria um Elastic IP
2. ✅ Associa automaticamente à instância EC2
3. ✅ Mantém mesmo IP após reinicializações
4. ✅ Nomeia como "apoflow-eip" para identificar fácil

---

## 📍 Como Obter o Elastic IP

### Via Terraform Output

```bash
# Ver todos os outputs
terraform output

# Ou apenas o Elastic IP
terraform output ec2_public_ip

# Exemplo de retorno:
# ec2_public_ip = "54.123.45.67"
```

### Via Script Helper

```bash
./terraform-helper.sh outputs

# Mostrará:
# ec2_public_ip = "54.123.45.67"
```

### Via AWS Console

1. Acesse: https://console.aws.amazon.com/
2. Vá para: EC2 → Elastic IPs
3. Procure por "apoflow-eip"
4. Copie o endereço

### Via AWS CLI

```bash
# Ver Elastic IP
aws ec2 describe-addresses \
  --filters "Name=tag:Name,Values=apoflow-eip" \
  --query 'Addresses[0].PublicIp' \
  --output text

# Exemplo de retorno:
# 54.123.45.67
```

---

## 🔗 Usando o Elastic IP

### SSH na EC2

```bash
# Sempre o mesmo IP!
SSH_KEY="~/.ssh/apoflow/apoflow-key.pem"
ELASTIC_IP=$(terraform output -raw ec2_public_ip)

ssh -i "$SSH_KEY" ubuntu@"$ELASTIC_IP"
```

### Configurar Domínio (Route 53)

```bash
# 1. Criar hosted zone no Route 53
# 2. Criar A record apontando para Elastic IP
# 3. Usar domínio fixo

# Exemplo:
# apoflow.example.com → 54.123.45.67
```

### Firewall / Security Group

```bash
# Configurar regras com IP fixo
aws ec2 authorize-security-group-ingress \
  --group-name apoflow-ec2-sg \
  --protocol tcp \
  --port 22 \
  --cidr 54.123.45.67/32
```

---

## 💰 Custos do Elastic IP

| Situação | Custo |
|----------|-------|
| **Associado a instância** | **GRATUITO** ✓ |
| Não associado (parado) | $0.005/hora |
| Transferência de dados | ~$0.01/GB |

**Total mensalmente (em uso)**: R$ 0,00 (gratuito!)

---

## ⚙️ Gerenciar Elastic IP

### Desassociar (Liberar)

```bash
# Se precisar desassociar
aws ec2 disassociate-address \
  --association-id eipassoc-XXXXXXXX

# Vai começar a cobrar a menos que você libere
aws ec2 release-address --allocation-id eipalloc-XXXXXXXX
```

### Reasociar a Outra Instância

```bash
# Se reconstruir EC2, o Elastic IP pode ser reasociado
aws ec2 associate-address \
  --instance-id i-XXXXXXXX \
  --allocation-id eipalloc-XXXXXXXX
```

### Ver Detalhes

```bash
aws ec2 describe-addresses \
  --allocation-ids eipalloc-XXXXXXXX
```

---

## 🛡️ Boas Práticas

### ✅ Fazer

- ✅ Sempre manter o Elastic IP associado (gratuito)
- ✅ Taguear com nome descritivo ("apoflow-eip")
- ✅ Usar em produção para configurações permanentes
- ✅ Documentar o IP em seus registros
- ✅ Usar Route 53 para domínio sobre IP

### ❌ Não Fazer

- ❌ Liberar IP sem necessidade (começa a cobrar)
- ❌ Usar IP direto em vez de domínio
- ❌ Compartilhar IP publicamente
- ❌ Esquecer que IP é fixo (atualizar regras de firewall)

---

## 🔄 Mudar de Elastic IP

Se precisar de novo Elastic IP:

```bash
# 1. Liberar o antigo
aws ec2 release-address --allocation-id eipalloc-OLD

# 2. Terraform vai criar novo automaticamente
terraform destroy
terraform apply
```

---

## 📊 Monitorar Elastic IP

### CloudWatch

```bash
# Ver associações do Elastic IP
aws ec2 describe-addresses \
  --public-ips 54.123.45.67

# Ver histórico de associações
aws ec2 describe-address-transfer \
  --allocation-id eipalloc-XXXXXXXX
```

---

## 🆘 Troubleshooting

| Problema | Solução |
|----------|---------|
| "Elastic IP não está associado" | Executar: `terraform apply` |
| "IP não responde" | Verificar Security Group |
| "Não consigo SSH" | Verificar key permissions: `chmod 600 key.pem` |
| "Elastic IP cobrou" | Foi liberado sem reasociar, liberar: `aws ec2 release-address` |

---

## 📈 Evolução do IP

```
Sem Elastic IP:
┌─────────────────────────┐
│ EC2 Iniciando           │
│ IP: 54.123.45.67        │
└─────────────────────────┘
           ↓ (Reiniciar)
┌─────────────────────────┐
│ EC2 Iniciado            │
│ IP: 52.987.65.43 ❌     │ ← NOVO IP!
└─────────────────────────┘

Com Elastic IP:
┌─────────────────────────┐
│ EC2 Iniciando           │
│ IP: 54.123.45.67 (EIP)  │
└─────────────────────────┘
           ↓ (Reiniciar)
┌─────────────────────────┐
│ EC2 Iniciado            │
│ IP: 54.123.45.67 ✓      │ ← MESMO IP!
└─────────────────────────┘
```

---

## 🎯 Resumo

| Recurso | APOFlow |
|---------|---------|
| **Elastic IP Incluído?** | ✅ Sim |
| **Nome** | apoflow-eip |
| **Permanente?** | ✅ Sim |
| **Custo (em uso)?** | ✅ Gratuito |
| **Output Terraform** | `terraform output ec2_public_ip` |

---

## 📚 Referências

- [AWS Elastic IP](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html)
- [Terraform aws_eip](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/eip)
- [Pricing Elastic IP](https://aws.amazon.com/ec2/pricing/on-demand/#eip)

---

**Última atualização**: 2026-05-13  
**Status**: ✅ Incluído na infraestrutura APOFlow
