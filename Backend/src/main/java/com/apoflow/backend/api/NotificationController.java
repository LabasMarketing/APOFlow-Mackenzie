package com.apoflow.backend.api;

import com.apoflow.backend.api.dto.MarkNotificationsReadRequest;
import com.apoflow.backend.api.dto.NotificationResponse;
import com.apoflow.backend.service.NotificationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<NotificationResponse> findAll(@RequestParam String recipient) {
        return notificationService.findByRecipient(recipient);
    }

    @PostMapping("/read")
    @PreAuthorize("isAuthenticated()")
    public void markAllAsRead(@RequestBody MarkNotificationsReadRequest request) {
        notificationService.markAllAsRead(request.recipient());
    }
}
