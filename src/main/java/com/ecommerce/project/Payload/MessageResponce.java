package com.ecommerce.project.Payload;


import lombok.Data;

@Data
public class MessageResponce {
    private String message;

    public MessageResponce(String usernameIsAlreadyInUse) {
        this.message = usernameIsAlreadyInUse;
    }
}
