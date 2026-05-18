import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agencyService } from '../../../services/agencyService';
import { companyService } from '../../../services/companyService';
import { customerService } from '../../../services/customerService';
import { destinationService } from '../../../services/destinationService';
import { agencyAssociationService } from '../../../services/agencyAssociationService';
import { reservationService } from '../../../services/reservationService';
import { pricingRuleService } from '../../../services/pricingRuleService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faBuilding,
  faSearch,
  faArrowLeft,
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
  faFilter,
  faInfoCircle,
  faExchangeAlt,
  faClock,
  faTimes,
  faCog,
  faCheckCircle,
  faBaby,
  faChild,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';
const CreateReservation = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // États pour les destinations
    const [destinations, setDestinations] = useState([]);
    const [startDestinationSearch, setStartDestinationSearch] = useState('');
    const [endDestinationSearch, setEndDestinationSearch] = useState('');
    const [startDestinations, setStartDestinations] = useState([]);
    const [endDestinations, setEndDestinations] = useState([]);
    const [showStartDestinationSuggestions, setShowStartDestinationSuggestions] = useState(false);
    const [showEndDestinationSuggestions, setShowEndDestinationSuggestions] = useState(false);
    
    // États pour les règles de prix
    const [pricingRules, setPricingRules] = useState([]);
    const [filteredRules, setFilteredRules] = useState([]);
    
    // Autres états
    const [companies, setCompanies] = useState([]);
    const [vols, setVols] = useState([]);
    const [filteredVols, setFilteredVols] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [filteredAgencies, setFilteredAgencies] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [profile, setProfile] = useState({});
    const [agencySearch, setAgencySearch] = useState('');
    const [volSearch, setVolSearch] = useState('');
    const [classAgencies, setClassAgencies] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [showAgencySuggestions, setShowAgencySuggestions] = useState(false);
    const [showVolSuggestions, setShowVolSuggestions] = useState(false);
    
    // États de sélection
    const [selectedAgency, setSelectedAgency] = useState(null);
    const [selectedFlightAgency, setSelectedFlightAgency] = useState(null);
    const [selectedClassAgency, setSelectedClassAgency] = useState(null);
    const [showAllAgencyFlights, setShowAllAgencyFlights] = useState(false);
    const [agencyVolCount, setAgencyVolCount] = useState(0);
    const [allVols, setAllVols] = useState([]);
    const [basePrice, setBasePrice] = useState(0);

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
        typePassenger: "ADLT", // ADLT, CHD, INF
        address: '',
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

    const formatDate = (dateString) => {
        if (!dateString) return 'Non spécifiée';
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Calcul de la durée du vol
    const calculateFlightDuration = (departureTime, arrivalTime) => {
        if (!departureTime || !arrivalTime) return null;
        const departure = new Date(departureTime);
        const arrival = new Date(arrivalTime);
        const diffMs = arrival - departure;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${diffHours}h ${diffMinutes}min`;
    };

    // Récupérer le libellé du type de passager
    const getPassengerTypeLabel = (type) => {
        const types = {
            'ADLT': { label: 'Adulte', icon: faUserTie, color: 'blue' },
            'CHD': { label: 'Enfant (2-12 ans)', icon: faChild, color: 'green' },
            'INF': { label: 'Bébé (0-2 ans)', icon: faBaby, color: 'purple' }
        };
        return types[type] || { label: type, icon: faUser, color: 'gray' };
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchDestinations(),
                    fetchCompanies(),
                    fetchProfile(),
                    fetchCustomers(),
                    fetchAllVols(),
                    fetchAllAgencies(),
                    fetchClassAgencies(),
                    fetchPricingRules() // Nouvelle fonction
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

    // Récupérer toutes les règles de prix
    const fetchPricingRules = async () => {
        try {
            const response = await pricingRuleService.getAllPricingRules();
            console.log('📋 Règles de prix chargées:', response);
            setPricingRules(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('❌ Erreur lors du chargement des règles de prix:', error);
        }
    };

    // Récupérer toutes les ClassAgency
    const fetchClassAgencies = async () => {
        try {
            const response = await agencyAssociationService.getAllClassAgencies();
            console.log('📦 ClassAgencies chargées:', response);
            setClassAgencies(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('❌ Erreur lors du chargement des ClassAgency:', error);
        }
    };

    // Récupérer toutes les agences
    const fetchAllAgencies = async () => {
        try {
            const response = await agencyService.getAgencies({
                search: '',
                status: 'active',
                page: 1,
                limit: 1000
            });

            let agenciesData = [];
            if (response.data && response.data.success) {
                agenciesData = response.data.data;
            } else if (Array.isArray(response.data)) {
                agenciesData = response.data;
            } else if (Array.isArray(response.data?.data)) {
                agenciesData = response.data.data;
            }

            console.log(`🏢 ${agenciesData.length} agences chargées`);
            setAgencies(agenciesData);
            setFilteredAgencies(agenciesData);
        } catch (error) {
            console.error('❌ Erreur lors du chargement des agences:', error);
            setAgencies([]);
            setFilteredAgencies([]);
        }
    };

    // Récupérer tous les vols agence
    const fetchAllVols = async () => {
        try {
            const response = await agencyAssociationService.getAllFlightAgencies({
                search: '',
                page: 1,
                limit: 1000
            });

            let volsData = [];
            if (response.data?.success && Array.isArray(response.data.data)) {
                volsData = response.data.data;
            } else if (Array.isArray(response.data?.data)) {
                volsData = response.data.data;
            } else if (Array.isArray(response.data)) {
                volsData = response.data;
            }

            setAllVols(volsData);
            console.log(`📦 ${volsData.length} vols agence chargés`);
        } catch (error) {
            console.error('❌ Erreur lors du chargement des vols agence:', error);
        }
    };

    // Filtrage des agences par nom
    useEffect(() => {
        if (agencySearch.trim() === '') {
            setFilteredAgencies(agencies);
            setShowAgencySuggestions(false);
        } else {
            const searchTerm = agencySearch.toLowerCase().trim();
            const filtered = agencies.filter(agency => 
                agency.name.toLowerCase().startsWith(searchTerm)
            );
            setFilteredAgencies(filtered);
            setShowAgencySuggestions(filtered.length > 0);
        }
    }, [agencySearch, agencies]);

    // Filtrage des vols quand une agence est sélectionnée
    useEffect(() => {
        if (!selectedAgency) {
            setFilteredVols([]);
            setVols([]);
            return;
        }

        const agencyVols = allVols.filter(vol => 
            vol.agency && vol.agency.id === selectedAgency.id
        );
        
        const otherAgencyVols = allVols.filter(vol => 
            vol.agency && vol.agency.id !== selectedAgency.id
        );

        setAgencyVolCount(agencyVols.length);
        
        if (agencyVols.length > 0 && !showAllAgencyFlights) {
            setFilteredVols(agencyVols);
            setVols(agencyVols);
        } else {
            setFilteredVols(otherAgencyVols);
            setVols(otherAgencyVols);
        }
    }, [selectedAgency, showAllAgencyFlights, allVols]);

    // Filtrage des vols par recherche
    useEffect(() => {
        if (volSearch.length > 0) {
            const searchLower = volSearch.toLowerCase();
            const filtered = filteredVols.filter(vol => {
                const flightName = vol.flight?.name?.toLowerCase() || '';
                const companyName = getCompanyById(vol.flight?.companyId)?.toLowerCase() || '';
                const origin = getDestinationById(vol.flight?.originId)?.toLowerCase() || '';
                const destination = getDestinationById(vol.flight?.destinationId)?.toLowerCase() || '';
                const agencyName = vol.agency?.name?.toLowerCase() || '';
                
                return flightName.includes(searchLower) ||
                       companyName.includes(searchLower) ||
                       origin.includes(searchLower) ||
                       destination.includes(searchLower) ||
                       agencyName.includes(searchLower);
            });
            setVols(filtered);
            setShowVolSuggestions(filtered.length > 0 && volSearch.trim().length > 0);
        } else {
            setVols(filteredVols);
            setShowVolSuggestions(false);
        }
    }, [volSearch, filteredVols]);

    // Filtrage des ClassAgency pour la classe sélectionnée
       useEffect(() => {
    if (selectedFlightAgency) {
        console.log('🎯 Vol sélectionné ID:', selectedFlightAgency.id);
        console.log('📦 Toutes les ClassAgencies:', classAgencies);
        
        // CORRECTION: Utiliser agencyVol.id pour filtrer
        const availableClasses = classAgencies.filter(ca => {
            // Vérifier si agencyVol existe et son id correspond au vol sélectionné
            return ca.agencyVol?.id === selectedFlightAgency.id && ca.status === 'active';
        });
        
        console.log(`🔍 ${availableClasses.length} classes disponibles trouvées:`, availableClasses);
        setFilteredClasses(availableClasses);
        
        // Réinitialiser la classe sélectionnée si elle n'est plus disponible
        if (selectedClassAgency && !availableClasses.some(c => c.id === selectedClassAgency.id)) {
            setSelectedClassAgency(null);
            setFormData(prev => ({ ...prev, agencyClassId: '' }));
        }
    } else {
        setFilteredClasses([]);
    }
}, [selectedFlightAgency, classAgencies]);

// ============================================
// FILTRAGE DES RÈGLES DE PRIX - CORRIGÉ
// ============================================
useEffect(() => {
    if (selectedClassAgency) {
        console.log('📋 Classe sélectionnée ID:', selectedClassAgency.id);
        
        // CORRECTION: Filtrer les règles par agencyClassId (l'ID de ClassAgency)
        const rules = pricingRules.filter(rule => 
            rule.agencyClassId === selectedClassAgency.id
        );
        
        setFilteredRules(rules);
        console.log('📊 Règles de prix pour cette classe:', rules);
    } else {
        setFilteredRules([]);
    }
}, [selectedClassAgency, pricingRules]);

    // Calcul du prix de base (vol aller)
    useEffect(() => {
        if (selectedFlightAgency && selectedClassAgency) {
            const price = parseFloat(selectedClassAgency.price) || 0;
            setBasePrice(price);
        } else {
            setBasePrice(0);
        }
    }, [selectedFlightAgency, selectedClassAgency]);

    // CORRECTION: Calcul du prix total avec gestion des types de passagers
    // ============================================
// CALCUL DU PRIX AVEC PRICINGRULES - CORRIGÉ
// ============================================
useEffect(() => {
    const calculateTotalPrice = () => {
        console.log('🧮 Calcul du prix total...');
        
        if (!selectedFlightAgency || !selectedClassAgency) {
            setTotalPrice(0);
            return;
        }

        // Prix de base de la classe (pour un adulte)
        const adultBasePrice = parseFloat(selectedClassAgency.price) || 0;
        console.log('💰 Prix base adulte:', adultBasePrice);
        console.log('📋 Classe sélectionnée ID:', selectedClassAgency.id);

        // Filtrer les règles pour cette classe spécifique
        const rulesForThisClass = pricingRules.filter(rule => 
            rule.agencyClassId === selectedClassAgency.id
        );
        
        console.log('📊 Règles pour cette classe:', rulesForThisClass);

        // Créer un map pour un accès rapide aux règles par type de passager
        const rulesMap = {};
        rulesForThisClass.forEach(rule => {
            rulesMap[rule.typePassenger] = parseFloat(rule.price) || 0;
        });
        console.log('🗺️ Map des règles:', rulesMap);

        // Calcul du prix aller
        let totalPrice = 0;
        
        passengers.forEach(passenger => {
            const passengerType = passenger.typePassenger;
            
            if (passengerType === 'ADLT') {
                // Adulte : prix normal de la classe
                totalPrice += adultBasePrice;
                console.log('👤 Adulte: +', adultBasePrice);
            } else {
                // Enfant (CHD) ou Bébé (INF) : chercher une règle spécifique
                const rulePrice = rulesMap[passengerType];
                
                if (rulePrice) {
                    totalPrice += rulePrice;
                    console.log(`🧒 ${passengerType}: +${rulePrice} (règle trouvée)`);
                } else {
                    // Pas de règle, utiliser le prix adulte
                    totalPrice += adultBasePrice;
                    console.log(`⚠️ ${passengerType}: +${adultBasePrice} (pas de règle)`);
                }
            }
        });

        console.log('💰 Prix après aller:', totalPrice);

        // Si aller-retour
        if (formData.tripType === 'round-trip' && formData.returnVolId) {
            console.log('🔄 Traitement aller-retour avec returnVolId:', formData.returnVolId);
            
            // Chercher la classe pour le vol retour
            const returnClassAgency = classAgencies.find(ca => 
                ca.agencyVol?.id === parseInt(formData.returnVolId) && 
                ca.classId === selectedClassAgency.classId
            );
            
            if (returnClassAgency) {
                const returnBasePrice = parseFloat(returnClassAgency.price) || 0;
                console.log('💰 Prix retour trouvé:', returnBasePrice);
                
                // Récupérer les règles pour la classe retour
                const returnRules = pricingRules.filter(rule => 
                    rule.agencyClassId === returnClassAgency.id
                );
                
                const returnRulesMap = {};
                returnRules.forEach(rule => {
                    returnRulesMap[rule.typePassenger] = parseFloat(rule.price) || 0;
                });
                
                // Ajouter le prix retour pour chaque passager
                passengers.forEach(passenger => {
                    const passengerType = passenger.typePassenger;
                    
                    if (passengerType === 'ADLT') {
                        totalPrice += returnBasePrice;
                        console.log('🔄 Retour adulte: +', returnBasePrice);
                    } else {
                        const rulePrice = returnRulesMap[passengerType];
                        if (rulePrice) {
                            totalPrice += rulePrice;
                            console.log(`🔄 Retour ${passengerType}: +${rulePrice} (règle)`);
                        } else {
                            totalPrice += returnBasePrice;
                            console.log(`🔄 Retour ${passengerType}: +${returnBasePrice} (pas de règle)`);
                        }
                    }
                });
            } else {
                console.log('⚠️ Aucune classe trouvée pour le vol retour');
                // Fallback: ajouter le même prix que l'aller
                passengers.forEach(passenger => {
                    totalPrice += adultBasePrice;
                });
            }
        }

        console.log('💰 PRIX TOTAL FINAL:', totalPrice);
        setTotalPrice(totalPrice);
        setFormData(prev => ({ ...prev, totalPrice: totalPrice }));
    };

    calculateTotalPrice();
}, [selectedFlightAgency, selectedClassAgency, passengers, formData.tripType, formData.returnVolId, classAgencies, pricingRules]);
    
    const handleAgencySelection = (agency) => {
        setSelectedAgency(agency);
        setAgencySearch(agency.name);
        setFormData(prev => ({ ...prev, agencyId: agency.id }));
        setShowAgencySuggestions(false);
        
        // Réinitialiser les sélections
        setVolSearch('');
        setSelectedFlightAgency(null);
        setSelectedClassAgency(null);
        setFormData(prev => ({
            ...prev,
            agencyVolId: '',
            startAt: '',
            agencyClassId: ''
        }));
        
        setShowAllAgencyFlights(false);
    };

    const handleFlightSelection = (vol) => {
        console.log('✈️ Vol sélectionné:', vol);

        setSelectedFlightAgency(vol);
        setFormData(prev => ({
            ...prev,
            agencyVolId: vol.id,
            startDestinationId: vol.flight?.originId || '',
            endDestinationId: vol.flight?.destinationId || '',
            startAt: vol.departureTime ? formatDateForInput(vol.departureTime) : ''
        }));

        const displayText = vol.flight?.name || 
            `${getCompanyById(vol.flight?.companyId)} - ${getDestinationById(vol.flight?.originId)} to ${getDestinationById(vol.flight?.destinationId)}`;
        
        setVolSearch(displayText);
        setShowVolSuggestions(false);

        // Mettre à jour les suggestions de destination
        if (vol.flight?.originId) {
            const originDest = destinations.find(d => d.id === vol.flight.originId);
            if (originDest) {
                setStartDestinationSearch(originDest.name);
                setFormData(prev => ({ ...prev, startDestinationId: originDest.id }));
            }
        }
        if (vol.flight?.destinationId) {
            const destDest = destinations.find(d => d.id === vol.flight.destinationId);
            if (destDest) {
                setEndDestinationSearch(destDest.name);
                setFormData(prev => ({ ...prev, endDestinationId: destDest.id }));
            }
        }
    };

    const handleClassSelection = (classAgency) => {
        console.log('🎫 Classe sélectionnée:', classAgency);
        setSelectedClassAgency(classAgency);
        setFormData(prev => ({ ...prev, agencyClassId: classAgency.id }));
    };

    const toggleFlightDisplay = () => {
        setShowAllAgencyFlights(!showAllAgencyFlights);
        setVolSearch('');
    };

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

    const handleStartDestinationSelect = (destination) => {
        setStartDestinationSearch(destination.name);
        setFormData(prev => ({ ...prev, startDestinationId: destination.id }));
        setShowStartDestinationSuggestions(false);
    };

    const handleEndDestinationSelect = (destination) => {
        setEndDestinationSearch(destination.name);
        setFormData(prev => ({ ...prev, endDestinationId: destination.id }));
        setShowEndDestinationSuggestions(false);
    };

    const fetchDestinations = async (search = '') => {
        try {
            const response = await destinationService.getDestinations({ search });
            const data = Array.isArray(response) ? response : [];
            setDestinations(data);
            return data;
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

    const getCompanyById = (id) => {
        if (!companies || !companies.length) return '';
        const company = companies.find((item) => item.id === parseInt(id));
        return company ? company.name : '';
    };

    const getDestinationById = (id) => {
        if (!destinations || !destinations.length) return '';
        const destination = destinations.find((item) => item.id === parseInt(id));
        return destination ? destination.name : '';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            if (name === "tripType") {
                if (value === "one-way") {
                    return {
                        ...prev,
                        [name]: value,
                        returnVolId: "",
                        endAt: ""
                    };
                } else {
                    return {
                        ...prev,
                        [name]: value
                    };
                }
            }
            return { ...prev, [name]: value };
        });
    };

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
                typePassenger: 'ADLT',
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
                            { documentType: '', documentNumber: '', expirationDate: "", issueDate: "", files: [] },
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // Validation
        if (!selectedAgency) {
            setError('Veuillez sélectionner une agence');
            setLoading(false);
            return;
        }

        if (!selectedFlightAgency) {
            setError('Veuillez sélectionner un vol');
            setLoading(false);
            return;
        }

        if (!selectedClassAgency) {
            setError('Veuillez sélectionner une classe');
            setLoading(false);
            return;
        }

        if (!formData.startAt) {
            setError('La date de départ est requise');
            setLoading(false);
            return;
        }

        if (formData.tripType === 'round-trip' && !formData.endAt) {
            setError('La date de retour est requise pour un aller-retour');
            setLoading(false);
            return;
        }

        try {
            // Encodage des fichiers en base64
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

            const cleanedFormData = {
                ...formData,
                agencyId: selectedAgency.id,
                agencyVolId: selectedFlightAgency.id,
                agencyClassId: selectedClassAgency.id,
                endAt: formData.tripType === 'one-way' ? null : formData.endAt,
                returnVolId: formData.tripType === 'one-way' ? null : formData.returnVolId,
                totalPrice: totalPrice
            };

            const payload = {
                ...cleanedFormData,
                passengers: encodedPassengers,
            };

            console.log('📝 Données de réservation:', payload);
            const response = await reservationService.createReservation(payload);
            console.log('✅ Réservation créée avec succès', response.data);

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

    return (
        <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 to-gray-200 shadow-md rounded-lg p-6 mb-8 max-w-7xl mx-auto">
            <button
                onClick={() => navigate('/customer/reservations')}
                className="mb-6 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
                <FontAwesomeIcon icon={faArrowLeft} />
                Retour aux réservations
            </button>

            <div className="md:col-span-1">
                <div className="px-4 sm:px-0">
                    <h3 className="text-lg font-semibold text-gray-900">Nouvelle Réservation</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Remplissez les informations nécessaires pour créer une réservation.
                    </p>
                </div>
            </div>

            <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Nouvelle Réservation</h1>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                        {/* Section Agence (inchangée) */}
                        <div className="relative mb-4">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faBuilding} className="text-green-500" />
                                Agence
                            </label>

                            <div className="relative flex items-center">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 text-gray-400" />
                                <input
                                    type="text"
                                    value={agencySearch}
                                    onChange={(e) => setAgencySearch(e.target.value)}
                                    onFocus={() => {
                                        if (filteredAgencies.length > 0 && agencySearch.trim().length > 0) {
                                            setShowAgencySuggestions(true);
                                        }
                                    }}
                                    onBlur={() => {
                                        setTimeout(() => setShowAgencySuggestions(false), 200);
                                    }}
                                    placeholder="Tapez le nom de l'agence..."
                                    className="block w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />

                                {agencySearch && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAgencySearch('');
                                            setShowAgencySuggestions(false);
                                        }}
                                        className="absolute right-3 text-gray-400 hover:text-gray-600"
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                )}
                            </div>

                            {showAgencySuggestions && filteredAgencies.length > 0 && (
                                <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                                    <div className="p-2 bg-gray-50 border-b border-gray-200">
                                        <p className="text-xs font-medium text-gray-600">
                                            {filteredAgencies.length} agence(s) trouvée(s)
                                        </p>
                                    </div>
                                    {filteredAgencies.map((agency) => (
                                        <li
                                            key={agency.id}
                                            className={`p-3 cursor-pointer hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-all ${
                                                selectedAgency?.id === agency.id ? 'bg-green-50' : ''
                                            }`}
                                            onClick={() => handleAgencySelection(agency)}
                                            onMouseDown={(e) => e.preventDefault()}
                                        >
                                            <div className="flex items-start gap-3">
                                                <FontAwesomeIcon 
                                                    icon={faBuilding} 
                                                    className={`mt-1 ${
                                                        selectedAgency?.id === agency.id ? 'text-green-500' : 'text-gray-400'
                                                    }`}
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-800">
                                                        {agency.name}
                                                        {selectedAgency?.id === agency.id && (
                                                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                                Sélectionnée
                                                            </span>
                                                        )}
                                                    </div>
                                                    {agency.description && (
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                            {agency.description}
                                                        </p>
                                                    )}
                                                    <div className="mt-2 flex items-center gap-3">
                                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                                            agency.status === 'active' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {agency.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {selectedAgency && (
                                <div className="mt-3 p-3 bg-green-50 rounded-md border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faBuilding} className="text-green-600" />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        Agence sélectionnée: <span className="text-green-700">{selectedAgency.name}</span>
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                                            selectedAgency.status === 'active' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {selectedAgency.status}
                                                        </span>
                                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                                            {agencyVolCount} vol(s) disponible(s)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {agencyVolCount === 0 && (
                                            <button
                                                type="button"
                                                onClick={toggleFlightDisplay}
                                                className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center gap-1"
                                            >
                                                <FontAwesomeIcon icon={faExchangeAlt} />
                                                {showAllAgencyFlights ? 'Voir les vols de l\'agence' : 'Voir autres agences'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section Vols */}
                        <div className="relative mb-4">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-500 text-lg" />
                                Sélectionner un vol
                                {selectedAgency && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        {showAllAgencyFlights ? 'Autres agences' : selectedAgency.name}
                                    </span>
                                )}
                            </label>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={volSearch}
                                    onChange={(e) => {
                                        setVolSearch(e.target.value);
                                        if (e.target.value.trim().length > 0) {
                                            setShowVolSuggestions(true);
                                        }
                                    }}
                                    onFocus={() => {
                                        if (vols.length > 0) {
                                            setShowVolSuggestions(true);
                                        }
                                    }}
                                    placeholder="Rechercher un vol..."
                                    className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
                                    disabled={!selectedAgency}
                                />
                                <FontAwesomeIcon
                                    icon={faSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                            </div>

                            {!selectedAgency && (
                                <p className="mt-1 text-sm text-yellow-600">
                                    Veuillez d'abord sélectionner une agence
                                </p>
                            )}

                            {selectedAgency && agencyVolCount === 0 && !showAllAgencyFlights && (
                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <p className="text-sm text-yellow-700 mb-2">
                                        Cette agence n'a pas de vols disponibles.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={toggleFlightDisplay}
                                        className="text-sm px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 flex items-center gap-2"
                                    >
                                        <FontAwesomeIcon icon={faFilter} />
                                        Voir les vols des autres agences
                                    </button>
                                </div>
                            )}

                            {showVolSuggestions && vols.length > 0 && (
                                <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                                    {vols.map((vol) => (
                                        <li
                                            key={vol.id}
                                            className="p-3 cursor-pointer hover:bg-blue-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                                            onClick={() => handleFlightSelection(vol)}
                                            onMouseDown={(e) => e.preventDefault()}
                                        >
                                            <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-500 text-md" />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">
                                                            {getCompanyById(vol.flight?.companyId) || 'Compagnie inconnue'}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            {getDestinationById(vol.flight?.originId) || 'Inconnu'} → 
                                                            {getDestinationById(vol.flight?.destinationId) || 'Inconnu'}
                                                        </p>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        vol.agency?.id === selectedAgency?.id 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {vol.agency?.name}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <p className="text-xs text-gray-500">
                                                        <FontAwesomeIcon icon={faClock} className="mr-1" />
                                                        Durée: {calculateFlightDuration(vol.departureTime, vol.arrivalTime) || 'N/A'}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-blue-600 mt-1">
                                                    Départ: {formatDateForInput(vol.departureTime)}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Sélection de la classe */}
                        <div className="relative mb-4">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faCog} className="text-purple-500" />
                                Sélectionner une classe
                            </label>

                            {!selectedFlightAgency ? (
                                <p className="mt-1 text-sm text-yellow-600">
                                    Veuillez d'abord sélectionner un vol
                                </p>
                            ) : filteredClasses.length === 0 ? (
                                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <p className="text-sm text-yellow-700">
                                        Aucune classe disponible pour ce vol
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-2 grid grid-cols-1 gap-2">
                                    {filteredClasses.map((classAgency) => (
                                        <div
                                            key={classAgency.id}
                                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                                selectedClassAgency?.id === classAgency.id
                                                    ? 'border-purple-500 bg-purple-50'
                                                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                                            }`}
                                            onClick={() => handleClassSelection(classAgency)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FontAwesomeIcon 
                                                        icon={faCog} 
                                                        className={selectedClassAgency?.id === classAgency.id ? 'text-purple-600' : 'text-gray-400'}
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-800">
                                                            {classAgency.class?.name || 'Classe inconnue'}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Prix adulte: <span className="font-bold text-green-600">{classAgency.price} FCFA</span>
                                                        </p>
                                                        {/* Afficher les règles pour enfants/bébés */}
                                                        {filteredRules.length > 0 && (
                                                            <div className="mt-1 text-xs text-gray-500">
                                                                {filteredRules.map((rule, idx) => (
                                                                    <span key={idx} className="mr-2">
                                                                        {rule.typePassenger === 'CHD' ? '👶 Enfant' : '🍼 Bébé'}: {rule.price} FCFA
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {selectedClassAgency?.id === classAgency.id && (
                                                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Date de départ */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-green-500" />
                                Date de départ
                            </label>
                            <input
                                type="date"
                                name="startAt"
                                value={formData.startAt}
                                onChange={handleInputChange}
                                readOnly={!!selectedFlightAgency}
                                required
                                className={inputClassName}
                            />
                        </div>

                        {/* Type de voyage */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faPlane} className="text-blue-500" />
                                Type de voyage
                            </label>
                            <select
                                name="tripType"
                                value={formData.tripType}
                                onChange={handleInputChange}
                                className="block w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="one-way">Aller simple</option>
                                <option value="round-trip">Aller-retour</option>
                            </select>
                        </div>

                        {/* Prix total */}
                        <div className="mt-4 flex items-center gap-2 p-4 bg-yellow-50 rounded-md">
                            <FontAwesomeIcon icon={faDollarSign} className="text-yellow-500 text-lg" />
                            <p className="text-lg font-semibold text-gray-800">
                                Prix total: {totalPrice.toLocaleString()} FCFA
                            </p>
                        </div>

                        {/* Détail du prix par passager (info supplémentaire) */}
                        {selectedClassAgency && passengers.length > 0 && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm">
                                <p className="font-medium text-blue-800 mb-2">Détail par passager :</p>
                                {passengers.map((p, idx) => {
                                    const typeInfo = getPassengerTypeLabel(p.typePassenger);
                                    const rule = filteredRules.find(r => r.typePassenger === p.typePassenger);
                                    const price = p.typePassenger === 'ADLT' 
                                        ? basePrice 
                                        : (rule ? parseFloat(rule.price) : basePrice);
                                    
                                    return (
                                        <div key={idx} className="flex justify-between text-xs mb-1">
                                            <span>
                                                <FontAwesomeIcon icon={typeInfo.icon} className={`mr-1 text-${typeInfo.color}-500`} />
                                                {typeInfo.label}
                                            </span>
                                            <span className="font-medium">{price.toLocaleString()} FCFA</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className={inputClassName}
                                placeholder="Ajoutez des informations supplémentaires..."
                            ></textarea>
                        </div>

                        {/* Section Passagers */}
                        <div className="border-t border-gray-200 mt-6 pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faUsers} className="text-indigo-500" />
                                    Passagers
                                </h4>
                                <button
                                    type="button"
                                    onClick={addPassenger}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                                >
                                    Ajouter un passager
                                </button>
                            </div>

                            {passengers.map((passenger, index) => {
                                const typeInfo = getPassengerTypeLabel(passenger.typePassenger);
                                
                                return (
                                    <div key={index} className="border-t border-gray-200 pt-6 mt-6 bg-white rounded-xl shadow-lg p-6 md:p-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                                <FontAwesomeIcon icon={typeInfo.icon} className={`text-${typeInfo.color}-500`} />
                                                Passager {index + 1} - {typeInfo.label}
                                            </h3>
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removePassenger(index)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    <FontAwesomeIcon icon={faSignature} className="mr-2 text-blue-500" />
                                                    Prénom
                                                </label>
                                                <input
                                                    type="text"
                                                    value={passenger.firstName}
                                                    onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                                                    className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm p-2"
                                                    placeholder="Entrez le prénom"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    <FontAwesomeIcon icon={faSignature} className="mr-2 text-blue-500" />
                                                    Nom
                                                </label>
                                                <input
                                                    type="text"
                                                    value={passenger.lastName}
                                                    onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                                                    className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm p-2"
                                                    placeholder="Entrez le nom"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    <FontAwesomeIcon icon={faVenusMars} className="mr-2 text-purple-500" />
                                                    Genre
                                                </label>
                                                <select
                                                    value={passenger.gender}
                                                    onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                                                    className="border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm p-2"
                                                >
                                                    <option value="">Sélectionnez le genre</option>
                                                    <option value="feminin">Féminin</option>
                                                    <option value="masculin">Masculin</option>
                                                    <option value="autres">Autres</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-green-500" />
                                                    Date de naissance
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
                                                    <FontAwesomeIcon icon={faUser} className="mr-2 text-orange-500" />
                                                    Type de passager
                                                </label>
                                                <select
                                                    value={passenger.typePassenger}
                                                    onChange={(e) => handlePassengerChange(index, "typePassenger", e.target.value)}
                                                    className="border-gray-300 rounded-lg block w-full p-2"
                                                >
                                                    <option value="ADLT">Adulte (ADLT)</option>
                                                    <option value="CHD">Enfant (CHD)</option>
                                                    <option value="INF">Bébé (INF)</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Prix individuel pour ce passager */}
                                        {selectedClassAgency && (
                                            <div className="mt-4 p-3 bg-green-50 rounded-md">
                                                <p className="text-sm">
                                                    <span className="font-medium">Prix pour ce passager : </span>
                                                    {passenger.typePassenger === 'ADLT' ? (
                                                        <span className="text-green-600 font-bold">{basePrice.toLocaleString()} FCFA</span>
                                                    ) : (
                                                        (() => {
                                                            const rule = filteredRules.find(r => r.typePassenger === passenger.typePassenger);
                                                            const price = rule ? parseFloat(rule.price) : basePrice;
                                                            return (
                                                                <span className="text-green-600 font-bold">
                                                                    {price.toLocaleString()} FCFA
                                                                    {rule ? ' (règle spéciale)' : ' (prix adulte par défaut)'}
                                                                </span>
                                                            );
                                                        })()
                                                    )}
                                                </p>
                                            </div>
                                        )}

                                        {/* Documents */}
                                        <div className="mt-6">
                                            <h5 className="text-md font-medium text-gray-900 mb-4">Documents</h5>
                                            {passenger.document.map((doc, docIndex) => (
                                                <div key={docIndex} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-4 bg-gray-50 rounded-lg shadow-sm mb-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Type de document
                                                        </label>
                                                        <select
                                                            value={doc.documentType}
                                                            onChange={(e) =>
                                                                handleDocumentChange(index, docIndex, 'documentType', e.target.value)
                                                            }
                                                            className="border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm px-4 py-2"
                                                        >
                                                            <option value="">Sélectionnez le type</option>
                                                            <option value="passport">Passeport</option>
                                                            <option value="acte_naissance">Acte de Naissance</option>
                                                            <option value="permis">Permis</option>
                                                            <option value="autres">Autres</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Numéro de document
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={doc.documentNumber}
                                                            onChange={(e) =>
                                                                handleDocumentChange(index, docIndex, 'documentNumber', e.target.value)
                                                            }
                                                            className="border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm px-4 py-2"
                                                            placeholder="e.g., 123456789"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Date d'émission
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={doc.issueDate}
                                                            onChange={(e) => handleDocumentChange(index, docIndex, "issueDate", e.target.value)}
                                                            className="border-gray-300 rounded-lg block w-full p-2"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Date d'expiration
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={doc.expirationDate}
                                                            onChange={(e) => handleDocumentChange(index, docIndex, "expirationDate", e.target.value)}
                                                            className="border-gray-300 rounded-lg block w-full p-2"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Fichier
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
                                                        Supprimer le document
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addDocument(index)}
                                                className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                                            >
                                                Ajouter un document
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bouton de soumission */}
                        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                            >
                                {loading ? 'Création...' : 'Créer la réservation'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Style pour line-clamp
const styles = `
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
`;

if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

export default CreateReservation;
