import React, { useState, useEffect } from 'react';
import { createPayment } from '../services/api';
import { CreditCard, AlertCircle } from 'lucide-react';

export const PaymentForm = () => {
  const [invoiceId, setInvoiceId] = useState();
  const [balance, setBalance] = useState();
  const [amount, setAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState();
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    // Simulation de récupération des données (remplace ceci par un appel API)
    const fetchInvoiceData = async () => {
      setInvoiceId(101);
      setBalance(250.75);
    };

    fetchInvoiceData();
  }, []);

  const handleSubmit = async () => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!invoiceId || balance === null) {
        throw new Error('Invoice data is not loaded.');
      }

      const amountNum = parseFloat(amount);
      if (amountNum > balance) {
        throw new Error(`Payment cannot exceed balance of ${balance.toFixed(2)} €`);
      }

      await createPayment({
        invoiceId,
        paymentModeId: paymentMode,
        amount: amountNum,
        reference,
      });

      setAmount('');
      setReference('');
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (invoiceId === null || balance === null) {
    return <p className="text-center text-gray-500">Loading payment details...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Amount (€)</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CreditCard className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="0.00"
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">€</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
        <select
          value={paymentMode}
          onChange={(e) => setPaymentMode(Number(e.target.value))}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value={1}>Credit Card</option>
          <option value={2}>Bank Transfer</option>
          <option value={3}>Cash</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Reference (Optional)</label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Transaction reference"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {paymentSuccess && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">Payment successful!</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !amount}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          loading || !amount
            ? 'bg-indigo-300 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        }`}
      >
        {loading ? 'Processing...' : 'Submit Payment'}
      </button>
    </form>
  );
};
