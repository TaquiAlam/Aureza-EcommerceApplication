package com.ecommerce.project.Controller;


import com.ecommerce.project.Model.Product;
import com.ecommerce.project.Payload.ProductRequestDTO;
import com.ecommerce.project.Payload.ProductResponceDTO;
import com.ecommerce.project.Service.ProductService;
import com.ecommerce.project.config.AppConst;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping("/admin/categories/{categoryID}/product")
    public ResponseEntity<ProductRequestDTO> addProduct(@PathVariable Long categoryID,
                                                        @RequestBody ProductRequestDTO productRequestDTO) {
             ProductRequestDTO SavedproductRequestDTO=productService.addProduct(categoryID,productRequestDTO);

             return new ResponseEntity<>(SavedproductRequestDTO, HttpStatus.CREATED);

    }

    @GetMapping("/public/products")
    public ResponseEntity<ProductResponceDTO> getAllProducts(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "pageNumber", defaultValue = AppConst.Page_Number, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConst.Page_Size, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConst.SORT_PRODUCTS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConst.SortBY, required = false) String sortOrder)
    {
        ProductResponceDTO productResponceDTO=productService.getProducts(pageNumber,pageSize,sortBy,sortOrder,keyword,category);

        return new ResponseEntity<>(productResponceDTO,HttpStatus.OK);
    }

    @GetMapping("/public/categories/{category_Id}/products")
    public ResponseEntity<ProductResponceDTO> getAllProductsByCategory(@PathVariable Long category_Id,
                                                                       @RequestParam(name = "pageNumber", defaultValue = AppConst.Page_Number, required = false) Integer pageNumber,
                                                                       @RequestParam(name = "pageSize", defaultValue = AppConst.Page_Size, required = false) Integer pageSize,
                                                                       @RequestParam(name = "sortBy", defaultValue = AppConst.SORT_PRODUCTS_BY, required = false) String sortBy,
                                                                       @RequestParam(name = "sortOrder", defaultValue = AppConst.SortBY, required = false) String sortOrder) {
        ProductResponceDTO productResponceDTO=productService.getProductsbyCategory(category_Id,pageNumber,pageSize,sortBy,sortOrder);
        return new ResponseEntity<>(productResponceDTO,HttpStatus.OK);
    }

    @GetMapping("/public/products/keyword/{keyword}")
    public ResponseEntity<ProductResponceDTO> getAllProductsByKeyword(@PathVariable String keyword,
                                                                      @RequestParam(name = "pageNumber", defaultValue = AppConst.Page_Number, required = false) Integer pageNumber,
                                                                      @RequestParam(name = "pageSize", defaultValue = AppConst.Page_Size, required = false) Integer pageSize,
                                                                      @RequestParam(name = "sortBy", defaultValue = AppConst.SORT_PRODUCTS_BY, required = false) String sortBy,
                                                                      @RequestParam(name = "sortOrder", defaultValue = AppConst.SortBY, required = false) String sortOrder) {
        ProductResponceDTO productResponceDTO=productService.getProductsbyKeyword(keyword,pageNumber,pageSize,sortBy,sortOrder);
        return new ResponseEntity<>(productResponceDTO,HttpStatus.OK);
    }

    @GetMapping("/public/products/{productId}")
    public ResponseEntity<ProductRequestDTO> getProductById(@PathVariable Long productId) {
        ProductRequestDTO productDTO = productService.getProductById(productId);
        return new ResponseEntity<>(productDTO, HttpStatus.OK);
    }

    @PutMapping("/admin/products/{product_Id}")
    public ResponseEntity<ProductRequestDTO> updateProducts(@PathVariable Long product_Id, @RequestBody ProductRequestDTO productRequestDTO) {
        ProductRequestDTO updatedproductRequestDTO=productService.updateProduct(product_Id,productRequestDTO);
        return new ResponseEntity<>(updatedproductRequestDTO,HttpStatus.OK);
    }

    @DeleteMapping("/admin/products/{product_Id}")
    public ResponseEntity<ProductRequestDTO> deleteProduct(@PathVariable Long product_Id) {
        ProductRequestDTO productRequestDTO=productService.deleteproduct(product_Id);
        return new ResponseEntity<>(productRequestDTO,HttpStatus.OK);
    }

    @PutMapping({"/products/{productId}/image", "/admin/products/{productId}/image"})
    public ResponseEntity<ProductRequestDTO> updateProductImage(@PathVariable Long productId,
                                                         @RequestParam("image") MultipartFile image) throws IOException {
        ProductRequestDTO updatedProduct = productService.updateProductImage(productId, image);
        return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
    }
}
