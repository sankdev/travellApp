import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { invoiceService } from '../../services/invoiceService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faPlane, faBuilding, faReceipt, faMoneyBill, faCalendar, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

const InvoiceDetails = () => {
    const { invoiceId } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchInvoiceDetails();
    }, []);

    const fetchInvoiceDetails = async () => {
        try {
            const response = await invoiceService.getInvoiceDetails(invoiceId);
            console.log('response Invoice',response.data.data)
            setInvoice(response.data.data);
        } catch (err) {
            setError("Échec du chargement de la facture.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p className="text-center text-gray-500">Chargement...</p>;
    }

    if (!invoice) {
        return <p className="text-center text-gray-500">Aucune facture trouvée.</p>;
    }

    const { reference, amount, balance, emissionAt, totalWithTax, tva, status, customer, agencyId, reservation, payments } = invoice;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    <FontAwesomeIcon icon={faReceipt} className="text-blue-600 mr-2" />
                    Facture 
                </h2>
                <h6 className="text-1xl font-bold text-gray-500">
                    <FontAwesomeIcon icon={faReceipt} className="text-blue-600 mr-2" />
                    Reference :{reference}
                </h6>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${status === "paid" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                    {status}
                </span>
            </div>

            {/* Détails client */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                    <FontAwesomeIcon icon={faUser} className="text-blue-500 mr-2" />
                    Client
                </h3>
                <p className="text-gray-600">{customer.firstName} {customer.lastName} ({customer.gender})</p>
            </div>

            {/* Détails de la réservation */}
            {reservation && (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">
                        <FontAwesomeIcon icon={faPlane} className="text-blue-500 mr-2" />
                        Réservation
                    </h3>
                    <p className="text-gray-600">
                        <strong>Départ :</strong> {reservation.startDestination?.city} → <strong>Arrivée :</strong> {reservation.endDestination?.city}
                    </p>
                    <p className="text-gray-600">
                        <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                        {new Date(reservation.startAt).toLocaleDateString()} - {new Date(reservation.endAt).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600"><strong>Type :</strong> {reservation.tripType}</p>
                </div>
            )}

            {/* Détails agence */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                    <FontAwesomeIcon icon={faBuilding} className="text-blue-500 mr-2" />
                    Agence
                </h3>
                <p className="text-gray-600"> {invoice.reservation?.agencyReservations?.name}</p>
            </div>

            {/* Paiements */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                    <FontAwesomeIcon icon={faMoneyBill} className="text-blue-500 mr-2" />
                    Paiements
                </h3>
                <ul className="list-disc pl-5 text-gray-600">
                    {payments.length > 0 ? (
                        payments.map((payment, index) => (
                            <li key={index}>
                                {new Date(payment.paymentDate).toLocaleDateString()} - <strong>{payment.amount} FCFA</strong>
                            </li>
                        ))
                    ) : (
                        <p>Aucun paiement enregistré.</p>
                    )}
                </ul>
            </div>

            {/* Résumé financier */}
            <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Résumé Financier</h3>
                <p className="text-gray-600"><strong>Montant Total :</strong> {amount} FCFA</p>
                // <p className="text-gray-600"><strong>TVA :</strong> {tva}%</p>
                // <p className="text-gray-600"><strong>Total avec Taxes :</strong> {totalWithTax} FCFA</p>
                <p className="text-gray-600"><strong>Solde restant :</strong> {balance} FCFA</p>
            </div>
        </div>
    );
};

export default InvoiceDetails;
