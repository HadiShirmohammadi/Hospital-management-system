package com.Hospital.backend.Controller;


import com.Hospital.backend.Entities.Appointment;
import com.Hospital.backend.Service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/hospital")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {
    @Autowired
    private AppointmentService appointmentService;
    //Get all appointment
    @GetMapping("/appointments")
    public List<Appointment> getAllAppointments(){
        return appointmentService.getAllAppointments();
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
    @PostMapping("/reserve/{appointmentId}/{userId}")
    public ResponseEntity<?> reserveAppointment(@PathVariable Long appointmentId,@PathVariable Long userId){
        try{
            Appointment updateAppointment = appointmentService.reserveAppointment(appointmentId,userId);
            return ResponseEntity.ok(updateAppointment);
        }catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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
}
