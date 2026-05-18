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
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faCog,
  faTimes,
  faPlus,
  faTrash,
  faArrowLeft,
  faGlobe,
  faIdCard,
  faHome,
  faBriefcase,
  faBaby,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';

const CreateReservationCampaign = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [destinations, setDestinations] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [vols, setVols] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [profile, setProfile] = useState({});
    const [agencySearch, setAgencySearch] = useState('');
    const [volSearch, setVolSearch] = useState('');
    const [classes, setClasses] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [classSearch, setClassSearch] = useState('');
    const [showClassSuggestions, setShowClassSuggestions] = useState(false);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [startDestinationSearch, setStartDestinationSearch] = useState('');
    const [endDestinationSearch, setEndDestinationSearch] = useState('');
    const [startDestinations, setStartDestinations] = useState([]);
    const [endDestinations, setEndDestinations] = useState([]);
    const [showStartDestinationSuggestions, setShowStartDestinationSuggestions] = useState(false);
    const [showEndDestinationSuggestions, setShowEndDestinationSuggestions] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const [showVolSuggestions, setShowVolSuggestions] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showAgencySuggestions, setShowAgencySuggestions] = useState(false);
    
    // États pour la gestion intelligente des vols
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [campaignHasFlight, setCampaignHasFlight] = useState(false);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    
    // États pour le suivi de l'affichage des sections
    const [showVolSection, setShowVolSection] = useState(true);
    const [showDestinationSection, setShowDestinationSection] = useState(true);
    
    const [passengers, setPassengers] = useState([{
        firstName: '',
        lastName: '',
        gender: '',
        birthDate: '',
        birthPlace: '',
        nationality: '',
        profession: '',
        typePassenger: "ADLT",
        address: '',
        phone: '',
        email: '',
        document: [{
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

    // Fonctions utilitaires
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
                agencyDetails: campaign.associatedAgency || null,
                volDetails: campaign.vol || null,
                hasFlight: !!(campaign.volId || campaign.vol?.id)
            }));
            setCampaigns(normalizedCampaigns);
            console.log('Campagnes chargées:', normalizedCampaigns);
        } catch (error) {
            console.error('Failed to fetch campaigns:', error);
        }
    };

    // Fonction pour charger les classes disponibles pour un vol d'agence
    const loadAvailableClasses = async (agencyVolId) => {
        if (!agencyVolId) return;
        
        setLoadingClasses(true);
        try {
            console.log('🔍 Chargement des classes pour le vol:', agencyVolId);
            
            // Récupérer toutes les classes d'agence
            const response = await agencyAssociationService.getAllClassAgencies();
            
            if (response && Array.isArray(response)) {
                // Filtrer les classes qui correspondent à l'agenceVolId
                const classesForFlight = response.filter(cls => 
                    cls.agencyVolId === parseInt(agencyVolId) || 
                    cls.agencyVolId === agencyVolId
                );
                
                console.log(`✅ ${classesForFlight.length} classes trouvées pour ce vol:`, classesForFlight);
                setAvailableClasses(classesForFlight);
                
                // Si des classes sont disponibles, sélectionner la première par défaut
                if (classesForFlight.length > 0) {
                    const defaultClass = classesForFlight[0];
                    setSelectedClass(defaultClass);
                    setClassSearch(defaultClass.class?.name || '');
                    setFormData(prev => ({
                        ...prev,
                        agencyClassId: defaultClass.id
                    }));
                } else {
                    setAvailableClasses([]);
                    setSelectedClass(null);
                    setClassSearch('');
                }
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des classes:', error);
            setAvailableClasses([]);
        } finally {
            setLoadingClasses(false);
        }
    };

    // Gestion du changement de campagne
    const handleCampaignChange = async (campaignId) => {
        if (!campaignId) {
            // Réinitialiser si aucune campagne sélectionnée
            setSelectedCampaign(null);
            setCampaignHasFlight(false);
            setFormData({
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
            setAgencySearch('');
            setVolSearch('');
            setStartDestinationSearch('');
            setEndDestinationSearch('');
            setAvailableClasses([]);
            setTotalPrice(0);
            
            // Afficher les sections par défaut
            setShowVolSection(true);
            setShowDestinationSection(true);
            return;
        }
        
        const campaign = campaigns.find(c => c.id == campaignId);
        if (!campaign) return;
        
        console.log('🎯 Campagne sélectionnée:', campaign);
        setSelectedCampaign(campaign);
        setIsSyncing(true);
        
        try {
            const hasFlight = campaign.hasFlight;
            setCampaignHasFlight(hasFlight);
            
            // Mettre à jour l'affichage des sections selon si la campagne a un vol
            setShowVolSection(hasFlight);
            setShowDestinationSection(hasFlight);
            
            // Mettre à jour l'ID de la campagne
            setFormData(prev => ({
                ...prev,
                campaignId: campaign.id,
                totalPrice: campaign.price
            }));
            
            // Synchroniser l'agence
            if (campaign.agencyId && campaign.agencyDetails) {
                setAgencySearch(campaign.agencyDetails.name);
                setFormData(prev => ({
                    ...prev,
                    agencyId: campaign.agencyId
                }));
                console.log('✅ Agence synchronisée:', campaign.agencyDetails.name);
            }
            
            // Synchroniser les dates
            if (campaign.startAt) {
                const formattedDate = formatDateForInput(campaign.startAt);
                setFormData(prev => ({
                    ...prev,
                    startAt: formattedDate
                }));
            }
            if (campaign.endAt) {
                const formattedDate = formatDateForInput(campaign.endAt);
                setFormData(prev => ({
                    ...prev,
                    endAt: formattedDate
                }));
            }
            
            // CAS 1: La campagne a un vol défini
            if (hasFlight && campaign.volDetails) {
                console.log('✈️ Campagne AVEC vol - synchronisation automatique');
                
                // Afficher les infos du vol
                const volDisplayText = `${campaign.volDetails.name || 'Vol'} - ${getCompanyById(campaign.volDetails.companyId)}`;
                setVolSearch(volDisplayText);
                
                // Mettre à jour le formulaire avec l'ID du vol
                setFormData(prev => ({
                    ...prev,
                    agencyVolId: campaign.volId,
                    companyId: campaign.volDetails.companyId
                }));
                
                // Mettre à jour les destinations
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
                
                // Charger les classes disponibles pour ce vol
                if (campaign.volId) {
                    await loadAvailableClasses(campaign.volId);
                }
            }
            // CAS 2: La campagne n'a PAS de vol défini
            else {
                console.log('ℹ️ Campagne SANS vol - champs cachés');
                // Réinitialiser les champs liés au vol
                setVolSearch('');
                setStartDestinationSearch('');
                setEndDestinationSearch('');
                setAvailableClasses([]);
                setSelectedClass(null);
                setClassSearch('');
                
                setFormData(prev => ({
                    ...prev,
                    agencyVolId: '',
                    startDestinationId: '',
                    endDestinationId: '',
                    companyId: '',
                    agencyClassId: ''
                }));
            }
            
            // Mettre à jour le prix
            setTotalPrice(campaign.price);
            
        } catch (error) {
            console.error('❌ Erreur lors de la synchronisation:', error);
            setError('Erreur lors de la synchronisation des données de la campagne');
        } finally {
            setIsSyncing(false);
        }
    };

    // Charger les vols disponibles pour une agence (pour sélection manuelle)
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

    // Effet pour charger les vols quand l'agence change (uniquement si pas de vol dans campagne)
    useEffect(() => {
        if (formData.agencyId && !campaignHasFlight) {
            fetchVolsForAgency(formData.agencyId);
        }
    }, [formData.agencyId, campaignHasFlight]);

    // Recherche de vols (pour sélection manuelle)
    useEffect(() => {
        const fetchVols = async () => {
            try {
                const response = await agencyAssociationService.getAllFlightAgencies({
                    search: volSearch,
                    agencyId: formData.agencyId,
                    page: 1,
                    limit: 20
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
                setShowVolSuggestions(volsData.length > 0 && volSearch.trim().length > 0);

            } catch (error) {
                console.error('❌ Erreur fetch vols:', error.message);
                setVols([]);
                setShowVolSuggestions(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (volSearch.trim().length > 0 && !campaignHasFlight) {
                fetchVols();
            } else {
                setShowVolSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [volSearch, formData.agencyId, campaignHasFlight]);

    // Sélection manuelle d'un vol
    const handleFlightSelection = async (vol) => {
        console.log('✈️ Vol sélectionné manuellement:', vol);

        setFormData((prev) => ({
            ...prev,
            agencyVolId: vol.id,
            startDestinationId: vol.flight?.originId,
            endDestinationId: vol.flight?.destinationId,
            companyId: vol.flight?.companyId
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

        // Charger les classes pour ce vol sélectionné
        await loadAvailableClasses(vol.id);
        
        // Afficher les sections si elles étaient cachées
        setShowVolSection(true);
        setShowDestinationSection(true);
    };

    // Sélection d'une classe
    const handleClassSelection = (cls) => {
        setSelectedClass(cls);
        setClassSearch(cls.class?.name || '');
        setFormData(prev => ({
            ...prev,
            agencyClassId: cls.id
        }));
        setShowClassSuggestions(false);
    };

    // Autres fonctions de chargement
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

    // Recherche d'agence
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

    const handleAgencySelection = (agency) => {
        setAgencySearch(agency.name);
        setFormData(prev => ({ 
            ...prev, 
            agencyId: agency.id,
            campaignId: '' // Réinitialiser la campagne
        }));
        setShowAgencySuggestions(false);
        setSelectedCampaign(null);
        setCampaignHasFlight(false);
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
        return destination ? destination.name : 'Unknown';
    };

    const getFlightDisplayText = (vol) => {
        if (vol.flight?.name) return vol.flight.name;
        const company = getCompanyById(vol.flight?.companyId);
        const origin = getDestinationById(vol.flight?.originId);
        const destination = getDestinationById(vol.flight?.destinationId);
        return `${company} - ${origin} → ${destination}`;
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

    // Gestion des passagers avec TOUS les attributs
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
                typePassenger: "ADLT",
                address: '',
                phone: '',
                email: '',
                document: [{
                    documentType: '',
                    documentNumber: '',
                    issueDate: '',
                    expirationDate: '',
                    files: null
                }],
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
        if (passengers.length === 1) {
            setError('Au moins un passager est requis');
            return;
        }
        const newPassengers = passengers.filter((_, i) => i !== index);
        setPassengers(newPassengers);
    };

    // Validation avant soumission
    const validateForm = () => {
        if (!formData.agencyId) {
            setError('Veuillez sélectionner une agence');
            return false;
        }
        
        // Validation différente selon que la campagne a un vol ou non
        if (campaignHasFlight) {
            if (!formData.agencyVolId) {
                setError('Erreur: Le vol de la campagne n\'a pas été correctement chargé');
                return false;
            }
        }
        
        if (!formData.startAt || !formData.endAt) {
            setError('Veuillez remplir les dates de voyage');
            return false;
        }
        
        // Vérifier les passagers
        const invalidPassengers = passengers.some(p => !p.firstName || !p.lastName);
        if (invalidPassengers) {
            setError('Veuillez remplir les noms et prénoms de tous les passagers');
            return false;
        }
        
        return true;
    };

    // Soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
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
                finalPrice: totalPrice * passengers.length,
                flightSource: campaignHasFlight ? 'campaign' : 'manual'
            };

            console.log('📤 Envoi de la réservation:', payload);
            const response = await reservationService.createReservationCampaign(payload);
            console.log('✅ Réservation créée avec succès', response.data);
            
            navigate('/customer/dashboard', {
                state: {
                    message: 'Réservation de campagne créée avec succès !',
                    type: 'success'
                }
            });
            
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* En-tête avec navigation */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Retour
                    </button>
                    
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Réservation de Campagne
                        </h1>
                        {selectedCampaign && (
                            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                campaignHasFlight 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {campaignHasFlight ? 'Vol inclus' : 'Vol optionnel'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mt-0.5" />
                        <p className="text-red-700 flex-1">{error}</p>
                        <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                )}

                {isSyncing && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                        <FontAwesomeIcon icon={faSync} spin className="text-blue-500" />
                        <p className="text-blue-700">Synchronisation des données de la campagne...</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formulaire principal */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {/* Sélection de campagne */}
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faPlane} className="text-blue-500" />
                                    1. Sélection de la campagne
                                </h2>
                                
                                <div className="space-y-4">
                                    <select
                                        value={formData.campaignId}
                                        onChange={(e) => handleCampaignChange(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        disabled={isSyncing}
                                    >
                                        <option value="">Choisir une campagne...</option>
                                        {campaigns.map(campaign => (
                                            <option key={campaign.id} value={campaign.id}>
                                                {campaign.title} - {campaign.price.toLocaleString()} FCFA
                                                {campaign.hasFlight ? ' ✈️' : ' (sans vol)'}
                                            </option>
                                        ))}
                                    </select>

                                    {selectedCampaign && (
                                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <FontAwesomeIcon icon={faPlane} className="text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900">{selectedCampaign.title}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">{selectedCampaign.description}</p>
                                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                                        <div>
                                                            <p className="text-xs text-gray-500">Agence</p>
                                                            <p className="font-medium">{selectedCampaign.agencyDetails?.name}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Prix</p>
                                                            <p className="font-bold text-green-600">{selectedCampaign.price.toLocaleString()} FCFA</p>
                                                        </div>
                                                        {selectedCampaign.startAt && (
                                                            <div>
                                                                <p className="text-xs text-gray-500">Début</p>
                                                                <p className="text-sm">{new Date(selectedCampaign.startAt).toLocaleDateString()}</p>
                                                            </div>
                                                        )}
                                                        {selectedCampaign.endAt && (
                                                            <div>
                                                                <p className="text-xs text-gray-500">Fin</p>
                                                                <p className="text-sm">{new Date(selectedCampaign.endAt).toLocaleDateString()}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Informations du voyage */}
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faCog} className="text-gray-500" />
                                    2. Informations du voyage
                                </h2>
                                
                                <div className="space-y-4">
                                    {/* Agence (toujours requise) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Agence *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={agencySearch}
                                                onChange={(e) => setAgencySearch(e.target.value)}
                                                placeholder="Rechercher une agence..."
                                                className={`w-full px-4 py-2 border rounded-lg ${
                                                    selectedCampaign?.agencyDetails 
                                                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
                                                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                                                }`}
                                                readOnly={!!selectedCampaign?.agencyDetails}
                                            />
                                            {!selectedCampaign && showAgencySuggestions && agencies.length > 0 && (
                                                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                    {agencies.map((agency) => (
                                                        <li
                                                            key={agency.id}
                                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                                                            onClick={() => handleAgencySelection(agency)}
                                                        >
                                                            <FontAwesomeIcon icon={faBuilding} className="text-gray-400" />
                                                            {agency.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>

                                    {/* Section Vol - Affichage conditionnel */}
                                    {campaignHasFlight && showVolSection && (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                                <p className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faCheckCircle} />
                                                    Vol inclus dans la campagne
                                                </p>
                                                
                                                <div className="bg-white p-3 rounded border border-green-100">
                                                    <p className="font-medium">{volSearch || 'Vol de la campagne'}</p>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                        <span>Départ: {startDestinationSearch || '?'}</span>
                                                        <FontAwesomeIcon icon={faArrowLeft} className="text-gray-400 text-xs rotate-180" />
                                                        <span>Arrivée: {endDestinationSearch || '?'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Classes - Disponibles pour ce vol */}
                                            {availableClasses.length > 0 && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Classe disponible *
                                                    </label>
                                                    <select
                                                        value={formData.agencyClassId}
                                                        onChange={(e) => {
                                                            const selected = availableClasses.find(c => c.id === parseInt(e.target.value));
                                                            if (selected) {
                                                                setSelectedClass(selected);
                                                                setFormData(prev => ({ ...prev, agencyClassId: selected.id }));
                                                            }
                                                        }}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    >
                                                        <option value="">Sélectionnez une classe</option>
                                                        {availableClasses.map(cls => (
                                                            <option key={cls.id} value={cls.id}>
                                                                {cls.class?.name} - Multiplicateur: {cls.priceMultiplier}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            {loadingClasses && (
                                                <div className="flex items-center gap-2 text-blue-600">
                                                    <FontAwesomeIcon icon={faSync} spin />
                                                    <span>Chargement des classes...</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Section Destinations - Affichage conditionnel */}
                                    {campaignHasFlight && showDestinationSection && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Lieu de départ
                                                </label>
                                                <input
                                                    type="text"
                                                    value={startDestinationSearch}
                                                    onChange={(e) => handleStartDestinationSearch(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                                                    placeholder="Départ"
                                                    readOnly
                                                />
                                            </div>

                                            <div className="relative">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Destination finale
                                                </label>
                                                <input
                                                    type="text"
                                                    value={endDestinationSearch}
                                                    onChange={(e) => handleEndDestinationSearch(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                                                    placeholder="Arrivée"
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Dates */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date de début *
                                            </label>
                                            <input
                                                type="date"
                                                name="startAt"
                                                value={formData.startAt}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date de fin *
                                            </label>
                                            <input
                                                type="date"
                                                name="endAt"
                                                value={formData.endAt}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Type de voyage */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Type de voyage
                                        </label>
                                        <select
                                            name="tripType"
                                            value={formData.tripType}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="one-way">Aller simple</option>
                                            <option value="round-trip">Aller-retour</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Passagers - TOUS LES ATTRIBUTS INCLUS */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faUsers} className="text-indigo-500" />
                                        3. Passagers ({passengers.length})
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={addPassenger}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                        Ajouter un passager
                                    </button>
                                </div>

                                {passengers.map((passenger, index) => (
                                    <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="font-medium text-gray-800 flex items-center gap-2">
                                                <FontAwesomeIcon icon={faUser} className="text-indigo-500" />
                                                Passager {index + 1}
                                                {passenger.typePassenger === "ADLT" && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Adulte</span>}
                                                {passenger.typePassenger === "CHD" && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Enfant</span>}
                                                {passenger.typePassenger === "INF" && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Bébé</span>}
                                            </h3>
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removePassenger(index)}
                                                    className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                    Supprimer
                                                </button>
                                            )}
                                        </div>

                                        {/* Ligne 1: Informations personnelles de base */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faSignature} className="text-blue-500 text-xs" />
                                                    Prénom *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={passenger.firstName}
                                                    onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="Jean"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faSignature} className="text-blue-500 text-xs" />
                                                    Nom *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={passenger.lastName}
                                                    onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="Dupont"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faVenusMars} className="text-purple-500 text-xs" />
                                                    Genre
                                                </label>
                                                <select
                                                    value={passenger.gender}
                                                    onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                >
                                                    <option value="">Sélectionner</option>
                                                    <option value="masculin">Masculin</option>
                                                    <option value="feminin">Féminin</option>
                                                    <option value="autres">Autres</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Ligne 2: Naissance et nationalité */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-green-500 text-xs" />
                                                    Date de naissance
                                                </label>
                                                <input
                                                    type="date"
                                                    value={passenger.birthDate}
                                                    onChange={(e) => handlePassengerChange(index, 'birthDate', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faMapPin} className="text-red-500 text-xs" />
                                                    Lieu de naissance
                                                </label>
                                                <input
                                                    type="text"
                                                    value={passenger.birthPlace}
                                                    onChange={(e) => handlePassengerChange(index, 'birthPlace', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="Paris"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faGlobe} className="text-blue-500 text-xs" />
                                                    Nationalité
                                                </label>
                                                <input
                                                    type="text"
                                                    value={passenger.nationality}
                                                    onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="Française"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faBriefcase} className="text-yellow-600 text-xs" />
                                                    Profession
                                                </label>
                                                <input
                                                    type="text"
                                                    value={passenger.profession}
                                                    onChange={(e) => handlePassengerChange(index, 'profession', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="Ingénieur"
                                                />
                                            </div>
                                        </div>

                                        {/* Ligne 3: Type de passager et coordonnées */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faUserTie} className="text-indigo-500 text-xs" />
                                                    Type de passager *
                                                </label>
                                                <select
                                                    value={passenger.typePassenger}
                                                    onChange={(e) => handlePassengerChange(index, 'typePassenger', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                >
                                                    <option value="ADLT">Adulte (ADLT)</option>
                                                    <option value="CHD">Enfant (CHD)</option>
                                                    <option value="INF">Bébé (INF)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faHome} className="text-gray-500 text-xs" />
                                                    Adresse
                                                </label>
                                                <input
                                                    type="text"
                                                    value={passenger.address}
                                                    onChange={(e) => handlePassengerChange(index, 'address', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="123 Rue de Paris"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faUser} className="text-green-500 text-xs" />
                                                    Téléphone
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={passenger.phone}
                                                    onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="+33 6 12 34 56 78"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faUser} className="text-red-500 text-xs" />
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={passenger.email}
                                                    onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="email@exemple.com"
                                                />
                                            </div>
                                        </div>

                                        {/* Documents */}
                                        <div className="mt-4">
                                            <button
                                                type="button"
                                                onClick={() => addDocument(index)}
                                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-3"
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                                Ajouter un document
                                            </button>

                                            {passenger.document.map((doc, docIndex) => (
                                                <div key={docIndex} className="mt-3 p-3 bg-white rounded border border-gray-200">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                            <FontAwesomeIcon icon={faIdCard} className="text-blue-500" />
                                                            Document {docIndex + 1}
                                                        </h4>
                                                        {docIndex > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeDocument(index, docIndex)}
                                                                className="text-xs text-red-600 hover:text-red-800"
                                                            >
                                                                Supprimer
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                                                        <div>
                                                            <label className="block text-xs text-gray-600 mb-1">Type</label>
                                                            <select
                                                                value={doc.documentType}
                                                                onChange={(e) => handleDocumentChange(index, docIndex, 'documentType', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                            >
                                                                <option value="">Sélectionner</option>
                                                                <option value="passport">Passeport</option>
                                                                <option value="cni">Carte d'identité</option>
                                                                <option value="acte_naissance">Acte de naissance</option>
                                                                <option value="visa">Visa</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-600 mb-1">Numéro</label>
                                                            <input
                                                                type="text"
                                                                value={doc.documentNumber}
                                                                onChange={(e) => handleDocumentChange(index, docIndex, 'documentNumber', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                placeholder="N° document"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-600 mb-1">Date d'émission</label>
                                                            <input
                                                                type="date"
                                                                value={doc.issueDate}
                                                                onChange={(e) => handleDocumentChange(index, docIndex, 'issueDate', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-600 mb-1">Date d'expiration</label>
                                                            <input
                                                                type="date"
                                                                value={doc.expirationDate}
                                                                onChange={(e) => handleDocumentChange(index, docIndex, 'expirationDate', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-600 mb-1">Fichier</label>
                                                            <input
                                                                type="file"
                                                                onChange={(e) => handleFileChange(e, index, docIndex)}
                                                                className="w-full text-sm"
                                                                multiple
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Description */}
                            <div className="p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description (optionnelle)
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ajoutez des informations complémentaires..."
                                />
                            </div>
                        </form>
                    </div>

                    {/* Sidebar avec résumé et actions */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />
                                Résumé
                            </h3>

                            <div className="space-y-4">
                                {/* Prix */}
                                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                    <p className="text-sm text-gray-600 mb-1">Prix total</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {(totalPrice * passengers.length).toLocaleString()} FCFA
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {passengers.length} passager(s) × {totalPrice.toLocaleString()} FCFA
                                    </p>
                                </div>

                                {/* Statut de la campagne */}
                                {selectedCampaign && (
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm font-medium text-blue-800 mb-2">
                                            Campagne: {selectedCampaign.title}
                                        </p>
                                        <div className="space-y-1 text-xs text-blue-600">
                                            <p className="flex items-center gap-1">
                                                <FontAwesomeIcon icon={campaignHasFlight ? faCheckCircle : faInfoCircle} />
                                                {campaignHasFlight ? 'Vol inclus' : 'Vol optionnel'}
                                            </p>
                                            {campaignHasFlight && availableClasses.length > 0 && (
                                                <p>• {availableClasses.length} classe(s) disponible(s)</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading || isSyncing}
                                    className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <FontAwesomeIcon icon={faSync} spin />
                                            Création...
                                        </>
                                    ) : (
                                        'Créer la réservation'
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/customer/dashboard')}
                                    className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>

                                {/* Aide */}
                                <div className="mt-4 text-xs text-gray-500 space-y-1">
                                    <p className="flex items-center gap-1">
                                        <FontAwesomeIcon icon={faInfoCircle} className="text-blue-400" />
                                        Tous les champs marqués * sont obligatoires
                                    </p>
                                    <p className="flex items-center gap-1">
                                        <FontAwesomeIcon icon={faInfoCircle} className="text-blue-400" />
                                        {campaignHasFlight 
                                            ? 'Le vol est automatiquement sélectionné'
                                            : 'Le vol est optionnel pour cette campagne'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateReservationCampaign;
