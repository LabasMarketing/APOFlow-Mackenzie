package com.apoflow.backend.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "otp_codes")
public class OtpCode {

    @Id
    private String id;

    @Indexed
    private String email;

    private String code;

    private LocalDateTime expiresAt;

    private boolean used;

    public OtpCode() {
    }

    public OtpCode(String email, String code, LocalDateTime expiresAt) {
        this.email = email;
        this.code = code;
        this.expiresAt = expiresAt;
        this.used = false;
    }

    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getCode() { return code; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }
}
