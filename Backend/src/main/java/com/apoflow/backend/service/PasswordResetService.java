package com.apoflow.backend.service;

import com.apoflow.backend.domain.AppUser;
import com.apoflow.backend.domain.PasswordResetToken;
import com.apoflow.backend.repository.AppUserRepository;
import com.apoflow.backend.repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final AppUserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public PasswordResetService(AppUserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                PasswordEncoder passwordEncoder,
                                EmailService emailService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    /**
     * Initiates the password reset flow. Always returns successfully to avoid
     * leaking whether an e-mail address is registered.
     */
    public void requestReset(String email) {
        Optional<AppUser> userOpt = userRepository.findByEmailIgnoreCase(email.trim());
        if (userOpt.isEmpty()) {
            return;
        }
        AppUser user = userOpt.get();

        tokenRepository.deleteAllByEmail(user.getEmail());

        String rawToken = UUID.randomUUID().toString().replace("-", "") +
                          UUID.randomUUID().toString().replace("-", "");
        String tokenHash = sha256(rawToken);

        tokenRepository.save(new PasswordResetToken(
                user.getEmail(), tokenHash, LocalDateTime.now().plusHours(1)));

        String resetLink = baseUrl + "/reset-password?token=" + rawToken;
        emailService.sendPasswordReset(user.getEmail(), user.getNome(), resetLink);
    }

    /**
     * Validates the token and updates the user's password.
     */
    public void resetPassword(String rawToken, String novaSenha) {
        String tokenHash = sha256(rawToken);

        PasswordResetToken resetToken = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Link de redefinição inválido ou expirado."));

        if (resetToken.isUsed()) {
            throw new IllegalArgumentException("Este link já foi utilizado.");
        }
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException(
                    "Link de redefinição expirado. Solicite um novo.");
        }

        AppUser user = userRepository.findByEmailIgnoreCase(resetToken.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        user.setSenhaHash(passwordEncoder.encode(novaSenha));
        user.setAtualizadoEm(LocalDateTime.now());
        user.setRequerMudancaSenha(false);
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                String h = Integer.toHexString(0xff & b);
                if (h.length() == 1) hex.append('0');
                hex.append(h);
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 unavailable", e);
        }
    }
}
