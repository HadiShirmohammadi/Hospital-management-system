package com.Hospital.backend;

import com.Hospital.backend.Entities.Appointment;
import com.Hospital.backend.Repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {
    @Autowired
    private AppointmentRepository appointmentRepository;

    //Get all Appointment
    public List<Appointment> getAllAppointment(){
        return appointmentRepository.findAll();
    }
    //Add Appointment
    public Appointment addAppointment(Appointment appointment){
        return appointmentRepository.save(appointment);
    }
    //Delete Appointment
    public void deleteAppointment(Long id){
        appointmentRepository.deleteById(id);
    }
}
