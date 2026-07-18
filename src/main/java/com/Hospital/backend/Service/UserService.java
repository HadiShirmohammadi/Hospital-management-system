package com.Hospital.backend.Service;

import com.Hospital.backend.Entities.User;
import com.Hospital.backend.Repository.UserRepository;
import org.hibernate.query.sql.internal.ParameterRecognizerImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    //Register User
    public User registerUser(User user){
        String hashedPassword =passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);
        return userRepository.save(user);
    }
    //Chack User password
    public boolean checkPassword(String rawPassword,String hashedPassword){
        return passwordEncoder.matches(rawPassword,hashedPassword);
    }
    //Get User by username
    public Optional<User> findByUsername(String username){
        return userRepository.findByUsername(username);
    }
    //Get User by id
    public Optional<User> getUserById(Long id){
        return userRepository.findById(id);
    }
}
