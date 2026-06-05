# APOFlow

APOFlow é uma aplicação web para gerenciar o fluxo de Atividades Programadas Obrigatórias (APOs) do PPG-CA.
O sistema centraliza autenticação, cadastro de usuários, submissão de APOs, avaliação por etapas, notificações e administração de papéis institucionais.

Este README é a documentação principal do projeto: arquitetura, stack, regras de negócio, execução local, deploy em AWS e operação com Docker.

---

## 1. Objetivo

O APOFlow reduz processos manuais entre aluno, orientador, comissão, coordenação e secretaria.
Em vez de controles paralelos e trocas manuais, o sistema concentra:

1. cadastro e autenticação de usuários
2. submissão e reenvio de APOs
3. avaliação por orientador
4. votação por comissão
5. decisão final pela coordenação
6. arquivamento e lançamento pela secretaria
7. administração de perfis pelo usuário administrador

---

## 2. Estado atual do repositório

Implementado neste repositório:

- frontend React servido pelo backend Spring Boot
- backend Java 25 com Spring Boot
- MongoDB como persistência principal
- JWT stateless para sessão autenticada
- OTP por e-mail para usuários comuns
- bypass de OTP para o admin fixo
- painel administrativo para listar, filtrar, atualizar papéis e excluir usuários
- deploy com Docker Compose (app direto na porta 80)
- Terraform para provisionamento em AWS EC2

---

## 3. Regras de negócio

### 3.1 Cadastro e conta admin fixa

- todo usuário criado via tela de registro nasce com papel `aluno`
- somente o admin pode promover ou rebaixar perfis
- o admin fixo é criado automaticamente no startup
- credenciais da conta admin fixa:
  - e-mail: `admin@mackenzie.com`
  - senha: `ADMmack123`
- o admin fixo não usa OTP
- o admin fixo não pode ser excluído nem alterado por fluxos administrativos padrão

### 3.2 Estados de perfil permitidos

Usuários comuns podem estar apenas em um destes estados:

1. aluno
2. orientador
3. comissão
4. orientador + comissão
5. coordenação
6. secretaria

Combinações como `orientador + secretaria` ou `aluno + comissão` são invalidadas no frontend e no backend.

### 3.3 Perfis e responsabilidades

| Perfil      | Responsabilidade principal                                   |
|-------------|--------------------------------------------------------------|
| admin       | gerenciar usuários, filtros, perfis e exclusões              |
| aluno       | criar, salvar rascunho, enviar, reenviar ou desistir de APO  |
| orientador  | aprovar ou devolver APO com justificativa                    |
| comissão    | registrar votos e parecer colegiado                          |
| coordenação | aprovar, reprovar ou devolver na etapa final                 |
| secretaria  | arquivar e lançar créditos                                   |

---

## 4. Stack tecnológica

### 4.1 Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Framer Motion
- Sonner

### 4.2 Backend

- Java 25
- Spring Boot
- Spring Security
- Spring Data MongoDB
- JWT
- Brevo HTTP API (envio de OTP por e-mail)

### 4.3 Infra e operação

- Docker multi-stage
- Docker Compose (app exposto diretamente na porta 80)
- MongoDB 7.0 em container
- Terraform para provisionamento AWS
- EC2 com Elastic IP

---

## 5. Arquitetura

### 5.1 Visão de alto nível

```
Browser
  -> HTTP (porta 80)
  -> Spring Boot (porta interna 8080, mapeada para 80 pelo Compose)
  -> MongoDB
```

> Para deploy em produção com HTTPS, consulte a seção 14 (Terraform/AWS).

### 5.2 Fluxo de runtime

1. navegador acessa `http://HOST`
2. Spring Boot serve frontend buildado e API REST em `/api`
3. frontend chama API com JWT no header `Authorization: Bearer`
4. backend persiste no MongoDB

### 5.3 Estrutura principal do repositório

```
.
├── Backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/apoflow/backend/
│       │   ├── api/
│       │   ├── config/
│       │   ├── domain/
│       │   ├── repository/
│       │   └── service/
│       └── resources/
├── Frontend/
│   ├── docs/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── lib/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.ts
├── terraform/
├── .env.example
├── docker-compose.yml
├── Dockerfile
└── README.md
```

### 5.4 Responsabilidade por camada

| Caminho                              | Papel                                    |
|--------------------------------------|------------------------------------------|
| Frontend/src/pages                   | telas de negócio e dashboards            |
| Frontend/src/components              | componentes reutilizáveis e layout       |
| Frontend/src/contexts                | sessão autenticada e estado global       |
| Frontend/src/lib/api.ts              | cliente HTTP, tipos e operações REST     |
| Backend/src/main/java/.../api        | controllers e DTOs                       |
| Backend/src/main/java/.../service    | regras de negócio                        |
| Backend/src/main/java/.../repository | acesso ao MongoDB                        |
| Backend/src/main/java/.../config     | segurança, seed inicial e configurações  |
| terraform/                           | provisionamento de infraestrutura AWS    |

---

## 6. Autenticação e autorização

### 6.1 Login comum

1. usuário informa e-mail e senha
2. backend valida credenciais
3. backend envia OTP por e-mail
4. usuário informa OTP
5. backend retorna JWT
6. frontend salva JWT no localStorage

### 6.2 Login do admin fixo

1. admin informa e-mail e senha
2. backend valida credenciais
3. backend retorna JWT imediatamente (sem OTP)

### 6.3 Sessão

- JWT enviado em `Authorization: Bearer`
- respostas 401 limpam token e usuário local
- frontend redireciona para login quando a sessão expira

---

## 7. Fluxos funcionais implementados

### 7.1 Aluno
- registrar conta, fazer login, alterar senha, recuperar senha, editar perfil
- criar APO, salvar rascunho, reenviar APO devolvida, desistir de APO, acompanhar status

### 7.2 Orientador
- visualizar itens em avaliação, aprovar APO, devolver APO com justificativa

### 7.3 Comissão
- visualizar itens pendentes, registrar voto, justificar voto

### 7.4 Coordenação
- decidir aprovação final, reprovar, devolver para ajustes

### 7.5 Secretaria
- visualizar itens prontos para encerramento, arquivar, lançar créditos

### 7.6 Administrador
- listar usuários, filtrar por nome/e-mail/perfil, alterar papéis válidos, excluir usuários
- impedir alteração da conta admin fixa

---

## 8. Portas publicadas

| Porta | Uso                  | Exposição                                |
|-------|----------------------|------------------------------------------|
| 80    | HTTP (app principal) | pública (mapeada do 8080 interno)        |
| 8080  | Spring Boot          | interna entre containers                 |
| 27017 | MongoDB              | publicada localmente no host do Compose  |

Acesso principal: `http://localhost`

> A porta 8080 não precisa ser acessada diretamente; o Compose mapeia 80 → 8080.

---

## 9. Variáveis de ambiente

Copie `.env.example` para `.env` na raiz do projeto:

```bash
cp .env.example .env
```

### 9.1 Variáveis da aplicação

| Variável                    | Descrição                                     | Exemplo                                                 |
|-----------------------------|-----------------------------------------------|---------------------------------------------------------|
| `MONGODB_URI`               | string de conexão do MongoDB                  | `mongodb://mongodb:27017/apoflow`                       |
| `EMAIL_ENABLED`             | habilita envio real de e-mail                 | `true`                                                  |
| `BREVO_TOKEN`               | token da API Brevo                            | `xkeysib-...`                                           |
| `BREVO_FROM`                | remetente de e-mail                           | `no-reply@seudominio.com`                               |
| `APP_BASE_URL`              | URL base da aplicação                         | `http://localhost`                                      |
| `APP_CORS_ALLOWED_ORIGINS`  | origens permitidas pelo CORS                  | `http://localhost,http://localhost:3000`                 |

---

## 10. Execução local com Docker

### 10.1 Pré-requisitos

- Docker
- plugin Docker Compose

### 10.2 Passo a passo

```bash
git clone https://github.com/LabasMarketing/APOFlow-Mackenzie.git
cd APOFlow-Mackenzie
cp .env.example .env
```

Edite o arquivo `.env` conforme o ambiente.

### 10.3 Subir aplicação

```bash
docker compose --env-file .env up -d --build
```

### 10.4 Verificar status

```bash
docker compose ps
docker compose logs -f apoflow mongodb
```

### 10.5 Acessar

- `http://localhost`
- `http://localhost/api`

### 10.6 Parar

```bash
docker compose down
```

### 10.7 Rebuild após alterações

```bash
docker compose --env-file .env up -d --build
```

---

## 11. Exemplo de `.env` para localhost

```env
MONGODB_URI=mongodb://mongodb:27017/apoflow
EMAIL_ENABLED=true
BREVO_TOKEN=xkeysib-SEU_TOKEN_AQUI
BREVO_FROM=no-reply@seudominio.com
APP_BASE_URL=http://localhost
APP_CORS_ALLOWED_ORIGINS=http://localhost,http://localhost:3000,http://localhost:5173
```

---

## 12. Como o Dockerfile funciona

O Dockerfile usa três estágios:

1. **frontend-build** — instala dependências Node (node:20-alpine) e executa `npm run build`
2. **backend-build** — usa eclipse-temurin:25-jdk, instala Maven, copia o frontend buildado para `src/main/resources/static` e gera o JAR Spring Boot
3. **imagem final** — executa apenas o JAR com eclipse-temurin:25-jre

Benefícios: imagem final sem Node e Maven, frontend e backend publicados juntos no mesmo container.

---

## 13. API principal

### 13.1 Autenticação

| Método | Rota                              | Descrição                        |
|--------|-----------------------------------|----------------------------------|
| POST   | `/api/auth/register`              | Cadastro de novo usuário         |
| POST   | `/api/auth/login`                 | Login com e-mail e senha         |
| POST   | `/api/auth/verify-otp`            | Verificação do OTP recebido      |
| POST   | `/api/auth/change-password`       | Alteração de senha autenticada   |
| POST   | `/api/auth/forgot-password`       | Solicitar redefinição de senha   |
| POST   | `/api/auth/reset-password`        | Redefinir senha via token        |
| GET    | `/api/auth/first-access/{email}`  | Verificar primeiro acesso        |

### 13.2 Usuário autenticado

| Método | Rota           | Descrição                    |
|--------|----------------|------------------------------|
| GET    | `/api/users/me` | Dados do usuário logado      |
| PUT    | `/api/users/me` | Atualizar perfil próprio     |
| DELETE | `/api/users/me` | Excluir própria conta        |

### 13.3 Administração de usuários

| Método | Rota                        | Descrição                          |
|--------|-----------------------------|------------------------------------|
| GET    | `/api/users`                | Listar todos os usuários           |
| PUT    | `/api/users/{userId}/roles` | Atualizar papéis de um usuário     |
| DELETE | `/api/users/{userId}`       | Excluir usuário                    |

### 13.4 APOs

| Método | Rota                                                   | Descrição                          |
|--------|--------------------------------------------------------|------------------------------------|
| GET    | `/api/apos`                                            | Listar APOs do contexto            |
| POST   | `/api/apos`                                            | Submeter nova APO                  |
| POST   | `/api/apos/rascunho`                                   | Salvar APO como rascunho           |
| PUT    | `/api/apos/{id}/aluno/reenviar`                        | Reenviar APO devolvida             |
| POST   | `/api/apos/{id}/aluno/desistir`                        | Desistir da APO                    |
| POST   | `/api/apos/{id}/orientador/aprovar`                    | Orientador aprova APO              |
| POST   | `/api/apos/{id}/orientador/devolver`                   | Orientador devolve com justificativa|
| POST   | `/api/apos/{id}/comissao/voto`                         | Comissão registra voto             |
| POST   | `/api/apos/{id}/coordenacao/decisao?action=aprovar\|reprovar\|devolver` | Decisão final |
| POST   | `/api/apos/{id}/secretaria/arquivar`                   | Secretaria arquiva                 |
| POST   | `/api/apos/{id}/secretaria/lancar`                     | Secretaria lança créditos          |

### 13.5 Outros endpoints

| Método | Rota                           | Descrição                          |
|--------|--------------------------------|------------------------------------|
| GET    | `/api/students`                | Listar alunos                      |
| GET    | `/api/notifications?recipient=`| Notificações por perfil            |

---

## 14. Deploy em AWS com Terraform

### 14.1 O que `terraform/` provisiona

- VPC, subnet pública, internet gateway
- security group (22, 80, 443)
- EC2 Ubuntu com Elastic IP
- volume EBS dedicado ao Docker

### 14.2 Variáveis relevantes do Terraform

| Variável               | Descrição                         |
|------------------------|-----------------------------------|
| `brevo_token`          | token da API Brevo                |
| `brevo_from`           | remetente configurado             |
| `apoflow_site_address` | domínio, hostname ou IP           |

### 14.3 Exemplo de `terraform.tfvars`

```hcl
aws_region            = "us-east-1"
environment           = "production"
instance_type         = "t3.small"
ec2_key_pair_name     = "apoflow-key"
brevo_token           = "xkeysib-SEU_TOKEN_AQUI"
brevo_from            = "no-reply@seudominio.com"
apoflow_site_address  = "3.91.10.20"
```

### 14.4 Deploy inicial

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform validate
terraform apply
```

### 14.5 Atualizar EC2 existente sem recriar tudo

```bash
EC2_IP=<SEU_IP_PUBLICO>
ssh -i ~/Downloads/apoflow-key.pem ubuntu@$EC2_IP

cd /opt/apoflow
git pull --ff-only
docker compose --env-file .env up -d --build
docker compose ps
docker compose logs --tail 100 apoflow mongodb
```

Se `.env` ainda não existir na EC2, crie antes do deploy:

```bash
cd /opt/apoflow
cp .env.example .env
nano .env
docker compose --env-file .env up -d --build
```

---

## 15. Operação do Docker

### 15.1 Comandos essenciais

```bash
docker compose --env-file .env up -d --build
docker compose ps
docker compose logs -f
docker compose restart
docker compose down
docker compose down --volumes --remove-orphans
```

### 15.2 Logs por serviço

```bash
docker compose logs -f apoflow
docker compose logs -f mongodb
```

### 15.3 Testes de acesso

```bash
curl -I http://localhost
curl http://localhost/api/users/me
```

---

## 16. Troubleshooting

### 16.1 Aplicação não sobe após pull

```bash
docker compose config
docker compose logs --tail 100 apoflow mongodb
```

### 16.2 MongoDB não conecta

```bash
docker compose ps
docker compose logs mongodb
```

Valide se `MONGODB_URI` está correta no `.env`.

### 16.3 Login do admin falha

Confirme que o backend concluiu startup e aplicou o seed inicial.

Credenciais esperadas:
- e-mail: `admin@mackenzie.com`
- senha: `ADMmack123`

### 16.4 E-mails OTP não chegam

Verifique se `EMAIL_ENABLED=true` e se `BREVO_TOKEN` está correto no `.env`.

---

## 17. Arquivos de referência

| Arquivo                        | Conteúdo                                         |
|--------------------------------|--------------------------------------------------|
| `README.md`                    | documentação principal (este arquivo)            |
| `PackSP2.md`                   | documentação complementar detalhada              |
| `Frontend/docs/use-cases.md`   | casos de uso da interface                        |
| `terraform/README.md`          | documentação específica de infraestrutura        |
| `terraform/QUICKSTART.md`      | guia rápido de provisionamento                   |
| `Segurity.md`                  | considerações e políticas de segurança           |

---

## 18. Resumo operacional rápido

### Rodar localmente

```bash
git clone https://github.com/LabasMarketing/APOFlow-Mackenzie.git
cd APOFlow-Mackenzie
cp .env.example .env
docker compose --env-file .env up -d --build
# acesse http://localhost
```

### Atualizar EC2 existente

```bash
ssh -i ~/Downloads/apoflow-key.pem ubuntu@SEU_IP
cd /opt/apoflow
git pull --ff-only
docker compose --env-file .env up -d --build
```

### Aplicar mudanças de Terraform

```bash
cd terraform
terraform init
terraform apply
```

### Acesso esperado

- `http://HOST` — aplicação principal
- `http://HOST/api` — API REST

---

## About

Sistema de Atividades Programadas Obrigatórias dos Alunos de Pós-Graduação e Mestrado do Mackenzie — PPG-CA.
