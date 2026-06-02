package com.apoflow.backend.config;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.apoflow.backend.domain.AppUser;
import com.apoflow.backend.domain.Role;
import com.apoflow.backend.repository.AppUserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomOAuth2UserService(AppUserRepository userRepository,
                                   PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");
        String provider = userRequest.getClientRegistration().getRegistrationId();

        Optional<AppUser> existingUser = userRepository.findByEmailIgnoreCase(email);

        if (existingUser.isEmpty()) {
            AppUser newUser = new AppUser();
            newUser.setId("oauth-" + UUID.randomUUID());
            newUser.setNome(name != null ? name : "Usuario OAuth");
            newUser.setEmail(email);
            newUser.setSenhaHash(passwordEncoder.encode(UUID.randomUUID().toString() + "-oauth"));
            newUser.setPapel(Role.ALUNO);
            newUser.setPapeis(List.of(Role.ALUNO));
            newUser.setGoogleId(googleId);
            newUser.setProvedorOauth(provider);
            newUser.setPrimeiroAcesso(false);
            newUser.setRequerMudancaSenha(false);
            newUser.setCriadoEm(LocalDateTime.now());
            newUser.setAtualizadoEm(LocalDateTime.now());
            userRepository.save(newUser);
        }

        return oAuth2User;
    }
}
