package com.apoflow.backend.repository;

import com.apoflow.backend.domain.AppUser;
import com.apoflow.backend.domain.Role;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AppUserRepository extends MongoRepository<AppUser, String> {
    Optional<AppUser> findFirstByPapel(Role papel);
    Optional<AppUser> findByEmailIgnoreCase(String email);
    Optional<AppUser> findByEmail(String email);
}
