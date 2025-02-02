import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileInvoiceDollar,
  faCalendarAlt,
  faUser,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons';

const InvoiceDetails = () => {
  const [invoice, setInvoice] = useState();

  useEffect(() => {
    // Simule une récupération de facture (remplace ça par ton API call si nécessaire)
    const fetchInvoice = async () => {
      const fakeInvoice = {
        reference: 'INV-2025001',
        amount: 250.75,
        emissionAt: new Date().toISOString(),
        customerId: 'CUST-12345',
        agencyId: 'AGENCY-67890',
        status: 'paid',
        balance: 0,
      };
      setInvoice(fakeInvoice);
    };

    fetchInvoice();
  }, []);

  if (!invoice) {
    return <p className="text-center text-gray-500">Loading invoice...</p>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium text-gray-900">Invoice Details</h3>
        <p className="mt-1 text-sm text-gray-500">Invoice reference: {invoice.reference}</p>
      </div>

      <div className="border-t border-gray-200">
        <dl>
          {/* Montant */}
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <FontAwesomeIcon icon={faFileInvoiceDollar} className="h-5 w-5 mr-2" />
              Amount
            </dt>
            <dd className="text-sm text-gray-900 sm:col-span-2">{invoice.amount.toFixed(2)} €</dd>
          </div>

          {/* Date d'émission */}
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="h-5 w-5 mr-2" />
              Emission Date
            </dt>
            <dd className="text-sm text-gray-900 sm:col-span-2">
              {new Date(invoice.emissionAt).toLocaleDateString()}
            </dd>
          </div>

          {/* ID du client */}
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <FontAwesomeIcon icon={faUser} className="h-5 w-5 mr-2" />
              Customer ID
            </dt>
            <dd className="text-sm text-gray-900 sm:col-span-2">{invoice.customerId}</dd>
          </div>

          {/* ID de l'agence */}
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <FontAwesomeIcon icon={faBuilding} className="h-5 w-5 mr-2" />
              Agency ID
            </dt>
            <dd className="text-sm text-gray-900 sm:col-span-2">{invoice.agencyId}</dd>
          </div>

          {/* Statut de la facture */}
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="text-sm sm:col-span-2">
              <span
                className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                  invoice.status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {invoice.status}
              </span>
            </dd>
          </div>

          {/* Solde restant à payer */}
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Balance Due</dt>
            <dd className="text-sm text-gray-900 sm:col-span-2">{invoice.balance.toFixed(2)} €</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default InvoiceDetails;
