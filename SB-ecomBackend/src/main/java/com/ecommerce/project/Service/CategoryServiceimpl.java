package com.ecommerce.project.Service;

import com.ecommerce.project.Exception.APIException;
import com.ecommerce.project.Exception.ResourceNotFoundException;
import com.ecommerce.project.Model.CategoryModel;
import com.ecommerce.project.Payload.CategoryRequestDTO;
import com.ecommerce.project.Payload.CategoryResponseDTO;
import com.ecommerce.project.Repositories.CategoryRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceimpl implements CategoryService {

    @Autowired
    private final CategoryRepo categoryRepo;

    @Autowired
    private ModelMapper modelMapper;

//constructor injection
    public CategoryServiceimpl(CategoryRepo categoryRepo) {
        this.categoryRepo = categoryRepo;
    }

    @Override
    public CategoryResponseDTO getAllCategories(Integer PageNumber, Integer PageSize,String sortbyID,String sortAS_DS) {
        Sort sortASCorDSC=sortAS_DS.equalsIgnoreCase("asc") ? Sort.by(sortbyID).ascending() : Sort.by(sortbyID).descending();
        Pageable pagedetails = PageRequest.of(PageNumber, PageSize,sortASCorDSC);
        Page<CategoryModel> contentPage=categoryRepo.findAll(pagedetails);
        List<CategoryModel> list = contentPage.getContent();
        if(list.isEmpty()){
            throw new APIException("Category Not Found");
        }
        List<CategoryRequestDTO> categoryDTOS=list.stream().
                map(CategoryX-> modelMapper.map(CategoryX, CategoryRequestDTO.class)).toList();
        CategoryResponseDTO categoryResponseDTO = new CategoryResponseDTO();
        categoryResponseDTO.setContent(categoryDTOS);
        categoryResponseDTO.setPageNumber(contentPage.getNumber());
        categoryResponseDTO.setPageSize(contentPage.getSize());
        categoryResponseDTO.setTotalElements(contentPage.getTotalElements());
        categoryResponseDTO.setTotalPages(contentPage.getTotalPages());
        categoryResponseDTO.setLastPage(contentPage.isLast());
        return categoryResponseDTO;
    }

    @Override
    public CategoryRequestDTO createCategory(CategoryRequestDTO categoryRequestDTO) {
        CategoryModel categoryModel = modelMapper.map(categoryRequestDTO, CategoryModel.class);
        CategoryModel savedCategory = categoryRepo.findByCategoryName(categoryModel.getCategoryName());
        if (savedCategory != null) {
            throw new APIException("Category with the name "
                    + categoryModel.getCategoryName() + " already exists");
        }
        CategoryModel savedCategoryModel = categoryRepo.save(categoryModel);
        CategoryRequestDTO savedCategoryDTO=modelMapper.map(savedCategoryModel, CategoryRequestDTO.class);
        return savedCategoryDTO;
    }

    @Override
    public CategoryRequestDTO deleteCategory(Long categoryId) {
        CategoryModel category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "categoryId", categoryId));
        categoryRepo.delete(category);
        return modelMapper.map(category,CategoryRequestDTO.class);
    }

    @Override
    public CategoryRequestDTO updateCategory(CategoryRequestDTO categoryRequestDTO, Long categoryId) {
        CategoryModel category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "categoryId", categoryId));
        category.setCategoryName(categoryRequestDTO.getCategoryName());
        CategoryModel savedCategoryModel=categoryRepo.save(category);
        CategoryRequestDTO savedCategoryDTO=modelMapper.map(savedCategoryModel, CategoryRequestDTO.class);
        return savedCategoryDTO;
    }
}
