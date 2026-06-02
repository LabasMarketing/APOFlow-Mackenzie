#!/bin/bash
set -e
exec > /var/log/apoflow-setup.log 2>&1

echo "===== AOFflow Setup ― $(date) ====="

DOCKER_DATA_DEVICE="${docker_data_device_name}"
APOFLOW_SITE_ADDRESS="${apoflow_site_address}"
APOFLOW_TLS_MODE="${apoflow_tls_mode}"
TLS_EMAIL="${tls_email}"

resolve_docker_device() {
  if [ -b "$DOCKER_DATA_DEVICE" ]; then
    echo "$DOCKER_DATA_DEVICE"
    return 0
  fi

  # Em instancias Nitro, o device pode aparecer como /dev/nvme1n1.
  for _ in $(seq 1 30); do
    CANDIDATE=$(lsblk -dpno NAME,TYPE | awk '$2=="disk"{print $1}' | grep -vE '/dev/nvme0n1|/dev/xvda' | head -n1 || true)
    if [ -n "$CANDIDATE" ] && [ -b "$CANDIDATE" ]; then
      echo "$CANDIDATE"
      return 0
    fi
    sleep 2
  done

  return 1
}

resolve_public_ipv4() {
  TOKEN=$(curl -fsS -X PUT "http://169.254.169.254/latest/api/token" \
    -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" || true)

  if [ -n "$TOKEN" ]; then
    curl -fsS -H "X-aws-ec2-metadata-token: $TOKEN" \
      "http://169.254.169.254/latest/meta-data/public-ipv4" || true
    return 0
  fi

  curl -fsS "http://169.254.169.254/latest/meta-data/public-ipv4" || true
}

# Sistema
apt-get update -y
apt-get install -y curl git ca-certificates gnupg lsb-release

# Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu jammy stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

DOCKER_DEVICE_PATH=$(resolve_docker_device)
if [ -z "$DOCKER_DEVICE_PATH" ]; then
  echo "ERRO: volume EBS de dados do Docker nao foi encontrado."
  exit 1
fi

if ! blkid "$DOCKER_DEVICE_PATH" >/dev/null 2>&1; then
  mkfs.ext4 -F "$DOCKER_DEVICE_PATH"
fi

mkdir -p /var/lib/docker
DOCKER_UUID=$(blkid -s UUID -o value "$DOCKER_DEVICE_PATH")
if ! grep -q "${DOCKER_UUID}" /etc/fstab; then
  echo "UUID=${DOCKER_UUID} /var/lib/docker ext4 defaults,nofail 0 2" >> /etc/fstab
fi
mount -a

systemctl enable --now docker
usermod -aG docker ubuntu

# Clonar/atualizar repositorio
if [ -d /opt/apoflow/.git ]; then
  cd /opt/apoflow
  git pull --ff-only
else
  rm -rf /opt/apoflow
  git clone https://github.com/JP18090/APOFlow.git /opt/apoflow
  cd /opt/apoflow
fi

if [ -z "$APOFLOW_SITE_ADDRESS" ]; then
  APOFLOW_SITE_ADDRESS=$(resolve_public_ipv4)
fi

if [ -z "$APOFLOW_SITE_ADDRESS" ]; then
  APOFLOW_SITE_ADDRESS="localhost"
fi

# Variaveis de ambiente (injetadas pelo Terraform templatefile)
cat > /opt/apoflow/.env <<ENVEOF
MONGODB_URI=mongodb://mongodb:27017/apoflow
EMAIL_ENABLED=true
BREVO_TOKEN=${brevo_token}
BREVO_FROM=${brevo_from}
JWT_SECRET=${jwt_secret}
APOFLOW_SITE_ADDRESS=${APOFLOW_SITE_ADDRESS}
APOFLOW_TLS_MODE=${APOFLOW_TLS_MODE}
TLS_EMAIL=${TLS_EMAIL}
ENVEOF

chmod 600 /opt/apoflow/.env

# Subir aplicacao
docker compose --env-file .env up -d --build

echo "===== Setup concluido ― \$(date) ====="
