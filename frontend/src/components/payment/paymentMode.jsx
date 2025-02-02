import React, { useState } from 'react';
import paymentModeService from '../../services/paymentModeService';

const PaymentModeComponent = () => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentModeService.createPaymentMode(formData);
      alert('Payment mode created successfully');
    } catch (error) {
      console.error('Error creating payment mode:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Create Payment Mode</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Create Payment Mode
        </button>
      </form>
    </div>
  );
};

export default PaymentModeComponent;