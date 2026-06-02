package com.apoflow.backend.api.dto;

import jakarta.validation.constraints.NotBlank;

public record DecisionRequest(@NotBlank String justificativa) {
}
