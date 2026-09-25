package com.ecommerce.project.Controller;

import com.ecommerce.project.Payload.OrderRequestDTO;
import com.ecommerce.project.Payload.OrderResponceDTO;
import com.ecommerce.project.Payload.OrderStatusUpdateDto;
import com.ecommerce.project.Payload.StripePaymentDto;
import com.ecommerce.project.Payload.adminOrderResponce;
import com.ecommerce.project.Service.OrderService;
import com.ecommerce.project.Service.StripeService;
import com.ecommerce.project.config.AppConst;
import com.ecommerce.project.utils.AuthUtils;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private AuthUtils authUtils;

    @Autowired
    private StripeService stripeService;

    @PostMapping("/order/users/payments/{paymentMethod}")
    public ResponseEntity<OrderResponceDTO> orderProducts(@PathVariable String paymentMethod,
                                                          @RequestBody OrderRequestDTO orderRequestDTO) {
        String emailId = authUtils.loggedInEmail();
        System.out.println("orderRequestDTO DATA: " + orderRequestDTO);
        OrderResponceDTO order = orderService.placeOrder(
                emailId,
                orderRequestDTO.getAddressId(),
                paymentMethod,
                orderRequestDTO.getPgName(),
                orderRequestDTO.getPgPaymentId(),
                orderRequestDTO.getPgStatus(),
                orderRequestDTO.getPgResponseMessage()
        );
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }
    //Client Secret ek temporary secret-like token hai jo frontend ko diya jata hai taaki frontend Stripe ke specific PaymentIntent ko confirm kar sake.
    @PostMapping("/order/stripe-client-secret")
    public ResponseEntity<String> createStripeClientSecret(@RequestBody StripePaymentDto stripePaymentDto) throws StripeException {
        System.out.println("StripePaymentDTO Received " + stripePaymentDto);
        PaymentIntent paymentIntent = stripeService.paymentIntent(stripePaymentDto);
        return new ResponseEntity<>(paymentIntent.getClientSecret(), HttpStatus.CREATED);
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<adminOrderResponce> getAllOrders(@RequestParam (name="PageNumber",defaultValue = AppConst.Page_Number,required=false)Integer PageNumber,
                                                           @RequestParam(name="PageSize",defaultValue = AppConst.Page_Size,required=false) Integer PageSize,
                                                           @RequestParam (name="sortbyID",defaultValue =AppConst.SORT_ORDERS_BY,required=false)String sortbyID,
                                                           @RequestParam (name="sortAS_DS",defaultValue =AppConst.SortBY,required=false)String sortAS_DS)
    {
                  adminOrderResponce OrderResponce = orderService.getAllOrders(PageNumber,PageSize,sortbyID,sortAS_DS);
                   return new ResponseEntity<adminOrderResponce>(OrderResponce, HttpStatus.OK);


    }

    @GetMapping("/seller/orders")
    public ResponseEntity<adminOrderResponce> getAllSellerOrders(
            @RequestParam(name = "PageNumber", defaultValue = AppConst.Page_Number, required = false) Integer PageNumber,
            @RequestParam(name = "PageSize", defaultValue = AppConst.Page_Size, required = false) Integer PageSize,
            @RequestParam(name = "sortbyID", defaultValue = AppConst.SORT_ORDERS_BY, required = false) String sortbyID,
            @RequestParam(name = "sortAS_DS", defaultValue = AppConst.SortBY, required = false) String sortAS_DS
    ) {
        adminOrderResponce orderResponse = orderService.getAllSellerOrders(PageNumber, PageSize, sortbyID, sortAS_DS);
        return new ResponseEntity<adminOrderResponce>(orderResponse, HttpStatus.OK);
    }

    @PutMapping({"/admin/orders/{orderId}/status", "/seller/orders/{orderId}/status"})
    public ResponseEntity<OrderResponceDTO> updateOrderStatus(@PathVariable Long orderId,
                                                              @RequestBody OrderStatusUpdateDto orderStatusUpdateDto) {
        OrderResponceDTO order = orderService.updateOrder(orderId, orderStatusUpdateDto.getStatus());
        return new ResponseEntity<OrderResponceDTO>(order, HttpStatus.OK);
    }
}