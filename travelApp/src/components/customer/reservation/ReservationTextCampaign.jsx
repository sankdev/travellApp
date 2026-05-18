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

    // Fetch all initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [
                    destinationsData, 
                    companiesData, 
                    profileData, 
                    customersData, 
                    campaignsData
                ] = await Promise.all([
                    fetchDestinations(),
                    fetchCompanies(),
                    fetchProfile(),
                    fetchCustomers(),
                    fetchCampaigns(),
                ]);
                
                // Set default campaign if available
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
    }, []);

    // Fetch campaigns with additional details
    const fetchCampaigns = async () => {
        try {
            const result = await compaignService.getCompaigns();
            const enrichedCampaigns = await Promise.all(
                result.map(async campaign => {
                    try {
                        const volDetails = await agencyAssociationService.getFlightAgencyById(campaign.volId);
                        return {
                            ...campaign,
                            volDetails
                        };
                    } catch (error) {
                        console.error(`Error fetching details for campaign ${campaign.id}:`, error);
                        return campaign;
                    }
                })
            );
            setCampaigns(enrichedCampaigns);
            return enrichedCampaigns;
        } catch (error) {
            console.error('Failed to fetch campaigns:', error);
            setError('Failed to load campaigns. Please try again.');
            return [];
        }
    };

    // Enhanced destination fetching with caching
    const fetchDestinations = async (search = '') => {
        try {
            const cacheKey = `destinations-${search}`;
            const cachedData = sessionStorage.getItem(cacheKey);
            
            if (cachedData) {
                return JSON.parse(cachedData);
            }

            const response = await destinationService.getDestinations({ search });
            const destinationsData = Array.isArray(response) ? response : [];
            
            sessionStorage.setItem(cacheKey, JSON.stringify(destinationsData));
            setDestinations(destinationsData);
            return destinationsData;
        } catch (error) {
            console.error('Failed to fetch destinations:', error);
            return [];
        }
    };

    // Improved price calculation with better error handling
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

    // Enhanced form submission with validation
    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        // Version simplifiée et plus robuste de la construction du payload
        const processedPassengers = await Promise.all(
            passengers.map(async (passenger) => {
                const processedDocuments = await Promise.all(
                    passenger.document.map(async (doc) => {
                        if (!doc.files) return doc;
                        
                        const processedFiles = await Promise.all(
                            Array.from(doc.files).map((file) => {
                                return new Promise((resolve) => {
                                    const reader = new FileReader();
                                    reader.onload = () => resolve({
                                        name: file.name,
                                        type: file.type,
                                        base64: reader.result.split(',')[1]
                                    });
                                    reader.readAsDataURL(file);
                                });
                            })
                        );
                        
                        return { ...doc, files: processedFiles };
                    })
                );
                
                return { ...passenger, document: processedDocuments };
            })
        );

        const payload = {
            ...formData,
            passengers: processedPassengers,
            totalPrice
        };

        // Appel API
        const response = await reservationService.createReservation(payload);
        console.log('Réservation créée avec succès', response.data);
        
        // Redirection
        navigate('/customer/dashboard');
    } catch (err) {
        console.error('Erreur lors de la création', err);
        setError(
            err.response?.data?.message || 
            'Une erreur est survenue lors de la création de la réservation'
        );
    } finally {
        setLoading(false);
    }
};

    // Helper functions
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

    // Render functions for cleaner JSX
    const renderCampaignOptions = () => (
        campaigns.map(campaign => (
            <option key={campaign.id} value={campaign.id}>
                {campaign.title} - {campaign.type} (Price: {campaign.price} FCFA)
                {campaign.volDetails && ` - ${campaign.volDetails.flight.name}`}
            </option>
        ))
    );

    const renderPassengerDocuments = (passengerIndex) => (
        passenger.document.map((doc, docIndex) => (
            <div key={docIndex} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-4 bg-gray-50 rounded-lg shadow-sm mb-4">
                {/* Document fields */}
                <button 
                    type="button" 
                    onClick={() => removeDocument(passengerIndex, docIndex)}
                    className="text-sm text-red-600 hover:text-red-800 mt-4 md:mt-0"
                >
                    Remove Document
                </button>
            </div>
        ))
    );

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
                        {renderCampaignOptions()}
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
                                        setVolSearch(vol.flight.name);
                                        setShowVolSuggestions(false);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-500 text-md" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            {getCompanyById(vol.flight.companyId)}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {getDestinationById(vol.flight.originId)} → {getDestinationById(vol.flight.destinationId)}
                                        </p>
                                        <p className="text-xs text-gray-500 font-semibold">
                                            Depart: {formatDate(vol.departureTime)} → {formatDate(vol.arrivalTime)}
                                        </p>
                                        <p className="text-xs text-gray-350 font-semibold">
                                            Agency: {vol.agency.name} → Price: {vol.price} FCFA
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
                                            setReturnVolSearch(vol.flight.name);
                                            setShowReturnVolSuggestions(false);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faPlane} className="text-purple-500" />
                                        {vol.flight.name} - {getCompanyById(vol.flight.companyId)}
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
                            {/* Passenger form fields */}
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
                                        {/* Sélection du type de passager */}
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
                                          className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indi>
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
                        
                    ))}
                </div>

                {/* Submit Button */}
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
