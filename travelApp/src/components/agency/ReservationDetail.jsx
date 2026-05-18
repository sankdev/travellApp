import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { destinationService } from '../../services/destinationService';
import { companyService } from '../../services/companyService';
import { classeService } from '../../services/classService';
import { volService } from '../../services/volService';
import { agencyService } from '../../services/agencyService';
import { reservationService } from '../../services/reservationService';

const ReservationDetailByAgency = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [reservation, setReservation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [classes, setClasses] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [vols, setVols] = useState([]);

    // Fonction pour trouver les dates d'émission et d'expiration dans les documents
    const findDocumentDates = (passenger) => {
        let issueDate = null;
        let expirationDate = null;
        let allDocuments = [];

        // Chercher d'abord dans passenger.documents (pluriel)
        if (passenger?.documents) {
            if (Array.isArray(passenger.documents)) {
                allDocuments = [...passenger.documents];
            } else if (typeof passenger.documents === 'object') {
                allDocuments = [passenger.documents];
            }
        }
        
        // Chercher ensuite dans passenger.document (singulier)
        if (passenger?.document) {
            if (Array.isArray(passenger.document)) {
                allDocuments = [...allDocuments, ...passenger.document];
            } else if (typeof passenger.document === 'object') {
                allDocuments.push(passenger.document);
            }
        }

        // Chercher dans tous les documents trouvés
        for (const doc of allDocuments) {
            // Chercher issueDate dans différents formats
            if (!issueDate) {
                issueDate = doc.issueDate || doc.dateEmission || doc.issueDate || doc.emissionDate;
            }
            
            // Chercher expirationDate dans différents formats
            if (!expirationDate) {
                expirationDate = doc.expirationDate || doc.dateExpiration || doc.expiryDate || doc.validUntil;
            }
            
            // Si on a trouvé les deux dates, on peut arrêter
            if (issueDate && expirationDate) break;
        }

        return { issueDate, expirationDate, documents: allDocuments };
    };

    // Fonction pour obtenir tous les documents d'un passager (pour l'affichage)
    const getAllPassengerDocuments = (passenger) => {
        const documents = [];
        
        // Chercher dans passenger.documents (pluriel)
        if (passenger?.documents) {
            if (Array.isArray(passenger.documents)) {
                documents.push(...passenger.documents);
            } else if (typeof passenger.documents === 'object') {
                documents.push(passenger.documents);
            }
        }
        
        // Chercher dans passenger.document (singulier)
        if (passenger?.document) {
            if (Array.isArray(passenger.document)) {
                documents.push(...passenger.document);
            } else if (typeof passenger.document === 'object') {
                documents.push(passenger.document);
            }
        }
        
        return documents;
    };

    // Fonction pour obtenir un champ spécifique d'un document
    const getDocumentField = (doc, fieldName) => {
        if (!doc) return null;
        
        const fieldMappings = {
            'typeDocument': ['typeDocument', 'documentType', 'type'],
            'documentNumber': ['documentNumber', 'numDocument', 'number'],
            'issueDate': ['issueDate', 'dateEmission', 'emissionDate'],
            'expirationDate': ['expirationDate', 'dateExpiration', 'expiryDate'],
            'documentPath': ['documentPath', 'path', 'filePath'],
            'base64': ['base64', 'fileBase64'],
            'name': ['name', 'fileName']
        };

        const possibleFields = fieldMappings[fieldName] || [fieldName];
        
        for (const field of possibleFields) {
            if (doc[field] !== undefined && doc[field] !== null) {
                return doc[field];
            }
        }
        
        return null;
    };

    // Composant pour afficher un document individuel
    const DocumentItem = ({ doc, index }) => {
        const typeDocument = getDocumentField(doc, 'typeDocument');
        const documentNumber = getDocumentField(doc, 'documentNumber');
        const issueDate = getDocumentField(doc, 'issueDate');
        const expirationDate = getDocumentField(doc, 'expirationDate');
        const documentPath = getDocumentField(doc, 'documentPath');
        const base64 = getDocumentField(doc, 'base64');
        const fileName = getDocumentField(doc, 'name');

        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const baseUrl = apiBaseUrl.replace('/api', '');
        const documentUrl = documentPath?.startsWith("http")
            ? documentPath
            : documentPath ? `${baseUrl}/${documentPath.replace(/\\/g, '/')}` : null;

        return (
            <div className="mb-2 pb-2 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0">
                <div className="flex items-start justify-between">
                    <div>
                        <span className="font-medium">{typeDocument || 'Document'}</span>
                        {documentNumber && (
                            <span className="ml-2 text-gray-600">({documentNumber})</span>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        {documentUrl ? (
                            <a
                                href={documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline text-sm"
                            >
                                Télécharger
                            </a>
                        ) : base64 ? (
                            <a
                                href={base64}
                                download={fileName || "document.pdf"}
                                className="text-green-500 hover:underline text-sm"
                            >
                                Télécharger
                            </a>
                        ) : (
                            <span className="text-gray-400 text-sm">No file</span>
                        )}
                    </div>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                    {issueDate && (
                        <div>Émission: {formatDate(issueDate)}</div>
                    )}
                    {expirationDate && (
                        <div>Expiration: {formatDate(expirationDate)}</div>
                    )}
                </div>
            </div>
        );
    };

    useEffect(() => {
        fetchReservationDetails();
        fetchVols();
        fetchClasses();
        fetchCompanies();
        fetchDestinations();
        fetchAgencies();
    }, [id]);

    const fetchVols = async () => {
        try {
            const response = await volService.getVols();
            setVols(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error('Failed to fetch vols:', err);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await classeService.getClasses();
            setClasses(response || []);
        } catch (err) {
            console.error('Failed to fetch classes:', err);
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await companyService.getCompanies();
            setCompanies(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error('Failed to fetch companies:', err);
        }
    };

    const fetchDestinations = async () => {
        try {
            const response = await destinationService.getDestinations();
            setDestinations(response || []);
        } catch (err) {
            console.error('Failed to fetch destinations:', err);
        }
    };

    const fetchReservationDetails = async () => {
        try {
            const response = await reservationService.getReservationById(id);
            console.log('Reservation details raw:', response);
            
            // Normaliser la structure des données pour faciliter l'accès aux dates
            const reservationData = response.data || response;
            
            // Si les passagers existent, normaliser leurs dates
            if (reservationData.passengers && Array.isArray(reservationData.passengers)) {
                reservationData.passengers = reservationData.passengers.map(passenger => {
                    const { issueDate, expirationDate, documents } = findDocumentDates(passenger);
                    return {
                        ...passenger,
                        normalizedIssueDate: issueDate,
                        normalizedExpirationDate: expirationDate,
                        normalizedDocuments: documents
                    };
                });
            }
            
            setReservation(reservationData);
            setLoading(false);
        } catch (err) {
            console.error('Failed to load reservation details:', err);
            setError('Failed to load reservation details');
            setLoading(false);
        }
    };

    const fetchAgencies = async () => {
        try {
            const response = await agencyService.getAgencies({ page: 1, search: '' });
            setAgencies(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Failed to fetch agencies:', err);
        }
    };

    const getClassById = (id) => {
        if (!classes || !classes.length) return 'Unknown';
        const classItem = classes.find((item) => item.id === parseInt(id));
        return classItem ? classItem.name : 'Unknown';
    };

    const getAgencyById = (id) => {
        if (!agencies || !agencies.length) return 'Unknown';
        const agency = agencies.find((item) => item.id === parseInt(id));
        return agency ? agency.name : 'Unknown';
    };

    const getCompanyById = (id) => {
        if (!companies || !companies.length) return 'Unknown';
        const company = companies.find((item) => item.id === parseInt(id));
        return company ? company.name : 'Unknown';
    };

    const getDestinationById = (id) => {
        if (!destinations || !destinations.length) return { country: 'Unknown', city: 'Unknown' };
        const destination = destinations.find((item) => item.id === parseInt(id));
        return destination
            ? { country: destination.country || 'Unknown', city: destination.city || 'Unknown' }
            : { country: 'Unknown', city: 'Unknown' };
    };

    const getStatusColor = (status) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Date invalide';
            return date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Date formatting error:', error, dateString);
            return 'Date invalide';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    if (!reservation) {
        return (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    Reservation not found
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl">
                        Détails de la Réservation
                    </h2>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                    <button
                        onClick={() => navigate('/agency/reservations')}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Retour
                    </button>
                    {reservation?.status === 'Pending' && (
                        <button
                            onClick={() => window.confirm('Annuler cette réservation ?')}
                            className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Annuler
                        </button>
                    )}
                </div>
            </div>

            {/* Reservation Info */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900">
                        {reservation?.vols?.flight?.name || 'Vol'}
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation?.status)}`}>
                        {reservation?.status || 'Inconnu'}
                    </span>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Destination</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {(() => {
                                    const destination = getDestinationById(reservation?.endDestinationId);
                                    return `${destination.city}, ${destination.country}`;
                                })()}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Dates de voyage</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {formatDate(reservation?.startAt)} - {formatDate(reservation?.endAt)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Type de voyage</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {reservation?.tripType === 'round-trip' ? 'Aller-retour' : 'Aller simple'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Prix total</dt>
                            <dd className="mt-1 text-2xl font-bold text-green-600">
                                {reservation?.totalPrice?.toLocaleString('fr-FR') || '0'} Fcfa
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Classe</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {reservation?.class?.class?.name || getClassById(reservation?.agencyClassId) || 'N/A'}
                            </dd>
                        </div>
                        {reservation?.description && (
                            <div className="md:col-span-3">
                                <dt className="text-sm font-medium text-gray-500">Description</dt>
                                <dd className="mt-1 text-sm text-gray-900">{reservation.description}</dd>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Passengers Section - VERSION AMÉLIORÉE POUR LES DATES */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">
                        Passagers ({reservation?.passengers?.length || 0})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nom complet
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Documents
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date d'émission
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date d'expiration
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reservation?.passengers?.map((passenger, index) => {
                                // Utiliser les dates normalisées ou les chercher à nouveau
                                const issueDate = passenger.normalizedIssueDate;
                                const expirationDate = passenger.normalizedExpirationDate;
                                const documents = passenger.normalizedDocuments || getAllPassengerDocuments(passenger);
                                
                                return (
                                    <tr key={index}>
                                        {/* Nom du passager */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {passenger.firstName} {passenger.lastName}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {passenger.gender === 'masculin' ? 'Homme' : 
                                                 passenger.gender === 'feminin' ? 'Femme' : 
                                                 passenger.gender || 'Non spécifié'}
                                            </div>
                                        </td>

                                        {/* Type de passager */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                passenger.typePassenger === 'ADLT' ? 'bg-blue-100 text-blue-800' :
                                                passenger.typePassenger === 'CHD' ? 'bg-green-100 text-green-800' :
                                                passenger.typePassenger === 'INF' ? 'bg-purple-100 text-purple-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {passenger.typePassenger === 'ADLT' ? 'Adulte' :
                                                 passenger.typePassenger === 'CHD' ? 'Enfant' :
                                                 passenger.typePassenger === 'INF' ? 'Nourrisson' :
                                                 passenger.typePassenger || 'N/A'}
                                            </span>
                                        </td>

                                        {/* Documents */}
                                        <td className="px-6 py-4">
                                            {documents.length > 0 ? (
                                                <div className="space-y-1">
                                                    {documents.map((doc, docIndex) => {
                                                        const type = getDocumentField(doc, 'typeDocument');
                                                        const number = getDocumentField(doc, 'documentNumber');
                                                        return (
                                                            <div key={docIndex} className="text-sm">
                                                                {type || 'Document'} 
                                                                {number && ` (${number})`}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Aucun document</span>
                                            )}
                                        </td>

                                        {/* Date d'émission - AFFICHAGE UNIFIÉ */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {issueDate ? (
                                                <div>
                                                    {formatDate(issueDate)}
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {documents.length > 0 ? (
                                                            <span>Trouvée dans {documents.length} document(s)</span>
                                                        ) : (
                                                            <span>Date trouvée dans les données du passager</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">N/A</span>
                                            )}
                                        </td>

                                        {/* Date d'expiration - AFFICHAGE UNIFIÉ */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {expirationDate ? (
                                                <div>
                                                    {formatDate(expirationDate)}
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {documents.length > 0 ? (
                                                            <span>Trouvée dans {documents.length} document(s)</span>
                                                        ) : (
                                                            <span>Date trouvée dans les données du passager</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Détails des documents (section supplémentaire) */}
            <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">Détails des documents</h3>
                </div>
                <div className="p-6">
                    {reservation?.passengers?.map((passenger, index) => {
                        const documents = passenger.normalizedDocuments || getAllPassengerDocuments(passenger);
                        
                        if (documents.length === 0) return null;
                        
                        return (
                            <div key={index} className="mb-6 last:mb-0 border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-3">
                                    {passenger.firstName} {passenger.lastName}
                                </h4>
                                <div className="space-y-3">
                                    {documents.map((doc, docIndex) => (
                                        <div key={docIndex} className="bg-gray-50 p-3 rounded">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium">
                                                        {getDocumentField(doc, 'typeDocument') || 'Document'}
                                                    </div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        Numéro: {getDocumentField(doc, 'documentNumber') || 'N/A'}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm">
                                                        Émission: {getDocumentField(doc, 'issueDate') ? formatDate(getDocumentField(doc, 'issueDate')) : 'N/A'}
                                                    </div>
                                                    <div className="text-sm">
                                                        Expiration: {getDocumentField(doc, 'expirationDate') ? formatDate(getDocumentField(doc, 'expirationDate')) : 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Afficher l'origine des données */}
                                            <div className="mt-2 text-xs text-gray-400">
                                                Données extraites de: {passenger.document ? 'document (singulier)' : 'documents (pluriel)'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
              <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
            {/* Flight Information */}
            {reservation?.vols && (
                <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900">Informations du vol</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Vol</dt>
                                <dd className="mt-1 text-sm text-gray-900">{reservation.vols.flight?.name || 'N/A'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Prix</dt>
                                <dd className="mt-1 text-sm text-gray-900">{reservation.vols.price?.toLocaleString('fr-FR') || '0'} Fcfa</dd>
                            </div>
                        </div>
                    </div>
                </div>
              )}
           </div>
             {/* Campaign Information */}
           <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">            
            {reservation?.campaign && (
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="text-lg font-medium text-gray-900 mb-3">Campagne</h4>
                                <div className="space-y-2">
                                    {reservation.campaign.title && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Titre:</span>
                                            <span className="ml-2 text-sm text-gray-900">{reservation.campaign.title}</span>
                                        </div>
                                    )}
                                    {reservation.campaign.price && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Prix campagne:</span>
                                            <span className="ml-2 text-sm text-gray-900">{reservation.campaign.price.toLocaleString('fr-FR')} Fcfa</span>
                                        </div>
                                    )}
                                    {reservation.campaign.description && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Description:</span>
                                            <span className="ml-2 text-sm text-gray-900">{reservation.campaign.description}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                   </div>
        </div>
    );
};

export default ReservationDetailByAgency;
