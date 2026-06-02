package com.apoflow.backend.repository;

import com.apoflow.backend.domain.OtpCode;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface OtpCodeRepository extends MongoRepository<OtpCode, String> {
    Optional<OtpCode> findTopByEmailOrderByExpiresAtDesc(String email);
    void deleteAllByEmail(String email);
}
