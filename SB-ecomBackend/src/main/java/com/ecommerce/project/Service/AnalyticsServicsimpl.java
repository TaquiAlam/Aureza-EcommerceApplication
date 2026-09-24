package com.ecommerce.project.Service;

import com.ecommerce.project.Payload.AnalyticsResponce;
import com.ecommerce.project.Repositories.OrderRepo;
import com.ecommerce.project.Repositories.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsServicsimpl implements AnalyticsServics {
    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private OrderRepo orderRepo;

    @Override
    public AnalyticsResponce getAnalyticsData() {
        AnalyticsResponce response = new AnalyticsResponce();

        long productCount = productRepo.count();
        long totalOrders = orderRepo.count();
        Double totalRevenue = orderRepo.getTotalRevenue();

        response.setProductCount(String.valueOf(productCount));
        response.setTotalOrders(String.valueOf(totalOrders));
        response.setTotalRevenue(String.valueOf(totalRevenue != null ? totalRevenue : 0));
        return response;
    }
}
