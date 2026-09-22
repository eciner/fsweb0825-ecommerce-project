package com.eciner.ecommerce.probe;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

/** Test-only entity proving Flyway migrations and JPA persistence startup; not part of the production model. */
@Entity
@Table(name = "system_probe")
public class SystemProbe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "note", nullable = false)
    private String note;

    @NotNull
    @Column(name = "checked_at", nullable = false)
    private Instant checkedAt;

    protected SystemProbe() {
    }

    public SystemProbe(String note, Instant checkedAt) {
        this.note = note;
        this.checkedAt = checkedAt;
    }

    public Long getId() {
        return id;
    }

    public String getNote() {
        return note;
    }

    public Instant getCheckedAt() {
        return checkedAt;
    }

}
