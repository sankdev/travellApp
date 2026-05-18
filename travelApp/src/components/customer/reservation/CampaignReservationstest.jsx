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
    const [campaigns, setCampaigns] = useState([]);
    const [showVolSuggestions, setShowVolSuggestions] = useState(false);

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
            files: null
        }],
        status: 'active'
    }]);

    const [formData, setFormData] = useState({
        customerId: '',
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
    
     const fetchAgencies = async (search = '') => {
        try {
            const response = await agencyService.getAgencies({ search });
            setAgencies(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch agencies:', error);
            setError('Failed to load agencies. Please try again.');
        }
    };


     useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [
                    destinationsData, 
                    companiesData, 
                    customersData, 
                    campaignsData,
                    agenciesData
                ] = await Promise.all([
                    fetchDestinations(),
                    fetchCompanies(),
                    fetchCustomers(),
                    fetchCampaigns(),
                    fetchAgencies()
                ]);
                
                if (campaignsData.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        campaignId: campaignsData[0].id
                    }));
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
                setError('Failed to load initial data. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
        fetchClasses();
        fetchVols();
    }, []);
    const fetchCampaigns = async () => {
        try {
            const result = await compaignService.getCompaigns();
            setCampaigns(Array.isArray(result) ? result : []);
            return Array.isArray(result) ? result : [];
        } catch (error) {
            console.error('Failed to fetch campaigns:', error);
            setError('Failed to load campaigns. Please try again.');
            return [];
        }
    };

    const fetchDestinations = async (search = '') => {
        try {
            const response = await destinationService.getDestinations({ search });
            const destinationsData = Array.isArray(response) ? response : [];
            setDestinations(destinationsData);
            return destinationsData;
        } catch (error) {
            console.error('Failed to fetch destinations:', error);
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

    const fetchVols = async () => {
        try {
            const response = await agencyAssociationService.getAllFlightAgencies({ params: { search: volSearch } });
            setVols(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch vols:', error.message);
        }
    };

    useEffect(() => {
        if (volSearch.length > 0) {
            fetchVols();
            setShowVolSuggestions(true);
        } else {
            setVols([]);
            setShowVolSuggestions(false);
        }
    }, [volSearch]);

    useEffect(() => {
        if (agencySearch.length > 0) {
            const timer = setTimeout(() => {
                fetchAgencies(agencySearch);
                setShowAgencySuggestions(true);
            }, 300);
            
            return () => clearTimeout(timer);
        } else {
            setAgencies([]);
            setShowAgencySuggestions(false);
        }
    }, [agencySearch]);

    const handlePriceCalculation = async () => {
        try {
            const selectedVol = vols.find(v => v.id === formData.agencyVolId);
            const selectedClass = classes.find(cls => cls.id === formData.agencyClassId);

            if (!selectedVol || !selectedClass) {
                setTotalPrice(0);
                return;
            }

            let basePrice = selectedVol.price * selectedClass.priceMultiplier;

            if (formData.tripType === "round-trip") {
                const selectedReturnVol = vols.find(v => v.id === formData.returnVolId);
                if (selectedReturnVol) {
                    basePrice += selectedReturnVol.price * selectedClass.priceMultiplier;
                }
            }

            const pricingRules = await pricingRuleService.getAllPricingRules();
            
            if (!pricingRules || pricingRules.length === 0) {
                setTotalPrice(basePrice);
                return;
            }

            const passengerPrices = passengers.map(passenger => {
                if (passenger.typePassenger && passenger.typePassenger !== "ADLT") {
                    const rule = pricingRules.find(rule =>
                        rule.agencyVolId === formData.agencyVolId &&
                        rule.agencyClassId === formData.agencyClassId &&
                        rule.typePassenger === passenger.typePassenger
                    );
                    return rule ? rule.price : 0;
                }
                return 0;
            });

            const totalPassengerPrices = passengerPrices.reduce((sum, price) => sum + price, 0);
            setTotalPrice(basePrice + totalPassengerPrices);
        } catch (error) {
            console.error("Error in price calculation:", error);
            setTotalPrice(0);
        }
    };

    useEffect(() => {
        handlePriceCalculation();
    }, [formData.agencyClassId, formData.returnVolId, formData.agencyVolId, formData.tripType, passengers]);

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    

    if (!formData.agencyId) {
        setError('Agency selection is required');
        setLoading(false);
        return;
    }

    if (!formData.agencyVolId) {
        setError('Flight selection is required');
        setLoading(false);
        return;
    }

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

    // Validation des passagers
    const passengerErrors = passengers.map((passenger, index) => {
        if (!passenger.firstName || !passenger.lastName) {
            return `Passenger ${index + 1}: First and last name are required`;
        }
        if (!passenger.typePassenger) {
            return `Passenger ${index + 1}: Type is required`;
        }
        return null;
    }).filter(Boolean);

    if (passengerErrors.length > 0) {
        setError(passengerErrors.join('\n'));
        setLoading(false);
        return;
    }

    try {
        // Traitement des documents et fichiers
        const processedPassengers = await Promise.all(
            passengers.map(async (passenger) => {
                // Vérification que chaque document a au moins un type et un numéro
                const invalidDocuments = passenger.document.filter(
                    doc => !doc.documentType || !doc.documentNumber
                );
                
                if (invalidDocuments.length > 0) {
                    throw new Error(
                        `Passenger ${passenger.firstName} ${passenger.lastName}: ` +
                        'All documents must have both type and number'
                    );
                }

                // Conversion des fichiers en base64
                const processedDocuments = await Promise.all(
                    passenger.document.map(async (doc) => {
                        if (!doc.files || doc.files.length === 0) {
                            return {
                                ...doc,
                                files: []
                            };
                        }

                        const processedFiles = await Promise.all(
                            Array.from(doc.files).map((file) => {
                                return new Promise((resolve, reject) => {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                        // Extraire seulement la partie base64 (sans le préfixe data:...)
                                        const base64Data = reader.result.split(',')[1];
                                        resolve({
                                            name: file.name,
                                            type: file.type,
                                            size: file.size,
                                            base64: base64Data,
                                            lastModified: file.lastModified
                                        });
                                    };
                                    reader.onerror = () => {
                                        reject(new Error(`Failed to read file ${file.name}`));
                                    };
                                    reader.readAsDataURL(file);
                                });
                            })
                        );

                        return {
                            ...doc,
                            files: processedFiles
                        };
                    })
                );

                return {
                    ...passenger,
                    document: processedDocuments
                };
            })
        );

        // Construction du payload final
        const payload = {
            ...formData,
            passengers: processedPassengers,
            totalPrice: totalPrice,
            createdAt: new Date().toISOString(),
            status: 'pending' // Statut initial de la réservation
        };

        console.log('Reservation payload:', payload);

        // Envoi de la requête
        const response = await reservationService.createReservation(payload);
        console.log('Reservation created successfully:', response.data);

        // Réinitialisation du formulaire après succès
        setFormData({
            customerId: '',
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

        setPassengers([{
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
                files: null
            }],
            status: 'active'
        }]);

        setLoading(false);
        navigate('/customer/dashboard', { 
            state: { 
                success: true,
                reservationId: response.data.id 
            } 
        });
    } catch (err) {
        setLoading(false);
        console.error('Submission error:', err);

        let errorMessage = 'An unexpected error occurred. Please try again.';
        
        if (err.response) {
            // Erreur du serveur
            errorMessage = err.response.data.message || 
                         err.response.data.error || 
                         'Server error occurred';
        } else if (err.request) {
            // Pas de réponse du serveur
            errorMessage = 'Server is not responding. Please check your connection.';
        } else if (err.message) {
            // Erreur de validation ou autre
            errorMessage = err.message;
        }

        setError(errorMessage);
    }
};    

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === "tripType" && value === "one-way" ? { returnVolId: "" } : {}),
        }));
    };

    const handlePassengerChange = (index, key, value) => {
        setPassengers(prev =>
            prev.map((passenger, i) => {
                if (i === index) {
                    return {
                        ...passenger,
                        [key]: value,
                        document: passenger.document || []
                    };
                }
                return passenger;
            })
        );
    };

    const handleDocumentChange = (passengerIndex, docIndex, field, value) => {
        setPassengers(prevPassengers => {
            const updatedPassengers = [...prevPassengers];
            updatedPassengers[passengerIndex].document[docIndex][field] = value;
            return updatedPassengers;
        });
    };

    const handleFileChange = (e, passengerIndex, docIndex) => {
        const files = Array.from(e.target.files);
        setPassengers(prevPassengers => {
            const updatedPassengers = [...prevPassengers];
            updatedPassengers[passengerIndex].document[docIndex].files = files;
            return updatedPassengers;
        });
    };

    const addPassenger = () => {
        setPassengers(prev => [
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
                typePassenger: "ADLT",
                document: [],
                status: 'active',
            },
        ]);
    };

    const addDocument = (passengerIndex) => {
        setPassengers(prev =>
            prev.map((passenger, i) => {
                if (i === passengerIndex) {
                    return {
                        ...passenger,
                        document: [
                            ...(passenger.document || []),
                            { documentType: '', documentNumber: '', files: [] },
                        ],
                    };
                }
                return passenger;
            })
        );
    };

    const removeDocument = (passengerIndex, docIndex) => {
        setPassengers(prevPassengers => {
            const updatedPassengers = [...prevPassengers];
            updatedPassengers[passengerIndex].document.splice(docIndex, 1);
            return updatedPassengers;
        });
    };

    const removePassenger = (index) => {
        const newPassengers = passengers.filter((_, i) => i !== index);
        setPassengers(newPassengers);
    };

    const getCompanyById = (id) => {
        const company = companies.find(item => item.id === parseInt(id));
        return company?.name || 'Unknown Company';
    };

    const getDestinationById = (id) => {
        const destination = destinations.find(item => item.id === parseInt(id));
        return destination?.country || destination?.name || 'Unknown Destination';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
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
        const filtered = vols.filter((vol) =>
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

    return (
        <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 to-gray-200 shadow-md rounded-lg p-6 mb-8 max-w-7xl mx-auto">
            <div className="md:col-span-1">
                <div className="px-4 sm:px-0">
                    <h3 className="text-lg font-semibold text-gray-900">New Reservation</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Fill in the required details to create a reservation. Ensure all fields are correctly filled.
                    </p>
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200 mb-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                {/* Customer Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUsers} className="text-blue-500" />
                        Customer
                    </label>
                    <select
                        name="customerId"
                        value={formData.customerId}
                        onChange={handleInputChange}
                        required
                        className="block w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Select a customer</option>
                        {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>
                                {customer.firstName} {customer.lastName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Campaign Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FontAwesomeIcon icon={faPlane} className="text-blue-500" />
                        Campaign
                    </label>
                    <select
                        name="campaignId"
                        value={formData.campaignId}
                        onChange={handleInputChange}
                        className="block w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Select a campaign</option>
                        {campaigns.map(campaign => (
                            <option key={campaign.id} value={campaign.id}>
                                {campaign.title} - {campaign.type} (Price: {campaign.price} FCFA)
                            </option>
                        ))}
                    </select>
                </div>

                {/* Agency Selection */}
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
                            placeholder="Type agency name..."
                            className="block w-full p-2 pl-10 border border-gray-300 rounded-md"
                        />
                    </div>
                    {showAgencySuggestions && agencies.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                            {agencies.map(agency => (
                                <li
                                    key={agency.id}
                                    className="p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                                    onClick={() => {
                                        setAgencySearch(agency.name);
                                        setFormData(prev => ({ ...prev, agencyId: agency.id }));
                                        setShowAgencySuggestions(false);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faBuilding} className="text-green-500" />
                                    {agency.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Flight Selection */}
                <div className="relative mb-4">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-500 text-lg" />
                        Select Flight
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={volSearch}
                            onChange={(e) => setVolSearch(e.target.value)}
                            onFocus={() => setShowVolSuggestions(volSearch.length > 0)}
                            onBlur={() => setTimeout(() => setShowVolSuggestions(false), 150)}
                            placeholder="Search for a flight..."
                            className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
                        />
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                    </div>
                    {showVolSuggestions && vols.length > 0 && (
                        <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                            {vols.map(vol => (
                                <li
                                    key={vol.id}
                                    className="p-3 cursor-pointer hover:bg-blue-50 flex items-center gap-3 transition-all"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, agencyVolId: vol.id }));
                                        setVolSearch(vol.flight?.name || '');
                                        setShowVolSuggestions(false);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-500 text-md" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            {getCompanyById(vol.flight?.companyId)}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {getDestinationById(vol.flight?.originId)} → {getDestinationById(vol.flight?.destinationId)}
                                        </p>
                                        <p className="text-xs text-gray-500 font-semibold">
                                            Depart: {formatDate(vol.departureTime)} → {formatDate(vol.arrivalTime)}
                                        </p>
                                        <p className="text-xs text-gray-500 font-semibold">
                                            Agency: {vol.agency?.name} → Price: {vol.price} FCFA
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Trip Type */}
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

                {/* Return Flight (conditional) */}
                {formData.tripType === 'round-trip' && (
                    <div className="relative mt-6">
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                            <FontAwesomeIcon icon={faPlane} className="text-purple-500" />
                            Return Flight
                        </label>
                        <input
                            type="text"
                            value={returnVolSearch}
                            onChange={(e) => handleReturnVolSearch(e.target.value)}
                            placeholder="Search return flight..."
                            className="block w-full p-2 border border-gray-300 rounded-md"
                        />
                        {showReturnVolSuggestions && filteredReturnVols.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                                {filteredReturnVols.map(vol => (
                                    <li
                                        key={vol.id}
                                        className="p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, returnVolId: vol.id }));
                                            setReturnVolSearch(vol.flight?.name || '');
                                            setShowReturnVolSuggestions(false);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faPlane} className="text-purple-500" />
                                        {vol.flight?.name} - {getCompanyById(vol.flight?.companyId)}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* Price Display */}
                <div className="mt-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faDollarSign} className="text-yellow-500" />
                    <p className="text-lg font-semibold">Total Price: {totalPrice.toLocaleString()} FCFA</p>
                </div>

                {/* Passengers Section */}
                <div className="border-t border-gray-200 mt-6 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium text-gray-900">Passengers</h4>
                        <button
                            type="button"
                            onClick={addPassenger}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Add Passenger
                        </button>
                    </div>

                    {passengers.map((passenger, index) => (
                        <div key={index} className="border-t border-gray-200 pt-6 mt-6 bg-white rounded-xl shadow-lg p-6 md:p-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                <FontAwesomeIcon icon={faUser} className="text-indigo-500" />
                                Passenger {index + 1}
                            </h3>

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
                            </div>

                            <div className="mb-4 mt-6">
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
                                    className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Add Document
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
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Reservation'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateReservationCampaign;
