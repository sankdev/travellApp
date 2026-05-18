import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faArrowLeft,
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
  faPlaneArrival,
  faCog,
  faCheckCircle,
  faBaby,
  faChild,
  faUserTie,
  faSpinner,
  faTicketAlt,
  faChair,
  faChevronDown,
  faChevronUp,
  faBriefcase
} from '@fortawesome/free-solid-svg-icons';

// Services
import { agencyService } from '../../../services/agencyService';
import { companyService } from '../../../services/companyService';
import { customerService } from '../../../services/customerService';
import { destinationService } from '../../../services/destinationService';
import { agencyAssociationService } from '../../../services/agencyAssociationService';
import { reservationService } from '../../../services/reservationService';
import { pricingRuleService } from '../../../services/pricingRuleService';
import { classeService } from '../../../services/classService';

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
  const [classAgencies, setClassAgencies] = useState([]);
  const [classes, setClasses] = useState([]);
  const [profile, setProfile] = useState({});
  const [pricingRules, setPricingRules] = useState([]);

  // États de recherche
  const [agencySearch, setAgencySearch] = useState('');
  const [volSearch, setVolSearch] = useState('');
  const [startDestinationSearch, setStartDestinationSearch] = useState('');
  const [endDestinationSearch, setEndDestinationSearch] = useState('');
  const [returnVolSearch, setReturnVolSearch] = useState('');

  // États pour les suggestions
  const [showAgencySuggestions, setShowAgencySuggestions] = useState(false);
  const [showVolSuggestions, setShowVolSuggestions] = useState(false);
  const [showStartDestinationSuggestions, setShowStartDestinationSuggestions] = useState(false);
  const [showEndDestinationSuggestions, setShowEndDestinationSuggestions] = useState(false);
  const [showReturnVolSuggestions, setShowReturnVolSuggestions] = useState(false);

  // États filtrés
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [filteredVols, setFilteredVols] = useState([]);
  const [vols, setVols] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [startDestinations, setStartDestinations] = useState([]);
  const [endDestinations, setEndDestinations] = useState([]);
  const [filteredReturnVols, setFilteredReturnVols] = useState([]);
  const [returnVols, setReturnVols] = useState([]);

  // États de sélection
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [selectedVol, setSelectedVol] = useState(null);
  const [selectedReturnVol, setSelectedReturnVol] = useState(null);
  const [selectedClassAgency, setSelectedClassAgency] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showAllAgencyFlights, setShowAllAgencyFlights] = useState(false);
  const [showAllReturnAgencyFlights, setShowAllReturnAgencyFlights] = useState(false);
  const [agencyVolCount, setAgencyVolCount] = useState(0);
  const [agencyReturnVolCount, setAgencyReturnVolCount] = useState(0);

  // États pour la compagnie
  const [showCompanySection, setShowCompanySection] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [filterByCompany, setFilterByCompany] = useState(false);

  // États pour la liste déroulante des classes
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [classDropdownSearch, setClassDropdownSearch] = useState('');

  // Données du formulaire
  const [formData, setFormData] = useState({
    agencyId: '',
    companyId: '',
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
    classId: '',
    tripType: 'one-way',
    totalPrice: 0
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

  const inputClassName = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm";

  // Fonction pour obtenir le libellé du type de passager
  const getPassengerTypeLabel = (type) => {
    const types = {
      'ADLT': { label: 'Adulte', icon: faUserTie, color: 'blue' },
      'CHD': { label: 'Enfant (2-12 ans)', icon: faChild, color: 'green' },
      'INF': { label: 'Bébé (0-2 ans)', icon: faBaby, color: 'purple' }
    };
    return types[type] || { label: type, icon: faUser, color: 'gray' };
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
          fetchAllVols(),
          fetchAllAgencies(),
          fetchClassAgencies(),
          fetchPricingRules(),
          fetchClasses()
        ]);
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError('Échec du chargement des données.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Récupérer toutes les classes disponibles
  const fetchClasses = async () => {
    try {
      const response = await classeService.getClasses();
      const classesData = response?.data || response || [];
      console.log('🎫 Classes disponibles:', classesData);
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (err) {
      console.error('❌ Erreur chargement classes:', err);
      setError('Failed to fetch classes');
    }
  };

  // Récupérer toutes les règles de prix
  const fetchPricingRules = async () => {
    try {
      const response = await pricingRuleService.getAllPricingRules();
      const rulesData = response?.data || response || [];
      setPricingRules(Array.isArray(rulesData) ? rulesData : []);
      console.log('📋 Règles de prix chargées:', rulesData);
    } catch (error) {
      console.error('❌ Erreur chargement règles de prix:', error);
    }
  };

  // Récupérer toutes les ClassAgency
  const fetchClassAgencies = async () => {
    try {
      const response = await agencyAssociationService.getAllClassAgencies();
      const classData = response?.data || response || [];
      setClassAgencies(Array.isArray(classData) ? classData : []);
      console.log('📦 ClassAgencies chargées:', classData);
    } catch (error) {
      console.error('❌ Erreur chargement ClassAgency:', error);
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

      setAgencies(agenciesData);
      setFilteredAgencies(agenciesData);
      console.log(`🏢 ${agenciesData.length} agences chargées`);
    } catch (error) {
      console.error('Erreur chargement agences:', error);
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

      // Normaliser les données
      volsData = volsData.map(vol => ({
        ...vol,
        agencyId: vol.agencyId || vol.agency?.id,
        agencyName: vol.agency?.name || 'Agence inconnue',
        flightName: vol.flight?.name || 'Vol inconnu',
        companyName: vol.flight?.companyVol?.name || 'Compagnie inconnue',
        companyId: vol.flight?.companyVol?.id || vol.flight?.companyId,
        originId: vol.flight?.originId,
        destinationId: vol.flight?.destinationId,
        departureTime: vol.departureTime,
        arrivalTime: vol.arrivalTime,
        origin: vol.flight?.origin,
        destination: vol.flight?.destination,
        company: vol.flight?.companyVol
      }));
      
      console.log('📦 Vols agence chargés:', volsData);
      setAllVols(volsData);
      setFilteredVols(volsData);
      setVols(volsData);
      setFilteredReturnVols(volsData);
      setReturnVols(volsData);
    } catch (error) {
      console.error('Erreur chargement vols:', error);
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

  const getClassNameById = useCallback((classId) => {
    const classe = classes.find(c => c.id === classId);
    return classe?.name || 'Classe inconnue';
  }, [classes]);

  const calculateFlightDuration = (departureTime, arrivalTime) => {
    if (!departureTime || !arrivalTime) return 'N/A';
    const dep = new Date(departureTime);
    const arr = new Date(arrivalTime);
    const diff = arr - dep;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // ✅ CORRECTION: Filtrage des agences
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
      
      if (filtered.length === 0 && searchTerm.length > 0) {
        setSearchMessage(`Aucune agence ne commence par "${agencySearch}"`);
      } else {
        setSearchMessage('');
      }
    }
  }, [agencySearch, agencies]);

  // ✅ CORRECTION: Filtrer les vols par agence sélectionnée
  useEffect(() => {
    if (!selectedAgency) {
      setFilteredVols([]);
      setVols([]);
      setAgencyVolCount(0);
      return;
    }

    // Filtrer les vols de l'agence sélectionnée
    let agencyFlights = allVols.filter(vol => vol.agencyId === selectedAgency.id);
    
    // Appliquer le filtre compagnie si actif
    if (selectedCompany && filterByCompany) {
      agencyFlights = agencyFlights.filter(vol => 
        vol.companyId === selectedCompany.id
      );
    }

    setAgencyVolCount(agencyFlights.length);
    setFilteredVols(agencyFlights);
    setVols(agencyFlights);
    
    // Afficher un message si aucun vol trouvé
    if (agencyFlights.length === 0) {
      if (selectedCompany && filterByCompany) {
        setSearchMessage(`Aucun vol trouvé pour ${selectedCompany.name} dans cette agence`);
      } else {
        setSearchMessage('Aucun vol disponible pour cette agence');
      }
    } else {
      setSearchMessage('');
    }
  }, [selectedAgency, selectedCompany, filterByCompany, allVols]);

  // ✅ CORRECTION: Filtrer les vols retour par agence
  useEffect(() => {
    if (!selectedAgency) {
      setFilteredReturnVols([]);
      setReturnVols([]);
      setAgencyReturnVolCount(0);
      return;
    }

    const agencyReturnFlights = allVols.filter(vol => vol.agencyId === selectedAgency.id);
    setAgencyReturnVolCount(agencyReturnFlights.length);
    setFilteredReturnVols(agencyReturnFlights);
    setReturnVols(agencyReturnFlights);
  }, [selectedAgency, allVols]);

  // ✅ CORRECTION: Recherche dans les vols aller
  useEffect(() => {
    if (volSearch.length > 0) {
      const searchLower = volSearch.toLowerCase();
      const filtered = filteredVols.filter(vol => {
        const flightName = vol.flightName?.toLowerCase() || '';
        const companyName = vol.companyName?.toLowerCase() || '';
        const origin = getDestinationById(vol.originId)?.toLowerCase() || '';
        const destination = getDestinationById(vol.destinationId)?.toLowerCase() || '';

        return flightName.includes(searchLower) ||
               companyName.includes(searchLower) ||
               origin.includes(searchLower) ||
               destination.includes(searchLower);
      });
      setVols(filtered);
      setShowVolSuggestions(filtered.length > 0 && volSearch.trim().length > 0);
    } else {
      setVols(filteredVols);
      setShowVolSuggestions(false);
    }
  }, [volSearch, filteredVols, getDestinationById]);

  // ✅ CORRECTION: Recherche dans les vols retour
  useEffect(() => {
    if (returnVolSearch.length > 0) {
      const searchLower = returnVolSearch.toLowerCase();
      const filtered = filteredReturnVols.filter(vol => {
        const flightName = vol.flightName?.toLowerCase() || '';
        const companyName = vol.companyName?.toLowerCase() || '';
        const origin = getDestinationById(vol.originId)?.toLowerCase() || '';
        const destination = getDestinationById(vol.destinationId)?.toLowerCase() || '';

        return flightName.includes(searchLower) ||
               companyName.includes(searchLower) ||
               origin.includes(searchLower) ||
               destination.includes(searchLower);
      });
      setReturnVols(filtered);
      setShowReturnVolSuggestions(filtered.length > 0 && returnVolSearch.trim().length > 0);
    } else {
      setReturnVols(filteredReturnVols);
      setShowReturnVolSuggestions(false);
    }
  }, [returnVolSearch, filteredReturnVols, getDestinationById]);

  // ✅ CORRECTION: Gestion des classes disponibles pour le vol sélectionné
  useEffect(() => {
    if (selectedVol) {
      console.log('🎯 Vol sélectionné ID:', selectedVol.id);
      
      // Filtrer les classes qui correspondent au vol sélectionné
      const availableClassesForFlight = classAgencies.filter(ca => 
        ca.agencyVol?.id === selectedVol.id && ca.status === 'active'
      );
      
      console.log(`🔍 ${availableClassesForFlight.length} classes disponibles trouvées pour ce vol`);
      
      // Enrichir avec les informations détaillées des classes
      const enrichedClasses = availableClassesForFlight.map(classAgency => {
        const classDetail = classes.find(c => c.id === classAgency.classId);
        return {
          ...classAgency,
          classDetails: classDetail || { name: 'Classe inconnue', description: '' }
        };
      });
      
      setAvailableClasses(enrichedClasses);
      
      // Réinitialiser la classe sélectionnée si elle n'est plus disponible
      if (selectedClassAgency && !enrichedClasses.some(c => c.id === selectedClassAgency.id)) {
        setSelectedClassAgency(null);
        setSelectedClass(null);
        setFormData(prev => ({ ...prev, agencyClassId: '', classId: '' }));
      }
    } else {
      setAvailableClasses([]);
    }
  }, [selectedVol, classAgencies, classes]);

  // ✅ CORRECTION: Filtrage des classes pour la liste déroulante
  const getFilteredClassesForDropdown = () => {
    if (!classDropdownSearch.trim()) {
      return availableClasses;
    }
    const searchLower = classDropdownSearch.toLowerCase();
    return availableClasses.filter(classAgency => {
      const className = classAgency.classDetails?.name?.toLowerCase() || '';
      const classDescription = classAgency.classDetails?.description?.toLowerCase() || '';
      return className.includes(searchLower) || classDescription.includes(searchLower);
    });
  };

  // ✅ CORRECTION: Gestion de la compagnie
  const toggleCompanySection = () => {
    setShowCompanySection(!showCompanySection);
  };

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

  const handleCompanySelection = (company) => {
    setSelectedCompany(company);
    setCompanySearch(company.name);
    setFormData(prev => ({ ...prev, companyId: company.id }));
    setShowCompanySuggestions(false);
    setFilterByCompany(true);
    
    // Filtrer les vols de cette compagnie pour l'agence sélectionnée
    if (selectedAgency) {
      const companyFlights = allVols.filter(vol => 
        vol.agencyId === selectedAgency.id && 
        vol.companyId === company.id
      );
      
      // Afficher un message si aucun vol trouvé
      if (companyFlights.length === 0) {
        setSearchMessage(`Aucun vol trouvé pour ${company.name} dans cette agence`);
      } else {
        setSearchMessage('');
      }
    }
  };

  const clearCompanySelection = () => {
    setSelectedCompany(null);
    setCompanySearch('');
    setFormData(prev => ({ ...prev, companyId: '' }));
    setFilterByCompany(false);
    setSearchMessage('');
  };

  const toggleCompanyFilter = () => {
    setFilterByCompany(!filterByCompany);
  };

  // Filtrage des destinations
  useEffect(() => {
    if (startDestinationSearch.trim() === '') {
      setStartDestinations([]);
      setShowStartDestinationSuggestions(false);
    } else {
      const searchTerm = startDestinationSearch.toLowerCase();
      const filtered = destinations.filter(dest =>
        dest.city?.toLowerCase().includes(searchTerm) ||
        dest.country?.toLowerCase().includes(searchTerm)
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
        dest.city?.toLowerCase().includes(searchTerm) ||
        dest.country?.toLowerCase().includes(searchTerm)
      );
      setEndDestinations(filtered);
      setShowEndDestinationSuggestions(filtered.length > 0);
    }
  }, [endDestinationSearch, destinations]);

  // ============================================
  // CALCUL DU PRIX TOTAL - CORRIGÉ
  // ============================================
  const calculateTotalPrice = useCallback(async () => {
    try {
      if (!selectedVol || !selectedClassAgency) {
        setTotalPrice(0);
        return;
      }

      console.log('🧮 Calcul du prix total...');
      console.log('Vol aller:', selectedVol.id);
      console.log('Classe sélectionnée:', selectedClassAgency);

      // Prix de base de la classe pour un adulte
      const adultBasePrice = parseFloat(selectedClassAgency.price) || 0;
      console.log('💰 Prix base adulte:', adultBasePrice);

      // Créer un map des règles pour la classe aller
      const rulesMap = {};
      pricingRules
        .filter(rule => rule.agencyClassId === selectedClassAgency.id)
        .forEach(rule => {
          rulesMap[rule.typePassenger] = parseFloat(rule.price) || 0;
        });
      console.log('🗺️ Règles pour cette classe:', rulesMap);

      // Calcul du prix ALLER
      let totalPrice = 0;
      
      passengers.forEach((passenger, index) => {
        const passengerType = passenger.typePassenger;
        console.log(`👤 Passager ${index + 1} - Type: ${passengerType}`);
        
        // Prix de base pour ce passager (aller)
        let passengerPrice = adultBasePrice;
        
        // Ajouter la règle si ce n'est pas un adulte
        if (passengerType !== 'ADLT') {
          const rulePrice = rulesMap[passengerType];
          if (rulePrice) {
            passengerPrice += rulePrice;
            console.log(`  ➕ Règle ${passengerType === 'CHD' ? 'enfant' : 'bébé'}: +${rulePrice}`);
          }
        }
        
        totalPrice += passengerPrice;
        console.log(`  = Total aller pour ce passager: ${passengerPrice}`);
      });

      console.log('💰 Prix après aller:', totalPrice);

      // Si aller-retour, ajouter le prix RETOUR
      if (formData.tripType === "round-trip" && selectedReturnVol) {
        console.log('🔄 Traitement vol retour');
        
        // Chercher la classe correspondante pour le vol retour
        const returnClass = classAgencies.find(cls => 
          cls.agencyVol?.id === selectedReturnVol.id && 
          cls.classId === selectedClassAgency.classId
        );

        if (returnClass) {
          const returnAdultPrice = parseFloat(returnClass.price) || 0;
          console.log('💰 Prix retour adulte:', returnAdultPrice);
          
          // Ajouter le prix retour pour chaque passager
          passengers.forEach((passenger, index) => {
            totalPrice += returnAdultPrice;
            console.log(`  ➕ Retour passager ${index + 1}: +${returnAdultPrice}`);
          });
        } else {
          console.warn('⚠️ Aucune classe trouvée pour le vol retour');
          // Fallback: même prix que l'aller
          const fallbackPrice = adultBasePrice * passengers.length;
          totalPrice += fallbackPrice;
          console.log(`  ➕ Retour (fallback): +${fallbackPrice}`);
        }
      }

      console.log('💰 PRIX TOTAL FINAL:', totalPrice);
      setTotalPrice(totalPrice);
      setFormData(prev => ({ ...prev, totalPrice }));

    } catch (error) {
      console.error("❌ Erreur calcul prix:", error);
      setTotalPrice(0);
    }
  }, [selectedVol, selectedReturnVol, selectedClassAgency, passengers, formData.tripType, pricingRules, classAgencies]);

  // Recalculer le prix quand les dépendances changent
  useEffect(() => {
    calculateTotalPrice();
  }, [selectedVol, selectedReturnVol, selectedClassAgency, passengers, formData.tripType, calculateTotalPrice]);

  // Handlers
  const handleAgencySelection = (agency) => {
    setSelectedAgency(agency);
    setAgencySearch(agency.name);
    setFormData(prev => ({ ...prev, agencyId: agency.id }));
    setShowAgencySuggestions(false);

    // Réinitialiser les sélections
    setVolSearch('');
    setReturnVolSearch('');
    setSelectedVol(null);
    setSelectedReturnVol(null);
    setSelectedClassAgency(null);
    setSelectedClass(null);
    setSelectedCompany(null);
    setCompanySearch('');
    setFilterByCompany(false);
    setShowCompanySection(false);
    setFormData(prev => ({
      ...prev,
      agencyVolId: '',
      returnVolId: '',
      startAt: '',
      endAt: '',
      agencyClassId: '',
      classId: '',
      companyId: ''
    }));

    setShowAllAgencyFlights(false);
    setShowAllReturnAgencyFlights(false);
  };

  const handleFlightSelection = (vol) => {
    console.log('✈️ Vol aller sélectionné:', vol);

    setSelectedVol(vol);
    setFormData(prev => ({
      ...prev,
      agencyVolId: vol.id,
      startDestinationId: vol.originId || '',
      endDestinationId: vol.destinationId || ''
    }));

    const displayText = vol.flightName ||
      `${vol.companyName} - ${getDestinationById(vol.originId)} to ${getDestinationById(vol.destinationId)}`;

    setVolSearch(displayText);
    setShowVolSuggestions(false);

    if (vol.originId) {
      const originDest = destinations.find(d => d.id === vol.originId);
      if (originDest) setStartDestinationSearch(originDest.city);
    }
    if (vol.destinationId) {
      const destDest = destinations.find(d => d.id === vol.destinationId);
      if (destDest) setEndDestinationSearch(destDest.city);
    }
    
    // Réinitialiser la classe sélectionnée
    setSelectedClassAgency(null);
    setSelectedClass(null);
    setClassDropdownSearch('');
  };

  const handleReturnFlightSelection = (vol) => {
    console.log('🔄 Vol retour sélectionné:', vol);

    setSelectedReturnVol(vol);
    setFormData(prev => ({ ...prev, returnVolId: vol.id }));

    const displayText = vol.flightName ||
      `${vol.companyName} - ${getDestinationById(vol.originId)} to ${getDestinationById(vol.destinationId)}`;

    setReturnVolSearch(displayText);
    setShowReturnVolSuggestions(false);
  };

  // ============================================
  // GESTION DE LA SÉLECTION DE CLASSE
  // ============================================
  const handleClassSelection = (classAgency) => {
    console.log('🎫 Classe sélectionnée:', classAgency);
    
    // Trouver les détails de la classe
    const classDetail = classes.find(c => c.id === classAgency.classId);
    
    setSelectedClassAgency(classAgency);
    setSelectedClass(classDetail);
    setFormData(prev => ({ 
      ...prev, 
      agencyClassId: classAgency.id,
      classId: classAgency.classId 
    }));
    
    // Mettre à jour la recherche avec le nom de la classe
    if (classDetail) {
      setClassDropdownSearch(classDetail.name);
    }
    
    setShowClassDropdown(false);
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
    setSelectedClassAgency(null);
    setSelectedClass(null);
    setSelectedCompany(null);
    setCompanySearch('');
    setFilterByCompany(false);
    setShowCompanySection(false);
    setVolSearch('');
    setReturnVolSearch('');
    setShowAllAgencyFlights(false);
    setShowAllReturnAgencyFlights(false);
    setFilteredVols(allVols);
    setVols(allVols);
    setFilteredReturnVols(allVols);
    setReturnVols(allVols);
    setClassDropdownSearch('');
  };

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
      if (!formData.agencyClassId) throw new Error('Veuillez sélectionner une classe');
      if (formData.tripType === 'round-trip' && !formData.returnVolId) {
        throw new Error('Veuillez sélectionner un vol retour');
      }
      if (!formData.startAt) throw new Error('La date de départ est requise');
      if (formData.tripType === 'round-trip' && !formData.endAt) {
        throw new Error('La date de retour est requise');
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
        endAt: formData.tripType === 'one-way' ? null : formData.endAt,
        totalPrice: totalPrice
      };

      console.log('📝 Données de réservation:', reservationData);

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
      console.error('❌ Erreur de soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour afficher les vols dans les suggestions
  const renderFlightSuggestion = (vol, isReturn = false) => {
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
                  {vol.origin?.city || getDestinationById(vol.originId) || 'Inconnu'} → 
                  {vol.destination?.city || getDestinationById(vol.destinationId) || 'Inconnu'}
                </p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">{vol.companyName}</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                {vol.agencyName}
              </span>
              {vol.departureTime && (
                <span className="text-xs text-gray-500">
                  Départ: {new Date(vol.departureTime).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          {vol.departureTime && vol.arrivalTime && (
            <div className="text-right">
              <p className="text-xs text-gray-500 mt-1">
                <FontAwesomeIcon icon={faClock} className="mr-1" />
                {calculateFlightDuration(vol.departureTime, vol.arrivalTime)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Fonction pour afficher les classes dans la liste déroulante
  const renderClassDropdownItem = (classAgency) => {
    const classDetail = classAgency.classDetails || { name: 'Classe inconnue' };
    const price = parseFloat(classAgency.price).toLocaleString();
    const isSelected = selectedClassAgency?.id === classAgency.id;
    
    return (
      <div
        key={classAgency.id}
        className={`p-3 cursor-pointer hover:bg-purple-50 border-b border-gray-100 last:border-b-0 transition-colors ${
          isSelected ? 'bg-purple-100' : ''
        }`}
        onClick={() => handleClassSelection(classAgency)}
      >
        <div className="flex items-center gap-3">
          <FontAwesomeIcon 
            icon={faChair} 
            className={isSelected ? 'text-purple-600' : 'text-gray-400'} 
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className={`font-medium ${isSelected ? 'text-purple-800' : 'text-gray-800'}`}>
                {classDetail.name}
              </p>
              <p className="text-sm font-semibold text-green-600">{price} FCFA</p>
            </div>
            {classDetail.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                {classDetail.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              {isSelected && (
                <span className="text-xs text-green-600">
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                  Sélectionnée
                </span>
              )}
            </div>
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

        {/* Section Compagnie */}
        <div className="bg-white shadow rounded-lg p-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={toggleCompanySection}
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-gray-800 flex items-center">
                <FontAwesomeIcon icon={faPlane} className="mr-2 text-indigo-500" />
                Compagnie Aérienne
              </h2>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                Optionnel
              </span>
            </div>
            <FontAwesomeIcon 
              icon={showCompanySection ? faChevronUp : faChevronDown} 
              className="text-gray-500"
            />
          </div>

          {showCompanySection && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faInfoCircle} className="text-indigo-400" />
                Sélectionnez une compagnie pour filtrer les vols disponibles.
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
                    placeholder="Ex: AIR FRANCE, Emirates..."
                    className={`block w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      !selectedAgency ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                    }`}
                    disabled={!selectedAgency}
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

                {!selectedAgency && (
                  <p className="mt-1 text-xs text-yellow-600 flex items-center gap-1">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    Veuillez d'abord sélectionner une agence
                  </p>
                )}

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
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {selectedCompany && (
                  <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faPlane} className="text-indigo-600" />
                        <div>
                          <span className="text-sm font-medium">
                            Compagnie sélectionnée: <span className="text-indigo-700 font-semibold">{selectedCompany.name}</span>
                          </span>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                              {agencyVolCount} vol(s) trouvé(s)
                            </span>
                            <button
                              type="button"
                              onClick={toggleCompanyFilter}
                              className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                filterByCompany 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              <FontAwesomeIcon icon={faFilter} size="xs" />
                              {filterByCompany ? 'Filtre actif' : 'Filtre désactivé'}
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearCompanySelection}
                        className="text-xs text-red-600 hover:text-red-800 bg-white px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                      >
                        <FontAwesomeIcon icon={faTimes} className="mr-1" />
                        Retirer
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {filterByCompany 
                        ? `Les vols affichés sont filtrés par ${selectedCompany.name}` 
                        : `Le filtre est désactivé - tous les vols de l'agence sont affichés`}
                    </p>
                  </div>
                )}
              </div>
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
                Veuillez d'abord sélectionner une agence
              </p>
            )}

            {selectedAgency && agencyVolCount === 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  Cette agence n'a pas de vols disponibles.
                </p>
              </div>
            )}

            {showVolSuggestions && vols.length > 0 && (
              <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto">
                {vols.map((vol) => renderFlightSuggestion(vol, false))}
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

        {/* Section Classe */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <FontAwesomeIcon icon={faChair} className="mr-2 text-purple-500" />
            Sélection de la Classe
          </h2>

          <div className="relative mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choisir une classe *
            </label>

            {!selectedVol ? (
              <p className="text-sm text-yellow-600 flex items-center gap-2">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                Veuillez d'abord sélectionner un vol
              </p>
            ) : availableClasses.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  Aucune classe disponible pour ce vol.
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* Bouton de la liste déroulante */}
                <div
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white cursor-pointer flex items-center justify-between hover:border-purple-400 transition-colors"
                  onClick={() => setShowClassDropdown(!showClassDropdown)}
                >
                  {selectedClass ? (
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faChair} className="text-purple-500" />
                      <span className="font-medium">{selectedClass.name}</span>
                      <span className="text-sm text-green-600 font-semibold">
                        {parseFloat(selectedClassAgency?.price || 0).toLocaleString()} FCFA
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Sélectionnez une classe</span>
                  )}
                  <FontAwesomeIcon 
                    icon={showClassDropdown ? faChevronUp : faChevronDown} 
                    className="text-gray-500"
                  />
                </div>

                {/* Liste déroulante */}
                {showClassDropdown && (
                  <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-80 overflow-hidden">
                    {/* Barre de recherche dans la liste déroulante */}
                    <div className="p-2 bg-gray-50 border-b border-gray-200">
                      <div className="relative">
                        <input
                          type="text"
                          value={classDropdownSearch}
                          onChange={(e) => setClassDropdownSearch(e.target.value)}
                          placeholder="Rechercher une classe..."
                          className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                      </div>
                    </div>
                    
                    {/* Liste des classes */}
                    <div className="overflow-y-auto max-h-60">
                      {getFilteredClassesForDropdown().length > 0 ? (
                        getFilteredClassesForDropdown().map((classAgency) => renderClassDropdownItem(classAgency))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          Aucune classe trouvée
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedClassAgency && selectedClass && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xl" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    Classe sélectionnée: <span className="text-purple-700">{selectedClass.name}</span>
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-lg font-bold text-green-600">
                      {parseFloat(selectedClassAgency.price).toLocaleString()} FCFA
                    </span>
                    <span className="text-xs text-gray-500">
                      par adulte
                    </span>
                  </div>
                  {selectedClass.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedClass.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section Type de voyage et Vol Retour */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Type de Voyage</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  {selectedAgency && agencyReturnVolCount === 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-700">
                        Aucun vol retour disponible pour cette agence.
                      </p>
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

        {/* Section Dates */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-green-500" />
            Dates de voyage
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de départ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startAt"
                value={formData.startAt}
                onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500 mt-1">
                Saisissez la date de départ souhaitée
              </p>
            </div>

            {formData.tripType === "round-trip" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de retour <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endAt"
                  value={formData.endAt}
                  onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  min={formData.startAt || new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Saisissez la date de retour souhaitée
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section Prix total */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Prix Total</h3>
              <p className="text-sm text-gray-600">
                {selectedClassAgency && (
                  <span>Prix adulte: {parseFloat(selectedClassAgency.price).toLocaleString()} FCFA</span>
                )}
              </p>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {totalPrice.toLocaleString()} FCFA
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

          {passengers.map((passenger, index) => {
            const typeInfo = getPassengerTypeLabel(passenger.typePassenger);
            
            return (
              <div key={index} className="border rounded-lg p-6 mb-6 last:mb-0 bg-gray-50">
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FontAwesomeIcon icon={typeInfo.icon} className={`text-${typeInfo.color}-500`} />
                    Passager #{index + 1} - {typeInfo.label}
                  </h3>
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

                {/* Prix individuel pour ce passager */}
                {selectedClassAgency && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Prix pour ce passager: </span>
                      {(() => {
                        const basePrice = parseFloat(selectedClassAgency.price) || 0;
                        let passengerPrice = basePrice;
                        
                        if (passenger.typePassenger !== 'ADLT') {
                          const rule = pricingRules.find(r => 
                            r.agencyClassId === selectedClassAgency.id &&
                            r.typePassenger === passenger.typePassenger
                          );
                          if (rule) {
                            passengerPrice += parseFloat(rule.price) || 0;
                          }
                        }
                        
                        // Ajouter le retour si aller-retour
                        if (formData.tripType === 'round-trip' && selectedReturnVol) {
                          const returnClass = classAgencies.find(cls => 
                            cls.agencyVol?.id === selectedReturnVol.id && 
                            cls.classId === selectedClassAgency.classId
                          );
                          if (returnClass) {
                            passengerPrice += parseFloat(returnClass.price) || 0;
                          } else {
                            passengerPrice += basePrice;
                          }
                        }
                        
                        return (
                          <span className="text-green-600 font-bold">
                            {passengerPrice.toLocaleString()} FCFA
                          </span>
                        );
                      })()}
                    </p>
                  </div>
                )}

                {/* Documents */}
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
                            <option value="">Sélectionner</option>
                            <option value="passport">Passeport</option>
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
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Enregistrement...
              </>
            ) : (
              'Enregistrer la réservation'
            )}
          </button>
        </div>
      </form>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
            <FontAwesomeIcon icon={faSpinner} spin className="text-orange-600 text-xl" />
            <p className="text-lg">Chargement des données...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationForm;
