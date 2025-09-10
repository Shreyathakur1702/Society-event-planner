package com.eventplanner.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.eventplanner.backend.model.Event;

import java.util.List;

public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByUserId(String userId);
}

