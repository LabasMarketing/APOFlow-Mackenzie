package com.apoflow.backend.api.dto;

import jakarta.validation.constraints.NotBlank;

public record VoteRequest(
        @NotBlank String membro,
        @NotBlank String decisao,
        @NotBlank String justificativa
) {
}
