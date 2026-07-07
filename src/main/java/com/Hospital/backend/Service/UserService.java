package com.Hospital.backend.Service;

import com.Hospital.backend.Entities.User;
import com.Hospital.backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    //Register User
    public User registerUser(User user){
        return userRepository.save(user);
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
