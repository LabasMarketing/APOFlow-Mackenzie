package com.apoflow.backend.api.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record SaveDraftRequest(
        @NotBlank String alunoId,
        String titulo,
        String tipo,
        String descricao,
        Integer pontos,
        List<String> anexos
) {
}
