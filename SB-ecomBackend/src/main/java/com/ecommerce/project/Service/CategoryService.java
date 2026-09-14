package com.ecommerce.project.Service;

import com.ecommerce.project.Model.CategoryModel;
import com.ecommerce.project.Payload.CategoryRequestDTO;
import com.ecommerce.project.Payload.CategoryResponseDTO;

import java.util.List;

//interface to achieve loose coupling
public interface CategoryService {
      CategoryResponseDTO getAllCategories(Integer PageNumber, Integer PageSize,String sortbyID,String sortAS_DS);
      CategoryRequestDTO createCategory(CategoryRequestDTO categoryRequestDTO);
      CategoryRequestDTO deleteCategory(Long categoryId);
      CategoryRequestDTO updateCategory(CategoryRequestDTO categoryRequestDTO,Long categoryId);
}
