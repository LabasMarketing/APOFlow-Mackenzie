package com.apoflow.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

    @Value("${brevo.token:}")
    private String apiToken;

    @Value("${brevo.from:apoflowmack@gmail.com}")
    private String fromAddress;

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void send(String to, String subject, String body) {
        if (!emailEnabled) {
            System.out.printf("[EMAIL] Para: %s | Assunto: %s%n%s%n----%n", to, subject, body);
            return;
        }
        try {
            Map<String, Object> payload = Map.of(
                    "sender", Map.of("email", fromAddress, "name", "APOFlow"),
                    "to", List.of(Map.of("email", to)),
                    "subject", subject,
                    "textContent", body
            );

            String json = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BREVO_URL))
                    .header("Content-Type", "application/json")
                    .header("api-key", apiToken)
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                System.out.printf("[EMAIL] Enviado para %s (status %d)%n", to, response.statusCode());
            } else {
                System.err.printf("[EMAIL] Falha ao enviar para %s: HTTP %d — %s%n", to, response.statusCode(), response.body());
                // Log full content so OTP codes can be retrieved from logs when email delivery fails
                System.err.printf("[EMAIL] Conteudo nao entregue:%n%s%n----%n", body);
            }
        } catch (Exception e) {
            System.err.println("[EMAIL] Erro ao enviar para " + to + ": " + e.getMessage());
        }
    }

    public void sendOtp(String to, String nome, String otp) {
        String subject = "APOFlow – Seu código de verificação";
        String body = String.format(
                "Olá, %s!%n%nSeu código de verificação para acesso ao APOFlow é:%n%n    %s%n%n" +
                "Ele é válido por 10 minutos.%nSe você não solicitou este código, ignore este e-mail.%n%n" +
                "— Equipe APOFlow / PPG-CA Mackenzie",
                nome, otp);
        send(to, subject, body);
    }

    public void sendPasswordReset(String to, String nome, String resetLink) {
        String subject = "APOFlow \u2013 Redefinição de senha";
        String body = String.format(
                "Olá, %s!%n%nRecebemos uma solicitação para redefinir a senha da sua conta no APOFlow.%n%n"
                + "Acesse o link abaixo para definir uma nova senha:%n%n    %s%n%n"
                + "Este link é válido por 1 hora.%n"
                + "Se você não solicitou esta redefinição, ignore este e-mail.%n%n"
                + "— Equipe APOFlow / PPG-CA Mackenzie",
                nome, resetLink);
        send(to, subject, body);
    }

    public void sendApoNotification(String to, String nome, String titulo, String evento) {
        String subject = "APOFlow – Atualização na sua APO";
        String body = String.format(
                "Olá, %s!%n%nHouve uma atualização na APO \"%s\":%n%n    %s%n%n" +
                "Acesse o APOFlow para mais detalhes.%n%n— Equipe APOFlow / PPG-CA Mackenzie",
                nome, titulo, evento);
        send(to, subject, body);
    }
}
