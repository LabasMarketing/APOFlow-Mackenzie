output "vpc_id" {
  description = "ID da VPC APOFlow"
  value       = aws_vpc.apoflow_vpc.id
}

output "vpc_cidr" {
  description = "CIDR da VPC APOFlow"
  value       = aws_vpc.apoflow_vpc.cidr_block
}

output "public_subnet_id" {
  description = "ID da subnet pública (EC2)"
  value       = aws_subnet.apoflow_public_subnet.id
}

output "ec2_instance_id" {
  description = "ID da instância EC2 APOFlow"
  value       = aws_instance.apoflow_server.id
}

output "docker_data_volume_id" {
  description = "ID do volume EBS dedicado aos dados do Docker"
  value       = aws_ebs_volume.docker_data.id
}

output "ec2_public_ip" {
  description = "IP público da EC2 APOFlow"
  value       = aws_eip.apoflow_eip.public_ip
}

output "ec2_private_ip" {
  description = "IP privado da EC2 APOFlow"
  value       = aws_instance.apoflow_server.private_ip
}

output "ec2_security_group_id" {
  description = "ID do security group da EC2"
  value       = aws_security_group.apoflow_ec2_sg.id
}

output "app_url" {
  description = "URL principal da aplicação APOFlow"
  value       = var.apoflow_tls_mode == "public" && var.apoflow_site_address != "" ? "https://${var.apoflow_site_address}" : "https://${aws_eip.apoflow_eip.public_ip}"
}

output "app_http_url" {
  description = "URL HTTP publica da aplicacao (redirecionada pelo proxy quando aplicavel)"
  value       = "http://${aws_eip.apoflow_eip.public_ip}"
}

output "app_https_url" {
  description = "URL HTTPS publica da aplicacao"
  value       = var.apoflow_tls_mode == "public" && var.apoflow_site_address != "" ? "https://${var.apoflow_site_address}" : "https://${aws_eip.apoflow_eip.public_ip}"
}

output "ssh_command" {
  description = "Comando SSH para acessar a EC2"
  value       = "ssh -i ~/Downloads/apoflow-key.pem ubuntu@${aws_eip.apoflow_eip.public_ip}"
}
