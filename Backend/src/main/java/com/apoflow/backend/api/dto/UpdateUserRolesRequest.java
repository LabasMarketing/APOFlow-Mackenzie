package com.apoflow.backend.api.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record UpdateUserRolesRequest(
        @NotEmpty(message = "Informe ao menos um perfil.") List<String> papeis,
        String orientadorId
) {
}
