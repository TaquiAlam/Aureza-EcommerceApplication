package com.ecommerce.project.Controller;


import com.ecommerce.project.Model.CategoryModel;
import com.ecommerce.project.Payload.CategoryRequestDTO;
import com.ecommerce.project.Payload.CategoryResponseDTO;
import com.ecommerce.project.Service.CategoryService;
import com.ecommerce.project.config.AppConst;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    //Dekho bhai ab hm finally pagination implement krne ja rhe hai ..hme user se PageNumber,PageSize chahiye..yhen uske
    //baad hm jaenge service class mai and use of Pagable interface we can retrive data form data base according to our needs
    @GetMapping("/public/categories")
    public ResponseEntity<List<CategoryResponseDTO>> getCategories(@RequestParam (name="PageNumber",defaultValue =AppConst.Page_Number,required=false)Integer PageNumber,
                                                                   @RequestParam(name="PageSize",defaultValue = AppConst.Page_Size,required=false) Integer PageSize,
                                                                   @RequestParam (name="sortbyID",defaultValue =AppConst.SortbyID,required=false)String sortbyID,
                                                                               @RequestParam (name="sortAS_DS",defaultValue =AppConst.SortBY,required=false)String sortAS_DS) {
        List<CategoryResponseDTO> allCategories = Collections.singletonList(categoryService.getAllCategories(PageNumber, PageSize,sortbyID,sortAS_DS));
        return new ResponseEntity<>(allCategories,HttpStatus.OK);
    }
    //request variable is used to mapp static variable of url
    //@Valid Annotation:- it gives user friendly error message when you give some error by passing a value
    //like you left blank the category section
    @PostMapping("/public/categories")
    public ResponseEntity<CategoryRequestDTO> addCategory(@Valid @RequestBody CategoryRequestDTO categoryRequestDTO) {
       CategoryRequestDTO savedCategoryDTO= categoryService.createCategory(categoryRequestDTO);
        return new ResponseEntity<>(savedCategoryDTO, HttpStatus.CREATED);
    }
//Path variable is used to map external dynamic value given by user in the url
    // Why we use Response body:-It is a way to handel to http specific excaption directrly and you can communicate message and meaning full staus code.
    @DeleteMapping("/admin/categories/{categoryId}")
    public ResponseEntity<CategoryRequestDTO> deleteCategory(@PathVariable Long categoryId){

            CategoryRequestDTO deletedCategory = categoryService.deleteCategory(categoryId);
            return new ResponseEntity<>(deletedCategory, HttpStatus.OK);


    }
    @PutMapping("/public/categories/{categoryId}")
    public ResponseEntity<CategoryRequestDTO> updateCategory(@RequestBody CategoryRequestDTO categoryRequestDTO,
                                                  @PathVariable  Long categoryId ) {

           CategoryRequestDTO status = categoryService.updateCategory(categoryRequestDTO, categoryId);
            return new ResponseEntity<>(status, HttpStatus.OK);
    }

}
