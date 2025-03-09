import React, { useEffect, useState, useMemo } from 'react';
import { invoiceService } from '../../services/invoiceService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload, faMoneyBillWave, faFilter, faEye, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const GetInvoicesAgency = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        startDate: '',
        endDate: '',
        reference: '' // Ajout du champ de recherche
    });
    const [currentPage, setCurrentPage] = useState(1);
    const invoicesPerPage = 10;

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const response = await invoiceService.getInvoices();
            const invoiceData = Array.isArray(response.data.data) ? response.data.data : [];
            setInvoices(invoiceData);
        } catch (err) {
            setError(err.message || 'Échec du chargement des factures');
        } finally {
            setLoading(false);
        }
    };

     const handleDownloadInvoice = async (invoiceId, reference) => {
             try {
                 const response = await invoiceService.downloadInvoice(invoiceId);
                 console.log('responseDownload',response)
                 // Vérifier si la réponse contient des données
                 if (!response.data) {
                     throw new Error("Le fichier est vide ou la requête a échoué.");
                 }
         
                 // Créer un Blob pour stocker le PDF
                 const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                 const link = document.createElement('a');
                 link.href = url;
                 link.setAttribute('download', `invoice_${reference}.pdf`); // Nom du fichier
                 document.body.appendChild(link);
                 link.click();
         
                 // Nettoyer l'URL après le téléchargement
                 window.URL.revokeObjectURL(url);
                 document.body.removeChild(link);
             } catch (error) {
                 console.error("Erreur lors du téléchargement :", error);
                 alert("Échec du téléchargement de la facture. Veuillez réessayer.");
             }
         };

    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            if (filters.status !== 'all' && invoice.status !== filters.status) return false;
            if (filters.startDate && new Date(invoice.createdAt) < new Date(filters.startDate)) return false;
            if (filters.endDate && new Date(invoice.createdAt) > new Date(filters.endDate)) return false;
            if (filters.reference && !invoice.reference.toLowerCase().includes(filters.reference.toLowerCase())) return false;
            return true;
        });
    }, [invoices, filters]);

    const indexOfLastInvoice = currentPage * invoicesPerPage;
    const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
    const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'unpaid': return 'bg-red-100 text-red-800';
            case 'partial': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">📜 Mes Factures</h1>
            
            {error && <div className="text-red-500 text-center mb-4">{error}</div>}
            
            <div className="bg-white shadow-md rounded-lg p-6 mb-8 max-w-7xl mx-auto">
                {/* 🔍 Filtres */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <FontAwesomeIcon icon={faFilter} className="mr-2" />
                            Statut
                        </label>
                        <select
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="all">Tous</option>
                            <option value="paid">Payé</option>
                            <option value="unpaid">Non payé</option>
                            <option value="partial">Partiel</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date début</label>
                        <input
                            type="date"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date fin</label>
                        <input
                            type="date"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </div>
                    {/* 🔍 Recherche par référence */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <FontAwesomeIcon icon={faSearch} className="mr-2" />
                            Référence
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Rechercher par référence"
                            value={filters.reference}
                            onChange={(e) => setFilters({ ...filters, reference: e.target.value })}
                        />
                    </div>
                </div>

                {/* 📊 Tableau des factures */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facture #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date d'émission</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-6 text-gray-500">Chargement des factures...</td></tr>
                            ) : (
                                currentInvoices.map((invoice) => (
                                    <tr key={invoice.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{invoice.reference}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{invoice.reservation?.startDestination?.city || 'N/A'} → {invoice.reservation?.endDestination?.city || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{invoice.totalWithTax} XOF</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{invoice.balance} XOF</td>
                                        <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>{invoice.status}</span></td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(invoice.emissionAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right text-sm font-medium flex space-x-4">
                                                                                    <button 
                                                                                                                            onClick={() => handleDownloadInvoice(invoice.id, invoice.reference)}
                                                                                                                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                                                                                                        >
                                                                                                                            <FontAwesomeIcon icon={faFileDownload} className="mr-2" />
                                                                                                                            Download
                                                                                                                        </button>
                                                                                   <Link to={`/agency/invoices/${invoice.id}/pay`} className="text-green-600 hover:text-green-900 flex items-center">
                                                                                                                                   <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" />
                                                                                                                                   Payer
                                                                                                                               </Link>
                                                                                    <Link
                                                                                        to={`/agency/invoicesDetailAgency/${invoice.id}`} 
                                                                                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center"
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faEye} className="mr-2" />
                                                                                        View Details
                                                                                    </Link>
                                                                                </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GetInvoicesAgency;
