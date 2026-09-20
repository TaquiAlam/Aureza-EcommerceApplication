package com.ecommerce.project.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name="users",
       uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "user_email")
       })
public class User {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userid;

    @NotBlank
    @Size(min=2, max=20)
    @Column(name = "user_name")
    private String username;

    @NotBlank
    @Size(min=2, max=50)
    @Email
    @Column(name = "user_email", nullable = false)
    private String useremail;

    @NotBlank
    @Size(min=2, max=100)
    @Column(name = "user_password", nullable = false)
    private String userpassword;

    public User(String userName, String userEmail, String userPassword) {
        this.username = userName;
        this.useremail = userEmail;
        this.userpassword = userPassword;
    }
    /*
    @ManyToMany → User ke multiple Roles aur Role ke multiple Users ho sakte hain.
    @JoinTable → beech mein user_role mapping table banata hai, jisme user_Id aur role_Id hote hain.
    Set<Role> → unique roles rakhta hai; EAGER roles ko immediately load karta hai,
    aur PERSIST/MERGE User ke saath role operations cascade karta hai.
     */
    @Getter
    @Setter
    @ManyToMany(cascade = {CascadeType.PERSIST,CascadeType.MERGE},fetch = FetchType.EAGER)
    @JoinTable(name = "user_role",
                    joinColumns = @JoinColumn(name = "user_id"),
                    inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles=new HashSet<>();

    //Seller side view
    @ToString.Exclude
    @OneToMany(mappedBy = "user", cascade = {CascadeType.PERSIST,CascadeType.MERGE},orphanRemoval = true)
    private Set<Product> products;

    @OneToOne(mappedBy = "user",cascade = {CascadeType.PERSIST,CascadeType.MERGE},orphanRemoval = true)
    @ToString.Exclude
    private Cart cart;

    //Adresss connection with user
    @Getter
    @Setter
    @OneToMany(mappedBy = "user", cascade = {CascadeType.PERSIST,CascadeType.MERGE},fetch = FetchType.EAGER,orphanRemoval = true)
    private List<Address> addresses=new ArrayList<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private UserProfile userProfile;

}
