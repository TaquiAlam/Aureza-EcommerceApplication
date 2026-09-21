package com.ecommerce.project.Repositories;

import com.ecommerce.project.Model.CategoryModel;
import com.ecommerce.project.Model.Product;
import com.ecommerce.project.Model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepo extends JpaRepository<Product,Long> , JpaSpecificationExecutor<Product> {
    Page<Product> findBycategory(CategoryModel categoryModel, Pageable pageDetails);

         Page<Product> findByProductNameLikeIgnoreCase(String s, Pageable pageDetails);

       Page<Product> findByUser(User user, Pageable pageDetails);
}
