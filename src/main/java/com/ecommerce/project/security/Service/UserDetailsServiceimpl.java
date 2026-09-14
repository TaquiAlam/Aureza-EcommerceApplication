package com.ecommerce.project.security.Service;

import com.ecommerce.project.Model.User;
import com.ecommerce.project.Repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

//ye class user ko authentication ke kmm aati hai..
//jab user login krne jata hai to ye class kamm aati hai (lookup the user in database)
//whenever user want to login , spring security will get user info from database through this class..
@Component
public class UserDetailsServiceimpl implements UserDetailsService {

     @Autowired
     UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user =userRepository.findByUsername(username).orElseThrow(()->
                    new UsernameNotFoundException("User not found with username "));


        return UserDetailsimpl.build(user);
    }
}
