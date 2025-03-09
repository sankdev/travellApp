import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService } from '../../services/invoiceService';
import { paymentService } from '../../services/paymentService';
import { paymentModeService } from '../../services/paymentModeService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillWave, faSpinner, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const InvoicePayment = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [paymentModes, setPaymentModes] = useState([]);
    const [selectedMode, setSelectedMode] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchInvoiceDetails();
        fetchPaymentModes();
    }, []);

    const fetchInvoiceDetails = async () => {
        try {
            const response = await invoiceService.getInvoiceDetails(invoiceId);
            console.log('response Invoices',response.data.data)
            setInvoice(response.data.data) ;
        } catch (err) {
            setError("Échec du chargement de la facture.");
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentModes = async () => {
        try {
            const response = await paymentModeService.getActivePaymentModes();
            setPaymentModes(response.data);
        } catch (err) {
            setError("Impossible de récupérer les modes de paiement.");
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!selectedMode || !amount || amount <= 0) {
            setError("Veuillez sélectionner un mode de paiement et entrer un montant valide.");
            return;
        }

        if (amount > invoice.balance) {
            setError(`Le montant saisi dépasse le solde restant (${invoice.balance} XOF).`);
            return;
        }

        try {
            const response = await paymentService.createPayment({
                invoiceId,
                paymentModeId: selectedMode,
                amount: parseFloat(amount),
                description
            });

            setSuccessMessage("Paiement effectué avec succès !");
            setInvoice(response.data.invoice);
            setAmount('');
            setDescription('');
            setSelectedMode('');

            // Redirige après quelques secondes
            setTimeout(() => navigate('/customer/invoices'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Échec du paiement.");
        }
    };

    // if (loading) {
    //     return (
    //         <div className="flex justify-center items-center h-screen">
    //             <FontAwesomeIcon icon={faSpinner} className="animate-spin text-gray-500 text-3xl" />
    //         </div>
    //     );
    // }

    if (!invoice) {
        return <div className="text-center text-red-500">Facture introuvable.</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Paiement de la facture {invoice.customer?.lastName} {invoice.customer?.firstName}</h1>
             
             
         
        
            {error && (
                <div className="flex items-center bg-red-100 text-red-700 p-3 rounded-md mb-4">
                    <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="flex items-center bg-green-100 text-green-700 p-3 rounded-md mb-4">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                    {successMessage}
                </div>
            )}

            <div className="mb-4 p-4 bg-gray-100 rounded-md">
                <p className="text-lg font-medium text-gray-700"> Reference Facture :{invoice.reference}</p>
                <p className="text-gray-600">Montant dû : <strong>{invoice.balance} XOF</strong></p>
                <p className={`inline-block px-2 py-1 text-sm font-semibold rounded-md ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {invoice.status === 'paid' ? 'Paid' : 'unpaid'}
                </p>
            </div>
            

            <form onSubmit={handlePayment}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">Mode de paiement</label>
                    <select
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                        value={selectedMode}
                        onChange={(e) => setSelectedMode(e.target.value)}
                    >
                        <option value="">Sélectionnez un mode</option>
                        {paymentModes.map((mode) => (
                            <option key={mode.id} value={mode.id}>{mode.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">Montant à payer</label>
                    <input
                        type="number"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="1"
                        max={invoice.balance}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-1">Description (facultatif)</label>
                    <input
                        type="text"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition flex items-center justify-center"
                >
                    <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" />
                    Payer maintenant
                </button>
            </form>
        </div>
    );
};

export default InvoicePayment;
