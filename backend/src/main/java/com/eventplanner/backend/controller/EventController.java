package com.eventplanner.backend.controller;

import com.eventplanner.backend.model.Event;
import com.eventplanner.backend.model.User;
import com.eventplanner.backend.repository.EventRepository;
import com.eventplanner.backend.repository.UserRepository;
import com.eventplanner.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private String getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            return userRepository.findByEmail(email).map(User::getId).orElse(null);
        }
        return null;
    }

    @GetMapping
    public List<Event> getUserEvents(HttpServletRequest request) {
        String userId = getUserIdFromRequest(request);
        return eventRepository.findByUserId(userId);
    }

    @PostMapping
    public Event createEvent(@RequestBody Event event, HttpServletRequest request) {
        String userId = getUserIdFromRequest(request);
        event.setUserId(userId); // attach owner
        return eventRepository.save(event);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable String id, @RequestBody Event updatedEvent, HttpServletRequest request) {
        String userId = getUserIdFromRequest(request);
        return eventRepository.findById(id)
                .filter(ev -> ev.getUserId().equals(userId)) // only owner can edit
                .map(existingEvent -> {
                    existingEvent.setName(updatedEvent.getName());
                    existingEvent.setSociety(updatedEvent.getSociety());
                    existingEvent.setDate(updatedEvent.getDate());
                    Event saved = eventRepository.save(existingEvent);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build()); // type-safe
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable String id, HttpServletRequest request) {
        String userId = getUserIdFromRequest(request);
        return eventRepository.findById(id)
                .filter(ev -> ev.getUserId().equals(userId)) // only owner can view
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build()); // type-safe
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable String id, HttpServletRequest request) {
        String userId = getUserIdFromRequest(request);
        return eventRepository.findById(id)
                .filter(ev -> ev.getUserId().equals(userId))
                .map(ev -> {
                    eventRepository.deleteById(id);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
