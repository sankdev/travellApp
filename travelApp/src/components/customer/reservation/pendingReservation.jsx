// components/CreateReservation.jsx
import React, { useEffect, useState } from 'react';
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
  faPlaneDeparture,
  faMapSigns,
  faMapMarkerAlt,
  faMapPin,
  faCalendarAlt,
  faVenusMars,
  faSignature,
  faUser,
  faInfoCircle,
  faCheckCircle,faArrowLeft,
  faExclamationTriangle,
  faClock,
  faTag,
  faLocationDot,
  faGlobe
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
  const [agencies, setAgencies] = useState([]);
  const [classes, setClasses] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // États de recherche
  const [agencySearch, setAgencySearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [showClassSuggestions, setShowClassSuggestions] = useState(false);
  const [filteredClasses, setFilteredClasses] = useState([]);
  
  // États des passagers
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

  // Fonction pour récupérer et traiter la réservation en attente
  const getPendingReservationData = () => {
    try {
      const pendingData = localStorage.getItem('pendingReservation');
      if (!pendingData) return null;
      
      const reservation = JSON.parse(pendingData);
      
      // Vérifier si les données sont expirées (plus de 30 minutes)
      const timestamp = new Date(reservation.timestamp).getTime();
      const now = new Date().getTime();
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (now - timestamp > thirtyMinutes) {
        localStorage.removeItem('pendingReservation');
        return null;
      }
      
      return reservation;
    } catch (error) {
      console.error('❌ Erreur lors de la lecture du localStorage:', error);
      return null;
    }
  };

  // Fonction pour extraire et formater les données importantes
  const extractFlightData = (flightData) => {
    if (!flightData) return null;
    
    return {
      // Informations de base
      id: flightData.id,
      price: flightData.price,
      agencyId: flightData.agencyId,
      volId: flightData.volId,
      
      // Agence
      agency: flightData.agency || {},
      
      // Vol
      flight: flightData.flight || {},
      
      // Dates (utiliser les dates du vol si pas de dates spécifiques)
      departureTime: flightData.departureTime || flightData.flight?.startAt,
      arrivalTime: flightData.arrivalTime || flightData.flight?.endAt,
      
      // Compagnie aérienne
      company: flightData.flight?.companyVol || {},
      
      // Destinations
      origin: flightData.flight?.origin || {},
      destination: flightData.flight?.destination || {}
    };
  };

  useEffect(() => {
    const initializeReservationData = async () => {
      setInitialLoading(true);
      try {
        let flightData = null;
        let source = '';
        let pendingReservation = null;

        // 1. Vérifier s'il y a une réservation en attente dans localStorage
        pendingReservation = getPendingReservationData();
        if (pendingReservation) {
          flightData = extractFlightData(pendingReservation.flightData);
          source = 'localStorage';
          console.log('📦 Données récupérées depuis localStorage:', flightData);
        }
        // 2. Vérifier s'il y a des données passées via location.state
        else if (location.state?.flightData) {
          flightData = extractFlightData(location.state.flightData);
          source = 'location.state';
          console.log('📦 Données récupérées depuis location.state:', flightData);
        }

        // Si on a des données de vol, remplir le formulaire
        if (flightData) {
          await populateFormFromFlightData(flightData);
          setSuccessMessage(`✅ Vol "${flightData.flight?.companyVol.name || 'sélectionné'}" pré-rempli avec succès!`);
          
          // Nettoyer localStorage après utilisation
          if (pendingReservation) {
            localStorage.removeItem('pendingReservation');
          }
        }

        // Charger les données nécessaires
        await fetchInitialData();

      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        setError('Erreur lors du chargement des données de réservation');
      } finally {
        setInitialLoading(false);
      }
    };

    // Fonction pour remplir le formulaire avec les données du vol
    const populateFormFromFlightData = async (flightData) => {
      if (!flightData) return;

      const updatedFormData = {
        // Agence (priorité: agency.id > agencyId)
        agencyId: flightData.agency?.id || flightData.agencyId || '',
        
        // Vol principal (priorité: flight.id > id > volId)
        agencyVolId: flightData.flight?.id || flightData.id || flightData.volId || '',
        
        // Compagnie aérienne
        companyId: flightData.company?.id || flightData.flight?.companyId || '',
        
        // Destinations
        destinationId: flightData.destination?.id || flightData.flight?.destinationId || '',
        startDestinationId: flightData.origin?.id || flightData.flight?.origin.Id || 1, // Par défaut Bamako
        endDestinationId: flightData.destination?.id || flightData.flight?.destination.Id || '',
        
        // Dates
        startAt: formatDateForInput(flightData.departureTime),
        endAt: formatDateForInput(flightData.arrivalTime),
        
        // Prix
        totalPrice: flightData.price || 0,
        
        // Description
        description: generateDescription(flightData),
        
        // Autres champs par défaut
        tripType: 'one-way',
        campaignId: '',
        returnVolId: ''
      };

      setFormData(updatedFormData);
      setTotalPrice(flightData.price || 0);

      // Mettre à jour les champs de recherche pour l'affichage
      if (flightData.agency?.name) {
        setAgencySearch(flightData.agency.name);
      }

      // Charger les classes disponibles pour cette agence
      if (flightData.agency?.id) {
        await loadClassesForAgency(flightData.agency.id);
      }

      // Charger les compagnies et destinations pour référence
      await loadReferenceData();
    };

    // Fonction utilitaire pour formater la date pour input date
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      } catch {
        return '';
      }
    };

    // Générer une description automatique
    const generateDescription = (flightData) => {
      const parts = ['Réservation pour le vol'];
      
      if (flightData.flight?.name) {
        parts.push(`"${flightData.flight.name}"`);
      }
      
      if (flightData.agency?.name) {
        parts.push(`via ${flightData.agency.name}`);
      }
      
      if (flightData.company?.name) {
        parts.push(`(${flightData.company.name})`);
      }
      
      if (flightData.origin?.name && flightData.destination?.name) {
        parts.push(`de ${flightData.origin.name} à ${flightData.destination.name}`);
      }
      
      return parts.join(' ');
    };

    // Fonction pour charger les classes d'une agence
    const loadClassesForAgency = async (agencyId) => {
      try {
        const response = await agencyAssociationService.getClassByAgencyId(agencyId);
        if (response && Array.isArray(response.data)) {
          setClasses(response.data);
          console.log(`✅ ${response.data.length} classes chargées pour l'agence ${agencyId}`);
          
          // Sélectionner automatiquement la première classe si disponible
          if (response.data.length > 0) {
            const firstClass = response.data[0];
            setFormData(prev => ({
              ...prev,
              agencyClassId: firstClass.id
            }));
            setClassSearch(firstClass.class?.name || 'Classe Standard');
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des classes:', error);
      }
    };

    // Charger les données de référence
    const loadReferenceData = async () => {
      try {
        const [companiesRes, destinationsRes] = await Promise.all([
          companyService.getCompanies(),
          destinationService.getDestinations()
        ]);
        
        if (companiesRes && Array.isArray(companiesRes.data)) {
          setCompanies(companiesRes.data);
        }
        
        if (destinationsRes && Array.isArray(destinationsRes.data)) {
          setDestinations(destinationsRes.data);
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des données de référence:', error);
      }
    };

    // Charger les données initiales
    const fetchInitialData = async () => {
      try {
        const [profileRes] = await Promise.all([
          customerService.getCustomerProfile()
        ]);
        
        if (profileRes?.data) {
          setFormData(prev => ({
            ...prev,
            customerId: profileRes.data.id || ''
          }));
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des données initiales:', error);
      }
    };

    // Initialiser
    initializeReservationData();
  }, [location.state]);

  // Gestion des passagers
  const handlePassengerChange = (index, key, value) => {
    setPassengers((prev) =>
      prev.map((passenger, i) => {
        if (i === index) {
          const updatedPassenger = {
            ...passenger,
            [key]: value,
            document: passenger.document || [],
          };
          
          // Recalculer le prix si le type de passager change
          if (key === 'typePassenger') {
            setTimeout(() => calculateTotalPrice(), 100);
          }
          
          return updatedPassenger;
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
        typePassenger: "ADLT",
        address: '',
        document: [],
        status: 'active',
      },
    ]);
  };

  const removePassenger = (index) => {
    if (passengers.length === 1) {
      setError('Au moins un passager est requis');
      return;
    }
    const newPassengers = passengers.filter((_, i) => i !== index);
    setPassengers(newPassengers);
    setTimeout(() => calculateTotalPrice(), 100);
  };

  // Gestion des documents
  const addDocument = (passengerIndex) => {
    setPassengers((prev) =>
      prev.map((passenger, i) => {
        if (i === passengerIndex) {
          return {
            ...passenger,
            document: [
              ...(passenger.document || []),
              { 
                documentType: '', 
                documentNumber: '',
                expirationDate: "",
                issueDate: "", 
                files: [] 
              },
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

  // Gestion du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Recalculer le prix si certains champs changent
    if (['agencyClassId', 'tripType'].includes(name)) {
      setTimeout(() => calculateTotalPrice(), 100);
    }
  };

  // Calcul du prix total
  const calculateTotalPrice = async () => {
    try {
      const selectedClass = classes.find(cls => cls.id === parseInt(formData.agencyClassId));
      if (!selectedClass) {
        setTotalPrice(formData.totalPrice || 0);
        return;
      }

      let basePrice = formData.totalPrice || 0;
      let total = basePrice * selectedClass.priceMultiplier;

      // Appliquer les règles de tarification pour les enfants et bébés
      if (passengers.length > 0) {
        const pricingRules = await pricingRuleService.getAllPricingRules();
        
        if (pricingRules && pricingRules.length > 0) {
          passengers.forEach(passenger => {
            if (passenger.typePassenger && passenger.typePassenger !== "ADLT") {
              const rule = pricingRules.find(rule =>
                rule.agencyVolId === parseInt(formData.agencyVolId) &&
                rule.agencyClassId === parseInt(formData.agencyClassId) &&
                rule.typePassenger === passenger.typePassenger
              );

              if (rule) {
                total += rule.price;
              }
            }
          });
        }
      }

      setTotalPrice(total);
    } catch (error) {
      console.error('❌ Erreur lors du calcul du prix:', error);
      setTotalPrice(formData.totalPrice || 0);
    }
  };

  // Mettre à jour le calcul du prix quand les dépendances changent
  useEffect(() => {
    calculateTotalPrice();
  }, [formData.agencyClassId, formData.totalPrice, passengers, classes]);

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Validation
    const validations = [
      { condition: !formData.agencyVolId, message: 'Veuillez sélectionner un vol' },
      { condition: !formData.agencyClassId, message: 'Veuillez sélectionner une classe' },
      { condition: !formData.startAt, message: 'La date de départ est requise' },
      { 
        condition: formData.tripType === 'round-trip' && !formData.endAt, 
        message: 'La date de retour est requise pour les voyages aller-retour' 
      },
    ];

    for (const validation of validations) {
      if (validation.condition) {
        setError(validation.message);
        setLoading(false);
        return;
      }
    }

    // Validation des passagers
    for (let i = 0; i < passengers.length; i++) {
      const passenger = passengers[i];
      if (!passenger.firstName || !passenger.lastName) {
        setError(`Le passager ${i + 1} doit avoir un nom et prénom`);
        setLoading(false);
        return;
      }
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

      const payload = {
        ...formData,
        endAt: formData.tripType === 'one-way' ? null : formData.endAt,
        returnVolId: formData.tripType === 'one-way' ? null : formData.returnVolId,
        totalPrice: totalPrice,
        passengers: encodedPassengers,
      };

      console.log('📤 Envoi de la réservation:', payload);
      const response = await reservationService.createReservation(payload);
      console.log('✅ Réservation créée avec succès:', response.data);

      setSuccessMessage('✅ Réservation créée avec succès! Redirection...');
      
      // Redirection après 2 secondes
      setTimeout(() => {
        navigate('/customer/reservations');
      }, 2000);

    } catch (err) {
      console.error('❌ Erreur de soumission:', err);
      
      if (err.response) {
        setError(err.response.data.error || 'Une erreur est survenue.');
      } else if (err.request) {
        setError('Le serveur ne répond pas. Vérifiez votre connexion.');
      } else {
        setError('Une erreur inattendue est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonctions utilitaires
  const getCompanyName = () => {
    if (formData.companyId && companies.length > 0) {
      const company = companies.find(c => c.id === parseInt(formData.companyId));
      return company?.name || 'Compagnie inconnue';
    }
    return 'Compagnie inconnue';
  };

  const getDestinationName = (id) => {
    if (id && destinations.length > 0) {
      const destination = destinations.find(d => d.id === parseInt(id));
      return destination?.name || destination?.city || 'Destination inconnue';
    }
    return 'Destination inconnue';
  };

  const getAgencyName = () => {
    if (formData.agencyId && agencies.length > 0) {
      const agency = agencies.find(a => a.id === parseInt(formData.agencyId));
      return agency?.name || 'Agence inconnue';
    }
    return 'Agence inconnue';
  };

  // Composant d'affichage des informations pré-remplies
  const FlightInfoDisplay = () => {
    if (!formData.agencyVolId) return null;

    const flightData = getPendingReservationData()?.flightData;
    
    return (
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
              Vol sélectionné
            </h3>
            <p className="text-gray-600 flex items-center gap-2">
              <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />
              Ces informations ont été automatiquement remplies depuis votre sélection
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-2">
              <FontAwesomeIcon icon={faClock} />
              Données récupérées automatiquement
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Agence */}
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faBuilding} className="text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Agence</div>
                <div className="font-semibold text-gray-900">
                  {flightData?.agency?.name || getAgencyName()}
                </div>
              </div>
            </div>
          </div>

          {/* Compagnie aérienne */}
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faPlane} className="text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Compagnie</div>
                <div className="font-semibold text-gray-900">
                  {flightData?.flight?.companyVol?.name || getCompanyName()}
                </div>
              </div>
            </div>
          </div>

          {/* Trajet */}
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faLocationDot} className="text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Trajet</div>
                <div className="font-semibold text-gray-900">
                  {flightData?.flight?.origin?.city || 'Bamako'} → {flightData?.flight?.destination?.city || 'Destination'}
                </div>
              </div>
            </div>
          </div>

          {/* Prix */}
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faDollarSign} className="text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Prix de base</div>
                <div className="font-bold text-2xl text-green-600">
                  {(flightData?.price || 0).toLocaleString()} FCFA
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Détails supplémentaires */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <FontAwesomeIcon icon={faTag} className="text-blue-500" />
            <div>
              <div className="text-sm text-gray-500">Nom du vol</div>
              <div className="font-medium">{flightData?.flight?.name || 'Vol non spécifié'}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <FontAwesomeIcon icon={faGlobe} className="text-green-500" />
            <div>
              <div className="text-sm text-gray-500">Destination</div>
              <div className="font-medium">
                {flightData?.flight?.destination?.country || 'Pays non spécifié'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-500" />
            <div>
              <div className="text-sm text-gray-500">Dates</div>
              <div className="font-medium">
                {formData.startAt ? new Date(formData.startAt).toLocaleDateString('fr-FR') : 'Non spécifié'}
                {formData.endAt ? ` - ${new Date(formData.endAt).toLocaleDateString('fr-FR')}` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Chargement de votre réservation...</p>
          <p className="mt-2 text-sm text-gray-500">Récupération des données depuis votre sélection précédente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* En-tête */}
        <div className="mb-8">
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
          <p className="text-gray-600 text-lg">
            Complétez les informations nécessaires pour confirmer votre voyage
          </p>
        </div>

        {/* Affichage des informations du vol */}
        <FlightInfoDisplay />

        {/* Messages d'alerte */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-fadeIn">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1" />
            <div className="flex-1">
              <p className="font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fadeIn">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mt-1" />
            <div className="flex-1">
              <p className="font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Formulaire principal */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Section Classe et Type de voyage */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sélection de la classe */}
                <div className="relative">
                  <label className="block text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faPlane} className="text-blue-600" />
                    </div>
                    <span>Classe de voyage</span>
                  </label>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={classSearch}
                      onChange={(e) => {
                        const value = e.target.value;
                        setClassSearch(value);
                        
                        if (value.trim() === '') {
                          setFilteredClasses([]);
                          setShowClassSuggestions(false);
                        } else {
                          const filtered = classes.filter(cls =>
                            cls.class?.name?.toLowerCase().includes(value.toLowerCase())
                          );
                          setFilteredClasses(filtered);
                          setShowClassSuggestions(filtered.length > 0);
                        }
                      }}
                      placeholder="Rechercher une classe..."
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    
                    {showClassSuggestions && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                        {filteredClasses.map((cls) => (
                          <div
                            key={cls.id}
                            className="p-4 cursor-pointer hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, agencyClassId: cls.id }));
                              setClassSearch(cls.class?.name || '');
                              setShowClassSuggestions(false);
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-semibold text-gray-900">{cls.class?.name}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Multiplicateur: {cls.priceMultiplier}x
                                </div>
                              </div>
                              <div className="text-lg font-bold text-blue-600">
                                {Math.round((formData.totalPrice || 0) * cls.priceMultiplier).toLocaleString()} FCFA
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {formData.agencyClassId && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {classes.find(c => c.id === parseInt(formData.agencyClassId))?.class?.name || 'Classe sélectionnée'}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Prix ajusté selon la classe
                          </div>
                        </div>
                        <div className="text-xl font-bold text-blue-600">
                          {totalPrice.toLocaleString()} FCFA
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Type de voyage et Dates */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-600" />
                    </div>
                    <span>Dates de voyage</span>
                  </label>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de voyage
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, tripType: 'one-way' }))}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            formData.tripType === 'one-way'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-semibold">Aller simple</div>
                          <div className="text-sm text-gray-600 mt-1">Un seul trajet</div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, tripType: 'round-trip' }))}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            formData.tripType === 'round-trip'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-semibold">Aller-retour</div>
                          <div className="text-sm text-gray-600 mt-1">Trajet retour inclus</div>
                        </button>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de départ *
                        </label>
                        <input
                          type="date"
                          name="startAt"
                          value={formData.startAt}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      {formData.tripType === 'round-trip' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date de retour *
                          </label>
                          <input
                            type="date"
                            name="endAt"
                            value={formData.endAt}
                            onChange={handleInputChange}
                            required
                            min={formData.startAt}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Passagers */}
              <div className="border-t pt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faUsers} className="text-indigo-600 text-lg" />
                      </div>
                      Informations des passagers
                    </h3>
                    <p className="text-gray-600 mt-2">
                      Ajoutez les informations de tous les passagers pour ce voyage
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={addPassenger}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-3 font-semibold whitespace-nowrap"
                  >
                    <FontAwesomeIcon icon={faUser} />
                    Ajouter un passager
                  </button>
                </div>

                {/* Liste des passagers */}
                <div className="space-y-6">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="bg-gray-50 rounded-2xl border p-6">
                      {/* En-tête du passager */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white border-2 border-indigo-200 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold text-indigo-600">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold text-gray-900">Passager {index + 1}</h4>
                            <p className="text-gray-600 text-sm">
                              {passenger.typePassenger === 'ADLT' ? 'Adulte' : 
                               passenger.typePassenger === 'CHD' ? 'Enfant' : 'Bébé'}
                            </p>
                          </div>
                        </div>
                        
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removePassenger(index)}
                            className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <span>Supprimer ce passager</span>
                          </button>
                        )}
                      </div>

                      {/* Formulaire du passager */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Prénom */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Prénom *
                          </label>
                          <input
                            type="text"
                            value={passenger.firstName}
                            onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Jean"
                          />
                        </div>

                        {/* Nom */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nom *
                          </label>
                          <input
                            type="text"
                            value={passenger.lastName}
                            onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Dupont"
                          />
                        </div>

                        {/* Type de passager */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Type de passager
                          </label>
                          <select
                            value={passenger.typePassenger}
                            onChange={(e) => handlePassengerChange(index, 'typePassenger', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="ADLT">Adulte (ADLT)</option>
                            <option value="CHD">Enfant (CHD) 2-11 ans</option>
                            <option value="INF">Bébé (INF) 0-2 ans</option>
                          </select>
                        </div>

                        {/* Genre */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Genre
                          </label>
                          <select
                            value={passenger.gender}
                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          >
                            <option value="">Sélectionner</option>
                            <option value="feminin">Féminin</option>
                            <option value="masculin">Masculin</option>
                            <option value="autres">Autres</option>
                          </select>
                        </div>

                        {/* Date de naissance */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Date de naissance
                          </label>
                          <input
                            type="date"
                            value={passenger.birthDate}
                            onChange={(e) => handlePassengerChange(index, 'birthDate', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>

                        {/* Nationalité */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nationalité
                          </label>
                          <input
                            type="text"
                            value={passenger.nationality}
                            onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Française"
                          />
                        </div>

                        {/* Lieu de naissance */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Lieu de naissance
                          </label>
                          <input
                            type="text"
                            value={passenger.birthPlace}
                            onChange={(e) => handlePassengerChange(index, 'birthPlace', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Paris, France"
                          />
                        </div>

                        {/* Profession */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Profession
                          </label>
                          <input
                            type="text"
                            value={passenger.profession}
                            onChange={(e) => handlePassengerChange(index, 'profession', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ingénieur"
                          />
                        </div>
                      </div>

                      {/* Documents du passager */}
                      <div className="mt-8">
                        <div className="flex justify-between items-center mb-6">
                          <h5 className="text-lg font-semibold text-gray-900">Documents d'identité</h5>
                          <button
                            type="button"
                            onClick={() => addDocument(index)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                          >
                            + Ajouter un document
                          </button>
                        </div>

                        {passenger.document.map((doc, docIndex) => (
                          <div key={docIndex} className="mb-6 p-6 bg-white rounded-xl border">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                              {/* Type de document */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Type de document
                                </label>
                                <select
                                  value={doc.documentType}
                                  onChange={(e) => handleDocumentChange(index, docIndex, 'documentType', e.target.value)}
                                  className="w-full p-3 border border-gray-300 rounded-lg"
                                >
                                  <option value="">Sélectionner</option>
                                  <option value="passport">Passeport</option>
                                  <option value="carte_identite">Carte d'identité</option>
                                  <option value="acte_naissance">Acte de naissance</option>
                                  <option value="permis">Permis de conduire</option>
                                </select>
                              </div>

                              {/* Numéro de document */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Numéro du document
                                </label>
                                <input
                                  type="text"
                                  value={doc.documentNumber}
                                  onChange={(e) => handleDocumentChange(index, docIndex, 'documentNumber', e.target.value)}
                                  className="w-full p-3 border border-gray-300 rounded-lg"
                                  placeholder="AB12345678"
                                />
                              </div>

                              {/* Date d'expiration */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Date d'expiration
                                </label>
                                <input
                                  type="date"
                                  value={doc.expirationDate}
                                  onChange={(e) => handleDocumentChange(index, docIndex, 'expirationDate', e.target.value)}
                                  className="w-full p-3 border border-gray-300 rounded-lg"
                                />
                              </div>

                              {/* Fichier */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Scan du document
                                </label>
                                <input
                                  type="file"
                                  onChange={(e) => handleFileChange(e, index, docIndex)}
                                  className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                />
                                {doc.files && doc.files.length > 0 && (
                                  <div className="mt-2 text-sm text-gray-500">
                                    {doc.files.length} fichier(s) sélectionné(s)
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Bouton supprimer document */}
                            {docIndex > 0 && (
                              <button
                                type="button"
                                onClick={() => removeDocument(index, docIndex)}
                                className="mt-4 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded"
                              >
                                Supprimer ce document
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Résumé et soumission */}
              <div className="border-t pt-8">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Résumé du prix */}
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-6">Résumé de la réservation</h4>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b">
                          <span className="text-gray-600">Vol sélectionné</span>
                          <span className="font-semibold">{formData.agencyVolId ? 'Oui' : 'Non'}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-3 border-b">
                          <span className="text-gray-600">Nombre de passagers</span>
                          <span className="font-semibold">{passengers.length}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-3 border-b">
                          <span className="text-gray-600">Type de voyage</span>
                          <span className="font-semibold">
                            {formData.tripType === 'one-way' ? 'Aller simple' : 'Aller-retour'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center py-3 border-b">
                          <span className="text-gray-600">Classe</span>
                          <span className="font-semibold">
                            {classes.find(c => c.id === parseInt(formData.agencyClassId))?.class?.name || 'Non sélectionnée'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Prix total et bouton */}
                    <div className="bg-white rounded-xl p-6 border shadow-sm">
                      <div className="text-center mb-6">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          {totalPrice.toLocaleString()} FCFA
                        </div>
                        <div className="text-gray-600">
                          Prix total pour {passengers.length} passager(s)
                        </div>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 text-lg font-bold text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                          loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                        }`}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Traitement en cours...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCheckCircle} />
                            Confirmer la réservation
                          </>
                        )}
                      </button>
                      
                      <div className="mt-4 text-center text-sm text-gray-500">
                        En cliquant sur "Confirmer", vous acceptez les conditions générales
                      </div>
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
