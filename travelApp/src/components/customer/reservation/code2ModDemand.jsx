import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  faPlus,
  faTrash,
  faFilter,
  faTimes,
  faInfoCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

// Services
import { agencyService } from '../../../services/agencyService';
import { companyService } from '../../../services/companyService';
import { customerService } from '../../../services/customerService';
import { destinationService } from '../../../services/destinationService';
import { agencyAssociationService } from '../../../services/agencyAssociationService';
import { reservationService } from '../../../services/reservationService';
import { pricingRuleService } from '../../../services/pricingRuleService';

const ReservationForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // États pour les données
  const [allVols, setAllVols] = useState([]);
  const [displayedVols, setDisplayedVols] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [classes, setClasses] = useState([]);
  const [profile, setProfile] = useState({});
  
  // États de recherche
  const [agencySearch, setAgencySearch] = useState('');
  const [volSearch, setVolSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [startDestinationSearch, setStartDestinationSearch] = useState('');
  const [endDestinationSearch, setEndDestinationSearch] = useState('');
  const [returnVolSearch, setReturnVolSearch] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('');

  // États pour les suggestions
  const [showAgencySuggestions, setShowAgencySuggestions] = useState(false);
  const [showVolSuggestions, setShowVolSuggestions] = useState(false);
  const [showClassSuggestions, setShowClassSuggestions] = useState(false);
  const [showStartDestinationSuggestions, setShowStartDestinationSuggestions] = useState(false);
  const [showEndDestinationSuggestions, setShowEndDestinationSuggestions] = useState(false);
  const [showReturnVolSuggestions, setShowReturnVolSuggestions] = useState(false);
  const [showAgencyFilterSuggestions, setShowAgencyFilterSuggestions] = useState(false);

  // États filtrés
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [filteredAgenciesForFilter, setFilteredAgenciesForFilter] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [startDestinations, setStartDestinations] = useState([]);
  const [endDestinations, setEndDestinations] = useState([]);
  const [filteredReturnVols, setFilteredReturnVols] = useState([]);

  // Données du formulaire
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

  const [passengers, setPassengers] = useState([{
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
      expirationDate: ''
    }]
  }]);

  const [totalPrice, setTotalPrice] = useState(0);
  const [filterMessage, setFilterMessage] = useState('');

  // Débounce pour les recherches
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Chargement initial des données
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchProfile(),
          fetchAllVols(),
          fetchClasses(),
          fetchAllAgencies()
        ]);
      } catch (error) {
        setError('Erreur lors du chargement des données initiales');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Gestion des prix
  useEffect(() => {
    handlePriceCalculation();
  }, [formData.agencyClassId, formData.returnVolId, formData.agencyVolId, formData.tripType, passengers]);

  // Fonction pour filtrer les vols selon le texte saisi
  const filterVolsByAgencyText = useCallback((searchText) => {
    if (!searchText.trim()) {
      setDisplayedVols(allVols);
      setFilterMessage('');
      return;
    }

    const searchTerm = searchText.toLowerCase();
    
    // 1. Chercher les agences qui commencent par le texte saisi
    const matchingAgencies = agencies.filter(agency => 
      agency.name.toLowerCase().startsWith(searchTerm)
    );

    if (matchingAgencies.length === 0) {
      // Si aucune agence ne commence par ce texte, chercher les agences qui contiennent le texte
      const containingAgencies = agencies.filter(agency => 
        agency.name.toLowerCase().includes(searchTerm)
      );

      if (containingAgencies.length === 0) {
        // Aucune agence ne correspond, afficher tous les vols
        setDisplayedVols(allVols);
        setFilterMessage(`Aucune agence ne correspond à "${searchText}". Affichage de tous les vols.`);
        return;
      }
    }

    // Récupérer les IDs des agences correspondantes
    const agencyIds = matchingAgencies.length > 0 
      ? matchingAgencies.map(agency => agency.id)
      : agencies.filter(agency => agency.name.toLowerCase().includes(searchTerm)).map(agency => agency.id);

    // 2. Filtrer les vols par ces IDs d'agences
    const matchingVols = allVols.filter(vol => 
      agencyIds.includes(vol.agencyId) || 
      (vol.agency?.name?.toLowerCase().includes(searchTerm))
    );

    if (matchingVols.length > 0) {
      // Si on trouve des vols, les afficher
      setDisplayedVols(matchingVols);
      const agencyNames = matchingVols
        .map(vol => vol.agency?.name)
        .filter((name, index, self) => name && self.indexOf(name) === index)
        .join(', ');
      setFilterMessage(`Vols de l'agence(s): ${agencyNames}`);
    } else {
      // Si aucun vol ne correspond, afficher tous les vols
      setDisplayedVols(allVols);
      setFilterMessage(`Aucun vol trouvé pour l'agence "${searchText}". Affichage de tous les vols.`);
    }
  }, [allVols, agencies]);

  // Effet pour filtrer les vols quand le filtre d'agence change
  useEffect(() => {
    const debouncedFilter = debounce(filterVolsByAgencyText, 300);
    debouncedFilter(agencyFilter);
  }, [agencyFilter, filterVolsByAgencyText]);

  // Fonctions de fetch
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

  const fetchClasses = async () => {
    try {
      const response = await agencyAssociationService.getAllClassAgencies();
      setClasses(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchAllVols = async () => {
    try {
      const response = await agencyAssociationService.getAllFlightAgencies({
        search: '',
        page: 1,
        limit: 200
      });

      let volsData = [];

      if (response.data?.success && Array.isArray(response.data.data)) {
        volsData = response.data.data;
      } else if (Array.isArray(response.data?.data)) {
        volsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        volsData = response.data;
      } else {
        console.warn('Structure de réponse inattendue:', response.data);
        volsData = [];
      }

      // Normaliser les données
      volsData = volsData.map(vol => ({
        ...vol,
        agencyId: vol.agencyId || vol.agency?.id,
        agencyName: vol.agency?.name || 'Agence inconnue'
      }));

      setAllVols(volsData);
      setDisplayedVols(volsData);
      console.log(`✅ ${volsData.length} vols chargés au total`);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des vols:', error);
    }
  };

  const fetchAllAgencies = async () => {
    try {
      const response = await agencyService.getAgencies({ search: '', page: 1, limit: 100 });
      const agenciesData = Array.isArray(response.data) ? response.data : [];
      setAgencies(agenciesData);
      console.log(`✅ ${agenciesData.length} agences chargées`);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des agences:', error);
    }
  };

  // Handlers de recherche
  const handleAgencySearch = async (value) => {
    setAgencySearch(value);
    if (value.trim() === '') {
      setFilteredAgencies([]);
      setShowAgencySuggestions(false);
      return;
    }

    try {
      const response = await agencyService.getAgencies({ search: value });
      const agencies = Array.isArray(response.data) ? response.data : [];
      setFilteredAgencies(agencies);
      setShowAgencySuggestions(agencies.length > 0);
    } catch (error) {
      console.error('Failed to search agencies:', error);
    }
  };

  const handleAgencyFilterChange = (value) => {
    setAgencyFilter(value);
    
    if (value.trim() === '') {
      setFilteredAgenciesForFilter([]);
      setShowAgencyFilterSuggestions(false);
      return;
    }

    // Filtrer les agences déjà chargées pour les suggestions
    const searchTerm = value.toLowerCase();
    const matchingAgencies = agencies.filter(agency => 
      agency.name.toLowerCase().startsWith(searchTerm) || 
      agency.name.toLowerCase().includes(searchTerm)
    ).slice(0, 10); // Limiter à 10 suggestions

    setFilteredAgenciesForFilter(matchingAgencies);
    setShowAgencyFilterSuggestions(matchingAgencies.length > 0);
  };

  const clearAgencyFilter = () => {
    setAgencyFilter('');
    setFilterMessage('');
    setDisplayedVols(allVols);
  };

  const handleVolSearch = (value) => {
    setVolSearch(value);
    setShowVolSuggestions(value.trim() !== '');
  };

  const handleClassSearch = (value) => {
    setClassSearch(value);
    if (value.trim() === '') {
      setFilteredClasses([]);
      setShowClassSuggestions(false);
      return;
    }

    const filtered = classes.filter(cls =>
      cls.class?.name?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredClasses(filtered);
    setShowClassSuggestions(filtered.length > 0);
  };

  const fetchDestinations = async (search = '') => {
    try {
      const response = await destinationService.getDestinations({ search });
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch destinations:', error);
      return [];
    }
  };

  const handleStartDestinationSearch = async (value) => {
    setStartDestinationSearch(value);
    if (value.trim() === '') {
      setStartDestinations([]);
      setShowStartDestinationSuggestions(false);
      return;
    }

    const results = await fetchDestinations(value);
    setStartDestinations(results);
    setShowStartDestinationSuggestions(results.length > 0);
  };

  const handleEndDestinationSearch = async (value) => {
    setEndDestinationSearch(value);
    if (value.trim() === '') {
      setEndDestinations([]);
      setShowEndDestinationSuggestions(false);
      return;
    }

    const results = await fetchDestinations(value);
    setEndDestinations(results);
    setShowEndDestinationSuggestions(results.length > 0);
  };

  useEffect(() => {
    if (returnVolSearch.length > 0) {
      const searchTerm = returnVolSearch.toLowerCase();
      const filtered = allVols.filter((vol) =>
        (vol.flight?.name?.toLowerCase() || '').includes(searchTerm) ||
        (vol.agency?.name?.toLowerCase() || '').includes(searchTerm)
      );
      setFilteredReturnVols(filtered);
    } else {
      setFilteredReturnVols(allVols);
    }
  }, [returnVolSearch, allVols]);

  const handleReturnVolSearch = (value) => {
    setReturnVolSearch(value);
    setShowReturnVolSuggestions(value.trim() !== '');
  };

  // Calcul du prix
  const handlePriceCalculation = async () => {
    try {
      const selectedVol = allVols.find(v => v.id === formData.agencyVolId);
      const selectedClass = classes.find(cls => cls.id === formData.agencyClassId);

      if (!selectedVol || !selectedClass) {
        setTotalPrice(0);
        return;
      }

      let basePrice = selectedVol.price * selectedClass.priceMultiplier;

      if (formData.tripType === "round-trip" && formData.returnVolId) {
        const returnVol = allVols.find(v => v.id === formData.returnVolId);
        if (returnVol) {
          basePrice += returnVol.price * selectedClass.priceMultiplier;
        }
      }

      const pricingRules = await pricingRuleService.getAllPricingRules();
      let finalPrice = basePrice;

      if (pricingRules && pricingRules.length > 0) {
        passengers.forEach(passenger => {
          if (passenger.typePassenger && passenger.typePassenger !== "ADLT") {
            const rule = pricingRules.find(r =>
              r.agencyVolId === formData.agencyVolId &&
              r.agencyClassId === formData.agencyClassId &&
              r.typePassenger === passenger.typePassenger
            );
            if (rule) finalPrice += rule.price;
          }
        });
      }

      setTotalPrice(finalPrice);
      setFormData(prev => ({ ...prev, totalPrice: finalPrice }));

    } catch (error) {
      console.error("Erreur calcul prix:", error);
      setTotalPrice(0);
    }
  };

  // Fonction pour obtenir les vols à afficher dans les suggestions
  const getDisplayVols = () => {
    if (volSearch.trim() === '') {
      return displayedVols.slice(0, 15);
    }
    
    const searchTerm = volSearch.toLowerCase();
    return displayedVols.filter(vol => {
      const flightName = vol.flight?.name?.toLowerCase() || '';
      const agencyName = vol.agency?.name?.toLowerCase() || vol.agencyName?.toLowerCase() || '';
      return flightName.includes(searchTerm) || agencyName.includes(searchTerm);
    }).slice(0, 15);
  };

  // Gestion des passagers
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
        typePassenger: 'ADLT',
        document: [{
          documentType: '',
          documentNumber: '',
          issueDate: '',
          expirationDate: ''
        }]
      }
    ]);
  };

  const removePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handlePassengerChange = (index, field, value) => {
    setPassengers(prev =>
      prev.map((passenger, i) =>
        i === index ? { ...passenger, [field]: value } : passenger
      )
    );
  };

  // Gestion des documents
  const handleDocumentChange = (passengerIndex, docIndex, key, value) => {
    setPassengers(prev =>
      prev.map((passenger, i) => {
        if (i === passengerIndex) {
          const updatedDocuments = passenger.document.map((doc, j) =>
            j === docIndex ? { ...doc, [key]: value } : doc
          );
          return { ...passenger, document: updatedDocuments };
        }
        return passenger;
      })
    );
  };

  const addDocument = (passengerIndex) => {
    setPassengers(prev =>
      prev.map((passenger, i) =>
        i === passengerIndex
          ? {
            ...passenger,
            document: [
              ...passenger.document,
              { documentType: '', documentNumber: '', issueDate: '', expirationDate: '' }
            ]
          }
          : passenger
      )
    );
  };

  const removeDocument = (passengerIndex, docIndex) => {
    setPassengers(prev =>
      prev.map((passenger, i) =>
        i === passengerIndex
          ? {
            ...passenger,
            document: passenger.document.filter((_, j) => j !== docIndex)
          }
          : passenger
      )
    );
  };

  const handleFileChange = (passengerIndex, docIndex, file) => {
    setPassengers(prev =>
      prev.map((passenger, i) => {
        if (i === passengerIndex) {
          const updatedDocuments = passenger.document.map((doc, j) =>
            j === docIndex ? { ...doc, file } : doc
          );
          return { ...passenger, document: updatedDocuments };
        }
        return passenger;
      })
    );
  };

  // Soumission du formulaire
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.agencyId) {
        throw new Error('Veuillez sélectionner une agence');
      }
      if (!formData.agencyVolId) {
        throw new Error('Veuillez sélectionner un vol aller');
      }
      if (formData.tripType === 'round-trip' && !formData.returnVolId) {
        throw new Error('Veuillez sélectionner un vol retour');
      }

      // Convertir les fichiers en base64
      const passengersWithBase64 = await Promise.all(
        passengers.map(async (passenger) => {
          const documents = await Promise.all(
            passenger.document.map(async (doc) => {
              if (doc.file) {
                const base64String = await convertFileToBase64(doc.file);
                return {
                  ...doc,
                  files: [{
                    base64: base64String,
                    name: doc.file.name,
                    type: doc.file.type
                  }]
                };
              }
              return {
                ...doc,
                files: []
              };
            })
          );
          return { ...passenger, document: documents };
        })
      );

      // Création de la réservation
      const reservationData = {
        ...formData,
        passengers: passengersWithBase64
      };

      // Pour les vols simples, ne pas envoyer endAt
      if (formData.tripType === 'one-way') {
        reservationData.endAt = null;
      }

      const response = await reservationService.createReservationDemande(reservationData);

      if (response.success) {
        navigate('/customer/dashboard');
      } else {
        setError(response.message || 'Erreur lors de la création de la réservation');
      }
    } catch (error) {
      setError(error.message || 'Une erreur est survenue');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Rendu du composant
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Demande de Réservation</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section Filtre par agence - AMÉLIORÉE */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
          <h2 className="text-lg font-medium mb-3 text-blue-800 flex items-center">
            <FontAwesomeIcon icon={faFilter} className="mr-2" />
            Recherche intelligente par agence
          </h2>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FontAwesomeIcon icon={faBuilding} className="mr-2" />
              Tapez le début du nom d'une agence
              <span className="ml-2 text-xs text-gray-500">(ex: "Air" pour Air France)</span>
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={agencyFilter}
                onChange={(e) => handleAgencyFilterChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Commencez à taper le nom d'une agence..."
              />
              {agencyFilter && (
                <button
                  type="button"
                  onClick={clearAgencyFilter}
                  className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-300 transition-colors"
                  title="Effacer le filtre"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
            
            {showAgencyFilterSuggestions && (
              <ul className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
                {filteredAgenciesForFilter.map(agency => (
                  <li
                    key={agency.id}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center"
                    onClick={() => {
                      setAgencyFilter(agency.name);
                      setShowAgencyFilterSuggestions(false);
                    }}
                  >
                    <FontAwesomeIcon icon={faBuilding} className="mr-2 text-gray-400" />
                    <div>
                      <div className="font-medium">{agency.name}</div>
                      <div className="text-xs text-gray-500">
                        Cliquez pour filtrer les vols
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            {filterMessage && (
              <div className={`mt-2 p-2 rounded text-sm flex items-center ${
                filterMessage.includes('Aucun') || filterMessage.includes('tous les vols') 
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                <FontAwesomeIcon 
                  icon={filterMessage.includes('Aucun') ? faExclamationTriangle : faInfoCircle} 
                  className="mr-2" 
                />
                {filterMessage}
              </div>
            )}
            
            <div className="mt-2 text-sm text-gray-600">
              <p className="flex items-center">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-1 text-blue-500" />
                <span>
                  <strong>Fonctionnalité :</strong> Tapez une lettre ou le début d'un nom d'agence pour voir d'abord ses vols.
                  Si aucun vol n'existe, les vols d'autres agences s'affichent automatiquement.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Section Agence et Type de voyage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recherche d'agence pour la réservation */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faBuilding} className="mr-2" />
              Agence pour la réservation *
            </label>
            <input
              type="text"
              value={agencySearch}
              onChange={(e) => handleAgencySearch(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Sélectionnez une agence..."
              required
            />
            {showAgencySuggestions && (
              <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
                {filteredAgencies.map(agency => (
                  <li
                    key={agency.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      setFormData({ ...formData, agencyId: agency.id });
                      setAgencySearch(agency.name);
                      setShowAgencySuggestions(false);
                    }}
                  >
                    {agency.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Type de voyage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faPlane} className="mr-2" />
              Type de voyage *
            </label>
            <select
              name="tripType"
              value={formData.tripType}
              onChange={(e) => {
                const newTripType = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  tripType: newTripType,
                  returnVolId: newTripType === 'one-way' ? '' : prev.returnVolId,
                  endAt: newTripType === 'one-way' ? '' : prev.endAt
                }));
              }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              required
            >
              <option value="one-way">Aller simple</option>
              <option value="round-trip">Aller-retour</option>
            </select>
          </div>
        </div>

        {/* Section Vols */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vol aller */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faPlaneDeparture} className="mr-2" />
              Vol aller *
            </label>
            <input
              type="text"
              value={volSearch}
              onChange={(e) => handleVolSearch(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Rechercher un vol..."
              required
            />
            {showVolSuggestions && (
              <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
                {getDisplayVols().map(vol => (
                  <li
                    key={vol.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        agencyVolId: vol.id,
                        returnVolId: formData.tripType === 'one-way' ? '' : prev.returnVolId
                      }));
                      setVolSearch(vol.flight?.name || 'Vol inconnu');
                      setShowVolSuggestions(false);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {vol.flight?.name || 'Vol inconnu'}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faBuilding} className="mr-1 text-gray-400 text-xs" />
                            <span className="font-medium">{vol.agency?.name || vol.agencyName || 'Agence inconnue'}</span>
                          </div>
                          <div className="mt-1">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {vol.price} XOX
                            </span>
                            {vol.availableSeats !== undefined && (
                              <span className={`inline-block ml-2 text-xs px-2 py-1 rounded ${
                                vol.availableSeats > 10 ? 'bg-green-100 text-green-800' :
                                vol.availableSeats > 0 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {vol.availableSeats > 0 ? `${vol.availableSeats} places` : 'Complet'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-2">
                        <span className="text-lg font-bold text-blue-600">
                          {vol.price} XOX
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
                {getDisplayVols().length === 0 && (
                  <li className="px-4 py-3 text-gray-500 text-center">
                    Aucun vol trouvé
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Vol retour (si aller-retour) */}
          {formData.tripType === "round-trip" && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faPlaneDeparture} className="mr-2" />
                Vol retour *
              </label>
              <input
                type="text"
                value={returnVolSearch}
                onChange={(e) => handleReturnVolSearch(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Rechercher un vol retour..."
                required={formData.tripType === 'round-trip'}
              />
              {showReturnVolSuggestions && (
                <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
                  {filteredReturnVols.slice(0, 15).map(vol => (
                    <li
                      key={vol.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        setFormData({ ...formData, returnVolId: vol.id });
                        setReturnVolSearch(vol.flight?.name || 'Vol inconnu');
                        setShowReturnVolSuggestions(false);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {vol.flight?.name || 'Vol inconnu'}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <div className="flex items-center">
                              <FontAwesomeIcon icon={faBuilding} className="mr-1 text-gray-400 text-xs" />
                              <span className="font-medium">{vol.agency?.name || vol.agencyName || 'Agence inconnue'}</span>
                            </div>
                            <div className="mt-1">
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {vol.price} XOX
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-2">
                          <span className="text-lg font-bold text-blue-600">
                            {vol.price} XOX
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Le reste du formulaire (destinations, dates, classe, passagers, etc.) */}
        {/* [Gardez le reste du formulaire comme dans le code précédent] */}
        
        {/* Section Destinations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
              Départ *
            </label>
            <input
              type="text"
              value={startDestinationSearch}
              onChange={(e) => handleStartDestinationSearch(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Rechercher une ville de départ..."
              required
            />
            {showStartDestinationSuggestions && (
              <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
                {startDestinations.map(destination => (
                  <li
                    key={destination.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setFormData({ ...formData, startDestinationId: destination.id });
                      setStartDestinationSearch(destination.city);
                      setShowStartDestinationSuggestions(false);
                    }}
                  >
                    {destination.city}, {destination.country}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faMapPin} className="mr-2" />
              Arrivée *
            </label>
            <input
              type="text"
              value={endDestinationSearch}
              onChange={(e) => handleEndDestinationSearch(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Rechercher une ville d'arrivée..."
              required
            />
            {showEndDestinationSuggestions && (
              <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
                {endDestinations.map(destination => (
                  <li
                    key={destination.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setFormData({ ...formData, endDestinationId: destination.id });
                      setEndDestinationSearch(destination.city);
                      setShowEndDestinationSuggestions(false);
                    }}
                  >
                    {destination.city}, {destination.country}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Section Dates et Classe */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
              Date de départ *
            </label>
            <input
              type="date"
              name="startAt"
              value={formData.startAt}
              onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {formData.tripType === "round-trip" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                Date de retour *
              </label>
              <input
                type="date"
                name="endAt"
                value={formData.endAt}
                onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                required={formData.tripType === 'round-trip'}
                min={formData.startAt || new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              Classe *
            </label>
            <input
              type="text"
              value={classSearch}
              onChange={(e) => handleClassSearch(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Rechercher une classe..."
              required
            />
            {showClassSuggestions && (
              <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
                {filteredClasses.map(cls => (
                  <li
                    key={cls.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setFormData({ ...formData, agencyClassId: cls.id });
                      setClassSearch(cls.class?.name || 'Classe inconnue');
                      setShowClassSuggestions(false);
                    }}
                  >
                    {cls.class?.name || 'Classe inconnue'} (x{cls.priceMultiplier})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Section Prix total */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">
              <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
              Prix Total
            </h3>
            <div className="text-2xl font-bold text-green-600">
              {totalPrice.toFixed(2)} XOX
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Ce prix inclut tous les passagers et la classe sélectionnée.
          </div>
        </div>

        {/* Section Passagers */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-xl font-medium text-gray-800">
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              Passagers
            </h2>
            <button
              type="button"
              onClick={addPassenger}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Ajouter un passager
            </button>
          </div>

          {passengers.map((passenger, index) => (
            <div key={index} className="border rounded-lg p-6 space-y-6 bg-white shadow-sm">
              <div className="flex justify-between items-center pb-4 border-b">
                <h3 className="font-semibold text-lg text-gray-800">Passager #{index + 1}</h3>
                <div className="flex space-x-2">
                  {passengers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePassenger(index)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-1" />
                      Supprimer
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FontAwesomeIcon icon={faUser} className="mr-1" />
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={passenger.firstName}
                      onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FontAwesomeIcon icon={faSignature} className="mr-1" />
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={passenger.lastName}
                      onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FontAwesomeIcon icon={faVenusMars} className="mr-1" />
                      Genre *
                    </label>
                    <select
                      value={passenger.gender}
                      onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      required
                    >
                      <option value="">Sélectionner</option>
                      <option value="masculin">Masculin</option>
                      <option value="feminin">Féminin</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de passager *
                    </label>
                    <select
                      value={passenger.typePassenger}
                      onChange={(e) => handlePassengerChange(index, 'typePassenger', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      required
                    >
                      <option value="ADLT">Adulte</option>
                      <option value="CHD">Enfant (2-11 ans)</option>
                      <option value="INF">Nourrisson (0-1 an)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de naissance *
                    </label>
                    <input
                      type="date"
                      value={passenger.birthDate}
                      onChange={(e) => handlePassengerChange(index, 'birthDate', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lieu de naissance *
                    </label>
                    <input
                      type="text"
                      value={passenger.birthPlace}
                      onChange={(e) => handlePassengerChange(index, 'birthPlace', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationalité *
                    </label>
                    <input
                      type="text"
                      value={passenger.nationality}
                      onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profession
                    </label>
                    <input
                      type="text"
                      value={passenger.profession}
                      onChange={(e) => handlePassengerChange(index, 'profession', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Documents du passager */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-800">Documents</h4>
                  <button
                    type="button"
                    onClick={() => addDocument(index)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-1" />
                    Ajouter un document
                  </button>
                </div>

                {passenger.document.map((doc, docIndex) => (
                  <div key={docIndex} className="border rounded-lg p-4 mb-4 space-y-4 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-medium text-gray-800">Document #{docIndex + 1}</h5>
                      <div className="flex space-x-2">
                        {passenger.document.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDocument(index, docIndex)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            Supprimer
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type de document *
                        </label>
                        <select
                          value={doc.documentType}
                          onChange={(e) => handleDocumentChange(index, docIndex, 'documentType', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          required
                        >
                          <option value="">Sélectionner le type</option>
                          <option value="passport">Passeport</option>
                          <option value="id_card">Carte d'identité</option>
                          <option value="driver_license">Permis de conduire</option>
                          <option value="visa">Visa</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Numéro de document *
                        </label>
                        <input
                          type="text"
                          value={doc.documentNumber}
                          onChange={(e) => handleDocumentChange(index, docIndex, 'documentNumber', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date d'émission *
                        </label>
                        <input
                          type="date"
                          value={doc.issueDate}
                          onChange={(e) => handleDocumentChange(index, docIndex, 'issueDate', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date d'expiration *
                        </label>
                        <input
                          type="date"
                          value={doc.expirationDate}
                          onChange={(e) => handleDocumentChange(index, docIndex, 'expirationDate', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fichier du document (Optionnel)
                        </label>
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(index, docIndex, e.target.files[0])}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        {doc.file && (
                          <div className="mt-2 text-sm text-green-600">
                            Fichier sélectionné: {doc.file.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes supplémentaires
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="3"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="Demandes spéciales ou notes..."
          />
        </div>

        {/* Boutons de soumission */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enregistrement en cours...' : 'Enregistrer la réservation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;
