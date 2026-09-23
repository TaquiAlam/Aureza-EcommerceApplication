package com.ecommerce.project.Service;

import com.ecommerce.project.Payload.StripePaymentDto;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;



public interface StripeService {
    PaymentIntent paymentIntent(StripePaymentDto stripePaymentDto) throws StripeException;
    PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException;
}
