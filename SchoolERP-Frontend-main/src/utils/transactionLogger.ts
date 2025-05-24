export const logTransaction = (transactionId: string, dateTime: Date, mode: string, status: string) => {
  // Save the transaction details to your database or local storage
  console.log('Transaction Logged:', { transactionId, dateTime, mode, status });
}; 