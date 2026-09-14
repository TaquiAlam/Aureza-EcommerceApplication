package com.ecommerce.project.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "addresses")
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long addressId;

    @NotBlank
    @Size(min =5,message = "Street Address more than 5 charecter")
    private String streetAddress;


    @NotBlank
    @Size(min =4,message = "Building Name more than 4 charecter")
    private String buildingName;

    @NotBlank
    @Size(min =2,message = "city Name more than 2 charecter")
    private String city;

    @NotBlank
    @Size(min =2,message = "state Name more than 2 charecter")
    private String state;

    @NotBlank
    @Size(min =2,message = "country Name more than 2 charecter")
    private String country;

    @NotBlank
    @Size(min =3,message = "Pincode more than 3 charecter")
    private String pincode;


    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;


}
