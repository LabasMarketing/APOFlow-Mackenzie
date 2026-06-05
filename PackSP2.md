# PackSP2 — Documentação Completa do APOFlow

## 1. Visão Geral

O **APOFlow** é um sistema web para gerenciar o fluxo de Atividades Programadas Obrigatórias (APOs) do PPG-CA. Ele cobre submissão, avaliação em múltiplas etapas, notificações, gerenciamento de papéis institucionais e autenticação segura com OTP.

O projeto é organizado em duas camadas principais — **Frontend** e **Backend** — empacotadas em uma única imagem Docker via build multi-stage, com MongoDB como banco de dados principal.

### Fluxo de negócio coberto

1. **Aluno** submete APO com descrição, pontos e anexos.
2. **Orientador** avalia e pode aprovar ou devolver com justificativa.
3. **Aluno** pode editar e reenviar APO devolvida, ou desistir.
4. **Comissão** registra votos e consolida parecer.
5. **Coordenação** toma a decisão final (aprovar, reprovar ou devolver).
6. **Secretaria** arquiva e realiza o lançamento quando o aluno atinge 12 pontos.

---

## 2. Stack Tecnológica

| Camada          | Tecnologias                                                                                    |
|-----------------|-----------------------------------------------------------------------------------------------|
| Frontend        | React 18, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Framer Motion, Sonner |
| Backend         | Java 25, Spring Boot, Spring Security, Spring Data MongoDB, JWT stateless, Brevo (e-mail OTP) |
| Banco de dados  | MongoDB 7.0 (container Docker com volume persistente)                                          |
| Containerização | Docker multi-stage (node:20-alpine → eclipse-temurin:25-jdk → eclipse-temurin:25-jre)         |

---

## 3. Arquitetura Completa do Projeto

### 3.1 Árvore de Diretórios

```
.
├── .dockerignore
├── .gitignore
├── .vscode/
│   └── settings.json
├── Backend/
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/apoflow/backend/
│           │       ├── api/             # Controllers REST, handlers e DTOs
│           │       ├── config/          # Seed inicial, segurança e beans de config
│           │       ├── domain/          # Documents MongoDB e enums do domínio APO
│           │       ├── repository/      # Interfaces Spring Data MongoDB
│           │       └── service/         # Regras de negócio e orquestração do workflow
│           └── resources/
├── docker-compose.yml
├── Dockerfile
├── Frontend/
│   ├── docs/
│   │   └── use-cases.md
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── public/
│   ├── src/
│   │   ├── App.tsx                      # Raiz da aplicação React e rotas
│   │   ├── components/
│   │   │   ├── AppLayout.tsx            # Layout principal da aplicação
│   │   │   ├── AppSidebar.tsx           # Sidebar de navegação
│   │   │   ├── LoginPage.tsx            # Tela de login
│   │   │   ├── MackenzieLogo.tsx        # Componente do logotipo
│   │   │   ├── NavLink.tsx              # Link de navegação reutilizável
│   │   │   └── ...                      # Demais componentes de UI
│   │   ├── contexts/                    # Autenticação e estado global
│   │   ├── index.css                    # Estilos globais (Tailwind)
│   │   ├── lib/
│   │   │   └── api.ts                   # Cliente HTTP, tipos e query keys
│   │   ├── main.tsx                     # Entry point do React
│   │   ├── pages/                       # Dashboards e telas por fluxo
│   │   └── vite-env.d.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
├── terraform/                           # Provisionamento AWS (EC2, VPC, EIP)
├── PackSP2.md
├── README.md
└── Segurity.md
```

### 3.2 Diagrama de Camadas

```
┌──────────────────────────────────────────────────────┐
│                    Navegador                         │
│              http://localhost (porta 80)             │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│         Spring Boot (Java 25 JRE) — porta 8080       │
│         mapeada para 80 pelo Docker Compose          │
│                                                      │
│  ┌────────────────────┐  ┌─────────────────────────┐ │
│  │  Arquivos Estáticos │  │      API REST           │ │
│  │  (React build)      │  │      /api/...           │ │
│  │  /resources/static  │  │                         │ │
│  └────────────────────┘  │  Controllers  (api/)     │ │
│                          │  Services     (service/) │ │
│                          │  Repositories (repo/)    │ │
│                          │  Domain       (domain/)  │ │
│                          │  Config       (config/)  │ │
│                          └──────────┬──────────────┘ │
└─────────────────────────────────────┼────────────────┘
                                      │
┌─────────────────────────────────────▼────────────────┐
│            MongoDB 7.0 (container Docker)            │
│         volume persistente: mongo_data:/data/db      │
└──────────────────────────────────────────────────────┘
```

---

## 4. Arquitetura do Frontend

### 4.1 Entry Point

O ponto de entrada é `main.tsx`, que monta o React no DOM. O componente raiz é `App`, responsável por definir as rotas da aplicação.

### 4.2 Componentes Principais

| Componente      | Arquivo                                     | Responsabilidade                                 |
|-----------------|---------------------------------------------|--------------------------------------------------|
| `AppLayout`     | `Frontend/src/components/AppLayout.tsx`     | Layout principal com sidebar e área de conteúdo  |
| `AppSidebar`    | `Frontend/src/components/AppSidebar.tsx`    | Barra lateral de navegação por perfil            |
| `LoginPage`     | `Frontend/src/components/LoginPage.tsx`     | Formulário de autenticação (e-mail, senha + OTP) |
| `MackenzieLogo` | `Frontend/src/components/MackenzieLogo.tsx` | Logotipo institucional                           |
| `NavLink`       | `Frontend/src/components/NavLink.tsx`       | Link de navegação reutilizável                   |

### 4.3 Contextos

O diretório `Frontend/src/contexts` contém providers de autenticação e estado global compartilhados entre componentes. Gerencia o token JWT, o usuário logado e redirecionamentos por expiração de sessão.

### 4.4 Páginas

O diretório `Frontend/src/pages` contém os dashboards e telas específicas para cada ator do fluxo (aluno, orientador, comissão, coordenação, secretaria, admin).

### 4.5 Cliente HTTP

O arquivo `Frontend/src/lib/api.ts` centraliza toda a comunicação com o backend. Ele expõe:

- **`request<T>`** — função genérica que faz `fetch` com `Content-Type: application/json`, injeta o JWT e trata erros (incluindo 401).
- **`queryKeys`** — chaves para cache do TanStack Query.
- **Funções de API**: `login`, `verifyOtp`, `getApos`, `getStudents`, `getNotifications`, `createApo`, `saveApoDraft`, `resubmitApo`, entre outras.

### 4.6 Configuração do Frontend

| Arquivo                       | Propósito                                   |
|-------------------------------|---------------------------------------------|
| `Frontend/vite.config.ts`     | Configuração do Vite (bundler e dev server) |
| `Frontend/tsconfig.json`      | Configuração do TypeScript                  |
| `Frontend/tailwind.config.ts` | Configuração do Tailwind CSS                |
| `Frontend/postcss.config.js`  | Pipeline PostCSS                            |
| `Frontend/package.json`       | Dependências e scripts npm                  |

---

## 5. Arquitetura do Backend

### 5.1 Organização por Pacote

```
com.apoflow.backend/
├── api/             # Controllers REST, handlers de exceção e DTOs
├── config/          # Seed inicial (admin fixo), segurança JWT e beans de config
├── domain/          # Documents MongoDB e enums do domínio APO
├── repository/      # Interfaces Spring Data MongoDB
└── service/         # Regras de negócio e orquestração do workflow
```

### 5.2 Camadas e Responsabilidades

| Camada           | Pacote        | Responsabilidade                                                                       |
|------------------|---------------|----------------------------------------------------------------------------------------|
| **Apresentação** | `api/`        | Receber requisições HTTP, validar entrada, delegar ao service e retornar resposta      |
| **Negócio**      | `service/`    | Implementar regras do workflow de APOs, transições de estado, geração e validação de OTP|
| **Persistência** | `repository/` | Acesso aos dados via Spring Data MongoDB                                               |
| **Domínio**      | `domain/`     | Documents (`APO`, `Usuario`) e enums (`Status`, `Role`)                                |
| **Configuração** | `config/`     | Criação do admin fixo no startup, configuração de segurança JWT, CORS                  |

### 5.3 Banco de Dados

- **MongoDB 7.0** — banco persistente em container Docker com volume nomeado (`mongo_data`).
- Os dados sobrevivem a reinicializações do container enquanto o volume existir.
- URI de conexão: `mongodb://mongodb:27017/apoflow`

### 5.4 Autenticação

- **JWT stateless** — token enviado em `Authorization: Bearer` em todas as requisições protegidas.
- **OTP por e-mail** — usuários comuns recebem um código temporário via Brevo após validação de senha.
- **Admin fixo** — conta `admin@mackenzie.com` bypassa o OTP e recebe JWT diretamente.
- **Seed automático** — o admin fixo é criado no startup caso não exista no banco.

### 5.5 Dependências (Maven)

Gerenciadas em `Backend/pom.xml`:

- Spring Boot Starter Web
- Spring Boot Starter Security
- Spring Boot Starter Data MongoDB
- JWT (autenticação stateless)
- Brevo SDK / HTTP API (envio de OTP)

---

## 6. API REST — Endpoints

Todos os endpoints estão sob o prefixo `/api`.

### 6.1 Autenticação

| Método | Rota                              | Descrição                         |
|--------|-----------------------------------|-----------------------------------|
| `POST` | `/api/auth/register`              | Cadastrar novo usuário            |
| `POST` | `/api/auth/login`                 | Login com e-mail e senha          |
| `POST` | `/api/auth/verify-otp`            | Verificar OTP recebido por e-mail |
| `POST` | `/api/auth/change-password`       | Alterar senha (autenticado)       |
| `POST` | `/api/auth/forgot-password`       | Solicitar redefinição de senha    |
| `POST` | `/api/auth/reset-password`        | Redefinir senha via token         |
| `GET`  | `/api/auth/first-access/{email}`  | Verificar primeiro acesso         |

### 6.2 Usuário autenticado

| Método   | Rota            | Descrição                 |
|----------|-----------------|---------------------------|
| `GET`    | `/api/users/me` | Dados do usuário logado   |
| `PUT`    | `/api/users/me` | Atualizar perfil próprio  |
| `DELETE` | `/api/users/me` | Excluir própria conta     |

### 6.3 Administração de usuários

| Método   | Rota                        | Descrição                       |
|----------|-----------------------------|---------------------------------|
| `GET`    | `/api/users`                | Listar todos os usuários        |
| `PUT`    | `/api/users/{userId}/roles` | Atualizar papéis de um usuário  |
| `DELETE` | `/api/users/{userId}`       | Excluir usuário                 |

### 6.4 APOs

| Método | Rota                            | Descrição                    |
|--------|---------------------------------|------------------------------|
| `GET`  | `/api/apos`                     | Listar APOs do contexto      |
| `POST` | `/api/apos`                     | Submeter nova APO            |
| `POST` | `/api/apos/rascunho`            | Salvar APO como rascunho     |
| `PUT`  | `/api/apos/{id}/aluno/reenviar` | Reenviar APO devolvida       |
| `POST` | `/api/apos/{id}/aluno/desistir` | Desistir da APO              |

### 6.5 Orientador

| Método | Rota                                 | Descrição                              |
|--------|--------------------------------------|----------------------------------------|
| `POST` | `/api/apos/{id}/orientador/aprovar`  | Aprovar APO                            |
| `POST` | `/api/apos/{id}/orientador/devolver` | Devolver com justificativa             |

### 6.6 Comissão

| Método | Rota                           | Descrição                          |
|--------|--------------------------------|------------------------------------|
| `POST` | `/api/apos/{id}/comissao/voto` | Registrar voto da comissão         |

### 6.7 Coordenação

| Método | Rota                                            | Descrição                    |
|--------|-------------------------------------------------|------------------------------|
| `POST` | `/api/apos/{id}/coordenacao/decisao?action=...` | Decisão final da coordenação |

Valores possíveis para `action`: `aprovar`, `reprovar`, `devolver`.

### 6.8 Secretaria

| Método | Rota                                 | Descrição                  |
|--------|--------------------------------------|----------------------------|
| `POST` | `/api/apos/{id}/secretaria/arquivar` | Arquivar APO               |
| `POST` | `/api/apos/{id}/secretaria/lancar`   | Lançar créditos            |

### 6.9 Outros

| Método | Rota                                    | Descrição               |
|--------|-----------------------------------------|-------------------------|
| `GET`  | `/api/students`                         | Listar alunos           |
| `GET`  | `/api/notifications?recipient={perfil}` | Notificações por perfil |

---

## 7. Funcionalidades

- Autenticação por e-mail, senha e OTP (dois fatores via e-mail)
- Admin fixo sem OTP, criado automaticamente no startup
- Painel admin para listagem, filtro, troca de papéis e exclusão de usuários
- Dashboard específico para cada ator do fluxo
- Formulário de submissão de APO com opção de salvar rascunho
- Visualização de rascunhos e APOs enviadas pelo aluno
- Pontos por atividade na tela de APOs do aluno
- Notificações in-app por perfil
- Workflow completo de avaliação multi-etapa
- Sessão JWT com expiração e redirecionamento automático

---

## 8. Containerização e Deploy

### 8.1 Dockerfile — Build Multi-Stage

| Estágio          | Base                      | Responsabilidade                                                                                          |
|------------------|---------------------------|-----------------------------------------------------------------------------------------------------------|
| `frontend-build` | `node:20-alpine`          | Instala dependências npm e gera build estático do React (`npm run build`)                                 |
| `backend-build`  | `eclipse-temurin:25-jdk`  | Instala Maven, copia o build do frontend para `src/main/resources/static/` e empacota o JAR              |
| `runtime`        | `eclipse-temurin:25-jre`  | Imagem final enxuta; executa apenas o JAR em `java -jar /app/app.jar` na porta interna `8080`             |

### 8.2 docker-compose.yml

O Compose orquestra dois serviços:

- **mongodb** — MongoDB 7.0 com volume persistente, exposto na porta 27017 do host.
- **apoflow** — imagem buildada via Dockerfile, exposta na porta **80** do host (mapeada do 8080 interno).

Variáveis relevantes passadas ao container `apoflow`:

```yaml
MONGODB_URI: mongodb://mongodb:27017/apoflow
SPRING_MONGODB_URI: mongodb://mongodb:27017/apoflow
APP_BASE_URL: ${APP_BASE_URL:-http://localhost}
APP_CORS_ALLOWED_ORIGINS: ${APP_CORS_ALLOWED_ORIGINS:-http://localhost,...}
EMAIL_ENABLED: true
BREVO_TOKEN: ${BREVO_TOKEN}
BREVO_FROM: ${BREVO_FROM}
```

### 8.3 Comandos

**Subir a aplicação:**

```bash
docker compose --env-file .env up -d --build
```

**Ver status:**

```bash
docker compose ps
```

**Parar:**

```bash
docker compose down
```

**Ver logs:**

```bash
docker compose logs -f apoflow mongodb
```

**Remover tudo (inclusive volumes):**

```bash
docker compose down --volumes --remove-orphans
```

---

## 9. Fluxo de Runtime

```
Navegador ──► http://localhost (porta 80)
                   │
                   ▼
          Spring Boot (porta interna 8080)
          ├── Arquivos estáticos React (/)
          └── API REST (/api/...)
                   │
                   ▼
          MongoDB 7.0 (container mongodb)
          volume: mongo_data
```

1. O navegador acessa `http://localhost`.
2. O Docker Compose mapeia porta 80 → 8080 do container `apoflow`.
3. O Spring Boot entrega a interface React já buildada.
4. O frontend chama rotas REST em `/api/...` com JWT no header.
5. O backend processa autenticação (OTP, JWT), APOs e workflow dos perfis.
6. Os dados são persistidos no MongoDB com volume nomeado.

---

## 10. Credenciais de Acesso

### Admin fixo (sem OTP)

| Campo  | Valor                  |
|--------|------------------------|
| E-mail | `admin@mackenzie.com`  |
| Senha  | `ADMmack123`           |

O admin fixo é criado automaticamente no startup. Não pode ser excluído nem ter papéis alterados por fluxos administrativos padrão.

### Usuários comuns (seed de desenvolvimento)

Para testes locais, seeds podem ser carregados via configuração. Consulte `Backend/src/main/java/.../config/` para a lógica de seed e as variáveis de ambiente correspondentes (`SEED_*_PASSWORD`).

---

## 11. Documentos Relacionados

| Documento                     | Caminho                      |
|-------------------------------|------------------------------|
| README principal              | `README.md`                  |
| Casos de uso detalhados       | `Frontend/docs/use-cases.md` |
| Considerações de segurança    | `Segurity.md`                |
| Provisionamento AWS           | `terraform/README.md`        |
| Guia rápido Terraform         | `terraform/QUICKSTART.md`    |

---

## 12. Fluxo de Desenvolvimento

1. Altere o código no Frontend ou Backend.

2. Reconstrua e suba a aplicação:

```bash
docker compose --env-file .env up -d --build
```

3. Abra no navegador:

```
http://localhost
```

4. Faça login com o admin fixo ou com um usuário seed.

5. Teste os fluxos de submissão, devolução, comissão, coordenação e secretaria.
