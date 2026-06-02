package com.apoflow.backend.config;

import com.apoflow.backend.domain.Apo;
import com.apoflow.backend.domain.ApoAttachment;
import com.apoflow.backend.domain.ApoStatus;
import com.apoflow.backend.domain.ApoVote;
import com.apoflow.backend.domain.AppNotification;
import com.apoflow.backend.domain.AppUser;
import com.apoflow.backend.domain.Role;
import com.apoflow.backend.domain.Student;
import com.apoflow.backend.domain.VoteDecision;
import com.apoflow.backend.repository.ApoRepository;
import com.apoflow.backend.repository.AppNotificationRepository;
import com.apoflow.backend.repository.AppUserRepository;
import com.apoflow.backend.repository.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.List;
import java.time.LocalDateTime;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;


@Configuration
@SuppressWarnings("null")
public class DataInitializer {

    @Bean
    CommandLineRunner seedData(
            AppUserRepository userRepository,
            StudentRepository studentRepository,
            ApoRepository apoRepository,
            AppNotificationRepository notificationRepository
    ) {
        return args -> {
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

                        ensureAdminUser(userRepository, passwordEncoder);

                        if (userRepository.count() > 1) {
                return;
            }

            // Create demo users with authentication fields
            AppUser aluno = new AppUser();
            aluno.setId("aluno-1");
            aluno.setNome("Jose Pedro Bitetti");
            aluno.setEmail("10427372@mackenzista.com.br");
            aluno.setSenhaHash(passwordEncoder.encode(resolveSeedPassword("SEED_ALUNO_PASSWORD", "JosePedro123@")));
            aluno.setPapel(Role.ALUNO);
            aluno.setPapeis(List.of(Role.ALUNO));
            aluno.setPrimeiroAcesso(true);
            aluno.setRequerMudancaSenha(true);
            aluno.setHabilitado(true);
            aluno.setContaNaoExpirada(true);
            aluno.setContaNaoBloqueada(true);
            aluno.setCredenciaisNaoExpiradas(true);
            aluno.setCriadoEm(LocalDateTime.now());
            aluno.setAtualizadoEm(LocalDateTime.now());

            AppUser orientador = new AppUser();
            orientador.setId("orientador-1");
            orientador.setNome("Gustavo Neto");
            orientador.setEmail("10437996@mackenzista.com.br");
            orientador.setSenhaHash(passwordEncoder.encode(resolveSeedPassword("SEED_ORIENTADOR_PASSWORD", "GustavoNeto123@")));
            orientador.setPapel(Role.ORIENTADOR);
            orientador.setPapeis(List.of(Role.ORIENTADOR, Role.COORDENACAO));
            orientador.setPrimeiroAcesso(true);
            orientador.setRequerMudancaSenha(true);
            orientador.setHabilitado(true);
            orientador.setContaNaoExpirada(true);
            orientador.setContaNaoBloqueada(true);
            orientador.setCredenciaisNaoExpiradas(true);
            orientador.setCriadoEm(LocalDateTime.now());
            orientador.setAtualizadoEm(LocalDateTime.now());

            AppUser comissao = new AppUser();
            comissao.setId("comissao-1");
            comissao.setNome("Gabriel Labarca");
            comissao.setEmail("10443681@mackenzista.com.br");
            comissao.setSenhaHash(passwordEncoder.encode(resolveSeedPassword("SEED_COMISSAO_PASSWORD", "GabrielLabarca123@")));
            comissao.setPapel(Role.COMISSAO);
            comissao.setPapeis(List.of(Role.COMISSAO));
            comissao.setPrimeiroAcesso(true);
            comissao.setRequerMudancaSenha(true);
            comissao.setHabilitado(true);
            comissao.setContaNaoExpirada(true);
            comissao.setContaNaoBloqueada(true);
            comissao.setCredenciaisNaoExpiradas(true);
            comissao.setCriadoEm(LocalDateTime.now());
            comissao.setAtualizadoEm(LocalDateTime.now());

            AppUser coordenacao = new AppUser();
            coordenacao.setId("coordenacao-1");
            coordenacao.setNome("Vitor Costa");
            coordenacao.setEmail("10438932@mackenzista.com.br");
            coordenacao.setSenhaHash(passwordEncoder.encode(resolveSeedPassword("SEED_COORDENACAO_PASSWORD", "VitorCosta123@")));
            coordenacao.setPapel(Role.COORDENACAO);
            coordenacao.setPapeis(List.of(Role.COORDENACAO));
            coordenacao.setPrimeiroAcesso(true);
            coordenacao.setRequerMudancaSenha(true);
            coordenacao.setHabilitado(true);
            coordenacao.setContaNaoExpirada(true);
            coordenacao.setContaNaoBloqueada(true);
            coordenacao.setCredenciaisNaoExpiradas(true);
            coordenacao.setCriadoEm(LocalDateTime.now());
            coordenacao.setAtualizadoEm(LocalDateTime.now());

            AppUser secretaria = new AppUser();
            secretaria.setId("secretaria-1");
            secretaria.setNome("Luiz Batista");
            secretaria.setEmail("10438938@mackenzista.com.br");
            secretaria.setSenhaHash(passwordEncoder.encode(resolveSeedPassword("SEED_SECRETARIA_PASSWORD", "LuizBatista123@")));
            secretaria.setPapel(Role.SECRETARIA);
            secretaria.setPapeis(List.of(Role.SECRETARIA));
            secretaria.setPrimeiroAcesso(true);
            secretaria.setRequerMudancaSenha(true);
            secretaria.setHabilitado(true);
            secretaria.setContaNaoExpirada(true);
            secretaria.setContaNaoBloqueada(true);
            secretaria.setCredenciaisNaoExpiradas(true);
            secretaria.setCriadoEm(LocalDateTime.now());
            secretaria.setAtualizadoEm(LocalDateTime.now());

            userRepository.saveAll(List.of(
                    aluno,
                    orientador,
                    comissao,
                    coordenacao,
                    secretaria
            ));

            studentRepository.saveAll(List.of(
                    new Student("aluno-1", "Jose Pedro Bitetti", "orientador-1", 10),
                    new Student("aluno-2", "Rodrygo Rogerio Vasconcellos", "orientador-1", 12),
                    new Student("aluno-3", "Gabriel Labarca Del Bianco", "orientador-1", 7)
            ));

            apoRepository.saveAll(List.of(
                    apo("apo-1", "Artigo publicado na IEEE Access", "Artigo em periodico", "Publicacao aceita em periodico internacional com comprovante de DOI e carta de aceite.", 4, "aluno-1", "Jose Pedro Bitetti", "orientador-1", ApoStatus.EM_AVALIACAO_ORIENTADOR, LocalDate.of(2026, 3, 15), List.of("doi.pdf", "aceite.pdf"), List.of()),
                    apo("apo-2", "Estagio de docencia em IA Aplicada", "Estagio docencia", "Atuacao em disciplina de graduacao com plano de aulas e relatorio final.", 3, "aluno-1", "Jose Pedro Bitetti", "orientador-1", ApoStatus.EM_AVALIACAO_COMISSAO, LocalDate.of(2026, 3, 14), List.of("relatorio.pdf", "plano.pdf"), List.of(
                            vote("Profa. Ana Ribeiro", VoteDecision.APROVAR, "Documentacao consistente e aderente ao regulamento."),
                            vote("Prof. Bruno Lima", VoteDecision.APROVAR, "Pontuacao adequada e evidencias completas.")
                    )),
                    apo("apo-3", "Capitulo Springer sobre visao computacional", "Capitulo de livro", "Capitulo publicado em coletanea internacional com metadados e comprovante editorial.", 5, "aluno-2", "Rodrygo Rogerio Vasconcellos", "orientador-1", ApoStatus.EM_AVALIACAO_COORDENACAO, LocalDate.of(2026, 3, 13), List.of("capitulo.pdf", "comprovante-editorial.pdf"), List.of(
                            vote("Profa. Ana Ribeiro", VoteDecision.APROVAR, "Atividade qualificada e com documentacao completa."),
                            vote("Prof. Bruno Lima", VoteDecision.REPROVAR, "Pontuacao sugerida acima da tabela."),
                            vote("Prof. Carlos Souza", VoteDecision.APROVAR, "Mantem aderencia a categoria prevista.")
                    )),
                    apo("apo-4", "Apresentacao em congresso de software livre", "Artigo em congresso", "Apresentacao oral com certificado e registro do evento.", 2, "aluno-3", "Gabriel Labarca Del Bianco", "orientador-1", ApoStatus.APROVADO, LocalDate.of(2026, 3, 10), List.of("certificado.pdf"), List.of()),
                    apo("apo-5", "Minicurso em aprendizado de maquina", "Minicurso ministrado", "Minicurso ministrado durante escola de verao com lista de presenca.", 2, "aluno-2", "Rodrygo Rogerio Vasconcellos", "orientador-1", ApoStatus.ARQUIVADO, LocalDate.of(2026, 3, 8), List.of("minicurso.pdf", "lista-presenca.pdf"), List.of()),
                    apo("apo-6", "Registro de software para laboratorio", "Patente ou software", "Registro institucional do software com comprovante emitido pela universidade.", 6, "aluno-2", "Rodrygo Rogerio Vasconcellos", "orientador-1", ApoStatus.LANCADO, LocalDate.of(2026, 3, 1), List.of("registro.pdf"), List.of()),
                    apo("apo-7", "Rascunho de participacao em banca", "Participacao em comissao", "Rascunho salvo aguardando anexos finais.", 1, "aluno-1", "Jose Pedro Bitetti", "orientador-1", ApoStatus.RASCUNHO, LocalDate.of(2026, 3, 16), List.of(), List.of()),
                    apo("apo-8", "Submissao com documentacao inconsistente", "Artigo em congresso", "Caso reprovado para alimentar a visualizacao historica do aluno.", 2, "aluno-1", "Jose Pedro Bitetti", "orientador-1", ApoStatus.REPROVADO, LocalDate.of(2026, 2, 22), List.of("submissao.pdf"), List.of()),
                    apo("apo-9", "Atividade devolvida para ajuste", "Artigo em congresso", "APO devolvida pelo orientador para inclusao de comprovante adicional.", 2, "aluno-1", "Jose Pedro Bitetti", "orientador-1", ApoStatus.DEVOLVIDA, LocalDate.of(2026, 3, 20), List.of("versao-inicial.pdf"), List.of())
            ));

            notificationRepository.saveAll(List.of(
                    new AppNotification("noti-1", "APO \"Artigo IEEE\" recebeu nova avaliacao", "2 horas atras", false, "aluno-1"),
                    new AppNotification("noti-2", "Sua APO \"Estagio Docencia\" foi aprovada pelo orientador", "1 dia atras", false, "aluno-1"),
                    new AppNotification("noti-3", "Nova submissao de Jose Pedro Bitetti aguardando avaliacao", "2 dias atras", true, "orientador-1"),
                    new AppNotification("noti-4", "Lembrete: 3 APOs pendentes de votacao na comissao", "3 dias atras", true, "comissao-1"),
                    new AppNotification("noti-5", "APO \"Capitulo Springer\" aprovada pela coordenacao", "1 semana atras", true, "coordenacao-1"),
                    new AppNotification("noti-6", "Pacote de arquivamento pronto para revisao", "1 dia atras", false, "secretaria-1")
            ));
        };
    }

        private static void ensureAdminUser(AppUserRepository userRepository, PasswordEncoder passwordEncoder) {
                if (userRepository.findByEmailIgnoreCase("admin@mackenzie.com").isPresent()) {
                        return;
                }

                AppUser admin = new AppUser();
                admin.setId("admin-1");
                admin.setNome("Administrador APOFlow");
                admin.setEmail("admin@mackenzie.com");
                admin.setSenhaHash(passwordEncoder.encode(resolveSeedPassword("SEED_ADMIN_PASSWORD", "ADMmack123")));
                admin.setPapel(Role.ADMIN);
                admin.setPapeis(List.of(Role.ADMIN));
                admin.setPrimeiroAcesso(false);
                admin.setRequerMudancaSenha(false);
                admin.setHabilitado(true);
                admin.setContaNaoExpirada(true);
                admin.setContaNaoBloqueada(true);
                admin.setCredenciaisNaoExpiradas(true);
                admin.setCriadoEm(LocalDateTime.now());
                admin.setAtualizadoEm(LocalDateTime.now());
                userRepository.save(admin);
        }

    private static Apo apo(String id, String titulo, String tipo, String descricao, int pontos, String alunoId, String aluno, String orientadorId,
                           ApoStatus status, LocalDate dataAtualizacao, List<String> anexos, List<ApoVote> votos) {
        Apo apo = new Apo();
        apo.setId(id);
        apo.setTitulo(titulo);
        apo.setTipo(tipo);
        apo.setDescricao(descricao);
        apo.setPontos(pontos);
        apo.setAlunoId(alunoId);
        apo.setAluno(aluno);
        apo.setOrientadorId(orientadorId);
        apo.setStatus(status);
        apo.setDataAtualizacao(dataAtualizacao);
        anexos.forEach(anexo -> apo.getAnexos().add(new ApoAttachment(anexo)));
        votos.forEach(apo.getVotos()::add);
        return apo;
    }

    private static ApoVote vote(String membro, VoteDecision decisao, String justificativa) {
        return new ApoVote(membro, decisao, justificativa);
    }

        private static String resolveSeedPassword(String envName, String defaultValue) {
                String value = System.getenv(envName);
                if (value != null && !value.isBlank()) {
                        return value;
                }
                return defaultValue;
        }
}
