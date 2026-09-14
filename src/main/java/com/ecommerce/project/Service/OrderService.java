package com.ecommerce.project.Service;

import com.ecommerce.project.Payload.OrderResponceDTO;

public interface OrderService {
    OrderResponceDTO placeOrder(String emailId, Long addressId, String paymentMethod, String pgName, String pgPaymentId, String pgStatus, String pgResponseMessage);
}
