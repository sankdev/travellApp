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
  faBuilding,faMousePointer,faExclamationTriangle,
  faSearch,
  faArrowLeft,
  faPlane,
  faDollarSign,
  faPlaneDeparture,
  faPlaneArrival,
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
    
    // États pour le vol retour
    const [returnVolSearch, setReturnVolSearch] = useState('');
    const [returnVols, setReturnVols] = useState([]);
    const [filteredReturnVols, setFilteredReturnVols] = useState([]);
    const [selectedReturnVol, setSelectedReturnVol] = useState(null);
    const [showReturnVolSuggestions, setShowReturnVolSuggestions] = useState(false);
    const [showAllReturnAgencyFlights, setShowAllReturnAgencyFlights] = useState(false);
    const [agencyReturnVolCount, setAgencyReturnVolCount] = useState(0);
    
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
        typePassenger: "ADLT",
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

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const calculateFlightDuration = (departureTime, arrivalTime) => {
        if (!departureTime || !arrivalTime) return null;
        const departure = new Date(departureTime);
        const arrival = new Date(arrivalTime);
        const diffMs = arrival - departure;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${diffHours}h ${diffMinutes}min`;
    };

    const getPassengerTypeLabel = (type) => {
        const types = {
            'ADLT': { label: 'Adulte', icon: faUserTie, color: 'blue' },
            'CHD': { label: 'Enfant (2-12 ans)', icon: faChild, color: 'green' },
            'INF': { label: 'Bébé (0-2 ans)', icon: faBaby, color: 'purple' }
        };
        return types[type] || { label: type, icon: faUser, color: 'gray' };
    };

    // ============================================
    // CHARGEMENT DES DONNÉES
    // ============================================
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
                    fetchPricingRules()
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

    const fetchPricingRules = async () => {
        try {
            const response = await pricingRuleService.getAllPricingRules();
            const rulesData = response?.data || response || [];
            setPricingRules(Array.isArray(rulesData) ? rulesData : []);
            console.log('📋 Règles de prix chargées:', rulesData);
        } catch (error) {
            console.error('❌ Erreur lors du chargement des règles de prix:', error);
            setPricingRules([]);
        }
    };

    const fetchClassAgencies = async () => {
        try {
            const response = await agencyAssociationService.getAllClassAgencies();
            const classData = response?.data || response || [];
            setClassAgencies(Array.isArray(classData) ? classData : []);
            console.log('📦 ClassAgencies chargées:', classData);
        } catch (error) {
            console.error('❌ Erreur lors du chargement des ClassAgency:', error);
            setClassAgencies([]);
        }
    };

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

            setAgencies(agenciesData);
            setFilteredAgencies(agenciesData);
            console.log(`🏢 ${agenciesData.length} agences chargées`);
        } catch (error) {
            console.error('❌ Erreur lors du chargement des agences:', error);
            setAgencies([]);
            setFilteredAgencies([]);
        }
    };

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
            setAllVols([]);
        }
    };

    // ============================================
    // FILTRES VOL ALLER
    // ============================================
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

    useEffect(() => {
        if (volSearch.length > 0) {
            const searchLower = volSearch.toLowerCase();
             console.log('volsSearch',searchLower)
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
             console.log('volsFiltered',filtered)
            setShowVolSuggestions(filtered.length > 0 && volSearch.trim().length > 0);
        } else {
            setVols(filteredVols);
            setShowVolSuggestions(false);
        }
    }, [volSearch, filteredVols]);
     
    // ============================================
    // FILTRES VOL RETOUR
    // ============================================
    useEffect(() => {
        if (!selectedAgency) {
            setFilteredReturnVols([]);
            setReturnVols([]);
            setAgencyReturnVolCount(0);
            return;
        }

        const agencyVols = allVols.filter(vol => 
            vol.agency && vol.agency.id === selectedAgency.id
        );
        
        const otherAgencyVols = allVols.filter(vol => 
            vol.agency && vol.agency.id !== selectedAgency.id
        );

        setAgencyReturnVolCount(agencyVols.length);

        if (agencyVols.length > 0 && !showAllReturnAgencyFlights) {
            setFilteredReturnVols(agencyVols);
            setReturnVols(agencyVols);
        } else {
            setFilteredReturnVols(otherAgencyVols);
            setReturnVols(otherAgencyVols);
        }
    }, [selectedAgency, showAllReturnAgencyFlights, allVols]);

    useEffect(() => {
        if (returnVolSearch.length > 0) {
            const searchLower = returnVolSearch.toLowerCase();
            const filtered = filteredReturnVols.filter(vol => {
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
            setReturnVols(filtered);
            setShowReturnVolSuggestions(filtered.length > 0 && returnVolSearch.trim().length > 0);
        } else {
            setReturnVols(filteredReturnVols);
            setShowReturnVolSuggestions(false);
        }
    }, [returnVolSearch, filteredReturnVols]);

    // ============================================
    // FILTRAGE DES CLASSES POUR LE VOL SÉLECTIONNÉ
    // ============================================
    useEffect(() => {
        if (selectedFlightAgency) {
            console.log('🎯 Vol sélectionné ID:', selectedFlightAgency.id);
            
            const classList = Array.isArray(classAgencies) ? classAgencies : [];
            
            const availableClasses = classList.filter(ca => {
                return ca.agencyVol?.id === selectedFlightAgency.id && ca.status === 'active';
            });
            
            console.log(`🔍 ${availableClasses.length} classes disponibles trouvées`);
            setFilteredClasses(availableClasses);
            
            if (availableClasses.length > 0 && !selectedClassAgency) {
                const firstClass = availableClasses[0];
                console.log('🎯 Première classe sélectionnée automatiquement:', firstClass);
                setSelectedClassAgency(firstClass);
                setFormData(prev => ({ ...prev, agencyClassId: firstClass.id }));
                setBasePrice(parseFloat(firstClass.price) || 0);
            }
            
            if (selectedClassAgency && !availableClasses.some(c => c.id === selectedClassAgency.id)) {
                setSelectedClassAgency(null);
                setFormData(prev => ({ ...prev, agencyClassId: '' }));
                setBasePrice(0);
            }

            if (availableClasses.length === 0) {
                setError('Ce vol n\'a pas de classes disponibles. Veuillez en sélectionner un autre.');
            } else {
                setError('');
            }
        } else {
            setFilteredClasses([]);
            setError('');
        }
    }, [selectedFlightAgency, classAgencies]);

    // ============================================
    // FILTRAGE DES RÈGLES DE PRIX
    // ============================================
    useEffect(() => {
        if (selectedClassAgency) {
            console.log('📋 Classe sélectionnée ID:', selectedClassAgency.id);
            
            const rulesList = Array.isArray(pricingRules) ? pricingRules : [];
            
            const rules = rulesList.filter(rule => 
                rule.agencyClassId === selectedClassAgency.id
            );
            
            setFilteredRules(rules);
            console.log('📊 Règles de prix pour cette classe:', rules);
        } else {
            setFilteredRules([]);
        }
    }, [selectedClassAgency, pricingRules]);

    // ============================================
    // CALCUL DU PRIX DE BASE
    // ============================================
    useEffect(() => {
        if (selectedFlightAgency && selectedClassAgency) {
            const price = parseFloat(selectedClassAgency.price) || 0;
            setBasePrice(price);
        } else {
            setBasePrice(0);
        }
    }, [selectedFlightAgency, selectedClassAgency]);

    // ============================================
    // CALCUL DU PRIX TOTAL
    // ============================================
    // ============================================
// CALCUL DU PRIX TOTAL - CORRIGÉ
// ============================================
useEffect(() => {
    const calculateTotalPrice = () => {
        if (!selectedFlightAgency || !selectedClassAgency) {
            setTotalPrice(0);
            return;
        }

        console.log('🧮 Calcul du prix total...');
        
        const classPrice = parseFloat(selectedClassAgency.price) || 0;
        console.log('💰 Prix de la classe (par passager):', classPrice);

        // Map des règles pour la classe aller
        const rulesMap = {};
        filteredRules.forEach(rule => {
            rulesMap[rule.typePassenger] = parseFloat(rule.price) || 0;
        });
        console.log('🗺️ Map des règles:', rulesMap);

        // Calcul du prix pour chaque passager
        let totalPrice = 0;
        
        passengers.forEach((passenger, index) => {
            const passengerType = passenger.typePassenger;
            console.log(`👤 Passager ${index + 1} - Type: ${passengerType}`);
            
            // ✅ PRIX DE BASE : prix du vol (aller)
            let passengerPrice = classPrice;
            
            // ✅ AJOUTER LA RÈGLE UNE SEULE FOIS si le passager n'est pas adulte
            if (passengerType !== 'ADLT') {
                const rulePrice = rulesMap[passengerType];
                if (rulePrice) {
                    passengerPrice += rulePrice;
                    console.log(`  ➕ Règle ${passengerType === 'CHD' ? 'enfant' : 'bébé'}: +${rulePrice} FCFA (une seule fois)`);
                }
            }
            
            // ✅ AJOUTER LE PRIX DU RETOUR si aller-retour
            if (formData.tripType === 'round-trip' && selectedReturnVol) {
                // Chercher la classe pour le vol retour
                const returnClassAgency = classAgencies.find(ca => 
                    ca.agencyVol?.id === selectedReturnVol.id && 
                    ca.classId === selectedClassAgency.classId
                );
                
                if (returnClassAgency) {
                    const returnClassPrice = parseFloat(returnClassAgency.price) || 0;
                    passengerPrice += returnClassPrice;
                    console.log(`  ➕ Prix retour: +${returnClassPrice} FCFA`);
                } else {
                    // Fallback: même prix que l'aller
                    passengerPrice += classPrice;
                    console.log(`  ➕ Prix retour (fallback): +${classPrice} FCFA`);
                }
            }
            
            totalPrice += passengerPrice;
            console.log(`  = Total pour ce passager: ${passengerPrice} FCFA`);
        });

        console.log('💰 PRIX TOTAL FINAL:', totalPrice);
        setTotalPrice(totalPrice);
        setFormData(prev => ({ ...prev, totalPrice }));
    };

    calculateTotalPrice();
}, [selectedFlightAgency, selectedClassAgency, selectedReturnVol, passengers, formData.tripType, classAgencies, filteredRules]);
    // ============================================
    // HANDLERS
    // ============================================
    const handleAgencySelection = (agency) => {
        setSelectedAgency(agency);
        setAgencySearch(agency.name);
        setFormData(prev => ({ ...prev, agencyId: agency.id }));
        setShowAgencySuggestions(false);
        
        setVolSearch('');
        setReturnVolSearch('');
        setSelectedFlightAgency(null);
        setSelectedReturnVol(null);
        setSelectedClassAgency(null);
        setFormData(prev => ({
            ...prev,
            agencyVolId: '',
            returnVolId: '',
            startAt: '',
            endAt: '',
            agencyClassId: ''
        }));
        
        setShowAllAgencyFlights(false);
        setShowAllReturnAgencyFlights(false);
        setError('');
    };

   const handleFlightSelection = (vol) => {
    console.log('✈️ Vol aller sélectionné:', vol);

    const hasClasses = classAgencies.some(ca => ca.agencyVol?.id === vol.id);
    console.log(`📊 Ce vol a des classes: ${hasClasses ? 'Oui' : 'Non'}`);

    setSelectedFlightAgency(vol);
    setFormData(prev => ({
        ...prev,
        agencyVolId: vol.id,
        startDestinationId: vol.flight?.origin?.id || '',
        endDestinationId: vol.flight?.destination?.id || '',
        startAt: vol.departureTime ? formatDateForInput(vol.departureTime) : ''
    }));

    // ✅ CORRECTION: Construction correcte du texte d'affichage
    const displayText = vol.flight?.name ||
        `${vol.flight?.company?.name || 'Compagnie inconnue'} - ${vol.flight?.origin?.name || '?'} → ${vol.flight?.destination?.name || '?'}`;
    
    console.log('displayText', displayText);
    setVolSearch(displayText);
    setShowVolSuggestions(false);

    // ✅ CORRECTION: Vérification et mise à jour des destinations avec la bonne structure
    if (vol.flight?.origin) {
        // Chercher dans destinations par l'ID de l'origine
        const originDest = destinations.find(d => d.id === vol.flight.origin.id);
        if (originDest) {
            setStartDestinationSearch(originDest.name || originDest.city);
            setFormData(prev => ({ ...prev, startDestinationId: originDest.id }));
        } else {
            // Fallback: utiliser le nom de l'origine directement
            setStartDestinationSearch(vol.flight.origin.name || vol.flight.origin.city);
        }
    }

    if (vol.flight?.destination) {
        // Chercher dans destinations par l'ID de la destination
        const destDest = destinations.find(d => d.id === vol.flight.destination.id);
        if (destDest) {
            setEndDestinationSearch(destDest.name || destDest.city);
            setFormData(prev => ({ ...prev, endDestinationId: destDest.id }));
        } else {
            // Fallback: utiliser le nom de la destination directement
            setEndDestinationSearch(vol.flight.destination.name || vol.flight.destination.city);
        }
    }

    if (!hasClasses) {
        setError('Ce vol n\'a pas de classes disponibles. Veuillez en sélectionner un autre.');
    } else {
        setError('');
    }
};

    const handleReturnFlightSelection = (vol) => {
        console.log('🔄 Vol retour sélectionné:', vol);
        
        setSelectedReturnVol(vol);
        setFormData(prev => ({
            ...prev,
            returnVolId: vol.id
            // ✅ NE PAS mettre à jour endAt automatiquement
        }));

        const displayText = vol.flight?.name || 
            `${getCompanyById(vol.flight?.companyId)} - ${getDestinationById(vol.flight?.originId)} to ${getDestinationById(vol.flight?.destinationId)}`;
        
        setReturnVolSearch(displayText);
        setShowReturnVolSuggestions(false);
    };

    const handleClassSelection = (classAgency) => {
        console.log('🎫 Classe sélectionnée:', classAgency);
        setSelectedClassAgency(classAgency);
        setFormData(prev => ({ ...prev, agencyClassId: classAgency.id }));
        setBasePrice(parseFloat(classAgency.price) || 0);
        setError('');
    };

    const toggleFlightDisplay = () => {
        setShowAllAgencyFlights(!showAllAgencyFlights);
        setVolSearch('');
    };

    const toggleReturnFlightDisplay = () => {
        setShowAllReturnAgencyFlights(!showAllReturnAgencyFlights);
        setReturnVolSearch('');
    };

    // ============================================
    // FONCTIONS DE RECHERCHE
    // ============================================
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

    // ============================================
    // GESTION DU FORMULAIRE
    // ============================================
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

    // ============================================
    // GESTION DES PASSAGERS
    // ============================================
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

    const removePassenger = (index) => {
        if (passengers.length > 1) {
            setPassengers(passengers.filter((_, i) => i !== index));
        }
    };

    // ============================================
    // GESTION DES DOCUMENTS
    // ============================================
    const addDocument = (passengerIndex) => {
        setPassengers((prev) =>
            prev.map((passenger, i) => {
                if (i === passengerIndex) {
                    return {
                        ...passenger,
                        document: [
                            ...(passenger.document || []),
                            { documentType: '', documentNumber: '', issueDate: '', expirationDate: '', files: [] },
                        ],
                    };
                }
                return passenger;
            })
        );
    };

    const removeDocument = (passengerIndex, docIndex) => {
        setPassengers((prev) => {
            const updated = [...prev];
            updated[passengerIndex].document.splice(docIndex, 1);
            return updated;
        });
    };

    const handleDocumentChange = (passengerIndex, docIndex, field, value) => {
        setPassengers((prev) => {
            const updated = [...prev];
            updated[passengerIndex].document[docIndex][field] = value;
            return updated;
        });
    };

    const handleFileChange = (e, passengerIndex, docIndex) => {
        const files = Array.from(e.target.files);
        setPassengers((prev) => {
            const updated = [...prev];
            updated[passengerIndex].document[docIndex].files = files;
            return updated;
        });
    };

    // ============================================
    // SOUMISSION
    // ============================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
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

        if (formData.tripType === 'round-trip' && !selectedReturnVol) {
            setError('Veuillez sélectionner un vol retour');
            setLoading(false);
            return;
        }

        // ✅ Validation de la date de retour (saisie manuelle)
        if (formData.tripType === 'round-trip' && !formData.endAt) {
            setError('La date de retour est requise pour un aller-retour');
            setLoading(false);
            return;
        }

        try {
            const encodedPassengers = await Promise.all(passengers.map(async (passenger) => {
                const encodedDocuments = await Promise.all(
                    (passenger.document || []).map(async (doc) => {
                        let base64Files = [];
                        if (doc.files && doc.files.length > 0) {
                            base64Files = await Promise.all(
                                Array.from(doc.files).map((file) => {
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
                        return { ...doc, files: base64Files };
                    })
                );
                return { ...passenger, document: encodedDocuments };
            }));

            const cleanedFormData = {
                ...formData,
                agencyId: selectedAgency.id,
                agencyVolId: selectedFlightAgency.id,
                agencyClassId: selectedClassAgency.id,
                endAt: formData.tripType === 'one-way' ? null : formData.endAt,
                returnVolId: formData.tripType === 'one-way' ? null : (selectedReturnVol?.id || null),
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
            setError(err.response?.data?.error || 'Une erreur est survenue.');
        }
    };

    // ============================================
    // RENDU
    // ============================================
    return (
        <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 to-gray-200 shadow-md rounded-lg p-6 mb-8 max-w-7xl mx-auto">
            <button
                onClick={() => navigate('/customer/reservations')}
                className="mb-6 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
                <FontAwesomeIcon icon={faArrowLeft} />
                Retour aux réservations
            </button>

            <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Nouvelle Réservation</h1>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                        {/* Section Agence */}
                     {/* Section Agence */}
<div className="relative mb-4">
    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
        <FontAwesomeIcon icon={faBuilding} className="text-green-500" />
        Agence
    </label>
    
    <div className="relative flex items-center">
        <FontAwesomeIcon icon={faSearch} className="absolute left-3 text-gray-400 z-10" />
        <input
            type="text"
            value={agencySearch}
            onChange={(e) => {
                setAgencySearch(e.target.value);
                // ✅ Afficher les suggestions dès qu'on tape
                if (e.target.value.trim().length > 0) {
                    setShowAgencySuggestions(true);
                } else {
                    setShowAgencySuggestions(false);
                }
            }}
            onFocus={() => {
                // ✅ Afficher les suggestions au focus si la recherche n'est pas vide
                if (filteredAgencies.length > 0 && agencySearch.trim().length > 0) {
                    setShowAgencySuggestions(true);
                }
                // ✅ Afficher toutes les agences si le champ est vide
                if (filteredAgencies.length > 0 && agencySearch.trim().length === 0) {
                    setShowAgencySuggestions(true);
                }
            }}
            onBlur={() => {
                // ✅ Délai pour permettre la sélection avant de fermer
                setTimeout(() => {
                    if (!selectionLocked) {
                        setShowAgencySuggestions(false);
                    }
                }, 200);
            }}
            placeholder="Tapez le nom de l'agence ou cliquez pour voir toutes les agences..."
            className="block w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            required={!selectedAgency}
        />
        {agencySearch && (
            <button
                type="button"
                onClick={() => {
                    setAgencySearch('');
                    setSelectedAgency(null);
                    setShowAgencySuggestions(false);
                    setFormData(prev => ({ ...prev, agencyId: '' }));
                }}
                className="absolute right-3 text-gray-400 hover:text-gray-600"
            >
                <FontAwesomeIcon icon={faTimes} />
            </button>
        )}
    </div>

    {/* ✅ LISTE DES AGENCES - AMÉLIORÉE AVEC CLIC */}
    {showAgencySuggestions && filteredAgencies.length > 0 && (
        <div className="absolute z-50 left-0 right-0 min-w-[280px] bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-80 overflow-hidden">
            {/* En-tête avec compteur et bouton fermer */}
            <div className="sticky top-0 flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
                <span className="text-xs font-medium text-gray-600">
                    {filteredAgencies.length} agence(s) disponible(s)
                </span>
                <button
                    type="button"
                    onClick={() => setShowAgencySuggestions(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                </button>
            </div>
            
            {/* Liste scrollable */}
            <div className="overflow-y-auto max-h-64">
                {filteredAgencies.map((agency) => (
                    <div
                        key={agency.id}
                        className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                            selectedAgency?.id === agency.id 
                                ? 'bg-green-50 hover:bg-green-100' 
                                : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                            setShowAgencySuggestions(false);
                            handleAgencySelection(agency);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                selectedAgency?.id === agency.id 
                                    ? 'bg-green-200' 
                                    : 'bg-gray-100'
                            }`}>
                                <FontAwesomeIcon 
                                    icon={faBuilding} 
                                    className={selectedAgency?.id === agency.id ? 'text-green-600' : 'text-gray-500'}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className={`font-medium text-sm truncate ${
                                        selectedAgency?.id === agency.id ? 'text-green-800' : 'text-gray-900'
                                    }`}>
                                        {agency.name}
                                    </p>
                                    {selectedAgency?.id === agency.id && (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                            Sélectionnée
                                        </span>
                                    )}
                                    {agency.status === 'active' && (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                            Active
                                        </span>
                                    )}
                                </div>
                                {agency.description && (
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                        {agency.description}
                                    </p>
                                )}
                                {agency.city && (
                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3" />
                                        {agency.city}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )}

    {/* Message si aucune agence trouvée */}
    {showAgencySuggestions && filteredAgencies.length === 0 && agencySearch.trim().length > 0 && (
        <div className="absolute z-50 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 p-4 text-center">
            <p className="text-sm text-gray-500">Aucune agence trouvée pour "{agencySearch}"</p>
        </div>
    )}

    {/* Affichage de l'agence sélectionnée */}
    {selectedAgency && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={faBuilding} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">
                                Agence sélectionnée: <span className="text-green-700">{selectedAgency.name}</span>
                            </p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    selectedAgency.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {selectedAgency.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                    {agencyVolCount} vol(s) disponible(s)
                                </span>
                            </div>
                            {selectedAgency.description && (
                                <p className="text-xs text-gray-600 mt-2">{selectedAgency.description}</p>
                            )}
                        </div>
                    </div>
                </div>
                {agencyVolCount === 0 && (
                    <button
                        type="button"
                        onClick={toggleFlightDisplay}
                        className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center gap-1 transition-colors"
                    >
                        <FontAwesomeIcon icon={faExchangeAlt} />
                        {showAllAgencyFlights ? 'Voir les vols de l\'agence' : 'Voir autres agences'}
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => {
                        setSelectedAgency(null);
                        setAgencySearch('');
                        setFormData(prev => ({ ...prev, agencyId: '' }));
                        setShowAgencySuggestions(false);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 ml-2"
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>
        </div>
    )}
</div>

                        {/* Section Vol Aller */}
                        <div className="relative mb-4">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-500 text-lg" />
                                Sélectionner un vol aller
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
                                    placeholder="Rechercher un vol aller..."
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
                                                            {vol.flight?.company?.name || 'Compagnie inconnue'}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            {vol.flight?.origin.name || 'Inconnu'} → 
                                                            {vol.flight?.destination.name || 'Inconnu'}
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
                       
                             {/* Sélection de la classe */}
<div className="relative mb-4">
    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
        <FontAwesomeIcon icon={faCog} className="text-purple-500" />
        Sélectionner une classe <span className="text-red-500">*</span>
    </label>

    {!selectedFlightAgency ? (
        <div className="mt-1 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <FontAwesomeIcon icon={faInfoCircle} className="text-gray-400 text-xl mb-2" />
            <p className="text-sm text-gray-600">
                Veuillez d'abord sélectionner un vol pour voir les classes disponibles
            </p>
        </div>
    ) : filteredClasses.length === 0 ? (
        <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 text-xl mb-2" />
            <p className="text-sm text-yellow-700 font-medium">
                Aucune classe disponible pour ce vol
            </p>
            <p className="text-xs text-yellow-600 mt-1">
                Veuillez sélectionner un autre vol ou contacter le support
            </p>
        </div>
    ) : (
        <div className="mt-2">
            {/* Message d'instruction */}
            <div className="mb-3 flex items-center justify-between">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />
                    {filteredClasses.length} classe(s) disponible(s) - Cliquez sur une classe pour la sélectionner
                </p>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <FontAwesomeIcon icon={faMousePointer} size="xs" />
                    Cliquez pour sélectionner
                </span>
            </div>

            {/* Liste des classes avec effet de carte cliquable */}
            <div className="grid grid-cols-1 gap-3">
                {filteredClasses.map((classAgency) => {
                    const isSelected = selectedClassAgency?.id === classAgency.id;
                    const price = parseFloat(classAgency.price).toLocaleString();

                    return (
                        <div
                            key={classAgency.id}
                            className={`
                                relative p-4 border-2 rounded-xl transition-all cursor-pointer
                                ${isSelected 
                                    ? 'border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-200' 
                                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md hover:bg-purple-50/50'
                                }
                                group
                            `}
                            onClick={() => handleClassSelection(classAgency)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleClassSelection(classAgency);
                                }
                            }}
                            aria-label={`Sélectionner la classe ${classAgency.class?.name || 'inconnue'}`}
                        >
                            {/* Indicateur visuel de cliquabilité au survol */}
                            <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/5 rounded-xl transition-colors pointer-events-none" />
                            
                            {/* Badge "Cliquez pour sélectionner" au survol */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                                    <FontAwesomeIcon icon={faMousePointer} size="xs" />
                                    Sélectionner
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center
                                        ${isSelected ? 'bg-purple-200' : 'bg-gray-100 group-hover:bg-purple-100'}
                                        transition-colors
                                    `}>
                                        <FontAwesomeIcon
                                            icon={faCog}
                                            className={isSelected ? 'text-purple-600' : 'text-gray-500 group-hover:text-purple-500'}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className={`
                                                font-semibold
                                                ${isSelected ? 'text-purple-800' : 'text-gray-800'}
                                            `}>
                                                {classAgency.class?.name || 'Classe inconnue'}
                                            </p>
                                            <p className="text-lg font-bold text-green-600">
                                                {price} FCFA
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Par adulte
                                        </p>
                                        {filteredRules.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {filteredRules
                                                    .filter(rule => rule.agencyClassId === classAgency.id)
                                                    .map((rule, idx) => (
                                                        <span 
                                                            key={idx} 
                                                            className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                                                        >
                                                            {rule.typePassenger === 'CHD' ? (
                                                                <>
                                                                    <FontAwesomeIcon icon={faChild} className="text-blue-500" />
                                                                    Enfant: {parseFloat(rule.price).toLocaleString()} FCFA
                                                                </>
                                                            ) : rule.typePassenger === 'INF' ? (
                                                                <>
                                                                    <FontAwesomeIcon icon={faBaby} className="text-purple-500" />
                                                                    Bébé: {parseFloat(rule.price).toLocaleString()} FCFA
                                                                </>
                                                            ) : null}
                                                        </span>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="ml-3 flex items-center gap-2">
                                        <span className="text-sm text-green-600 font-medium">
                                            Sélectionnée
                                        </span>
                                        <FontAwesomeIcon 
                                            icon={faCheckCircle} 
                                            className="text-green-500 text-xl" 
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Barre de progression visuelle pour la sélection */}
                            {!isSelected && (
                                <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full w-0 group-hover:w-full bg-purple-400 transition-all duration-300" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Message de confirmation si une classe est sélectionnée */}
            {selectedClassAgency && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                    <p className="text-sm text-green-700">
                        <span className="font-medium">Classe sélectionnée :</span> {selectedClassAgency.class?.name} - {parseFloat(selectedClassAgency.price).toLocaleString()} FCFA
                    </p>
                </div>
            )}
        </div>
    )}
</div>             
 
                        {/* Section Type de voyage et Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-green-500" />
                                    Date de départ
                                </label>
                                <input
                                    type="date"
                                    name="startAt"
                                    value={formData.startAt}
                                    onChange={handleInputChange}
                                    required
                                    className={inputClassName}
                                />
                            </div>

                            {formData.tripType === 'round-trip' && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="text-orange-500" />
                                        Date de retour <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="endAt"
                                        value={formData.endAt}
                                        onChange={handleInputChange}
                                        required
                                        min={formData.startAt || new Date().toISOString().split('T')[0]}
                                        className={inputClassName}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Veuillez saisir la date de retour manuellement
                                    </p>
                                </div>
                            )}

                            {/* Section Vol Retour (visible seulement pour aller-retour) */}
                        {formData.tripType === 'round-trip' && (
                            <div className="relative mb-4 mt-6 pt-4 border-t border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faPlaneArrival} className="text-purple-500 text-lg" />
                                    Sélectionner un vol retour <span className="text-red-500">*</span>
                                    {selectedAgency && (
                                        <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                            {showAllReturnAgencyFlights ? 'Autres agences' : selectedAgency.name}
                                        </span>
                                    )}
                                </label>

                                <div className="relative">
                                    <input
                                        type="text"
                                        value={returnVolSearch}
                                        onChange={(e) => {
                                            setReturnVolSearch(e.target.value);
                                            if (e.target.value.trim().length > 0) {
                                                setShowReturnVolSuggestions(true);
                                            }
                                        }}
                                        onFocus={() => {
                                            if (returnVols.length > 0) {
                                                setShowReturnVolSuggestions(true);
                                            }
                                        }}
                                        placeholder="Rechercher un vol retour..."
                                        className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm placeholder-gray-400"
                                        disabled={!selectedAgency}
                                    />
                                    <FontAwesomeIcon
                                        icon={faSearch}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    />
                                </div>

                                {selectedAgency && agencyReturnVolCount === 0 && !showAllReturnAgencyFlights && (
                                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
 <p className="text-sm text-yellow-700 mb-2">
                                            Cette agence n'a pas de vols retour disponibles.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={toggleReturnFlightDisplay}
                                            className="text-sm px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 flex items-center gap-2"
                                        >
                                            <FontAwesomeIcon icon={faFilter} />
                                            Voir les vols retour des autres agences
                                        </button>
                                    </div>
                                )}

                                {showReturnVolSuggestions && returnVols.length > 0 && (
                                    <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                                        {returnVols.map((vol) => (
                                            <li
                                                key={vol.id}
                                                className="p-3 cursor-pointer hover:bg-purple-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                                                onClick={() => handleReturnFlightSelection(vol)}
                                                onMouseDown={(e) => e.preventDefault()}
                                            >
                                                <FontAwesomeIcon icon={faPlaneArrival} className="text-purple-500 text-md" />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800">
                                                                {vol.flight?.company.name || 'Compagnie inconnue'}
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                {vol.flight?.origin.name || 'Inconnu'} →
                                                                {vol.flight?.destination.name || 'Inconnu'}
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
                                                    <p className="text-xs text-purple-600 mt-1">
                                                        Départ: {formatDateForInput(vol.departureTime)}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {selectedReturnVol && (
                                    <div className="mt-3 p-3 bg-purple-50 rounded-md border border-purple-200">
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faPlaneArrival} className="text-purple-600" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    Vol retour sélectionné: <span className="text-purple-700">{selectedReturnVol.flight?.name}</span>
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    Départ: {formatDateForInput(selectedReturnVol.departureTime)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        </div>

                        {/* Prix total */}
                        <div className="mt-4 flex items-center gap-2 p-4 bg-yellow-50 rounded-md">
                            <FontAwesomeIcon icon={faDollarSign} className="text-yellow-500 text-lg" />
                            <p className="text-lg font-semibold text-gray-800">
                                Prix total: {totalPrice.toLocaleString()} FCFA
                            </p>
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
                                placeholder="Ajoutez des informations supplémentaires..."
                            />
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

                                        {/* Prix individuel */}
                                        {selectedClassAgency && (
                                            <div className="mt-4 p-3 bg-green-50 rounded-md">
                                                <p className="text-sm">
                                                    <span className="font-medium">Prix pour ce passager : </span>
                                                    {passenger.typePassenger === 'ADLT' ? (
                                                        <span className="text-green-600 font-bold">{basePrice.toLocaleString()} FCFA</span>
                                                    ) : (
                                                        (() => {
                                                            const rule = filteredRules.find(r => r.typePassenger === passenger.typePassenger);
                                                            const price = rule ? parseFloat(rule.price) + basePrice : basePrice;
                                                            return (
                                                                <span className="text-green-600 font-bold">
                                                                    {price.toLocaleString()} FCFA
                                                                    {rule ? ' (avec règle)' : ' (prix standard)'}
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
                                                            onChange={(e) => handleDocumentChange(index, docIndex, 'documentType', e.target.value)}
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
                                                            onChange={(e) => handleDocumentChange(index, docIndex, 'documentNumber', e.target.value)}
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
                                                        Supprimer
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
