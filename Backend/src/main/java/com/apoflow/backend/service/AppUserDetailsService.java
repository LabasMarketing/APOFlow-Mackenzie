package com.apoflow.backend.service;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.apoflow.backend.domain.AppUser;
import com.apoflow.backend.domain.Role;
import com.apoflow.backend.repository.AppUserRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AppUserDetailsService implements UserDetailsService {

    private final AppUserRepository userRepository;

    public AppUserDetailsService(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<AppUser> user = userRepository.findByEmailIgnoreCase(email);

        if (user.isEmpty()) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }

        AppUser appUser = user.get();

        List<Role> effectiveRoles = (appUser.getPapeis() != null && !appUser.getPapeis().isEmpty())
                ? appUser.getPapeis()
                : List.of(appUser.getPapel());

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        for (Role r : effectiveRoles) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + r.name()));
        }

        return User.builder()
                .username(appUser.getEmail())
            .password(appUser.getSenhaHash() != null ? appUser.getSenhaHash() : "")
                .authorities(authorities)
            .accountExpired(!appUser.isContaNaoExpirada())
            .accountLocked(!appUser.isContaNaoBloqueada())
            .credentialsExpired(!appUser.isCredenciaisNaoExpiradas())
            .disabled(!appUser.isHabilitado())
                .build();
    }

    public AppUser getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}
