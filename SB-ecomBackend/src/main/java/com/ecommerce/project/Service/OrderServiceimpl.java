package com.ecommerce.project.Service;

import com.ecommerce.project.Exception.APIException;
import com.ecommerce.project.Exception.ResourceNotFoundException;
import com.ecommerce.project.Model.*;
import com.ecommerce.project.Payload.OrderItemDTO;
import com.ecommerce.project.Payload.OrderResponceDTO;
import com.ecommerce.project.Payload.adminOrderResponce;
import com.ecommerce.project.Repositories.*;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderServiceimpl implements OrderService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private AddressRepo addressRepo;

    @Autowired
    private PaymentRepo paymentRepo;

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private OrderItemRepo orderItemRepo;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private CartService cartService;

    @Autowired
    private StripeService stripeService;

    @Autowired
    private ModelMapper modelMapper;


    @Override
    @Transactional
    public OrderResponceDTO placeOrder(String emailId, Long addressId, String paymentMethod,
                                       String pgName, String pgPaymentId, String pgStatus, String pgResponseMessage) {
        // Idempotency: If this payment intent has already created an order, return it directly
        if (pgPaymentId != null && !pgPaymentId.isBlank()) {
            Optional<Payment> existingPayment = paymentRepo.findByPgPaymentId(pgPaymentId);
            if (existingPayment.isPresent() && existingPayment.get().getOrder() != null) {
                Order existingOrder = existingPayment.get().getOrder();
                OrderResponceDTO existingDto = modelMapper.map(existingOrder, OrderResponceDTO.class);
                if (existingOrder.getOrderItems() != null) {
                    existingOrder.getOrderItems().forEach(item -> existingDto.getOrderItems().add(modelMapper.map(item, OrderItemDTO.class)));
                }
                existingDto.setAddressId(existingOrder.getAddress() != null ? existingOrder.getAddress().getAddressId() : addressId);
                return existingDto;
            }
        }

        // Getting User Cart
        Cart cart = cartRepository.findCartByEmail(emailId);
        if (cart == null) {
            throw new ResourceNotFoundException("Cart", "emailId", emailId);
        }
        Address address = addressRepo.findById(addressId).orElseThrow(
                () -> new ResourceNotFoundException("Address", "id", addressId));

        List<CartItem> cartItems = cart.getCartItems();
        if (cartItems.isEmpty()) {
            throw new APIException("Cart is empty");
        }

        // Server-Side Payment Verification
        if ("CARD".equalsIgnoreCase(paymentMethod) || "STRIPE".equalsIgnoreCase(paymentMethod)) {
            if (pgPaymentId == null || !pgPaymentId.startsWith("pi_")) {
                throw new APIException("Invalid payment identifier. A confirmed Stripe PaymentIntent ID is required.");
            }

            try {
                PaymentIntent intent = stripeService.retrievePaymentIntent(pgPaymentId);
                if (!"succeeded".equalsIgnoreCase(intent.getStatus())) {
                    throw new APIException("Payment not confirmed. Current Stripe status: " + intent.getStatus());
                }
                pgStatus = "Completed";
                pgName = "Stripe";
                pgResponseMessage = "Payment verified successfully with Stripe";
            } catch (StripeException e) {
                throw new APIException("Stripe payment verification failed: " + e.getMessage());
            }
        } else if ("COD".equalsIgnoreCase(paymentMethod)) {
            pgStatus = "Pending";
            pgName = "Cash on Delivery";
            pgResponseMessage = "Order placed via Cash on Delivery";
            if (pgPaymentId == null || pgPaymentId.isBlank()) {
                pgPaymentId = "COD_" + System.currentTimeMillis();
            }
        } else if ("UPI".equalsIgnoreCase(paymentMethod)) {
            if (pgPaymentId == null || pgPaymentId.isBlank()) {
                pgPaymentId = "UPI_" + System.currentTimeMillis();
            }
            pgStatus = "Pending";
            if (pgName == null || pgName.isBlank()) {
                pgName = "UPI";
            }
            pgResponseMessage = "UPI payment initiated. Order registered successfully.";
        } else {
            throw new APIException("Unsupported payment method: " + paymentMethod + ". Allowed methods: COD, UPI, CARD.");
        }

        // Create a new order with verified payment info
        Order order = new Order();
        order.setEmail(emailId);
        order.setOrderDate(LocalDate.now());
        order.setTotalAmount(cart.getTotalPrice());
        order.setOrderStatus("Order Accepted!!");
        order.setAddress(address);

        Payment payment = new Payment(paymentMethod, pgPaymentId, pgStatus, pgResponseMessage, pgName);
        payment.setOrder(order);
        payment = paymentRepo.save(payment);
        order.setPayment(payment);

        Order savedOrder = orderRepo.save(order);

        //Get Items form the cart into the order item
        if (cartItems.isEmpty()) {
            throw new APIException("Cart is empty");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setDiscount(cartItem.getDiscount());
            orderItem.setOrderedProductPrice(cartItem.getProductPrice());
            orderItem.setOrder(savedOrder);
            orderItems.add(orderItem);
        }

        orderItems = orderItemRepo.saveAll(orderItems);

        //Update the stock:-such that we have to reduce the product quantity availabe in stocks
        List<CartItem> cartItemsCopy = new ArrayList<>(cart.getCartItems());
        cartItemsCopy.forEach(item -> {
            int quantity = item.getQuantity();
            Product product = item.getProduct();
            // Reduce stock quantity
            product.setQuantity(product.getQuantity() - quantity);

            // Save product back to the database
            productRepo.save(product);

            // Remove items from cart
            cartService.deleteProductFromCart(cart.getCartId(), item.getProduct().getProductId());
        });


        //Send back the order summary
        OrderResponceDTO orderDTO = modelMapper.map(savedOrder, OrderResponceDTO.class);
        List<OrderItemDTO> orderItemDTOList = new ArrayList<>();
        orderItems.forEach(item -> orderItemDTOList.add(modelMapper.map(item, OrderItemDTO.class)));
        orderDTO.setOrderItems(orderItemDTOList);

        orderDTO.setAddressId(addressId);

        return orderDTO;
    }

     @Override
    public adminOrderResponce getAllOrders(Integer pageNumber, Integer pageSize, String sortbyID, String sortASDs) {
        Sort sortByAndOrder = sortASDs.equalsIgnoreCase("asc")
                ? Sort.by(sortbyID).ascending()
                : Sort.by(sortbyID).descending();
        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<Order> pageOrders = orderRepo.findAll(pageDetails);
        List<Order> orders = pageOrders.getContent();
        List<OrderResponceDTO> orderDTOs = orders.stream()
                .map(order -> modelMapper.map(order, OrderResponceDTO.class))
                .toList();
        adminOrderResponce orderResponse = new adminOrderResponce();
        orderResponse.setContents(orderDTOs);
        orderResponse.setPageNumber(pageOrders.getNumber());
        orderResponse.setPageSize(pageOrders.getSize());
        orderResponse.setTotalElements(pageOrders.getTotalElements());
        orderResponse.setTotalPages(pageOrders.getTotalPages());
        orderResponse.setLastPage(pageOrders.isLast());
        return orderResponse;
    }

    @Override
    public OrderResponceDTO updateOrder(Long orderId, String status) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderId", orderId));
        order.setOrderStatus(status);
        orderRepo.save(order);
        return modelMapper.map(order, OrderResponceDTO.class);
    }
}
