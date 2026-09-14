package com.ecommerce.project.Repositories;

import com.ecommerce.project.Model.AppRole;
import com.ecommerce.project.Model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.Optional;
@Repository
public interface RoleRepo extends JpaRepository<Role, Integer> {
    Optional<Role> findByRoleName(AppRole appRole);
}
