"use client";
import { useState } from "react";
import { useUser } from "../contexts/UserContext";

interface StripeCheckoutProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function StripeCheckout({
  onSuccess,
  onError,
}: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { setIsPremium } = useUser();

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      // TODO: Replace with actual Stripe integration
      // For demo purposes, we'll simulate a successful payment

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate successful payment
      const success = Math.random() > 0.1; // 90% success rate for demo

      if (success) {
        setIsPremium(true);
        onSuccess?.();
      } else {
        throw new Error("Payment failed. Please try again.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Payment failed";
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing Payment...
        </div>
      ) : (
        "Upgrade to Premium - $1/month"
      )}
    </button>
  );
}

// Real Stripe integration would look like this:
/*
const handleCheckout = async () => {
  setIsLoading(true);
  
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: 'price_1234567890', // Your Stripe price ID
      }),
    });

    const { sessionId } = await response.json();
    
    const stripe = await stripePromise;
    const { error } = await stripe!.redirectToCheckout({
      sessionId,
    });

    if (error) {
      onError?.(error.message || 'Payment failed');
    }
  } catch (error) {
    onError?.('Payment failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
*/
