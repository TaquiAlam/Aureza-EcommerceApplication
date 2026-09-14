package com.ecommerce.project.Controller;

import com.ecommerce.project.Model.Cart;
import com.ecommerce.project.Payload.CartDTO;
import com.ecommerce.project.Repositories.CartRepository;
import com.ecommerce.project.Service.CartService;
import com.ecommerce.project.Service.CartServiceimpl;
import com.ecommerce.project.utils.AuthUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CartController {

    @Autowired
    private CartServiceimpl cartServiceimpl;

    @Autowired
    private AuthUtils authUtils;

    @Autowired
    private CartRepository cartRepository;

    @PostMapping("/carts/products/{product_Id}/quantity/{quantity}")
    public ResponseEntity<CartDTO> addProductstoCart(@PathVariable Long product_Id, @PathVariable Integer quantity) {

        CartDTO cartDTO = cartServiceimpl.addProducttoCart(product_Id,quantity);
        return new ResponseEntity<CartDTO>(cartDTO,HttpStatus.CREATED);
    }

    @GetMapping("/carts")
    public ResponseEntity<List<CartDTO>> getallCarts(){
        List<CartDTO> cartDTO=cartServiceimpl.getallCarts();
        return new ResponseEntity<List<CartDTO>>( cartDTO, HttpStatus.FOUND);

    }


    @GetMapping("/carts/users/cart")
    public ResponseEntity<CartDTO> getCartById(){
        String emailId = authUtils.loggedInEmail();
        Cart cart = cartRepository.findCartByEmail(emailId);
        Long cartId = cart.getCartId();
        CartDTO cartDTO = cartServiceimpl.getCart(emailId, cartId);
        return new ResponseEntity<CartDTO>(cartDTO, HttpStatus.OK);
    }

    @PutMapping("/cart/products/{productId}/quantity/{operation}")
    public ResponseEntity<CartDTO> updateCartProduct(@PathVariable Long productId,
                                                     @PathVariable String operation) {

        CartDTO cartDTO = cartServiceimpl.updateProductQuantityInCart(productId,
                operation.equalsIgnoreCase("delete") ? -1 : 1);

        return new ResponseEntity<CartDTO>(cartDTO, HttpStatus.OK);
    }

    @DeleteMapping("/carts/{cartId}/product/{productId}")
    public ResponseEntity<String> deleteProductFromCart(@PathVariable Long cartId,
                                                        @PathVariable Long productId) {
        String status = cartServiceimpl.deleteProductFromCart(cartId, productId);

        return new ResponseEntity<String>(status, HttpStatus.OK);
    }
}
