# VPC
resource "aws_vpc" "apoflow_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "apoflow-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "apoflow_igw" {
  vpc_id = aws_vpc.apoflow_vpc.id

  tags = {
    Name = "apoflow-igw"
  }
}

# Public Subnet (para EC2)
resource "aws_subnet" "apoflow_public_subnet" {
  vpc_id                  = aws_vpc.apoflow_vpc.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "apoflow-public-subnet"
  }
}

# Private Subnets (para RDS)
resource "aws_subnet" "apoflow_private_subnet_1" {
  vpc_id            = aws_vpc.apoflow_vpc.id
  cidr_block        = var.private_subnet_cidr
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "apoflow-private-subnet-1"
  }
}

resource "aws_subnet" "apoflow_private_subnet_2" {
  vpc_id            = aws_vpc.apoflow_vpc.id
  cidr_block        = var.private_subnet_2_cidr
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = {
    Name = "apoflow-private-subnet-2"
  }
}

# Route Table para subnet pública
resource "aws_route_table" "apoflow_public_rt" {
  vpc_id = aws_vpc.apoflow_vpc.id

  route {
    cidr_block      = "0.0.0.0/0"
    gateway_id      = aws_internet_gateway.apoflow_igw.id
  }

  tags = {
    Name = "apoflow-public-rt"
  }
}

# Route Table Association
resource "aws_route_table_association" "apoflow_public_rta" {
  subnet_id      = aws_subnet.apoflow_public_subnet.id
  route_table_id = aws_route_table.apoflow_public_rt.id
}

# Data source para availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# Security Group para EC2
resource "aws_security_group" "apoflow_ec2_sg" {
  name        = "apoflow-ec2-sg"
  description = "Security group para EC2 APOFlow"
  vpc_id      = aws_vpc.apoflow_vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Altere para seu IP para maior segurança
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "apoflow-ec2-sg"
  }
}
