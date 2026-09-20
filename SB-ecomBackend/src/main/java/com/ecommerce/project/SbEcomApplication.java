package com.ecommerce.project;

import com.ecommerce.project.Model.AppRole;
import com.ecommerce.project.Model.Role;
import com.ecommerce.project.Repositories.RoleRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.ecommerce.project.Model.CategoryModel;
import com.ecommerce.project.Model.Product;
import com.ecommerce.project.Repositories.CategoryRepo;
import com.ecommerce.project.Repositories.ProductRepo;

import java.util.ArrayList;

@SpringBootApplication
public class SbEcomApplication {

	public static void main(String[] args) {
		SpringApplication.run(SbEcomApplication.class, args);
	}

    @Bean
    public CommandLineRunner initData(RoleRepo roleRepo, CategoryRepo categoryRepo, ProductRepo productRepo) {
        return args -> {
            // 1. Seed Roles
            if (roleRepo.findByRoleName(AppRole.ROLE_USER).isEmpty()) {
                roleRepo.save(new Role(AppRole.ROLE_USER));
            }
            if (roleRepo.findByRoleName(AppRole.ROLE_SELLER).isEmpty()) {
                roleRepo.save(new Role(AppRole.ROLE_SELLER));
            }
            if (roleRepo.findByRoleName(AppRole.ROLE_ADMIN).isEmpty()) {
                roleRepo.save(new Role(AppRole.ROLE_ADMIN));
            }

            // 2. Seed Default Categories if none exist
            if (categoryRepo.count() == 0) {
                CategoryModel cat1 = new CategoryModel();
                cat1.setCategoryName("Electronics");
                categoryRepo.save(cat1);

                CategoryModel cat2 = new CategoryModel();
                cat2.setCategoryName("Smartphones");
                categoryRepo.save(cat2);

                CategoryModel cat3 = new CategoryModel();
                cat3.setCategoryName("Fashion & Wear");
                categoryRepo.save(cat3);

                CategoryModel cat4 = new CategoryModel();
                cat4.setCategoryName("Home & Living");
                categoryRepo.save(cat4);

                // 3. Seed Starter Products if none exist
                if (productRepo.count() == 0) {
                    Product p1 = new Product();
                    p1.setProductName("Apple iPhone 15 Pro");
                    p1.setProductDescription("Latest Apple A17 Pro titanium flagship smartphone");
                    p1.setImage("https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=60");
                    p1.setQuantity(50);
                    p1.setPrice(134900.0);
                    p1.setDiscount(10.0);
                    p1.setSpecialPrice(121410.0);
                    p1.setCategory(cat2);
                    p1.setCartItems(new ArrayList<>());
                    productRepo.save(p1);

                    Product p2 = new Product();
                    p2.setProductName("Sony WH-1000XM5 Noise Cancelling");
                    p2.setProductDescription("Industry leading wireless noise cancelling headphones");
                    p2.setImage("https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=60");
                    p2.setQuantity(30);
                    p2.setPrice(29990.0);
                    p2.setDiscount(15.0);
                    p2.setSpecialPrice(25491.5);
                    p2.setCategory(cat1);
                    p2.setCartItems(new ArrayList<>());
                    productRepo.save(p2);

                    Product p3 = new Product();
                    p3.setProductName("MacBook Air M3 Chip");
                    p3.setProductDescription("13.6-inch Liquid Retina Display 8GB Unified Memory 256GB SSD");
                    p3.setImage("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=60");
                    p3.setQuantity(20);
                    p3.setPrice(114900.0);
                    p3.setDiscount(8.0);
                    p3.setSpecialPrice(105708.0);
                    p3.setCategory(cat1);
                    p3.setCartItems(new ArrayList<>());
                    productRepo.save(p3);

                    Product p4 = new Product();
                    p4.setProductName("Classic Cotton Casual Shirt");
                    p4.setProductDescription("Breathable pure premium cotton casual slim-fit shirt");
                    p4.setImage("https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=60");
                    p4.setQuantity(100);
                    p4.setPrice(1999.0);
                    p4.setDiscount(25.0);
                    p4.setSpecialPrice(1499.25);
                    p4.setCategory(cat3);
                    p4.setCartItems(new ArrayList<>());
                    productRepo.save(p4);
                }
            }
        };
    }
}
