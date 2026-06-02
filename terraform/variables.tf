variable "aws_region" {
  description = "Região AWS para deploy"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Ambiente de deployment"
  type        = string
  default     = "production"
}

# VPC Variables
variable "vpc_cidr" {
  description = "CIDR block para VPC APOFlow"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block para subnet pública (EC2)"
  type        = string
  default     = "10.0.1.0/24"
}

# Subnets privadas não são usadas (sem RDS), mas mantidas para compatibilidade
variable "private_subnet_cidr" {
  description = "CIDR block para subnet privada (RDS)"
  type        = string
  default     = "10.0.2.0/24"
}

variable "private_subnet_2_cidr" {
  description = "CIDR block para segunda subnet privada (RDS)"
  type        = string
  default     = "10.0.3.0/24"
}

# EC2 Variables
variable "instance_type" {
  description = "Tipo de instância EC2"
  type        = string
  default     = "t3.small"
}

variable "docker_data_volume_size" {
  description = "Tamanho (GB) do volume EBS dedicado aos dados do Docker"
  type        = number
  default     = 30
}

variable "ec2_key_pair_name" {
  description = "Nome da key pair para SSH"
  type        = string
  default     = "apoflow-key"
}

variable "brevo_token" {
  description = "Token da API Brevo para envio de e-mails"
  type        = string
  sensitive   = true
}

variable "brevo_from" {
  description = "Endereço remetente do Brevo (sender verificado)"
  type        = string
}

variable "jwt_secret" {
  description = "Chave secreta para assinar tokens JWT (mínimo 32 caracteres)"
  type        = string
  sensitive   = true
}

variable "apoflow_site_address" {
  description = "Dominio, hostname ou IP usado pelo proxy HTTPS. Se vazio, a EC2 usa o IP publico automaticamente."
  type        = string
  default     = ""
}

variable "apoflow_tls_mode" {
  description = "Modo TLS do proxy reverso: internal (certificado interno) ou public (Let's Encrypt com dominio valido)."
  type        = string
  default     = "internal"

  validation {
    condition     = contains(["internal", "public"], var.apoflow_tls_mode)
    error_message = "apoflow_tls_mode deve ser internal ou public."
  }
}

variable "tls_email" {
  description = "E-mail usado pelo ACME/Let's Encrypt quando apoflow_tls_mode=public."
  type        = string
  default     = ""
}
