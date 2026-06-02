package com.apoflow.backend.api.dto;

import java.util.List;

public record ApoResponse(
        String id,
        String titulo,
        String tipo,
        String descricao,
        Integer pontos,
        String alunoId,
        String aluno,
        String orientadorId,
        String status,
        String coordenacaoEntrada,
        List<String> anexos,
        String dataAtualizacao,
        List<ApoVoteResponse> votos
) {
}
