package com.apoflow.backend.api.dto;

import java.util.List;

public record AdminUserResponse(
        String id,
        String nome,
        String email,
        String papel,
        List<String> papeis,
        String drt,
        String orientadorId,
        String orientadorNome
) {
}
