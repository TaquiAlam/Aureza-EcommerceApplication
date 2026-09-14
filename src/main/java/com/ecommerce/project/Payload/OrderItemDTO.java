package com.ecommerce.project.Payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//responce for frontned as orderitem
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {
    private Long orderItemId;
    private ProductRequestDTO product;
    private Integer quantity;
    private double discount;
    private double orderedProductPrice;
}