package com.apoflow.backend.api;

import com.apoflow.backend.api.dto.AdminUserResponse;
import com.apoflow.backend.api.dto.ProfileResponse;
import com.apoflow.backend.api.dto.UpdateUserRolesRequest;
import com.apoflow.backend.api.dto.UpdateProfileRequest;
import com.apoflow.backend.domain.AppUser;
import com.apoflow.backend.domain.Role;
import com.apoflow.backend.domain.Student;
import com.apoflow.backend.repository.AppUserRepository;
import com.apoflow.backend.repository.ApoRepository;
import com.apoflow.backend.repository.StudentRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Set<Set<Role>> ALLOWED_ROLE_COMBINATIONS = Set.of(
            Set.of(Role.ALUNO),
            Set.of(Role.SECRETARIA),
            Set.of(Role.COMISSAO),
            Set.of(Role.ORIENTADOR),
            Set.of(Role.ORIENTADOR, Role.COORDENACAO),
            Set.of(Role.COORDENACAO)
    );

    private final AppUserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ApoRepository apoRepository;

    public UserController(AppUserRepository userRepository,
                          StudentRepository studentRepository,
                          ApoRepository apoRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.apoRepository = apoRepository;
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ProfileResponse getMe(@AuthenticationPrincipal UserDetails principal) {
        AppUser user = findUser(principal);
        return toResponse(user);
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ProfileResponse updateMe(@AuthenticationPrincipal UserDetails principal,
                                    @RequestBody UpdateProfileRequest request) {
        AppUser user = findUser(principal);

        if (request.nome() != null && !request.nome().isBlank()) {
            user.setNome(request.nome());
        }
        if (request.fotoUrl() != null) user.setFotoUrl(request.fotoUrl());
        if (request.periodo() != null) user.setPeriodo(request.periodo());
        if (request.drt() != null) user.setDrt(request.drt());
        user.setAtualizadoEm(LocalDateTime.now());

        userRepository.save(user);
        return toResponse(user);
    }

    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> deleteMe(@AuthenticationPrincipal UserDetails principal) {
        AppUser user = findUser(principal);
        String userId = requireUserId(user);
        apoRepository.deleteByAlunoId(userId);
        studentRepository.deleteById(Objects.requireNonNull(userId));
        userRepository.delete(Objects.requireNonNull(user));
        return ResponseEntity.ok(Map.of("message", "Conta excluida com sucesso."));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<AdminUserResponse> listUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(AppUser::getNome, String.CASE_INSENSITIVE_ORDER))
                .map(this::toAdminResponse)
                .toList();
    }

    @PutMapping("/{userId}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminUserResponse updateRoles(@PathVariable String userId,
                                         @Valid @RequestBody UpdateUserRolesRequest request) {
        AppUser user = userRepository.findById(Objects.requireNonNull(requireUserId(userId)))
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        if (hasAdminRole(user)) {
            throw new IllegalArgumentException("O perfil admin fixo não pode ser alterado.");
        }

        List<Role> roles = parseAssignableRoles(request.papeis());
        user.setPapeis(new ArrayList<>(roles));
        user.setPapel(roles.get(0));
        user.setAtualizadoEm(LocalDateTime.now());
        userRepository.save(user);
        syncStudentRecord(user, request.orientadorId());

        return toAdminResponse(user);
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String userId) {
        AppUser user = userRepository.findById(Objects.requireNonNull(requireUserId(userId)))
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        if (hasAdminRole(user)) {
            throw new IllegalArgumentException("O perfil admin fixo não pode ser excluído.");
        }

        String resolvedUserId = requireUserId(user);
        apoRepository.deleteByAlunoId(resolvedUserId);
        studentRepository.deleteById(Objects.requireNonNull(resolvedUserId));
        userRepository.delete(Objects.requireNonNull(user));

        return ResponseEntity.ok(Map.of("message", "Usuário excluído com sucesso."));
    }

    private AppUser findUser(UserDetails principal) {
        return userRepository.findByEmailIgnoreCase(principal.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
    }

    private ProfileResponse toResponse(AppUser user) {
        return new ProfileResponse(
                user.getId(),
                user.getNome(),
                user.getEmail(),
                user.getPapel().name().toLowerCase(),
                roleNames(user),
                user.getFotoUrl(),
                user.getPeriodo(),
                user.getDrt(),
                getStudentOrientadorId(user),
                getStudentOrientadorNome(user)
        );
    }

    private AdminUserResponse toAdminResponse(AppUser user) {
        String orientadorId = getStudentOrientadorId(user);
        return new AdminUserResponse(
                user.getId(),
                user.getNome(),
                user.getEmail(),
                user.getPapel().name().toLowerCase(),
                roleNames(user),
                user.getDrt(),
                orientadorId,
                getOrientadorNome(orientadorId)
        );
    }

    private List<String> roleNames(AppUser user) {
        List<Role> effectiveRoles = (user.getPapeis() != null && !user.getPapeis().isEmpty())
                ? user.getPapeis()
                : List.of(user.getPapel());
        return effectiveRoles.stream()
                .map(role -> role.name().toLowerCase())
                .toList();
    }

    private List<Role> parseAssignableRoles(List<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            throw new IllegalArgumentException("Informe ao menos um perfil.");
        }

        LinkedHashSet<Role> roles = new LinkedHashSet<>();
        for (String roleName : roleNames) {
            try {
                Role role = Role.valueOf(roleName.trim().toUpperCase());
                if (!Set.of(Role.ALUNO, Role.ORIENTADOR, Role.COMISSAO, Role.COORDENACAO, Role.SECRETARIA).contains(role)) {
                    throw new IllegalArgumentException("Perfil não pode ser atribuído pelo admin: " + roleName);
                }
                roles.add(role);
            } catch (IllegalArgumentException exception) {
                throw new IllegalArgumentException("Perfil inválido: " + roleName);
            }
        }

        if (roles.isEmpty()) {
            throw new IllegalArgumentException("Informe ao menos um perfil.");
        }
        if (!ALLOWED_ROLE_COMBINATIONS.contains(Set.copyOf(roles))) {
            throw new IllegalArgumentException("Combinação de perfis inválida. Estados permitidos: aluno, orientador, comissão, orientador com coordenação, coordenação ou secretaria.");
        }

        return new ArrayList<>(roles);
    }

    private void syncStudentRecord(AppUser user, String orientadorId) {
        String userId = requireUserId(user);
        boolean isAluno = roleNames(user).contains(Role.ALUNO.name().toLowerCase());
        if (!isAluno) {
            studentRepository.deleteById(Objects.requireNonNull(userId));
            return;
        }

        String normalizedOrientadorId = normalizeOrientadorId(orientadorId);
        Student student = studentRepository.findById(Objects.requireNonNull(userId))
                .orElse(new Student(userId, user.getNome(), null, 0));
        student.setNome(user.getNome());
        student.setOrientadorId(normalizedOrientadorId);
        if (student.getPontosAcumulados() == null) {
            student.setPontosAcumulados(0);
        }
        studentRepository.save(student);

        apoRepository.findByAlunoId(userId).forEach(apo -> {
            apo.setOrientadorId(normalizedOrientadorId);
            apoRepository.save(apo);
        });
    }

    private String normalizeOrientadorId(String orientadorId) {
        if (orientadorId == null || orientadorId.isBlank()) {
            return null;
        }

        AppUser orientador = userRepository.findById(orientadorId)
                .orElseThrow(() -> new IllegalArgumentException("Orientador não encontrado."));

        List<Role> orientadorRoles = (orientador.getPapeis() != null && !orientador.getPapeis().isEmpty())
                ? orientador.getPapeis()
                : List.of(orientador.getPapel());

        if (!orientadorRoles.contains(Role.ORIENTADOR)) {
            throw new IllegalArgumentException("Usuário selecionado não possui perfil de orientador.");
        }

        return orientador.getId();
    }

    private String getStudentOrientadorId(AppUser user) {
        if (!roleNames(user).contains(Role.ALUNO.name().toLowerCase())) {
            return null;
        }

        String userId = user.getId();
        if (userId == null || userId.isBlank()) {
            return null;
        }

        return studentRepository.findById(userId)
                .map(Student::getOrientadorId)
                .orElse(null);
    }

    private String getStudentOrientadorNome(AppUser user) {
        return getOrientadorNome(getStudentOrientadorId(user));
    }

    private String getOrientadorNome(String orientadorId) {
        if (orientadorId == null || orientadorId.isBlank()) {
            return null;
        }

        return userRepository.findById(orientadorId)
                .map(AppUser::getNome)
                .orElse(null);
    }

    private boolean hasAdminRole(AppUser user) {
        List<Role> effectiveRoles = (user.getPapeis() != null && !user.getPapeis().isEmpty())
                ? user.getPapeis()
                : List.of(user.getPapel());
        return effectiveRoles.contains(Role.ADMIN);
    }

    private String requireUserId(AppUser user) {
        return requireUserId(user.getId());
    }

    private String requireUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("Usuário sem identificador válido.");
        }
        return userId;
    }
}
