import React, { useEffect, useState } from 'react';
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
  faTrash
} from '@fortawesome/free-solid-svg-icons';

// Services (à adapter selon vos implémentations réelles)
import { agencyService } from '../../../services/agencyService';
import { companyService } from '../../../services/companyService';
import { customerService } from '../../../services/customerService';
import { destinationService } from '../../../services/destinationService';
import { agencyAssociationService } from '../../../services/agencyAssociationService';
import { reservationService } from '../../../services/reservationService';
import { pricingRuleService } from '../../../services/pricingRuleService';
import { passengerService } from '../../../services/passengerService';
import {volService}  from '../../../services/volService'

const ReservationForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // États pour les données
  const [destinations, setDestinations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [vols, setVols] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [customers, setCustomers] = useState([]);
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
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [startDestinations, setStartDestinations] = useState([]);
  const [endDestinations, setEndDestinations] = useState([]);
  const [filteredReturnVols, setFilteredReturnVols] = useState([]);
  
   // Ajoutez ces états avec vos autres useState
const [showCompanySection, setShowCompanySection] = useState(false);
const [companySearch, setCompanySearch] = useState('');
const [filteredCompanies, setFilteredCompanies] = useState([]);
const [companyVols, setCompanyVols] = useState([]);
const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
const [selectedCompany, setSelectedCompany] = useState(null);

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


const fetchCompanyVols = async (companyId) => {
  try {
    setLoading(true);
    // Utilisez votre service volService
    const response = await volService.getVols();
    
    if (Array.isArray(response)) {
      // Filtrez les vols par companyId (selon votre structure de données)
      const vols = response.filter(vol => vol.companyId === companyId);
      setCompanyVols(vols);
      console.log(`Vols trouvés pour la compagnie ${companyId}:`, vols);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des vols:', error);
    setCompanyVols([]);
  } finally {
    setLoading(false);
  }
};

const handleCompanySelect = (company) => {
  setSelectedCompany(company);
  setCompanySearch(company.name);
  setShowCompanySuggestions(false);
  setShowCompanySection(true);
  
  // Charger les vols de cette compagnie
  fetchCompanyVols(company.id);
  
  // Optionnel : mettre à jour le formulaire
  setFormData(prev => ({
    ...prev,
    companyId: company.id
  }));
};   
  
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
  const [documents, setDocuments] = useState([]);

  // Chargement initial des données
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [destinations, companies, profile] = await Promise.all([
          fetchDestinations(),
          fetchCompanies(),
          fetchProfile()
        ]);
      } catch (error) {
        setError('Erreur lors du chargement des données initiales');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
    fetchClasses();
  }, []);

  // Gestion des prix
  useEffect(() => {
    handlePriceCalculation();
  }, [formData.agencyClassId, formData.returnVolId, formData.agencyVolId, formData.tripType, passengers]);

  // Fonctions de fetch
  const fetchDestinations = async (search = '') => {
    try {
      const response = await destinationService.getDestinations({ search });
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch destinations:', error);
      return [];
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await companyService.getCompanies();
      console.log('companies',response) 
     setCompanies(Array.isArray(response) ? response : []);
    } catch (err) {
      setError('Failed to fetch companies');
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

  const handleVolSearch = async (value) => {
    setVolSearch(value);
    
    if (value.trim() === '') {
        setFilteredVols([]);
        setShowVolSuggestions(false);
        return;
    }

    try {
        // CORRECTION: Passer les paramètres directement sans l'objet "params"
        const response = await agencyAssociationService.getAllFlightAgencies({ 
            search: value,
            page: 1,
            limit: 50 // Augmenter la limite pour plus de résultats
        });
        
        console.log('Réponse flightAgencies:', response);
        
        let volsData = [];
        
        // Gestion flexible de la structure de réponse
        if (response.data?.success && Array.isArray(response.data.data)) {
            // Structure: { success: true, data: [], pagination: {} }
            volsData = response.data.data;
            console.log(`✅ ${volsData.length} vols trouvés (structure standard)`);
        } else if (Array.isArray(response.data?.data)) {
            // Structure: { data: [], pagination: {} }
            volsData = response.data.data;
            console.log(`✅ ${volsData.length} vols trouvés (structure data)`);
        } else if (Array.isArray(response.data)) {
            // Structure: [] (tableau direct)
            volsData = response.data;
            console.log(`✅ ${volsData.length} vols trouvés (structure tableau)`);
        } else {
            console.warn('⚠️ Structure de réponse inattendue:', response.data);
            volsData = [];
        }
       if (selectedCompany && selectedCompany.id) {
      volsData = volsData.filter(vol => {
        // Adaptez cette condition selon la structure de vos données
        return vol.companyId === selectedCompany.id || 
               vol.companyVol?.id === selectedCompany.id;
      });
    }  
        setFilteredVols(volsData);
        setShowVolSuggestions(volsData.length > 0);
        
        // Debug supplémentaire
        if (volsData.length > 0) {
            console.log('📋 Premier vol:', volsData[0]);
        }
        
    } catch (error) {
        console.error('❌ Failed to search flights:', error);
        console.error('Détails erreur:', error.response?.data || error.message);
        setFilteredVols([]);
        setShowVolSuggestions(false);
    }
};

  const handleClassSearch = (value) => {
    setClassSearch(value);
    if (value.trim() === '') {
      setFilteredClasses([]);
      setShowClassSuggestions(false);
      return;
    }
    
    const filtered = classes.filter(cls => 
      cls.class.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredClasses(filtered);
    setShowClassSuggestions(filtered.length > 0);
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
            const filtered = vols.filter((vol) =>
                (vol.flight?.name?.toLowerCase() || '').includes(returnVolSearch.toLowerCase())
            );
            setFilteredReturnVols(filtered);
        } else {
            setFilteredReturnVols(vols);
        }
    }, [returnVolSearch, vols]);


  const handleReturnVolSearch = async (value) => {
    setReturnVolSearch(value);

    if (value.trim() === '') {
        setFilteredReturnVols([]);
        setShowReturnVolSuggestions(false);
        return;
    }

    try {
        // CORRECTION: Passer les paramètres directement sans l'objet "params"
        const response = await agencyAssociationService.getAllFlightAgencies({ 
            search: value,
            page: 1,
            limit: 50
        });

        console.log('🔁 Réponse vols retour:', response.data);

        let filtered = [];
        
        // Gestion flexible de la structure de réponse
        if (response.data?.success && Array.isArray(response.data.data)) {
            // Structure: { success: true, data: [], pagination: {} }
            filtered = response.data.data;
            console.log(`✅ ${filtered.length} vols retour trouvés (structure standard)`);
        } else if (Array.isArray(response.data?.data)) {
            // Structure: { data: [], pagination: {} }
            filtered = response.data.data;
            console.log(`✅ ${filtered.length} vols retour trouvés (structure data)`);
        } else if (Array.isArray(response.data)) {
            // Structure: [] (tableau direct)
            filtered = response.data;
            console.log(`✅ ${filtered.length} vols retour trouvés (structure tableau)`);
        } else {
            console.warn('⚠️ Structure de réponse inattendue pour vols retour:', response.data);
            filtered = [];
        }

        setFilteredReturnVols(filtered);
        setShowReturnVolSuggestions(filtered.length > 0);

        // Debug supplémentaire
        if (filtered.length > 0) {
            console.log('📋 Premier vol retour:', filtered[0]);
        }

    } catch (error) {
        console.error('❌ Erreur recherche vols retour:', error);
        console.error('Détails erreur:', error.response?.data || error.message);
        setFilteredReturnVols([]);
        setShowReturnVolSuggestions(false);
    }
};

  // Calcul du prix
  const handlePriceCalculation = async () => {
  try {
    const selectedVol = vols.find(v => v.id === formData.agencyVolId);
    const selectedClass = classes.find(cls => cls.id === formData.agencyClassId);

    if (!selectedVol || !selectedClass) {
      setTotalPrice(0);
      return;
    }

    let basePrice = selectedVol.price * selectedClass.priceMultiplier;

    // Ajout du prix du vol retour si nécessaire
    if (formData.tripType === "round-trip" && formData.returnVolId) {
      const returnVol = vols.find(v => v.id === formData.returnVolId);
      if (returnVol) {
        basePrice += returnVol.price * selectedClass.priceMultiplier;
      }
    }

    // Application des règles tarifaires
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

  // Gestion des passagers
  const handlePassengerChange = (index, key, value) => {
    setPassengers(prev =>
      prev.map((passenger, i) => 
        i === index ? { ...passenger, [key]: value } : passenger
      )
    );
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
    setPassengers(prev => prev.filter((_, i) => i !== index));
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

  // Soumission du formulaire
  const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Retire le préfixe "data:*/*;base64,"
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};
      const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Convertir les fichiers en base64
    const passengersWithBase64 = await Promise.all(
      passengers.map(async (passenger) => {
        const documents = await Promise.all(
          passenger.document.map(async (doc) => {
            if (doc.file) {
              const base64String = await convertFileToBase64(doc.file);
              return {
                ...doc,
                fileBase64: base64String,
                fileName: doc.file.name,
                fileType: doc.file.type
              };
            }
            return doc;
          })
        );
        return { ...passenger, document: documents };
      })
    );

    // Création de la réservation avec données Base64
    const reservationData = {
      ...formData,
      passengers: passengersWithBase64
    };

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
const CompanyVolsList = ({ vols, onSelectVol }) => (
  <div className="mt-4 space-y-3">
    <h4 className="font-medium text-gray-700">Vols disponibles pour cette compagnie:</h4>
    
    {vols.length === 0 ? (
      <p className="text-sm text-gray-500">Aucun vol trouvé pour cette compagnie</p>
    ) : (
      <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
        {vols.map((vol) => (
          <div
            key={vol.id}
            className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
            onClick={() => onSelectVol(vol)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{vol.name || `Vol ${vol.id}`}</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Départ:</span> {vol.startAt ? 
                      new Date(vol.startAt).toLocaleDateString('fr-FR') : 'N/A'
                    }
                  </p>
                  <p>
                    <span className="font-medium">Arrivée:</span> {vol.endAt ? 
                      new Date(vol.endAt).toLocaleDateString('fr-FR') : 'N/A'
                    }
                  </p>
                  {vol.destinationId && (
                    <p>
                      <span className="font-medium">Destination:</span> {vol.destinationId}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Sélectionner
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
  // Rendu du composant
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Demand  Reservation from  Agence </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section Agence et Vol */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recherche d'agence */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              <FontAwesomeIcon icon={faBuilding} className="mr-2" />
              Agency
            </label>
            <input
              type="text"
              value={agencySearch}
              onChange={(e) => handleAgencySearch(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Rechercher une agence..."
            />
            {showAgencySuggestions && (
              <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
                {filteredAgencies.map(agency => (
                  <li
                    key={agency.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
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
            <label className="block text-sm font-medium text-gray-700">
              <FontAwesomeIcon icon={faPlane} className="mr-2" />
              Type of trip
            </label>
            <select
              name="tripType"
              value={formData.tripType}
              onChange={(e) => setFormData({ ...formData, tripType: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="one-way">One Trip</option>
              <option value="round-trip">Round trip</option>
            </select>
          </div>
        </div>
        
        {/* Section Vols */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vol aller */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              <FontAwesomeIcon icon={faPlaneDeparture} className="mr-2" />
              One way Flight
            </label>
            <input
              type="text"
              value={volSearch}
              onChange={(e) => handleVolSearch(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Rechercher un vol..."
            />
            {showVolSuggestions && (
              <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
                {filteredVols.map(vol => (
                  <li
                    key={vol.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
  setFormData(prev => ({ 
    ...prev, 
    agencyVolId: vol.id,
    // Reset le vol retour si on change le vol aller
    returnVolId: formData.tripType === 'one-way' ? null : formData.returnVolId
  }));
  setVolSearch(vol.flight?.name || 'Vol inconnu');
  setShowVolSuggestions(false);
}}
                  >
                    {vol.flight?.name || 'Vol inconnu'} - {vol.price} XOX
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Vol retour (si aller-retour) */}
          {formData.tripType === "round-trip" && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                <FontAwesomeIcon icon={faPlaneDeparture} className="mr-2" />
                Return  Flight
              </label>
              <input
                type="text"
                value={returnVolSearch}
                onChange={(e) => handleReturnVolSearch(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="Rechercher un vol retour..."
              />
              {showReturnVolSuggestions && (
                <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
                  {filteredReturnVols.map(vol => (
                    <li
                      key={vol.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setFormData({ ...formData, returnVolId: vol.id });
                        setReturnVolSearch(vol.flight?.name || 'Vol inconnu');
                        setShowReturnVolSuggestions(false);
                      }}
                    >
                      {vol.flight?.name || 'Vol inconnu'} - {vol.price} XOX
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
       {/* ============================================= */}
{/* SECTION OPTIONNELLE : SÉLECTION COMPAGNIE & VOLS */}
{/* ============================================= */}

<div className="border-t border-gray-200 pt-6">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center">
      <input
        type="checkbox"
        id="showCompanySection"
        checked={showCompanySection}
        onChange={(e) => {
          setShowCompanySection(e.target.checked);
          if (!e.target.checked) {
            // Réinitialiser si désactivé
            setSelectedCompany(null);
            setCompanySearch('');
            setCompanyVols([]);
            setFormData(prev => ({ ...prev, companyId: '' }));
          }
        }}
        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
      />
      <label htmlFor="showCompanySection" className="ml-2 text-sm font-medium text-gray-700">
        Rechercher par compagnie aérienne (optionnel)
      </label>
    </div>
    
    {showCompanySection && selectedCompany && (
      <button
        type="button"
        onClick={() => {
          setSelectedCompany(null);
          setCompanySearch('');
          setCompanyVols([]);
          setFormData(prev => ({ ...prev, companyId: '' }));
        }}
        className="text-sm text-red-600 hover:text-red-800"
      >
        Réinitialiser
      </button>
    )}
  </div>

  {showCompanySection && (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      {/* Recherche de compagnie */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Compagnie aérienne
        </label>
        <div className="relative">
          <FontAwesomeIcon
            icon={faBuilding}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={companySearch}
            onChange={(e) => handleCompanySearch(e.target.value)}
            className="pl-10 pr-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="Rechercher une compagnie..."
            disabled={!!selectedCompany}
          />
        </div>

        {showCompanySuggestions && !selectedCompany && (
          <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
            {filteredCompanies.map(company => (
              <li
                key={company.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleCompanySelect(company)}
              >
                <div className="font-medium">{company.name}</div>
                {company.description && (
                  <div className="text-sm text-gray-500 truncate">{company.description}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Affichage des vols de la compagnie sélectionnée */}
      {selectedCompany && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">
                {selectedCompany.name} - Vols disponibles
              </h4>
              {selectedCompany.description && (
                <p className="text-sm text-gray-600">{selectedCompany.description}</p>
              )}
            </div>
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              {companyVols.length} vol{companyVols.length !== 1 ? 's' : ''}
            </span>
          </div>

          <CompanyVolsList
            vols={companyVols}
            onSelectVol={(vol) => {
              // Quand un vol est sélectionné, remplir automatiquement les champs
              setFormData(prev => ({
                ...prev,
                agencyVolId: vol.id,
                startDestinationId: vol.originId,
                endDestinationId: vol.destinationId,
                startAt: vol.startAt,
                endAt: vol.endAt
              }));
              
              // Mettre à jour la recherche de vol
              setVolSearch(vol.name || `Vol ${vol.id}`);
              
              // Afficher un message de succès
              alert(`Vol "${vol.name || `Vol ${vol.id}`}" sélectionné avec succès!`);
            }}
          />
        </div>
      )}
    </div>
  )}
</div>      
        {/* Section Destinations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Destination de départ */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
              Departure
            </label>
            <input
              type="text"
              value={startDestinationSearch}
              onChange={(e) => handleStartDestinationSearch(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Rechercher une ville de départ..."
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
          
          {/* Destination d'arrivée */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              <FontAwesomeIcon icon={faMapPin} className="mr-2" />
              Arrival
            </label>
            <input
              type="text"
              value={endDestinationSearch}
              onChange={(e) => handleEndDestinationSearch(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Rechercher une ville d'arrivée..."
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
          {/* Date de départ */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
              Date  departure
            </label>
            <input
              type="date"
              name="startAt"
              value={formData.startAt}
              onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          
          {/* Date de retour (si aller-retour) */}
          {formData.tripType === "round-trip" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                Return date
              </label>
              <input
                type="date"
                name="endAt"
                value={formData.endAt}
                onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          )}
          
          {/* Classe */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              Class
            </label>
            <input
              type="text"
              value={classSearch}
              onChange={(e) => handleClassSearch(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Rechercher une classe..."
            />
            {showClassSuggestions && (
              <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
                {filteredClasses.map(cls => (
                  <li
                    key={cls.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setFormData({ ...formData, agencyClassId: cls.id });
                      setClassSearch(cls.class.name);
                      setShowClassSuggestions(false);
                    }}
                  >
                    {cls.class.name} (x{cls.priceMultiplier})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Section Passagers */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              Passengers
            </h2>
            <button
              type="button"
              onClick={addPassenger}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-1" />
              Add  a passenger
            </button>
          </div>
          
          {passengers.map((passenger, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Passager #{index + 1}</h3>
                {passengers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePassenger(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Informations de base */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <FontAwesomeIcon icon={faUser} className="mr-1" />
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={passenger.firstName}
                      onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <FontAwesomeIcon icon={faSignature} className="mr-1" />
                      Name
                    </label>
                    <input
                      type="text"
                      value={passenger.lastName}
                      onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <FontAwesomeIcon icon={faVenusMars} className="mr-1" />
                      Genre
                    </label>
                    <select
                      value={passenger.gender}
                      onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      <option value="">Sélectionner</option>
                      <option value="masculin">Male</option>
                      <option value="feminin">Female</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Type  passenger
                    </label>
                    <select
                      value={passenger.typePassenger}
                      onChange={(e) => handlePassengerChange(index, 'typePassenger', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      <option value="ADLT">Adult(Adulte)</option>
                      <option value="CHD">Child(Enfant)</option>
                      <option value="INF">Infant(Nourrisson)</option>
                    </select>
                  </div>
                </div>
                
                {/* Informations supplémentaires */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      birth Date
                    </label>
                    <input
                      type="date"
                      value={passenger.birthDate}
                      onChange={(e) => handlePassengerChange(index, 'birthDate', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Place of birth
                    </label>
                    <input
                      type="text"
                      value={passenger.birthPlace}
                      onChange={(e) => handlePassengerChange(index, 'birthPlace', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={passenger.nationality}
                      onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Documents du passager */}
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Documents</h4>
                  <button
                    type="button"
                    onClick={() => addDocument(index)}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-1" />
                    Add document
                  </button>
                </div>
                
                {passenger.document.map((doc, docIndex) => (
                  <div key={docIndex} className="border rounded p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <h5 className="text-xs font-medium">Document #{docIndex + 1}</h5>
                      {passenger.document.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDocument(index, docIndex)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Type of document</label>
                        <input
                          type="text"
                          value={doc.documentType}
                          onChange={(e) => handleDocumentChange(index, docIndex, 'documentType', e.target.value)}
                          className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Number</label>
                        <input
                          type="text"
                          value={doc.documentNumber}
                          onChange={(e) => handleDocumentChange(index, docIndex, 'documentNumber', e.target.value)}
                          className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700">issue date</label>
                        <input
                          type="date"
                          value={doc.issueDate}
                          onChange={(e) => handleDocumentChange(index, docIndex, 'issueDate', e.target.value)}
                          className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Expiration Date</label>
                        <input
                          type="date"
                          value={doc.expirationDate}
                          onChange={(e) => handleDocumentChange(index, docIndex, 'expirationDate', e.target.value)}
                          className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Prix total */}
        
        
        {/* Boutons de soumission */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'saving...' : 'Enregistrer la réservation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;
