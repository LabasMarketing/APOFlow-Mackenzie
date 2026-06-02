# APOFlow

APOFlow e uma aplicacao web para gerenciar o fluxo de Atividades Programadas Obrigatorias (APOs) do PPG-CA.
O sistema centraliza autenticacao, cadastro de usuarios, submissao de APOs, avaliacao por etapas, notificacoes e administracao de papeis institucionais.

Este README e a documentacao principal do projeto: arquitetura, stack, regras de negocio, execucao local, HTTPS, deploy em AWS, operacao com Docker e atualizacao de ambiente existente.

## 1. Objetivo

O APOFlow reduz processos manuais entre aluno, orientador, comissao, coordenacao e secretaria.
Em vez de controles paralelos e trocas manuais, o sistema concentra:

1. cadastro e autenticacao de usuarios
2. submissao e reenvio de APOs
3. avaliacao por orientador
4. votacao por comissao
5. decisao final pela coordenacao
6. arquivamento e lancamento pela secretaria
7. administracao de perfis pelo usuario administrador

## 2. Estado atual do repositorio

Implementado neste repositorio:

- frontend React servido pelo backend Spring Boot
- backend Java 25 com Spring Boot 4.0.6
- MongoDB como persistencia principal
- JWT stateless para sessao autenticada
- OTP por e-mail para usuarios comuns
- bypass de OTP para o admin fixo
- painel administrativo para listar, filtrar, atualizar papeis e excluir usuarios
- deploy com Docker Compose
- proxy reverso com Caddy em 80 e 443
- suporte a HTTPS em dois modos:
  - internal: certificado interno/self-signed, util para localhost, IP publico e laboratorio
   - public: certificado valido via Let's Encrypt, para dominio real apontado para a EC2

## 3. Regras de negocio

### 3.1 Cadastro e conta admin fixa

- todo usuario criado via tela de registro nasce com papel aluno
- somente o admin pode promover ou rebaixar perfis
- o admin fixo e criado automaticamente no startup
- credenciais da conta admin fixa:
  - e-mail: admin@mackenzie.com
  - senha: ADMmack123
- o admin fixo nao usa OTP
- o admin fixo nao pode ser excluido nem alterado por fluxos administrativos padrao

### 3.2 Estados de perfil permitidos

Usuarios comuns podem estar apenas em um destes estados:

1. aluno
2. orientador
3. comissao
4. orientador + comissao
5. coordenacao
6. secretaria

Combinacoes como orientador + secretaria ou aluno + comissao sao invalidadas no frontend e no backend.

### 3.3 Perfis e responsabilidades

| Perfil | Responsabilidade principal |
|---|---|
| admin | gerenciar usuarios, filtros, perfis e exclusoes |
| aluno | criar, salvar rascunho, enviar, reenviar ou desistir de APO |
| orientador | aprovar ou devolver APO com justificativa |
| comissao | registrar votos e parecer colegiado |
| coordenacao | aprovar, reprovar ou devolver na etapa final |
| secretaria | arquivar e lancar creditos |

## 4. Stack tecnologica

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

- Java 25 LTS
- Spring Boot 4.0.6
- Spring Security
- Spring Data MongoDB
- JWT
- Brevo HTTP API

### 4.3 Infra e operacao

- Docker multi-stage
- Docker Compose
- Caddy como reverse proxy
- MongoDB 7.0 em container
- Terraform para AWS
- EC2 com Elastic IP

## 5. Arquitetura

### 5.1 Visao de alto nivel

```text
Browser
  -> HTTP/HTTPS (80/443)
  -> Caddy reverse proxy
  -> Spring Boot (porta interna 8080)
  -> MongoDB
```

### 5.2 Fluxo de runtime

1. navegador acessa http://HOST ou https://HOST
2. Caddy recebe conexao em 80/443
3. Caddy encaminha para o container apoflow na porta interna 8080
4. backend Spring Boot serve frontend buildado e API REST em /api
5. frontend chama API com JWT
6. backend persiste no MongoDB

### 5.3 Estrutura principal do repositorio

```text
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
├── deploy/
│   └── caddy/
│       └── entrypoint.sh
├── terraform/
├── .env.example
├── docker-compose.yml
├── Dockerfile
└── README.md
```

### 5.4 Responsabilidade por camada

| Caminho | Papel |
|---|---|
| Frontend/src/pages | telas de negocio e dashboards |
| Frontend/src/components | componentes reutilizaveis e layout |
| Frontend/src/contexts | sessao autenticada e estado global |
| Frontend/src/lib/api.ts | cliente HTTP, tipos e operacoes REST |
| Backend/src/main/java/.../api | controllers e DTOs |
| Backend/src/main/java/.../service | regras de negocio |
| Backend/src/main/java/.../repository | acesso ao MongoDB |
| Backend/src/main/java/.../config | seguranca, seed inicial e configuracoes |
| terraform/ | provisionamento de infraestrutura AWS |
| deploy/caddy/entrypoint.sh | geracao dinamica da configuracao HTTPS |

## 6. Autenticacao e autorizacao

### 6.1 Login comum

1. usuario informa e-mail e senha
2. backend valida credenciais
3. backend envia OTP por e-mail
4. usuario informa OTP
5. backend retorna JWT
6. frontend salva JWT no localStorage

### 6.2 Login do admin fixo

1. admin informa e-mail e senha
2. backend valida credenciais
3. backend retorna JWT imediatamente
4. nao ha etapa de OTP

### 6.3 Sessao

- JWT enviado em Authorization: Bearer <token>
- respostas 401 limpam token e usuario local
- frontend redireciona para login quando a sessao expira

## 7. Fluxos funcionais implementados

### 7.1 Aluno

- registrar conta
- fazer login
- alterar senha
- recuperar senha
- editar perfil
- criar APO
- salvar rascunho
- reenviar APO devolvida
- desistir de APO
- acompanhar status

### 7.2 Orientador

- visualizar itens em avaliacao
- aprovar APO
- devolver APO com justificativa

### 7.3 Comissao

- visualizar itens pendentes
- registrar voto
- justificar voto

### 7.4 Coordenacao

- decidir aprovacao final
- reprovar
- devolver para ajustes

### 7.5 Secretaria

- visualizar itens prontos para encerramento
- arquivar
- lancar creditos

### 7.6 Administrador

- listar usuarios
- filtrar por nome/e-mail
- filtrar por perfil
- alterar papeis validos
- excluir usuarios
- impedir alteracao da conta admin fixa

## 8. Portas publicadas

### 8.1 Portas em uso no Compose atual

| Porta | Uso | Exposicao |
|---|---|---|
| 80 | HTTP no proxy reverso | publica |
| 443 | HTTPS no proxy reverso | publica |
| 8080 | Spring Boot | interna entre containers |
| 27017 | MongoDB | publicada localmente no host do Compose |

### 8.2 Resultado pratico

- acesso web principal: http://localhost
- acesso HTTPS local: https://localhost
- API via proxy: http://localhost/api ou https://localhost/api
- backend nao precisa ser acessado publicamente em :8080

## 9. HTTPS

### 9.1 Modos suportados

| Modo | Variavel | Quando usar | Resultado |
|---|---|---|---|
| internal | APOFLOW_TLS_MODE=internal | localhost, IP publico, laboratorio AWS, ambiente sem dominio | HTTPS com certificado interno/self-signed |
| public | APOFLOW_TLS_MODE=public | dominio real apontado para a EC2 | HTTPS com certificado Let's Encrypt |

### 9.2 Regras importantes

- certificado publico confiavel exige dominio valido apontado para a instancia
- Let's Encrypt nao emite certificado confiavel para IP publico bruto
- para uso com IP sem dominio, o modo recomendado e internal
- no modo internal, o navegador exibira aviso de certificado ate confiar na CA local

### 9.3 Variaveis do proxy

| Variavel | Obrigatoria | Exemplo | Descricao |
|---|---|---|---|
| APOFLOW_SITE_ADDRESS | sim | localhost, 3.91.10.20, apoflow.seudominio.com | endereco que o proxy atende |
| APOFLOW_TLS_MODE | sim | internal ou public | define o tipo de TLS |
| TLS_EMAIL | obrigatoria no modo public | admin@seudominio.com | e-mail usado pelo ACME |

## 10. Variaveis de ambiente

Copie .env.example para .env na raiz do projeto:

```bash
cp .env.example .env
```

### 10.1 Variaveis da aplicacao

| Variavel | Descricao | Exemplo |
|---|---|---|
| MONGODB_URI | string de conexao do MongoDB | mongodb://mongodb:27017/apoflow |
| EMAIL_ENABLED | habilita envio real de e-mail | true |
| BREVO_API_KEY | chave da API Brevo | xkeysib-... |
| BREVO_FROM | remetente de e-mail | no-reply@seudominio.com |
| JWT_SECRET | segredo JWT com pelo menos 32 caracteres | uma-chave-muito-forte... |

### 10.2 Variaveis do proxy HTTPS

| Variavel | Descricao | Exemplo |
|---|---|---|
| APOFLOW_SITE_ADDRESS | host/ip/dominio do proxy | localhost |
| APOFLOW_TLS_MODE | internal ou public | internal |
| TLS_EMAIL | e-mail para Let's Encrypt | admin@seudominio.com |

## 11. Execucao local com Docker

### 11.1 Pre-requisitos

- Docker
- plugin Docker Compose

### 11.2 Passo a passo

```bash
git clone https://github.com/JP18090/APOFlow.git
cd APOFlow
cp .env.example .env
```

Edite o arquivo .env conforme o ambiente.

### 11.3 Subir aplicacao

```bash
docker compose --env-file .env up -d --build
```

### 11.4 Verificar status

```bash
docker compose ps
docker compose logs -f proxy apoflow
```

### 11.5 Acessar

- http://localhost
- https://localhost
- http://localhost/api
- https://localhost/api

### 11.6 Parar

```bash
docker compose down
```

### 11.7 Rebuild apos alteracoes

```bash
docker compose --env-file .env up -d --build
```

## 12. Como o Dockerfile funciona

O Dockerfile usa tres estagios:

1. frontend-build
   - instala dependencias Node
   - executa npm run build
2. backend-build
   - instala Maven
   - copia frontend buildado para src/main/resources/static
   - gera jar Spring Boot
3. imagem final
   - executa apenas o jar com Java 25 JRE

Beneficios:

- imagem final menor
- runtime sem Node e Maven
- frontend e backend publicados juntos

## 13. API principal

### 13.1 Autenticacao

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/verify-otp
- POST /api/auth/change-password
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- GET /api/auth/first-access/{email}

### 13.2 Usuario autenticado

- GET /api/users/me
- PUT /api/users/me
- DELETE /api/users/me

### 13.3 Administracao de usuarios

- GET /api/users
- PUT /api/users/{userId}/roles
- DELETE /api/users/{userId}

### 13.4 APOs

- GET /api/apos
- POST /api/apos
- POST /api/apos/rascunho
- PUT /api/apos/{id}/aluno/reenviar
- POST /api/apos/{id}/aluno/desistir
- POST /api/apos/{id}/orientador/aprovar
- POST /api/apos/{id}/orientador/devolver
- POST /api/apos/{id}/comissao/voto
- POST /api/apos/{id}/coordenacao/decisao?action=aprovar|reprovar|devolver
- POST /api/apos/{id}/secretaria/arquivar
- POST /api/apos/{id}/secretaria/lancar

### 13.5 Outros endpoints

- GET /api/students
- GET /api/notifications?recipient=...

## 14. Deploy em AWS com Terraform

### 14.1 O que terraform/ provisiona

- VPC
- subnet publica
- internet gateway
- security group
- EC2 Ubuntu
- Elastic IP
- volume EBS dedicado ao Docker

### 14.2 Security group esperado

- 22/tcp para SSH
- 80/tcp para HTTP
- 443/tcp para HTTPS

Objetivo atual: publicar a aplicacao somente por 80/443.

### 14.3 Variaveis relevantes do Terraform

| Variavel | Descricao |
|---|---|
| brevo_api_key | chave da API Brevo |
| brevo_from | remetente configurado |
| jwt_secret | segredo JWT |
| apoflow_site_address | dominio, hostname ou IP do proxy |
| apoflow_tls_mode | internal ou public |
| tls_email | e-mail usado no modo public |

### 14.4 Exemplo de terraform.tfvars

Opcao A: HTTPS com IP publico e certificado interno

```hcl
aws_region            = "us-east-1"
environment           = "production"
instance_type         = "t3.small"
ec2_key_pair_name     = "apoflow-key"
brevo_api_key         = "xkeysib-SUA_CHAVE_AQUI"
brevo_from            = "no-reply@seudominio.com"
jwt_secret            = "uma-chave-com-pelo-menos-32-caracteres"
apoflow_site_address  = ""
apoflow_tls_mode      = "internal"
tls_email             = ""
```

Opcao B: HTTPS publico valido com dominio

```hcl
aws_region            = "us-east-1"
environment           = "production"
instance_type         = "t3.small"
ec2_key_pair_name     = "apoflow-key"
brevo_api_key         = "xkeysib-SUA_CHAVE_AQUI"
brevo_from            = "no-reply@seudominio.com"
jwt_secret            = "uma-chave-com-pelo-menos-32-caracteres"
apoflow_site_address  = "apoflow.seudominio.com"
apoflow_tls_mode      = "public"
tls_email             = "admin@seudominio.com"
```

### 14.5 Deploy inicial

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform validate
terraform apply
```

### 14.6 Atualizar AWS com mudancas do repositorio

Se a infraestrutura ja existe, atualize sem recriar EC2. Use Terraform quando for necessario ajustar recursos de infra (security group, user-data, variaveis bootstrap).

```bash
cd /workspaces/APOFlow/terraform
terraform init
terraform plan
terraform apply
```

Depois confira as saidas:

```bash
terraform output app_url
terraform output app_http_url
terraform output app_https_url
terraform output ssh_command
```

### 14.7 Atualizar EC2 existente sem recriar tudo

Fluxo recomendado para atualizar aplicacao reaproveitando instancia e volume existentes:

```bash
EC2_IP=<SEU_IP_PUBLICO>
ssh -i ~/Downloads/apoflow-key.pem ubuntu@$EC2_IP

cd /opt/apoflow
git pull --ff-only
docker compose --env-file .env up -d --build
docker compose ps
docker compose logs --tail 100 proxy apoflow
```

Se .env ainda nao existir na EC2, crie uma unica vez antes do deploy:

```bash
cd /opt/apoflow
cp .env.example .env
nano .env
docker compose --env-file .env up -d --build
```

Se houver alteracoes locais na EC2 e git pull --ff-only falhar, revise antes de qualquer sobrescrita:

```bash
cd /opt/apoflow
git status
git pull --ff-only
docker compose --env-file .env up -d --build
```

### 14.8 Configurar dominio para HTTPS publico

1. crie registro A apontando o dominio para o Elastic IP da EC2
2. defina no terraform.tfvars:
   - apoflow_site_address = "seu-dominio"
   - apoflow_tls_mode = "public"
   - tls_email = "seu-email"
3. execute:

```bash
cd /workspaces/APOFlow/terraform
terraform apply
```

4. aguarde o Caddy emitir certificado automaticamente

## 15. Subida em maquina nova

```bash
git clone https://github.com/JP18090/APOFlow.git
cd APOFlow
cp .env.example .env
nano .env
docker compose --env-file .env up -d --build
docker compose ps
docker compose logs -f proxy apoflow
```

### 15.1 Exemplo de .env para localhost

```env
MONGODB_URI=mongodb://mongodb:27017/apoflow
EMAIL_ENABLED=true
BREVO_API_KEY=xkeysib-SUA_CHAVE_AQUI
BREVO_FROM=no-reply@seudominio.com
JWT_SECRET=sua-chave-super-segura-com-32-caracteres-ou-mais
APOFLOW_SITE_ADDRESS=localhost
APOFLOW_TLS_MODE=internal
TLS_EMAIL=
```

### 15.2 Exemplo de .env para EC2 com IP publico

```env
MONGODB_URI=mongodb://mongodb:27017/apoflow
EMAIL_ENABLED=true
BREVO_API_KEY=xkeysib-SUA_CHAVE_AQUI
BREVO_FROM=no-reply@seudominio.com
JWT_SECRET=sua-chave-super-segura-com-32-caracteres-ou-mais
APOFLOW_SITE_ADDRESS=3.91.10.20
APOFLOW_TLS_MODE=internal
TLS_EMAIL=
```

### 15.3 Exemplo de .env para EC2 com dominio

```env
MONGODB_URI=mongodb://mongodb:27017/apoflow
EMAIL_ENABLED=true
BREVO_API_KEY=xkeysib-SUA_CHAVE_AQUI
BREVO_FROM=no-reply@seudominio.com
JWT_SECRET=sua-chave-super-segura-com-32-caracteres-ou-mais
APOFLOW_SITE_ADDRESS=apoflow.seudominio.com
APOFLOW_TLS_MODE=public
TLS_EMAIL=admin@seudominio.com
```

## 16. Operacao do Docker

### 16.1 Comandos essenciais

```bash
docker compose --env-file .env up -d --build
docker compose ps
docker compose logs -f
docker compose restart
docker compose down
docker compose down --volumes --remove-orphans
```

### 16.2 Logs por servico

```bash
docker compose logs -f proxy
docker compose logs -f apoflow
docker compose logs -f mongodb
```

### 16.3 Testes de HTTP e HTTPS

```bash
curl -I http://localhost
curl -k -I https://localhost
curl -k https://localhost/api/users/me
```

## 17. Troubleshooting

### 17.1 HTTP funciona, HTTPS nao sobe

Possiveis causas:

- APOFLOW_TLS_MODE=public sem dominio valido
- TLS_EMAIL ausente no modo public
- porta 443 bloqueada na AWS

### 17.2 HTTPS abre com aviso de certificado

Comportamento esperado quando:

- APOFLOW_TLS_MODE=internal
- acesso por IP publico
- ausencia de dominio com certificado publico

### 17.3 Aplicacao nao sobe apos pull

Verifique:

```bash
docker compose config
docker compose logs --tail 100 proxy apoflow mongodb
```

### 17.4 MongoDB nao conecta

Valide se o container mongodb esta ativo e se a URI esta correta:

```bash
docker compose ps
docker compose logs mongodb
```

### 17.5 Login do admin falha

Confirme que o backend concluiu startup e aplicou seed inicial.

Credenciais esperadas:

- e-mail: admin@mackenzie.com
- senha: ADMmack123

## 18. Arquivos de referencia

- README.md: documentacao principal
- PackSP2.md: documentacao complementar
- Frontend/docs/use-cases.md: casos de uso da interface
- terraform/README.md: documentacao especifica de infraestrutura
- terraform/QUICKSTART.md: guia rapido de provisionamento

## 19. Resumo operacional rapido

### 19.1 Rodar localmente

```bash
git clone https://github.com/JP18090/APOFlow.git
cd APOFlow
cp .env.example .env
docker compose --env-file .env up -d --build
```

### 19.2 Atualizar EC2 existente

```bash
ssh -i ~/Downloads/apoflow-key.pem ubuntu@SEU_IP
cd /opt/apoflow
git pull --ff-only
docker compose --env-file .env up -d --build
```

### 19.3 Aplicar mudancas de Terraform

```bash
cd /workspaces/APOFlow/terraform
terraform init
terraform apply
```

### 19.4 Acesso esperado

- http://HOST
- https://HOST
- https://HOST/api

Para HTTPS publico sem aviso de certificado, use dominio real com APOFLOW_TLS_MODE=public.
