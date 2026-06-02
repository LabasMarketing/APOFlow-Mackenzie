package com.apoflow.backend.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "apos")
public class Apo {

    @Id
    private String id;

    private String titulo;

    private String tipo;

    private String descricao;

    private Integer pontos;

    private String alunoId;

    private String aluno;

    private String orientadorId;

    private ApoStatus status;

    private CoordenacaoEntrada coordenacaoEntrada;

    private LocalDate dataAtualizacao;

    private List<ApoAttachment> anexos = new ArrayList<>();

    private List<ApoVote> votos = new ArrayList<>();

    public Apo() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Integer getPontos() {
        return pontos;
    }

    public void setPontos(Integer pontos) {
        this.pontos = pontos;
    }

    public String getAlunoId() {
        return alunoId;
    }

    public void setAlunoId(String alunoId) {
        this.alunoId = alunoId;
    }

    public String getAluno() {
        return aluno;
    }

    public void setAluno(String aluno) {
        this.aluno = aluno;
    }

    public String getOrientadorId() {
        return orientadorId;
    }

    public void setOrientadorId(String orientadorId) {
        this.orientadorId = orientadorId;
    }

    public ApoStatus getStatus() {
        return status;
    }

    public void setStatus(ApoStatus status) {
        this.status = status;
    }

    public CoordenacaoEntrada getCoordenacaoEntrada() {
        return coordenacaoEntrada;
    }

    public void setCoordenacaoEntrada(CoordenacaoEntrada coordenacaoEntrada) {
        this.coordenacaoEntrada = coordenacaoEntrada;
    }

    public LocalDate getDataAtualizacao() {
        return dataAtualizacao;
    }

    public void setDataAtualizacao(LocalDate dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }

    public List<ApoAttachment> getAnexos() {
        return anexos;
    }

    public void setAnexos(List<ApoAttachment> anexos) {
        this.anexos = anexos;
    }

    public List<ApoVote> getVotos() {
        return votos;
    }

    public void setVotos(List<ApoVote> votos) {
        this.votos = votos;
    }
}
