import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { customerService } from '../../../services/customerService';
import { destinationService } from '../../../services/destinationService';
import { companyService } from '../../../services/companyService';
import { classeService } from '../../../services/classService';
import { volService } from '../../../services/volService';
import { agencyService } from '../../../services/agencyService';
import { reservationService } from '../../../services/reservationService';

const ReservationDetail = () => {
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

    // Fonction utilitaire pour obtenir TOUS les documents d'un passager
    const getAllPassengerDocuments = (passenger) => {
        const documents = [];
        
        // Cas 1: passenger.documents (pluriel) - peut être un tableau ou un objet
        if (passenger?.documents) {
            if (Array.isArray(passenger.documents)) {
                // C'est déjà un tableau, on l'ajoute directement
                documents.push(...passenger.documents);
            } else if (typeof passenger.documents === 'object' && passenger.documents !== null) {
                // C'est un objet, on le transforme en tableau
                documents.push(passenger.documents);
            }
        }
        
        // Cas 2: passenger.document (singulier) - peut être un tableau ou un objet
        if (passenger?.document) {
            if (Array.isArray(passenger.document)) {
                documents.push(...passenger.document);
            } else if (typeof passenger.document === 'object' && passenger.document !== null) {
                documents.push(passenger.document);
            }
        }
        
        // Cas 3: Vérifier d'autres formats possibles
        const possibleDocumentFields = ['documentsList', 'documentList', 'docs', 'files'];
        possibleDocumentFields.forEach(field => {
            if (passenger?.[field]) {
                if (Array.isArray(passenger[field])) {
                    documents.push(...passenger[field]);
                } else if (typeof passenger[field] === 'object' && passenger[field] !== null) {
                    documents.push(passenger[field]);
                }
            }
        });
        
        // Éliminer les doublons basés sur documentNumber
        const uniqueDocs = [];
        const seenNumbers = new Set();
        
        documents.forEach(doc => {
            const docNumber = getDocumentFieldValue(doc, 'documentNumber');
            if (!docNumber || !seenNumbers.has(docNumber)) {
                if (docNumber) seenNumbers.add(docNumber);
                uniqueDocs.push(doc);
            }
        });
        
        return uniqueDocs;
    };

    // Fonction pour obtenir la valeur d'un champ de document avec plusieurs noms possibles
    const getDocumentFieldValue = (doc, fieldType) => {
        if (!doc) return null;
        
        const fieldMappings = {
            'typeDocument': ['typeDocument', 'documentType', 'type', 'typeDoc', 'documentTypeName'],
            'documentNumber': ['documentNumber', 'numDocument', 'number', 'docNumber', 'numDoc'],
            'issueDate': ['issueDate', 'dateEmission', 'issueDate', 'emissionDate', 'dateIssued'],
            'expirationDate': ['expirationDate', 'dateExpiration', 'expiryDate', 'validUntil'],
            'documentPath': ['documentPath', 'path', 'filePath', 'fileUrl', 'url'],
            'base64': ['base64', 'fileBase64', 'base64Data', 'data'],
            'name': ['name', 'fileName', 'documentName', 'title'],
            'fileType': ['fileType', 'mimeType', 'contentType']
        };
        
        const possibleFields = fieldMappings[fieldType] || [fieldType];
        
        for (const field of possibleFields) {
            if (doc[field] !== undefined && doc[field] !== null && doc[field] !== '') {
                return doc[field];
            }
        }
        
        // Vérifier également si le document a un objet files/attachments
        if (doc.files && Array.isArray(doc.files) && doc.files.length > 0) {
            const file = doc.files[0];
            for (const field of possibleFields) {
                if (file[field] !== undefined && file[field] !== null && file[field] !== '') {
                    return file[field];
                }
            }
        }
        
        return null;
    };

    // Fonction pour obtenir l'URL de téléchargement d'un document
    const getDocumentDownloadUrl = (doc) => {
        const documentPath = getDocumentFieldValue(doc, 'documentPath');
        const base64 = getDocumentFieldValue(doc, 'base64');
        
        if (documentPath) {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const baseUrl = apiBaseUrl.replace('/api', '');
            
            if (documentPath.startsWith("http")) {
                return documentPath;
            } else if (documentPath.startsWith("/")) {
                return `${baseUrl}${documentPath}`;
            } else {
                return `${baseUrl}/${documentPath.replace(/\\/g, '/')}`;
            }
        }
        
        if (base64) {
            // Si c'est déjà une URL data, la retourner directement
            if (base64.startsWith('data:')) {
                return base64;
            }
            // Sinon, construire une URL data
            const fileType = getDocumentFieldValue(doc, 'fileType') || 'application/pdf';
            return `data:${fileType};base64,${base64}`;
        }
        
        return null;
    };

    // Fonction pour obtenir le nom du fichier à télécharger
    const getDocumentFileName = (doc) => {
        const name = getDocumentFieldValue(doc, 'name');
        const type = getDocumentFieldValue(doc, 'typeDocument');
        const number = getDocumentFieldValue(doc, 'documentNumber');
        
        if (name) return name;
        
        const extension = getDocumentFieldValue(doc, 'fileType')?.split('/')[1] || 'pdf';
        return `${type || 'document'}_${number || 'unknown'}.${extension}`;
    };

    // Composant pour afficher un document individuel
    const DocumentItem = ({ doc, index }) => {
        const typeDocument = getDocumentFieldValue(doc, 'typeDocument') || 'Document';
        const documentNumber = getDocumentFieldValue(doc, 'documentNumber');
        const issueDate = getDocumentFieldValue(doc, 'issueDate');
        const expirationDate = getDocumentFieldValue(doc, 'expirationDate');
        const downloadUrl = getDocumentDownloadUrl(doc);
        const fileName = getDocumentFileName(doc);
        
        const hasFile = downloadUrl !== null;
        
        return (
            <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="font-medium text-gray-800">{typeDocument}</div>
                        {documentNumber && (
                            <div className="text-sm text-gray-600 mt-1">Numéro: {documentNumber}</div>
                        )}
                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                            {issueDate && (
                                <div>Émission: {formatDate(issueDate)}</div>
                            )}
                            {expirationDate && (
                                <div>Expiration: {formatDate(expirationDate)}</div>
                            )}
                        </div>
                    </div>
                    <div className="ml-4">
                        {hasFile ? (
                            <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={fileName}
                                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Télécharger
                            </a>
                        ) : (
                            <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Pas de fichier
                            </span>
                        )}
                    </div>
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
            
            // Normaliser la structure des données
            const reservationData = response.data || response;
            
            // Si les passagers existent, normaliser leurs documents
            if (reservationData.passengers && Array.isArray(reservationData.passengers)) {
                reservationData.passengers = reservationData.passengers.map(passenger => {
                    console.log('Passenger raw:', passenger);
                    const documents = getAllPassengerDocuments(passenger);
                    console.log('Normalized documents:', documents);
                    return {
                        ...passenger,
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
           console.log('agenciesDetails',response.data)   
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
            case 'demand':
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'counter_proposal':
                return 'bg-purple-100 text-purple-800';
            case 'accepted':
                return 'bg-indigo-100 text-indigo-800';
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
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Date invalide';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Chargement des détails de la réservation...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p className="font-bold">Erreur</p>
                    <p>{error}</p>
                    <button
                        onClick={() => navigate('/customer/reservations')}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retour aux réservations
                    </button>
                </div>
            </div>
        );
    }

    if (!reservation) {
        return (
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    <p className="font-bold">Réservation introuvable</p>
                    <p>La réservation demandée n'existe pas ou a été supprimée.</p>
                </div>
            </div>
        );
    }
   
    console.log('reservationAgency', reservation);
    
    // ✅ Vérifier si le statut est "demand"
    const isDemandStatus = reservation?.status?.toLowerCase() === 'demand';

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl">
                        Détails de la Réservation #{reservation.id || id}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Créée le {formatDate(reservation.createdAt)}
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                    <button
                        onClick={() => navigate('/customer/reservations')}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Retour
                    </button>
                    {reservation?.status === 'Pending' && (
                        <button
                            onClick={() => window.confirm('Annuler cette réservation ?') && handleCancelReservation()}
                            className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Annuler
                        </button>
                    )}
                </div>
            </div>

            {/* Reservation Info */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900">
                        {reservation?.vols?.flight?.name || 'Détails du vol'}
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation?.status)}`}>
                        {reservation?.status || 'Statut inconnu'}
                    </span>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Agence</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {reservation?.agencyReservations?.name || 'N/A'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Type de voyage</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {reservation?.tripType === 'round-trip' ? 'Aller-retour' : 'Aller simple'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Classe</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {reservation?.class?.class?.name || getClassById(reservation?.agencyClassId) || 'N/A'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Départ</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {(() => {
                                    const destination = getDestinationById(reservation?.startDestinationId);
                                    return `${destination.city}, ${destination.country}`;
                                })()}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Arrivée</dt>
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
                                {formatDate(reservation?.startAt)} 
                                {reservation?.endAt && ` - ${formatDate(reservation.endAt)}`}
                            </dd>
                        </div>
                        
                        {/* ✅ Section Prix Total - Masquée si le statut est "demand" */}
                        {!isDemandStatus && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Prix total</dt>
                                <dd className="mt-1 text-2xl font-bold text-green-600">
                                    {reservation?.totalPrice?.toLocaleString('fr-FR') || '0'} Fcfa
                                </dd>
                            </div>
                        )}
                        
                        {reservation?.description && (
                            <div className="md:col-span-2 lg:col-span-3">
                                <dt className="text-sm font-medium text-gray-500">Description</dt>
                                <dd className="mt-1 text-sm text-gray-900">{reservation.description}</dd>
                            </div>
                        )}
                    </div>
                    
                    {/* ✅ Message informatif pour le statut "demand" */}
                    {isDemandStatus && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700">
                                <span className="font-medium">Note:</span> Cette réservation est en cours de traitement par l'agence. 
                                Le prix vous sera communiqué dès que l'agence aura validé votre demande.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Passengers Section */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">
                        Passagers ({reservation?.passengers?.length || 0})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    {reservation?.passengers && reservation.passengers.length > 0 ? (
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
                                        Informations
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Documents ({reservation?.passengers?.reduce((acc, p) => acc + (p.normalizedDocuments?.length || 0), 0)})
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reservation.passengers.map((passenger, index) => {
                                    const documents = passenger.normalizedDocuments || getAllPassengerDocuments(passenger);
                                    
                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
                                            {/* Informations personnelles */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {passenger.firstName} {passenger.lastName}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
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
                                            
                                            {/* Informations supplémentaires */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 space-y-1">
                                                    {passenger.birthDate && (
                                                        <div>Né(e) le: {formatDate(passenger.birthDate)}</div>
                                                    )}
                                                    {passenger.birthPlace && (
                                                        <div>Lieu: {passenger.birthPlace}</div>
                                                    )}
                                                    {passenger.nationality && (
                                                        <div>Nationalité: {passenger.nationality}</div>
                                                    )}
                                                    {passenger.profession && (
                                                        <div>Profession: {passenger.profession}</div>
                                                    )}
                                                </div>
                                            </td>
                                            
                                            {/* Documents */}
                                            <td className="px-6 py-4">
                                                {documents.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {documents.map((doc, docIndex) => (
                                                            <DocumentItem key={docIndex} doc={doc} index={docIndex} />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4">
                                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <p className="mt-2 text-sm text-gray-500">Aucun document</p>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 0a4 4 0 110-5.392" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">Aucun passager</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Flight and Additional Information */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">Informations complémentaires</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Flight Information */}
                        {reservation?.vols && (
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="text-lg font-medium text-gray-900 mb-3">Informations du vol</h4>
                                <div className="space-y-2">
                                    {reservation.vols.flight?.name && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Vol:</span>
                                            <span className="ml-2 text-sm text-gray-900">{reservation.vols.flight.name}</span>
                                        </div>
                                    )}
                                    {reservation.vols.price && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Prix du vol:</span>
                                            <span className="ml-2 text-sm font-bold text-green-600">{reservation.vols.price.toLocaleString('fr-FR')} Fcfa</span>
                                        </div>
                                    )}
                                    {reservation.vols.flight?.companyId && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Compagnie:</span>
                                            <span className="ml-2 text-sm text-gray-900">{getCompanyById(reservation.vols.flight.companyId)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Campaign Information */}
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

                        {/* Return Flight Information */}
                        {reservation?.tripType === 'round-trip' && reservation?.returnVolId && (
                            <div className="border border-gray-200 rounded-lg p-4 md:col-span-2">
                                <h4 className="text-lg font-medium text-gray-900 mb-3">Vol retour</h4>
                                <div className="text-sm text-gray-600">
                                    Vol retour configuré. Détails disponibles sur demande.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReservationDetail;
