package com.ecommerce.project.Service;

import com.ecommerce.project.Payload.ProductRequestDTO;
import com.ecommerce.project.Payload.ProductResponceDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface ProductService {
    ProductRequestDTO addProduct(Long categoryID, ProductRequestDTO productRequestDTO);

    ProductResponceDTO getProducts(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder,String keyword, String category);

    ProductResponceDTO getProductsbyCategory(Long categoryId, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    ProductResponceDTO getProductsbyKeyword(String keyword, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    ProductRequestDTO updateProduct(Long productId, ProductRequestDTO productRequestDTO);

    ProductRequestDTO deleteproduct(Long productId);

    ProductRequestDTO updateProductImage(Long productId, MultipartFile image) throws IOException;
}
