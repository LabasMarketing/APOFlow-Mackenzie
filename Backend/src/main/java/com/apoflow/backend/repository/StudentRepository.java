package com.apoflow.backend.repository;

import com.apoflow.backend.domain.Student;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StudentRepository extends MongoRepository<Student, String> {
}
