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
  faSearch,faArrowLeft,
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
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const CreateReservation = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [destinations, setDestinations] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [vols, setVols] = useState([]);
    const [filteredVols, setFilteredVols] = useState([]);
    const [agencies, setAgencies] = useState([]); // Toutes les agences
    const [filteredAgencies, setFilteredAgencies] = useState([]); // Agences filtrées par nom
    const [customers, setCustomers] = useState([]);
    const [profile, setProfile] = useState({});
    const [agencySearch, setAgencySearch] = useState('');
    const [volSearch, setVolSearch] = useState('');
    const [classes, setClasses] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [classSearch, setClassSearch] = useState('');
    const [showClassSuggestions, setShowClassSuggestions] = useState(false);
    const [showReturnVolSuggestions, setShowReturnVolSuggestions] = useState(false);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [returnVolSearch, setReturnVolSearch] = useState('');
    const [filteredReturnVols, setFilteredReturnVols] = useState([]);
    const [showAgencySuggestions, setShowAgencySuggestions] = useState(false);
    const [startDestinationSearch, setStartDestinationSearch] = useState('');
    const [endDestinationSearch, setEndDestinationSearch] = useState('');
    const [startDestinations, setStartDestinations] = useState([]);
    const [endDestinations, setEndDestinations] = useState([]);
    const [showStartDestinationSuggestions, setShowStartDestinationSuggestions] = useState(false);
    const [showEndDestinationSuggestions, setShowEndDestinationSuggestions] = useState(false);
    const [showVolSuggestions, setShowVolSuggestions] = useState(false);
    
    // Nouveaux états
    const [selectedAgency, setSelectedAgency] = useState(null);
    const [showAllAgencyFlights, setShowAllAgencyFlights] = useState(false);
    const [agencyVolCount, setAgencyVolCount] = useState(0);
    const [allVols, setAllVols] = useState([]);

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
            documentType:'',
            documentNumber:'',
            issueDate: '',
            expirationDate: '',
            files:null
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

    // Fonction pour calculer la durée du vol
    const calculateFlightDuration = (departureTime, arrivalTime) => {
        if (!departureTime || !arrivalTime) return null;
        const departure = new Date(departureTime);
        const arrival = new Date(arrivalTime);
        const diffMs = arrival - departure;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${diffHours}h ${diffMinutes}min`;
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
                    fetchAllAgencies() // Charger toutes les agences au démarrage
                ]);
            } catch (error) {
                console.error('Error in fetchData:', error);
                setError('Failed to load one or more data sets.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        fetchClasses();
    }, []);

    // Récupérer toutes les agences au chargement
    const fetchAllAgencies = async () => {
        try {
            const response = await agencyService.getAgencies({
                search: '', // Pas de recherche, on veut toutes les agences
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
            setFilteredAgencies(agenciesData); // Initialiser avec toutes les agences
        } catch (error) {
            console.error('❌ Erreur lors du chargement des agences:', error);
            setAgencies([]);
            setFilteredAgencies([]);
        }
    };

    // Récupérer tous les vols au chargement
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
            console.log(`📦 ${volsData.length} vols chargés`);
        } catch (error) {
            console.error('❌ Erreur lors du chargement des vols:', error);
        }
    };

    // Effet pour filtrer les agences par nom (commence par)
    useEffect(() => {
        if (agencySearch.trim() === '') {
            // Si la recherche est vide, afficher toutes les agences
            setFilteredAgencies(agencies);
            setShowAgencySuggestions(false);
        } else {
            // Filtrer les agences dont le nom commence par la recherche
            const searchTerm = agencySearch.toLowerCase().trim();
            
            // VERSION 1: Commence exactement par le terme de recherche
            const filtered = agencies.filter(agency => {
                const agencyName = agency.name.toLowerCase();
                return agencyName.startsWith(searchTerm);
            });
            
            // VERSION 2: Alternative si vous voulez une recherche plus permissive
            // const filtered = agencies.filter(agency => {
            //     const agencyName = agency.name.toLowerCase();
            //     // Soit commence par, soit contient le terme au début d'un mot
            //     return agencyName.startsWith(searchTerm) || 
            //            agencyName.includes(` ${searchTerm}`);
            // });
            
            setFilteredAgencies(filtered);
            setShowAgencySuggestions(filtered.length > 0);
            
            console.log(`🔍 Recherche: "${searchTerm}" - ${filtered.length} agence(s) trouvée(s)`);
        }
    }, [agencySearch, agencies]);

    // Effet pour filtrer les vols quand une agence est sélectionnée
    useEffect(() => {
        if (!selectedAgency) {
            setFilteredVols([]);
            setVols([]);
            return;
        }

        // Filtrer les vols par agence sélectionnée
        const agencyVols = allVols.filter(vol => 
            vol.agency && vol.agency.id === selectedAgency.id
        );
        
        // Autres vols (d'autres agences)
        const otherAgencyVols = allVols.filter(vol => 
            vol.agency && vol.agency.id !== selectedAgency.id
        );

        setAgencyVolCount(agencyVols.length);
        
        // Si l'agence a des vols, on les affiche, sinon on affiche tous les vols
        if (agencyVols.length > 0 && !showAllAgencyFlights) {
            setFilteredVols(agencyVols);
            setVols(agencyVols);
        } else {
            setFilteredVols(otherAgencyVols);
            setVols(otherAgencyVols);
        }

        console.log(`📊 Vols filtrés: ${agencyVols.length} pour cette agence, ${otherAgencyVols.length} pour autres agences`);
    }, [selectedAgency, showAllAgencyFlights, allVols]);

    // Effet pour la recherche dans les vols filtrés
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

    // Effet pour les classes
    useEffect(() => {
        if (classSearch.length > 0) {
            const filtered = classes.filter((cls) =>
                cls.class?.name?.toLowerCase().includes(classSearch.toLowerCase())
            );
            setFilteredClasses(filtered);
        } else {
            setFilteredClasses(classes);
        }
    }, [classSearch, classes]);

    // Effet pour les vols de retour
    useEffect(() => {
        if (returnVolSearch.length > 0) {
            const filtered = allVols.filter((vol) =>
                (vol.flight?.name?.toLowerCase() || '').includes(returnVolSearch.toLowerCase())
            );
            setFilteredReturnVols(filtered);
        } else {
            setFilteredReturnVols(allVols);
        }
    }, [returnVolSearch, allVols]);

    const handleAgencySelection = async (agency) => {
        setSelectedAgency(agency);
        setAgencySearch(agency.name);
        setFormData(prev => ({
            ...prev,
            agencyId: agency.id
        }));
        setShowAgencySuggestions(false);
        
        // Réinitialiser la sélection de vol
        setVolSearch('');
        setFormData(prev => ({
            ...prev,
            agencyVolId: '',
            startAt: ''
        }));
        
        // Réinitialiser l'affichage des vols
        setShowAllAgencyFlights(false);
    };

    const handleFlightSelection = (vol) => {
        console.log('✈️ Vol sélectionné:', vol);

        // Mettre à jour le formulaire avec le vol sélectionné
        setFormData((prev) => ({
            ...prev,
            agencyVolId: vol.id,
            startDestinationId: vol.flight?.originId || '',
            endDestinationId: vol.flight?.destinationId || '',
            // AUTOMATISATION: Mettre startAt à la departureTime du vol
            startAt: vol.departureTime ? formatDateForInput(vol.departureTime) : ''
        }));

        // Mettre à jour la recherche avec un texte descriptif
        const displayText = vol.flight?.name || 
            `${getCompanyById(vol.flight?.companyId)} - ${getDestinationById(vol.flight?.originId)} to ${getDestinationById(vol.flight?.destinationId)}`;
        
        setVolSearch(displayText);
        setShowVolSuggestions(false);

        // Mettre à jour aussi les champs de destination si nécessaire
        if (vol.flight?.originId) {
            const originDest = destinations.find(d => d.id === vol.flight.originId);
            if (originDest) setStartDestinationSearch(originDest.name);
        }
        if (vol.flight?.destinationId) {
            const destDest = destinations.find(d => d.id === vol.flight.destinationId);
            if (destDest) setEndDestinationSearch(destDest.name);
        }
    };

    const toggleFlightDisplay = () => {
        setShowAllAgencyFlights(!showAllAgencyFlights);
        setVolSearch(''); // Réinitialiser la recherche
    };

    const handleClassSearch = (value) => {
        setClassSearch(value);
        if (value.trim() === '') {
            setFilteredClasses([]);
            setShowClassSuggestions(false);
            return;
        }
        const filtered = classes.filter((cls) =>
            cls.class?.name?.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredClasses(filtered);
        setShowClassSuggestions(filtered.length > 0);
    };

    const handleReturnVolSearch = (value) => {
        setReturnVolSearch(value);
        if (value.trim() === '') {
            setFilteredReturnVols([]);
            setShowReturnVolSuggestions(false);
            return;
        }
        const filtered = allVols.filter((vol) =>
            (vol.flight?.name?.toLowerCase() || '').includes(value.toLowerCase())
        );
        setFilteredReturnVols(filtered);
        setShowReturnVolSuggestions(filtered.length > 0);
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

    const fetchClasses = async () => {
        try {
            const response = await agencyAssociationService.getAllClassAgencies();
            setClasses(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Failed to fetch classes');
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
        return destination ? destination.country : '';
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

            if (name === "endAt") {
                if (prev.tripType === "one-way") {
                    return prev;
                }
            }

            return {
                ...prev,
                [name]: value
            };
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

    // Calcul du prix total
    const handlePriceCalculation = async () => {
        const selectedVol = allVols.find((v) => v.id === formData.agencyVolId);
        const selectedClass = Array.isArray(classes) ? classes.find((cls) => cls.id === formData.agencyClassId) : null;

        if (!selectedVol || !selectedClass) {
            setTotalPrice(0);
            return;
        }

        let basePrice = selectedVol.price * selectedClass.priceMultiplier;

        if (formData.tripType === "round-trip") {
            const selectedReturnVol = allVols.find((v) => v.id === formData.returnVolId);
            if (selectedReturnVol) {
                basePrice += selectedReturnVol.price * selectedClass.priceMultiplier;
            }
        }

        try {
            const pricingRules = await pricingRuleService.getAllPricingRules();
            
            if (!pricingRules || pricingRules.length === 0) {
                setTotalPrice(basePrice);
                return;
            }

            let totalPrice = basePrice;

            passengers.forEach((passenger) => {
                if (passenger.typePassenger && passenger.typePassenger !== "ADLT") {
                    const rule = pricingRules.find(rule =>
                        rule.agencyVolId === formData.agencyVolId &&
                        rule.agencyClassId === formData.agencyClassId &&
                        rule.typePassenger === passenger.typePassenger
                    );

                    if (rule) {
                        totalPrice += rule.price;
                    }
                }
            });

            setTotalPrice(totalPrice);
        } catch (error) {
            console.error("Erreur lors de la récupération des règles de tarification :", error);
            setTotalPrice(basePrice);
        }
    };

    useEffect(() => {
        handlePriceCalculation();
    }, [formData.agencyClassId, formData.returnVolId, formData.agencyVolId, formData.tripType, passengers]);
     

    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // Validation
        if (!formData.startAt) {
            setError('Start date is required');
            setLoading(false);
            return;
        }

        if (formData.tripType === 'round-trip' && !formData.endAt) {
            setError('End date is required for round trips');
            setLoading(false);
            return;
        }

        if (!selectedAgency) {
            setError('Please select an agency');
            setLoading(false);
            return;
        }

        if (!formData.agencyVolId) {
            setError('Please select a flight');
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
                endAt: formData.tripType === 'one-way' ? null : formData.endAt,
                returnVolId: formData.tripType === 'one-way' ? null : formData.returnVolId,
                totalPrice: totalPrice
            };

            const payload = {
                ...cleanedFormData,
                passengers: encodedPassengers,
            };

            console.log('payloadsReservation', payload);
            const response = await reservationService.createReservation(payload);
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
                    <h3 className="text-lg font-semibold text-gray-900">New Reservation</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Fill in the required details to create a reservation. Ensure all fields are correctly filled.
                    </p>
                </div>
            </div>
             
              <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">New Reservation</h1>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                        {error && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Section Agence MODIFIÉE - Filtrée par début de nom */}
                        <div className="relative mb-4">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faBuilding} className="text-green-500" />
                                Agency
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
                                    placeholder="Type agency name (starts with)..."
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
                            
                            {/* Info sur le type de filtrage */}
                            {agencySearch && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Showing agencies starting with "<span className="font-semibold">{agencySearch}</span>"
                                </p>
                            )}
                            
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
                                            onMouseDown={(e) => e.preventDefault()} // Empêche le blur immédiat
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
                                                                Selected
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
                                                        {agency.location && (
                                                            <span className="text-xs text-gray-500">
                                                                📍 {agency.location}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            
                            {showAgencySuggestions && filteredAgencies.length === 0 && agencySearch.trim().length > 0 && (
                                <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 p-4">
                                    <div className="text-center">
                                        <FontAwesomeIcon icon={faBuilding} className="text-gray-300 text-2xl mb-2" />
                                        <p className="text-sm text-gray-600">
                                            No agency found starting with "<span className="font-semibold">{agencySearch}</span>"
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Try typing the beginning of an agency name
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            {selectedAgency && (
                                <div className="mt-3 p-3 bg-green-50 rounded-md border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faBuilding} className="text-green-600" />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        Selected Agency: <span className="text-green-700">{selectedAgency.name}</span>
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
                                                            {agencyVolCount} flight(s) available
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
                                                {showAllAgencyFlights ? 'Show agency flights' : 'Show other agencies flights'}
                                            </button>
                                        )}
                                    </div>
                                    
                                    {showAllAgencyFlights && (
                                        <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                                            <FontAwesomeIcon icon={faInfoCircle} size="xs" />
                                            Showing flights from other agencies
                                        </div>
                                    )}
                                </div>
                            )}
                            
                        </div>
                        

                        {/* Section Vols */}
                        <div className="relative mb-4">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-500 text-lg" />
                                Select Flight
                                {selectedAgency && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        {showAllAgencyFlights ? 'Other agencies' : selectedAgency.name}
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
                                    placeholder="Search for a flight..."
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
                                    Please select an agency first to see available flights
                                </p>
                            )}

                            {selectedAgency && agencyVolCount === 0 && !showAllAgencyFlights && (
                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <p className="text-sm text-yellow-700 mb-2">
                                        This agency has no available flights.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={toggleFlightDisplay}
                                        className="text-sm px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 flex items-center gap-2"
                                    >
                                        <FontAwesomeIcon icon={faFilter} />
                                        View flights from other agencies
                                    </button>
                                </div>
                            )}

                            {showVolSuggestions && vols.length > 0 && (
                                <div className="flight-suggestions-container">
                                    <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                                        {vols.map((vol) => (
                                            <li
                                                key={vol.id}
                                                className="p-3 cursor-pointer hover:bg-blue-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                                                onClick={() => handleFlightSelection(vol)}
                                            >
                                                <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-500 text-md" />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800">
                                                                {getCompanyById(vol.flight?.companyId) || 'Unknown Company'}
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                {getDestinationById(vol.flight?.originId) || 'Unknown'} → 
                                                                {getDestinationById(vol.flight?.destinationId) || 'Unknown'}
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
                                                            Duration: {calculateFlightDuration(vol.departureTime, vol.arrivalTime) || 'N/A'}
                                                        </p>
                                                        <p className="text-xs font-semibold text-green-600">
                                                            Price: {vol.price} FCFA
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-blue-600 mt-1">
                                                        Departure: {formatDateForInput(vol.departureTime)}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {showVolSuggestions && vols.length === 0 && volSearch.trim().length > 0 && (
                                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 p-3">
                                    <p className="text-sm text-gray-500 text-center">No flights found</p>
                                </div>
                            )}
                        </div>

                        {/* Date de départ */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-green-500" />
                                Start Date
                                {formData.startAt && formData.agencyVolId && (
                                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                        Auto-set
                                    </span>
                                )}
                            </label>
                            <input
                                type="date"
                                name="startAt"
                                value={formData.startAt}
                                onChange={handleInputChange}
                                readOnly={!!formData.agencyVolId}
                                 required
                                className={inputClassName}
                            />
                            {formData.agencyVolId && formData.startAt && (
                                <p className="mt-1 text-xs text-green-600">
                                    Date automatically set from selected flight
                                </p>
                            )}
                        </div>

                        {/* Classe */}
                        {/* Classe */}
<div className="relative mb-4">
    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
        <FontAwesomeIcon icon={faPlane} className="text-red-500" />
        Class <span className="text-red-500">*</span>
    </label>
    
    <select
        value={formData.agencyClassId}
        onChange={(e) => setFormData({ ...formData, agencyClassId: e.target.value })}
        className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
        required
    >
        <option value="">Select a class</option>
        {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
                {cls.class?.name || 'Unknown'} (x{cls.priceMultiplier})
            </option>
        ))}
    </select>
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

                        {/* Vol de retour (si aller-retour) */}
                        {formData.tripType === 'round-trip' && (
                            <div className="relative mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faPlane} className="text-purple-500" />
                                        Return Flight
                                    </label>
                                    <input
                                        type="text"
                                        value={returnVolSearch}
                                        onChange={(e) => handleReturnVolSearch(e.target.value)}
                                        onFocus={() => setShowReturnVolSuggestions(filteredReturnVols.length > 0)}
                                        placeholder="Type return flight name..."
                                        className="block w-full p-2 border border-gray-300 rounded-md"
                                    />
                                    {showReturnVolSuggestions && (
                                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                                            {filteredReturnVols.map((vol) => (
                                                <li
                                                    key={vol.id}
                                                    className="p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                                                    onClick={() => {
                                                        setFormData((prev) => ({ ...prev, returnVolId: vol.id }));
                                                        setReturnVolSearch(vol.flight?.name || '');
                                                        setShowReturnVolSuggestions(false);
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faPlane} className="text-purple-500" />
                                                    {vol.flight?.name || 'Unknown'} - {getCompanyById(vol.flight?.companyId)} - {getDestinationById(vol.flight?.destinationId)}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Date de retour */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                                        Return Date
                                    </label>
                                    <input
                                        type="date"
                                        name="endAt"
                                        value={formData.endAt}
                                        required={formData.tripType === 'round-trip'}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Destinations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Start Destination */}
                            <div className="relative mb-4">
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
                                {showStartDestinationSuggestions && Array.isArray(startDestinations) && startDestinations.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                                        {startDestinations.map((destination) => (
                                            <li
                                                key={destination.id}
                                                className="p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                                                onClick={() => {
                                                    setStartDestinationSearch(destination.name);
                                                    handleInputChange({
                                                        target: { name: 'startDestinationId', value: destination.id },
                                                    });
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

                            {/* End Destination */}
                            <div className="relative mb-4">
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
                                {showEndDestinationSuggestions && Array.isArray(endDestinations) && endDestinations.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                                        {endDestinations.map((destination) => (
                                            <li
                                                key={destination.id}
                                                className="p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                                                onClick={() => {
                                                    setEndDestinationSearch(destination.name);
                                                    handleInputChange({
                                                        target: { name: 'endDestinationId', value: destination.id },
                                                    });
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
                        </div>

                        {/* Prix total */}
                        <div className="mt-4 flex items-center gap-2 p-3 bg-yellow-50 rounded-md">
                            <FontAwesomeIcon icon={faDollarSign} className="text-yellow-500 text-lg" />
                            <p className="text-lg font-semibold text-gray-800">Total Price: {totalPrice.toLocaleString()} FCFA</p>
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
                                placeholder="Add any additional information about the reservation..."
                            ></textarea>
                        </div>

                        {/* Passengers Section */}
                        <div className="border-t border-gray-200 mt-6 pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faUsers} className="text-indigo-500" />
                                    Passengers
                                </h4>
                                <button
                                    type="button"
                                    onClick={addPassenger}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4
                                 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                                >
                                    Add Passenger
                                </button>
                            </div>

                            {passengers.map((passenger, index) => (
                                <div
                                    key={index}
                                    className="border-t border-gray-200 pt-6 mt-6 bg-white rounded-xl shadow-lg p-6 md:p-8"
                                >
                                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                        <FontAwesomeIcon icon={faUser} className="text-indigo-500" />
                                        Passenger {index + 1}
                                    </h3>

                                    {/* Informations du passager */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                    {/* Autres informations */}
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
                                        {/* Type de passager */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Type of Passenger</label>
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
                                            <div
                                                key={docIndex}
                                                className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-4 bg-gray-50 rounded-lg shadow-sm mb-4"
                                            >
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Document Type
                                                    </label>
                                                    <select
                                                        value={doc.documentType}
                                                        onChange={(e) =>
                                                            handleDocumentChange(index, docIndex, 'documentType', e.target.value)
                                                        }
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
                                                        onChange={(e) =>
                                                            handleDocumentChange(index, docIndex, 'documentNumber', e.target.value)
                                                        }
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
                                            Add Document
                                        </button>
                                    </div>

                                    {/* Remove Passenger */}
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

                        {/* Submit Button */}
                        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex justify-center py-2 px-4 border border-transparent
  shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
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

// Ajouter le style pour line-clamp
const styles = `
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
`;

// Ajouter les styles au document
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

export default CreateReservation;
