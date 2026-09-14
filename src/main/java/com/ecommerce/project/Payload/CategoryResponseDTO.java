package com.ecommerce.project.Payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryResponseDTO  {
    private List<CategoryRequestDTO> Content;
    private Integer PageNumber;
    private Integer PageSize;
    private Long totalElements;
    private Integer totalPages;
    private boolean lastPage;
}
