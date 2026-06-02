package com.apoflow.backend.api;

import com.apoflow.backend.api.dto.LoginRequest;
import com.apoflow.backend.api.dto.AuthResponse;
import com.apoflow.backend.api.dto.RegisterRequest;
import com.apoflow.backend.api.dto.ChangePasswordRequest;
import com.apoflow.backend.api.dto.ForgotPasswordRequest;
import com.apoflow.backend.api.dto.ResetPasswordRequest;
import com.apoflow.backend.domain.AppUser;
import com.apoflow.backend.domain.Role;
import com.apoflow.backend.domain.Student;
import com.apoflow.backend.repository.AppUserRepository;
import com.apoflow.backend.repository.StudentRepository;
import com.apoflow.backend.security.JwtTokenProvider;
import com.apoflow.backend.service.AuthService;
import com.apoflow.backend.service.PasswordResetService;
import com.apoflow.backend.service.TwoFactorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:80"})
public class AuthController {

    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final AppUserRepository userRepository;
    private final StudentRepository studentRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final TwoFactorService twoFactorService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordEncoder passwordEncoder,
                         AppUserRepository userRepository, StudentRepository studentRepository,
                         JwtTokenProvider jwtTokenProvider, TwoFactorService twoFactorService,
                         PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.twoFactorService = twoFactorService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestReset(request.email());
        return ResponseEntity.ok(Map.of("message",
                "Se o e-mail estiver cadastrado, você receberá as instruções em breve."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.token(), request.novaSenha());
        return ResponseEntity.ok(Map.of("message", "Senha redefinida com sucesso. Faça login."));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.loginByCredentials(request.email(), request.senha());
    }

    @PostMapping("/verify-otp")
    public AuthResponse verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");
        if (email == null || code == null) {
            throw new IllegalArgumentException("E-mail e código são obrigatórios.");
        }
        return twoFactorService.verifyOtp(email.trim(), code.trim());
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.findByEmailIgnoreCase(registerRequest.email()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "E-mail já cadastrado. Tente outro ou faça login."));
        }

        AppUser newUser = new AppUser();
        newUser.setNome(registerRequest.nome());
        newUser.setEmail(registerRequest.email());
        newUser.setSenhaHash(passwordEncoder.encode(registerRequest.senha()));
        newUser.setPapel(Role.ALUNO);
        newUser.setPapeis(List.of(Role.ALUNO));
        newUser.setPrimeiroAcesso(false);
        newUser.setRequerMudancaSenha(false);
        newUser.setHabilitado(true);
        newUser.setContaNaoExpirada(true);
        newUser.setContaNaoBloqueada(true);
        newUser.setCredenciaisNaoExpiradas(true);
        newUser.setCriadoEm(LocalDateTime.now());
        newUser.setAtualizadoEm(LocalDateTime.now());

        userRepository.save(newUser);
    studentRepository.save(new Student(newUser.getId(), newUser.getNome(), null, 0));

        String token = jwtTokenProvider.generateToken(registerRequest.email());

        return ResponseEntity.ok(new AuthResponse(
                token,
                newUser.getId(),
                newUser.getEmail(),
                newUser.getNome(),
                newUser.getPapel().name().toLowerCase(),
        List.of(Role.ALUNO.name().toLowerCase()),
                false,
                "Usuário registrado com sucesso"
        ));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        Optional<AppUser> userOpt = userRepository.findByEmailIgnoreCase(changePasswordRequest.email());

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Usuário não encontrado"));
        }

        AppUser user = userOpt.get();

        if (!user.isPrimeiroAcesso()) {
            if (changePasswordRequest.senhaAntiga() == null || 
                !passwordEncoder.matches(changePasswordRequest.senhaAntiga(), user.getSenhaHash())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Senha atual incorreta"));
            }
        }

        user.setSenhaHash(passwordEncoder.encode(changePasswordRequest.novaSenha()));
        user.setPrimeiroAcesso(false);
        user.setRequerMudancaSenha(false);
        user.setUltimaMudancaSenha(LocalDateTime.now());
        user.setAtualizadoEm(LocalDateTime.now());

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Senha alterada com sucesso"));
    }

    @GetMapping("/first-access/{email}")
    public ResponseEntity<?> checkFirstAccess(@PathVariable String email) {
        Optional<AppUser> userOpt = userRepository.findByEmailIgnoreCase(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Usuário não encontrado"));
        }

        AppUser user = userOpt.get();
        return ResponseEntity.ok(user.isPrimeiroAcesso());
    }
}
