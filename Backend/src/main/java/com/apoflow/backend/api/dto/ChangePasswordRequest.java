package com.apoflow.backend.api.dto;

import jakarta.validation.constraints.NotBlank;

public record ChangePasswordRequest(
    @NotBlank(message = "Email é obrigatório.") String email,
    String senhaAntiga,
    @NotBlank(message = "Nova senha é obrigatória.") String novaSenha
) {
}
