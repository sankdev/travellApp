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
  faSync,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faCog,
  faTimes,
  faPlus,
  faTrash,
  faArrowLeft,
  faGlobe,
  faIdCard,
  faHome,
  faBriefcase,
  faBaby,
  faUserTie,
  faPlaneArrival,
  faExchangeAlt,
  faClock,
  faFilter,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';

// Composant pour la sélection manuelle de vol
const ManualFlightSelection = ({
  agencyId,
  destinations,
  companies,
  onFlightSelect,
  onClassSelect,
  onTripTypeChange,
  onDatesChange,
  selectedFlight,
  selectedClass,
  tripType,
  startAt,
  endAt
}) => {
  const [vols, setVols] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [volSearch, setVolSearch] = useState('');
  const [showVolSuggestions, setShowVolSuggestions] = useState(false);
  const [classSearch, setClassSearch] = useState('');
  const [showClassSuggestions, setShowClassSuggestions] = useState(false);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [startDestinationSearch, setStartDestinationSearch] = useState('');
  const [endDestinationSearch, setEndDestinationSearch] = useState('');
  const [startDestinations, setStartDestinations] = useState([]);
  const [endDestinations, setEndDestinations] = useState([]);
  const [showStartDestinationSuggestions, setShowStartDestinationSuggestions] = useState(false);
  const [showEndDestinationSuggestions, setShowEndDestinationSuggestions] = useState(false);
  const [returnVolSearch, setReturnVolSearch] = useState('');
  const [returnVols, setReturnVols] = useState([]);
  const [showReturnVolSuggestions, setShowReturnVolSuggestions] = useState(false);
  const [selectedReturnVol, setSelectedReturnVol] = useState(null);

  // Recherche de vols
  useEffect(() => {
    const fetchVols = async () => {
      if (!agencyId) return;
      
      setLoading(true);
      try {
        const response = await agencyAssociationService.getAllFlightAgencies({
          search: volSearch,
          agencyId: agencyId,
          page: 1,
          limit: 50
        });

        let volsData = [];
        if (response.data?.success && Array.isArray(response.data.data)) {
          volsData = response.data.data;
        } else if (Array.isArray(response.data?.data)) {
          volsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          volsData = response.data;
        }

        // Enrichir les données des vols
        volsData = volsData.map(vol => ({
          ...vol,
          flightName: vol.flight?.name || 'Vol sans nom',
          companyName: getCompanyName(vol.flight?.companyId),
          origin: getDestinationName(vol.flight?.originId),
          originId: vol.flight?.originId,
          destination: getDestinationName(vol.flight?.destinationId),
          destinationId: vol.flight?.destinationId,
          departureTime: vol.departureTime,
          arrivalTime: vol.arrivalTime,
          price: vol.price || 0
        }));

        setVols(volsData);
        setReturnVols(volsData); // Pour les vols retour
        setShowVolSuggestions(volsData.length > 0 && volSearch.trim().length > 0);
      } catch (error) {
        console.error('❌ Erreur chargement vols:', error);
        setVols([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (agencyId) {
        fetchVols();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [volSearch, agencyId]);

  // Charger les classes pour un vol sélectionné
  const loadClassesForFlight = async (agencyVolId) => {
    if (!agencyVolId) return;
    
    try {
      const response = await agencyAssociationService.getAllClassAgencies();
      
      if (response && Array.isArray(response)) {
        const classesForFlight = response.filter(cls => 
          cls.agencyVolId === parseInt(agencyVolId) || 
          cls.agencyVolId === agencyVolId
        );
        
        setClasses(classesForFlight);
        setFilteredClasses(classesForFlight);
      }
    } catch (error) {
      console.error('❌ Erreur chargement classes:', error);
    }
  };

  // Fonctions utilitaires
  const getCompanyName = (id) => {
    if (!companies || !companies.length) return 'Inconnue';
    const company = companies.find(c => c.id === parseInt(id));
    return company ? company.name : 'Inconnue';
  };

  const getDestinationName = (id) => {
    if (!destinations || !destinations.length) return 'Inconnue';
    const destination = destinations.find(d => d.id === parseInt(id));
    return destination ? destination.name : 'Inconnue';
  };

  const formatFlightDisplay = (vol) => {
    return `${vol.flightName} - ${vol.companyName} - ${vol.origin || '?'} → ${vol.destination || '?'}`;
  };

  // Gestionnaires d'événements
  const handleFlightSelect = (vol) => {
    onFlightSelect(vol);
    setVolSearch(formatFlightDisplay(vol));
    setShowVolSuggestions(false);
    
    // Charger les classes pour ce vol
    loadClassesForFlight(vol.id);
    
    // Mettre à jour les destinations
    if (vol.originId) {
      setStartDestinationSearch(getDestinationName(vol.originId));
    }
    if (vol.destinationId) {
      setEndDestinationSearch(getDestinationName(vol.destinationId));
    }
  };

  const handleReturnFlightSelect = (vol) => {
    setSelectedReturnVol(vol);
    setReturnVolSearch(formatFlightDisplay(vol));
    setShowReturnVolSuggestions(false);
    
    // Mettre à jour le formulaire parent
    onFlightSelect(vol, true); // true indique que c'est un vol retour
  };

  const handleClassSelect = (cls) => {
    onClassSelect(cls);
    setClassSearch(cls.class?.name || '');
    setShowClassSuggestions(false);
  };

  // Recherche de classes
  useEffect(() => {
    if (classSearch.length > 0) {
      const filtered = classes.filter(cls =>
        cls.class?.name?.toLowerCase().includes(classSearch.toLowerCase())
      );
      setFilteredClasses(filtered);
      setShowClassSuggestions(filtered.length > 0);
    } else {
      setFilteredClasses(classes);
      setShowClassSuggestions(false);
    }
  }, [classSearch, classes]);

  // Recherche de destinations (pour suggestion)
  const handleStartDestinationSearch = (search) => {
    setStartDestinationSearch(search);
    if (search.trim().length > 0 && destinations.length > 0) {
      const filtered = destinations.filter(dest =>
        dest.name?.toLowerCase().includes(search.toLowerCase())
      );
      setStartDestinations(filtered);
      setShowStartDestinationSuggestions(true);
    } else {
      setStartDestinations([]);
      setShowStartDestinationSuggestions(false);
    }
  };

  const handleEndDestinationSearch = (search) => {
    setEndDestinationSearch(search);
    if (search.trim().length > 0 && destinations.length > 0) {
      const filtered = destinations.filter(dest =>
        dest.name?.toLowerCase().includes(search.toLowerCase())
      );
      setEndDestinations(filtered);
      setShowEndDestinationSuggestions(true);
    } else {
      setEndDestinations([]);
      setShowEndDestinationSuggestions(false);
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
      {/* En-tête */}
      <div className="flex items-center gap-2 text-blue-800">
        <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={faPlane} className="text-blue-600" />
        </div>
        <h3 className="font-semibold">Sélection manuelle du vol</h3>
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-auto">
          Optionnel
        </span>
      </div>

      {/* Type de voyage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de voyage
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onTripTypeChange('one-way')}
            className={`p-3 border-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              tripType === 'one-way'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <FontAwesomeIcon icon={faPlaneDeparture} />
            <span>Aller simple</span>
          </button>
          <button
            type="button"
            onClick={() => onTripTypeChange('round-trip')}
            className={`p-3 border-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              tripType === 'round-trip'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <FontAwesomeIcon icon={faExchangeAlt} />
            <span>Aller-retour</span>
          </button>
        </div>
      </div>

      {/* Vol aller */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vol aller {tripType === 'one-way' ? '' : '*'}
        </label>
        <div className="relative">
          <input
            type="text"
            value={volSearch}
            onChange={(e) => setVolSearch(e.target.value)}
            placeholder="Rechercher un vol..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pl-10"
          />
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <FontAwesomeIcon icon={faSync} spin className="text-blue-500" />
            </div>
          )}
        </div>

        {showVolSuggestions && vols.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {vols.map(vol => (
              <li
                key={vol.id}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                onClick={() => handleFlightSelect(vol)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{vol.flightName}</p>
                    <p className="text-sm text-gray-600">
                      {vol.companyName} • {vol.origin} → {vol.destination}
                    </p>
                    {vol.departureTime && (
                      <p className="text-xs text-gray-500 mt-1">
                        <FontAwesomeIcon icon={faClock} className="mr-1" />
                        {new Date(vol.departureTime).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <p className="font-bold text-green-600">{vol.price} FCFA</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Vol retour (si aller-retour) */}
      {tripType === 'round-trip' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vol retour *
          </label>
          <div className="relative">
            <input
              type="text"
              value={returnVolSearch}
              onChange={(e) => setReturnVolSearch(e.target.value)}
              placeholder="Rechercher un vol retour..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 pl-10"
            />
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {showReturnVolSuggestions && returnVols.length > 0 && (
            <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {returnVols
                .filter(v => v.id !== selectedFlight?.id) // Éviter le même vol
                .map(vol => (
                  <li
                    key={vol.id}
                    className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleReturnFlightSelect(vol)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{vol.flightName}</p>
                        <p className="text-sm text-gray-600">
                          {vol.companyName} • {vol.origin} → {vol.destination}
                        </p>
                      </div>
                      <p className="font-bold text-green-600">{vol.price} FCFA</p>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      {/* Classes disponibles */}
      {classes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Classe *
          </label>
          <div className="relative">
            <input
              type="text"
              value={classSearch}
              onChange={(e) => setClassSearch(e.target.value)}
              placeholder="Sélectionner une classe..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {showClassSuggestions && filteredClasses.length > 0 && (
            <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredClasses.map(cls => (
                <li
                  key={cls.id}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => handleClassSelect(cls)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{cls.class?.name}</span>
                    <span className="text-sm text-gray-600">
                      Multiplicateur: x{cls.priceMultiplier}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Destinations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lieu de départ
          </label>
          <input
            type="text"
            value={startDestinationSearch}
            onChange={(e) => handleStartDestinationSearch(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Départ"
          />
          {showStartDestinationSuggestions && startDestinations.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {startDestinations.map(dest => (
                <li
                  key={dest.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setStartDestinationSearch(dest.name);
                    setShowStartDestinationSuggestions(false);
                  }}
                >
                  {dest.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination finale
          </label>
          <input
            type="text"
            value={endDestinationSearch}
            onChange={(e) => handleEndDestinationSearch(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Arrivée"
          />
          {showEndDestinationSuggestions && endDestinations.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {endDestinations.map(dest => (
                <li
                  key={dest.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setEndDestinationSearch(dest.name);
                    setShowEndDestinationSuggestions(false);
                  }}
                >
                  {dest.name}
                </li>
              ))}
            </ul>
          )}
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
            value={startAt}
            onChange={(e) => onDatesChange('startAt', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de retour {tripType === 'round-trip' ? '*' : '(optionnel)'}
          </label>
          <input
            type="date"
            value={endAt}
            onChange={(e) => onDatesChange('endAt', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min={startAt || new Date().toISOString().split('T')[0]}
            disabled={tripType === 'one-way'}
          />
        </div>
      </div>
    </div>
  );
};

const CreateReservationCampaign = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [destinations, setDestinations] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [profile, setProfile] = useState({});
    const [agencySearch, setAgencySearch] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [showAgencySuggestions, setShowAgencySuggestions] = useState(false);
    
    // États pour la gestion intelligente des vols
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [campaignHasFlight, setCampaignHasFlight] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    
    // États pour la sélection manuelle de vol
    const [showManualFlightSelection, setShowManualFlightSelection] = useState(false);
    const [manuallySelectedFlight, setManuallySelectedFlight] = useState(null);
    const [manuallySelectedReturnFlight, setManuallySelectedReturnFlight] = useState(null);
    const [manuallySelectedClass, setManuallySelectedClass] = useState(null);
    const [manualTripType, setManualTripType] = useState('one-way');
    const [manualStartAt, setManualStartAt] = useState('');
    const [manualEndAt, setManualEndAt] = useState('');
    const [manualStartDestinationId, setManualStartDestinationId] = useState('');
    const [manualEndDestinationId, setManualEndDestinationId] = useState('');
    
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
        phone: '',
        email: '',
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

    // Chargement initial des données
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchDestinations(),
                    fetchCompanies(),
                    fetchProfile(),
                    fetchCampaigns(),
                    fetchAgenciesList(),
                ]);
            } catch (error) {
                console.error('Error in fetchData:', error);
                setError('Failed to load one or more data sets.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Mise à jour du prix total
    useEffect(() => {
        let price = 0;
        
        if (selectedCampaign) {
            price += selectedCampaign.price || 0;
        }
        
        if (manuallySelectedFlight) {
            price += manuallySelectedFlight.price || 0;
        }
        
        if (manuallySelectedReturnFlight && manualTripType === 'round-trip') {
            price += manuallySelectedReturnFlight.price || 0;
        }
        
        if (manuallySelectedClass && manuallySelectedFlight) {
            price = price * (manuallySelectedClass.priceMultiplier || 1);
        }
        
        setTotalPrice(price * passengers.length);
        setFormData(prev => ({ ...prev, totalPrice: price * passengers.length }));
    }, [selectedCampaign, manuallySelectedFlight, manuallySelectedReturnFlight, manuallySelectedClass, manualTripType, passengers.length]);

    // Charger la liste complète des agences
    const fetchAgenciesList = async () => {
        try {
            const response = await agencyService.getAgencies({});
            setAgencies(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch agencies list:', error.message);
        }
    };

    // Charger les campagnes
    const fetchCampaigns = async () => {
        try {
            const result = await compaignService.getActiveCampaigns();
            const normalizedCampaigns = result.map(campaign => ({
                ...campaign,
                id: Number(campaign.id),
                price: Number(campaign.price),
                agencyId: campaign.agencyId || campaign.associatedAgency?.id,
                volId: campaign.volId || campaign.vol?.id,
                agencyDetails: campaign.associatedAgency || null,
                volDetails: campaign.vol || null,
                hasFlight: !!(campaign.volId || campaign.vol?.id)
            }));
            setCampaigns(normalizedCampaigns);
        } catch (error) {
            console.error('Failed to fetch campaigns:', error);
        }
    };

    // Gestion du changement de campagne
    const handleCampaignChange = async (campaignId) => {
        if (!campaignId) {
            setSelectedCampaign(null);
            setCampaignHasFlight(false);
            setFormData({
                ...formData,
                campaignId: '',
                agencyId: '',
                totalPrice: 0
            });
            setAgencySearch('');
            return;
        }
        
        const campaign = campaigns.find(c => c.id == campaignId);
        if (!campaign) return;
        
        setSelectedCampaign(campaign);
        setIsSyncing(true);
        
        try {
            const hasFlight = campaign.hasFlight;
            setCampaignHasFlight(hasFlight);
            
            // Mettre à jour le formulaire
            setFormData(prev => ({
                ...prev,
                campaignId: campaign.id,
                agencyId: campaign.agencyId || '',
                totalPrice: campaign.price
            }));
            
            // Mettre à jour la recherche d'agence
            if (campaign.agencyDetails) {
                setAgencySearch(campaign.agencyDetails.name);
            }
            
            // Mettre à jour les dates si disponibles
            if (campaign.startAt) {
                setFormData(prev => ({ ...prev, startAt: campaign.startAt.split('T')[0] }));
            }
            if (campaign.endAt) {
                setFormData(prev => ({ ...prev, endAt: campaign.endAt.split('T')[0] }));
            }
            
            // Si la campagne a un vol, désactiver la sélection manuelle
            if (hasFlight) {
                setShowManualFlightSelection(false);
            } else {
                // Si la campagne n'a pas de vol, proposer la sélection manuelle
                setShowManualFlightSelection(true);
            }
            
        } catch (error) {
            console.error('❌ Erreur lors de la synchronisation:', error);
            setError('Erreur lors de la synchronisation des données de la campagne');
        } finally {
            setIsSyncing(false);
        }
    };

    // Gestionnaires pour la sélection manuelle
    const handleManualFlightSelect = (flight, isReturn = false) => {
        if (isReturn) {
            setManuallySelectedReturnFlight(flight);
            setFormData(prev => ({ ...prev, returnVolId: flight.id }));
        } else {
            setManuallySelectedFlight(flight);
            setFormData(prev => ({ 
                ...prev, 
                agencyVolId: flight.id,
                companyId: flight.flight?.companyId,
                startDestinationId: flight.originId,
                endDestinationId: flight.destinationId
            }));
            
            // Mettre à jour les destinations
            if (flight.originId) {
                const origin = destinations.find(d => d.id === flight.originId);
                if (origin) setManualStartDestinationId(origin.id);
            }
            if (flight.destinationId) {
                const dest = destinations.find(d => d.id === flight.destinationId);
                if (dest) setManualEndDestinationId(dest.id);
            }
        }
    };

    const handleManualClassSelect = (cls) => {
        setManuallySelectedClass(cls);
        setFormData(prev => ({ ...prev, agencyClassId: cls.id }));
    };

    const handleManualTripTypeChange = (type) => {
        setManualTripType(type);
        setFormData(prev => ({ ...prev, tripType: type }));
        if (type === 'one-way') {
            setManuallySelectedReturnFlight(null);
            setFormData(prev => ({ ...prev, returnVolId: '' }));
        }
    };

    const handleManualDateChange = (field, value) => {
        if (field === 'startAt') {
            setManualStartAt(value);
            setFormData(prev => ({ ...prev, startAt: value }));
        } else {
            setManualEndAt(value);
            setFormData(prev => ({ ...prev, endAt: value }));
        }
    };

    // Autres fonctions de chargement
    const fetchDestinations = async (search = '') => {
        try {
            const response = await destinationService.getDestinations({ search });
            setDestinations(Array.isArray(response) ? response : []);
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('Failed to fetch destinations:', error.message);
            return [];
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await companyService.getCompanies();
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

    // Recherche d'agence
    useEffect(() => {
        const fetchAgencies = async () => {
            try {
                const response = await agencyService.getAgencies({ search: agencySearch });
                setAgencies(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Failed to fetch agencies:', error.message);
            }
        };

        if (agencySearch.length > 0 && !selectedCampaign) {
            fetchAgencies();
            setShowAgencySuggestions(true);
        } else {
            setShowAgencySuggestions(false);
        }
    }, [agencySearch, selectedCampaign]);

    const handleAgencySelection = (agency) => {
        setAgencySearch(agency.name);
        setFormData(prev => ({ 
            ...prev, 
            agencyId: agency.id,
            campaignId: '' // Réinitialiser la campagne
        }));
        setShowAgencySuggestions(false);
        setSelectedCampaign(null);
        setCampaignHasFlight(false);
        setShowManualFlightSelection(true); // Proposer la sélection manuelle
    };

    // Gestion des passagers
    const handlePassengerChange = (index, key, value) => {
        setPassengers((prev) =>
            prev.map((passenger, i) => {
                if (i === index) {
                    return {
                        ...passenger,
                        [key]: value,
                        document: passenger.document || [],
                    };
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
                phone: '',
                email: '',
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
    };

    const addDocument = (passengerIndex) => {
        setPassengers((prev) =>
            prev.map((passenger, i) => {
                if (i === passengerIndex) {
                    return {
                        ...passenger,
                        document: [
                            ...(passenger.document || []),
                            { documentType: '', documentNumber: '', expirationDate: '', issueDate: '', files: [] },
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

    const removePassenger = (index) => {
        if (passengers.length === 1) {
            setError('Au moins un passager est requis');
            return;
        }
        const newPassengers = passengers.filter((_, i) => i !== index);
        setPassengers(newPassengers);
    };

    // Validation avant soumission
    const validateForm = () => {
        if (!formData.agencyId) {
            setError('Veuillez sélectionner une agence');
            return false;
        }
        
        // Validation pour les campagnes sans vol
        if (!campaignHasFlight && showManualFlightSelection) {
            if (!manuallySelectedFlight) {
                setError('Veuillez sélectionner un vol aller');
                return false;
            }
            if (!manuallySelectedClass) {
                setError('Veuillez sélectionner une classe');
                return false;
            }
            if (!manualStartAt) {
                setError('Veuillez sélectionner une date de départ');
                return false;
            }
            if (manualTripType === 'round-trip' && !manuallySelectedReturnFlight) {
                setError('Veuillez sélectionner un vol retour');
                return false;
            }
            if (manualTripType === 'round-trip' && !manualEndAt) {
                setError('Veuillez sélectionner une date de retour');
                return false;
            }
        }
        
        // Validation des passagers
        const invalidPassengers = passengers.some(p => !p.firstName || !p.lastName);
        if (invalidPassengers) {
            setError('Veuillez remplir les noms et prénoms de tous les passagers');
            return false;
        }
        
        return true;
    };

    // Soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setLoading(true);
        setError('');

        try {
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

            // Construire le payload final
            const payload = {
                ...formData,
                // Utiliser les valeurs manuelles si nécessaire
                agencyVolId: campaignHasFlight ? formData.agencyVolId : (manuallySelectedFlight?.id || ''),
                returnVolId: campaignHasFlight ? formData.returnVolId : (manuallySelectedReturnFlight?.id || ''),
                agencyClassId: campaignHasFlight ? formData.agencyClassId : (manuallySelectedClass?.id || ''),
                startAt: campaignHasFlight ? formData.startAt : manualStartAt,
                endAt: campaignHasFlight ? formData.endAt : manualEndAt,
                startDestinationId: campaignHasFlight ? formData.startDestinationId : manualStartDestinationId,
                endDestinationId: campaignHasFlight ? formData.endDestinationId : manualEndDestinationId,
                tripType: campaignHasFlight ? formData.tripType : manualTripType,
                passengers: encodedPassengers,
                finalPrice: totalPrice,
                flightSource: campaignHasFlight ? 'campaign' : 'manual'
            };

            console.log('📤 Envoi de la réservation:', payload);
            const response = await reservationService.createReservationCampaign(payload);
            console.log('✅ Réservation créée avec succès', response.data);
            
            navigate('/customer/dashboard', {
                state: {
                    message: 'Réservation de campagne créée avec succès !',
                    type: 'success'
                }
            });
            
        } catch (err) {
            setLoading(false);
            console.error('❌ Erreur de soumission', err);
            if (err.response) {
                setError(err.response.data.error || 'Une erreur est survenue.');
            } else if (err.request) {
                setError('Le serveur ne répond pas. Vérifiez votre connexion.');
            } else {
                setError('Une erreur inattendue est survenue.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* En-tête avec navigation */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Retour
                    </button>
                    
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Réservation de Campagne
                        </h1>
                        {selectedCampaign && (
                            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                campaignHasFlight 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {campaignHasFlight ? 'Vol inclus' : 'Vol à sélectionner'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mt-0.5" />
                        <p className="text-red-700 flex-1">{error}</p>
                        <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                )}

                {isSyncing && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                        <FontAwesomeIcon icon={faSync} spin className="text-blue-500" />
                        <p className="text-blue-700">Synchronisation des données de la campagne...</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formulaire principal */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {/* Sélection de campagne */}
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faPlane} className="text-blue-500" />
                                    1. Sélection de la campagne
                                </h2>
                                
                                <div className="space-y-4">
                                    <select
                                        value={formData.campaignId}
                                        onChange={(e) => handleCampaignChange(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        disabled={isSyncing}
                                    >
                                        <option value="">Choisir une campagne...</option>
                                        {campaigns.map(campaign => (
                                            <option key={campaign.id} value={campaign.id}>
                                                {campaign.title} - {campaign.price.toLocaleString()} FCFA
                                                {campaign.hasFlight ? ' ✈️' : ' (sans vol)'}
                                            </option>
                                        ))}
                                    </select>

                                    {selectedCampaign && (
                                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <FontAwesomeIcon icon={faPlane} className="text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900">{selectedCampaign.title}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">{selectedCampaign.description}</p>
                                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                                        <div>
                                                            <p className="text-xs text-gray-500">Agence</p>
                                                            <p className="font-medium">{selectedCampaign.agencyDetails?.name}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Prix</p>
                                                            <p className="font-bold text-green-600">{selectedCampaign.price.toLocaleString()} FCFA</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Informations du voyage */}
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faCog} className="text-gray-500" />
                                    2. Informations du voyage
                                </h2>
                                
                                <div className="space-y-4">
                                    {/* Agence (toujours requise) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Agence *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={agencySearch}
                                                onChange={(e) => setAgencySearch(e.target.value)}
                                                placeholder="Rechercher une agence..."
                                                className={`w-full px-4 py-2 border rounded-lg ${
                                                    selectedCampaign?.agencyDetails 
                                                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
                                                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                                                }`}
                                                readOnly={!!selectedCampaign?.agencyDetails}
                                            />
                                            {!selectedCampaign && showAgencySuggestions && agencies.length > 0 && (
                                                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                    {agencies.map((agency) => (
                                                        <li
                                                            key={agency.id}
                                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                                                            onClick={() => handleAgencySelection(agency)}
                                                        >
                                                            <FontAwesomeIcon icon={faBuilding} className="text-gray-400" />
                                                            {agency.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sélection manuelle de vol (si campagne sans vol) */}
                                    {showManualFlightSelection && (
                                        <ManualFlightSelection
                                            agencyId={formData.agencyId}
                                            destinations={destinations}
                                            companies={companies}
                                            onFlightSelect={handleManualFlightSelect}
                                            onClassSelect={handleManualClassSelect}
                                            onTripTypeChange={handleManualTripTypeChange}
                                            onDatesChange={handleManualDateChange}
                                            selectedFlight={manuallySelectedFlight}
                                            selectedClass={manuallySelectedClass}
                                            tripType={manualTripType}
                                            startAt={manualStartAt}
                                            endAt={manualEndAt}
                                        />
                                    )}

                                    {/* Informations de la campagne avec vol */}
                                    {campaignHasFlight && (
                                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                            <p className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                                                <FontAwesomeIcon icon={faCheckCircle} />
                                                Vol inclus dans la campagne
                                            </p>
                                            <div className="text-sm text-gray-600">
                                                {selectedCampaign?.volDetails?.name && (
                                                    <p>Vol: {selectedCampaign.volDetails.name}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Passagers */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faUsers} className="text-indigo-500" />
                                        3. Passagers ({passengers.length})
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={addPassenger}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                        Ajouter un passager
                                    </button>
                                </div>

                                {passengers.map((passenger, index) => (
                                    <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="font-medium text-gray-800 flex items-center gap-2">
                                                <FontAwesomeIcon icon={faUser} className="text-indigo-500" />
                                                Passager {index + 1}
                                                {passenger.typePassenger === "ADLT" && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Adulte</span>}
                                                {passenger.typePassenger === "CHD" && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Enfant</span>}
                                                {passenger.typePassenger === "INF" && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Bébé</span>}
                                            </h3>
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removePassenger(index)}
                                                    className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                    Supprimer
                                                </button>
                                            )}
                                        </div>

                                        {/* Ligne 1: Informations personnelles de base */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faSignature} className="text-blue-500 text-xs" />
                                                    Prénom *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={passenger.firstName}
                                                    onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="Jean"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faSignature} className="text-blue-500 text-xs" />
                                                    Nom *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={passenger.lastName}
                                                    onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="Dupont"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faVenusMars} className="text-purple-500 text-xs" />
                                                    Genre
                                                </label>
                                                <select
                                                    value={passenger.gender}
                                                    onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                >
                                                    <option value="">Sélectionner</option>
                                                    <option value="masculin">Masculin</option>
                                                    <option value="feminin">Féminin</option>
                                                    <option value="autres">Autres</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Ligne 2: Naissance et nationalité */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-green-500 text-xs" />
                                                    Date de naissance
                                                </label>
                                                <input
                                                    type="date"
                                                    value={passenger.birthDate}
                                                    onChange={(e) => handlePassengerChange(index, 'birthDate', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faMapPin} className="text-red-500 text-xs" />
                                                    Lieu de naissance
                                                </label>
                                                <input
                                                    type="text"
                                                    value={passenger.birthPlace}
                                                    onChange={(e) => handlePassengerChange(index, 'birthPlace', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="Paris"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faGlobe} className="text-blue-500 text-xs" />
                                                    Nationalité
                                                </label>
                                                <input
                                                    type="text"
                                                    value={passenger.nationality}
                                                    onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="Française"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faBriefcase} className="text-yellow-600 text-xs" />
                                                    Profession
                                                </label>
                                                <input
                                                    type="text"
                                                    value={passenger.profession}
                                                    onChange={(e) => handlePassengerChange(index, 'profession', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="Ingénieur"
                                                />
                                            </div>
                                        </div>

                                        {/* Ligne 3: Type de passager et coordonnées */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faUserTie} className="text-indigo-500 text-xs" />
                                                    Type de passager *
                                                </label>
                                                <select
                                                    value={passenger.typePassenger}
                                                    onChange={(e) => handlePassengerChange(index, 'typePassenger', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                >
                                                    <option value="ADLT">Adulte (ADLT)</option>
                                                    <option value="CHD">Enfant (CHD)</option>
                                                    <option value="INF">Bébé (INF)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faHome} className="text-gray-500 text-xs" />
                                                    Adresse
                                                </label>
                                                <input
                                                    type="text"
                                                    value={passenger.address}
                                                    onChange={(e) => handlePassengerChange(index, 'address', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="123 Rue de Paris"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faUser} className="text-green-500 text-xs" />
                                                    Téléphone
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={passenger.phone}
                                                    onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="+33 6 12 34 56 78"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faUser} className="text-red-500 text-xs" />
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={passenger.email}
                                                    onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="email@exemple.com"
                                                />
                                            </div>
                                        </div>

                                        {/* Documents */}
                                        <div className="mt-4">
                                            <button
                                                type="button"
                                                onClick={() => addDocument(index)}
                                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-3"
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                                Ajouter un document
                                            </button>

                                            {passenger.document.map((doc, docIndex) => (
                                                <div key={docIndex} className="mt-3 p-3 bg-white rounded border border-gray-200">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                            <FontAwesomeIcon icon={faIdCard} className="text-blue-500" />
                                                            Document {docIndex + 1}
                                                        </h4>
                                                        {docIndex > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeDocument(index, docIndex)}
                                                                className="text-xs text-red-600 hover:text-red-800"
                                                            >
                                                                Supprimer
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                                                        <div>
                                                            <label className="block text-xs text-gray-600 mb-1">Type</label>
                                                            <select
                                                                value={doc.documentType}
                                                                onChange={(e) => handleDocumentChange(index, docIndex, 'documentType', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                            >
                                                                <option value="">Sélectionner</option>
                                                                <option value="passport">Passeport</option>
                                                                <option value="cni">Carte d'identité</option>
                                                                <option value="acte_naissance">Acte de naissance</option>
                                                                <option value="visa">Visa</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-600 mb-1">Numéro</label>
                                                            <input
                                                                type="text"
                                                                value={doc.documentNumber}
                                                                onChange={(e) => handleDocumentChange(index, docIndex, 'documentNumber', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                                placeholder="N° document"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-600 mb-1">Date d'émission</label>
                                                            <input
                                                                type="date"
                                                                value={doc.issueDate}
                                                                onChange={(e) => handleDocumentChange(index, docIndex, 'issueDate', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-600 mb-1">Date d'expiration</label>
                                                            <input
                                                                type="date"
                                                                value={doc.expirationDate}
                                                                onChange={(e) => handleDocumentChange(index, docIndex, 'expirationDate', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-600 mb-1">Fichier</label>
                                                            <input
                                                                type="file"
                                                                onChange={(e) => handleFileChange(e, index, docIndex)}
                                                                className="w-full text-sm"
                                                                multiple
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Description */}
                            <div className="p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description (optionnelle)
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ajoutez des informations complémentaires..."
                                />
                            </div>
                        </form>
                    </div>

                    {/* Sidebar avec résumé et actions */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />
                                Résumé
                            </h3>

                            <div className="space-y-4">
                                {/* Prix */}
                                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                    <p className="text-sm text-gray-600 mb-1">Prix total</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {totalPrice.toLocaleString()} FCFA
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {passengers.length} passager(s)
                                    </p>
                                </div>

                                {/* Statut de la campagne */}
                                {selectedCampaign && (
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm font-medium text-blue-800 mb-2">
                                            Campagne: {selectedCampaign.title}
                                               </p>
                                        <div className="space-y-1 text-xs text-blue-600">
                                            <p className="flex items-center gap-1">
                                                <FontAwesomeIcon icon={campaignHasFlight ? faCheckCircle : faInfoCircle} />
                                                {campaignHasFlight ? 'Vol inclus' : 'Vol optionnel'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Résumé de la sélection manuelle */}
                                {showManualFlightSelection && manuallySelectedFlight && (
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <p className="text-xs font-medium text-purple-800 mb-2 flex items-center gap-1">
                                            <FontAwesomeIcon icon={faPlane} />
                                            Vol sélectionné
                                        </p>
                                        <p className="text-sm font-medium">{manuallySelectedFlight.flightName}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {manuallySelectedFlight.origin} → {manuallySelectedFlight.destination}
                                        </p>
                                        {manuallySelectedClass && (
                                            <p className="text-xs text-gray-600 mt-1">
                                                Classe: {manuallySelectedClass.class?.name}
                                            </p>
                                        )}
                                        {manualTripType === 'round-trip' && manuallySelectedReturnFlight && (
                                            <p className="text-xs text-gray-600 mt-1">
                                                Retour: {manuallySelectedReturnFlight.flightName}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Boutons d'action */}
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading || isSyncing}
                                    className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <FontAwesomeIcon icon={faSync} spin />
                                            Création...
                                        </>
                                    ) : (
                                        'Créer la réservation'
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/customer/dashboard')}
                                    className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>

                                {/* Aide */}
                                <div className="mt-4 text-xs text-gray-500 space-y-1">
                                    <p className="flex items-center gap-1">
                                        <FontAwesomeIcon icon={faInfoCircle} className="text-blue-400" />
                                        Tous les champs marqués * sont obligatoires
                                    </p>
                                    {showManualFlightSelection && (
                                        <p className="flex items-center gap-1">
                                            <FontAwesomeIcon icon={faInfoCircle} className="text-blue-400" />
                                            Vous devez sélectionner un vol, une classe et une date
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateReservationCampaign;
