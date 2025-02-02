import React, { useState, useEffect } from 'react';
import paymentService from '../../services/paymentService';
import paymentModeService from '../../services/paymentModeService';
import invoiceService from '../../services/invoiceService';

const PaymentComponent = () => {
  const [formData, setFormData] = useState({
    modePaymentId: '',
    reference: '',
    paymentDate: '',
    amount: '',
    description: '',
    status: 'pending',
  });
  const [paymentModes, setPaymentModes] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const paymentModesResponse = await paymentModeService.getPaymentModes();
      setPaymentModes(paymentModesResponse.data);

      const invoicesResponse = await invoiceService.getInvoices();
      setInvoices(invoicesResponse.data);
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentService.createPayment(formData);
      alert('Payment created successfully');
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Create Payment</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
          <select
            name="modePaymentId"
            value={formData.modePaymentId}
            onChange={handleInputChange}
            required
            className="inputClassName"
          >
            <option value="">Select a payment mode</option>
            {paymentModes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Reference</label>
          <input
            type="text"
            name="reference"
            value={formData.reference}
            onChange={handleInputChange}
            required
            className="inputClassName"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Payment Date</label>
          <input
            type="date"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleInputChange}
            required
            className="inputClassName"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            required
            className="inputClassName"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="inputClassName"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            required
            className="inputClassName"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Create Payment
        </button>
      </form>
    </div>
  );
};

export default PaymentComponent;