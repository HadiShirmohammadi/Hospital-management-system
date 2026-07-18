package com.Hospital.backend.Controller;

import com.Hospital.backend.Dto.AppointmentSummary;
import com.Hospital.backend.Dto.AuthResponse;
import com.Hospital.backend.Dto.UserProfileResponse;
import com.Hospital.backend.Entities.User;
import com.Hospital.backend.Service.AppointmentService;
import com.Hospital.backend.Service.JwtService;
import com.Hospital.backend.Service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping(path = "/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private AppointmentService appointmentService;

    //register user
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user){
        User savadUser = userService.registerUser(user);
        String token = jwtService.generateToken(savadUser.getUsername(), savadUser.getAdmin());
        AuthResponse response = new AuthResponse(token, savadUser.getUsername(), savadUser.getAdmin());
        return ResponseEntity.ok(response);
    }
    //Login user
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest){
        Optional<User> userOpt = userService.findByUsername(loginRequest.getUsername());
        if (userOpt.isPresent()){
            User user = userOpt.get();
            if (userService.checkPassword(loginRequest.getPassword(),user.getPassword())){
                String token = jwtService.generateToken(user.getUsername(), user.getAdmin());
                AuthResponse response = new AuthResponse(token, user.getUsername(), user.getAdmin());
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(401).body("User password or username incorrect");
    }
    //Get user profile
    @GetMapping("/check")
    public ResponseEntity<?> checkUser(Authentication authentication){
        String username = authentication.getName();
        Optional<User> userOptional = userService.findByUsername(username);
        if(userOptional.isPresent()){
            User user = userOptional.get();
            List<AppointmentSummary> appointmentSummaryList = appointmentService.getAppoinmentsByUserId(user.getId());
            UserProfileResponse response = new UserProfileResponse(
                    user.getUsername(),
                    user.getFirstname(),
                    user.getLastname(),
                    user.getEmail(),
                    user.getNumber(),
                    user.getAdmin(),
                    appointmentSummaryList
            );
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(404).build();
    }
    // Get is admin or not
    @GetMapping("/admin")
    public ResponseEntity<Void> checkAdmin(Authentication authentication) {
        String username = authentication.getName();
        Optional<User> userOptional = userService.findByUsername(username);
        if (userOptional.isPresent() && userOptional.get().getAdmin()) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(403).build();
    }

}
