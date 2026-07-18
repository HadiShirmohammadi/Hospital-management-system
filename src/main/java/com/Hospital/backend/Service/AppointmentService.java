package com.Hospital.backend.Service;

import com.Hospital.backend.Dto.AppointmentSummary;
import com.Hospital.backend.Entities.Appointment;
import com.Hospital.backend.Entities.User;
import com.Hospital.backend.Repository.AppointmentRepository;
import com.Hospital.backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private UserRepository userRepository;

    //Get all Appointment
    public List<Appointment> getAllAppointments(){
        return appointmentRepository.findAll();
    }
    //Get appointment by user id
    public List<AppointmentSummary> getAppoinmentsByUserId(Long userId){
        List<Appointment> appointments = appointmentRepository.findByUserId(userId);
        List<AppointmentSummary> summaries = appointments.stream()
                .map(appointment -> new AppointmentSummary(
                        appointment.getId(),
                        appointment.getDoctor(),
                        appointment.getTitle(),
                        appointment.getPlace(),
                        appointment.getDate().toString(),
                        appointment.getTime().toString()
                ))
                .collect(Collectors.toList());
        return summaries;
    }
    //Add Appointment
    public Appointment addAppointment(Appointment appointment){
        return appointmentRepository.save(appointment);
    }
    //Delete Appointment
    public void deleteAppointment(Long id){
        appointmentRepository.deleteById(id);
    }
    //reserve appointment by user
    public Appointment reserveAppointment(Long appointmentId,Long userId){
        Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow(() -> new RuntimeException("appointment not found!"));
        if (appointment.getReserved()){
            throw new RuntimeException("this appointment already reserved!");
        }
        appointment.setReserved(true);
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found!"));
        appointment.setUser(user);
        return appointmentRepository.save(appointment);
    }
    //unreserved appointment
    public Appointment unreservedAppointment(Long appointmentId){
        Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow(() -> new RuntimeException("appointment not found!"));
        appointment.setReserved(false);
        appointment.setUser(null);
        return appointmentRepository.save(appointment);
    }

}
