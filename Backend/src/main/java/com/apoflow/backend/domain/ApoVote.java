package com.apoflow.backend.domain;

public class ApoVote {

    private String membro;

    private VoteDecision decisao;

    private String justificativa;

    public ApoVote() {
    }

    public ApoVote(String membro, VoteDecision decisao, String justificativa) {
        this.membro = membro;
        this.decisao = decisao;
        this.justificativa = justificativa;
    }

    public String getMembro() {
        return membro;
    }

    public void setMembro(String membro) {
        this.membro = membro;
    }

    public VoteDecision getDecisao() {
        return decisao;
    }

    public void setDecisao(VoteDecision decisao) {
        this.decisao = decisao;
    }

    public String getJustificativa() {
        return justificativa;
    }

    public void setJustificativa(String justificativa) {
        this.justificativa = justificativa;
    }
}
