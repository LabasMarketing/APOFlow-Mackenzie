package com.apoflow.backend.api;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping(value = {
        "/",
        "/minhas-apos",
        "/nova-apo",
        "/pendencias",
        "/avaliadas-orientador",
        "/alunos-orientador",
        "/votacao",
        "/itens-aprovados-comissao",
        "/itens-devolvidos-comissao",
        "/avaliacao-final",
        "/aprovados-coordenacao",
        "/empates-resolvidos",
        "/fila-arquivamento",
        "/lancamento",
        "/apos-lancadas",
        "/alunos-secretaria",
        "/usuarios",
        "/notificacoes",
        "/perfil",
        "/register",
        "/change-password",
        "/forgot-password",
        "/reset-password"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
