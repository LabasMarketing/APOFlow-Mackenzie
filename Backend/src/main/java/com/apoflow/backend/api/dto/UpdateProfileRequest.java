package com.apoflow.backend.api.dto;

public record UpdateProfileRequest(
        String nome,
        String fotoUrl,
        String periodo,
        String drt
) {
}
