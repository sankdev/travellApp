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

const ProfessionalReservationForm = () => {
  const navigate = useNavigate();
  
  // États de chargement et erreur
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');

  // ✅ NOUVEAU : Mode de recherche
  const [searchMode, setSearchMode] = useState('agency'); // 'agency' ou 'company'

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
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);

  // États de recherche
  const [agencySearchTerm, setAgencySearchTerm] = useState('');
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [outboundFlightSearchTerm, setOutboundFlightSearchTerm] = useState('');
  const [returnFlightSearchTerm, setReturnFlightSearchTerm] = useState('');
  const [classSearchTerm, setClassSearchTerm] = useState('');

  // États d'UI des dropdowns
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Données du formulaire
  const [formData, setFormData] = useState({
    agencyId: '',
    companyId: '',
    outboundFlightId: '',
    returnFlightId: '',
    classId: '',
    classAgencyId: '',
    startDestinationId: '',
    endDestinationId: '',
    startAt: '',
    endAt: '',
    tripType: 'one-way',
    description: '',
    totalPrice: 0
  });

  // Passagers
  const [passengers, setPassengers] = useState([{
    id: Date.now(),
    firstName: '',
    lastName: '',
    gender: '',
    birthDate: '',
    nationality: '',
    typePassenger: 'ADLT',
    documents: [{
      id: Date.now() + 1,
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
    } catch (error) {
      console.error('Erreur destinations:', error);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await companyService.getCompanies({ status: 'active' });
      const data = response?.data || response || [];
      setCompanies(Array.isArray(data) ? data : []);
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

      const normalizedFlights = flightsData.map(flight => ({
        id: flight.id,
        agencyId: flight.agencyId || flight.agency?.id,
        agencyName: flight.agency?.name || 'Agence inconnue',
        volId: flight.volId,
        flightName: flight.flight?.name || flight.flightName || 'Vol sans nom',
        companyId: flight.flight?.companyId || flight.flight?.companyVol?.id || flight.companyId,
        companyName: flight.flight?.companyVol?.name || flight.companyName || 'Compagnie inconnue',
        originId: flight.flight?.originId || flight.originId,
        originCity: flight.flight?.origin?.city || flight.originCity || 'Ville inconnue',
        destinationId: flight.flight?.destinationId || flight.destinationId,
        destinationCity: flight.flight?.destination?.city || flight.destinationCity || 'Ville inconnue',
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        status: flight.status,
        classes: flight.classes || flight.agencyClasses || []
      }));

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
      console.log('📚 Classes chargées via classeService:', Array.isArray(data) ? data.length : 0);
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
  const getDestinationName = useCallback((id) => {
    const dest = destinations.find(d => d.id === id);
    return dest?.city || 'Destination inconnue';
  }, [destinations]);

  const calculateDuration = (departure, arrival) => {
    if (!departure || !arrival) return 'Durée inconnue';
    const diff = new Date(arrival) - new Date(departure);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>h</mi><mi>o</mi><mi>u</mi><mi>r</mi><mi>s</mi></mrow><mi>h</mi></mrow><annotation encoding="application/x-tex">{hours}h </annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="mord mathnormal">o</span><span class="mord mathnormal">u</span><span class="mord mathnormal">rs</span></span><span class="mord mathnormal">h</span></span></span></span>{minutes}min`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // ============================================================================
  // ✅ RESET COMPLET LORS DU CHANGEMENT DE MODE
  // ============================================================================
  const handleSearchModeChange = (mode) => {
    setSearchMode(mode);
    setSelectedAgency(null);
    setSelectedCompany(null);
    setSelectedOutboundFlight(null);
    setSelectedReturnFlight(null);
    setSelectedClass(null);
    setSelectedClassDetail(null);
    setAgencySearchTerm('');
    setCompanySearchTerm('');
    setOutboundFlightSearchTerm('');
    setReturnFlightSearchTerm('');
    setClassSearchTerm('');
    setWarningMessage('');
    setActiveDropdown(null);
    setFormData(prev => ({
      ...prev,
      agencyId: '',
      companyId: '',
      outboundFlightId: '',
      returnFlightId: '',
      classId: '',
      classAgencyId: '',
      startDestinationId: '',
      endDestinationId: ''
    }));
  };

  // ============================================================================
  // FILTRES
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

  // ✅ VOLS DISPONIBLES selon le mode de recherche
  const availableOutboundFlights = useMemo(() => {
    let flights = [...flightAgencies];

    if (searchMode === 'agency') {
      // Mode agence : filtrer par agence sélectionnée
      if (!selectedAgency) return [];
      flights = flights.filter(f => f.agencyId === selectedAgency.id);
      
      // Filtre optionnel par compagnie
      if (selectedCompany) {
        flights = flights.filter(f => f.companyId === selectedCompany.id);
      }
    } else {
      // Mode compagnie : filtrer par compagnie sélectionnée
      if (!selectedCompany) return [];
      flights = flights.filter(f => f.companyId === selectedCompany.id);
    }

    // Filtre textuel
    if (outboundFlightSearchTerm) {
      const searchLower = outboundFlightSearchTerm.toLowerCase();
      flights = flights.filter(f =>
        f.flightName?.toLowerCase().includes(searchLower) ||
        f.companyName?.toLowerCase().includes(searchLower) ||
        f.originCity?.toLowerCase().includes(searchLower) ||
        f.destinationCity?.toLowerCase().includes(searchLower) ||
        f.agencyName?.toLowerCase().includes(searchLower)
      );
    }

    return flights;
  }, [searchMode, selectedAgency, selectedCompany, flightAgencies, outboundFlightSearchTerm]);

  // ✅ VOLS RETOUR
  const availableReturnFlights = useMemo(() => {
    if (formData.tripType !== 'round-trip') return [];
    
    let flights = [...flightAgencies];

    if (searchMode === 'agency') {
      if (!selectedAgency) return [];
      flights = flights.filter(f => f.agencyId === selectedAgency.id);
      if (selectedCompany) {
        flights = flights.filter(f => f.companyId === selectedCompany.id);
      }
    } else {
      if (!selectedCompany) return [];
      flights = flights.filter(f => f.companyId === selectedCompany.id);
    }

    if (returnFlightSearchTerm) {
      const searchLower = returnFlightSearchTerm.toLowerCase();
      flights = flights.filter(f =>
        f.flightName?.toLowerCase().includes(searchLower) ||
        f.companyName?.toLowerCase().includes(searchLower) ||
        f.originCity?.toLowerCase().includes(searchLower) ||
        f.destinationCity?.toLowerCase().includes(searchLower)
      );
    }

    return flights;
  }, [searchMode, selectedAgency, selectedCompany, flightAgencies, returnFlightSearchTerm, formData.tripType]);

  // ✅ CLASSES DISPONIBLES - utilise classeService.getClasses + enrichissement par classAgencies
  const availableClassesForFlight = useMemo(() => {
    if (!selectedOutboundFlight) return [];

    // 1. Chercher les classAgencies liées au vol sélectionné
    let classesForFlight = classAgencies.filter(ca =>
      ca.agencyVolId === selectedOutboundFlight.id
    );

    // 2. Si rien trouvé par agencyVolId, essayer par volId
    if (classesForFlight.length === 0 && selectedOutboundFlight.volId) {
      classesForFlight = classAgencies.filter(ca =>
        ca.volId === selectedOutboundFlight.volId
      );
    }

    // 3. Si des classAgencies existent, les enrichir avec les données de classeService
    if (classesForFlight.length > 0) {
      const enrichedClasses = classesForFlight.map(ca => {
        const classDetail = classes.find(c => c.id === (ca.classId || ca.class_id));
        return {
          ...ca,
          className: classDetail?.name || ca.className || 'Classe inconnue',
          classDescription: classDetail?.description || ca.description || '',
          price: ca.price || classDetail?.price || 0
        };
      });

      if (classSearchTerm) {
        const searchLower = classSearchTerm.toLowerCase();
        return enrichedClasses.filter(c =>
          c.className.toLowerCase().includes(searchLower) ||
          (c.classDescription && c.classDescription.toLowerCase().includes(searchLower))
        );
      }

      return enrichedClasses;
    }

    // 4. Si aucune classAgency trouvée, afficher toutes les classes de classeService.getClasses
    // Cela permet à l'utilisateur de voir les classes disponibles même si pas encore associées
    let allClasses = classes.map(cls => ({
      id: cls.id,
      classId: cls.id,
      className: cls.name || 'Classe inconnue',
      classDescription: cls.description || '',
      price: cls.price || 0,
      isGeneric: true // Marqueur pour indiquer que c'est une classe générique
    }));

    if (classSearchTerm) {
      const searchLower = classSearchTerm.toLowerCase();
      allClasses = allClasses.filter(c =>
        c.className.toLowerCase().includes(searchLower) ||
        (c.classDescription && c.classDescription.toLowerCase().includes(searchLower))
      );
    }

    return allClasses;
  }, [selectedOutboundFlight, classAgencies, classes, classSearchTerm]);

  // ============================================================================
  // GESTION DES SÉLECTIONS
  // ============================================================================
  const handleAgencySelect = (agency) => {
    setSelectedAgency(agency);
    setAgencySearchTerm(agency.name);
    setActiveDropdown(null);
    
    // Reset les sélections dépendantes
    setSelectedOutboundFlight(null);
    setOutboundFlightSearchTerm('');
    setSelectedReturnFlight(null);
    setReturnFlightSearchTerm('');
    setSelectedClass(null);
    setSelectedClassDetail(null);
    setClassSearchTerm('');
    setWarningMessage('');
    
    setFormData(prev => ({
      ...prev,
      agencyId: agency.id,
      outboundFlightId: '',
      returnFlightId: '',
      classId: '',
      classAgencyId: ''
    }));
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setCompanySearchTerm(company.name);
    setActiveDropdown(null);
    
    // Reset les sélections dépendantes
    setSelectedOutboundFlight(null);
    setOutboundFlightSearchTerm('');
    setSelectedReturnFlight(null);
    setReturnFlightSearchTerm('');
    setSelectedClass(null);
    setSelectedClassDetail(null);
    setClassSearchTerm('');
    setWarningMessage('');
    
    setFormData(prev => ({ ...prev, companyId: company.id }));

    // En mode compagnie, vérifier les vols disponibles
    if (searchMode === 'company') {
      const companyFlights = flightAgencies.filter(f => f.companyId === company.id);
      if (companyFlights.length === 0) {
        setWarningMessage(`Aucun vol trouvé pour la compagnie "${company.name}".`);
      }
    }
  };

  const handleOutboundFlightSelect = (flight) => {
    setSelectedOutboundFlight(flight);
    setOutboundFlightSearchTerm(
      `<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>f</mi><mi>l</mi><mi>i</mi><mi>g</mi><mi>h</mi><mi>t</mi><mi mathvariant="normal">.</mi><mi>f</mi><mi>l</mi><mi>i</mi><mi>g</mi><mi>h</mi><mi>t</mi><mi>N</mi><mi>a</mi><mi>m</mi><mi>e</mi></mrow><mo>−</mo></mrow><annotation encoding="application/x-tex">{flight.flightName} - </annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.10764em;">f</span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mord mathnormal">i</span><span class="mord mathnormal" style="margin-right:0.03588em;">g</span><span class="mord mathnormal">h</span><span class="mord mathnormal">t</span><span class="mord">.</span><span class="mord mathnormal" style="margin-right:0.10764em;">f</span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mord mathnormal">i</span><span class="mord mathnormal" style="margin-right:0.03588em;">g</span><span class="mord mathnormal">h</span><span class="mord mathnormal" style="margin-right:0.10903em;">tN</span><span class="mord mathnormal">am</span><span class="mord mathnormal">e</span></span><span class="mord">−</span></span></span></span>{flight.originCity} → ${flight.destinationCity}`
    );
    setActiveDropdown(null);
    
    // ✅ En mode compagnie, l'agence est déduite du vol sélectionné
    if (searchMode === 'company') {
      const agency = agencies.find(a => a.id === flight.agencyId);
      if (agency) {
        setSelectedAgency(agency);
        setAgencySearchTerm(agency.name);
        setFormData(prev => ({ ...prev, agencyId: agency.id }));
      }
    }

    setFormData(prev => ({
      ...prev,
      outboundFlightId: flight.id,
      startDestinationId: flight.originId,
      endDestinationId: flight.destinationId
    }));
    
    // Reset classe
    setSelectedClass(null);
    setSelectedClassDetail(null);
    setClassSearchTerm('');
  };

  const handleReturnFlightSelect = (flight) => {
    setSelectedReturnFlight(flight);
    setReturnFlightSearchTerm(
      `<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mrow><mi>f</mi><mi>l</mi><mi>i</mi><mi>g</mi><mi>h</mi><mi>t</mi><mi mathvariant="normal">.</mi><mi>f</mi><mi>l</mi><mi>i</mi><mi>g</mi><mi>h</mi><mi>t</mi><mi>N</mi><mi>a</mi><mi>m</mi><mi>e</mi></mrow><mo>−</mo></mrow><annotation encoding="application/x-tex">{flight.flightName} - </annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.10764em;">f</span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mord mathnormal">i</span><span class="mord mathnormal" style="margin-right:0.03588em;">g</span><span class="mord mathnormal">h</span><span class="mord mathnormal">t</span><span class="mord">.</span><span class="mord mathnormal" style="margin-right:0.10764em;">f</span><span class="mord mathnormal" style="margin-right:0.01968em;">l</span><span class="mord mathnormal">i</span><span class="mord mathnormal" style="margin-right:0.03588em;">g</span><span class="mord mathnormal">h</span><span class="mord mathnormal" style="margin-right:0.10903em;">tN</span><span class="mord mathnormal">am</span><span class="mord mathnormal">e</span></span><span class="mord">−</span></span></span></span>{flight.originCity} → ${flight.destinationCity}`
    );
    setActiveDropdown(null);
    setFormData(prev => ({ ...prev, returnFlightId: flight.id }));
  };

  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem);
    setSelectedClassDetail(classes.find(c => c.id === (classItem.classId || classItem.id)));
    setClassSearchTerm(classItem.className);
    setActiveDropdown(null);
    
    setFormData(prev => ({
      ...prev,
      classId: classItem.classId || classItem.id,
      classAgencyId: classItem.isGeneric ? '' : classItem.id
    }));
  };

  // ============================================================================
  // CALCUL DU PRIX TOTAL
  // ============================================================================
  useEffect(() => {
    if (!selectedClass || !passengers.length) {
      setTotalPrice(0);
      return;
    }

    let price = 0;
    const basePrice = parseFloat(selectedClass.price) || 0;

    passengers.forEach(passenger => {
      let passengerPrice = basePrice;

      if (passenger.typePassenger !== 'ADLT') {
        const rule = pricingRules.find(r => 
          r.agencyClassId === selectedClass.id && 
          r.typePassenger === passenger.typePassenger
        );
        if (rule) {
          passengerPrice += parseFloat(rule.price) || 0;
        }
      }

      if (formData.tripType === 'round-trip' && selectedReturnFlight) {
        const returnClass = classAgencies.find(c => 
          c.agencyVolId === selectedReturnFlight.id && 
          c.classId === (selectedClass.classId || selectedClass.id)
        );
        passengerPrice += parseFloat(returnClass?.price || basePrice);
      }

      price += passengerPrice;
    });

    setTotalPrice(price);
    setFormData(prev => ({ ...prev, totalPrice: price }));
  }, [selectedClass, passengers, formData.tripType, selectedReturnFlight, pricingRules, classAgencies]);

  // ============================================================================
  // GESTION DES PASSAGERS
  // ============================================================================
  const addPassenger = () => {
    setPassengers(prev => [...prev, {
      id: Date.now(),
      firstName: '',
      lastName: '',
      gender: '',
      birthDate: '',
      nationality: '',
      typePassenger: 'ADLT',
      documents: [{
        id: Date.now() + 1,
        documentType: '',
        documentNumber: '',
        issueDate: '',
        expirationDate: '',
        files: []
      }]
    }]);
  };

  const removePassenger = (id) => {
    if (passengers.length > 1) {
      setPassengers(prev => prev.filter(p => p.id !== id));
    }
  };

  const updatePassenger = (id, field, value) => {
    setPassengers(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const addDocument = (passengerId) => {
    setPassengers(prev => prev.map(p => {
      if (p.id === passengerId) {
        return {
          ...p,
          documents: [...p.documents, {
            id: Date.now(),
            documentType: '',
            documentNumber: '',
            issueDate: '',
            expirationDate: '',
            files: []
          }]
        };
      }
      return p;
    }));
  };

  const removeDocument = (passengerId, docId) => {
    setPassengers(prev => prev.map(p => {
      if (p.id === passengerId && p.documents.length > 1) {
        return {
          ...p,
          documents: p.documents.filter(d => d.id !== docId)
        };
      }
      return p;
    }));
  };

  const updateDocument = (passengerId, docId, field, value) => {
    setPassengers(prev => prev.map(p => {
      if (p.id === passengerId) {
        return {
          ...p,
          documents: p.documents.map(d => 
            d.id === docId ? { ...d, [field]: value } : d
          )
        };
      }
      return p;
    }));
  };

  // ============================================================================
  // SOUMISSION DU FORMULAIRE
  // ============================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedAgency) {
      setError('Veuillez sélectionner une agence (ou sélectionner un vol pour déduire l\'agence)');
      return;
    }
    if (!selectedOutboundFlight) {
      setError('Veuillez sélectionner un vol aller');
      return;
    }
    if (!selectedClass) {
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

    for (const passenger of passengers) {
      if (!passenger.firstName || !passenger.lastName || !passenger.gender || 
          !passenger.birthDate || !passenger.nationality) {
        setError('Tous les champs des passagers sont requis');
        return;
      }
      
      for (const doc of passenger.documents) {
        if (!doc.documentType || !doc.documentNumber || !doc.issueDate || !doc.expirationDate) {
          setError('Tous les champs des documents sont requis');
          return;
        }
      }
    }

    setIsSubmitting(true);
    setError('');

    try {
      const reservationData = {
        agencyId: selectedAgency.id,
        companyId: selectedCompany?.id || null,
        outboundFlightId: selectedOutboundFlight.id,
        returnFlightId: selectedReturnFlight?.id || null,
        classId: selectedClass.classId || selectedClass.id,
        classAgencyId: selectedClass.isGeneric ? null : selectedClass.id,
        startDestinationId: formData.startDestinationId,
        endDestinationId: formData.endDestinationId,
        startAt: formData.startAt,
        endAt: formData.tripType === 'round-trip' ? formData.endAt : null,
        tripType: formData.tripType,
        description: formData.description,
        totalPrice: totalPrice,
        passengers: passengers.map(p => ({
          ...p,
          documents: p.documents.map(d => ({
            ...d,
            files: d.files.map(f => ({
              name: f.name,
              type: f.type,
              size: f.size
            }))
          }))
        }))
      };

      const response = await reservationService.createReservationDemande(reservationData);
      
      if (response.success) {
        setSuccessMessage('Réservation créée avec succès !');
        setTimeout(() => navigate('/customer/dashboard'), 2000);
      } else {
        setError(response.message || 'Erreur lors de la création');
      }
    } catch (err) {
      console.error('❌ Erreur soumission:', err);
      setError(err.message || 'Une erreur est survenue');
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
                <span className="text-xs text-gray-500">Sélectionner une agence puis ses vols</span>
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
                <span className="text-xs text-gray-500">Rechercher par compagnie aérienne</span>
              </button>
            </div>
          </div>

          {/* ===== MODE AGENCE : SECTION AGENCE ===== */}
          {searchMode === 'agency' && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faBuilding} className="text-green-600" />
                1. Sélection de l'agence
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
                        setSelectedClass(null);
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
                    <span className="font-medium">Agence:</span> {selectedAgency.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {availableOutboundFlights.length} vol(s) disponible(s)
                  </p>
                </div>
              )}

              {/* Filtre optionnel par compagnie en mode agence */}
              {selectedAgency && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Filtrer par compagnie (optionnel) :</p>
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
                          placeholder="Rechercher une compagnie..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                        <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                      {selectedCompany && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCompany(null);
                            setCompanySearchTerm('');
                            setWarningMessage('');
                            setFormData(prev => ({ ...prev, companyId: '' }));
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
                              <span className="font-medium text-gray-800">{company.name}</span>
                            </div>
                          </DropdownItem>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">Aucune compagnie trouvée</div>
                      )}
                    </Dropdown>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== MODE COMPAGNIE : SECTION COMPAGNIE ===== */}
          {searchMode === 'company' && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faPlane} className="text-indigo-600" />
                1. Rechercher par compagnie
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
                      required
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
                        setSelectedOutboundFlight(null);
                        setOutboundFlightSearchTerm('');
                        setSelectedAgency(null);
                        setAgencySearchTerm('');
                        setSelectedClass(null);
                        setSelectedClassDetail(null);
                        setClassSearchTerm('');
                        setWarningMessage('');
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
                    <span className="font-medium">Compagnie:</span> {selectedCompany.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {availableOutboundFlights.length} vol(s) disponible(s)
                  </p>
                </div>
              )}

              {/* Agence déduite automatiquement */}
              {selectedAgency && searchMode === 'company' && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-gray-500">Agence déduite du vol sélectionné :</p>
                  <p className="text-sm font-medium text-green-700">{selectedAgency.name}</p>
                </div>
              )}
            </div>
          )}

          {/* ===== SECTION VOL ALLER ===== */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-600" />
              {searchMode === 'agency' ? '2' : '2'}. Vol aller
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
                        setFormData(prev => ({ ...prev, outboundFlightId: '' }));
                      }
                    }}
                    onFocus={() => setActiveDropdown('outbound')}
                    placeholder="Rechercher un vol..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={searchMode === 'agency' ? !selectedAgency : !selectedCompany}
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
                      setSelectedClass(null);
                      setSelectedClassDetail(null);
                      setClassSearchTerm('');
                      if (searchMode === 'company') {
                        setSelectedAgency(null);
                        setAgencySearchTerm('');
                      }
                    }}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>

              {searchMode === 'agency' && !selectedAgency && (
                <p className="mt-2 text-xs text-yellow-600">Sélectionnez d'abord une agence</p>
              )}
              {searchMode === 'company' && !selectedCompany && (
                <p className="mt-2 text-xs text-yellow-600">Sélectionnez d'abord une compagnie</p>
              )}

              <Dropdown isOpen={activeDropdown === 'outbound'} onClose={() => setActiveDropdown(null)}>
                {availableOutboundFlights.length > 0 ? (
                  availableOutboundFlights.map(flight => (
                    <DropdownItem key={flight.id} onClick={() => handleOutboundFlightSelect(flight)}>
                      <div className="flex items-start gap-3">
                        <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-500 mt-1" />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium text-gray-800">{flight.flightName}</p>
                            {flight.departureTime && (
                              <span className="text-xs text-gray-500">{formatDate(flight.departureTime)}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {flight.originCity} → {flight.destinationCity}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                              {flight.companyName}
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
                  </div>
                )}
              </Dropdown>
            </div>

            {selectedOutboundFlight && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium">{selectedOutboundFlight.flightName}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedOutboundFlight.originCity} → {selectedOutboundFlight.destinationCity}
                </p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs text-indigo-600">{selectedOutboundFlight.companyName}</span>
                  <span className="text-xs text-green-600">• {selectedOutboundFlight.agencyName}</span>
                </div>
              </div>
            )}
          </div>

          {/* ===== SECTION CLASSE ===== */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faChair} className="text-purple-600" />
              3. Sélection de la classe
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
                          if (selectedClass) {
                            setSelectedClass(null);
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
                    
                    {selectedClass && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClass(null);
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
                            <span className="font-semibold text-green-600">
                              {parseFloat(classItem.price || 0).toLocaleString()} FCFA
                            </span>
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
                  <p className="font-bold text-green-600">
                    {parseFloat(selectedClass?.price || 0).toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ===== SECTION TYPE DE VOYAGE ===== */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faRedoAlt} className="text-orange-600" />
              4. Type de voyage
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <select
                  value={formData.tripType}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      tripType: e.target.value,
                      returnFlightId: e.target.value === 'one-way' ? '' : prev.returnFlightId,
                      endAt: e.target.value === 'one-way' ? '' : prev.endAt
                    }));
                    if (e.target.value === 'one-way') {
                      setSelectedReturnFlight(null);
                      setReturnFlightSearchTerm('');
                    }
                  }}
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
                                {flight.originCity} → {flight.destinationCity}
                              </p>
                              <p className="text-xs text-gray-500">{flight.companyName}</p>
                            </div>
                          </div>
                        </DropdownItem>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">Aucun vol retour disponible</div>
                    )}
                  </Dropdown>

                  {selectedReturnFlight && (
                    <div className="mt-2 text-sm text-purple-600">{selectedReturnFlight.flightName}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ===== SECTION DATES ===== */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-green-600" />
              5. Dates de voyage
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Date de départ</label>
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
                  <label className="text-xs text-gray-500 mb-1 block">Date de retour</label>
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

          {/* ===== SECTION DESTINATIONS ===== */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-indigo-600" />
              Destinations
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Origine</label>
                <input
                  type="text"
                  value={getDestinationName(formData.startDestinationId)}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Destination</label>
                <input
                  type="text"
                  value={getDestinationName(formData.endDestinationId)}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                />
              </div>
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

            {passengers.map((passenger, index) => (
              <div key={passenger.id} className="mb-4 p-3 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm flex items-center gap-2">
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
                    Passager {index + 1}
                  </span>
                  {passengers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePassenger(passenger.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FontAwesomeIcon icon={faTrash} size="sm" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <input
                    type="text"
                    value={passenger.firstName}
                    onChange={(e) => updatePassenger(passenger.id, 'firstName', e.target.value)}
                    placeholder="Prénom"
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={passenger.lastName}
                    onChange={(e) => updatePassenger(passenger.id, 'lastName', e.target.value)}
                    placeholder="Nom"
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                  <select
                    value={passenger.gender}
                    onChange={(e) => updatePassenger(passenger.id, 'gender', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="">Genre</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                  <input
                    type="date"
                    value={passenger.birthDate}
                    onChange={(e) => updatePassenger(passenger.id, 'birthDate', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={passenger.nationality}
                    onChange={(e) => updatePassenger(passenger.id, 'nationality', e.target.value)}
                    placeholder="Nationalité"
                    className="px-2 py-1 border border-gray-300 rounded"
                  />
                  <select
                    value={passenger.typePassenger}
                    onChange={(e) => updatePassenger(passenger.id, 'typePassenger', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="ADLT">Adulte</option>
                    <option value="CHD">Enfant</option>
                    <option value="INF">Bébé</option>
                  </select>
                </div>

                {/* Documents */}
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-600">Documents</span>
                    <button
                      type="button"
                      onClick={() => addDocument(passenger.id)}
                      className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      + Document
                    </button>
                  </div>

                  {passenger.documents.map((doc, docIndex) => (
                    <div key={doc.id} className="mb-2 p-2 bg-gray-50 rounded text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs">Document {docIndex + 1}</span>
                        {passenger.documents.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDocument(passenger.id, doc.id)}
                            className="text-xs text-red-500"
                          >
                            <FontAwesomeIcon icon={faTrash} size="xs" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <select
                          value={doc.documentType}
                          onChange={(e) => updateDocument(passenger.id, doc.id, 'documentType', e.target.value)}
                          className="text-xs p-1 border rounded"
                        >
                          <option value="">Type</option>
                          <option value="PASSPORT">Passeport</option>
                          <option value="ID">CIN</option>
                        </select>
                        <input
                          type="text"
                          value={doc.documentNumber}
                          onChange={(e) => updateDocument(passenger.id, doc.id, 'documentNumber', e.target.value)}
                          placeholder="N°"
                          className="text-xs p-1 border rounded"
                        />
                        <input
                          type="date"
                          value={doc.issueDate}
                          onChange={(e) => updateDocument(passenger.id, doc.id, 'issueDate', e.target.value)}
                          className="text-xs p-1 border rounded"
                        />
                        <input
                          type="date"
                          value={doc.expirationDate}
                          onChange={(e) => updateDocument(passenger.id, doc.id, 'expirationDate', e.target.value)}
                          className="text-xs p-1 border rounded"
                        />
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
