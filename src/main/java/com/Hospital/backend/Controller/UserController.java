package com.Hospital.backend.Controller;

import com.Hospital.backend.Entities.User;
import com.Hospital.backend.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping(path = "/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
    @Autowired
    private UserService userService;

    //register user
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user){
        User savadUser = userService.registerUser(user);
        return ResponseEntity.ok(savadUser);
    }
    //Login user
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest){
        Optional<User> userOpt = userService.findByUsername(loginRequest.getUsername());
        if (userOpt.isPresent()){
            User user = userOpt.get();
            if (user.getPassword().equals(loginRequest.getPassword())){
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.status(401).body("User password or username incorrect");
    }


}
