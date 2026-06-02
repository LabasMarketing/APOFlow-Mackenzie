package com.apoflow.backend.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class AppNotification {

    @Id
    private String id;

    private String titulo;

    private String tempo;

    private boolean lida;

    private String destinatario;

    public AppNotification() {
    }

    public AppNotification(String id, String titulo, String tempo, boolean lida, String destinatario) {
        this.id = id;
        this.titulo = titulo;
        this.tempo = tempo;
        this.lida = lida;
        this.destinatario = destinatario;
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

    public String getTempo() {
        return tempo;
    }

    public void setTempo(String tempo) {
        this.tempo = tempo;
    }

    public boolean isLida() {
        return lida;
    }

    public void setLida(boolean lida) {
        this.lida = lida;
    }

    public String getDestinatario() {
        return destinatario;
    }

    public void setDestinatario(String destinatario) {
        this.destinatario = destinatario;
    }
}
