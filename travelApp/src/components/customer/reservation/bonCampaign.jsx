import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agencyService } from '../../../services/agencyService';
import { companyService } from '../../../services/companyService';
import { compaignService } from '../../../services/compaignService';
import { customerService } from '../../../services/customerService';
import { destinationService } from '../../../services/destinationService';
import { pricingRuleService } from '../../../services/pricingRuleService';
import { reservationService } from '../../../services/reservationService';
import { agencyAssociationService } from '../../../services/agencyAssociationService';
import { passengerService } from '../../../services/passengerService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faBuilding,
  faSearch,
  faPlane,
  faDollarSign,
  faPlaneDeparture,
  faMapSigns,
  faMapMarkerAlt,
  faMapPin,
  faCalendarAlt,
  faVenusMars,
  faSignature,
  faUser,
  faSync,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

const CreateReservationCampaign = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [destinations, setDestinations] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [vols, setVols] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [search, setSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [profile, setProfile] = useState({});
    const [document, setDocumentFiles] = useState([]);
    const [agencySearch, setAgencySearch] = useState('');
    const [volSearch, setVolSearch] = useState('');
    const [classes, setClasses] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [classSearch, setClassSearch] = useState('');
    const [showClassSuggestions, setShowClassSuggestions] = useState(false);
    const [showReturnVolSuggestions, setShowReturnVolSuggestions] = useState(false);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [passengersWithDocuments, setPassengersWithDocuments] = useState([]);
    const [returnVolSearch, setReturnVolSearch] = useState('');
    const [filteredReturnVols, setFilteredReturnVols] = useState([]);
    const [showAgencySuggestions, setShowAgencySuggestions] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [startDestinationSearch, setStartDestinationSearch] = useState('');
    const [endDestinationSearch, setEndDestinationSearch] = useState('');
    const [startDestinations, setStartDestinations] = useState([]);
    const [endDestinations, setEndDestinations] = useState([]);
    const [showStartDestinationSuggestions, setShowStartDestinationSuggestions] = useState(false);
    const [showEndDestinationSuggestions, setShowEndDestinationSuggestions] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const [showVolSuggestions, setShowVolSuggestions] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    
    const [passengers, setPassengers] = useState([{
        firstName: '',
        lastName: '',
        documentType: '',
        documentNumber: '',
        gender: '',
        birthDate: '',
        birthPlace: '',
        nationality: '',
        profession: '',
        typePassenger: "",
        address: '',
        document:[{
            documentType: '',
            documentNumber: '',
            issueDate: '',
            expirationDate: '',
            files: null
        }],
        status: 'active'
    }]);
    
    const [formData, setFormData] = useState({
        agencyId: '',
        destinationId: '',
        companyId: '',
        agencyVolId: '',
        campaignId: '',
        returnVolId: '',
        startAt: '',
        endAt: '',
        description: '',
        startDestinationId: '',
        endDestinationId: '',
        agencyClassId: '',
        tripType: 'one-way',
        totalPrice: ''
    });

    const inputClassName = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm";

    // Fonction pour formater la date au format YYYY-MM-DD
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error('Erreur de formatage de date:', error);
            return '';
        }
    };

    // Fonction pour formater l'affichage des dates
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('fr-FR', {
            weekday: 'long',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    // Chargement initial des données
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchDestinations(),
                    fetchCompanies(),
                    fetchProfile(),
                    fetchCustomers(),
                    fetchCampaigns(),
                    fetchAgenciesList(),
                ]);
                fetchClasses();
            } catch (error) {
                console.error('Error in fetchData:', error);
                setError('Failed to load one or more data sets.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Charger la liste complète des agences
    const fetchAgenciesList = async () => {
        try {
            const response = await agencyService.getAgencies({});
            setAgencies(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch agencies list:', error.message);
        }
    };

    // Charger les campagnes
    const fetchCampaigns = async () => {
        try {
            const result = await compaignService.getActiveCampaigns();
            const normalizedCampaigns = result.map(campaign => ({
                ...campaign,
                id: Number(campaign.id),
                price: Number(campaign.price),
                agencyId: campaign.agencyId || campaign.associatedAgency?.id,
                volId: campaign.volId || campaign.vol?.id,
                // Extraire les détails de l'agence
                agencyDetails: campaign.associatedAgency || null,
                // Extraire les détails du vol
                volDetails: campaign.vol || null
            }));
            setCampaigns(normalizedCampaigns);
            console.log('Campagnes chargées:', normalizedCampaigns);
        } catch (error) {
            console.error('Failed to fetch campaigns:', error);
        }
    };

    // Fonction pour synchroniser l'agence et le vol à partir de la campagne
    const syncAgencyAndVolFromCampaign = async (campaign) => {
        setIsSyncing(true);
        try {
            console.log('🚀 Synchronisation depuis la campagne:', campaign);
            
            // 1. Synchroniser l'agence
            if (campaign.agencyId && campaign.agencyDetails) {
                setAgencySearch(campaign.agencyDetails.name);
                setFormData(prev => ({
                    ...prev,
                    agencyId: campaign.agencyId
                }));
                console.log('✅ Agence synchronisée:', campaign.agencyDetails.name);
            }
            
            // 2. Synchroniser le vol
            if (campaign.volId && campaign.volDetails) {
                // Formater le texte de recherche pour le vol
                const volDisplayText = `${campaign.volDetails.name || 'Vol de campagne'} - ${getCompanyById(campaign.volDetails.companyId)}`;
                setVolSearch(volDisplayText);
                
                // Mettre à jour le formulaire avec l'ID du vol
                setFormData(prev => ({
                    ...prev,
                    agencyVolId: campaign.volId
                }));
                
                // Mettre à jour les destinations si disponibles
                if (campaign.volDetails.originId) {
                    setFormData(prev => ({
                        ...prev,
                        startDestinationId: campaign.volDetails.originId
                    }));
                    const originDest = destinations.find(d => d.id == campaign.volDetails.originId);
                    if (originDest) setStartDestinationSearch(originDest.name);
                }
                
                if (campaign.volDetails.destinationId) {
                    setFormData(prev => ({
                        ...prev,
                        endDestinationId: campaign.volDetails.destinationId
                    }));
                    const destDest = destinations.find(d => d.id == campaign.volDetails.destinationId);
                    if (destDest) setEndDestinationSearch(destDest.name);
                }
                
                console.log('✅ Vol synchronisé:', volDisplayText);
            }
            
            // 3. Synchroniser la date de début
            if (campaign.startAt) {
                const formattedDate = formatDateForInput(campaign.startAt);
                setFormData(prev => ({
                    ...prev,
                    startAt: formattedDate
                }));
                console.log('✅ Date synchronisée:', formattedDate);
            }
             if (campaign.endAt) {
                const formattedDate = formatDateForInput(campaign.endAt);
                setFormData(prev => ({
                    ...prev,
                    endAt: formattedDate
                }));
                console.log('✅ Date synchronisée:', formattedDate);
            }
            
            // 4. Mettre à jour le prix
            setTotalPrice(campaign.price);
            
        } catch (error) {
            console.error('❌ Erreur lors de la synchronisation:', error);
            setError('Erreur lors de la synchronisation des données de la campagne');
        } finally {
            setIsSyncing(false);
        }
    };

    // Gestion du changement de campagne
    const handleCampaignChange = async (campaignId) => {
        if (!campaignId) {
            // Réinitialiser si aucune campagne sélectionnée
            setFormData(prev => ({
                ...prev,
                campaignId: '',
                startAt: '',
                totalPrice: 0
            }));
            setTotalPrice(0);
            return;
        }
        
        const selectedCampaign = campaigns.find(c => c.id == campaignId);
        if (!selectedCampaign) return;
        
        console.log('🎯 Campagne sélectionnée pour synchronisation:', selectedCampaign);
        
        // Mettre à jour d'abord l'ID de la campagne
        setFormData(prev => ({
            ...prev,
            campaignId: selectedCampaign.id,
            totalPrice: selectedCampaign.price
        }));
        
        // Synchroniser l'agence et le vol
        await syncAgencyAndVolFromCampaign(selectedCampaign);
    };

    // Charger les vols disponibles pour une agence spécifique
    const fetchVolsForAgency = async (agencyId) => {
        try {
            const response = await agencyAssociationService.getAllFlightAgencies({
                agencyId: agencyId,
                page: 1,
                limit: 50
            });
            
            let volsData = [];
            if (response.data?.success && Array.isArray(response.data.data)) {
                volsData = response.data.data;
            } else if (Array.isArray(response.data?.data)) {
                volsData = response.data.data;
            } else if (Array.isArray(response.data)) {
                volsData = response.data;
            }
            
            setVols(volsData);
            console.log(`📊 Vols chargés pour l'agence ${agencyId}:`, volsData.length);
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement des vols:', error.message);
            setVols([]);
        }
    };

    // Effet pour charger les vols quand une agence est sélectionnée
    useEffect(() => {
        if (formData.agencyId) {
            fetchVolsForAgency(formData.agencyId);
        }
    }, [formData.agencyId]);

    // Autres fonctions existantes
    const fetchDestinations = async (search = '') => {
        try {
            const response = await destinationService.getDestinations({ search });
            setDestinations(Array.isArray(response) ? response : []);
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('Failed to fetch destinations:', error.message);
            return [];
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await companyService.getCompanies();
            setCompanies(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Failed to fetch companies');
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await customerService.getCustomerProfile();
            const data = response.data || {};
            setProfile(data);
            setFormData(prev => ({
                ...prev,
                customerId: data.id || ''
            }));
        } catch (err) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await customerService.getAllCustomers();
            setCustomers(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Failed to fetch customers');
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await agencyAssociationService.getAllClassAgencies();
            setClasses(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Failed to fetch classes');
        }
    };

    useEffect(() => {
        if (classSearch.length > 0) {
            const filtered = classes.filter((cls) =>
                cls.class.name.toLowerCase().includes(classSearch.toLowerCase())
            );
            setFilteredClasses(filtered);
        } else {
            setFilteredClasses(classes);
        }
    }, [classSearch, classes]);

    const handleClassSearch = (value) => {
        setClassSearch(value);
        if (value.trim() === '') {
            setFilteredClasses([]);
            setShowClassSuggestions(false);
            return;
        }
        const filtered = classes.filter((cls) =>
            cls.class.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredClasses(filtered);
        setShowClassSuggestions(filtered.length > 0);
    };

    // Recherche d'agence avec suggestions
    useEffect(() => {
        const fetchAgencies = async () => {
            try {
                const response = await agencyService.getAgencies({ search: agencySearch });
                setAgencies(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Failed to fetch agencies:', error.message);
            }
        };

        if (agencySearch.length > 0) {
            fetchAgencies();
            setShowAgencySuggestions(true);
        } else {
            setShowAgencySuggestions(false);
        }
    }, [agencySearch]);

    // Recherche de vols (manuellement)
    useEffect(() => {
        const fetchVols = async () => {
            try {
                const response = await agencyAssociationService.getAllFlightAgencies({
                    search: volSearch,
                    agencyId: formData.agencyId, // Filtrer par agence si disponible
                    page: 1,
                    limit: 20
                });

                let volsData = [];
                let shouldShowSuggestions = false;

                if (response.data?.success && Array.isArray(response.data.data)) {
                    volsData = response.data.data;
                } else if (Array.isArray(response.data?.data)) {
                    volsData = response.data.data;
                } else if (Array.isArray(response.data)) {
                    volsData = response.data;
                }

                shouldShowSuggestions = volsData.length > 0 && volSearch.trim().length > 0;
                setVols(volsData);
                setShowVolSuggestions(shouldShowSuggestions);

            } catch (error) {
                console.error('❌ Erreur fetch vols:', error.message);
                setVols([]);
                setShowVolSuggestions(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (volSearch.trim().length > 0) {
                fetchVols();
            } else {
                setShowVolSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [volSearch, formData.agencyId]);

    // Sélection manuelle d'un vol
    const handleFlightSelection = (vol) => {
        console.log('✈️ Vol sélectionné manuellement:', vol);

        setFormData((prev) => ({
            ...prev,
            agencyVolId: vol.id,
            startDestinationId: vol.flight?.originId,
            endDestinationId: vol.flight?.destinationId
        }));

        setVolSearch(getFlightDisplayText(vol));
        setShowVolSuggestions(false);

        // Mettre à jour les champs de destination
        if (vol.flight?.originId) {
            const originDest = destinations.find(d => d.id === vol.flight.originId);
            if (originDest) setStartDestinationSearch(originDest.name);
        }
        if (vol.flight?.destinationId) {
            const destDest = destinations.find(d => d.id === vol.flight.destinationId);
            if (destDest) setEndDestinationSearch(destDest.name);
        }
    };

    // Sélection manuelle d'une agence
    const handleAgencySelection = (agency) => {
        setAgencySearch(agency.name);
        setFormData(prev => ({ 
            ...prev, 
            agencyId: agency.id,
            // Réinitialiser la campagne si l'agence change
            campaignId: ''
        }));
        setShowAgencySuggestions(false);
        setTotalPrice(0);
    };

    // Utilitaires
    const getCompanyById = (id) => {
        if (!companies || !companies.length) return 'Unknown';
        const company = companies.find((item) => item.id === parseInt(id));
        return company ? company.name : 'Unknown';
    };

    const getDestinationById = (id) => {
        if (!destinations || !destinations.length) return 'Unknown';
        const destination = destinations.find((item) => item.id === parseInt(id));
        return destination ? destination.country : 'Unknown';
    };

    const getFlightDisplayText = (vol) => {
        if (vol.flight?.name) return vol.flight.name;
        const company = getCompanyById(vol.flight?.companyId);
        const origin = getDestinationById(vol.flight?.originId);
        const destination = getDestinationById(vol.flight?.destinationId);
        return `${company} - ${origin} to ${destination}`;
    };

    // Gestion des champs du formulaire
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "tripType" && value === "one-way" ? { returnVolId: "" } : {}),
        }));
    };

    // Recherche de destinations
    const handleStartDestinationSearch = async (search) => {
        setStartDestinationSearch(search);
        if (search.trim().length > 0) {
            const results = await fetchDestinations(search);
            setStartDestinations(results);
            setShowStartDestinationSuggestions(true);
        } else {
            setStartDestinations([]);
            setShowStartDestinationSuggestions(false);
        }
    };

    const handleEndDestinationSearch = async (search) => {
        setEndDestinationSearch(search);
        if (search.trim().length > 0) {
            const results = await fetchDestinations(search);
            setEndDestinations(results);
            setShowEndDestinationSuggestions(true);
        } else {
            setEndDestinations([]);
            setShowEndDestinationSuggestions(false);
        }
    };

    // Gestion des passagers (restent inchangées)
    const handlePassengerChange = (index, key, value) => {
        setPassengers((prev) =>
            prev.map((passenger, i) => {
                if (i === index) {
                    return {
                        ...passenger,
                        [key]: value,
                        document: passenger.document || [],
                    };
                }
                return passenger;
            })
        );
    };

    const addPassenger = () => {
        setPassengers((prev) => [
            ...prev,
            {
                firstName: '',
                lastName: '',
                gender: '',
                birthDate: '',
                birthPlace: '',
                nationality: '',
                profession: '',
                address: '',
                typePassenger: '',
                document: [],
                status: 'active',
            },
        ]);
    };

    const addDocument = (passengerIndex) => {
        setPassengers((prev) =>
            prev.map((passenger, i) => {
                if (i === passengerIndex) {
                    return {
                        ...passenger,
                        document: [
                            ...(passenger.document || []),
                            { documentType: '', documentNumber: '', expirationDate: '', issueDate: '', files: [] },
                        ],
                    };
                }
                return passenger;
            })
        );
    };

    const removeDocument = (passengerIndex, docIndex) => {
        setPassengers((prevPassengers) => {
            const updatedPassengers = [...prevPassengers];
            updatedPassengers[passengerIndex].document.splice(docIndex, 1);
            return updatedPassengers;
        });
    };

    const handleDocumentChange = (passengerIndex, docIndex, field, value) => {
        setPassengers((prevPassengers) => {
            const updatedPassengers = [...prevPassengers];
            updatedPassengers[passengerIndex].document[docIndex][field] = value;
            return updatedPassengers;
        });
    };

    const handleFileChange = (e, passengerIndex, docIndex) => {
        const files = Array.from(e.target.files);
        setPassengers((prevPassengers) => {
            const updatedPassengers = [...prevPassengers];
            updatedPassengers[passengerIndex].document[docIndex].files = files;
            return updatedPassengers;
        });
    };

    const removePassenger = (index) => {
        const newPassengers = passengers.filter((_, i) => i !== index);
        setPassengers(newPassengers);
    };

    // Soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const encodedPassengers = await Promise.all(passengers.map(async (passenger) => {
                const encodedDocuments = await Promise.all(
                    (passenger.document || []).map(async (doc) => {
                        let base64Files = [];
                        if (doc.files && doc.files.length > 0) {
                            base64Files = await Promise.all(
                                doc.files.map((file) => {
                                    return new Promise((resolve, reject) => {
                                        const reader = new FileReader();
                                        reader.onload = () => resolve({
                                            name: file.name,
                                            type: file.type,
                                            base64: reader.result,
                                        });
                                        reader.onerror = reject;
                                        reader.readAsDataURL(file);
                                    });
                                })
                            );
                        }
                        return {
                            ...doc,
                            files: base64Files,
                        };
                    })
                );
                return {
                    ...passenger,
                    document: encodedDocuments,
                };
            }));

            const payload = {
                ...formData,
                passengers: encodedPassengers,
            };

            console.log('payloadsReservation', payload);
            const response = await reservationService.createReservationCampaign(payload);
            console.log('✔️ Réservation créée avec succès', response.data);
            setLoading(false);
            navigate('/customer/dashboard');
        } catch (err) {
            setLoading(false);
            console.error('❌ Erreur de soumission', err);
            if (err.response) {
                setError(err.response.data.error || 'Une erreur est survenue.');
            } else if (err.request) {
                setError('Le serveur ne répond pas. Vérifiez votre connexion.');
            } else {
                setError('Une erreur inattendue est survenue.');
            }
        }
    };

    // Vérifier si une campagne est sélectionnée
    const selectedCampaign = campaigns.find(c => c.id == formData.campaignId);

    return (
        <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 to-gray-200 shadow-md rounded-lg p-6 mb-8 max-w-7xl mx-auto">
            <div className="md:col-span-1">
                <div className="px-4 sm:px-0">
                    <h3 className="text-lg font-semibold text-gray-900"> Reservation For Campaign </h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Fill in the required details to create a reservation. Ensure all fields are correctly filled.
                    </p>
                </div>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">New Reservation Campaign </h1>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                        {error && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Sélection de campagne - EN PREMIER */}
                      {/* Sélection de campagne - Version responsive */}
<div className="mb-4 md:mb-6">
    {/* En-tête avec label et indicateurs */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 md:mb-3">
        <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-lg flex-shrink-0">
                <FontAwesomeIcon 
                    icon={faPlane} 
                    className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" 
                />
            </div>
            <label className="block text-sm sm:text-base font-medium text-gray-800">
                Campaign Selection
            </label>
        </div>
        
        {/* Indicateurs d'état */}
        <div className="flex items-center gap-2">
            {isSyncing && (
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium animate-pulse">
                    <FontAwesomeIcon icon={faSync} className="w-3 h-3 animate-spin" />
                    <span>Syncing...</span>
                </div>
            )}
            {selectedCampaign && !isSyncing && (
                <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
                    <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" />
                    <span>Synced</span>
                </div>
            )}
        </div>
    </div>
    
    {/* Sélecteur de campagne */}
    <div className="relative group">
        <select
            name="campaignId"
            value={formData.campaignId}
            onChange={(e) => handleCampaignChange(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200 text-sm sm:text-base appearance-none bg-white ${isSyncing 
                ? 'border-blue-300 bg-blue-50 cursor-wait' 
                : 'border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-200 cursor-pointer'
            }`}
            disabled={isSyncing}
            aria-label="Select a campaign"
            aria-describedby="campaign-help"
        >
            <option value="" className="text-gray-400">
                Select a campaign...
            </option>
            {campaigns.map(campaign => (
                <option 
                    key={campaign.id} 
                    value={campaign.id}
                    className="py-2 truncate"
                    title={`${campaign.title} - ${campaign.type} - ${campaign.price} FCFA`}
                >
                    <div className="flex flex-col">
                        <span className="font-medium">{campaign.title}</span>
                        <span className="text-sm text-gray-600">
                            {campaign.type} • {campaign.price.toLocaleString()} FCFA
                            {campaign.agencyDetails && ` • ${campaign.agencyDetails.name}`}
                        </span>
                    </div>
                </option>
            ))}
        </select>
        
        {/* Icône de flèche custom */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <FontAwesomeIcon 
                icon={faPlane} 
                className={`w-4 h-4 ${isSyncing ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-500'}`}
            />
        </div>
    </div>
    
    {/* Message d'aide */}
    <p id="campaign-help" className="text-xs text-gray-500 mt-2 px-1">
        <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 text-green-500 mr-1" />
        Selecting a campaign will automatically fill agency, flight, and start date
    </p>
    
    {/* Aperçu de la campagne sélectionnée */}
    {selectedCampaign && (
        <div className="mt-3 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <div className="flex flex-col md:flex-row md:items-start gap-3">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FontAwesomeIcon 
                            icon={faPlane} 
                            className="text-blue-600 w-5 h-5" 
                        />
                    </div>
                </div>
                
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-800 mb-1 truncate">
                        {selectedCampaign.title}
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                            <span className="font-medium text-gray-600">Type:</span>
                            <span className="text-gray-800">{selectedCampaign.type}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                            <span className="font-medium text-gray-600">Price:</span>
                            <span className="text-green-600 font-bold">
                                {selectedCampaign.price.toLocaleString()} FCFA
                            </span>
                        </div>
                        
                        {selectedCampaign.agencyDetails && (
                            <div className="flex items-center gap-1.5">
                                <span className="font-medium text-gray-600">Agency:</span>
                                <span className="text-blue-600 truncate">
                                    {selectedCampaign.agencyDetails.name}
                                </span>
                            </div>
                        )}
                        
                        {selectedCampaign.volDetails && (
                            <div className="flex items-center gap-1.5">
                                <span className="font-medium text-gray-600">Flight:</span>
                                <span className="text-purple-600 truncate">
                                    {selectedCampaign.volDetails.name}
                                </span>
                            </div>
                        )}
                        
                        {selectedCampaign.startAt && (
                            <div className="flex items-center gap-1.5">
                                <span className="font-medium text-gray-600">Start:</span>
                                <span className="text-gray-800">
                                    {new Date(selectedCampaign.startAt).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        
                        {selectedCampaign.endAt && (
                            <div className="flex items-center gap-1.5">
                                <span className="font-medium text-gray-600">End:</span>
                                <span className="text-gray-800">
                                    {new Date(selectedCampaign.endAt).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {selectedCampaign.description && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                            {selectedCampaign.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )}
    
    {/* État vide - Aucune campagne */}
    {campaigns.length === 0 && !isSyncing && (
        <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-3">
                <FontAwesomeIcon 
                    icon={faPlane} 
                    className="text-yellow-500 w-5 h-5 flex-shrink-0" 
                />
                <div>
                    <p className="text-sm font-medium text-yellow-800">
                        No campaigns available
                    </p>
                    <p className="text-xs text-yellow-600 mt-0.5">
                        There are no active campaigns at the moment.
                    </p>
                </div>
            </div>
        </div>
    )}
</div>

                        {/* Sélection d'agence */}
                        <div className="relative mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faBuilding} className="text-green-500" />
                                    Agency
                                </label>
                                {selectedCampaign && selectedCampaign.agencyDetails && (
                                    <span className="text-xs text-green-600">(Auto-filled from campaign)</span>
                                )}
                            
                            </div>
                            <div className="relative flex items-center">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 text-gray-400" />
                                <input
                                    type="text"
                                    value={agencySearch}
                                    onChange={(e) => setAgencySearch(e.target.value)}
                                    placeholder="Type agency name..."
                                    className={`block w-full p-2 pl-10 border border-gray-300 rounded-md ${selectedCampaign && selectedCampaign.agencyDetails ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    readOnly={!!selectedCampaign && !!selectedCampaign.agencyDetails}
                                />
                            </div>
                            {!selectedCampaign && showAgencySuggestions && agencies.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                                    {agencies.map((agency) => (
                                        <li
                                            key={agency.id}
                                            className="p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                                            onClick={() => handleAgencySelection(agency)}
                                        >
                                            <FontAwesomeIcon icon={faBuilding} className="text-green-500" />
                                            {agency.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Sélection de vol */}
                        <div className="relative mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-500 text-lg" />
                                    Select Flight
                                </label>
                                {selectedCampaign && selectedCampaign.volDetails && (
                                    <span className="text-xs text-green-600">(Auto-filled from campaign)</span>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={volSearch}
                                    onChange={(e) => {
                                        if (!selectedCampaign || !selectedCampaign.volDetails) {
                                            setVolSearch(e.target.value);
                                            setShowVolSuggestions(true);
                                        }
                                    }}
                                    onFocus={() => {
                                        if (!selectedCampaign && vols.length > 0 && volSearch.length > 0) {
                                            setShowVolSuggestions(true);
                                        }
                                    }}
                                    onBlur={() => {
                                        setTimeout(() => setShowVolSuggestions(false), 100);
                                    }}
                                    placeholder={selectedCampaign && selectedCampaign.volDetails ? "Flight auto-selected from campaign" : "Search for a flight..."}
                                    className={`block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 transition-all ${selectedCampaign && selectedCampaign.volDetails ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    readOnly={!!selectedCampaign && !!selectedCampaign.volDetails}
                                />
                                <FontAwesomeIcon
                                    icon={faSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                            </div>
                            {!selectedCampaign && showVolSuggestions && vols.length > 0 && (
                                <div className="flight-suggestions-container">
                                    <ul
                                        className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto animate-fadeIn"
                                        onMouseDown={(e) => e.preventDefault()}
                                    >
                                        {vols.map((vol) => (
                                            <li
                                                key={vol.id}
                                                className="p-3 cursor-pointer hover:bg-blue-50 flex items-center gap-3 transition-all border-b border-gray-100 last:border-b-0"
                                                onClick={() => handleFlightSelection(vol)}
                                            >
                                                <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-500 text-md" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {getCompanyById(vol.flight?.companyId)}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        {getDestinationById(vol.flight?.originId)} → {getDestinationById(vol.flight?.destinationId)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Depart: {formatDate(vol.departureTime)} → Arrival: {formatDate(vol.arrivalTime)}
                                                    </p>
                                                    <p className="text-xs text-green-600 font-semibold">
                                                        Agency: {vol.agency.name} → Price: {vol.price}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {!selectedCampaign && showVolSuggestions && vols.length === 0 && volSearch.trim().length > 0 && (
                                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 p-3">
                                    <p className="text-sm text-gray-500 text-center">No flights found</p>
                                </div>
                            )}
                        </div>

                        {/* Classe */}
                        <div className="relative mb-4">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faPlane} className="text-red-500" />
                                Class
                            </label>
                            <input
                                type="text"
                                value={classSearch}
                                onChange={(e) => handleClassSearch(e.target.value)}
                                placeholder="Type class name..."
                                className="block w-full p-2 border border-gray-300 rounded-md"
                            />
                            {showClassSuggestions && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                                    {filteredClasses.map((cls) => (
                                        <li
                                            key={cls.id}
                                            className="p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                                            onClick={() => {
                                                setFormData((prev) => ({ ...prev, agencyClassId: cls.id }));
                                                setClassSearch(cls.class.name);
                                                setShowClassSuggestions(false);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPlane} className="text-red-500" />
                                            {cls.class.name} - Multiplier: {cls.priceMultiplier}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Type de voyage */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faPlane} className="text-blue-500" />
                                Trip Type
                            </label>
                            <select
                                name="tripType"
                                value={formData.tripType}
                                onChange={handleInputChange}
                                className="block w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="one-way">One-way</option>
                                <option value="round-trip">Round-trip</option>
                            </select>
                        </div>

                        {/* Destinations */}
                        <div className="mb-4 relative">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
                                Depart Location
                            </label>
                            <input
                                type="text"
                                name="startDestinationSearch"
                                value={startDestinationSearch}
                                onChange={(e) => handleStartDestinationSearch(e.target.value)}
                                className="block w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Type to search for a start destination"
                            />
                            {showStartDestinationSuggestions && startDestinations.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                                    {startDestinations.map((destination) => (
                                        <li
                                            key={destination.id}
                                            className="p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                                            onClick={() => {
                                                setStartDestinationSearch(destination.name);
                                                setFormData(prev => ({ ...prev, startDestinationId: destination.id }));
                                                setShowStartDestinationSuggestions(false);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faMapPin} className="text-green-500" />
                                            {destination.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="mb-4 relative">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faMapSigns} className="text-green-500" />
                                Final Destination
                            </label>
                            <input
                                type="text"
                                name="endDestinationSearch"
                                value={endDestinationSearch}
                                onChange={(e) => handleEndDestinationSearch(e.target.value)}
                                className="block w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Type to search for a final destination"
                            />
                            {showEndDestinationSuggestions && endDestinations.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                                    {endDestinations.map((destination) => (
                                        <li
                                            key={destination.id}
                                            className="p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                                            onClick={() => {
                                                setEndDestinationSearch(destination.name);
                                                setFormData(prev => ({ ...prev, endDestinationId: destination.id }));
                                                setShowEndDestinationSuggestions(false);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faMapPin} className="text-green-500" />
                                            {destination.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Prix total */}
                        <div className="mt-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faDollarSign} className="text-yellow-500" />
                            <p className="text-lg font-semibold">
                                Total Price: {totalPrice || 0} FCFA
                            </p>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-green-500" />
                                    Start Date {selectedCampaign && <span className="text-xs text-gray-500">(Auto-filled from campaign)</span>}
                                </label>
                                <input
                                    type="date"
                                    name="startAt"
                                    value={formData.startAt}
                                    onChange={handleInputChange}
                                    required
                                    readOnly={!!selectedCampaign}
                                    className={`${inputClassName} ${selectedCampaign ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Date</label>
                                <input
                                    type="date"
                                    name="endAt"
                                    value={formData.endAt}
                                    onChange={handleInputChange}
                                    required
                                     readOnly={!!selectedCampaign}
                                    className={`${inputClassName} ${selectedCampaign ? 'bg-gray-100 cursor-not-allowed' : ''}`}

                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className={inputClassName}
                            ></textarea>
                        </div>

                        {/* Section passagers (inchangée) */}
                        <div className="border-t border-gray-200 mt-6"></div>
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-medium text-gray-900">Passengers</h4>
                                <button
                                    type="button"
                                    onClick={addPassenger}
                                    className="inline-flex items-center px-3 py-2 border border-transparent
 text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                                >
                                    +  Passenger
                                </button>
                            </div>

                            {passengers.map((passenger, index) => (
                                <div key={index} className="border-t border-gray-200 pt-6 mt-6 bg-white rounded-xl shadow-lg p-6 md:p-8">
                                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                        <FontAwesomeIcon icon={faUser} className="text-indigo-500" />
                                        Passenger {index + 1}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* ... Champs passager ... */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <FontAwesomeIcon icon={faSignature} className="mr-2 text-blue-500" />
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                value={passenger.firstName}
                                                onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                                                className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm p-2"
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <FontAwesomeIcon icon={faSignature} className="mr-2 text-blue-500" />
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                value={passenger.lastName}
                                                onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                                                className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm p-2"
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <FontAwesomeIcon icon={faVenusMars} className="mr-2 text-purple-500" />
                                                Gender
                                            </label>
                                            <select
                                                value={passenger.gender}
                                                onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                                                className="border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm p-2"
                                            >
                                                <option value="">Select gender</option>
                                                <option value="feminin">Feminin</option>
                                                <option value="masculin">Masculin</option>
                                                <option value="autres">Autres</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-green-500" />
                                                Birth Date
                                            </label>
                                            <input
                                                type="date"
                                                value={passenger.birthDate}
                                                onChange={(e) => handlePassengerChange(index, 'birthDate', e.target.value)}
                                                className="border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Type of Passenger
                                            </label>
                                            <select
                                                value={passenger.typePassenger}
                                                onChange={(e) => handlePassengerChange(index, "typePassenger", e.target.value)}
                                                className="border-gray-300 rounded-lg block w-full p-2"
                                            >
                                                <option value="">Select Type</option>
                                                <option value="ADLT">Adult (ADLT)</option>
                                                <option value="CHD">Child (CHD)</option>
                                                <option value="INF">Infant (INF)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Documents */}
                                    <div className="mt-6">
                                        <h5 className="text-md font-medium text-gray-900 mb-4">Documents</h5>
                                        {passenger.document.map((doc, docIndex) => (
                                            <div key={docIndex} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-4 bg-gray-50 rounded-lg shadow-sm mb-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Document Type
                                                    </label>
                                                    <select
                                                        value={doc.documentType}
                                                        onChange={(e) => handleDocumentChange(index, docIndex, 'documentType', e.target.value)}
                                                        className="border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm px-4 py-2"
                                                    >
                                                        <option value="">Select Document Type</option>
                                                        <option value="passport">Passport</option>
                                                        <option value="acte_naissance">Acte de Naissance</option>
                                                        <option value="permis">Permis</option>
                                                        <option value="autres">Autres</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Document Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={doc.documentNumber}
                                                        onChange={(e) => handleDocumentChange(index, docIndex, 'documentNumber', e.target.value)}
                                                        className="border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm px-4 py-2"
                                                        placeholder="e.g., 123456789"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                                                    <input
                                                        type="date"
                                                        value={doc.issueDate}
                                                        onChange={(e) => handleDocumentChange(index, docIndex, "issueDate", e.target.value)}
                                                        className="border-gray-300 rounded-lg block w-full p-2"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                                                    <input
                                                        type="date"
                                                        value={doc.expirationDate}
                                                        onChange={(e) => handleDocumentChange(index, docIndex, "expirationDate", e.target.value)}
                                                        className="border-gray-300 rounded-lg block w-full p-2"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        File
                                                    </label>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        onChange={(e) => handleFileChange(e, index, docIndex)}
                                                        className="border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm px-4 py-2"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDocument(index, docIndex)}
                                                    className="text-sm text-red-600 hover:text-red-800 mt-4 md:mt-0"
                                                >
                                                    Remove Document
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addDocument(index)}
                                            className="mt-2 inline-flex items-center px-3 py-2 border border-transparent
 text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                                        >
                                            + Documents
                                        </button>
                                    </div>

                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removePassenger(index)}
                                            className="mt-4 text-sm text-red-600 hover:text-red-900"
                                        >
                                            Remove Passenger
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                            <button
                                type="submit"
                                disabled={loading || isSyncing}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm
 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700
 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Create Reservation'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateReservationCampaign;
