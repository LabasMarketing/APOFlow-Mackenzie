# Data source para obter a AMI mais recente do Ubuntu
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# AWS Academy (voclabs) não permite criar IAM roles.
# Usa o LabInstanceProfile pré-existente no ambiente.
data "aws_iam_instance_profile" "lab_profile" {
  name = "LabInstanceProfile"
}

# EC2 Instance
resource "aws_instance" "apoflow_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.apoflow_public_subnet.id
  vpc_security_group_ids = [aws_security_group.apoflow_ec2_sg.id]
  iam_instance_profile   = data.aws_iam_instance_profile.lab_profile.name
  key_name               = var.ec2_key_pair_name

  user_data = templatefile("${path.module}/user_data.sh", {
    brevo_token = var.brevo_token
    brevo_from  = var.brevo_from
    jwt_secret       = var.jwt_secret
    apoflow_site_address = var.apoflow_site_address
    apoflow_tls_mode = var.apoflow_tls_mode
    tls_email        = var.tls_email
    docker_data_device_name = "/dev/sdh"
  })

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 20
    delete_on_termination = false
    encrypted             = true

    tags = {
      Name = "apoflow-root-volume"
    }
  }

  monitoring = true

  tags = {
    Name = "apoflow-server"
  }

  depends_on = [aws_internet_gateway.apoflow_igw]
}

resource "aws_ebs_volume" "docker_data" {
  availability_zone = aws_instance.apoflow_server.availability_zone
  size              = var.docker_data_volume_size
  type              = "gp3"
  encrypted         = true

  tags = {
    Name = "apoflow-docker-data"
  }
}

resource "aws_volume_attachment" "docker_data_attachment" {
  device_name = "/dev/sdh"
  volume_id   = aws_ebs_volume.docker_data.id
  instance_id = aws_instance.apoflow_server.id
}

# Elastic IP para EC2
resource "aws_eip" "apoflow_eip" {
  instance = aws_instance.apoflow_server.id
  domain   = "vpc"

  tags = {
    Name = "apoflow-eip"
  }

  depends_on = [aws_internet_gateway.apoflow_igw]
}
