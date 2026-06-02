package com.apoflow.backend.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

public record RegisterRequest(
    @NotBlank(message = "Nome é obrigatório.") String nome,
    @Email(message = "Email deve ser válido.")
    @NotBlank(message = "Email é obrigatório.") String email,
    @NotBlank(message = "Senha é obrigatória.") String senha
) {
}
