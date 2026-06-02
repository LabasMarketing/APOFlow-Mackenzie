# Auditoria de Seguranca - APOFlow

## 1. Prompt Geral de Auditoria de Seguranca (OWASP Top 10)

### Achados principais (ordem de severidade)

1. Critico: ausencia de autenticacao/autorizacao no backend (quebra de controle de acesso).
   - Referencias: `Backend/src/main/java/com/apoflow/backend/api/ApoController.java:21`, `Backend/src/main/java/com/apoflow/backend/api/NotificationController.java:13`, `Backend/pom.xml:27`.
   - Impacto: qualquer cliente consegue chamar endpoints de aprovacao, lancamento e arquivamento sem identidade valida.

2. Critico: senhas em texto puro e autenticacao comparando senha direta.
   - Referencias: `Backend/src/main/java/com/apoflow/backend/domain/AppUser.java:24`, `Backend/src/main/java/com/apoflow/backend/service/AuthService.java:18`, `Backend/src/main/java/com/apoflow/backend/repository/AppUserRepository.java:11`.
   - Impacto: vazamento de base expoe credenciais imediatamente.

3. Alto: credenciais hardcoded em seed e documentacao.
   - Referencias: `Backend/src/main/java/com/apoflow/backend/config/DataInitializer.java:40`, `Backend/src/main/java/com/apoflow/backend/config/DataInitializer.java:44`, `README.md:173`, `README.md:177`, `PackSP2.md:342`, `PackSP2.md:346`.
   - Impacto: facilita credential stuffing e acesso indevido.

4. Alto: CORS aberto para qualquer origem.
   - Referencia: `Backend/src/main/java/com/apoflow/backend/config/WebConfig.java:14`.
   - Impacto: qualquer site pode orquestrar chamadas ao backend via navegador.

5. Medio: exposicao de detalhes de erro de negocio ao cliente.
   - Referencia: `Backend/src/main/java/com/apoflow/backend/api/ApiExceptionHandler.java:17`.
   - Impacto: ajuda reconhecimento de regras internas por atacante.

6. Medio: console H2 habilitado.
   - Referencia: `Backend/src/main/resources/application.properties:13`.
   - Impacto: superficie extra de ataque se publicado fora de ambiente controlado.

7. Baixo/Medio: estado de usuario no frontend em localStorage e troca de papel no cliente.
   - Referencias: `Frontend/src/contexts/AuthContext.tsx:22`, `Frontend/src/contexts/AuthContext.tsx:36`, `Frontend/src/contexts/AuthContext.tsx:55`.
   - Impacto: facilita manipulacao de UI; com backend sem autorizacao vira escalonamento real.

### Mapeamento OWASP Top 10

- SQL Injection: nao encontrei concatenacao SQL manual; uso de Spring Data reduz risco direto.
- XSS: nao ha uso de APIs perigosas de HTML cru no frontend analisado.
- CSRF: risco secundario no estado atual (sem sessao/cookie de auth), mas deve ser tratado ao introduzir auth baseada em cookie.
- Broken Authentication: presente e grave (sem Spring Security/JWT, senha em texto puro, credenciais publicas).
- Security Misconfiguration: presente (CORS aberto, H2 console habilitada).
- Sensitive Data Exposure: presente (credenciais em codigo/docs).

### Correcao recomendada (resumo)

- Implementar Spring Security com JWT/OAuth2 e autorizacao por papel no backend.
- Hash de senha com BCrypt/Argon2 (nunca persistir senha em claro).
- Remover credenciais do repositorio e usar variaveis de ambiente/secret manager.
- Restringir CORS por lista explicita de dominios confiaveis.
- Desabilitar H2 console fora de desenvolvimento.
- Padronizar mensagens de erro sem vazar detalhes internos.

---

## 2. Prompt para Validacao de Entrada e SQL Injection

### Diagnostico

- SQL Injection classico: nao evidenciado no trecho analisado.
- Manipulacao de parametros/autorizacao: sim, vulneravel por falta de controle de identidade e permissao.
- Validacao de entrada: existe validacao basica com Bean Validation (`@NotBlank`, `@Min`, `@Max`), mas faltam validacoes semanticas e autorizacao por recurso.

Funcao mais sensivel observada: `Backend/src/main/java/com/apoflow/backend/service/AuthService.java:17`.

### Reescrita segura sugerida (ORM + hash)

Objetivo:
- Repositorio buscar usuario apenas por e-mail.
- Comparar senha com `BCryptPasswordEncoder`.
- Retornar token assinado (JWT).

Exemplo:

```java
public UserResponse loginByCredentials(String email, String senha) {
    String normalizedEmail = email == null ? "" : email.trim().toLowerCase();

    AppUser user = appUserRepository.findByEmailIgnoreCase(normalizedEmail)
            .orElseThrow(() -> new IllegalArgumentException("Credenciais invalidas."));

    if (!passwordEncoder.matches(senha, user.getSenhaHash())) {
        throw new IllegalArgumentException("Credenciais invalidas.");
    }

    String token = jwtService.generateToken(user.getId(), user.getPapel().name());

    return new UserResponse(
            user.getId(),
            user.getNome(),
            user.getEmail(),
            user.getPapel().name().toLowerCase(),
            token
    );
}
```

Observacao: alem do login, as rotas de negocio devem verificar papel/permissao no backend (nao apenas no frontend).

---

## 3. Prompt para Gerenciamento de Segredos e Configuracoes

### Problemas detectados

- Credenciais em seed e documentos:
  - `Backend/src/main/java/com/apoflow/backend/config/DataInitializer.java:40`
  - `README.md:173`
- Configuracao sensivel sem separacao robusta por ambiente:
  - `Backend/src/main/resources/application.properties:6`

### Melhor pratica recomendada

1. Substituir valores fixos por placeholders em `application.properties`:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
spring.h2.console.enabled=${H2_CONSOLE_ENABLED:false}
```

2. Armazenar credenciais em:
- Variaveis de ambiente no container/orquestrador.
- Secret manager (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault, etc.).

3. Em desenvolvimento:
- Usar `.env` local nao versionado.
- Nunca publicar senhas reais em `README.md`, documentos tecnicos ou seeds com dados reais.

---

## 4. Prompt para Revisao de Pull Request (foco seguranca)

Como nao foi fornecido diff de PR, a revisao foi feita sobre o estado atual do codigo.

### Ha vazamento de dados sensiveis?

Sim.
- Evidencias: `Backend/src/main/java/com/apoflow/backend/config/DataInitializer.java:40`, `README.md:173`, `PackSP2.md:342`.

### Bibliotecas importadas estao atualizadas e seguras?

- Frontend: dependencias aparentam recentes.
- Backend: falta stack de seguranca (Spring Security) no POM atual.
- Observacao: sem SCA automatizado (Snyk, Dependabot, OWASP Dependency-Check), nao e possivel garantir ausencia de CVEs.

### Tratamento de erros revela informacoes tecnicas sensiveis?

Parcialmente sim.
- Nao ha stack trace exposto diretamente.
- Mas ha retorno direto da mensagem da excecao para cliente em `Backend/src/main/java/com/apoflow/backend/api/ApiExceptionHandler.java:17`, o que pode expor logica interna.

Recomendacao:
- Adotar payload de erro padrao com codigo e mensagem generica para cliente.
- Detalhes tecnicos somente em log interno com correlacao por `traceId`.

---

## 5. Prompt de Simulacao de Ataque (PenTest IA)

Base: Spring Boot + React

### Cenario 1: Alteracao nao autorizada de status (Broken Access Control)

- Vetor: chamada direta aos endpoints de aprovacao/lancamento sem token/perfil valido.
- Exemplo: `POST /api/apos/{id}/secretaria/lancar`.
- Impacto: fraude academica e quebra de integridade do fluxo de aprovacao.

### Cenario 2: Credential stuffing com credenciais conhecidas

- Vetor: uso de usuarios/senhas expostos em documentacao e seed.
- Impacto: acesso indevido a multiplos papeis e operacoes criticas.

### Cenario 3: Abuso cross-origin devido CORS aberto

- Vetor: pagina maliciosa dispara requests para API a partir do navegador de vitimas.
- Impacto: automacao de chamadas indevidas e ampliacao da superficie de ataque.

---

## Dicas para Melhores Resultados

- Contexto e rei: sempre informar linguagem, framework e objetivo do codigo analisado.
- Seja especifico: se houver suspeita, citar explicitamente (ex.: insecure deserialization, SSRF, IDOR).
- Verifique a IA: nunca aplicar sugestoes sem validacao tecnica, teste e revisao humana.

---

## Plano de remediacao priorizado (acoes praticas)

1. Bloquear risco critico imediatamente:
- Adicionar `spring-boot-starter-security`.
- Exigir autenticacao em todas as rotas sensiveis.
- Implementar autorizacao por papel no backend.

2. Corrigir autenticacao:
- Migrar senha para hash BCrypt/Argon2.
- Remover comparacao de senha direta no repositorio.
- Emitir e validar JWT.

3. Remover exposicoes:
- Eliminar credenciais hardcoded de seed/docs.
- Externalizar segredos para variaveis de ambiente/secret manager.

4. Hardening de configuracao:
- Restringir CORS por ambiente.
- Desativar H2 console em homologacao/producao.
- Ajustar tratamento de erros para evitar leakage.

5. Governanca continua:
- Ativar Dependabot/SCA.
- Incluir SAST e DAST no pipeline CI/CD.
- Criar checklist de seguranca para PR.
