// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { CreditCard, Banknote, Building } from 'lucide-react'; // replaced Bank with Building
// import { PaymentGateway } from '@/components/PaymentGateway';

// const PaymentPortal = () => {
//   const [method, setMethod] = useState('card'); // card, upi, netbanking
//   const [transactionStatus, setTransactionStatus] = useState('');
//   const [amount, setAmount] = useState(1000); // default amount (in cents/paise context)

//   const handlePaymentSuccess = (response) => {
//     setTransactionStatus(`Payment succeeded. Details: ${JSON.stringify(response)}`);
//   };

//   const handlePaymentError = (error) => {
//     setTransactionStatus(`Payment failed. Error: ${error.message || error}`);
//   };

//   const renderPaymentForm = () => {
//     switch (method) {
//       case 'card':
//         return (
//           <div className="mt-4">
//             <p className="mb-2">Pay using Credit/Debit Card</p>
//             <PaymentGateway
//               amount={amount}
//               onSuccess={handlePaymentSuccess}
//               onError={handlePaymentError}
//             />
//           </div>
//         );
//       case 'upi':
//         return (
//           <div className="mt-4">
//             <p className="mb-2">Enter your UPI ID</p>
//             <input
//               type="text"
//               placeholder="example@upi"
//               className="border p-2 w-full rounded mb-4"
//             />
//             <Button onClick={() => handlePaymentSuccess({ method: 'upi', amount })}>
//               Pay via UPI
//             </Button>
//           </div>
//         );
//       case 'netbanking':
//         return (
//           <div className="mt-4">
//             <p className="mb-2">Select your bank</p>
//             <select className="border p-2 w-full rounded mb-4">
//               <option>Bank A</option>
//               <option>Bank B</option>
//               <option>Bank C</option>
//             </select>
//             <Button onClick={() => handlePaymentSuccess({ method: 'netbanking', amount })}>
//               Pay via Net Banking
//             </Button>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="p-6 bg-white shadow rounded-lg">
//       <h1 className="text-2xl font-bold mb-4">Payment Portal</h1>
//       <div className="mb-4">
//         <label className="mr-4">
//           <input
//             type="radio"
//             name="paymentMethod"
//             value="card"
//             checked={method === 'card'}
//             onChange={() => setMethod('card')}
//           />{' '}
//           <CreditCard className="inline-block mr-1 h-4 w-4" />
//           Card
//         </label>
//         <label className="mr-4">
//           <input
//             type="radio"
//             name="paymentMethod"
//             value="upi"
//             checked={method === 'upi'}
//             onChange={() => setMethod('upi')}
//           />{' '}
//           <Banknote className="inline-block mr-1 h-4 w-4" />
//           UPI
//         </label>
//         <label>
//           <input
//             type="radio"
//             name="paymentMethod"
//             value="netbanking"
//             checked={method === 'netbanking'}
//             onChange={() => setMethod('netbanking')}
//           />{' '}
//           <Building className="inline-block mr-1 h-4 w-4" />
//           Net Banking
//         </label>
//       </div>
//       <div>
//         <label className="block mb-2">
//           Amount (in cents/paise):
//           <input
//             type="number"
//             value={amount}
//             onChange={(e) => setAmount(Number(e.target.value))}
//             className="border p-2 rounded ml-2 w-32"
//           />
//         </label>
//       </div>
//       {renderPaymentForm()}
//       {transactionStatus && (
//         <div className="mt-6 p-4 border rounded bg-gray-50">
//           <strong>Transaction Status:</strong>
//           <p>{transactionStatus}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PaymentPortal;