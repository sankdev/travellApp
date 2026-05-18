import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,faArrowLeft,
  faBuilding,
  faSearch,
  faPlane,
  faDollarSign,
  faPlaneDeparture,
  faMapMarkerAlt,
  faMapPin,
  faCalendarAlt,
  faVenusMars,
  faSignature,
  faUser,
  faPlus,
  faTrash,
  faTimes,
  faInfoCircle,
  faExclamationTriangle,
  faExchangeAlt,
  faClock,
  faFilter,
  faPlaneArrival
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États pour les données
  const [destinations, setDestinations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [allVols, setAllVols] = useState([]);
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

  // États pour les suggestions
  const [showAgencySuggestions, setShowAgencySuggestions] = useState(false);
  const [showVolSuggestions, setShowVolSuggestions] = useState(false);
  const [showClassSuggestions, setShowClassSuggestions] = useState(false);
  const [showStartDestinationSuggestions, setShowStartDestinationSuggestions] = useState(false);
  const [showEndDestinationSuggestions, setShowEndDestinationSuggestions] = useState(false);
  const [showReturnVolSuggestions, setShowReturnVolSuggestions] = useState(false);

  // États filtrés
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [filteredVols, setFilteredVols] = useState([]);
  const [vols, setVols] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [startDestinations, setStartDestinations] = useState([]);
  const [endDestinations, setEndDestinations] = useState([]);
  const [filteredReturnVols, setFilteredReturnVols] = useState([]);
  const [returnVols, setReturnVols] = useState([]);

  // États de sélection
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [selectedVol, setSelectedVol] = useState(null);
  const [selectedReturnVol, setSelectedReturnVol] = useState(null);
  const [showAllAgencyFlights, setShowAllAgencyFlights] = useState(false);
  const [showAllReturnAgencyFlights, setShowAllReturnAgencyFlights] = useState(false);
  const [agencyVolCount, setAgencyVolCount] = useState(0);
  const [agencyReturnVolCount, setAgencyReturnVolCount] = useState(0);
 
  // États pour la compagnie
const [companySearch, setCompanySearch] = useState('');
const [filteredCompanies, setFilteredCompanies] = useState([]);
const [selectedCompany, setSelectedCompany] = useState(null);
const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
const [companyVols, setCompanyVols] = useState([]);
const [showCompanyFlights, setShowCompanyFlights] = useState(false);

 const handleGoBack = () => {
    navigate('/customer/reservations');
  };
  // Fonction de recherche de compagnie
const handleCompanySearch = async (value) => {
  setCompanySearch(value);
  
  if (value.trim() === '') {
    setFilteredCompanies([]);
    setShowCompanySuggestions(false);
    return;
  }
  
  try {
    const filtered = companies.filter(company => 
      company.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCompanies(filtered);
    setShowCompanySuggestions(filtered.length > 0);
  } catch (error) {
    console.error('Failed to search companies:', error);
  }
};

// Sélection d'une compagnie
const handleCompanySelection = (company) => {
  setSelectedCompany(company);
  setCompanySearch(company.name);
  setFormData(prev => ({ ...prev, companyId: company.id }));
  setShowCompanySuggestions(false);
  
  // Filtrer les vols de cette compagnie
  const companyVolsFiltered = allVols.filter(vol => 
    vol.flight?.companyId === company.id || vol.companyId === company.id
  );
  setCompanyVols(companyVolsFiltered);
  setShowCompanyFlights(true);
};

// Effacer la sélection de compagnie
const clearCompanySelection = () => {
  setSelectedCompany(null);
  setCompanySearch('');
  setFormData(prev => ({ ...prev, companyId: '' }));
  setShowCompanyFlights(false);
  setCompanyVols([]);
};


  // Données du formulaire
  const [formData, setFormData] = useState({
    agencyId: '',
   companyId:'',
    destinationId: '',
    
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
      expirationDate: '',
      files: []
    }]
  }]);

  const [totalPrice, setTotalPrice] = useState(0);
  const [searchMessage, setSearchMessage] = useState('');

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchDestinations(),
          fetchCompanies(),
          fetchProfile(),
          fetchAllVols(),
          fetchAllAgencies()
        ]);
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError('Échec du chargement des données.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchClasses();
  }, []);

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

      setAgencies(agenciesData);
      setFilteredAgencies(agenciesData);
    } catch (error) {
      console.error('Erreur lors du chargement des agences:', error);
      setAgencies([]);
      setFilteredAgencies([]);
    }
  };

  // Récupérer tous les vols
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

      // Normaliser les données
      volsData = volsData.map(vol => ({
        ...vol,
        agencyId: vol.agencyId || vol.agency?.id,
        agencyName: vol.agency?.name || 'Agence inconnue',
        flightName: vol.flight?.name || 'Vol inconnu',
        companyName: getCompanyById(vol.flight?.companyId) || 'Compagnie inconnue',
        originId: vol.flight?.originId,
        destinationId: vol.flight?.destinationId,
        departureTime: vol.departureTime,
        arrivalTime: vol.arrivalTime,
        price: vol.price || 0
      }));

      setAllVols(volsData);
      setFilteredVols(volsData);
      setVols(volsData);
      setFilteredReturnVols(volsData);
      setReturnVols(volsData);
    } catch (error) {
      console.error('Erreur lors du chargement des vols:', error);
    }
  };

  // Fonctions utilitaires
  const getCompanyById = useCallback((companyId) => {
    const company = companies.find(c => c.id === companyId);
    return company?.name || '';
  }, [companies]);

  const getDestinationById = useCallback((destinationId) => {
    const destination = destinations.find(d => d.id === destinationId);
    return destination?.city || '';
  }, [destinations]);

  const calculateFlightDuration = (departureTime, arrivalTime) => {
    if (!departureTime || !arrivalTime) return 'N/A';
    const dep = new Date(departureTime);
    const arr = new Date(arrivalTime);
    const diff = arr - dep;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Effet pour filtrer les agences
  useEffect(() => {
    if (agencySearch.trim() === '') {
      setFilteredAgencies(agencies);
      setShowAgencySuggestions(false);
    } else {
      const searchTerm = agencySearch.toLowerCase().trim();
      const filtered = agencies.filter(agency => {
        const agencyName = agency.name.toLowerCase();
        return agencyName.startsWith(searchTerm);
      });
      setFilteredAgencies(filtered);
      setShowAgencySuggestions(filtered.length > 0);
      
      if (filtered.length === 0 && searchTerm.length > 0) {
        setSearchMessage(`Aucune agence ne commence par "${agencySearch}"`);
      } else {
        setSearchMessage('');
      }
    }
  }, [agencySearch, agencies]);

  // Effet pour filtrer les vols aller
  useEffect(() => {
    if (!selectedAgency) {
      setFilteredVols(allVols);
      setVols(allVols);
      setAgencyVolCount(0);
      return;
    }

    const agencyVols = allVols.filter(vol =>
      vol.agencyId === selectedAgency.id
    );

    const otherAgencyVols = allVols.filter(vol =>
      !agencyVols.some(av => av.id === vol.id)
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

  // Effet pour filtrer les vols retour
  useEffect(() => {
    if (!selectedAgency) {
      setFilteredReturnVols(allVols);
      setReturnVols(allVols);
      setAgencyReturnVolCount(0);
      return;
    }

    const agencyReturnVols = allVols.filter(vol =>
      vol.agencyId === selectedAgency.id
    );

    const otherAgencyReturnVols = allVols.filter(vol =>
      !agencyReturnVols.some(av => av.id === vol.id)
    );

    setAgencyReturnVolCount(agencyReturnVols.length);

    if (agencyReturnVols.length > 0 && !showAllReturnAgencyFlights) {
      setFilteredReturnVols(agencyReturnVols);
      setReturnVols(agencyReturnVols);
    } else {
      setFilteredReturnVols(otherAgencyReturnVols);
      setReturnVols(otherAgencyReturnVols);
    }
  }, [selectedAgency, showAllReturnAgencyFlights, allVols]);
// Modifier votre effet de filtrage des vols pour prendre en compte la compagnie
useEffect(() => {
  if (!selectedAgency && !selectedCompany) {
    setFilteredVols(allVols);
    setVols(allVols);
    setAgencyVolCount(0);
    return;
  }

  let filtered = allVols;

  // Filtrer par agence si sélectionnée
  if (selectedAgency) {
    filtered = filtered.filter(vol => vol.agencyId === selectedAgency.id);
    setAgencyVolCount(filtered.length);
  }

  // Filtrer par compagnie si sélectionnée (après filtre agence)
  if (selectedCompany) {
    filtered = filtered.filter(vol => 
      vol.flight?.companyId === selectedCompany.id || vol.companyId === selectedCompany.id
    );
  }

  setFilteredVols(filtered);
  setVols(filtered);
}, [selectedAgency, selectedCompany, showAllAgencyFlights, allVols]);
  // Recherche dans les vols aller
  useEffect(() => {
    if (volSearch.length > 0) {
      const searchLower = volSearch.toLowerCase();
      const filtered = filteredVols.filter(vol => {
        const flightName = vol.flightName?.toLowerCase() || '';
        const companyName = vol.companyName?.toLowerCase() || '';
        const origin = getDestinationById(vol.originId)?.toLowerCase() || '';
        const destination = getDestinationById(vol.destinationId)?.toLowerCase() || '';
        const agencyName = vol.agencyName?.toLowerCase() || '';

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
  }, [volSearch, filteredVols, getDestinationById]);

  // Recherche dans les vols retour
  useEffect(() => {
    if (returnVolSearch.length > 0) {
      const searchLower = returnVolSearch.toLowerCase();
      const filtered = filteredReturnVols.filter(vol => {
        const flightName = vol.flightName?.toLowerCase() || '';
        const companyName = vol.companyName?.toLowerCase() || '';
        const origin = getDestinationById(vol.originId)?.toLowerCase() || '';
        const destination = getDestinationById(vol.destinationId)?.toLowerCase() || '';
        const agencyName = vol.agencyName?.toLowerCase() || '';

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
  }, [returnVolSearch, filteredReturnVols, getDestinationById]);

  // Filtrage des classes
  useEffect(() => {
    if (classSearch.length > 0) {
      const filtered = classes.filter((cls) =>
        cls.class?.name?.toLowerCase().includes(classSearch.toLowerCase())
      );
      setFilteredClasses(filtered);
      setShowClassSuggestions(filtered.length > 0);
    } else {
      setFilteredClasses(classes);
      setShowClassSuggestions(false);
    }
  }, [classSearch, classes]);

  // Filtrage des destinations
  useEffect(() => {
    if (startDestinationSearch.trim() === '') {
      setStartDestinations([]);
      setShowStartDestinationSuggestions(false);
    } else {
      const searchTerm = startDestinationSearch.toLowerCase();
      const filtered = destinations.filter(dest =>
        dest.city.toLowerCase().includes(searchTerm) ||
        dest.country.toLowerCase().includes(searchTerm)
      );
      setStartDestinations(filtered);
      setShowStartDestinationSuggestions(filtered.length > 0);
    }
  }, [startDestinationSearch, destinations]);

  useEffect(() => {
    if (endDestinationSearch.trim() === '') {
      setEndDestinations([]);
      setShowEndDestinationSuggestions(false);
    } else {
      const searchTerm = endDestinationSearch.toLowerCase();
      const filtered = destinations.filter(dest =>
        dest.city.toLowerCase().includes(searchTerm) ||
        dest.country.toLowerCase().includes(searchTerm)
      );
      setEndDestinations(filtered);
      setShowEndDestinationSuggestions(filtered.length > 0);
    }
  }, [endDestinationSearch, destinations]);

  // Gestion des prix
  useEffect(() => {
    handlePriceCalculation();
  }, [formData.agencyClassId, formData.returnVolId, formData.agencyVolId, formData.tripType, passengers]);

  // Handlers
  const handleAgencySelection = (agency) => {
    setSelectedAgency(agency);
    setAgencySearch(agency.name);
    setFormData(prev => ({ ...prev, agencyId: agency.id }));
    setShowAgencySuggestions(false);

    // Réinitialiser les sélections de vol
    setVolSearch('');
    setReturnVolSearch('');
    setSelectedVol(null);
    setSelectedReturnVol(null);
    setFormData(prev => ({
      ...prev,
      agencyVolId: '',
      returnVolId: '',
      startAt: '',
      endAt: ''
    }));

    // Réinitialiser l'affichage
    setShowAllAgencyFlights(false);
    setShowAllReturnAgencyFlights(false);
  };

  const handleFlightSelection = (vol) => {
    setSelectedVol(vol);
    setFormData(prev => ({
      ...prev,
      agencyVolId: vol.id,
      startDestinationId: vol.originId || '',
      endDestinationId: vol.destinationId || '',
    }));

    const displayText = vol.flightName ||
      `${vol.companyName} - ${getDestinationById(vol.originId)} to ${getDestinationById(vol.destinationId)}`;

    setVolSearch(displayText);
    setShowVolSuggestions(false);
   setShowCompanyFlights(false);  // Ferme la liste des vols de la compagnie
  setShowCompanySuggestions(false); // Ferme les suggestions de compagnie

    if (vol.originId) {
      const originDest = destinations.find(d => d.id === vol.originId);
      if (originDest) setStartDestinationSearch(originDest.city);
    }
    if (vol.destinationId) {
      const destDest = destinations.find(d => d.id === vol.destinationId);
      if (destDest) setEndDestinationSearch(destDest.city);
    }
  };

  const handleReturnFlightSelection = (vol) => {
    setSelectedReturnVol(vol);
    setFormData(prev => ({ ...prev, returnVolId: vol.id }));

    const displayText = vol.flightName ||
      `${vol.companyName} - ${getDestinationById(vol.originId)} to ${getDestinationById(vol.destinationId)}`;

    setReturnVolSearch(displayText);
    setShowReturnVolSuggestions(false);
  };

  const toggleFlightDisplay = () => {
    setShowAllAgencyFlights(!showAllAgencyFlights);
    setVolSearch('');
  };

  const toggleReturnFlightDisplay = () => {
    setShowAllReturnAgencyFlights(!showAllReturnAgencyFlights);
    setReturnVolSearch('');
  };

  const clearAgencySelection = () => {
    setSelectedAgency(null);
    setAgencySearch('');
    setFormData(prev => ({ ...prev, agencyId: '' }));
    setSelectedVol(null);
    setSelectedReturnVol(null);
    setVolSearch('');
    setReturnVolSearch('');
    setShowAllAgencyFlights(false);
    setShowAllReturnAgencyFlights(false);
    setFilteredVols(allVols);
    setVols(allVols);
    setFilteredReturnVols(allVols);
    setReturnVols(allVols);
  };

  // Fonctions de fetch
  const fetchDestinations = async () => {
    try {
      const response = await destinationService.getDestinations({ search: '' });
      setDestinations(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch destinations:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await companyService.getCompanies();
      setCompanies(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
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

  const fetchClasses = async () => {
    try {
      const response = await agencyAssociationService.getAllClassAgencies();
      setClasses(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
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
          expirationDate: '',
          files: []
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
              { documentType: '', documentNumber: '', issueDate: '', expirationDate: '', files: [] }
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

  const handleFileChange = (passengerIndex, docIndex, files) => {
    setPassengers(prev =>
      prev.map((passenger, i) => {
        if (i === passengerIndex) {
          const updatedDocuments = passenger.document.map((doc, j) =>
            j === docIndex ? { ...doc, files: Array.from(files) } : doc
          );
          return { ...passenger, document: updatedDocuments };
        }
        return passenger;
      })
    );
  };

  // Calcul du prix
  const handlePriceCalculation = async () => {
    try {
      const currentVol = selectedVol || allVols.find(v => v.id === formData.agencyVolId);
      const currentReturnVol = selectedReturnVol || allVols.find(v => v.id === formData.returnVolId);
      const selectedClass = classes.find(cls => cls.id === formData.agencyClassId);

      if (!currentVol || !selectedClass) {
        setTotalPrice(0);
        return;
      }

      let basePrice = currentVol.price * selectedClass.priceMultiplier;

      if (formData.tripType === "round-trip" && currentReturnVol) {
        basePrice += currentReturnVol.price * selectedClass.priceMultiplier;
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

  // Conversion de fichiers en base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve({
          base64: base64String,
          name: file.name,
          type: file.type
        });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validation
      if (!formData.agencyId) throw new Error('Veuillez sélectionner une agence');
      if (!formData.agencyVolId) throw new Error('Veuillez sélectionner un vol aller');
      if (formData.tripType === 'round-trip' && !formData.returnVolId) {
        throw new Error('Veuillez sélectionner un vol retour');
      }

      // Convertir les fichiers en base64
      const passengersWithBase64 = await Promise.all(
        passengers.map(async (passenger) => {
          const documents = await Promise.all(
            passenger.document.map(async (doc) => {
              const filesWithBase64 = await Promise.all(
                (doc.files || []).map(async (file) => {
                  return await convertFileToBase64(file);
                })
              );
              return {
                ...doc,
                files: filesWithBase64
              };
            })
          );
          return { ...passenger, document: documents };
        })
      );

      // Préparer les données de réservation
      const reservationData = {
        ...formData,
        passengers: passengersWithBase64,
        // S'assurer que endAt est null pour les aller simple
        endAt: formData.tripType === 'one-way' ? null : formData.endAt
      };

      // Envoyer la requête
      const response = await reservationService.createReservationDemande(reservationData);

      if (response.success) {
        navigate('/customer/dashboard', { 
          state: { message: 'Réservation créée avec succès!' } 
        });
      } else {
        setError(response.message || 'Erreur lors de la création de la réservation');
      }
    } catch (error) {
      setError(error.message || 'Une erreur est survenue lors de la soumission');
      console.error('Erreur de soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour afficher les vols dans les suggestions
  const renderFlightSuggestion = (vol, isReturn = false) => {
    const isAgencyMatch = vol.agencyId === selectedAgency?.id;
    return (
      <div
        key={vol.id}
        className={`p-3 cursor-pointer hover:bg-${isReturn ? 'purple' : 'blue'}-50 border-b border-gray-100 last:border-b-0 transition-colors`}
        onClick={() => isReturn ? handleReturnFlightSelection(vol) : handleFlightSelection(vol)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon 
                icon={isReturn ? faPlaneArrival : faPlaneDeparture} 
                className={`text-${isReturn ? 'purple' : 'blue'}-500`} 
              />
              <div>
                <p className="font-medium text-gray-800">{vol.flightName}</p>
                <p className="text-sm text-gray-600">
                  {getDestinationById(vol.originId) || 'Inconnu'} → 
                  {getDestinationById(vol.destinationId) || 'Inconnu'}
                </p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">{vol.companyName}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                isAgencyMatch ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {vol.agencyName}
              </span>
              {vol.departureTime && (
                <span className="text-xs text-gray-500">
                  Départ: {new Date(vol.departureTime).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">{vol.price} XOX</p>
            {vol.departureTime && vol.arrivalTime && (
              <p className="text-xs text-gray-500 mt-1">
                <FontAwesomeIcon icon={faClock} className="mr-1" />
                {calculateFlightDuration(vol.departureTime, vol.arrivalTime)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
       <button
            onClick={() => navigate('/customer/reservations')}
            className="mb-6 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
        >
            <FontAwesomeIcon icon={faArrowLeft} />
            Retour aux réservations
        </button>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Demande de Réservation</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          {error}
        </div>
      )}

      {searchMessage && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {searchMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section Agence */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <FontAwesomeIcon icon={faBuilding} className="mr-2 text-green-500" />
            Sélection de l'Agence
          </h2>

          <div className="relative mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher une agence *
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
                placeholder="Commencez à taper le nom d'une agence..."
                className="block w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />

              {agencySearch && (
                <button
                  type="button"
                  onClick={clearAgencySelection}
                  className="absolute right-3 text-gray-400 hover:text-gray-600"
                  title="Effacer la recherche"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>

            {showAgencySuggestions && filteredAgencies.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-600">
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
          </div>

          {selectedAgency && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faBuilding} className="text-green-600 text-xl" />
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
                    className="text-sm px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2 transition-colors"
                  >
                    <FontAwesomeIcon icon={faExchangeAlt} />
                    {showAllAgencyFlights ? 'Voir les vols de cette agence' : 'Voir les vols d\'autres agences'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        
{/* Section Compagnie (Optionnelle) */}
<div className="bg-white shadow rounded-lg p-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-medium text-gray-800 flex items-center">
      <FontAwesomeIcon icon={faPlane} className="mr-2 text-indigo-500" />
      Compagnie Aérienne (Optionnel)
    </h2>
    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
      Optionnel
    </span>
  </div>

  <p className="text-sm text-gray-600 mb-4">
    Filtrer les vols par compagnie aérienne. Si vous sélectionnez une compagnie, 
    seuls les vols de cette compagnie seront affichés.
  </p>

  <div className="relative mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Rechercher une compagnie
    </label>

    <div className="relative flex items-center">
      <FontAwesomeIcon icon={faSearch} className="absolute left-3 text-gray-400" />
      <input
        type="text"
        value={companySearch}
        onChange={(e) => handleCompanySearch(e.target.value)}
        onFocus={() => {
          if (filteredCompanies.length > 0 && companySearch.trim().length > 0) {
            setShowCompanySuggestions(true);
          }
        }}
        onBlur={() => {
          setTimeout(() => setShowCompanySuggestions(false), 200);
        }}
        placeholder="Ex: AIR FRANCE, Emirates, Qatar Airways..."
        className="block w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />

      {companySearch && (
        <button
          type="button"
          onClick={clearCompanySelection}
          className="absolute right-3 text-gray-400 hover:text-gray-600"
          title="Effacer la recherche"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
    </div>

    {showCompanySuggestions && filteredCompanies.length > 0 && (
      <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-600">
            {filteredCompanies.length} compagnie(s) trouvée(s)
          </p>
        </div>
        {filteredCompanies.map((company) => (
          <li
            key={company.id}
            className={`p-3 cursor-pointer hover:bg-indigo-50 border-b border-gray-100 last:border-b-0 transition-all ${
              selectedCompany?.id === company.id ? 'bg-indigo-50' : ''
            }`}
            onClick={() => handleCompanySelection(company)}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={faPlane}
                className={`${selectedCompany?.id === company.id ? 'text-indigo-500' : 'text-gray-400'}`}
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {company.name}
                  {selectedCompany?.id === company.id && (
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                      Sélectionnée
                    </span>
                  )}
                </div>
                {company.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {company.description}
                  </p>
                )}
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    company.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {company.status}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>

  {selectedCompany && (
    <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faPlane} className="text-indigo-600 text-xl" />
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Compagnie sélectionnée: 
                <span className="text-indigo-700 ml-1">{selectedCompany.name}</span>
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedCompany.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedCompany.status}
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {companyVols.length} vol(s) disponible(s)
                </span>
                {selectedCompany.code && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                    Code: {selectedCompany.code}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={clearCompanySelection}
          className="text-sm px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} />
          Supprimer la sélection
        </button>
      </div>

      {/* Afficher les vols de la compagnie */}
      {showCompanyFlights && companyVols.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              Vols disponibles de {selectedCompany.name}
            </h4>
            <button
              type="button"
              onClick={() => setShowCompanyFlights(!showCompanyFlights)}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              {showCompanyFlights ? 'Masquer' : 'Afficher'}
            </button>
          </div>

          {showCompanyFlights && (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {companyVols.map((vol) => (
                <div
                  key={vol.id}
                  className="p-3 bg-white rounded border border-gray-200 hover:border-indigo-300 transition-colors"
                  onClick={() => handleFlightSelection(vol)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{vol.flightName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-600">
                          {getDestinationById(vol.originId)} → {getDestinationById(vol.destinationId)}
                        </span>
                        <span className="text-xs text-gray-500">
                          • {vol.agencyName}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                          {vol.companyName}
                        </span>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          {vol.price} XOX
                        </span>
                      </div>
                    </div>
                    {vol.departureTime && vol.arrivalTime && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(vol.departureTime).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {calculateFlightDuration(vol.departureTime, vol.arrivalTime)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showCompanyFlights && companyVols.length === 0 && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-700">
            Aucun vol disponible pour {selectedCompany.name} avec les critères actuels.
          </p>
          <button
            type="button"
            onClick={clearCompanySelection}
            className="mt-2 text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
          >
            Voir tous les vols
          </button>
        </div>
      )}
    </div>
  )}
</div>

        {/* Section Vol Aller */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <FontAwesomeIcon icon={faPlaneDeparture} className="mr-2 text-blue-500" />
            Sélection du Vol Aller
          </h2>

          <div className="relative mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher un vol aller *
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
                placeholder="Rechercher par nom, compagnie, destination..."
                className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!selectedAgency}
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>

            {!selectedAgency && (
              <p className="mt-2 text-sm text-yellow-600 flex items-center gap-2">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                Veuillez d'abord sélectionner une agence pour voir les vols disponibles
              </p>
            )}

            {selectedAgency && agencyVolCount === 0 && !showAllAgencyFlights && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700 mb-2">
                  Cette agence n'a pas de vols disponibles.
                </p>
                <button
                  type="button"
                  onClick={toggleFlightDisplay}
                  className="text-sm px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faFilter} />
                  Voir les vols d'autres agences
                </button>
              </div>
            )}

            {showVolSuggestions && vols.length > 0 && (
              <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto">
                {vols.map((vol) => renderFlightSuggestion(vol, false))}
              </div>
            )}

            {showVolSuggestions && vols.length === 0 && volSearch.trim().length > 0 && (
              <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 p-4">
                <p className="text-sm text-gray-500 text-center">Aucun vol trouvé</p>
              </div>
            )}
          </div>

          {selectedVol && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-600 text-xl" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Vol aller sélectionné: <span className="text-blue-700">{selectedVol.flightName}</span>
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {selectedVol.companyName}
                        </span>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          {selectedVol.price} XOX
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                          {selectedVol.agencyName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section Type de voyage et Vol Retour */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Type de Voyage</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type de voyage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  if (newTripType === 'one-way') {
                    setSelectedReturnVol(null);
                    setReturnVolSearch('');
                    setShowAllReturnAgencyFlights(false);
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="one-way">Aller simple</option>
                <option value="round-trip">Aller-retour</option>
              </select>
            </div>

            {/* Section Vol Retour - UNIQUEMENT si aller-retour */}
            {formData.tripType === "round-trip" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vol retour *
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                      disabled={!selectedAgency}
                    />
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                  </div>

                  {!selectedAgency && (
                    <p className="mt-1 text-xs text-yellow-600">
                      Veuillez d'abord sélectionner une agence
                    </p>
                  )}

                  {selectedAgency && agencyReturnVolCount === 0 && !showAllReturnAgencyFlights && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-700 mb-1">
                        Cette agence n'a pas de vols retour disponibles.
                      </p>
                      <button
                        type="button"
                        onClick={toggleReturnFlightDisplay}
                        className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faExchangeAlt} />
                        Voir les vols retour d'autres agences
                      </button>
                    </div>
                  )}

                  {showReturnVolSuggestions && returnVols.length > 0 && (
                    <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto">
                      {returnVols.map((vol) => renderFlightSuggestion(vol, true))}
                    </div>
                  )}
                </div>

                {selectedReturnVol && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faPlaneArrival} className="text-purple-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          Vol retour sélectionné: <span className="text-purple-700">{selectedReturnVol.flightName}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {selectedReturnVol.companyName}
                          </span>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            {selectedReturnVol.price} XOX
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section Destinations */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Destinations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Départ */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville de départ *
              </label>
              <input
                type="text"
                value={startDestinationSearch}
                onChange={(e) => setStartDestinationSearch(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Paris, New York..."
                required
              />
              {showStartDestinationSuggestions && startDestinations.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {startDestinations.map(destination => (
                    <div
                      key={destination.id}
                      className="p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100"
                      onClick={() => {
                        setFormData({ ...formData, startDestinationId: destination.id });
                        setStartDestinationSearch(destination.city);
                        setShowStartDestinationSuggestions(false);
                      }}
                    >
                      <div className="font-medium">{destination.city}</div>
                      <div className="text-sm text-gray-600">{destination.country}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Arrivée */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville d'arrivée *
              </label>
              <input
                type="text"
                value={endDestinationSearch}
                onChange={(e) => setEndDestinationSearch(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Londres, Tokyo..."
                required
              />
              {showEndDestinationSuggestions && endDestinations.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {endDestinations.map(destination => (
                    <div
                      key={destination.id}
                      className="p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100"
                      onClick={() => {
                        setFormData({ ...formData, endDestinationId: destination.id });
                        setEndDestinationSearch(destination.city);
                        setShowEndDestinationSuggestions(false);
                      }}
                    >
                      <div className="font-medium">{destination.city}</div>
                      <div className="text-sm text-gray-600">{destination.country}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section Dates et Classe */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Dates et Classe</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date de départ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de départ *
              </label>
              <input
                type="date"
                name="startAt"
                value={formData.startAt}
                onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Date de retour - seulement pour aller-retour */}
            {formData.tripType === "round-trip" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de retour *
                </label>
                <input
                  type="date"
                  name="endAt"
                  value={formData.endAt}
                  onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  min={formData.startAt || new Date().toISOString().split('T')[0]}
                />
              </div>
            )}

            {/* Classe */}
            <div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Classe <span className="text-red-500">*</span>
  </label>
  
  {/* Bouton pour ouvrir la liste déroulante */}
  <button
    type="button"
    onClick={() => setShowClassSuggestions(!showClassSuggestions)}
    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
  >
    <span className={formData.agencyClassId ? 'text-gray-900' : 'text-gray-500'}>
      {formData.agencyClassId 
        ? classes.find(c => c.id === formData.agencyClassId)?.class?.name || 'Classe sélectionnée'
        : 'Sélectionnez une classe'
      }
    </span>
    <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showClassSuggestions ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {/* Liste déroulante des classes */}
  {showClassSuggestions && (
    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 overflow-y-auto">
      {/* En-tête de la liste */}
      <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-3 font-medium">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Choisissez une classe</span>
        </div>
      </div>

      {/* Champ de recherche dans la liste déroulante */}
      <div className="p-2 border-b border-gray-200 bg-gray-50">
        <div className="relative">
          <input
            type="text"
            value={classSearch}
            onChange={(e) => setClassSearch(e.target.value)}
            placeholder="Rechercher une classe..."
            className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            autoFocus
          />
          <svg className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {classSearch && (
            <button
              onClick={() => setClassSearch('')}
              className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Liste des classes filtrées */}
      <div className="divide-y divide-gray-100">
        {filteredClasses.length > 0 ? (
          filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className={`p-3 cursor-pointer transition-all hover:bg-indigo-50 ${
                formData.agencyClassId === cls.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
              }`}
              onClick={() => {
                setFormData({ ...formData, agencyClassId: cls.id });
                setClassSearch(''); // Réinitialiser la recherche
                setShowClassSuggestions(false);
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    {cls.class?.name || 'Classe inconnue'}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Multiplicateur: x{cls.priceMultiplier}
                    </span>
                    {cls.class?.description && (
                      <span className="flex items-center gap-1 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {cls.class.description.substring(0, 30)}...
                      </span>
                    )}
                  </div>
                </div>
                {formData.agencyClassId === cls.id && (
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">Aucune classe trouvée</p>
            <p className="text-sm mt-1">Essayez d'autres termes de recherche</p>
          </div>
        )}
      </div>

      {/* Pied de la liste */}
      <div className="sticky bottom-0 bg-gray-50 p-2 border-t border-gray-200 text-xs text-gray-500 text-center">
        {filteredClasses.length} classe(s) disponible(s)
      </div>
    </div>
  )}

  {/* Message d'information si aucune classe */}
  {filteredClasses.length === 0 && classSearch && (
    <p className="mt-2 text-sm text-yellow-600 flex items-center gap-1">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      Aucune classe ne correspond à votre recherche
    </p>
  )}

  {/* Affichage de la classe sélectionnée */}
  {formData.agencyClassId && !showClassSuggestions && (
    <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <span className="text-sm text-gray-600">Classe sélectionnée:</span>
          <span className="ml-2 font-semibold text-indigo-700">
            {classes.find(c => c.id === formData.agencyClassId)?.class?.name}
          </span>
        </div>
      </div>
      <button
        onClick={() => {
          setFormData({ ...formData, agencyClassId: '' });
          setClassSearch('');
        }}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        title="Changer de classe"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
    </div>
  )}
</div>
          </div>
        </div>

        {/* Section Prix total */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Prix Total</h3>
              <p className="text-sm text-gray-600">
                {formData.tripType === 'round-trip' 
                  ? 'Prix incluant aller-retour, passagers et classe' 
                  : 'Prix incluant passagers et classe'}
              </p>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {totalPrice.toFixed(2)} XOX
            </div>
          </div>
        </div>

        {/* Section Passagers */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <h2 className="text-xl font-medium text-gray-800">Passagers</h2>
            <button
              type="button"
              onClick={addPassenger}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              Ajouter un passager
            </button>
          </div>

          {passengers.map((passenger, index) => (
            <div key={index} className="border rounded-lg p-6 mb-6 last:mb-0 bg-gray-50">
              <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h3 className="font-semibold text-lg">Passager #{index + 1}</h3>
                {passengers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePassenger(index)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Supprimer
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Colonne gauche */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={passenger.firstName}
                      onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={passenger.lastName}
                      onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre *
                    </label>
                    <select
                      value={passenger.gender}
                      onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    >
                      <option value="">Sélectionner</option>
                      <option value="masculin">Masculin</option>
                      <option value="feminin">Féminin</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                {/* Colonne droite */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de naissance *
                    </label>
                    <input
                      type="date"
                      value={passenger.birthDate}
                      onChange={(e) => handlePassengerChange(index, 'birthDate', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
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
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de passager *
                    </label>
                    <select
                      value={passenger.typePassenger}
                      onChange={(e) => handlePassengerChange(index, 'typePassenger', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    >
                      <option value="ADLT">Adulte</option>
                      <option value="CHD">Enfant</option>
                      <option value="INF">Nourrisson</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Documents du passager */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium">Documents</h4>
                  <button
                    type="button"
                    onClick={() => addDocument(index)}
                    className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Ajouter un document
                  </button>
                </div>

                {passenger.document.map((doc, docIndex) => (
                  <div key={docIndex} className="border rounded p-4 mb-4 last:mb-0 bg-white">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="font-medium">Document #{docIndex + 1}</h5>
                      {passenger.document.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDocument(index, docIndex)}
                          className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex items-center gap-1"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          Supprimer
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de document *
                </label>
                <select
                    value={doc.documentType}
                    onChange={(e) => handleDocumentChange(index, docIndex, 'documentType', e.target.value)}
                    className="border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm px-4 py-2"
                    required
                >
                    <option value="">Select Document Type</option>
                    <option value="passport">Passport</option>
                    <option value="acte_naissance">Acte de Naissance</option>
                    <option value="permis">Permis</option>
                    <option value="carte_identite">Carte d'Identité</option>
                    <option value="visa">Visa</option>
                </select>
            </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Numéro *
                        </label>
                        <input
                          type="text"
                          value={doc.documentNumber}
                          onChange={(e) => handleDocumentChange(index, docIndex, 'documentNumber', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded"
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
                          className="w-full p-2 border border-gray-300 rounded"
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
                          className="w-full p-2 border border-gray-300 rounded"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fichiers (optionnel)
                        </label>
                        <input
                          type="file"
                          multiple
                          onChange={(e) => handleFileChange(index, docIndex, e.target.files)}
                          className="w-full p-2 border border-gray-300 rounded"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        {doc.files && doc.files.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              {doc.files.length} fichier(s) sélectionné(s)
                            </p>
                            <ul className="text-xs text-gray-500 mt-1">
                              {Array.from(doc.files).map((file, i) => (
                                <li key={i}>{file.name}</li>
                              ))}
                            </ul>
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
        <div className="bg-white shadow rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes supplémentaires
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Demandes spéciales, commentaires ou notes..."
          />
        </div>

        {/* Boutons de soumission */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-orange-50 transition-colors"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Enregistrement en cours...' : 'Enregistrer la réservation'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg">Chargement des données...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationForm;
