import React, { useState, useEffect } from 'react';
import invoiceService from '../../services/invoiceService';
import reservationService from '../../services/reservationService';
import customerService from '../../services/customerService';
import passengerService from '../../services/passengerService';

const InvoiceComponent = () => {
  const [formData, setFormData] = useState({
    reservationId: '',
    customerId: '',
    passengerId: '',
    reference: '',
    emissionAt: '',
    quantity: 1,
    amount: '',
    tva: '',
    totalWithTax: '',
    balance: 0,
    status: 'unpaid',
  });
  const [reservations, setReservations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [passengers, setPassengers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const reservationsResponse = await reservationService.getReservations();
      setReservations(reservationsResponse.data);

      const customersResponse = await customerService.getCustomers();
      setCustomers(customersResponse.data);

      const passengersResponse = await passengerService.getPassengers();
      setPassengers(passengersResponse.data);
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
      await invoiceService.createInvoice(formData);
      alert('Invoice created successfully');
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Create Invoice</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Reservation</label>
          <select
            name="reservationId"
            value={formData.reservationId}
            onChange={handleInputChange}
            required
            className="inputClassName"
          >
            <option value="">Select a reservation</option>
            {reservations.map((reservation) => (
              <option key={reservation.id} value={reservation.id}>
                {reservation.reference}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Customer</label>
          <select
            name="customerId"
            value={formData.customerId}
            onChange={handleInputChange}
            className="inputClassName"
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Passenger</label>
          <select
            name="passengerId"
            value={formData.passengerId}
            onChange={handleInputChange}
            className="inputClassName"
          >
            <option value="">Select a passenger</option>
            {passengers.map((passenger) => (
              <option key={passenger.id} value={passenger.id}>
                {passenger.name}
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
          <label className="block text-sm font-medium text-gray-700">Emission Date</label>
          <input
            type="date"
            name="emissionAt"
            value={formData.emissionAt}
            onChange={handleInputChange}
            required
            className="inputClassName"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
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
          <label className="block text-sm font-medium text-gray-700">TVA</label>
          <input
            type="number"
            name="tva"
            value={formData.tva}
            onChange={handleInputChange}
            required
            className="inputClassName"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Total with Tax</label>
          <input
            type="number"
            name="totalWithTax"
            value={formData.totalWithTax}
            onChange={handleInputChange}
            required
            className="inputClassName"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Balance</label>
          <input
            type="number"
            name="balance"
            value={formData.balance}
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
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Create Invoice
        </button>
      </form>
    </div>
  );
};

export default InvoiceComponent;