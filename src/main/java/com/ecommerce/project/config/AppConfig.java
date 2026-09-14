package com.ecommerce.project.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
/*I need this class because i need an third party bean"Model mapper"
What is the problem:;--hmne dtos bana liye for request and response ...but in the implementation layer(getallcategories)
 we has return entity of complete category but we need to return response dto , hence we need a model mapper bean to convert
entity to response dto..*/
/*---------------------------------------------------------------------------------------------------------------------------*/
//dekho ye sb isiliye ho rha hai q ki hm pagination implememt krna chahte hain aur hme kuch esa data return krna hai jisme content
//to user ko dikhe but some metadata na dikhe..
@Configuration
public class AppConfig {

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
}
