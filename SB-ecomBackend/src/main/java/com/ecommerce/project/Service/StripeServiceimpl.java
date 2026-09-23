package com.ecommerce.project.Service;

import com.ecommerce.project.Payload.StripePaymentDto;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.CustomerSearchResult;
import com.stripe.model.PaymentIntent;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.CustomerSearchParams;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class StripeServiceimpl implements StripeService {
    @Value("${stripe.secret.key:}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        if (stripeApiKey != null && !stripeApiKey.isBlank()) {
            Stripe.apiKey = stripeApiKey;
        }
    }

    @Override
    public PaymentIntent paymentIntent(StripePaymentDto stripePaymentDto) throws StripeException {
        if (stripeApiKey != null && !stripeApiKey.isBlank()) {
            Stripe.apiKey = stripeApiKey;
        }
        String currency = (stripePaymentDto.getCurrency() != null && !stripePaymentDto.getCurrency().isBlank())
                ? stripePaymentDto.getCurrency().toLowerCase()
                : "inr";
        Customer customer;
        // Retrieve and check if customer exist
        CustomerSearchParams searchParams =
                CustomerSearchParams.builder()
                        .setQuery("email:'" + stripePaymentDto.getEmail() + "'")
                        .build();
        CustomerSearchResult customers = Customer.search(searchParams);
        if (customers.getData().isEmpty()) {
            // Create new customer
            CustomerCreateParams.Builder customerParamsBuilder = CustomerCreateParams.builder()
                    .setEmail(stripePaymentDto.getEmail())
                    .setName(stripePaymentDto.getName() != null ? stripePaymentDto.getName() : stripePaymentDto.getEmail());

            if (stripePaymentDto.getAddress() != null) {
                customerParamsBuilder.setAddress(
                        CustomerCreateParams.Address.builder()
                                .setLine1(stripePaymentDto.getAddress().getStreetAddress())
                                .setCity(stripePaymentDto.getAddress().getCity())
                                .setState(stripePaymentDto.getAddress().getState())
                                .setPostalCode(stripePaymentDto.getAddress().getPincode())
                                .setCountry(stripePaymentDto.getAddress().getCountry())
                                .build()
                );
            }

            if (stripePaymentDto.getMetadata() != null && !stripePaymentDto.getMetadata().isEmpty()) {
                customerParamsBuilder.putAllMetadata(stripePaymentDto.getMetadata());
            }

            customer = Customer.create(customerParamsBuilder.build());
        } else {
            // Fetch the customer that exist
            customer = customers.getData().get(0);
        }

        PaymentIntentCreateParams.Builder paramsBuilder =
                PaymentIntentCreateParams.builder()
                        .setAmount(stripePaymentDto.getAmount())
                        .setCurrency(stripePaymentDto.getCurrency())
                        .setCustomer(customer.getId())
                        .setDescription(stripePaymentDto.getDescription() != null ? stripePaymentDto.getDescription() : "Order Payment")
                        .setAutomaticPaymentMethods(
                                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                        .setEnabled(true)
                                        .build()
                        );

        if (stripePaymentDto.getMetadata() != null && !stripePaymentDto.getMetadata().isEmpty()) {
            paramsBuilder.putAllMetadata(stripePaymentDto.getMetadata());
        }

        return PaymentIntent.create(paramsBuilder.build());
    }

    @Override
    public PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException {
        if (stripeApiKey != null && !stripeApiKey.isBlank()) {
            Stripe.apiKey = stripeApiKey;
        }
        return PaymentIntent.retrieve(paymentIntentId);
    }
}
