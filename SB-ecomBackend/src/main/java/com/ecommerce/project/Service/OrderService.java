package com.ecommerce.project.Service;

import com.ecommerce.project.Payload.OrderResponceDTO;
import com.ecommerce.project.Payload.adminOrderResponce;

public interface OrderService {
    OrderResponceDTO placeOrder(String emailId, Long addressId, String paymentMethod, String pgName, String pgPaymentId, String pgStatus, String pgResponseMessage);

    adminOrderResponce getAllOrders(Integer pageNumber, Integer pageSize, String sortbyID, String sortASDs);
}
