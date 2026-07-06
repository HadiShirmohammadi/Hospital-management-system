package com.Hospital.backend.Repository;

import com.Hospital.backend.Entities.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment,Long> {
    List<Appointment> findByUserId(Long userid);
}
