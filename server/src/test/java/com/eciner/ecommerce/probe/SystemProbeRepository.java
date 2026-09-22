package com.eciner.ecommerce.probe;

import org.springframework.data.jpa.repository.JpaRepository;

/** Test-only repository; exists solely to prove persistence startup, never used in production. */
public interface SystemProbeRepository extends JpaRepository<SystemProbe, Long> {
}
