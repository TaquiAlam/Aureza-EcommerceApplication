package com.ecommerce.project.Controller;

import com.ecommerce.project.Payload.AnalyticsResponce;
import com.ecommerce.project.Service.AnalyticsServics;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AnalyticsController {

    @Autowired
    private AnalyticsServics analyticsServics;

    @GetMapping({"/admin/app/analytics", "/admin/analytics"})
    public ResponseEntity<AnalyticsResponce> getAnalytics() {
        AnalyticsResponce analyticsResponce = analyticsServics.getAnalyticsData();
        return new ResponseEntity<AnalyticsResponce>(analyticsResponce, HttpStatus.OK);
    }
}
