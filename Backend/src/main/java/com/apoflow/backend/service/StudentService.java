package com.apoflow.backend.service;

import com.apoflow.backend.api.dto.StudentResponse;
import com.apoflow.backend.domain.AppUser;
import com.apoflow.backend.domain.Role;
import com.apoflow.backend.domain.Student;
import com.apoflow.backend.repository.AppUserRepository;
import com.apoflow.backend.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@SuppressWarnings("null")
public class StudentService {

    private final StudentRepository studentRepository;
    private final AppUserRepository appUserRepository;

    public StudentService(StudentRepository studentRepository, AppUserRepository appUserRepository) {
        this.studentRepository = studentRepository;
        this.appUserRepository = appUserRepository;
    }

    public List<StudentResponse> findAll() {
        return studentRepository.findAll().stream()
                .sorted(Comparator.comparing(Student::getNome))
                .map(this::map)
                .toList();
    }

    public Student getById(String id) {
        return studentRepository.findById(id).orElseGet(() -> {
            AppUser user = appUserRepository.findById(id)
                    .filter(u -> u.getPapel() == Role.ALUNO)
                    .orElseThrow(() -> new IllegalArgumentException("Aluno nao encontrado."));
            Student student = new Student(user.getId(), user.getNome(), null, 0);
            return studentRepository.save(student);
        });
    }

    public void increasePoints(String studentId, int points) {
        Student student = getById(studentId);
        student.setPontosAcumulados(student.getPontosAcumulados() + points);
        studentRepository.save(student);
    }

    public StudentResponse map(Student student) {
        return new StudentResponse(student.getId(), student.getNome(), student.getOrientadorId(), student.getPontosAcumulados());
    }
}
