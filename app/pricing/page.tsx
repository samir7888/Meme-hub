"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import StripeCheckout from "../components/StripeCheckout";
import { useUser } from "../contexts/UserContext";

export default function PricingPage() {
  const { data: session } = useSession();
  const { isPremium } = useUser();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setPaymentError("");
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentSuccess(false);
  };

  const freeFeatures = [
    "Create unlimited memes",
    "Basic text editing",
    "Drawing tools",
    "Add overlay images",
    "Download as PNG",
    "Watermark on all memes",
  ];

  const premiumFeatures = [
    "Everything in Free",
    "No watermark on memes",
    "HD quality exports",
    "Multiple export formats (PNG, JPG, WebP)",
    "Advanced text effects",
    "Premium templates",
    "Priority support",
    "Early access to new features",
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Start creating amazing memes for free, or upgrade to Premium for the
            ultimate meme-making experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 relative">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="text-4xl font-extrabold mb-2">
                $0
                <span className="text-lg font-normal text-gray-400">
                  /month
                </span>
              </div>
              <p className="text-gray-400">Perfect for casual meme creators</p>
            </div>

            <ul className="space-y-4 mb-8">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/">
              <button className="w-full py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors">
                Get Started Free
              </button>
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl p-8 border border-purple-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-400 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                MOST POPULAR
              </span>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <div className="text-4xl font-extrabold mb-2">
                $1
                <span className="text-lg font-normal text-gray-300">
                  /month
                </span>
              </div>
              <p className="text-gray-300">For serious meme creators</p>
            </div>

            <ul className="space-y-4 mb-8">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-400 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-white font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            {paymentSuccess && (
              <div className="mb-4 p-3 bg-green-600 text-white rounded-lg text-center">
                🎉 Welcome to Premium! You now have access to all premium
                features.
              </div>
            )}

            {paymentError && (
              <div className="mb-4 p-3 bg-red-600 text-white rounded-lg text-center">
                {paymentError}
              </div>
            )}

            {session ? (
              isPremium ? (
                <div className="w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-lg text-center">
                  ✅ You're already Premium!
                </div>
              ) : (
                <StripeCheckout
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )
            ) : (
              <Link href="/login">
                <button className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105">
                  Sign Up for Premium
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-300">
                Yes! You can cancel your Premium subscription at any time.
                You'll continue to have access to Premium features until the end
                of your billing period.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">
                What happens to my memes if I downgrade?
              </h3>
              <p className="text-gray-300">
                All your previously created memes will remain accessible.
                However, new memes will include the watermark and you'll lose
                access to Premium features.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">
                Do you offer refunds?
              </h3>
              <p className="text-gray-300">
                We offer a 7-day money-back guarantee. If you're not satisfied
                with Premium, contact us within 7 days for a full refund.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">
                Is my payment information secure?
              </h3>
              <p className="text-gray-300">
                Absolutely! We use Stripe for payment processing, which is
                trusted by millions of businesses worldwide. We never store your
                payment information on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-2xl p-12 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Create Amazing Memes?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of creators who are already making viral memes with
              MEME WAREHOUSE
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <button className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                  Start Creating Free
                </button>
              </Link>
              {session ? (
                isPremium ? (
                  <div className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg text-center">
                    ✅ You're Premium!
                  </div>
                ) : (
                  <div className="px-8 py-3">
                    <StripeCheckout
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </div>
                )
              ) : (
                <Link href="/login">
                  <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all">
                    Sign Up for Premium
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
