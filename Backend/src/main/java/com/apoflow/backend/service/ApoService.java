package com.apoflow.backend.service;

import com.apoflow.backend.api.dto.ApoResponse;
import com.apoflow.backend.api.dto.ApoVoteResponse;
import com.apoflow.backend.api.dto.CreateApoRequest;
import com.apoflow.backend.api.dto.DecisionRequest;
import com.apoflow.backend.api.dto.SaveDraftRequest;
import com.apoflow.backend.api.dto.VoteRequest;
import com.apoflow.backend.domain.Apo;
import com.apoflow.backend.domain.ApoAttachment;
import com.apoflow.backend.domain.ApoStatus;
import com.apoflow.backend.domain.ApoVote;
import com.apoflow.backend.domain.AppUser;
import com.apoflow.backend.domain.CoordenacaoEntrada;
import com.apoflow.backend.domain.Role;
import com.apoflow.backend.domain.Student;
import com.apoflow.backend.domain.VoteDecision;
import com.apoflow.backend.repository.ApoRepository;
import com.apoflow.backend.repository.AppUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@SuppressWarnings("null")
public class ApoService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final ApoRepository apoRepository;
    private final AppUserRepository userRepository;
    private final StudentService studentService;
    private final NotificationService notificationService;

    public ApoService(ApoRepository apoRepository, AppUserRepository userRepository, StudentService studentService, NotificationService notificationService) {
        this.apoRepository = apoRepository;
        this.userRepository = userRepository;
        this.studentService = studentService;
        this.notificationService = notificationService;
    }

    public List<ApoResponse> findAll() {
        return apoRepository.findAll().stream()
                .sorted(Comparator.comparing(Apo::getDataAtualizacao).reversed())
                .map(this::map)
                .toList();
    }

    public List<ApoResponse> findVisibleFor(String email) {
        AppUser user = getUserByEmail(email);
        List<Role> roles = effectiveRoles(user);

        if (roles.contains(Role.ADMIN) || roles.contains(Role.COMISSAO) || roles.contains(Role.COORDENACAO) || roles.contains(Role.SECRETARIA)) {
            return findAll();
        }

        String userId = user.getId();
        if (roles.contains(Role.ORIENTADOR)) {
            return apoRepository.findAll().stream()
                    .filter(apo -> userId != null && userId.equals(apo.getOrientadorId()))
                    .sorted(Comparator.comparing(Apo::getDataAtualizacao).reversed())
                    .map(this::map)
                    .toList();
        }

        if (roles.contains(Role.ALUNO)) {
            return apoRepository.findByAlunoId(userId).stream()
                    .sorted(Comparator.comparing(Apo::getDataAtualizacao).reversed())
                    .map(this::map)
                    .toList();
        }

        return List.of();
    }

    @Transactional
    public ApoResponse create(CreateApoRequest request) {
        Student student = studentService.getById(request.alunoId());

        if (request.anexos().isEmpty()) {
            throw new IllegalArgumentException("Adicione pelo menos um anexo para submeter a APO.");
        }

        Apo apo = new Apo();
        apo.setId("apo-" + UUID.randomUUID().toString().substring(0, 8));
        applyRequestData(apo, request);
        apo.setAlunoId(student.getId());
        apo.setAluno(student.getNome());
        apo.setOrientadorId(student.getOrientadorId());
        apo.setStatus(ApoStatus.EM_AVALIACAO_ORIENTADOR);
        apo.setDataAtualizacao(LocalDate.now());

        Apo saved = apoRepository.save(apo);
        notificationService.create(
                "noti-" + UUID.randomUUID().toString().substring(0, 8),
                "Nova submissao de " + student.getNome() + " aguardando avaliacao do orientador",
                "Agora mesmo",
                false,
                orientadorRecipient(student)
        );
        return map(saved);
    }

    @Transactional
    public ApoResponse saveDraft(SaveDraftRequest request) {
        Student student = studentService.getById(request.alunoId());

        Apo apo = new Apo();
        apo.setId("apo-" + UUID.randomUUID().toString().substring(0, 8));
        apo.setTitulo(request.titulo() != null ? request.titulo() : "");
        apo.setTipo(request.tipo() != null ? request.tipo() : "");
        apo.setDescricao(request.descricao() != null ? request.descricao() : "");
        apo.setPontos(request.pontos() != null ? request.pontos() : 0);
        if (request.anexos() != null) {
            request.anexos().forEach(name -> apo.getAnexos().add(new ApoAttachment(name)));
        }
        apo.setAlunoId(student.getId());
        apo.setAluno(student.getNome());
        apo.setOrientadorId(student.getOrientadorId());
        apo.setStatus(ApoStatus.RASCUNHO);
        apo.setDataAtualizacao(LocalDate.now());

        return map(apoRepository.save(apo));
    }

    @Transactional
    public ApoResponse resubmitByAluno(String apoId, CreateApoRequest request) {
        if (request.anexos().isEmpty()) {
            throw new IllegalArgumentException("Adicione pelo menos um anexo para reenviar a APO.");
        }

        Apo apo = getEntity(apoId);
        if (apo.getStatus() != ApoStatus.DEVOLVIDA && apo.getStatus() != ApoStatus.RASCUNHO) {
            throw new IllegalArgumentException("Apenas APO devolvida ou rascunho pode ser editada e reenviada.");
        }

        if (!apo.getAlunoId().equals(request.alunoId())) {
            throw new IllegalArgumentException("Aluno invalido para esta APO.");
        }

        applyRequestData(apo, request);
        apo.getVotos().clear();
        apo.setCoordenacaoEntrada(null);
        apo.setStatus(ApoStatus.EM_AVALIACAO_ORIENTADOR);
        apo.setDataAtualizacao(LocalDate.now());

        notificationService.create(
                id("noti"),
                "APO reenviada por " + apo.getAluno() + " aguardando avaliacao do orientador",
                "Agora mesmo",
                false,
                orientadorRecipient(apo)
        );

        return map(apoRepository.save(apo));
    }

    @Transactional
    public ApoResponse giveUpByAluno(String apoId) {
        Apo apo = getEntity(apoId);
        if (apo.getStatus() != ApoStatus.DEVOLVIDA && apo.getStatus() != ApoStatus.RASCUNHO) {
            throw new IllegalArgumentException("Somente APO devolvida ou rascunho pode ser desistida.");
        }

        apo.setStatus(ApoStatus.DESISTIDA);
        apo.setDataAtualizacao(LocalDate.now());
        notificationService.create(id("noti"), "O aluno desistiu da APO \"" + apo.getTitulo() + "\"", "Agora mesmo", false, orientadorRecipient(apo));
        return map(apoRepository.save(apo));
    }

    @Transactional
    public ApoResponse approveByOrientador(String apoId, String orientadorEmail) {
        Apo apo = getEntity(apoId);
        validateAssignedOrientador(apo, orientadorEmail);
        apo.setStatus(ApoStatus.EM_AVALIACAO_COMISSAO);
        apo.setDataAtualizacao(LocalDate.now());
        notificationService.create(id("noti"), "APO \"" + apo.getTitulo() + "\" enviada para a comissao", "Agora mesmo", false, "comissao");
        return map(apoRepository.save(apo));
    }

    @Transactional
    public ApoResponse returnByOrientador(String apoId, DecisionRequest request, String orientadorEmail) {
        Apo apo = getEntity(apoId);
        validateAssignedOrientador(apo, orientadorEmail);
        apo.setStatus(ApoStatus.DEVOLVIDA);
        apo.setDataAtualizacao(LocalDate.now());
        notificationService.create(id("noti"), "Sua APO \"" + apo.getTitulo() + "\" foi devolvida pelo orientador: " + request.justificativa(), "Agora mesmo", false, apo.getAlunoId());
        return map(apoRepository.save(apo));
    }

    @Transactional
    public ApoResponse vote(String apoId, VoteRequest request) {
        Apo apo = getEntity(apoId);
        String justificativa = request.justificativa() == null ? "" : request.justificativa().trim();
        if (justificativa.isEmpty()) {
            throw new IllegalArgumentException("Justificativa obrigatoria para voto da comissao.");
        }

        String membro = request.membro().trim();
        VoteDecision decision = VoteDecision.valueOf(request.decisao().trim().toUpperCase());
        apo.getVotos().removeIf(existing -> existing.getMembro().equalsIgnoreCase(membro));
        apo.getVotos().add(new ApoVote(membro, decision, justificativa));
        apo.setDataAtualizacao(LocalDate.now());

        long aprovacoes = apo.getVotos().stream().filter(v -> v.getDecisao() == VoteDecision.APROVAR).count();
        long reprovacoes = apo.getVotos().stream().filter(v -> v.getDecisao() == VoteDecision.REPROVAR).count();
        long devolucoes = apo.getVotos().stream().filter(v -> v.getDecisao() == VoteDecision.DEVOLVER).count();

        if (aprovacoes >= 3) {
            apo.setCoordenacaoEntrada(CoordenacaoEntrada.PADRAO);
            apo.setStatus(ApoStatus.EM_AVALIACAO_COORDENACAO);
            notificationService.create(id("noti"), "APO \"" + apo.getTitulo() + "\" encaminhada para a coordenacao", "Agora mesmo", false, "coordenacao");
        } else if (devolucoes >= 3) {
            apo.setCoordenacaoEntrada(null);
            apo.setStatus(ApoStatus.EM_AVALIACAO_ORIENTADOR);
        } else if (aprovacoes >= 1 && reprovacoes >= 1 && devolucoes >= 1) {
            apo.setCoordenacaoEntrada(CoordenacaoEntrada.EMPATE);
            apo.setStatus(ApoStatus.EM_AVALIACAO_COORDENACAO);
            notificationService.create(id("noti"), "APO \"" + apo.getTitulo() + "\" encaminhada para desempate da coordenacao", "Agora mesmo", false, "coordenacao");
        }

        return map(apoRepository.save(apo));
    }

    @Transactional
    public ApoResponse decideByCoordenacao(String apoId, String decision, DecisionRequest request) {
        Apo apo = getEntity(apoId);
        String normalized = decision.trim().toLowerCase();
        apo.setDataAtualizacao(LocalDate.now());

        switch (normalized) {
            case "aprovar" -> {
                apo.setStatus(ApoStatus.APROVADO);
                notificationService.create(id("noti"), "APO \"" + apo.getTitulo() + "\" aprovada pela coordenacao", "Agora mesmo", false, "secretaria");
            }
            case "reprovar" -> apo.setStatus(ApoStatus.REPROVADO);
            case "devolver" -> apo.setStatus(ApoStatus.EM_AVALIACAO_COMISSAO);
            default -> throw new IllegalArgumentException("Decisao de coordenacao invalida.");
        }

        notificationService.create(id("noti"), "Atualizacao na APO \"" + apo.getTitulo() + "\": " + request.justificativa(), "Agora mesmo", false, apo.getAlunoId());
        return map(apoRepository.save(apo));
    }

    @Transactional
    public ApoResponse archive(String apoId) {
        Apo apo = getEntity(apoId);
        apo.setStatus(ApoStatus.ARQUIVADO);
        apo.setDataAtualizacao(LocalDate.now());
        return map(apoRepository.save(apo));
    }

    @Transactional
    public ApoResponse launch(String apoId) {
        Apo apo = getEntity(apoId);
        if (apo.getStatus() != ApoStatus.LANCADO) {
            int pontos = apo.getPontos() != null ? apo.getPontos() : 0;
            studentService.increasePoints(apo.getAlunoId(), pontos);
        }
        apo.setStatus(ApoStatus.LANCADO);
        apo.setDataAtualizacao(LocalDate.now());
        notificationService.create(id("noti"), "Credito da APO \"" + apo.getTitulo() + "\" lancado no sistema academico", "Agora mesmo", false, apo.getAlunoId());
        return map(apoRepository.save(apo));
    }

    public Apo getEntity(String apoId) {
        return apoRepository.findById(apoId)
                .orElseThrow(() -> new IllegalArgumentException("APO nao encontrada."));
    }

    public ApoResponse map(Apo apo) {
        return new ApoResponse(
                apo.getId(),
                apo.getTitulo(),
                apo.getTipo(),
                apo.getDescricao(),
                apo.getPontos(),
                apo.getAlunoId(),
                apo.getAluno(),
                apo.getOrientadorId(),
                apo.getStatus().name().toLowerCase(),
                apo.getCoordenacaoEntrada() == null ? null : apo.getCoordenacaoEntrada().name().toLowerCase(),
                apo.getAnexos().stream().map(ApoAttachment::getNomeArquivo).toList(),
                apo.getDataAtualizacao().format(DATE_FORMATTER),
                apo.getVotos().stream()
                        .map(voto -> new ApoVoteResponse(voto.getMembro(), voto.getDecisao().name().toLowerCase(), voto.getJustificativa()))
                        .toList()
        );
    }

    private String id(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private void validateAssignedOrientador(Apo apo, String orientadorEmail) {
        AppUser orientador = getUserByEmail(orientadorEmail);
        if (orientador.getId() == null || !orientador.getId().equals(apo.getOrientadorId())) {
            throw new IllegalArgumentException("Esta APO não está vinculada ao orientador autenticado.");
        }
    }

    private AppUser getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário autenticado não encontrado."));
    }

    private List<Role> effectiveRoles(AppUser user) {
        return (user.getPapeis() != null && !user.getPapeis().isEmpty())
                ? user.getPapeis()
                : List.of(user.getPapel());
    }

    private String orientadorRecipient(Student student) {
        return student.getOrientadorId() == null || student.getOrientadorId().isBlank()
                ? "orientador"
                : student.getOrientadorId();
    }

    private String orientadorRecipient(Apo apo) {
        return apo.getOrientadorId() == null || apo.getOrientadorId().isBlank()
                ? "orientador"
                : apo.getOrientadorId();
    }

    private void applyRequestData(Apo apo, CreateApoRequest request) {
        apo.setTitulo(request.titulo());
        apo.setTipo(request.tipo());
        apo.setDescricao(request.descricao());
        apo.setPontos(request.pontos());
        apo.getAnexos().clear();
        request.anexos().forEach(name -> apo.getAnexos().add(new ApoAttachment(name)));
    }
}
