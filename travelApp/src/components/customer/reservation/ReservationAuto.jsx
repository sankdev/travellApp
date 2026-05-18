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
  faInfoCircle,
  faCheckCircle,
  faExclamationTriangle
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
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [profile, setProfile] = useState({});
  const [document, setDocumentFiles] = useState([]);
  const [agencySearch, setAgencySearch] = useState('');
  const [volSearch, setVolSearch] = useState('');
  const [classes, setClasses] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [classSearch, setClassSearch] = useState('');
  const [showClassSuggestions, setShowClassSuggestions] = useState(false);
  const [showReturnVolSuggestions, setShowReturnVolSuggestions] = useState(false);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [passengersWithDocuments, setPassengersWithDocuments] = useState([]);
  const [returnVolSearch, setReturnVolSearch] = useState('');
  const [filteredReturnVols, setFilteredReturnVols] = useState([]);
  const [showAgencySuggestions, setShowAgencySuggestions] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [startDestinationSearch, setStartDestinationSearch] = useState('');
  const [endDestinationSearch, setEndDestinationSearch] = useState('');
  const [startDestinations, setStartDestinations] = useState([]);
  const [endDestinations, setEndDestinations] = useState([]);
  const [showStartDestinationSuggestions, setShowStartDestinationSuggestions] = useState(false);
  const [showEndDestinationSuggestions, setShowEndDestinationSuggestions] = useState(false);
  const [showVolSuggestions, setShowVolSuggestions] = useState(false);
  const [hasPendingReservation, setHasPendingReservation] = useState(false);
  
  // Initialisation des passagers avec un passager par défaut
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

  useEffect(() => {
    const initializeReservationData = async () => {
      setInitialLoading(true);
      try {
        let flightData = null;
        let source = '';

        // 1. Vérifier s'il y a des données passées via location.state
        if (location.state?.flightData) {
          flightData = location.state.flightData;
          source = 'location.state';
        }
        // 2. Vérifier s'il y a une réservation en attente dans localStorage
        else {
          const pendingReservation = getPendingReservationData();
          if (pendingReservation) {
            flightData = pendingReservation.flightData;
            source = 'localStorage';
            setHasPendingReservation(true);
            
            // Nettoyer localStorage après récupération
            localStorage.removeItem('pendingReservation');
          }
        }

        // Si on a des données de vol, remplir le formulaire
        if (flightData) {
          console.log(`📦 Données de vol récupérées depuis ${source}:`, flightData);
          await populateFormFromFlightData(flightData);
          setSuccessMessage(`✅ Vol "${flightData.flight?.name || 'sélectionné'}" pré-rempli avec succès!`);
        }

      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des données:', error);
        setError('Erreur lors du chargement des données de réservation');
      } finally {
        setInitialLoading(false);
      }
    };

    // Fonction pour remplir le formulaire avec les données du vol
    const populateFormFromFlightData = async (flightData) => {
      if (!flightData) return;

      const updatedFormData = {
        // Agence
        agencyId: flightData.agency?.id || flightData.agencyId || '',
        
        // Vol principal
        agencyVolId: flightData.id || flightData.volId || flightData.flight?.id || '',
        companyId: flightData.flight?.companyVol?.id || flightData.flight?.companyId || '',
        
        // Destinations
        destinationId: flightData.flight?.destination?.id || flightData.flight?.destinationId || '',
        startDestinationId: flightData.flight?.origin?.id || flightData.flight?.originId || '',
        endDestinationId: flightData.flight?.destination?.id || flightData.flight?.destinationId || '',
        
        // Dates et prix
        startAt: flightData.departureTime || flightData.flight?.startAt || '',
        endAt: flightData.arrivalTime || flightData.flight?.endAt || '',
        totalPrice: flightData.price || 0,
        
        // Description
        description: `Réservation pour le vol ${flightData.flight?.name || ''}${flightData.agency?.name ? ` - Agence: ${flightData.agency.name}` : ''}`,
        
        // Autres champs (conservés s'ils existent déjà)
        ...formData
      };

      setFormData(updatedFormData);

      // Mettre à jour les champs de recherche pour l'affichage
      if (flightData.agency?.name) {
        setAgencySearch(flightData.agency.name);
      }
      
      if (flightData.flight?.name) {
        setVolSearch(flightData.flight.name);
      }
      
      if (flightData.flight?.origin?.name || flightData.flight?.origin?.city) {
        setStartDestinationSearch(flightData.flight.origin.name || flightData.flight.origin.city || flightData.flight?.origin?.country || '');
      }
      
      if (flightData.flight?.destination?.name || flightData.flight?.destination?.city) {
        setEndDestinationSearch(flightData.flight.destination.name || flightData.flight.destination.city || flightData.flight?.destination?.country || '');
      }

      // Charger les classes disponibles pour cette agence
      if (flightData.agency?.id) {
        await loadClassesForAgency(flightData.agency.id);
      }
    };

    // Fonction pour charger les classes d'une agence
    const loadClassesForAgency = async (agencyId) => {
      try {
        const response = await agencyAssociationService.getClassAgencyByAgencyId(agencyId);
        if (response && Array.isArray(response.data)) {
          setClasses(response.data);
          console.log(`✅ ${response.data.length} classes chargées pour l'agence ${agencyId}`);
          
          // Sélectionner automatiquement la première classe si disponible
          if (response.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              agencyClassId: response.data[0].id
            }));
            setClassSearch(response.data[0].class?.name || '');
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des classes:', error);
      }
    };

    // Initialiser les données
    initializeReservationData();

    // Charger les autres données nécessaires
    const fetchData = async () => {
      try {
        const [destResponse, compResponse, profResponse, custResponse] = await Promise.all([
          fetchDestinations(),
          fetchCompanies(),
          fetchProfile(),
          fetchCustomers(),
        ]);
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError('Failed to load one or more data sets.');
      }
    };

    fetchData();
  }, [location.state]);

  // Fonctions utilitaires existantes
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const inputClassName = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm";

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
          
          // Si le type de passager change, recalculer le prix
          if (key === 'typePassenger') {
            setTimeout(() => handlePriceCalculation(), 100);
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
    setTimeout(() => handlePriceCalculation(), 100);
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
    if (['agencyVolId', 'returnVolId', 'agencyClassId', 'tripType'].includes(name)) {
      setTimeout(() => handlePriceCalculation(), 100);
    }
  };

  // Calcul du prix
  const handlePriceCalculation = async () => {
    const selectedVol = vols.find((v) => v.id === formData.agencyVolId);
    const selectedClass = Array.isArray(classes) ? classes.find((cls) => cls.id === formData.agencyClassId) : null;

    if (!selectedVol || !selectedClass) {
      setTotalPrice(0);
      return;
    }

    let basePrice = selectedVol.price * selectedClass.priceMultiplier;

    if (formData.tripType === "round-trip") {
      const selectedReturnVol = vols.find((v) => v.id === formData.returnVolId);
      if (selectedReturnVol) {
        basePrice += selectedReturnVol.price * selectedClass.priceMultiplier;
      }
    }

    try {
      const pricingRules = await pricingRuleService.getAllPricingRules();
      console.log('pricingRules', pricingRules);

      if (!pricingRules || pricingRules.length === 0) {
        setTotalPrice(basePrice);
        return;
      }

      let total = basePrice;

      passengers.forEach((passenger) => {
        if (passenger.typePassenger && passenger.typePassenger !== "ADLT") {
          const rule = pricingRules.find(rule =>
            rule.agencyVolId === formData.agencyVolId &&
            rule.agencyClassId === formData.agencyClassId &&
            rule.typePassenger === passenger.typePassenger
          );

          if (rule) {
            total += rule.price;
          } else {
            console.warn(`Aucune règle tarifaire trouvée pour ${passenger.typePassenger}`);
          }
        }
      });

      setTotalPrice(total);
      setFormData(prev => ({ ...prev, totalPrice: total }));
    } catch (error) {
      console.error("Erreur lors de la récupération des règles de tarification :", error);
      setTotalPrice(basePrice);
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Validation
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

    if (formData.tripType === 'round-trip' && !formData.endAt) {
      setError('La date de retour est requise pour les voyages aller-retour');
      setLoading(false);
      return;
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

      const cleanedFormData = {
        ...formData,
        endAt: formData.tripType === 'one-way' ? null : formData.endAt,
        returnVolId: formData.tripType === 'one-way' ? null : formData.returnVolId
      };

      const payload = {
        ...cleanedFormData,
        passengers: encodedPassengers,
      };

      console.log('payloadsReservation', payload);
      const response = await reservationService.createReservation(payload);
      console.log('✅ Réservation créée avec succès', response.data);

      setSuccessMessage('✅ Réservation créée avec succès!');
      
      // Redirection après 2 secondes
      setTimeout(() => {
        navigate('/customer/reservations');
      }, 2000);

    } catch (err) {
      console.error('❌ Erreur de soumission', err);
      
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

  // ... autres fonctions existantes (fetchDestinations, fetchCompanies, etc.)

  // Composant d'affichage des informations pré-remplies
  const FlightInfoDisplay = () => {
    if (!formData.agencyVolId) return null;

    return (
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
            Vol sélectionné
          </h3>
          {hasPendingReservation && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              Récupéré automatiquement
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div className="bg-white p-2 rounded border">
            <div className="font-medium text-gray-600">Agence</div>
            <div className="font-semibold truncate">
              {agencies.find(a => a.id === parseInt(formData.agencyId))?.name || 'Non spécifié'}
            </div>
          </div>
          <div className="bg-white p-2 rounded border">
            <div className="font-medium text-gray-600">Compagnie</div>
            <div className="font-semibold">{getCompanyById(formData.companyId)}</div>
          </div>
          <div className="bg-white p-2 rounded border">
            <div className="font-medium text-gray-600">Trajet</div>
            <div className="font-semibold">
              {getDestinationById(formData.startDestinationId)} → {getDestinationById(formData.endDestinationId)}
            </div>
          </div>
          <div className="bg-white p-2 rounded border">
            <div className="font-medium text-gray-600">Prix total</div>
            <div className="font-bold text-green-600">{totalPrice.toLocaleString()} FCFA</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
          Ces informations ont été automatiquement remplies depuis votre sélection précédente
        </div>
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données de réservation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nouvelle Réservation</h1>
          <p className="text-gray-600">
            {formData.agencyVolId 
              ? "Complétez les informations manquantes pour finaliser votre réservation" 
              : "Créez une nouvelle réservation en remplissant tous les champs requis"}
          </p>
        </div>

        {/* Affichage des informations du vol */}
        <FlightInfoDisplay />

        {/* Messages d'alerte */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-2">
            <FontAwesomeIcon icon={faCheckCircle} />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            {error}
          </div>
        )}

        {/* Formulaire principal */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section Vol et Classe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sélection de la classe */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faPlane} className="text-blue-500" />
                  Classe
                </label>
                <input
                  type="text"
                  value={classSearch}
                  onChange={(e) => {
                    setClassSearch(e.target.value);
                    if (e.target.value.trim() === '') {
                      setFilteredClasses([]);
                      setShowClassSuggestions(false);
                    } else {
                      const filtered = classes.filter((cls) =>
                        cls.class?.name?.toLowerCase().includes(e.target.value.toLowerCase())
                      );
                      setFilteredClasses(filtered);
                      setShowClassSuggestions(filtered.length > 0);
                    }
                  }}
                  placeholder="Rechercher une classe..."
                  className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {showClassSuggestions && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {filteredClasses.map((cls) => (
                      <li
                        key={cls.id}
                        className="p-3 cursor-pointer hover:bg-blue-50 border-b last:border-b-0"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, agencyClassId: cls.id }));
                          setClassSearch(cls.class?.name || '');
                          setShowClassSuggestions(false);
                        }}
                      >
                        <div className="font-medium">{cls.class?.name}</div>
                        <div className="text-sm text-gray-600">
                          Multiplicateur: {cls.priceMultiplier}x
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Type de voyage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faPlaneDeparture} className="text-purple-500" />
                  Type de voyage
                </label>
                <select
                  name="tripType"
                  value={formData.tripType}
                  onChange={handleInputChange}
                  className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="one-way">Aller simple</option>
                  <option value="round-trip">Aller-retour</option>
                </select>
              </div>
            </div>

            {/* Section Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-green-500" />
                  Date de départ
                </label>
                <input
                  type="date"
                  name="startAt"
                  value={formData.startAt}
                  onChange={handleInputChange}
                  required
                  className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {formData.tripType === 'round-trip' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-green-500" />
                    Date de retour
                  </label>
                  <input
                    type="date"
                    name="endAt"
                    value={formData.endAt}
                    onChange={handleInputChange}
                    required
                    min={formData.startAt}
                    className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              )}
            </div>

            {/* Section Passagers */}
            <div className="border-t pt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUsers} className="text-indigo-500" />
                  Passagers ({passengers.length})
                </h3>
                <button
                  type="button"
                  onClick={addPassenger}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faUser} />
                  Ajouter un passager
                </button>
              </div>

              {passengers.map((passenger, index) => (
                <div key={index} className="mb-8 p-6 bg-gray-50 rounded-xl border">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FontAwesomeIcon icon={faUser} className="text-indigo-500" />
                      Passager {index + 1}
                    </h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removePassenger(index)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Prénom */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={passenger.firstName}
                        onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Jean"
                      />
                    </div>

                    {/* Nom */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={passenger.lastName}
                        onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Dupont"
                      />
                    </div>

                    {/* Genre */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Genre
                      </label>
                      <select
                        value={passenger.gender}
                        onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Sélectionner</option>
                        <option value="feminin">Féminin</option>
                        <option value="masculin">Masculin</option>
                        <option value="autres">Autres</option>
                      </select>
                    </div>

                    {/* Type de passager */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type de passager
                      </label>
                      <select
                        value={passenger.typePassenger}
                        onChange={(e) => handlePassengerChange(index, 'typePassenger', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="ADLT">Adulte (ADLT)</option>
                        <option value="CHD">Enfant (CHD)</option>
                        <option value="INF">Bébé (INF)</option>
                      </select>
                    </div>

                    {/* Date de naissance */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de naissance
                      </label>
                      <input
                        type="date"
                        value={passenger.birthDate}
                        onChange={(e) => handlePassengerChange(index, 'birthDate', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    {/* Nationalité */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nationalité
                      </label>
                      <input
                        type="text"
                        value={passenger.nationality}
                        onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Française"
                      />
                    </div>
                  </div>

                  {/* Documents du passager */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-md font-medium text-gray-900">Documents</h5>
                      <button
                        type="button"
                        onClick={() => addDocument(index)}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        + Ajouter un document
                      </button>
                    </div>

                    {passenger.document.map((doc, docIndex) => (
                      <div key={docIndex} className="mb-4 p-4 bg-white rounded border">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Type de document */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Type de document
                            </label>
                            <select
                              value={doc.documentType}
                              onChange={(e) => handleDocumentChange(index, docIndex, 'documentType', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded"
                            >
                              <option value="">Sélectionner</option>
                              <option value="passport">Passeport</option>
                              <option value="acte_naissance">Acte de naissance</option>
                              <option value="carte_identite">Carte d'identité</option>
                            </select>
                          </div>

                          {/* Numéro de document */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Numéro
                            </label>
                            <input
                              type="text"
                              value={doc.documentNumber}
                              onChange={(e) => handleDocumentChange(index, docIndex, 'documentNumber', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded"
                              placeholder="AB123456"
                            />
                          </div>

                          {/* Date d'expiration */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date d'expiration
                            </label>
                            <input
                              type="date"
                              value={doc.expirationDate}
                              onChange={(e) => handleDocumentChange(index, docIndex, 'expirationDate', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded"
                            />
                          </div>

                          {/* Fichier */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Fichier
                            </label>
                            <input
                              type="file"
                              onChange={(e) => handleFileChange(e, index, docIndex)}
                              className="w-full p-2 border border-gray-300 rounded"
                              accept=".pdf,.jpg,.jpeg,.png"
                            />
                          </div>
                        </div>
                        
                        {/* Bouton supprimer document */}
                        {docIndex > 0 && (
                          <button
                            type="button"
                            onClick={() => removeDocument(index, docIndex)}
                            className="mt-3 text-sm text-red-600 hover:text-red-800"
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

            {/* Prix total et bouton de soumission */}
            <div className="border-t pt-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {totalPrice.toLocaleString()} FCFA
                  </div>
                  <div className="text-sm text-gray-600">Prix total pour {passengers.length} passager(s)</div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-3 text-lg font-semibold text-white rounded-lg transition-all ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Traitement en cours...
                    </span>
                  ) : (
                    'Confirmer la réservation'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateReservation;
