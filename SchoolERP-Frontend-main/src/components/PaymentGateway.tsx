// import React, { useEffect, useState } from 'react';
// import { loadStripe, Stripe } from '@stripe/stripe-js';
// import Razorpay from 'razorpay';

// // Use environment variables for sensitive keys
// const STRIPE_PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY || '';
// const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY || '';

// const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

// interface PaymentGatewayProps {
//   amount: number;
//   currency?: string;
//   onSuccess?: (response: any) => void;
//   onError?: (error: any) => void;
// }

// const PaymentGateway = (props) => {
//   const { amount, currency = 'USD', onSuccess, onError } = props;
//   const [loading, setLoading] = useState<boolean>(false);

//   useEffect(() => {
//     if (window.paypal) {
//       window.paypal.Buttons({
//         createOrder: (data: any, actions: any) => {
//           return actions.order.create({
//             purchase_units: [{
//               amount: {
//                 value: (amount / 100).toFixed(2) // Convert cents to dollars
//               }
//             }]
//           });
//         },
//         onApprove: async (data: any, actions: any) => {
//           try {
//             const details = await actions.order.capture();
//             onSuccess?.(details);
//           } catch (error) {
//             onError?.(error);
//           }
//         }
//       }).render('#paypal-button-container');
//     }
//   }, [amount, onSuccess, onError]);

//   const handleStripePayment = async () => {
//     try {
//       setLoading(true);
//       const stripe = await stripePromise;
//       if (!stripe) throw new Error('Stripe failed to initialize');

//       // Fetch client secret from your server
//       const response = await fetch('/api/create-payment-intent', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ amount, currency }),
//       });
      
//       const { clientSecret } = await response.json();

//       const result = await stripe.confirmCardPayment(clientSecret, {
//         payment_method: {
//           card: elements.getElement('card'),
//           billing_details: {
//             // Add billing details if needed
//           },
//         },
//       });

//       if (result.error) {
//         throw new Error(result.error.message);
//       }

//       if (result.paymentIntent?.status === 'succeeded') {
//         onSuccess?.(result.paymentIntent);
//       }
//     } catch (error) {
//       onError?.(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRazorpayPayment = () => {
//     try {
//       const options = {
//         key: RAZORPAY_KEY,
//         amount: amount,
//         currency: currency,
//         name: 'Your Company Name',
//         description: 'Payment for services',
//         handler: function (response: any) {
//           onSuccess?.(response);
//         },
//         prefill: {
//           name: '',
//           email: '',
//           contact: '',
//         },
//         theme: {
//           color: '#F37254',
//         },
//       };

//       const rzp = new Razorpay(options);
//       rzp.on('payment.failed', function (response: any) {
//         onError?.(response.error);
//       });
//       rzp.open();
//     } catch (error) {
//       onError?.(error);
//     }
//   };

//   return (
//     <div className="payment-gateway">
//       <button 
//         onClick={handleStripePayment}
//         disabled={loading}
//       >
//         {loading ? 'Processing...' : 'Pay with Stripe'}
//       </button>
//       <button 
//         onClick={handleRazorpayPayment}
//         disabled={loading}
//       >
//         Pay with Razorpay
//       </button>
//       <div id="paypal-button-container"></div>
//     </div>
//   );
// };

// export default PaymentGateway;