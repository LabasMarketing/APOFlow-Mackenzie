# PackSP2 — Documentação Completa do APOFlow

## 1. Visão Geral

O **APOFlow** é um sistema web para gerenciar o fluxo de Atividades Programadas Obrigatórias (APOs) do PPG-CA. Ele cobre submissão, avaliação em múltiplas etapas, arquivamento de evidências, notificações e apoio ao lançamento de créditos no sistema acadêmico.

O projeto é organizado em duas camadas principais — **Frontend** e **Backend** — empacotadas em uma única imagem Docker via build multi-stage.

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
| --------------- | ---------------------------------------------------------------------------------------------- |
| Frontend        | React 18, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Framer Motion, Sonner |
| Backend         | Java 21, Spring Boot 3, Spring Web, Spring Data JPA, H2 (em memória)                          |
| Containerização | Docker multi-stage, docker-compose                                                             |

---

## 3. Arquitetura Completa do Projeto

### 3.1 Árvore de Diretórios

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
    │           │       ├── api/             # Controllers, handlers e DTOs
    │           │       ├── config/          # Carga inicial e configuração
    │           │       ├── domain/          # Entidades e enums do domínio APO
    │           │       ├── repository/      # Acesso aos dados com Spring Data JPA
    │           │       └── service/         # Regras de negócio do workflow
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
    │   │   │   └── api.ts                   # Cliente HTTP e query keys
    │   │   ├── main.tsx                     # Entry point do React
    │   │   ├── pages/                       # Dashboards e telas por fluxo
    │   │   └── vite-env.d.ts
    │   ├── tailwind.config.ts
    │   ├── tsconfig.json
    │   └── vite.config.ts
    ├── README.md
    ├── Use_cases_APOflow.md
    └── PackSP2.md

### 3.2 Diagrama de Camadas

    ┌──────────────────────────────────────────────────────┐
    │                    Navegador                         │
    │           http://localhost:8080                       │
    └───────────────────────┬──────────────────────────────┘
                            │
                            ▼
    ┌──────────────────────────────────────────────────────┐
    │              Spring Boot (Java 21 JRE)               │
    │                                                      │
    │  ┌────────────────────┐  ┌─────────────────────────┐ │
    │  │  Arquivos Estáticos │  │      API REST           │ │
    │  │  (React build)      │  │      /api/...           │ │
    │  │  servidos de        │  │                         │ │
    │  │  /resources/static  │  │  Controllers (api/)     │ │
    │  └────────────────────┘  │  Services (service/)     │ │
    │                          │  Repositories (repo/)    │ │
    │                          │  Domain (domain/)        │ │
    │                          │  Config (config/)        │ │
    │                          └──────────┬──────────────┘ │
    │                                     │                │
    │                          ┌──────────▼──────────────┐ │
    │                          │     H2 em Memória       │ │
    │                          │  (carga inicial no      │ │
    │                          │   startup)              │ │
    │                          └─────────────────────────┘ │
    └──────────────────────────────────────────────────────┘

---

## 4. Arquitetura do Frontend

### 4.1 Entry Point

O ponto de entrada é `main.tsx`, que monta o React no DOM. O componente raiz é `App`, responsável por definir as rotas da aplicação.

### 4.2 Componentes Principais

| Componente      | Arquivo                                    | Responsabilidade                                 |
| --------------- | ------------------------------------------ | ------------------------------------------------ |
| `AppLayout`     | `Frontend/src/components/AppLayout.tsx`     | Layout principal com sidebar e área de conteúdo  |
| `AppSidebar`    | `Frontend/src/components/AppSidebar.tsx`    | Barra lateral de navegação por perfil            |
| `LoginPage`     | `Frontend/src/components/LoginPage.tsx`     | Formulário de autenticação                       |
| `MackenzieLogo` | `Frontend/src/components/MackenzieLogo.tsx` | Logotipo institucional                           |
| `NavLink`       | `Frontend/src/components/NavLink.tsx`       | Link de navegação reutilizável                   |

### 4.3 Contextos

O diretório `Frontend/src/contexts` contém providers de autenticação e estado global simples, compartilhados entre componentes.

### 4.4 Páginas

O diretório `Frontend/src/pages` contém os dashboards e telas específicas para cada ator do fluxo (aluno, orientador, comissão, coordenação, secretaria).

### 4.5 Cliente HTTP

O arquivo `Frontend/src/lib/api.ts` centraliza toda a comunicação com o backend. Ele expõe:

- **`request<T>`** — função genérica que faz `fetch` com `Content-Type: application/json` e tratamento de erros.
- **`queryKeys`** — chaves para cache do TanStack Query.
- **Funções de API**:
  - `login` — `POST /api/auth/login`
  - `getApos` — `GET /api/apos`
  - `getStudents` — `GET /api/students`
  - `getNotifications` — `GET /api/notifications?recipient=...`
  - `createApo` — `POST /api/apos`
  - `saveApoDraft` — `POST /api/apos/rascunho`
  - `resubmitApo` — `PUT /api/apos/{id}/aluno/reenviar`

### 4.6 Configuração do Frontend

| Arquivo                       | Propósito                                   |
| ----------------------------- | ------------------------------------------- |
| `Frontend/vite.config.ts`     | Configuração do Vite (bundler e dev server) |
| `Frontend/tsconfig.json`      | Configuração do TypeScript                  |
| `Frontend/tailwind.config.ts` | Configuração do Tailwind CSS                |
| `Frontend/postcss.config.js`  | Pipeline PostCSS                            |
| `Frontend/package.json`       | Dependências e scripts npm                  |

---

## 5. Arquitetura do Backend

### 5.1 Organização por Pacote

    com.apoflow.backend/
    ├── api/             # Controllers REST, handlers de exceção e DTOs
    ├── config/          # Carga inicial de dados e beans de configuração
    ├── domain/          # Entidades JPA e enums do domínio APO
    ├── repository/      # Interfaces Spring Data JPA
    └── service/         # Regras de negócio e orquestração do workflow

### 5.2 Camadas e Responsabilidades

| Camada           | Pacote        | Responsabilidade                                                                   |
| ---------------- | ------------- | ---------------------------------------------------------------------------------- |
| **Apresentação** | `api/`        | Receber requisições HTTP, validar entrada, delegar ao service e retornar resposta  |
| **Negócio**      | `service/`    | Implementar regras do workflow de APOs, transições de estado, validações de domínio |
| **Persistência** | `repository/` | Acesso aos dados via Spring Data JPA (interfaces que estendem `JpaRepository`)     |
| **Domínio**      | `domain/`     | Entidades (`APO`, `Usuario`, etc.) e enums (`Status`, `Role`, etc.)                |
| **Configuração** | `config/`     | Carga inicial de dados em memória no startup da aplicação                          |

### 5.3 Banco de Dados

- **H2 em memória** — o banco é criado e populado automaticamente durante o startup.
- Não há persistência entre reinicializações — ideal para demonstração e prototipação.

### 5.4 Dependências (Maven)

Gerenciadas em `Backend/pom.xml`:

- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- H2 Database (runtime)

---

## 6. API REST — Endpoints

Todos os endpoints estão sob o prefixo `/api`.

### 6.1 Autenticação

| Método | Rota              | Descrição                                        |
| ------ | ----------------- | ------------------------------------------------ |
| `POST` | `/api/auth/login` | Login por e-mail e senha; retorna objeto Usuario |

### 6.2 Alunos

| Método | Rota            | Descrição                       |
| ------ | --------------- | ------------------------------- |
| `GET`  | `/api/students` | Lista resumo de todos os alunos |

### 6.3 APOs

| Método | Rota                            | Descrição                   |
| ------ | ------------------------------- | --------------------------- |
| `GET`  | `/api/apos`                     | Lista todas as APOs         |
| `POST` | `/api/apos`                     | Cria e submete uma nova APO |
| `POST` | `/api/apos/rascunho`            | Salva APO como rascunho     |
| `PUT`  | `/api/apos/{id}/aluno/reenviar` | Aluno reenvia APO devolvida |
| `POST` | `/api/apos/{id}/aluno/desistir` | Aluno desiste da APO        |

### 6.4 Orientador

| Método | Rota                                 | Descrição                            |
| ------ | ------------------------------------ | ------------------------------------ |
| `POST` | `/api/apos/{id}/orientador/aprovar`  | Orientador aprova a APO              |
| `POST` | `/api/apos/{id}/orientador/devolver` | Orientador devolve com justificativa |

### 6.5 Comissão

| Método | Rota                           | Descrição                        |
| ------ | ------------------------------ | -------------------------------- |
| `POST` | `/api/apos/{id}/comissao/voto` | Membro da comissão registra voto |

### 6.6 Coordenação

| Método | Rota                                              | Descrição                    |
| ------ | ------------------------------------------------- | ---------------------------- |
| `POST` | `/api/apos/{id}/coordenacao/decisao?action=...`   | Decisão final da coordenação |

Valores possíveis para `action`: `aprovar`, `reprovar`, `devolver`.

### 6.7 Secretaria

| Método | Rota                                 | Descrição                |
| ------ | ------------------------------------ | ------------------------ |
| `POST` | `/api/apos/{id}/secretaria/arquivar` | Secretaria arquiva a APO |
| `POST` | `/api/apos/{id}/secretaria/lancar`   | Secretaria lança créditos|

### 6.8 Notificações

| Método | Rota                                   | Descrição               |
| ------ | -------------------------------------- | ----------------------- |
| `GET`  | `/api/notifications?recipient={perfil}`| Notificações por perfil |

Valores possíveis para `recipient`: `aluno`, `orientador`, `comissao`, `coordenacao`, `secretaria`.

---

## 7. Funcionalidades

- Autenticação por e-mail e senha
- Dashboard específico para cada ator do fluxo
- Formulário de submissão de APO com opção de salvar rascunho
- Visualização de rascunhos e APOs enviadas pelo aluno
- Pontos por atividade na tela de APOs do aluno
- Notificações in-app simuladas
- Troca de perfil para professor entre orientador, comissão e coordenação
- Workflow completo de avaliação multi-etapa

---

## 8. Containerização e Deploy

### 8.1 Dockerfile — Build Multi-Stage

O `Dockerfile` possui três estágios:

| Estágio          | Base                             | Responsabilidade                                                                                          |
| ---------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `frontend-build` | `node:20-alpine`                 | Instala dependências npm e gera build estático do React (`npm run build`)                                 |
| `backend-build`  | `maven:3.9.9-eclipse-temurin-21` | Resolve dependências Maven, copia o build do frontend para `src/main/resources/static/` e empacota o JAR  |
| `runtime`        | `eclipse-temurin:21-jre`         | Imagem final enxuta; executa apenas o JAR em `java -jar /app/app.jar` na porta `8080`                     |

### 8.2 docker-compose.yml

O arquivo `docker-compose.yml` orquestra a execução da aplicação.

### 8.3 Comandos

**Subir a aplicação:**

    docker compose up --build

**Subir em segundo plano:**

    docker compose up --build -d

**Parar:**

    docker compose down

**Ver logs:**

    docker compose logs -f

**Remover tudo:**

    docker compose down --volumes --remove-orphans

---

## 9. Fluxo de Runtime

    Navegador ──► http://localhost:8080
                       │
                       ▼
              Spring Boot serve:
              ├── Arquivos estáticos React (/)
              └── API REST (/api/...)
                       │
                       ▼
              H2 em memória (dados carregados no startup)

1. O navegador acessa `http://localhost:8080`.
2. O Spring Boot entrega a interface React já buildada.
3. O frontend chama rotas REST em `/api/...`.
4. O backend processa autenticação, APOs, notificações e workflow dos perfis.
5. Os dados vivem em H2 em memória para fins de demonstração.

---

## 10. Credenciais de Acesso (Protótipo)

| Perfil      | Email institucional (seed)      | Senha |
|-------------|----------------------------------|-------|
| Aluno       | `10427372@mackenzista.com.br`   | definida por `SEED_ALUNO_PASSWORD` |
| Orientador  | `10437996@mackenzista.com.br`   | definida por `SEED_ORIENTADOR_PASSWORD` |
| Comissão    | `10443681@mackenzista.com.br`   | definida por `SEED_COMISSAO_PASSWORD` |
| Coordenação | `10438932@mackenzista.com.br`   | definida por `SEED_COORDENACAO_PASSWORD` |
| Secretaria  | `10438938@mackenzista.com.br`   | definida por `SEED_SECRETARIA_PASSWORD` |

---

## 11. Documentos Relacionados

| Documento                     | Caminho                      |
| ----------------------------- | ---------------------------- |
| README principal              | `README.md`                  |
| Casos de uso detalhados       | `Frontend/docs/use-cases.md` |
| Casos de uso (documento raiz) | `Use_cases_APOflow.md`       |

---

## 12. Fluxo de Desenvolvimento

1. Altere o código no Frontend ou Backend.
2. Reconstrua e suba a aplicação:

        docker compose up --build

3. Abra no navegador:

        "$BROWSER" http://localhost:8080

4. Faça login com um dos perfis da tabela de credenciais.
5. Teste os fluxos de submissão, devolução, comissão, coordenação e secretaria.