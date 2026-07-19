package com.Hospital.backend.Controller;


import com.Hospital.backend.Dto.AppointmentSummary;
import com.Hospital.backend.Entities.Appointment;
import com.Hospital.backend.Entities.User;
import com.Hospital.backend.Service.AppointmentService;
import com.Hospital.backend.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping(path = "/hospital")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {
    @Autowired
    private AppointmentService appointmentService;
    @Autowired
    private UserService userService;
    //Get all appointment
    @GetMapping("/appointments")
    public List<AppointmentSummary> getAllAppointments(){
        List<Appointment> appointments = appointmentService.getAllAppointments();
        List<AppointmentSummary> appointmentList = new ArrayList<>();
        for (Appointment appointment : appointments) {
            AppointmentSummary summary = new AppointmentSummary(
                    appointment.getId(),
                    appointment.getDoctor(),
                    appointment.getTitle(),
                    appointment.getPlace(),
                    appointment.getDate().toString(),
                    appointment.getTime().toString()
            );
            appointmentList.add(summary);
        }
        return appointmentList;
    }

    //Add new appointment
    @PostMapping("/add")
    public ResponseEntity<Appointment> addAppointment(@RequestBody Appointment appointment){
        Appointment savedAppointment = appointmentService.addAppointment(appointment);
        return ResponseEntity.ok(savedAppointment);
    }
    //Delete appointment
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteAppointment(@PathVariable Long id){
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok("Appointment deleted successfully");
    }
    //reserve appointment
    @PostMapping("/reserve/{appointmentId}")
    public ResponseEntity<?> reserveAppointment(@PathVariable Long appointmentId, Authentication authentication){
        String username = authentication.getName();
        Optional<User> user = userService.findByUsername(username);
        if (user.isPresent()){
            Long userId = user.get().getId();
            try{
                Appointment updateAppointment = appointmentService.reserveAppointment(appointmentId,userId);
                AppointmentSummary appointmentSummary = new AppointmentSummary(
                        updateAppointment.getId(),
                        updateAppointment.getDoctor(),
                        updateAppointment.getTitle(),
                        updateAppointment.getPlace(),
                        updateAppointment.getDate().toString(),
                        updateAppointment.getTime().toString()
                );
                return ResponseEntity.ok(appointmentSummary);
            }catch (RuntimeException e){
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }
        return ResponseEntity.status(404).build();

    }
    //unreserved appointment
    @PostMapping("/unreserve/{appointmentId}")
    public ResponseEntity<?> unreservedAppointment(@PathVariable Long appointmentId){
        try{
            Appointment updateAppointment = appointmentService.unreservedAppointment(appointmentId);
            return ResponseEntity.ok(updateAppointment);
        }catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // see user reserved appointment only admin
    @GetMapping("/admin/appointment")
    public List<AppointmentSummary> getAllAppointmentsOnlyAdmin() {
        List<Appointment> appointments = appointmentService.getAllAppointments();
        List<AppointmentSummary> appointmentList = new ArrayList<>();
        for (Appointment appointment : appointments) {
            if (appointment.getUser() != null) {
                if (appointment.getUser().getUsername() != null) {
                    AppointmentSummary summary = new AppointmentSummary(
                            appointment.getId(),
                            appointment.getDoctor(),
                            appointment.getTitle(),
                            appointment.getPlace(),
                            appointment.getDate().toString(),
                            appointment.getTime().toString(),
                            appointment.getUser().getUsername()
                    );
                    appointmentList.add(summary);
                }
            }
        }
        return appointmentList;

    }
}
