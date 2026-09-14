package com.ecommerce.project.Payload;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// What are DTO:- It is the data transfer object used between client and server..to prevent
//1:-Client ko exactly utna data do jitna usko chahiye....puri entity object nhi ..
//2;-Entity aur API ko separate rakhta hai
/*
Client Side
Client
   ↓
DTO
   ↓
Controller
   ↓
Service
   ↓
Entity
   ↓
Database

Server Side
Database
   ↓
Entity
   ↓
DTO
   ↓
JSON Response
   ↓
Client
 */
//it is the client side request object..
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequestDTO {
  private  Long categoryID;
  private String categoryName;
}
