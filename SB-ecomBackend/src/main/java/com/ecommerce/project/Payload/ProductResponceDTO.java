package com.ecommerce.project.Payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponceDTO {
    List<ProductRequestDTO> content;
    private Integer Page_Number;
    private Integer Page_Size;
    private Long totalElements;
    private Integer totalPages;
    private boolean lastPage;
}
