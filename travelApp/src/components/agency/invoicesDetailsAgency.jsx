import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoiceService } from '../../services/invoiceService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faUser, 
    faPlane, 
    faBuilding, 
    faReceipt, 
    faMoneyBill, 
    faCalendar, 
    faCheckCircle,
    faArrowLeft,
    faDownload,
    faPrint,
    faEnvelope,
    faSpinner,
    faExclamationTriangle,
    faFileInvoice,
    faCreditCard,
    faHistory,
    faIdCard,
    faPhone,
    faEnvelope as faEnvelopeSolid,
    faMapMarkerAlt,
    faGlobe
} from "@fortawesome/free-solid-svg-icons";

const InvoiceDetailsAgency = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        fetchInvoiceDetails();
    }, [invoiceId]);

    const fetchInvoiceDetails = async () => {
        try {
            setLoading(true);
            const response = await invoiceService.getInvoiceDetails(invoiceId);
            console.log('📄 Détails facture (Agence):', response.data.data);
            setInvoice(response.data.data);
        } catch (err) {
            setError("Échec du chargement de la facture.");
            console.error('❌ Erreur chargement facture:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/agency/invoices');
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Logique de téléchargement PDF
        alert('Téléchargement de la facture au format PDF');
    };

    const handleSendEmail = () => {
        // Logique d'envoi par email
        alert('Envoi de la facture par email au client');
    };

    const handleMarkAsPaid = async () => {
        if (window.confirm('Marquer cette facture comme payée ?')) {
            try {
                await invoiceService.markAsPaid(invoiceId);
                fetchInvoiceDetails();
            } catch (err) {
                setError("Erreur lors de la mise à jour du statut");
            }
        }
    };

    const handleSendReminder = () => {
        alert('Rappel de paiement envoyé au client');
    };

    // Formatage
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-orange-500 mb-4" />
                <p className="text-gray-600">Chargement de la facture...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-red-500 mb-4" />
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Retour aux factures
                    </button>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <p className="text-yellow-700 mb-4">Aucune facture trouvée.</p>
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Retour aux factures
                    </button>
                </div>
            </div>
        );
    }

    const { 
        reference, 
        amount, 
        balance, 
        emissionAt, 
        totalWithTax, 
        tva, 
        status, 
        customer, 
        reservation, 
        payments = [],
        agency
    } = invoice;

    const isPaid = status?.toLowerCase() === 'paid';
    const isPending = status?.toLowerCase() === 'pending';
    const isOverdue = status?.toLowerCase() === 'overdue';
    const isPartial = balance > 0 && balance < amount;

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
            {/* ✅ Bouton retour */}
            <div className="mb-6">
                <button
                    onClick={handleBack}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors group"
                >
                    <FontAwesomeIcon 
                        icon={faArrowLeft} 
                        className="mr-2 group-hover:-translate-x-1 transition-transform" 
                    />
                    <span>Retour à la liste des factures</span>
                </button>
            </div>

            {/* En-tête avec actions */}
            <div className="bg-gradient-to-r from-orange-700 to-purple-700 rounded-t-xl p-4 sm:p-6 text-white">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-3 rounded-lg">
                            <FontAwesomeIcon icon={faFileInvoice} className="text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold">Facture {reference}</h1>
                            <p className="text-sm opacity-90">Émise le {formatDateTime(emissionAt)}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handlePrint}
                            className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm flex items-center gap-2"
                            title="Imprimer"
                        >
                            <FontAwesomeIcon icon={faPrint} />
                            <span className="hidden sm:inline">Imprimer</span>
                        </button>
                        <button
                            onClick={handleDownload}
                            className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm flex items-center gap-2"
                            title="Télécharger PDF"
                        >
                            <FontAwesomeIcon icon={faDownload} />
                            <span className="hidden sm:inline">PDF</span>
                        </button>
                        <button
                            onClick={handleSendEmail}
                            className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm flex items-center gap-2"
                            title="Envoyer par email"
                        >
                            <FontAwesomeIcon icon={faEnvelope} />
                            <span className="hidden sm:inline">Email</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="bg-white rounded-b-xl shadow-lg p-4 sm:p-6">
                {/* Statut et montant */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            isPaid ? 'bg-green-100 text-green-700' : 
                            isPending ? 'bg-yellow-100 text-yellow-700' :
                            isOverdue ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                            {isPaid ? 'Payée' : 
                             isPending ? 'En attente' : 
                             isOverdue ? 'En retard' : 
                             isPartial ? 'Paiement partiel' : status}
                        </span>
                        
                        {!isPaid && (
                            <button
                                onClick={handleSendReminder}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                            >
                                <FontAwesomeIcon icon={faEnvelopeSolid} className="mr-1" />
                                Envoyer un rappel
                            </button>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Montant total</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {formatCurrency(amount)}
                        </p>
                    </div>
                </div>

                {/* Tabs pour mobile */}
                <div className="flex border-b mb-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                            activeTab === 'details' 
                                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Détails facture
                    </button>
                    <button
                        onClick={() => setActiveTab('client')}
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                            activeTab === 'client' 
                                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Client
                    </button>
                    <button
                        onClick={() => setActiveTab('reservation')}
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                            activeTab === 'reservation' 
                                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Réservation
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                            activeTab === 'payments' 
                                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Paiements ({payments.length})
                    </button>
                </div>

                {/* Contenu des tabs */}
                <div className="space-y-6">
                    {/* Tab Détails facture */}
                    {activeTab === 'details' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                    <FontAwesomeIcon icon={faReceipt} className="text-indigo-500 mr-2" />
                                    Informations facture
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Référence:</span>
                                        <span className="font-medium text-gray-900">{reference}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Date d'émission:</span>
                                        <span className="font-medium text-gray-900">{formatDate(emissionAt)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Statut:</span>
                                        <span className={`font-medium ${
                                            isPaid ? 'text-green-600' : 
                                            isPending ? 'text-yellow-600' : 
                                            isOverdue ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                            {isPaid ? 'Payée' : 
                                             isPending ? 'En attente' : 
                                             isOverdue ? 'En retard' : 
                                             isPartial ? 'Paiement partiel' : status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                    <FontAwesomeIcon icon={faBuilding} className="text-indigo-500 mr-2" />
                                    Agence
                                </h3>
                                <p className="font-medium text-gray-900">
                                    {agency?.name || reservation?.agencyReservations?.name || 'N/A'}
                                </p>
                                {agency?.email && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Email: {agency.email}
                                    </p>
                                )}
                                {agency?.phone1 && (
                                    <p className="text-sm text-gray-600">
                                        Tél: {agency.phone1}
                                    </p>
                                )}
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Détails financiers</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Montant HT</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {formatCurrency(amount)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">TVA ({tva || 0}%)</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {formatCurrency((totalWithTax || amount) - amount)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Montant TTC</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {formatCurrency(totalWithTax || amount)}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700">Solde restant</span>
                                        <span className={`text-xl font-bold ${balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                            {formatCurrency(balance)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Client */}
                    {activeTab === 'client' && customer && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                                <FontAwesomeIcon icon={faUser} className="text-indigo-500 mr-2" />
                                Informations client
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <FontAwesomeIcon icon={faIdCard} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Nom complet</p>
                                            <p className="font-medium text-gray-900">
                                                {customer.firstName} {customer.lastName}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <FontAwesomeIcon icon={faEnvelopeSolid} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="font-medium text-gray-900">{customer.email || 'Non renseigné'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <FontAwesomeIcon icon={faPhone} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Téléphone</p>
                                            <p className="font-medium text-gray-900">{customer.phone || 'Non renseigné'}</p>
                                        </div>
                                    </div>

                                    {customer.address && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Adresse</p>
                                                <p className="font-medium text-gray-900">{customer.address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Réservation */}
                    {activeTab === 'reservation' && reservation && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                                    <FontAwesomeIcon icon={faPlane} className="text-indigo-500 mr-2" />
                                    Détails de la réservation
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Départ</p>
                                        <p className="font-medium text-gray-900">
                                            {reservation.startDestination?.city || 'N/A'}
                                            {reservation.startDestination?.country && `, ${reservation.startDestination.country}`}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Arrivée</p>
                                        <p className="font-medium text-gray-900">
                                            {reservation.endDestination?.city || 'N/A'}
                                            {reservation.endDestination?.country && `, ${reservation.endDestination.country}`}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Date de départ</p>
                                        <p className="font-medium text-gray-900">
                                            <FontAwesomeIcon icon={faCalendar} className="mr-2 text-gray-400" />
                                            {formatDate(reservation.startAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Date de retour</p>
                                        <p className="font-medium text-gray-900">
                                            <FontAwesomeIcon icon={faCalendar} className="mr-2 text-gray-400" />
                                            {formatDate(reservation.endAt)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Type de voyage</p>
                                        <p className="font-medium text-gray-900">
                                            {reservation.tripType === 'round-trip' ? 'Aller-retour' : 'Aller simple'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Passagers</p>
                                        <p className="font-medium text-gray-900">
                                            {reservation.passengers?.length || 0} personne(s)
                                        </p>
                                    </div>
                                </div>

                                {reservation.reference && (
                                    <div className="mt-4 pt-4 border-t">
                                        <p className="text-sm">
                                            <span className="text-gray-600">Réf. réservation:</span>
                                            <span className="ml-2 font-medium text-gray-900">{reservation.reference}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab Paiements */}
                    {activeTab === 'payments' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                <FontAwesomeIcon icon={faHistory} className="text-indigo-500 mr-2" />
                                Historique des paiements
                            </h3>
                            
                            {payments.length > 0 ? (
                                <div className="space-y-3">
                                    {payments.map((payment, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:shadow-md transition-shadow">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {formatDateTime(payment.paymentDate)}
                                                </p>
                                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                                    <span>Mode: {payment.paymentMode?.name || 'Non spécifié'}</span>
                                                    {payment.reference && (
                                                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                                                            Réf: {payment.reference}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-lg font-bold text-green-600">
                                                    {formatCurrency(payment.amount)}
                                                </p>
                                                {payment.status && (
                                                    <p className="text-xs text-gray-400">
                                                        Statut: {payment.status}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                    <FontAwesomeIcon icon={faMoneyBill} className="text-3xl text-gray-400 mb-2" />
                                    <p className="text-gray-500">Aucun paiement enregistré</p>
                                </div>
                            )}

                            {/* Actions pour les paiements */}
                            {!isPaid && (
                                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                                    <button
                                        onClick={handleMarkAsPaid}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                                        Marquer comme payée
                                    </button>
                                    <button
                                        onClick={handleSendReminder}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faEnvelopeSolid} className="mr-2" />
                                        Envoyer un rappel
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pied de page */}
                <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
                    <p>Facture émise le {formatDateTime(emissionAt)}</p>
                    <p className="mt-1">Pour toute question, contactez le service comptabilité</p>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailsAgency;
