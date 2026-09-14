package com.ecommerce.project.Repositories;

import com.ecommerce.project.Model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



import java.util.Optional;
@Repository
public interface UserRepository extends JpaRepository<User,Long> {


    Optional<User> findByUsername(String userName);

    boolean existsByUsername(@NotBlank @Size(min = 2, max = 20) String userName);

    boolean existsByUseremail(@NotBlank @Email @Size(min = 3, max = 50) String userEmail);


}
