package com.ecommerce.project.Repositories;

import com.ecommerce.project.Model.CategoryModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepo extends JpaRepository<CategoryModel, Long> {
      CategoryModel findByCategoryName(String categoryName);
}
