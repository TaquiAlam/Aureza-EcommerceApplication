package com.ecommerce.project.Service;

import com.ecommerce.project.Exception.APIException;
import com.ecommerce.project.Exception.ResourceNotFoundException;
import com.ecommerce.project.Model.Cart;
import com.ecommerce.project.Model.CategoryModel;
import com.ecommerce.project.Model.Product;
import com.ecommerce.project.Payload.CartDTO;
import com.ecommerce.project.Payload.ProductRequestDTO;
import com.ecommerce.project.Payload.ProductResponceDTO;
import com.ecommerce.project.Repositories.CartRepository;
import com.ecommerce.project.Repositories.CategoryRepo;
import com.ecommerce.project.Repositories.ProductRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;

import java.util.List;
import java.util.stream.Collectors;


@Service
public class ProductServiceimpl implements ProductService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private CategoryRepo categoryRepo;

    @Autowired
    private com.ecommerce.project.Repositories.OrderItemRepo orderItemRepo;

    @Autowired
    private FileService fileService;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private com.ecommerce.project.utils.AuthUtils authUtils;

    @Value("${project.file}")
    private String path;

    @Override
    public ProductRequestDTO addProduct(Long categoryID, ProductRequestDTO productRequestDTO) {
        CategoryModel categoryModel=categoryRepo.findById(categoryID)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category","categoryId",categoryID));

        boolean isProductNotPresent=true;
        List<Product> products = categoryModel.getProducts();
        if (products != null) {
            for (Product value : products) {
                if (value.getProductName() != null && value.getProductName().equalsIgnoreCase(productRequestDTO.getProductName())) {
                    isProductNotPresent = false;
                    break;
                }
            }
        }

        if(isProductNotPresent) {
            Product product = modelMapper.map(productRequestDTO, Product.class);
            product.setImage("default.png");
            product.setCategory(categoryModel);
            try {
                product.setUser(authUtils.loggedInUser());
            } catch (Exception e) {
                // User may not be logged in or test context
            }
            if (product.getProductDescription() == null || product.getProductDescription().trim().length() < 6) {
                product.setProductDescription(productRequestDTO.getProductDescription() != null && productRequestDTO.getProductDescription().trim().length() >= 6
                        ? productRequestDTO.getProductDescription()
                        : "Quality product from Aureza store");
            }
            double specialPrice = product.getPrice() -
                    ((product.getDiscount() * 0.01) * product.getPrice());
            product.setSpecialPrice(specialPrice);
            Product savedProduct = productRepo.save(product);
            return modelMapper.map(savedProduct, ProductRequestDTO.class);
        }else{
              throw  new APIException("Product already exist!!");
        }

    }

    @Override
    public ProductResponceDTO getProducts(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder,String keyword, String category){
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Specification<Product> spec = (root, query, cb) -> cb.conjunction();
        if (keyword != null && !keyword.trim().isEmpty()) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("productName")), "%" + keyword.trim().toLowerCase() + "%"));
        }

        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("All")) {
            spec = spec.and((root, query, criteriaBuilder) -> {
                try {
                    Long catId = Long.parseLong(category.trim());
                    return criteriaBuilder.equal(root.get("category").get("id"), catId);
                } catch (NumberFormatException e) {
                    return criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("category").get("categoryName")),
                            "%" + category.trim().toLowerCase() + "%"
                    );
                }
            });
        }

        Page<Product> products=productRepo.findAll(spec,pageDetails);
        List<ProductRequestDTO> ProductsDTO=products.stream()
                .map(product -> modelMapper.map(product,ProductRequestDTO.class)).toList();
        ProductResponceDTO productResponceDTO=new ProductResponceDTO();
        productResponceDTO.setContent(ProductsDTO);
        productResponceDTO.setPage_Number(products.getNumber());
        productResponceDTO.setPage_Size(products.getSize());
        productResponceDTO.setTotalElements(products.getTotalElements());
        productResponceDTO.setTotalPages(products.getTotalPages());
        productResponceDTO.setLastPage(products.isLast());

        return productResponceDTO;

    }

    @Override
    public ProductResponceDTO getProductsbyCategory(Long categoryId, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder){
        CategoryModel categoryModel=categoryRepo.findById(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category","categoryId",categoryId));
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);

        Page<Product> pageProducts=productRepo.findBycategory(categoryModel,pageDetails);
        List<Product> products = pageProducts.getContent();

        if(products.isEmpty()){
            throw new APIException(categoryModel.getCategoryName() + " category does not have any products");
        }
        List<ProductRequestDTO> ProductsDTO=products.stream()
                .map(product -> modelMapper.map(product,ProductRequestDTO.class)).toList();


        ProductResponceDTO productResponceDTO=new ProductResponceDTO();
        productResponceDTO.setContent(ProductsDTO);
        productResponceDTO.setPage_Number(pageProducts.getNumber());
        productResponceDTO.setPage_Size(pageProducts.getSize());
        productResponceDTO.setTotalElements(pageProducts.getTotalElements());
        productResponceDTO.setTotalPages(pageProducts.getTotalPages());
        productResponceDTO.setLastPage(pageProducts.isLast());
        return productResponceDTO;
    }
    @Override
    public ProductResponceDTO getProductsbyKeyword(String keyword, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder){
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<Product> pageproducts=productRepo.findByProductNameLikeIgnoreCase('%' + keyword + '%',pageDetails);
        List<Product> products=pageproducts.getContent();
        List<ProductRequestDTO> ProductsDTO=products.stream()
                .map(product -> modelMapper.map(product,ProductRequestDTO.class)).toList();

        if(products.isEmpty()){
            throw new APIException("Product does not exist!!");
        }
        ProductResponceDTO productResponceDTO=new ProductResponceDTO();
        productResponceDTO.setContent(ProductsDTO);
        productResponceDTO.setContent(ProductsDTO);
        productResponceDTO.setPage_Number(pageproducts.getNumber());
        productResponceDTO.setPage_Size(pageproducts.getSize());
        productResponceDTO.setTotalElements(pageproducts.getTotalElements());
        productResponceDTO.setTotalPages(pageproducts.getTotalPages());
        productResponceDTO.setLastPage(pageproducts.isLast());

        return productResponceDTO;
    }

    @Override
    public ProductRequestDTO getProductById(Long productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));
        return modelMapper.map(product, ProductRequestDTO.class);
    }

    @Override
     public ProductRequestDTO updateProduct(Long productId, ProductRequestDTO productRequestDTO){
        //retriving products from db
        Product productsfromDB=productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "product_Id",productId));

        // Update the Products to the updated data
        if (productRequestDTO.getProductName() != null && !productRequestDTO.getProductName().isBlank()) {
            productsfromDB.setProductName(productRequestDTO.getProductName().trim());
        }
        if (productRequestDTO.getPrice() > 0) {
            productsfromDB.setPrice(productRequestDTO.getPrice());
        }
        if (productRequestDTO.getProductDescription() != null && productRequestDTO.getProductDescription().trim().length() >= 6) {
            productsfromDB.setProductDescription(productRequestDTO.getProductDescription().trim());
        } else if (productsfromDB.getProductDescription() == null || productsfromDB.getProductDescription().trim().length() < 6) {
            productsfromDB.setProductDescription("Quality product from Aureza store");
        }
        if (productRequestDTO.getQuantity() != null) {
            productsfromDB.setQuantity(productRequestDTO.getQuantity());
        }
        productsfromDB.setDiscount(productRequestDTO.getDiscount());
        double specialPrice = productsfromDB.getPrice() -
                ((productsfromDB.getDiscount() * 0.01) * productsfromDB.getPrice());
        productsfromDB.setSpecialPrice(specialPrice);

        // Save to database
        Product product1 = productRepo.save(productsfromDB);

        //Dekho bhai hmne cart banaya usme products ko add kiya but what happend ki product update ya delete ho jae
        //to cart ko bhi updated result deikhana hoga...
        List<Cart> carts=cartRepository.findCartBYProductId(productId);

        List<CartDTO> cartDTOs = carts.stream().map(cart -> {
            CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);

            List<ProductRequestDTO> products = cart.getCartItems().stream()
                    .map(p -> modelMapper.map(p.getProduct(), ProductRequestDTO.class)).collect(Collectors.toList());

            cartDTO.setProducts(products);

            return cartDTO;

        }).collect(Collectors.toList());

        cartDTOs.forEach(cart -> cartService.updateProductInCarts(cart.getCartId(), productId));

        return modelMapper.map(product1, ProductRequestDTO.class);

    }

    @jakarta.transaction.Transactional
    @Override
    public ProductRequestDTO deleteproduct(Long productId){
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "product_Id", productId));

        // 1. Disassociate from OrderItems so order history is preserved and FK constraint is not violated
        orderItemRepo.disassociateProduct(productId);

        // 2. Remove product from carts
        List<Cart> carts = cartRepository.findCartBYProductId(productId);
        carts.forEach(cart -> cartService.deleteProductFromCart(cart.getCartId(), productId));

        // 3. Delete product from database
        productRepo.delete(product);

        return modelMapper.map(product, ProductRequestDTO.class);
    }

    @Override
    public ProductRequestDTO updateProductImage(Long productId, MultipartFile image) throws IOException {
        // Get the product from DB
        Product productFromDb = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        // Upload image to server
        // Get the file name of uploaded image

        String fileName = fileService.uploadImage(path, image);

        // Updating the new file name to the product
        productFromDb.setImage(fileName);

        // Save updated product
        Product updatedProduct = productRepo.save(productFromDb);

        // return DTO after mapping product to DTO
        return modelMapper.map(updatedProduct, ProductRequestDTO.class);
    }

    @Override
    public ProductResponceDTO getProductsSeller(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder, String keyword, String category) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        com.ecommerce.project.Model.User user = authUtils.loggedInUser();

        Page<Product> products = productRepo.findByUser(user, pageDetails);
        List<ProductRequestDTO> productsDTO = products.stream()
                .map(product -> modelMapper.map(product, ProductRequestDTO.class)).toList();

        ProductResponceDTO productResponceDTO = new ProductResponceDTO();
        productResponceDTO.setContent(productsDTO);
        productResponceDTO.setPage_Number(products.getNumber());
        productResponceDTO.setPage_Size(products.getSize());
        productResponceDTO.setTotalElements(products.getTotalElements());
        productResponceDTO.setTotalPages(products.getTotalPages());
        productResponceDTO.setLastPage(products.isLast());

        return productResponceDTO;
    }

}
