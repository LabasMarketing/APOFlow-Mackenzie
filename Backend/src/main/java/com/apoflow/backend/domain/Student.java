package com.apoflow.backend.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "students")
public class Student {

    @Id
    private String id;

    private String nome;

    private String orientadorId;

    private Integer pontosAcumulados;

    public Student() {
    }

    public Student(String id, String nome, String orientadorId, Integer pontosAcumulados) {
        this.id = id;
        this.nome = nome;
        this.orientadorId = orientadorId;
        this.pontosAcumulados = pontosAcumulados;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getOrientadorId() {
        return orientadorId;
    }

    public void setOrientadorId(String orientadorId) {
        this.orientadorId = orientadorId;
    }

    public Integer getPontosAcumulados() {
        return pontosAcumulados;
    }

    public void setPontosAcumulados(Integer pontosAcumulados) {
        this.pontosAcumulados = pontosAcumulados;
    }
}
