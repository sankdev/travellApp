import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  faPlane,
  faDollarSign,
  faCalendarAlt,
  faVenusMars,
  faSignature,
  faUser,
  faInfoCircle,
  faCheckCircle,
  faArrowLeft,
  faExclamationTriangle,
  faClock,
  faLocationDot,
  faExchangeAlt,
  faTimes,
  faChevronDown,
  faChevronUp,
  faBaby,
  faChild,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';

const CreateReservation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [vols, setVols] = useState([]);
  const [allAgencies, setAllAgencies] = useState([]);
  const [classes, setClasses] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showFlightSearch, setShowFlightSearch] = useState(false);
  const [flightSearchParams, setFlightSearchParams] = useState({
    originId: '',
    destinationId: '',
    companyId: '',
    startDate: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searchingFlights, setSearchingFlights] = useState(false);
  const [hasPendingData, setHasPendingData] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [pricingRules, setPricingRules] = useState([]);
  const [selectedClassAgency, setSelectedClassAgency] = useState(null);
  const [returnFlights, setReturnFlights] = useState([]);
  const [showReturnFlightSearch, setShowReturnFlightSearch] = useState(false);

  // États des passagers
  const [passengers, setPassengers] = useState([{
    firstName: '',
    lastName: '',
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
    totalPrice: '',
    customerId: ''
  });

  // ============================================
  // FONCTIONS UTILITAIRES
  // ============================================

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toISOString();
    } catch {
      return null;
    }
  };

  const generateDescription = (flightData, classData) => {
    const parts = ['Réservation'];
    
    if (classData?.class?.name) {
      parts.push(`Classe ${classData.class.name}`);
    }
    
    if (flightData?.flight?.name) {
      parts.push(`sur le vol ${flightData.flight.name}`);
    }
    
    if (flightData?.agency?.name) {
      parts.push(`via ${flightData.agency.name}`);
    }
    
    const originCity = flightData?.flight?.origin?.city;
    const destCity = flightData?.flight?.destination?.city;
    
    if (originCity && destCity) {
      parts.push(`de ${originCity} à ${destCity}`);
    }
    
    return parts.join(' ');
  };

  const getPassengerTypeIcon = (type) => {
    switch(type) {
      case 'ADLT': return faUserTie;
      case 'CHD': return faChild;
      case 'INF': return faBaby;
      default: return faUser;
    }
  };

  const getPassengerTypeLabel = (type) => {
    switch(type) {
      case 'ADLT': return 'Adulte';
      case 'CHD': return 'Enfant';
      case 'INF': return 'Bébé';
      default: return type;
    }
  };

  // ============================================
  // RÉCUPÉRATION DES DONNÉES DEPUIS CLASSAGENCYID
  // ============================================

  const loadDataFromClassAgencyId = async (classAgencyId) => {
    try {
      console.log(`🔍 Chargement des données pour classAgencyId: ${classAgencyId}`);
      
      const response = await agencyAssociationService.getClassAgencyById(classAgencyId);
      console.log('📦 Réponse ClassAgency:', response);
      
      const classData = response.data || response;
      
      if (!classData) {
        console.log('❌ ClassAgency non trouvée');
        return null;
      }
      
      setSelectedClassAgency(classData);
      
      const flightData = classData.agencyVol;
      const agencyData = flightData?.agency;
      const volData = flightData?.flight;
      
      console.log('📦 Données extraites:', {
        classData,
        flightData,
        agencyData,
        volData
      });
      
      return {
        classData,
        flightData,
        agencyData,
        volData
      };
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      return null;
    }
  };

  // ============================================
  // PRÉ-REMPLISSAGE DU FORMULAIRE
  // ============================================

  const populateFormWithClassData = async (classAgencyId) => {
    try {
      const data = await loadDataFromClassAgencyId(classAgencyId);
      
      if (!data) {
        setError('Impossible de charger les données du vol');
        return;
      }
      
      const { classData, flightData, agencyData, volData } = data;
            
      const updatedFormData = {
        agencyId: agencyData?.id ? parseInt(agencyData.id) : '',
        agencyVolId: flightData?.id ? parseInt(flightData.id) : '',
        startAt: formatDateForInput(flightData?.departureTime),
        endAt: '',
        totalPrice: classData?.price || 0,
        description: generateDescription(flightData, classData),
        startDestinationId: volData?.origin?.id ? parseInt(volData.origin.id) : '',
        endDestinationId: volData?.destination?.id ? parseInt(volData.destination.id) : '',
        agencyClassId: classData?.id ? parseInt(classData.id) : '',
        companyId: volData?.companyVol?.id ? parseInt(volData.companyVol.id) : '',
        destinationId: volData?.destination?.id ? parseInt(volData.destination.id) : '',
        tripType: 'one-way',
        campaignId: '',
        returnVolId: '',
        customerId: formData.customerId || ''
      };
      
      console.log('✅ Formulaire pré-rempli:', updatedFormData);
      
      setFormData(updatedFormData);
      setTotalPrice(classData?.price || 0);
      setHasPendingData(true);
      setSelectedFlight({
        ...flightData,
        agency: agencyData,
        flight: volData,
        class: classData
      });
      
      if (flightData?.id) {
        await loadClassesForFlight(flightData.id, classData.id);
      }
      
    } catch (error) {
      console.error('❌ Erreur pré-remplissage:', error);
      setError('Erreur lors du pré-remplissage');
    }
  };

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================

  const loadAllData = async () => {
    try {
      console.log('🔄 Chargement de toutes les données...');
      
      const [companiesRes, destinationsRes, agenciesRes, flightsRes, pricingRulesRes] = await Promise.all([
        companyService.getCompanies(),
        destinationService.getDestinations(),
        agencyService.getAgencies({ status: 'active' }),
        agencyAssociationService.getAllFlightAgencies({ limit: 1000 }),
        pricingRuleService.getAllPricingRules()
      ]);

      if (companiesRes?.data) {
        const companiesData = Array.isArray(companiesRes.data) ? companiesRes.data : companiesRes.data?.data || [];
        setCompanies(companiesData);
        console.log(`✅ ${companiesData.length} compagnies chargées`);
      }

      if (destinationsRes?.data) {
        const destinationsData = Array.isArray(destinationsRes.data) ? destinationsRes.data : destinationsRes.data?.data || [];
        setDestinations(destinationsData);
        console.log(`✅ ${destinationsData.length} destinations chargées`);
      }

      if (agenciesRes?.data) {
        const agenciesData = Array.isArray(agenciesRes.data) ? agenciesRes.data : agenciesRes.data?.data || [];
        setAllAgencies(agenciesData);
        console.log(`✅ ${agenciesData.length} agences chargées`);
      }

      if (flightsRes?.data) {
        const flightsData = Array.isArray(flightsRes.data) ? flightsRes.data : flightsRes.data?.data || [];
        setVols(flightsData);
        console.log(`✅ ${flightsData.length} vols chargés`);
      }

      if (pricingRulesRes) {
        setPricingRules(Array.isArray(pricingRulesRes) ? pricingRulesRes : []);
        console.log(`✅ ${pricingRulesRes.length} règles de prix chargées`);
      }

    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    }
  };

  // ============================================
  // CHARGEMENT DES CLASSES POUR UN VOL
  // ============================================

  const loadClassesForFlight = async (agencyVolId, selectedClassId = null) => {
    try {
      console.log(`📚 Chargement des classes pour agencyVolId: ${agencyVolId}`);
      
      const response = await agencyAssociationService.getClassAgenciesByFlight(agencyVolId);
      const classesData = response.data || response;
      
      if (Array.isArray(classesData) && classesData.length > 0) {
        setClasses(classesData);
        console.log(`✅ ${classesData.length} classes chargées`);
        
        if (selectedClassId) {
          const selectedClass = classesData.find(c => c.id === parseInt(selectedClassId));
          if (selectedClass) {
            console.log('🎯 Classe pré-sélectionnée:', selectedClass);
            setFormData(prev => ({
              ...prev,
              agencyClassId: selectedClass.id
            }));
            // Calculer le prix immédiatement
            setTimeout(() => calculateTotalPrice(), 10);
          }
        }
      } else {
        console.log('⚠️ Aucune classe trouvée');
        setClasses([]);
      }
    } catch (error) {
      console.error('❌ Erreur chargement classes:', error);
      setClasses([]);
    }
  };

  // ============================================
  // CHARGEMENT DES VOLS RETOUR
  // ============================================

  
  // ============================================
// CHARGEMENT DES VOLS RETOUR - SANS AUCUN FILTRE
// ============================================
// ============================================
// CHARGEMENT DES VOLS RETOUR - UNIQUEMENT LE VOL ALLER
// ============================================

const loadReturnFlights = async () => {
  try {
    console.log('🔄 Chargement du vol aller comme vol retour...');
    
    // ✅ Vérifier qu'un vol aller est sélectionné
    if (!formData.agencyVolId) {
      console.log('⚠️ Aucun vol aller sélectionné');
      setReturnFlights([]);
      return;
    }
    
    // ✅ Trouver le vol aller dans la liste des vols
    const outboundFlight = vols.find(flight => flight.id === parseInt(formData.agencyVolId));
    
    if (!outboundFlight) {
      console.log('⚠️ Vol aller non trouvé');
      setReturnFlights([]);
      return;
    }
    
    // ✅ Créer un tableau avec uniquement le vol aller
    const returnFlightsList = [outboundFlight];
    
    setReturnFlights(returnFlightsList);
    console.log(`🔄 Vol aller sélectionné comme vol retour:`, outboundFlight);
    const flightId = outboundFlight.id;
    console.log(`✅ Sélection automatique du vol retour ID: ${flightId}`);
    
    // Mettre à jour formData avec le returnVolId
    setFormData(prev => ({ 
      ...prev, 
      returnVolId: flightId 
    }));
    
    // ✅ Recalculer le prix immédiatement
    setTimeout(() => calculateTotalPrice(), 10);
  } catch (error) {
    console.error('❌ Erreur chargement vols retour:', error);
    setReturnFlights([]);
  }
};
const loadReturnFlightsCorr = async () => {
  try {
    console.log('🔄 Chargement de tous les vols disponibles...');
    
    // ✅ Prendre tous les vols sans aucun filtre
    const allFlights = [...vols];
    
    // ✅ Optionnel: juste un petit tri pour mieux organiser
    const sortedFlights = allFlights.sort((a, b) => 
      new Date(a.departureTime) - new Date(b.departureTime)
    );
    
    setReturnFlights(sortedFlights);
    console.log(`🔄 ${sortedFlights.length} vols disponibles chargés`);

  } catch (error) {
    console.error('❌ Erreur chargement vols retour:', error);
    setReturnFlights([]);
  }
};
  // ============================================
  // GESTION DES DONNÉES EN ATTENTE
  // ============================================

  const getPendingReservationData = () => {
    try {
      const pendingData = localStorage.getItem('pendingReservation');
      console.log('📦 Données brutes localStorage:', pendingData);
      
      if (!pendingData) return null;

      const reservation = JSON.parse(pendingData);
      console.log('📦 Données parsées:', reservation);

      const timestamp = new Date(reservation.timestamp).getTime();
      const now = new Date().getTime();
      const thirtyMinutes = 30 * 60 * 1000;

      if (now - timestamp > thirtyMinutes) {
        console.log('⚠️ Données expirées');
        localStorage.removeItem('pendingReservation');
        return null;
      }

      return reservation.classAgencyId || reservation.flightData?.id;
    } catch (error) {
      console.error('❌ Erreur lecture localStorage:', error);
      return null;
    }
  };

  // ============================================
  // CALCUL DU PRIX - CORRIGÉ
  // ============================================

  const calculateTotalPrice = async () => {
    try {
      if (!formData.agencyClassId) {
        setTotalPrice(0);
        return;
      }

      const selectedClass = classes.find(cls => cls.id === parseInt(formData.agencyClassId));
      if (!selectedClass) {
        setTotalPrice(0);
        return;
      }

      console.log('🧮 Calcul du prix avec la classe:', selectedClass);
      
      const adultBasePrice = parseFloat(selectedClass.price) || 0;
      let total = 0;

      // Prix aller pour chaque passager
      for (const passenger of passengers) {
        const passengerType = passenger.typePassenger || 'ADLT';
        
        if (passengerType === 'ADLT') {
          total += adultBasePrice;
        } else {
          // Chercher la règle dans pricingRules
          const rulePassengerType = passengerType === 'ADLT' ? 'ADL' : passengerType;
          
          const rule = pricingRules.find(r => 
            r.agencyClassId === selectedClass.id &&
            r.typePassenger === rulePassengerType
          );
          
          if (rule) {
            total += parseFloat(rule.price) || adultBasePrice;
          } else {
            total += adultBasePrice;
          }
        }
      }

      // Prix retour si aller-retour et vol retour sélectionné
      if (formData.tripType === 'round-trip' && formData.returnVolId) {
        try {
          const returnClassResponse = await agencyAssociationService.getClassAgencyByFlightAndClass(
            parseInt(formData.returnVolId),
            selectedClass.classId
          );
          
          const returnClass = returnClassResponse?.data || returnClassResponse;
          
          if (returnClass) {
            const returnPrice = parseFloat(returnClass.price) || adultBasePrice;
            
            // Ajouter le prix retour pour chaque passager
            for (const passenger of passengers) {
              const passengerType = passenger.typePassenger || 'ADLT';
              
              if (passengerType === 'ADLT') {
                total += returnPrice;
              } else {
                const rulePassengerType = passengerType === 'ADLT' ? 'ADL' : passengerType;
                
                const returnRule = pricingRules.find(r => 
                  r.agencyClassId === returnClass.id &&
                  r.typePassenger === rulePassengerType
                );
                
                if (returnRule) {
                  total += parseFloat(returnRule.price) || returnPrice;
                } else {
                  total += returnPrice;
                }
              }
            }
          } else {
            // Fallback: même prix que l'aller
            total += adultBasePrice * passengers.length;
          }
        } catch (error) {
          console.error('Erreur calcul retour:', error);
          total += adultBasePrice * passengers.length;
        }
      }

      console.log('💰 Prix total final:', total);
      setTotalPrice(total);

    } catch (error) {
      console.error('❌ Erreur calcul prix:', error);
    }
  };

  // ============================================
  // GESTION DES PASSAGERS
  // ============================================

  const handlePassengerChange = (index, key, value) => {
    setPassengers(prev =>
      prev.map((passenger, i) => {
        if (i === index) {
          const updated = { ...passenger, [key]: value, document: passenger.document || [] };
          return updated;
        }
        return passenger;
      })
    );
    // Recalculer le prix après la mise à jour
    setTimeout(() => calculateTotalPrice(), 10);
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
        typePassenger: "ADLT",
        address: '',
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
    setTimeout(() => calculateTotalPrice(), 10);
  };

  const removePassenger = (index) => {
    if (passengers.length === 1) {
      setError('Au moins un passager est requis');
      return;
    }
    setPassengers(prev => prev.filter((_, i) => i !== index));
    setTimeout(() => calculateTotalPrice(), 10);
  };

  // ============================================
  // GESTION DES DOCUMENTS
  // ============================================

  const addDocument = (passengerIndex) => {
    setPassengers(prev =>
      prev.map((passenger, i) => {
        if (i === passengerIndex) {
          return {
            ...passenger,
            document: [
              ...(passenger.document || []),
              { documentType: '', documentNumber: '', issueDate: '', expirationDate: '', files: [] }
            ]
          };
        }
        return passenger;
      })
    );
  };

  const removeDocument = (passengerIndex, docIndex) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[passengerIndex].document.splice(docIndex, 1);
      return updated;
    });
  };

  const handleDocumentChange = (passengerIndex, docIndex, field, value) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[passengerIndex].document[docIndex][field] = value;
      return updated;
    });
  };

  const handleFileChange = (e, passengerIndex, docIndex) => {
    const files = Array.from(e.target.files);
    setPassengers(prev => {
      const updated = [...prev];
      updated[passengerIndex].document[docIndex].files = files;
      return updated;
    });
  };

  // ============================================
  // GESTION DU FORMULAIRE
  // ============================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Recalculer le prix immédiatement si nécessaire
    if (name === 'agencyClassId' || name === 'tripType') {
      setTimeout(() => calculateTotalPrice(), 10);
    }
    
    // Charger les vols retour si le type de voyage change
    if (name === 'tripType' && value === 'round-trip') {
      setTimeout(() => loadReturnFlights(), 100);
    }
  };

  // ✅ Sélection du vol retour
  const handleReturnFlightSelect = (flightId) => {
    setFormData(prev => ({ ...prev, returnVolId: flightId }));
    setShowReturnFlightSearch(false);
    // Recalculer le prix avec le vol retour
    setTimeout(() => calculateTotalPrice(), 100);
  };

  const clearPendingData = () => {
    localStorage.removeItem('pendingReservation');
    setFormData({
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
      totalPrice: '',
      customerId: formData.customerId || ''
    });
    setTotalPrice(0);
    setClasses([]);
    setReturnFlights([]);
    setHasPendingData(false);
    setSelectedFlight(null);
    setSelectedClassAgency(null);
    setSuccessMessage('✅ Données effacées');
  };

  // ============================================
  // SOUMISSION - CORRIGÉE
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Validations
    if (!formData.agencyVolId) {
      setError('Veuillez sélectionner un vol');
      setLoading(false);
      return;
    }
    if (!formData.agencyClassId) {
      setError('Veuillez sélectionner une classe');
      setLoading(false);
      return;
    }
    if (!formData.startAt) {
      setError('La date de départ est requise');
      setLoading(false);
      return;
    }
    if (formData.tripType === 'round-trip') {
      if (!formData.endAt) {
        setError('La date de retour est requise');
        setLoading(false);
        return;
      }
      if (!formData.returnVolId) {
        setError('Veuillez sélectionner un vol retour');
        setLoading(false);
        return;
      }
    }

    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].firstName || !passengers[i].lastName) {
        setError(`Le passager ${i + 1} doit avoir un nom et prénom`);
        setLoading(false);
        return;
      }
    }

    try {
      // Encoder les fichiers en base64
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

      // ✅ CORRECTION: S'assurer que les IDs sont des nombres ou null, pas des chaînes vides
      const payload = {
        ...formData,
        startAt: formatDateForAPI(formData.startAt),
        endAt: formData.tripType === 'one-way' ? null : formatDateForAPI(formData.endAt),
        returnVolId: formData.tripType === 'round-trip' ? parseInt(formData.returnVolId) || null : null,
        totalPrice: totalPrice,
        passengers: encodedPassengers,
        agencyId: formData.agencyId ? parseInt(formData.agencyId) : null,
        agencyVolId: formData.agencyVolId ? parseInt(formData.agencyVolId) : null,
        agencyClassId: formData.agencyClassId ? parseInt(formData.agencyClassId) : null,
        companyId: formData.companyId ? parseInt(formData.companyId) : null,
        destinationId: formData.destinationId ? parseInt(formData.destinationId) : null,
        startDestinationId: formData.startDestinationId ? parseInt(formData.startDestinationId) : null,
        endDestinationId: formData.endDestinationId ? parseInt(formData.endDestinationId) : null,
        customerId: formData.customerId ? parseInt(formData.customerId) : null,
        campaignId: formData.campaignId ? parseInt(formData.campaignId) : null,
      };

      console.log('📤 Envoi réservation:', payload);
      const response = await reservationService.createReservationAuto(payload);
      console.log('✅ Réservation créée:', response.data);

      localStorage.removeItem('pendingReservation');
      setSuccessMessage('✅ Réservation créée! Redirection...');
      
      setTimeout(() => navigate('/customer/reservations'), 2000);

    } catch (err) {
      console.error('❌ Erreur soumission:', err);
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    const initialize = async () => {
      setInitialLoading(true);
      try {
        await loadAllData();
        
        const pendingClassId = getPendingReservationData();
        const stateClassId = location.state?.classAgencyId || location.state?.flightData?.id;
        
        if (pendingClassId) {
          console.log('📦 Données en attente trouvées avec ID:', pendingClassId);
          await populateFormWithClassData(pendingClassId);
          setSuccessMessage('✅ Réservation pré-remplie avec succès!');
        } else if (stateClassId) {
          console.log('📦 Données depuis location.state avec ID:', stateClassId);
          await populateFormWithClassData(stateClassId);
        } else {
          const profileRes = await customerService.getCustomerProfile();
          if (profileRes?.data) {
            setFormData(prev => ({ ...prev, customerId: profileRes.data.id }));
          }
        }
      } catch (error) {
        console.error('❌ Erreur initialisation:', error);
        setError('Erreur lors du chargement');
      } finally {
        setInitialLoading(false);
      }
    };

    initialize();
  }, []);

  // Recalculer le prix quand les dépendances changent
  useEffect(() => {
    if (formData.agencyClassId) {
    calculateTotalPrice();
  }
  }, [formData.agencyClassId, passengers, formData.tripType, formData.returnVolId]);

  // Charger les vols retour quand les destinations changent
  useEffect(() => {
    if (formData.tripType === 'round-trip' && formData.agencyId) {
      loadReturnFlights();
    }
  }, [formData.agencyId, formData.startDestinationId, formData.endDestinationId, formData.tripType]);
    // ============================================
// EFFECT - Charger et sélectionner auto quand on passe en round-trip
// ============================================
useEffect(() => {
  if (formData.tripType === 'round-trip' && formData.agencyVolId) {
    loadReturnFlights();
  } else if (formData.tripType === 'one-way') {
    // ✅ Réinitialiser le vol retour quand on passe en one-way
    setFormData(prev => ({ ...prev, returnVolId: '' }));
    setReturnFlights([]);
  }
}, [formData.tripType, formData.agencyVolId, vols]);
  // ============================================
  // COMPOSANTS INTERNES
  // ============================================

  const FlightInfoDisplay = () => {
    if (!selectedFlight && !hasPendingData) return null;

    const agency = allAgencies.find(a => a.id === parseInt(formData.agencyId));
    const origin = destinations.find(d => d.id === parseInt(formData.startDestinationId));
    const destination = destinations.find(d => d.id === parseInt(formData.endDestinationId));
    const selectedClass = classes.find(c => c.id === parseInt(formData.agencyClassId));

    return (
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-sm relative">
        <div className="absolute top-6 right-6 flex gap-2">
          <button
            type="button"
            onClick={() => setShowFlightSearch(!showFlightSearch)}
            className="px-4 py-2 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faExchangeAlt} />
            {showFlightSearch ? 'Masquer' : 'Changer de vol'}
          </button>
          <button
            type="button"
            onClick={clearPendingData}
            className="px-4 py-2 bg-white border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faTimes} />
            Effacer
          </button>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
          Vol sélectionné
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faBuilding} className="text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Agence</div>
                <div className="font-semibold">{agency?.name || selectedFlight?.agency?.name}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faPlane} className="text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Compagnie</div>
                <div className="font-semibold">
                  {selectedFlight?.flight?.companyVol?.name || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faLocationDot} className="text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Trajet</div>
                <div className="font-semibold">
                  {origin?.city || selectedFlight?.flight?.origin?.city} → {destination?.city || selectedFlight?.flight?.destination?.city}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faDollarSign} className="text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Prix</div>
                <div className="font-bold text-2xl text-green-600">
                  {totalPrice.toLocaleString()} FCFA
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedClass && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600" />
                <span className="font-medium">Classe sélectionnée:</span>
              </div>
              <span className="font-semibold text-blue-700">
                {selectedClass.class?.name} - {parseFloat(selectedClass.price).toLocaleString()} FCFA
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // RENDU PRINCIPAL
  // ============================================

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Chargement de votre réservation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Retour
        </button>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Finaliser votre réservation
        </h1>

        <FlightInfoDisplay />

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1" />
            <p className="font-medium text-green-800">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mt-1" />
            <p className="font-medium text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* SECTION SÉLECTION DE LA CLASSE */}
              <div className="mb-6">
                <label className="block text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faPlane} className="text-blue-600" />
                  </div>
                  <span>Choisissez une classe</span>
                </label>

                {classes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((cls) => {
                      const isSelected = parseInt(formData.agencyClassId) === cls.id;
                      const className = cls.class?.name || 'Classe';
                      const price = parseFloat(cls.price).toLocaleString();
                      
                      return (
                        <div
                          key={cls.id}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, agencyClassId: cls.id }));
                            // ✅ Calcul immédiat du prix
                               calculateTotalPrice(cls.id);
                       //      setTimeout(() => calculateTotalPrice(), 10);
                          }}
                          className={`
                            p-4 rounded-xl border-2 cursor-pointer transition-all
                            ${isSelected 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                            }
                          `}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-lg">{className}</h4>
                              <p className="text-sm text-gray-600">
                                {cls.class?.description || 'Classe standard'}
                              </p>
                            </div>
                            {isSelected && (
                              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xl" />
                            )}
                          </div>
                          
                          <div className="mt-3 flex justify-between items-center">
                            <span className="text-2xl font-bold text-green-600">
                              {price} FCFA
                            </span>
                            <span className="text-sm text-gray-500">
                              par personne
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed">
                    <p className="text-gray-500">Aucune classe disponible pour ce vol</p>
                  </div>
                )}
              </div>

              {/* Affichage du prix total */}
              {formData.agencyClassId && (
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Prix total</h3>
                      <p className="text-sm text-gray-600">
                        {classes.find(c => c.id === parseInt(formData.agencyClassId))?.class?.name}
                        {' '}pour {passengers.length} passager(s)
                      </p>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {totalPrice.toLocaleString()} FCFA
                    </div>
                  </div>
                </div>
              )}

              {/* Type de voyage et Dates */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-600" />
                    </div>
                    <span>Dates de voyage</span>
                  </label>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tripType: 'one-way', returnVolId: '' }))}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          formData.tripType === 'one-way'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold">Aller simple</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, tripType: 'round-trip' }));
                          setTimeout(() => loadReturnFlights(), 100);
                        }}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          formData.tripType === 'round-trip'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold">Aller-retour</div>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Départ *</label>
                        <input
                          type="date"
                          name="startAt"
                          value={formData.startAt}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border-2 border-gray-200 rounded-lg"
                        />
                      </div>

                      {formData.tripType === 'round-trip' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Retour *</label>
                          <input
                            type="date"
                            name="endAt"
                            value={formData.endAt}
                            onChange={handleInputChange}
                            required
                            min={formData.startAt}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg"
                          />
                        </div>
                      )}
                    </div>

                    {/* ✅ SECTION VOL RETOUR */}
                    {formData.tripType === 'round-trip' && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vol retour *
                        </label>
                        
                        {returnFlights.length > 0 ? (
                          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                            {returnFlights.map((flight) => {
                              const isSelected = parseInt(formData.returnVolId) === flight.id;
                              return (
                                <div
                                  key={flight.id}
                                  onClick={() => handleReturnFlightSelect(flight.id)}
                                  className={`
                                    p-3 rounded-lg border-2 cursor-pointer transition-all
                                    ${isSelected 
                                      ? 'border-purple-500 bg-purple-50' 
                                      : 'border-gray-200 hover:border-purple-300'
                                    }
                                  `}
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <div className="font-medium">{flight.flight?.name}</div>
                                      <div className="text-sm text-gray-600">
                                        {flight.flight?.origin?.city} → {flight.flight?.destination?.city}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {flight.flight?.companyVol?.name}
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-4 text-center bg-gray-50 rounded-lg border border-dashed">
                            <p className="text-gray-500">
                              {formData.endDestinationId && formData.startDestinationId
                                ? 'Aucun vol retour disponible'
                                : 'Sélectionnez d\'abord les destinations'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Passagers */}
              <div className="border-t pt-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faUsers} className="text-indigo-600" />
                    </div>
                    Passagers
                  </h3>
                  <button
                    type="button"
                    onClick={addPassenger}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-3"
                  >
                    <FontAwesomeIcon icon={faUser} />
                    Ajouter
                  </button>
                </div>

                {passengers.map((passenger, index) => {
                  const typeIcon = getPassengerTypeIcon(passenger.typePassenger);
                  
                  return (
                    <div key={index} className="bg-gray-50 rounded-2xl border p-6 mb-6">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-semibold flex items-center gap-3">
                          <span className="w-8 h-8 bg-white border-2 border-indigo-200 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                            {index + 1}
                          </span>
                          <FontAwesomeIcon icon={typeIcon} className="text-indigo-500" />
                          Passager {index + 1} - {getPassengerTypeLabel(passenger.typePassenger)}
                        </h4>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removePassenger(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FontAwesomeIcon icon={faTimes} /> Supprimer
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Prénom *</label>
                          <input
                            type="text"
                            value={passenger.firstName}
                            onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                            required
                            className="w-full p-3 border rounded-lg"
                            placeholder="Jean"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Nom *</label>
                          <input
                            type="text"
                            value={passenger.lastName}
                            onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                            required
                            className="w-full p-3 border rounded-lg"
                            placeholder="Dupont"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Type</label>
                          <select
                            value={passenger.typePassenger}
                            onChange={(e) => handlePassengerChange(index, 'typePassenger', e.target.value)}
                            className="w-full p-3 border rounded-lg"
                          >
                            <option value="ADLT">Adulte</option>
                            <option value="CHD">Enfant</option>
                            <option value="INF">Bébé</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Genre</label>
                          <select
                            value={passenger.gender}
                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                            className="w-full p-3 border rounded-lg"
                          >
                            <option value="">Sélectionner</option>
                            <option value="masculin">Masculin</option>
                            <option value="feminin">Féminin</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Date naissance</label>
                          <input
                            type="date"
                            value={passenger.birthDate}
                            onChange={(e) => handlePassengerChange(index, 'birthDate', e.target.value)}
                            className="w-full p-3 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Nationalité</label>
                          <input
                            type="text"
                            value={passenger.nationality}
                            onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            placeholder="Française"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Lieu naissance</label>
                          <input
                            type="text"
                            value={passenger.birthPlace}
                            onChange={(e) => handlePassengerChange(index, 'birthPlace', e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            placeholder="Paris"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Profession</label>
                          <input
                            type="text"
                            value={passenger.profession}
                            onChange={(e) => handlePassengerChange(index, 'profession', e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            placeholder="Ingénieur"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">Adresse</label>
                          <input
                            type="text"
                            value={passenger.address}
                            onChange={(e) => handlePassengerChange(index, 'address', e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            placeholder="123 Rue de Paris"
                          />
                        </div>
                      </div>

                      {/* Prix individuel pour ce passager */}
                      {formData.agencyClassId && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm">
                            <span className="font-medium">Prix pour ce passager: </span>
                            {passenger.typePassenger === 'ADLT' ? (
                              <span className="text-green-600 font-bold">
                                {classes.find(c => c.id === parseInt(formData.agencyClassId))?.price?.toLocaleString()} FCFA
                              </span>
                            ) : (
                              (() => {
                                const selectedClass = classes.find(c => c.id === parseInt(formData.agencyClassId));
                                const rulePassengerType = passenger.typePassenger === 'ADLT' ? 'ADL' : passenger.typePassenger;
                                const rule = pricingRules.find(r => 
                                  r.agencyClassId === selectedClass?.id &&
                                  r.typePassenger === rulePassengerType
                                );
                                const price = rule ? parseFloat(rule.price) : (selectedClass?.price || 0);
                                return (
                                  <span className="text-green-600 font-bold">
                                    {price.toLocaleString()} FCFA
                                    {rule ? ' (règle spéciale)' : ' (prix adulte)'}
                                  </span>
                                );
                              })()
                            )}
                          </p>
                        </div>
                      )}

                      {/* Documents */}
                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="text-lg font-semibold">Documents</h5>
                          <button
                            type="button"
                            onClick={() => addDocument(index)}
                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                          >
                            + Ajouter un document
                          </button>
                        </div>

                        {passenger.document.map((doc, docIndex) => (
                          <div key={docIndex} className="bg-white p-4 rounded-xl border mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm mb-1">Type</label>
                                <select
                                  value={doc.documentType}
                                  onChange={(e) => handleDocumentChange(index, docIndex, 'documentType', e.target.value)}
                                  className="w-full p-2 border rounded"
                                >
                                  <option value="">Sélectionner</option>
                                  <option value="passport">Passeport</option>
                                  <option value="carte_identite">Carte d'identité</option>
                                  <option value="acte_naissance">Acte de naissance</option>
                                  <option value="permis">Permis de conduire</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm mb-1">Numéro</label>
                                <input
                                  type="text"
                                  value={doc.documentNumber}
                                  onChange={(e) => handleDocumentChange(index, docIndex, 'documentNumber', e.target.value)}
                                  className="w-full p-2 border rounded"
                                  placeholder="AB123456"
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-1">Date d'émission</label>
                                <input
                                  type="date"
                                  value={doc.issueDate}
                                  onChange={(e) => handleDocumentChange(index, docIndex, 'issueDate', e.target.value)}
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-1">Date d'expiration</label>
                                <input
                                  type="date"
                                  value={doc.expirationDate}
                                  onChange={(e) => handleDocumentChange(index, docIndex, 'expirationDate', e.target.value)}
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                              <div className="md:col-span-3">
                                <label className="block text-sm mb-1">Fichier</label>
                                <input
                                  type="file"
                                  onChange={(e) => handleFileChange(e, index, docIndex)}
                                  className="w-full p-2 border rounded"
                                  multiple
                                  accept=".pdf,.jpg,.jpeg,.png"
                                />
                                {doc.files && doc.files.length > 0 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {doc.files.length} fichier(s) sélectionné(s)
                                  </p>
                                )}
                              </div>
                            </div>
                            {docIndex > 0 && (
                              <button
                                type="button"
                                onClick={() => removeDocument(index, docIndex)}
                                className="mt-4 text-red-600 text-sm"
                              >
                                Supprimer ce document
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Résumé et soumission */}
              <div className="border-t pt-8">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-2xl font-bold mb-6">Résumé</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                          <span>Passagers</span>
                          <span className="font-semibold">{passengers.length}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span>Type de voyage</span>
                          <span className="font-semibold">
                            {formData.tripType === 'one-way' ? 'Aller simple' : 'Aller-retour'}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span>Classe</span>
                          <span className="font-semibold">
                            {classes.find(c => c.id === parseInt(formData.agencyClassId))?.class?.name || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span>Prix total</span>
                          <span className="font-semibold text-green-600">
                            {totalPrice.toLocaleString()} FCFA
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border shadow-sm">
                      <div className="text-center mb-6">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          {totalPrice.toLocaleString()} FCFA
                        </div>
                        <div className="text-gray-600">
                          Total pour {passengers.length} passager(s)
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Notes</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="w-full p-3 border rounded-lg"
                          rows="3"
                          placeholder="Instructions supplémentaires..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 text-lg font-bold text-white rounded-xl transition-all ${
                          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                        }`}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Traitement...
                          </div>
                        ) : (
                          'Confirmer la réservation'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReservation;
