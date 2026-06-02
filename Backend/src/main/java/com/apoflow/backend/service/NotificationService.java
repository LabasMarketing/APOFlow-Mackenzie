package com.apoflow.backend.service;

import com.apoflow.backend.api.dto.NotificationResponse;
import com.apoflow.backend.domain.AppNotification;
import com.apoflow.backend.domain.AppUser;
import com.apoflow.backend.domain.Role;
import com.apoflow.backend.repository.AppNotificationRepository;
import com.apoflow.backend.repository.AppUserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class NotificationService {

    private final AppNotificationRepository notificationRepository;
    private final AppUserRepository userRepository;
    private final EmailService emailService;

    public NotificationService(AppNotificationRepository notificationRepository,
                                AppUserRepository userRepository,
                                EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public List<NotificationResponse> findByRecipient(String recipient) {
        migrateLegacyRoleNotifications(recipient);
        return notificationRepository.findByDestinatarioIn(List.of(recipient)).stream()
                .map(this::map)
                .toList();
    }

    public void create(String id, String title, String time, boolean read, String recipient) {
        List<AppUser> targetUsers = resolveTargetUsers(recipient);
        if (targetUsers.isEmpty()) {
            notificationRepository.save(new AppNotification(id, title, time, read, recipient));
            sendEmailToRecipient(recipient, title);
            return;
        }

        targetUsers.forEach(user -> {
            notificationRepository.save(new AppNotification(notificationId(id, user.getId()), title, time, read, user.getId()));
            emailService.sendApoNotification(user.getEmail(), user.getNome(), title, title);
        });
    }

    public void markAllAsRead(String recipient) {
        notificationRepository.findByDestinatarioIn(List.of(recipient)).stream()
                .filter(notification -> !notification.isLida())
                .forEach(notification -> {
                    notification.setLida(true);
                    notificationRepository.save(notification);
                });
    }

    private void sendEmailToRecipient(String recipient, String title) {
        try {
            Role role = Role.valueOf(recipient.toUpperCase());
            userRepository.findFirstByPapel(role).ifPresent(user ->
                    emailService.sendApoNotification(user.getEmail(), user.getNome(), title, title));
        } catch (IllegalArgumentException ignored) {
            // recipient is a user id, not a role
            Optional<AppUser> userOpt = userRepository.findById(recipient);
            userOpt.ifPresent(user ->
                    emailService.sendApoNotification(user.getEmail(), user.getNome(), title, title));
        }
    }

    private List<AppUser> resolveTargetUsers(String recipient) {
        if ("all".equalsIgnoreCase(recipient)) {
            return userRepository.findAll();
        }

        try {
            Role role = Role.valueOf(recipient.toUpperCase());
            return userRepository.findAll().stream()
                    .filter(user -> hasRole(user, role))
                    .toList();
        } catch (IllegalArgumentException ignored) {
            return userRepository.findById(recipient)
                    .map(user -> List.of(user))
                    .orElseGet(List::of);
        }
    }

    private boolean hasRole(AppUser user, Role role) {
        if (user.getPapeis() != null && user.getPapeis().contains(role)) {
            return true;
        }
        return user.getPapel() == role;
    }

    private String notificationId(String baseId, String userId) {
        if (baseId == null || baseId.isBlank()) {
            return "noti-" + UUID.randomUUID().toString().substring(0, 8) + "-" + userId;
        }
        return baseId + "-" + userId;
    }

    private void migrateLegacyRoleNotifications(String recipient) {
        userRepository.findById(recipient).ifPresent(user -> {
            List<String> legacyRecipients = new ArrayList<>();
            legacyRecipients.add("all");
            effectiveRoles(user).forEach(role -> legacyRecipients.add(role.name().toLowerCase()));

            notificationRepository.findByDestinatarioIn(legacyRecipients).forEach(notification -> {
                String copyId = notificationId(notification.getId(), user.getId());
                if (notificationRepository.existsById(copyId)) {
                    return;
                }

                notificationRepository.save(new AppNotification(
                        copyId,
                        notification.getTitulo(),
                        notification.getTempo(),
                        notification.isLida(),
                        user.getId()
                ));
            });
        });
    }

    private List<Role> effectiveRoles(AppUser user) {
        return (user.getPapeis() != null && !user.getPapeis().isEmpty())
                ? user.getPapeis()
                : List.of(user.getPapel());
    }

    private NotificationResponse map(AppNotification notification) {
        return new NotificationResponse(notification.getId(), notification.getTitulo(), notification.getTempo(), notification.isLida());
    }
}
