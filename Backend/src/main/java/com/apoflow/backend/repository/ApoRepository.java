package com.apoflow.backend.repository;

import com.apoflow.backend.domain.Apo;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ApoRepository extends MongoRepository<Apo, String> {
    List<Apo> findByAlunoId(String alunoId);
    void deleteByAlunoId(String alunoId);
}
