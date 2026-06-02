package com.apoflow.backend.service;

import com.apoflow.backend.api.dto.AuthResponse;
import com.apoflow.backend.domain.AppUser;
import com.apoflow.backend.domain.OtpCode;
import com.apoflow.backend.domain.Role;
import com.apoflow.backend.repository.AppUserRepository;
import com.apoflow.backend.repository.OtpCodeRepository;
import com.apoflow.backend.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TwoFactorService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final OtpCodeRepository otpCodeRepository;
    private final AppUserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public TwoFactorService(OtpCodeRepository otpCodeRepository,
                             AppUserRepository userRepository,
                             JwtTokenProvider jwtTokenProvider,
                             EmailService emailService,
                             PasswordEncoder passwordEncoder) {
        this.otpCodeRepository = otpCodeRepository;
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    /** Called after successful password check. Generates OTP and sends via email. */
    public void initiateOtp(AppUser user) {
        otpCodeRepository.deleteAllByEmail(user.getEmail());
        String code = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
        OtpCode otp = new OtpCode(user.getEmail(), passwordEncoder.encode(code), LocalDateTime.now().plusMinutes(10));
        otpCodeRepository.save(otp);
        emailService.sendOtp(user.getEmail(), user.getNome(), code);
    }

    /** Verifies the OTP and returns a JWT if valid. */
    public AuthResponse verifyOtp(String email, String code) {
        AppUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        OtpCode otp = otpCodeRepository.findTopByEmailOrderByExpiresAtDesc(email)
                .orElseThrow(() -> new IllegalArgumentException("Código inválido ou expirado."));

        if (otp.isUsed()) {
            throw new IllegalArgumentException("Código já utilizado.");
        }

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Código expirado. Faça login novamente.");
        }

        if (!passwordEncoder.matches(code, otp.getCode())) {
            throw new IllegalArgumentException("Código incorreto.");
        }

        otp.setUsed(true);
        otpCodeRepository.save(otp);

        String token = jwtTokenProvider.generateToken(user.getEmail());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getNome(),
            user.getPapel().name().toLowerCase(), roleNames(user), user.isPrimeiroAcesso(), null);
    }

        private List<String> roleNames(AppUser user) {
        List<Role> effectiveRoles = (user.getPapeis() != null && !user.getPapeis().isEmpty())
            ? user.getPapeis()
            : List.of(user.getPapel());
        return effectiveRoles.stream()
            .map(role -> role.name().toLowerCase())
            .toList();
        }
}
