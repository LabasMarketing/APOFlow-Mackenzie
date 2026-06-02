package com.apoflow.backend.api.dto;

import java.util.List;

public record ProfileResponse(
        String id,
        String nome,
        String email,
        String papel,
        List<String> papeis,
        String fotoUrl,
        String periodo,
        String drt,
        String orientadorId,
        String orientadorNome
) {
}
