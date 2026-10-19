package com.eciner.ecommerce.contact;

import com.eciner.ecommerce.common.error.RateLimitException;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class ContactRateLimiter {
    private record Window(long start, int count) {}
    private final Map<String, Window> clients = new HashMap<>();
    synchronized void check(String remoteAddress) {
        long now = Instant.now().getEpochSecond();
        clients.entrySet().removeIf(entry -> now - entry.getValue().start() >= 600);
        Window window = clients.getOrDefault(remoteAddress, new Window(now, 0));
        if (window.count() >= 5 || (!clients.containsKey(remoteAddress) && clients.size() >= 10000)) {
            throw new RateLimitException();
        }
        clients.put(remoteAddress, new Window(window.start(), window.count() + 1));
    }
}
