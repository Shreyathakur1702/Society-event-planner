package com.eventplanner.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.eventplanner.backend.model.Event;

public interface EventRepository extends MongoRepository<Event, String> {
}
