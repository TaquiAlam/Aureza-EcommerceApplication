package com.ecommerce.project.Service;

import com.ecommerce.project.Payload.CartDTO;
import com.ecommerce.project.Payload.CartItemDTO;
import jakarta.transaction.Transactional;

import java.util.List;

public interface CartService {

     CartDTO addProducttoCart(Long productId, Integer quantity);


     List<CartDTO> getallCarts();
     CartDTO getCart(String emailId, Long cartId);


     @Transactional
     CartDTO updateProductQuantityInCart(Long productId, Integer quantity);

     String deleteProductFromCart(Long cartId, Long productId);

     void updateProductInCarts(Long cartId, Long productId);

     String createOrUpdateCartWithItems(List<CartItemDTO> cartItems);
}
