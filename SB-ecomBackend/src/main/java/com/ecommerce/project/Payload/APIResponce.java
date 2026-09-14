package com.ecommerce.project.Payload;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// This class is used to give custome responce and status....
@Data
@AllArgsConstructor
@NoArgsConstructor
public class APIResponce {
    public String message;
    public boolean status;
}
