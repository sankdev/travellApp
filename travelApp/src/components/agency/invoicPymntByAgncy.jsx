import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService } from '../../services/invoiceService';
import { agencyService } from '../../services/agencyService';
import { paymentService } from '../../services/paymentService';
import { paymentModeService } from '../../services/paymentModeService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMoneyBillWave,
    faSpinner,
    faCheckCircle,
    faTimesCircle,
    faArrowLeft,
    faCreditCard,
    faUniversity,
    faMobile,
    faWallet,
    faReceipt,
    faPrint,
    faDownload,
    faExclamationTriangle,
    faInfoCircle,
    faBuilding,
    faPhone,
    faUser,
    faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import { faCcVisa, faCcMastercard, faPaypal } from '@fortawesome/free-brands-svg-icons';

const InvoicePayment = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    
    // États principaux
    const [invoice, setInvoice] = useState(null);
    const [agency, setAgency] = useState(null);
    const [paymentModes, setPaymentModes] = useState([]);
    const [selectedMode, setSelectedMode] = useState('');
    const [selectedModeDetails, setSelectedModeDetails] = useState(null);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [paymentReference, setPaymentReference] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    
    // États de l'interface
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [paymentHistory, setPaymentHistory] = useState([]);

    // Chargement des données
    useEffect(() => {
        loadData();
    }, [invoiceId]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Charger les détails de la facture
            const invoiceResponse = await invoiceService.getInvoiceDetails(invoiceId);
            const invoiceData = invoiceResponse.data.data;
            setInvoice(invoiceData);
            
            // 2. Récupérer l'agence depuis la facture
            const agencyId = invoiceData.agencyId;
            
            if (agencyId) {
                // 3. Charger les informations de l'agence
                try {
                    const agencyResponse = await agencyService.getAgencyById(agencyId);
                    setAgency(agencyResponse.data);
                } catch (err) {
                    console.error("Erreur chargement agence:", err);
                }
                
                // 4. Charger les modes de paiement de l'agence
                await fetchPaymentModesByAgency(agencyId);
            }
            
            // 5. Charger l'historique des paiements
            await fetchPaymentHistory();
            
        } catch (err) {
            setError("Échec du chargement des informations.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour récupérer les modes par agence
    const fetchPaymentModesByAgency = async (agencyId) => {
        try {
            console.log(`🔍 Récupération des modes de paiement pour l'agence: ${agencyId}`);
            const response = await paymentModeService.getPaymentModesByAgency(agencyId);
            
            // Adapter à la structure de votre modèle
            if (response.data && Array.isArray(response.data)) {
                setPaymentModes(response.data);
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                setPaymentModes(response.data.data);
            } else {
                setPaymentModes([]);
            }
        } catch (err) {
            console.error("Erreur chargement modes par agence:", err);
            setPaymentModes([]);
        }
    };

    const fetchPaymentHistory = async () => {
        try {
            const response = await paymentService.getPaymentByInvoice(invoiceId);
            setPaymentHistory(response.data || []);
        } catch (err) {
            console.error("Erreur chargement historique:", err);
        }
    };

    // Mise à jour des détails du mode sélectionné
    useEffect(() => {
        if (selectedMode) {
            const mode = paymentModes.find(m => m.id === parseInt(selectedMode));
            setSelectedModeDetails(mode || null);
        } else {
            setSelectedModeDetails(null);
        }
    }, [selectedMode, paymentModes]);

    const handlePayment = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        // Validations
        if (!selectedMode) {
            setError("Veuillez sélectionner un mode de paiement.");
            return;
        }

        if (!amount || amount <= 0) {
            setError("Veuillez entrer un montant valide.");
            return;
        }

        if (amount > invoice.balance) {
            setError(`Le montant saisi (${formatAmount(amount)}) dépasse le solde restant (${formatAmount(invoice.balance)}).`);
            return;
        }

        setShowConfirmation(true);
    };

    const confirmPayment = async () => {
        setSubmitting(true);
        setError('');
        
        try {
            const paymentData = {
                invoiceId: parseInt(invoiceId),
                modePaymentId: parseInt(selectedMode), // Note: c'est modePaymentId dans votre modèle
                amount: parseFloat(amount),
                description: description || `Paiement facture ${invoice.reference}`,
                reference: paymentReference || undefined,
                paymentDate: paymentDate,
                status: 'completed',
                createdBy: localStorage.getItem('userId') || null
            };

            const response = await paymentService.createPayment(paymentData);
              console.log('responsePayment',response)
           console.log('responsePayment',paymentData)
            setSuccessMessage("Paiement enregistré avec succès !");
            
            // Recharger toutes les données
            await loadData();
            
            // Réinitialisation du formulaire
            setAmount('');
            setDescription('');
            setPaymentReference('');
            setSelectedMode('');
            setShowConfirmation(false);
            
            // Message de succès temporaire
            setTimeout(() => setSuccessMessage(''), 5000);
            
        } catch (err) {
            setError(err.response?.data?.message || "Échec de l'enregistrement du paiement.");
            setShowConfirmation(false);
        } finally {
            setSubmitting(false);
        }
    };

    const formatAmount = (value) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            paid: { color: 'green', icon: faCheckCircle, text: 'Payée' },
            partial: { color: 'yellow', icon: faInfoCircle, text: 'Partielle' },
            unpaid: { color: 'red', icon: faExclamationTriangle, text: 'Impayée' },
            overdue: { color: 'orange', icon: faExclamationTriangle, text: 'En retard' }
        };
        
        const config = statusConfig[status] || statusConfig.unpaid;
        
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-100 text-${config.color}-800`}>
                <FontAwesomeIcon icon={config.icon} className="mr-2" />
                {config.text}
            </span>
        );
    };

    const getPaymentModeIcon = (type, name) => {
        // Icônes par type
        const typeIcons = {
            'mobile_money': faMobile,
            'bank': faUniversity,
            'cash': faWallet,
            'cheque': faReceipt,
            'card': faCreditCard
        };
        
        // Marques spécifiques
        const brandIcons = {
            'Visa': faCcVisa,
            'Mastercard': faCcMastercard,
            'PayPal': faPaypal
        };
        
        // Chercher d'abord par nom de marque
        if (name && brandIcons[name]) {
            return brandIcons[name];
        }
        
        // Sinon retourner par type
        return typeIcons[type] || faMoneyBillWave;
    };

    const getPaymentModeDisplayName = (mode) => {
        if (mode.organization) {
            return `${mode.organization} - ${mode.accountNumber || ''}`;
        }
        return mode.name || mode.type || 'Mode de paiement';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-indigo-600 mb-4" />
                    <p className="text-gray-600">Chargement des informations de paiement...</p>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Facture introuvable</h2>
                    <p className="text-gray-600 mb-4">La facture demandée n'existe pas ou a été supprimée.</p>
                    <button
                        onClick={() => navigate('/agency/invoices')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Retour aux factures
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* En-tête avec bouton de retour */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/agency/invoices')}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                            <FontAwesomeIcon icon={faArrowLeft} className="text-indigo-600" />
                        </div>
                        <span className="ml-3 font-medium">Retour aux factures</span>
                    </button>
                    
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                        >
                            <FontAwesomeIcon icon={faPrint} className="mr-2" />
                            Imprimer
                        </button>
                        <button
                            onClick={() => {/* Logique de téléchargement */}}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                        >
                            <FontAwesomeIcon icon={faDownload} className="mr-2" />
                            Télécharger
                        </button>
                    </div>
                </div>

                {/* Messages de statut */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-center">
                        <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 mr-3 text-xl" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg flex items-center">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-3 text-xl" />
                        <p className="text-green-700">{successMessage}</p>
                    </div>
                )}

                {/* Grille principale */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Colonne gauche - Informations facture et agence */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Carte agence (si disponible) */}
                        {agency && (
                            <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-indigo-500">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <FontAwesomeIcon icon={faBuilding} className="text-indigo-600 mr-2" />
                                    Agence
                                </h2>
                                <p className="font-medium text-gray-900">{agency.name}</p>
                                {agency.email && (
                                    <p className="text-sm text-gray-600 mt-2 flex items-center">
                                        <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-400" />
                                        {agency.email}
                                    </p>
                                )}
                                {agency.phone && (
                                    <p className="text-sm text-gray-600 mt-1 flex items-center">
                                        <FontAwesomeIcon icon={faPhone} className="mr-2 text-gray-400" />
                                        {agency.phone}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-3">
                                    {paymentModes.length} mode(s) de paiement disponible(s)
                                </p>
                            </div>
                        )}

                        {/* Carte facture */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <FontAwesomeIcon icon={faReceipt} className="text-indigo-600 mr-2" />
                                Détails de la facture
                            </h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Référence</p>
                                    <p className="font-mono font-medium text-gray-900">{invoice.reference}</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-500">Client</p>
                                    <p className="font-medium text-gray-900">
                                        {invoice.customer?.firstName} {invoice.customer?.lastName}
                                    </p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-500">Date d'émission</p>
                                    <p className="text-gray-900">{new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</p>
                                </div>
                                
                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-500 mb-1">Statut</p>
                                    {getStatusBadge(invoice.status)}
                                </div>
                                
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-500 mb-1">Montant total</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatAmount(invoice.amount)}</p>
                                    
                                    <div className="mt-3 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Déjà payé</span>
                                            <span className="font-medium text-green-600">{formatAmount(invoice.paid || 0)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Solde restant</span>
                                            <span className="font-medium text-orange-600">{formatAmount(invoice.balance)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Historique des paiements */}
                        {paymentHistory.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h3 className="text-md font-semibold text-gray-900 mb-4">
                                    Historique des paiements
                                </h3>
                                <div className="space-y-3">
                                    {paymentHistory.map((payment, index) => {
                                        const mode = paymentModes.find(m => m.id === payment.modePaymentId);
                                        return (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                                        <FontAwesomeIcon 
                                                            icon={getPaymentModeIcon(mode?.type, mode?.organization)} 
                                                            className="text-indigo-600 text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {formatAmount(payment.amount)}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString('fr-FR')}
                                                        </p>
                                                        {payment.reference && (
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                Réf: {payment.reference}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                                    {mode?.organization || mode?.type || 'Paiement'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Colonne droite - Formulaire de paiement */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-600 mr-2" />
                                Effectuer un paiement
                            </h2>

                            {paymentModes.length === 0 ? (
                                <div className="text-center py-8 bg-yellow-50 rounded-xl">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-yellow-500 mb-3" />
                                    <p className="text-gray-700 font-medium">Aucun mode de paiement disponible</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Cette agence n'a pas configuré de modes de paiement.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handlePayment} className="space-y-6">
                                    {/* Mode de paiement */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mode de paiement <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {paymentModes.map((mode) => (
                                                <button
                                                    key={mode.id}
                                                    type="button"
                                                    onClick={() => setSelectedMode(mode.id.toString())}
                                                    className={`
                                                        p-4 border-2 rounded-xl flex items-center transition-all
                                                        ${selectedMode === mode.id.toString()
                                                            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                                                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                                        }
                                                        ${mode.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}
                                                    `}
                                                    disabled={mode.status !== 'active'}
                                                >
                                                    <div className={`
                                                        w-10 h-10 rounded-full flex items-center justify-center mr-3
                                                        ${selectedMode === mode.id.toString() ? 'bg-indigo-600' : 'bg-gray-100'}
                                                    `}>
                                                        <FontAwesomeIcon 
                                                            icon={getPaymentModeIcon(mode.type, mode.organization)}
                                                            className={selectedMode === mode.id.toString() ? 'text-white' : 'text-gray-600'}
                                                        />
                                                    </div>
                                                    <div className="text-left flex-1">
                                                        <p className="font-medium text-gray-900">
                                                            {mode.organization || mode.name || mode.type}
                                                        </p>
                                                        {mode.accountNumber && (
                                                            <p className="text-xs text-gray-600 font-mono mt-1">
                                                                {mode.accountNumber}
                                                            </p>
                                                        )}
                                                        {mode.accountName && (
                                                            <p className="text-xs text-gray-500">
                                                                {mode.accountName}
                                                            </p>
                                                        )}
                                                        {mode.isDefault && (
                                                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full mt-1 inline-block">
                                                                Par défaut
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Champs conditionnels selon le mode */}
                                    {selectedModeDetails && (
                                        <div className="space-y-4 animate-fadeIn">
                                            {/* Numéro de référence (toujours disponible) */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Référence de paiement
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentReference}
                                                    onChange={(e) => setPaymentReference(e.target.value)}
                                                    placeholder="Ex: Numéro de transaction, chèque, etc."
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-200 transition-colors"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Optionnel - Numéro de transaction ou référence externe
                                                </p>
                                            </div>

                                            {/* Date de paiement */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Date de paiement
                                                </label>
                                                <input
                                                    type="date"
                                                    value={paymentDate}
                                                    onChange={(e) => setPaymentDate(e.target.value)}
                                                    max={new Date().toISOString().split('T')[0]}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-200 transition-colors"
                                                />
                                            </div>

                                            {/* Afficher les détails du compte si disponibles */}
                                            {selectedModeDetails.accountNumber && (
                                                <div className="p-3 bg-blue-50 rounded-lg">
                                                    <p className="text-sm font-medium text-blue-800 mb-1">Coordonnées de paiement :</p>
                                                    {selectedModeDetails.accountName && (
                                                        <p className="text-xs text-blue-700">Titulaire: {selectedModeDetails.accountName}</p>
                                                    )}
                                                    <p className="text-xs text-blue-700 font-mono">
                                                        {selectedModeDetails.type === 'mobile_money' ? 'Numéro: ' : 'Compte: '}
                                                        {selectedModeDetails.accountNumber}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Montant */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Montant à payer <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                min="1"
                                                max={invoice.balance}
                                                step="1"
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-200 transition-colors"
                                                placeholder="0"
                                                required
                                            />
                                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                                XOF
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Solde restant : {formatAmount(invoice.balance)}
                                        </p>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description (facultatif)
                                        </label>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Ex: Paiement partiel, acompte..."
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-200 transition-colors"
                                        />
                                    </div>

                                    {/* Bouton de soumission */}
                                    <button
                                        type="submit"
                                        disabled={submitting || paymentModes.length === 0}
                                        className={`
                                            w-full py-4 px-6 rounded-xl font-semibold text-white
                                            flex items-center justify-center space-x-2
                                            transition-all transform hover:scale-105
                                            ${submitting || paymentModes.length === 0
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
                                            }
                                        `}
                                    >
                                        {submitting ? (
                                            <>
                                                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                                <span>Traitement en cours...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faMoneyBillWave} />
                                                <span>Confirmer le paiement</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmation */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Confirmer le paiement
                        </h3>
                        
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Montant</span>
                                <span className="font-bold text-xl text-green-600">{formatAmount(amount)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Mode</span>
                                <span className="font-medium">
                                    {selectedModeDetails?.organization || selectedModeDetails?.type}
                                </span>
                            </div>
                            
                            {paymentReference && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Référence</span>
                                    <span className="font-mono text-sm">{paymentReference}</span>
                                </div>
                            )}
                            
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Date</span>
                                <span>{new Date(paymentDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                            
                            {description && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Description</span>
                                    <span className="text-sm">{description}</span>
                                </div>
                            )}
                            
                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-sm text-gray-500">
                                    Après confirmation, le paiement sera enregistré et le solde de la facture sera mis à jour.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={submitting}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmPayment}
                                disabled={submitting}
                                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {submitting ? (
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                ) : (
                                    'Confirmer'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Ajout des styles pour l'animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
    }
`;
document.head.appendChild(style);

export default InvoicePayment;
