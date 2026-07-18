package com.Hospital.backend.Dto;

import java.util.List;

public class UserProfileResponse {
    private String username;
    private String firstname;
    private String lastname;
    private String email;
    private String number;
    private boolean isAdmin;
    private List<AppointmentSummary> appointments;

    public UserProfileResponse(String username, String firstname, String lastname, String email, String number, Boolean admin, List<AppointmentSummary> appointments) {
        this.username = username;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.number = number;
        this.isAdmin = admin;
        this.appointments = appointments;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    public void setAdmin(boolean admin) {
        isAdmin = admin;
    }

    public List<AppointmentSummary> getAppointments() {
        return appointments;
    }

    public void setAppointments(List<AppointmentSummary> appointments) {
        this.appointments = appointments;
    }
}