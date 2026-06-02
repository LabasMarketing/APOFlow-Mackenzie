package com.apoflow.backend.domain;

public class ApoAttachment {

    private String nomeArquivo;

    public ApoAttachment() {
    }

    public ApoAttachment(String nomeArquivo) {
        this.nomeArquivo = nomeArquivo;
    }

    public String getNomeArquivo() {
        return nomeArquivo;
    }

    public void setNomeArquivo(String nomeArquivo) {
        this.nomeArquivo = nomeArquivo;
    }
}
