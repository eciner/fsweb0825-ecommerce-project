package com.eciner.ecommerce.contact;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
public class ContactController {
    private final ContactService service;
    public ContactController(ContactService service) { this.service = service; }
    @PostMapping("/contact") @ResponseStatus(HttpStatus.CREATED)
    public ContactService.Acknowledgement submit(@Valid @RequestBody ContactRequest request, HttpServletRequest servletRequest) {
        return service.submit(request, servletRequest.getRemoteAddr());
    }
}
