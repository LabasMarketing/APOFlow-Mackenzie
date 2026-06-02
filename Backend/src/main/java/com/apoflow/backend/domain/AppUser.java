package com.apoflow.backend.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
public class AppUser {

    @Id
    private String id;

    private String nome;

    @Indexed(unique = true)
    private String email;

    private String senhaHash;

    private Role papel;

    private List<Role> papeis = new ArrayList<>();

    private boolean primeiroAcesso = true;

    private boolean requerMudancaSenha = true;

    private String googleId;

    private String provedorOauth;

    private LocalDateTime ultimaMudancaSenha;

    private LocalDateTime ultimoLogin;

    private boolean habilitado = true;

    private boolean contaNaoExpirada = true;

    private boolean contaNaoBloqueada = true;

    private boolean credenciaisNaoExpiradas = true;

    private LocalDateTime criadoEm;

    private LocalDateTime atualizadoEm;

    // Campos de perfil
    private String ra;
    private String fotoUrl;
    private String curso;
    private Integer semestre;
    private String periodo; // MATUTINO, VESPERTINO, NOTURNO
    private String drt;

    public AppUser() {
    }

    public AppUser(String id, String nome, String email, String senhaHash, Role papel) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash;
        this.papel = papel;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    // Compatibilidade com partes legadas do código.
    public String getSenha() {
        return senhaHash;
    }

    // Compatibilidade com partes legadas do código.
    public void setSenha(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    public Role getPapel() {
        return papel;
    }

    public void setPapel(Role papel) {
        this.papel = papel;
    }

    public List<Role> getPapeis() { return papeis; }
    public void setPapeis(List<Role> papeis) { this.papeis = papeis; }

    public boolean isPrimeiroAcesso() {
        return primeiroAcesso;
    }

    public void setPrimeiroAcesso(boolean primeiroAcesso) {
        this.primeiroAcesso = primeiroAcesso;
    }

    public boolean isRequerMudancaSenha() {
        return requerMudancaSenha;
    }

    public void setRequerMudancaSenha(boolean requerMudancaSenha) {
        this.requerMudancaSenha = requerMudancaSenha;
    }

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public String getProvedorOauth() {
        return provedorOauth;
    }

    public void setProvedorOauth(String provedorOauth) {
        this.provedorOauth = provedorOauth;
    }

    public LocalDateTime getUltimaMudancaSenha() {
        return ultimaMudancaSenha;
    }

    public void setUltimaMudancaSenha(LocalDateTime ultimaMudancaSenha) {
        this.ultimaMudancaSenha = ultimaMudancaSenha;
    }

    public LocalDateTime getUltimoLogin() {
        return ultimoLogin;
    }

    public void setUltimoLogin(LocalDateTime ultimoLogin) {
        this.ultimoLogin = ultimoLogin;
    }

    public boolean isHabilitado() {
        return habilitado;
    }

    public void setHabilitado(boolean habilitado) {
        this.habilitado = habilitado;
    }

    public boolean isContaNaoExpirada() {
        return contaNaoExpirada;
    }

    public void setContaNaoExpirada(boolean contaNaoExpirada) {
        this.contaNaoExpirada = contaNaoExpirada;
    }

    public boolean isContaNaoBloqueada() {
        return contaNaoBloqueada;
    }

    public void setContaNaoBloqueada(boolean contaNaoBloqueada) {
        this.contaNaoBloqueada = contaNaoBloqueada;
    }

    public boolean isCredenciaisNaoExpiradas() {
        return credenciaisNaoExpiradas;
    }

    public void setCredenciaisNaoExpiradas(boolean credenciaisNaoExpiradas) {
        this.credenciaisNaoExpiradas = credenciaisNaoExpiradas;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(LocalDateTime atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }

    public String getRa() { return ra; }
    public void setRa(String ra) { this.ra = ra; }

    public String getFotoUrl() { return fotoUrl; }
    public void setFotoUrl(String fotoUrl) { this.fotoUrl = fotoUrl; }

    public String getCurso() { return curso; }
    public void setCurso(String curso) { this.curso = curso; }

    public Integer getSemestre() { return semestre; }
    public void setSemestre(Integer semestre) { this.semestre = semestre; }

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }

    public String getDrt() { return drt; }
    public void setDrt(String drt) { this.drt = drt; }
}
