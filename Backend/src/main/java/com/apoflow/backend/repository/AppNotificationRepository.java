package com.apoflow.backend.repository;

import com.apoflow.backend.domain.AppNotification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AppNotificationRepository extends MongoRepository<AppNotification, String> {
    List<AppNotification> findByDestinatarioIn(List<String> destinatarios);
}
