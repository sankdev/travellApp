import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faBuilding, faSearch, faPlane, faPlaneDeparture,
  faPlaneArrival, faCalendarAlt, faUser, faPlus, faTrash, faTimes,
  faInfoCircle, faExclamationTriangle, faClock, faFilter, faCheckCircle,
  faBaby, faChild, faUserTie, faSpinner, faChair, faChevronDown,
  faChevronUp, faExclamationCircle, faRedoAlt,
  faDollarSign, faMapMarkerAlt, faTicketAlt, faExchangeAlt
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
a
const ProfessionalReservationForm = () => {
  const navigate = useNavigate();
  
  // États de chargement et erreur
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');

  // Mode de recherche
  const [searchMode, setSearchMode] = useState('agency');

  // États pour les données masters
  const [destinations, setDestinations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [flightAgencies, setFlightAgencies] = useState([]);
  const [classAgencies, setClassAgencies] = useState([]);
  const [classes, setClasses] = useState([]);
  const [profile, setProfile] = useState({});
  const [pricingRules, setPricingRules] = useState([]);

  // États de sélection
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState(null);
  const [selectedClassAgency, setSelectedClassAgency] = useState(null);
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);

  // États de recherche
  const [agencySearchTerm, setAgencySearchTerm] = useState('');
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [outboundFlightSearchTerm, setOutboundFlightSearchTerm] = useState('');
  const [returnFlightSearchTerm, setReturnFlightSearchTerm] = useState('');
  const [classSearchTerm, setClassSearchTerm] = useState('');

  // États pour les suggestions de destinations
  const [startDestinationSearch, setStartDestinationSearch] = useState('');
  const [endDestinationSearch, setEndDestinationSearch] = useState('');
  const [startDestinations, setStartDestinations] = useState([]);
  const [endDestinations, setEndDestinations] = useState([]);
  const [showStartDestinationSuggestions, setShowStartDestinationSuggestions] = useState(false);
  const [showEndDestinationSuggestions, setShowEndDestinationSuggestions] = useState(false);
  const [selectedStartDestinationId, setSelectedStartDestinationId] = useState(null);
  const [selectedEndDestinationId, setSelectedEndDestinationId] = useState(null);

  // États d'UI des dropdowns
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Données du formulaire
  const [formData, setFormData] = useState({
    agencyId: '',
    companyId: '',
    agencyVolId: '',
    returnVolId: '',
    classId: '',
    agencyClassId: '',
    startDestinationId: '',
    endDestinationId: '',
    startAt: '',
    endAt: '',
    tripType: 'one-way',
    description: '',
    totalPrice: 0
  });

  // Passagers avec la structure complète - Genre adapté au backend
  const [passengers, setPassengers] = useState([{
    firstName: '',
    lastName: '',
    gender: '', // sera 'masculin' ou 'feminin' pour le backend
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

  // Prix total
  const [totalPrice, setTotalPrice] = useState(0);

  // ============================================================================
  // HOOKS DE CHARGEMENT DES DONNÉES
  // ============================================================================
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError('');
    
    try {
      await Promise.all([
        loadDestinations(),
        loadCompanies(),
        loadAgencies(),
        loadFlightAgencies(),
        loadClassAgencies(),
        loadClasses(),
        loadPricingRules(),
        loadProfile()
      ]);
    } catch (err) {
      console.error('❌ Erreur chargement données:', err);
      setError('Impossible de charger les données. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const loadDestinations = async () => {
    try {
      const response = await destinationService.getDestinations({ search: '', status: 'active' });
      const data = response?.data || response || [];
      setDestinations(Array.isArray(data) ? data : []);
      console.log('📍 Destinations chargées:', data);
    } catch (error) {
      console.error('Erreur destinations:', error);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await companyService.getCompanies({ status: 'active' });
      const data = response?.data || response || [];
      setCompanies(Array.isArray(data) ? data : []);
      console.log('🏢 Compagnies chargées:', data);
    } catch (error) {
      console.error('Erreur compagnies:', error);
    }
  };

  const loadAgencies = async () => {
    try {
      const response = await agencyService.getAgencies({
        status: 'active',
        page: 1,
        limit: 1000
      });
      
      let agenciesData = [];
      if (response?.data?.success) agenciesData = response.data.data;
      else if (Array.isArray(response?.data)) agenciesData = response.data;
      else if (Array.isArray(response)) agenciesData = response;
      
      setAgencies(agenciesData);
      console.log('🏬 Agences chargées:', agenciesData);
    } catch (error) {
      console.error('Erreur agences:', error);
    }
  };

  const loadFlightAgencies = async () => {
    try {
      const response = await agencyAssociationService.getAllFlightAgencies({
        status: 'active',
        page: 1,
        limit: 1000
      });

      let flightsData = [];
      if (response?.data?.success) flightsData = response.data.data;
      else if (Array.isArray(response?.data)) flightsData = response.data;
      else if (Array.isArray(response)) flightsData = response;

      console.log('📦 Données brutes des vols:', flightsData);

      // Normalisation complète des données de vol
      const normalizedFlights = flightsData.map(flight => {
        // Extraire les IDs depuis l'objet flight
        const companyId = flight.flight?.company?.id || flight.flight?.companyVol?.id;
        const originId = flight.flight?.origin?.id;
        const destinationId = flight.flight?.destination?.id;

        return {
          id: flight.id,
          agencyId: flight.agencyId || flight.agency?.id,
          agency: flight.agency || { 
            id: flight.agencyId, 
            name: flight.agencyName || 'Agence inconnue' 
          },
          agencyName: flight.agency?.name || flight.agencyName || 'Agence inconnue',
          volId: flight.volId,
          flight: {
            id: flight.flight?.id || flight.volId,
            name: flight.flight?.name || flight.flightName || 'Vol sans nom',
            company: flight.flight?.company || flight.flight?.companyVol || { 
              id: companyId, 
              name: flight.companyName || 'Compagnie inconnue' 
            },
            companyId: companyId,
            origin: flight.flight?.origin || { 
              id: originId, 
              name: flight.originCity || 'Ville inconnue',
              city: flight.originCity || 'Ville inconnue'
            },
            destination: flight.flight?.destination || { 
              id: destinationId, 
              name: flight.destinationCity || 'Ville inconnue',
              city: flight.destinationCity || 'Ville inconnue'
            },
            originId: originId,
            destinationId: destinationId
          },
          flightName: flight.flight?.name || flight.flightName || 'Vol sans nom',
          companyName: flight.flight?.company?.name || flight.flight?.companyVol?.name || flight.companyName || 'Compagnie inconnue',
          companyId: companyId,
          originId: originId,
          originCity: flight.flight?.origin?.city || flight.originCity || 'Ville inconnue',
          destinationId: destinationId,
          destinationCity: flight.flight?.destination?.city || flight.destinationCity || 'Ville inconnue',
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          status: flight.status,
          classes: flight.classes || flight.agencyClasses || []
        };
      });

      console.log('📦 Vols agence normalisés:', normalizedFlights);
      
      // Vérifier que les companyId sont bien définis
      const volsAvecCompanyId = normalizedFlights.filter(f => f.companyId);
      console.log(`✅ ${volsAvecCompanyId.length} vols ont un companyId défini`);
      
      setFlightAgencies(normalizedFlights);
    } catch (error) {
      console.error('❌ Erreur vols agence:', error);
    }
  };

  const loadClassAgencies = async () => {
    try {
      const response = await agencyAssociationService.getAllClassAgencies({ status: 'active' });
      let data = response?.data || response || [];
      if (!Array.isArray(data)) data = [];
      console.log('🎫 Classes agence chargées:', data);
      setClassAgencies(data);
    } catch (error) {
      console.error('❌ Erreur classes agence:', error);
      setClassAgencies([]);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await classeService.getClasses({ status: 'active' });
      const data = response?.data || response || [];
      setClasses(Array.isArray(data) ? data : []);
      console.log('🎓 Classes chargées:', data);
    } catch (error) {
      console.error('❌ Erreur classes:', error);
      setClasses([]);
    }
  };

  const loadPricingRules = async () => {
    try {
      const response = await pricingRuleService.getAllPricingRules({ status: 'active' });
      const data = response?.data || response || [];
      setPricingRules(Array.isArray(data) ? data : []);
      console.log('💰 Règles de prix chargées:', data);
    } catch (error) {
      console.error('❌ Erreur règles de prix:', error);
      setPricingRules([]);
    }
  };

  const loadProfile = async () => {
    try {
      const response = await customerService.getCustomerProfile();
      const data = response?.data || {};
      setProfile(data);
    } catch (error) {
      console.error('❌ Erreur profil:', error);
    }
  };

  // ============================================================================
  // FONCTIONS UTILITAIRES
  // ============================================================================
  
  // Récupérer le nom de la compagnie
  const getCompanyName = useCallback((flight) => {
    if (!flight) return '';
    
    if (flight.companyName) return flight.companyName;
    if (flight.flight?.company?.name) return flight.flight.company.name;
    if (flight.flight?.companyVol?.name) return flight.flight.companyVol.name;
    if (flight.company?.name) return flight.company.name;
    
    return 'Compagnie inconnue';
  }, []);

  // Récupérer l'ID de la compagnie
  const getCompanyId = useCallback((flight) => {
    if (!flight) return null;
    
    if (flight.companyId) return flight.companyId;
    if (flight.flight?.companyId) return flight.flight.companyId;
    if (flight.flight?.company?.id) return flight.flight.company.id;
    if (flight.flight?.companyVol?.id) return flight.flight.companyVol.id;
    if (flight.company?.id) return flight.company.id;
    
    return null;
  }, []);

  // Récupérer le nom de l'origine
  const getOriginName = useCallback((flight) => {
    if (!flight) return '';
    
    if (flight.originCity) return flight.originCity;
    if (flight.flight?.origin?.city) return flight.flight.origin.city;
    if (flight.flight?.origin?.name) return flight.flight.origin.name;
    if (flight.origin?.city) return flight.origin.city;
    
    return 'Ville inconnue';
  }, []);

  // Récupérer le nom de la destination
  const getDestinationName = useCallback((flight) => {
    if (!flight) return '';
    
    if (flight.destinationCity) return flight.destinationCity;
    if (flight.flight?.destination?.city) return flight.flight.destination.city;
    if (flight.flight?.destination?.name) return flight.flight.destination.name;
    if (flight.destination?.city) return flight.destination.city;
    
    return 'Ville inconnue';
  }, []);

  // Récupérer le nom de la destination par ID
  const getDestinationById = useCallback((id) => {
    if (!id) return '';
    const dest = destinations.find(d => d.id === id);
    return dest?.city || dest?.name || 'Destination inconnue';
  }, [destinations]);

  const calculateDuration = (departure, arrival) => {
    if (!departure || !arrival) return 'Durée inconnue';
    const diff = new Date(arrival) - new Date(departure);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}min`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Formatage de l'affichage du vol
  const formatFlightDisplay = (flight) => {
    if (!flight) return '';
    const flightName = flight.flightName || flight.flight?.name || 'Vol';
    const origin = getOriginName(flight);
    const destination = getDestinationName(flight);
    return `${flightName} - ${origin} → ${destination}`;
  };

  // ============================================================================
  // FILTRES DES DESTINATIONS
  // ============================================================================
  
  // Recherche des destinations de départ
  const handleStartDestinationSearch = (value) => {
    setStartDestinationSearch(value);
    
    if (value.trim() === '') {
      setStartDestinations([]);
      setShowStartDestinationSuggestions(false);
    } else {
      const searchTerm = value.toLowerCase();
      const filtered = destinations.filter(dest =>
        dest.city?.toLowerCase().includes(searchTerm) ||
        dest.country?.toLowerCase().includes(searchTerm) ||
        dest.name?.toLowerCase().includes(searchTerm)
      );
      setStartDestinations(filtered);
      setShowStartDestinationSuggestions(filtered.length > 0);
    }
  };

  // Recherche des destinations d'arrivée
  const handleEndDestinationSearch = (value) => {
    setEndDestinationSearch(value);
    
    if (value.trim() === '') {
      setEndDestinations([]);
      setShowEndDestinationSuggestions(false);
    } else {
      const searchTerm = value.toLowerCase();
      const filtered = destinations.filter(dest =>
        dest.city?.toLowerCase().includes(searchTerm) ||
        dest.country?.toLowerCase().includes(searchTerm) ||
        dest.name?.toLowerCase().includes(searchTerm)
      );
      setEndDestinations(filtered);
      setShowEndDestinationSuggestions(filtered.length > 0);
    }
  };

  // Sélection de la destination de départ
  const handleStartDestinationSelect = (destination) => {
    setStartDestinationSearch(destination.city || destination.name);
    setSelectedStartDestinationId(destination.id);
    setFormData(prev => ({ ...prev, startDestinationId: destination.id }));
    setShowStartDestinationSuggestions(false);
  };

  // Sélection de la destination d'arrivée
  const handleEndDestinationSelect = (destination) => {
    setEndDestinationSearch(destination.city || destination.name);
    setSelectedEndDestinationId(destination.id);
    setFormData(prev => ({ ...prev, endDestinationId: destination.id }));
    setShowEndDestinationSuggestions(false);
  };

  // ============================================================================
  // FILTRES DES VOLS
  // ============================================================================
  
  const filteredAgencies = useMemo(() => {
    if (!agencySearchTerm) return agencies;
    return agencies.filter(agency =>
      agency.name?.toLowerCase().includes(agencySearchTerm.toLowerCase())
    );
  }, [agencies, agencySearchTerm]);

  const filteredCompanies = useMemo(() => {
    if (!companySearchTerm) return companies;
    return companies.filter(company =>
      company.name?.toLowerCase().includes(companySearchTerm.toLowerCase())
    );
  }, [companies, companySearchTerm]);

  // Vols disponibles selon le mode de recherche
  const availableOutboundFlights = useMemo(() => {
    let flights = [...flightAgencies];

    // Dans les deux modes, l'agence doit être sélectionnée
    if (!selectedAgency) return [];
    
    // Filtrer par agence (obligatoire dans tous les cas)
    flights = flights.filter(f => f.agencyId === selectedAgency.id);

    if (searchMode === 'company') {
      // En mode compagnie, filtrer aussi par compagnie si sélectionnée
      if (selectedCompany) {
        const companyId = selectedCompany.id;
        flights = flights.filter(f => {
          const flightCompanyId = getCompanyId(f);
          return flightCompanyId === companyId;
        });
      }
    }

    // Filtre textuel
    if (outboundFlightSearchTerm) {
      const searchLower = outboundFlightSearchTerm.toLowerCase();
      flights = flights.filter(f => {
        const flightName = (f.flightName || f.flight?.name || '').toLowerCase();
        const companyName = getCompanyName(f).toLowerCase();
        const origin = getOriginName(f).toLowerCase();
        const destination = getDestinationName(f).toLowerCase();
        const agencyName = (f.agencyName || '').toLowerCase();

        return flightName.includes(searchLower) ||
               companyName.includes(searchLower) ||
               origin.includes(searchLower) ||
               destination.includes(searchLower) ||
               agencyName.includes(searchLower);
      });
    }

    return flights;
  }, [searchMode, selectedAgency, selectedCompany, flightAgencies, outboundFlightSearchTerm, getCompanyId, getCompanyName, getOriginName, getDestinationName]);

  // Vols retour disponibles selon le mode de recherche
  const availableReturnFlights = useMemo(() => {
    if (formData.tripType !== 'round-trip') return [];
    
    let flights = [...flightAgencies];

    // Dans les deux modes, l'agence doit être sélectionnée
    if (!selectedAgency) return [];
    
    // Filtrer par agence (obligatoire dans tous les cas)
    flights = flights.filter(f => f.agencyId === selectedAgency.id);

    if (searchMode === 'company') {
      // En mode compagnie, filtrer aussi par compagnie si sélectionnée
      if (selectedCompany) {
        const companyId = selectedCompany.id;
        flights = flights.filter(f => getCompanyId(f) === companyId);
      }
    }

    if (returnFlightSearchTerm) {
      const searchLower = returnFlightSearchTerm.toLowerCase();
      flights = flights.filter(f => {
        const flightName = (f.flightName || f.flight?.name || '').toLowerCase();
        const companyName = getCompanyName(f).toLowerCase();
        const origin = getOriginName(f).toLowerCase();
        const destination = getDestinationName(f).toLowerCase();

        return flightName.includes(searchLower) ||
               companyName.includes(searchLower) ||
               origin.includes(searchLower) ||
               destination.includes(searchLower);
      });
    }

    return flights;
  }, [searchMode, selectedAgency, selectedCompany, flightAgencies, returnFlightSearchTerm, formData.tripType, getCompanyId, getCompanyName, getOriginName, getDestinationName]);

  // Classes disponibles pour le vol sélectionné
  const availableClassesForFlight = useMemo(() => {
    if (!selectedOutboundFlight) return [];

    console.log('🎯 Recherche classes pour vol:', selectedOutboundFlight.id);
    
    // Filtrer les classes associées à ce vol
    let classesForFlight = classAgencies.filter(ca => 
      ca.agencyVol?.id === selectedOutboundFlight.id && ca.status === 'active'
    );

    console.log(`🔍 ${classesForFlight.length} classes trouvées dans classAgencies`);

    // Enrichir avec les détails des classes
    const enrichedClasses = classesForFlight.map(ca => {
      const classDetail = classes.find(c => c.id === ca.classId);
      return {
        ...ca,
        className: classDetail?.name || ca.className || 'Classe inconnue',
        classDescription: classDetail?.description || '',
        price: parseFloat(ca.price) || 0
      };
    });

    // Si aucune classe trouvée, utiliser toutes les classes comme fallback
    if (enrichedClasses.length === 0) {
      return classes.map(cls => ({
        id: cls.id,
        classId: cls.id,
        className: cls.name,
        classDescription: cls.description,
        price: 0,
        isGeneric: true
      }));
    }

    // Filtrer par recherche textuelle
    if (classSearchTerm) {
      const searchLower = classSearchTerm.toLowerCase();
      return enrichedClasses.filter(c =>
        c.className.toLowerCase().includes(searchLower) ||
        (c.classDescription && c.classDescription.toLowerCase().includes(searchLower))
      );
    }

    return enrichedClasses;
  }, [selectedOutboundFlight, classAgencies, classes, classSearchTerm]);

  // ============================================================================
  // GESTION DES SÉLECTIONS
  // ============================================================================
  
  const handleSearchModeChange = (mode) => {
    setSearchMode(mode);
    setSelectedCompany(null); // Réinitialiser la compagnie mais pas l'agence
    setCompanySearchTerm('');
    setSelectedOutboundFlight(null);
    setSelectedReturnFlight(null);
    setSelectedClassAgency(null);
    setSelectedClassDetail(null);
    setOutboundFlightSearchTerm('');
    setReturnFlightSearchTerm('');
    setClassSearchTerm('');
    setWarningMessage('');
    setActiveDropdown(null);
    setFormData(prev => ({
      ...prev,
      companyId: '',
      agencyVolId: '',
      returnVolId: '',
      classId: '',
      agencyClassId: ''
      // Garder l'agencyId et les destinations
    }));
  };

  const handleAgencySelect = (agency) => {
    setSelectedAgency(agency);
    setAgencySearchTerm(agency.name);
    setActiveDropdown(null);
    
    setSelectedOutboundFlight(null);
    setOutboundFlightSearchTerm('');
    setSelectedReturnFlight(null);
    setReturnFlightSearchTerm('');
    setSelectedClassAgency(null);
    setSelectedClassDetail(null);
    setClassSearchTerm('');
    setWarningMessage('');
    
    setFormData(prev => ({
      ...prev,
      agencyId: agency.id,
      agencyVolId: '',
      returnVolId: ''
    }));
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setCompanySearchTerm(company.name);
    setActiveDropdown(null);
    
    setSelectedOutboundFlight(null);
    setOutboundFlightSearchTerm('');
    setSelectedReturnFlight(null);
    setReturnFlightSearchTerm('');
    setSelectedClassAgency(null);
    setSelectedClassDetail(null);
    setClassSearchTerm('');
    setWarningMessage('');
    
    setFormData(prev => ({ ...prev, companyId: company.id }));

    // Compter les vols de cette compagnie pour l'agence sélectionnée
    if (selectedAgency) {
      const companyFlights = flightAgencies.filter(f => 
        f.agencyId === selectedAgency.id && getCompanyId(f) === company.id
      );
      
      if (companyFlights.length === 0) {
        setWarningMessage(`Aucun vol trouvé pour la compagnie "${company.name}" dans l'agence "${selectedAgency.name}".`);
      }
    }
  };

  // Sélection du vol aller
  const handleOutboundFlightSelect = (flight) => {
    console.log('✈️ Vol aller sélectionné:', flight);

    setSelectedOutboundFlight(flight);
    setOutboundFlightSearchTerm(formatFlightDisplay(flight));
    setActiveDropdown(null);
    
    setFormData(prev => ({
      ...prev,
      agencyVolId: flight.id
    }));
    
    setSelectedClassAgency(null);
    setSelectedClassDetail(null);
    setClassSearchTerm('');
    
    // Réinitialiser le vol retour
    setSelectedReturnFlight(null);
    setReturnFlightSearchTerm('');
  };

  // Sélection du vol retour
  const handleReturnFlightSelect = (flight) => {
    console.log('🔄 Vol retour sélectionné:', flight);
    setSelectedReturnFlight(flight);
    setReturnFlightSearchTerm(formatFlightDisplay(flight));
    setActiveDropdown(null);
    setFormData(prev => ({ ...prev, returnVolId: flight.id }));
  };

  // Sélection de la classe
  const handleClassSelect = (classItem) => {
    console.log('🎫 Classe sélectionnée:', classItem);
    
    setSelectedClassAgency(classItem);
    
    // Trouver les détails de la classe
    const classDetail = classes.find(c => c.id === (classItem.classId || classItem.id));
    setSelectedClassDetail(classDetail);
    
    setClassSearchTerm(classItem.className);
    setActiveDropdown(null);
    
    setFormData(prev => ({
      ...prev,
      classId: classItem.classId || classItem.id,
      agencyClassId: classItem.isGeneric ? '' : classItem.id
    }));
  };

  // Gestionnaire pour le changement de type de voyage
  const handleTripTypeChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      if (value === "one-way") {
        return {
          ...prev,
          tripType: value,
          returnVolId: "",
          endAt: ""
        };
      } else {
        return {
          ...prev,
          tripType: value
        };
      }
    });
    
    if (value === 'one-way') {
      setSelectedReturnFlight(null);
      setReturnFlightSearchTerm('');
    }
  };

  // ============================================================================
  // CALCUL DU PRIX TOTAL
  // ============================================================================
  useEffect(() => {
    if (!selectedOutboundFlight || !selectedClassAgency) {
      setTotalPrice(0);
      return;
    }

    let total = 0;
    const basePrice = parseFloat(selectedClassAgency.price) || 0;

    // Règles de prix pour les enfants/bébés
    const rulesMap = {};
    pricingRules
      .filter(rule => rule.agencyClassId === selectedClassAgency.id)
      .forEach(rule => {
        rulesMap[rule.typePassenger] = parseFloat(rule.price) || 0;
      });

    // Calcul pour chaque passager
    passengers.forEach(passenger => {
      let passengerPrice = basePrice;
      
      if (passenger.typePassenger !== 'ADLT') {
        passengerPrice += rulesMap[passenger.typePassenger] || 0;
      }
      
      // Ajouter le prix du retour si aller-retour
      if (formData.tripType === 'round-trip' && selectedReturnFlight) {
        const returnClass = classAgencies.find(cls => 
          cls.agencyVol?.id === selectedReturnFlight.id && 
          cls.classId === (selectedClassAgency.classId || selectedClassAgency.id)
        );
        
        if (returnClass) {
          passengerPrice += parseFloat(returnClass.price) || 0;
        } else {
          passengerPrice += basePrice; // Fallback
        }
      }
      
      total += passengerPrice;
    });

    setTotalPrice(total);
    setFormData(prev => ({ ...prev, totalPrice: total }));
  }, [selectedOutboundFlight, selectedReturnFlight, selectedClassAgency, passengers, formData.tripType, pricingRules, classAgencies]);

  // ============================================================================
  // GESTION DES PASSAGERS
  // ============================================================================
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

  // Fonction pour encoder les fichiers en base64
  const encodeFilesToBase64 = async (files) => {
    if (!files || files.length === 0) return [];
    
    const encodedFiles = await Promise.all(
      Array.from(files).map((file) => {
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
    
    return encodedFiles;
  };

  // ============================================================================
  // SOUMISSION DU FORMULAIRE AVEC ENCODAGE BASE64
  // ============================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!selectedAgency) {
      setError('Veuillez sélectionner une agence');
      return;
    }
    if (!selectedOutboundFlight) {
      setError('Veuillez sélectionner un vol aller');
      return;
    }
    if (!selectedClassAgency) {
      setError('Veuillez sélectionner une classe');
      return;
    }
    if (formData.tripType === 'round-trip' && !selectedReturnFlight) {
      setError('Veuillez sélectionner un vol retour');
      return;
    }
    if (!formData.startAt) {
      setError('Veuillez sélectionner une date de départ');
      return;
    }
    if (formData.tripType === 'round-trip' && !formData.endAt) {
      setError('Veuillez sélectionner une date de retour');
      return;
    }
    if (!formData.startDestinationId) {
      setError('Veuillez sélectionner une destination de départ');
      return;
    }
    if (!formData.endDestinationId) {
      setError('Veuillez sélectionner une destination d\'arrivée');
      return;
    }

    // Validation des passagers
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.firstName || !p.lastName || !p.gender || !p.birthDate || !p.nationality) {
        setError(`Passager ${i + 1}: Tous les champs sont requis`);
        return;
      }
      
      for (let j = 0; j < p.document.length; j++) {
        const doc = p.document[j];
        if (!doc.documentType || !doc.documentNumber || !doc.issueDate || !doc.expirationDate) {
          setError(`Passager ${i + 1}, Document ${j + 1}: Tous les champs sont requis`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Encodage des fichiers en base64 pour chaque passager
      console.log('📝 Encodage des documents en base64...');
      
      const encodedPassengers = await Promise.all(passengers.map(async (passenger) => {
        const encodedDocuments = await Promise.all(
          (passenger.document || []).map(async (doc) => {
            let base64Files = [];
            if (doc.files && doc.files.length > 0) {
              base64Files = await encodeFilesToBase64(doc.files);
            }
            return { 
              ...doc, 
              files: base64Files,
              issueDate: doc.issueDate,
              expirationDate: doc.expirationDate
            };
          })
        );
        
        return { 
          ...passenger, 
          document: encodedDocuments,
          birthDate: passenger.birthDate
        };
      }));

      // Préparer les données de réservation
      const reservationData = {
        agencyId: selectedAgency.id,
        companyId: selectedCompany?.id || null,
        agencyVolId: selectedOutboundFlight.id,
        returnVolId: selectedReturnFlight?.id || null,
        classId: selectedClassAgency.classId || selectedClassAgency.id,
        agencyClassId: selectedClassAgency.isGeneric ? null : selectedClassAgency.id,
        startDestinationId: formData.startDestinationId,
        endDestinationId: formData.endDestinationId,
        startAt: formData.startAt,
        endAt: formData.tripType === 'round-trip' ? formData.endAt : null,
        tripType: formData.tripType,
        description: formData.description || '',
        totalPrice: totalPrice,
        passengers: encodedPassengers
      };

      console.log('📝 Données de réservation avec base64:', reservationData);
      
      const response = await reservationService.createReservationDemande(reservationData);
      
      if (response.success) {
        setSuccessMessage('Réservation créée avec succès !');
        setTimeout(() => navigate('/customer/dashboard'), 2000);
      } else {
        setError(response.message || 'Erreur lors de la création');
      }
    } catch (err) {
      console.error('❌ Erreur soumission:', err);
      setError(err.message || 'Une erreur est survenue lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // COMPOSANTS DE DROPDOWN
  // ============================================================================
  const Dropdown = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
      <>
        <div className="fixed inset-0 z-40" onClick={onClose} />
        <div className="absolute z-50 mt-1 left-0 right-0 bg-white border-2 border-gray-200 rounded-lg shadow-2xl max-h-80 overflow-y-auto">
          {children}
        </div>
      </>
    );
  };

  const DropdownItem = ({ onClick, children, className = '' }) => (
    <div
      onClick={onClick}
      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${className}`}
    >
      {children}
    </div>
  );

  // ============================================================================
  // RENDU
  // ============================================================================
  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* En-tête */}
        <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Retour</span>
          </button>
          <h1 className="text-xl font-bold text-gray-800">Demande de réservation</h1>
          <div className="w-24"></div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-start gap-3">
            <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500 mt-1" />
            <div className="flex-1">
              <p className="font-medium text-red-800">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}

        {warningMessage && (
          <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded flex items-start gap-3">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 mt-1" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">{warningMessage}</p>
            </div>
            <button onClick={() => setWarningMessage('')} className="text-yellow-500 hover:text-yellow-700">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded flex items-start gap-3">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1" />
            <div className="flex-1">
              <p className="font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ===== SECTION MODE DE RECHERCHE ===== */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faExchangeAlt} className="text-orange-600" />
              Mode de recherche
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSearchModeChange('agency')}
                className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  searchMode === 'agency'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={faBuilding} className="text-xl" />
                <span className="text-sm font-medium">Par agence</span>
              </button>
              <button
                type="button"
                onClick={() => handleSearchModeChange('company')}
                className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  searchMode === 'company'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={faPlane} className="text-xl" />
                <span className="text-sm font-medium">Par compagnie</span>
              </button>
            </div>
          </div>

          {/* ===== SECTION AGENCE (OBLIGATOIRE DANS LES DEUX MODES) ===== */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faBuilding} className="text-green-600" />
              1. Sélection de l'agence <span className="text-xs text-red-500 ml-2">* obligatoire</span>
            </h2>
            
            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={agencySearchTerm}
                    onChange={(e) => {
                      setAgencySearchTerm(e.target.value);
                      setActiveDropdown('agency');
                      if (selectedAgency) {
                        setSelectedAgency(null);
                        setFormData(prev => ({ ...prev, agencyId: '' }));
                      }
                    }}
                    onFocus={() => setActiveDropdown('agency')}
                    placeholder="Rechercher une agence..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                  <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                
                {selectedAgency && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAgency(null);
                      setAgencySearchTerm('');
                      setActiveDropdown(null);
                      setSelectedOutboundFlight(null);
                      setOutboundFlightSearchTerm('');
                      setSelectedClassAgency(null);
                      setSelectedClassDetail(null);
                      setClassSearchTerm('');
                    }}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>

              <Dropdown isOpen={activeDropdown === 'agency'} onClose={() => setActiveDropdown(null)}>
                {filteredAgencies.length > 0 ? (
                  filteredAgencies.map(agency => (
                    <DropdownItem key={agency.id} onClick={() => handleAgencySelect(agency)}>
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faBuilding} className="text-green-500" />
                        <div>
                          <p className="font-medium text-gray-800">{agency.name}</p>
                          {agency.description && (
                            <p className="text-sm text-gray-500">{agency.description}</p>
                          )}
                        </div>
                      </div>
                    </DropdownItem>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">Aucune agence trouvée</div>
                )}
              </Dropdown>
            </div>

            {selectedAgency && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm">
                  <span className="font-medium">Agence sélectionnée:</span> {selectedAgency.name}
                </p>
              </div>
            )}
          </div>

          {/* ===== SECTION COMPAGNIE (OPTIONNELLE) ===== */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faPlane} className="text-indigo-600" />
              2. Compagnie aérienne <span className="text-xs text-gray-500 ml-2">(optionnelle)</span>
            </h2>
            
            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={companySearchTerm}
                    onChange={(e) => {
                      setCompanySearchTerm(e.target.value);
                      setActiveDropdown('company');
                      if (selectedCompany) {
                        setSelectedCompany(null);
                        setFormData(prev => ({ ...prev, companyId: '' }));
                      }
                    }}
                    onFocus={() => setActiveDropdown('company')}
                    placeholder="Rechercher une compagnie aérienne..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                
                {selectedCompany && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCompany(null);
                      setCompanySearchTerm('');
                      setActiveDropdown(null);
                    }}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>

              <Dropdown isOpen={activeDropdown === 'company'} onClose={() => setActiveDropdown(null)}>
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map(company => (
                    <DropdownItem key={company.id} onClick={() => handleCompanySelect(company)}>
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faPlane} className="text-indigo-500" />
                        <div>
                          <p className="font-medium text-gray-800">{company.name}</p>
                          {company.description && (
                            <p className="text-sm text-gray-500">{company.description}</p>
                          )}
                        </div>
                      </div>
                    </DropdownItem>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">Aucune compagnie trouvée</div>
                )}
              </Dropdown>
            </div>

            {selectedCompany && (
              <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-sm">
                  <span className="font-medium">Compagnie sélectionnée:</span> {selectedCompany.name}
                </p>
              </div>
            )}
          </div>

          {/* ===== SECTION DESTINATIONS ===== */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-indigo-600" />
              3. Choisir les destinations
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu de départ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={startDestinationSearch}
                    onChange={(e) => handleStartDestinationSearch(e.target.value)}
                    onFocus={() => {
                      if (startDestinationSearch.trim().length > 0 && startDestinations.length > 0) {
                        setShowStartDestinationSuggestions(true);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 pr-16"
                    placeholder="Rechercher une ville..."
                    required
                  />
                  {startDestinationSearch.trim().length > 0 && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs bg-gray-100 px-2 py-1 rounded">
                      {startDestinations.length}
                    </span>
                  )}
                </div>
                
                {showStartDestinationSuggestions && startDestinations.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {startDestinations.map(dest => (
                      <li
                        key={dest.id}
                        className="px-4 py-2 hover:bg-green-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => handleStartDestinationSelect(dest)}
                      >
                        <div>
                          <p className="font-medium">{dest.name}</p>
                          <p className="text-xs text-gray-500">{dest.country || ''}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {selectedStartDestinationId && !showStartDestinationSuggestions && startDestinationSearch && (
                  <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">
                      Départ: <span className="font-medium">{startDestinationSearch}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination finale <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={endDestinationSearch}
                    onChange={(e) => handleEndDestinationSearch(e.target.value)}
                    onFocus={() => {
                      if (endDestinationSearch.trim().length > 0 && endDestinations.length > 0) {
                        setShowEndDestinationSuggestions(true);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 pr-16"
                    placeholder="Rechercher une ville..."
                    required
                  />
                  {endDestinationSearch.trim().length > 0 && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs bg-gray-100 px-2 py-1 rounded">
                      {endDestinations.length}
                    </span>
                  )}
                </div>
                
                {showEndDestinationSuggestions && endDestinations.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {endDestinations.map(dest => (
                      <li
                        key={dest.id}
                        className="px-4 py-2 hover:bg-green-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => handleEndDestinationSelect(dest)}
                      >
                        <div>
                          <p className="font-medium">{dest.name}</p>
                          <p className="text-xs text-gray-500">{dest.country || ''}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {selectedEndDestinationId && !showEndDestinationSuggestions && endDestinationSearch && (
                  <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">
                      Arrivée: <span className="font-medium">{endDestinationSearch}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== SECTION VOL ALLER ===== */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-600" />
              4. Vol aller
            </h2>
            
            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={outboundFlightSearchTerm}
                    onChange={(e) => {
                      setOutboundFlightSearchTerm(e.target.value);
                      setActiveDropdown('outbound');
                      if (selectedOutboundFlight) {
                        setSelectedOutboundFlight(null);
                        setFormData(prev => ({ ...prev, agencyVolId: '' }));
                      }
                    }}
                    onFocus={() => setActiveDropdown('outbound')}
                    placeholder="Rechercher un vol..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={!selectedAgency}
                  />
                  <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                
                {selectedOutboundFlight && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOutboundFlight(null);
                      setOutboundFlightSearchTerm('');
                      setActiveDropdown(null);
                      setSelectedClassAgency(null);
                      setSelectedClassDetail(null);
                      setClassSearchTerm('');
                    }}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>

              {!selectedAgency && (
                <p className="mt-2 text-xs text-yellow-600">Sélectionnez d'abord une agence</p>
              )}

              <Dropdown isOpen={activeDropdown === 'outbound'} onClose={() => setActiveDropdown(null)}>
                {availableOutboundFlights.length > 0 ? (
                  availableOutboundFlights.map(flight => (
                    <DropdownItem key={flight.id} onClick={() => handleOutboundFlightSelect(flight)}>
                      <div className="flex items-start gap-3">
                        <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-500 mt-1" />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium text-gray-800">{flight.flightName || flight.flight?.name}</p>
                            {flight.departureTime && (
                              <span className="text-xs text-gray-500">{formatDate(flight.departureTime)}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {getOriginName(flight)} → {getDestinationName(flight)}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                              {getCompanyName(flight)}
                            </span>
                            <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">
                              {flight.agencyName}
                            </span>
                            {flight.departureTime && flight.arrivalTime && (
                              <span className="text-xs text-gray-500">
                                <FontAwesomeIcon icon={faClock} className="mr-1" />
                                {calculateDuration(flight.departureTime, flight.arrivalTime)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </DropdownItem>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <FontAwesomeIcon icon={faPlaneDeparture} className="text-4xl text-gray-300 mb-2" />
                    <p>Aucun vol disponible</p>
                    {selectedAgency && selectedCompany && (
                      <p className="text-xs mt-2">Aucun vol trouvé pour cette compagnie dans l'agence sélectionnée</p>
                    )}
                  </div>
                )}
              </Dropdown>
            </div>

            {selectedOutboundFlight && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium">{selectedOutboundFlight.flightName}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {getOriginName(selectedOutboundFlight)} → {getDestinationName(selectedOutboundFlight)}
                </p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs text-indigo-600">{getCompanyName(selectedOutboundFlight)}</span>
                  <span className="text-xs text-green-600">• {selectedOutboundFlight.agencyName}</span>
                </div>
              </div>
            )}
          </div>

          {/* ===== SECTION CLASSE ===== */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faChair} className="text-purple-600" />
              5. Sélection de la classe
            </h2>
            
            <div className="relative">
              {!selectedOutboundFlight ? (
                <p className="text-sm text-yellow-600">Sélectionnez d'abord un vol aller</p>
              ) : (
                <>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={classSearchTerm}
                        onChange={(e) => {
                          setClassSearchTerm(e.target.value);
                          setActiveDropdown('class');
                          if (selectedClassAgency) {
                            setSelectedClassAgency(null);
                            setSelectedClassDetail(null);
                          }
                        }}
                        onFocus={() => setActiveDropdown('class')}
                        placeholder="Rechercher une classe..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                      <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    
                    {selectedClassAgency && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClassAgency(null);
                          setSelectedClassDetail(null);
                          setClassSearchTerm('');
                          setActiveDropdown(null);
                        }}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    )}
                  </div>

                  <Dropdown isOpen={activeDropdown === 'class'} onClose={() => setActiveDropdown(null)}>
                    {availableClassesForFlight.length > 0 ? (
                      availableClassesForFlight.map(classItem => (
                        <DropdownItem key={classItem.id} onClick={() => handleClassSelect(classItem)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FontAwesomeIcon icon={faChair} className="text-purple-500" />
                              <div>
                                <span className="font-medium text-gray-800">{classItem.className}</span>
                                {classItem.classDescription && (
                                  <p className="text-xs text-gray-500">{classItem.classDescription}</p>
                                )}
                                {classItem.isGeneric && (
                                  <p className="text-xs text-orange-500 mt-1">
                                    <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                                    Classe générale (prix indicatif)
                                  </p>
                                )}
                              </div>
                            </div>
                            {classItem.price > 0 && (
                              <span className="font-semibold text-green-600">
                                {classItem.price.toLocaleString()} FCFA
                              </span>
                            )}
                          </div>
                        </DropdownItem>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <FontAwesomeIcon icon={faTicketAlt} className="text-4xl text-gray-300 mb-2" />
                        <p>Aucune classe disponible</p>
                      </div>
                    )}
                  </Dropdown>
                </>
              )}
            </div>

            {selectedClassDetail && (
              <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{selectedClassDetail.name}</p>
                    {selectedClassDetail.description && (
                      <p className="text-xs text-gray-600 mt-1">{selectedClassDetail.description}</p>
                    )}
                  </div>
                  {selectedClassAgency?.price > 0 && (
                    <p className="font-bold text-green-600">
                      {parseFloat(selectedClassAgency.price).toLocaleString()} FCFA
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ===== SECTION TYPE DE VOYAGE ET VOL RETOUR ===== */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faRedoAlt} className="text-orange-600" />
              6. Type de voyage
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <select
                  value={formData.tripType}
                  onChange={handleTripTypeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="one-way">Aller simple</option>
                  <option value="round-trip">Aller-retour</option>
                </select>
              </div>

              {formData.tripType === 'round-trip' && (
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={returnFlightSearchTerm}
                        onChange={(e) => {
                          setReturnFlightSearchTerm(e.target.value);
                          setActiveDropdown('return');
                          if (selectedReturnFlight) {
                            setSelectedReturnFlight(null);
                            setFormData(prev => ({ ...prev, returnVolId: '' }));
                          }
                        }}
                        onFocus={() => setActiveDropdown('return')}
                        placeholder="Vol retour..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                      <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    
                    {selectedReturnFlight && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReturnFlight(null);
                          setReturnFlightSearchTerm('');
                          setActiveDropdown(null);
                        }}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    )}
                  </div>

                  <Dropdown isOpen={activeDropdown === 'return'} onClose={() => setActiveDropdown(null)}>
                    {availableReturnFlights.length > 0 ? (
                      availableReturnFlights.map(flight => (
                        <DropdownItem key={flight.id} onClick={() => handleReturnFlightSelect(flight)}>
                          <div className="flex items-start gap-3">
                            <FontAwesomeIcon icon={faPlaneArrival} className="text-purple-500 mt-1" />
                            <div>
                              <p className="font-medium text-gray-800">{flight.flightName}</p>
                              <p className="text-sm text-gray-600">
                                {getOriginName(flight)} → {getDestinationName(flight)}
                              </p>
                              <p className="text-xs text-gray-500">{getCompanyName(flight)}</p>
                            </div>
                          </div>
                        </DropdownItem>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">Aucun vol retour disponible</div>
                    )}
                  </Dropdown>

                  {selectedReturnFlight && (
                    <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm font-medium text-purple-700">{formatFlightDisplay(selectedReturnFlight)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ===== SECTION DATES ===== */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-green-600" />
              7. Dates de voyage
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date de départ</label>
                <input
                  type="date"
                  value={formData.startAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, startAt: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              {formData.tripType === 'round-trip' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date de retour</label>
                  <input
                    type="date"
                    value={formData.endAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, endAt: e.target.value }))}
                    min={formData.startAt || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* ===== SECTION PRIX TOTAL ===== */}
          {totalPrice > 0 && (
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow p-4 text-white">
              <div className="flex justify-between items-center">
                <span className="text-lg opacity-90">Prix total</span>
                <span className="text-2xl font-bold">{totalPrice.toLocaleString()} FCFA</span>
              </div>
            </div>
          )}

          {/* ===== SECTION PASSAGERS ===== */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-md font-semibold text-gray-700 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                Passagers ({passengers.length})
              </h2>
              <button
                type="button"
                onClick={addPassenger}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faPlus} size="xs" />
                Ajouter
              </button>
            </div>

            {passengers.map((passenger, passengerIndex) => (
              <div key={passengerIndex} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <FontAwesomeIcon 
                      icon={
                        passenger.typePassenger === 'ADLT' ? faUserTie :
                        passenger.typePassenger === 'CHD' ? faChild : faBaby
                      } 
                      className={
                        passenger.typePassenger === 'ADLT' ? 'text-blue-500' :
                        passenger.typePassenger === 'CHD' ? 'text-green-500' : 'text-purple-500'
                      }
                    />
                    Passager {passengerIndex + 1}
                  </h3>
                  {passengers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePassenger(passengerIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FontAwesomeIcon icon={faTrash} size="sm" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Prénom *</label>
                    <input
                      type="text"
                      value={passenger.firstName}
                      onChange={(e) => handlePassengerChange(passengerIndex, 'firstName', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nom *</label>
                    <input
                      type="text"
                      value={passenger.lastName}
                      onChange={(e) => handlePassengerChange(passengerIndex, 'lastName', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Genre *</label>
                    <select
                      value={passenger.gender}
                      onChange={(e) => handlePassengerChange(passengerIndex, 'gender', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                    >
                      <option value="">Sélectionner</option>
                      <option value="masculin">Masculin</option>
                      <option value="feminin">Féminin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date naissance *</label>
                    <input
                      type="date"
                      value={passenger.birthDate}
                      onChange={(e) => handlePassengerChange(passengerIndex, 'birthDate', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Lieu naissance</label>
                    <input
                      type="text"
                      value={passenger.birthPlace}
                      onChange={(e) => handlePassengerChange(passengerIndex, 'birthPlace', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nationalité *</label>
                    <input
                      type="text"
                      value={passenger.nationality}
                      onChange={(e) => handlePassengerChange(passengerIndex, 'nationality', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Profession</label>
                    <input
                      type="text"
                      value={passenger.profession}
                      onChange={(e) => handlePassengerChange(passengerIndex, 'profession', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Adresse</label>
                    <input
                      type="text"
                      value={passenger.address}
                      onChange={(e) => handlePassengerChange(passengerIndex, 'address', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Type passager *</label>
                    <select
                      value={passenger.typePassenger}
                      onChange={(e) => handlePassengerChange(passengerIndex, 'typePassenger', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                    >
                      <option value="ADLT">Adulte</option>
                      <option value="CHD">Enfant (2-12 ans)</option>
                      <option value="INF">Bébé (0-2 ans)</option>
                    </select>
                  </div>
                </div>

                {/* Prix individuel pour ce passager */}
                {selectedClassAgency && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg">
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
                        
                        if (formData.tripType === 'round-trip' && selectedReturnFlight) {
                          const returnClass = classAgencies.find(cls => 
                            cls.agencyVol?.id === selectedReturnFlight.id && 
                            cls.classId === (selectedClassAgency.classId || selectedClassAgency.id)
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
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium">Documents</h4>
                    <button
                      type="button"
                      onClick={() => addDocument(passengerIndex)}
                      className="text-xs px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 flex items-center gap-1"
                    >
                      <FontAwesomeIcon icon={faPlus} size="xs" />
                      Ajouter document
                    </button>
                  </div>

                  {passenger.document.map((doc, docIndex) => (
                    <div key={docIndex} className="mb-3 p-3 bg-white border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium">Document {docIndex + 1}</span>
                        {passenger.document.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDocument(passengerIndex, docIndex)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            <FontAwesomeIcon icon={faTrash} size="xs" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Type *</label>
                          <select
                            value={doc.documentType}
                            onChange={(e) => handleDocumentChange(passengerIndex, docIndex, 'documentType', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            required
                          >
                            <option value="">Sélectionner</option>
                            <option value="passport">Passeport</option>
                            <option value="cni">Carte d'Identité</option>
                            <option value="visa">Visa</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Numéro *</label>
                          <input
                            type="text"
                            value={doc.documentNumber}
                            onChange={(e) => handleDocumentChange(passengerIndex, docIndex, 'documentNumber', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Date émission *</label>
                          <input
                            type="date"
                            value={doc.issueDate}
                            onChange={(e) => handleDocumentChange(passengerIndex, docIndex, 'issueDate', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Date expiration *</label>
                          <input
                            type="date"
                            value={doc.expirationDate}
                            onChange={(e) => handleDocumentChange(passengerIndex, docIndex, 'expirationDate', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">Fichiers</label>
                          <input
                            type="file"
                            multiple
                            onChange={(e) => handleFileChange(passengerIndex, docIndex, e.target.files)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          {doc.files?.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {doc.files.length} fichier(s) sélectionné(s)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ===== SECTION NOTES ===== */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faInfoCircle} className="text-gray-600" />
              Notes
            </h2>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Informations complémentaires..."
            />
          </div>

          {/* ===== BOUTONS ===== */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/customer/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Traitement...
                </>
              ) : (
                'Confirmer la réservation'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-xl flex items-center gap-3">
            <FontAwesomeIcon icon={faSpinner} spin className="text-orange-600" />
            <p className="text-gray-700">Chargement des données...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalReservationForm;
