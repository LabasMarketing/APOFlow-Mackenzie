package com.apoflow.backend.api.dto;

import java.util.List;

public record AuthResponse(
    String token,
    String userId,
    String email,
    String nome,
    String papel,
    List<String> papeis,
    boolean primeiroAcesso,
    String mensagem
) {
}
