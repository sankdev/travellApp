 import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import { classeService } from '../../../services/classService';
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
  faChevronUp,
  faLock,
  faLockOpen,
  faCrown,
  faStar,
  faGem,
  faChair,
  faToggleOn,
  faToggleOff
} from '@fortawesome/free-solid-svg-icons';

// Composant pour l'affichage des infos de vol (lecture seule)
export const FlightInfoDisplay = ({ campaign }) => {
  if (!campaign?.volDetails) return null;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
      <div className="flex items-center gap-2 text-gray-700">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={faLock} className="text-gray-600" />
        </div>
        <h3 className="font-semibold">Vol inclus dans la campagne</h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-auto">
          Verrouillé
        </span>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faPlane} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{campaign.volDetails.name}</p>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-xs text-gray-500">Compagnie</p>
                <p className="text-sm font-medium">{campaign.volDetails.company?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Type de voyage</p>
                <p className="text-sm font-medium">{campaign.tripType || 'Aller simple'}</p>
              </div>
              {campaign.volDetails.departureTime && (
                <div>
                  <p className="text-xs text-gray-500">Départ</p>
                  <p className="text-sm">{new Date(campaign.volDetails.departureTime).toLocaleDateString()}</p>
                </div>
              )}
              {campaign.volDetails.arrivalTime && (
                <div>
                  <p className="text-xs text-gray-500">Arrivée</p>
                  <p className="text-sm">{new Date(campaign.volDetails.arrivalTime).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 flex items-center gap-1">
        <FontAwesomeIcon icon={faInfoCircle} />
        Les détails de ce vol sont prédéfinis par la campagne
      </p>
    </div>
  );
};

// Composant pour la sélection manuelle de vol - Version avec mode de recherche par compagnie
export const ManualFlightSelection = ({
  agencyId,
  destinations,
  companies,
  onDestinationChange,
  onFlightSelect,
  onReturnFlightSelect,
  onClassSelect,
  onTripTypeChange,
  onDatesChange,
  selectedFlight,
  selectedReturnFlight,
  selectedClass,
  tripType,
  startAt,
  endAt,
  onIncludeFlightToggle,
  includeFlight
}) => {
  const [vols, setVols] = useState([]);
  const [returnVols, setReturnVols] = useState([]);
  const [allVols, setAllVols] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingReturn, setLoadingReturn] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  
  // États pour la recherche vol aller
  const [volSearch, setVolSearch] = useState('');
  const [showVolSuggestions, setShowVolSuggestions] = useState(false);
  
  // États pour la recherche vol retour
  const [returnVolSearch, setReturnVolSearch] = useState('');
  const [showReturnVolSuggestions, setShowReturnVolSuggestions] = useState(false);
  
  // ✅ MODE DE RECHERCHE PAR COMPAGNIE (inspiré de ReservationForm)
  const [searchMode, setSearchMode] = useState('agency');
  const [companySearch, setCompanySearch] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [filterByCompany, setFilterByCompany] = useState(false);
  
  // États pour les destinations
  const [startDestinationSearch, setStartDestinationSearch] = useState('');
  const [endDestinationSearch, setEndDestinationSearch] = useState('');
  const [startDestinations, setStartDestinations] = useState([]);
  const [endDestinations, setEndDestinations] = useState([]);
  const [showStartDestinationSuggestions, setShowStartDestinationSuggestions] = useState(false);
  const [showEndDestinationSuggestions, setShowEndDestinationSuggestions] = useState(false);
  const [selectedStartDestinationId, setSelectedStartDestinationId] = useState(null);
  const [selectedEndDestinationId, setSelectedEndDestinationId] = useState(null);
  const [selectionLocked, setSelectionLocked] = useState(false);
  
  // États pour la liste déroulante des classes
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [classSearch, setClassSearch] = useState('');

  // Charger toutes les classes disponibles
  useEffect(() => {
    const fetchAllClasses = async () => {
      setLoadingClasses(true);
      try {
        const response = await classeService.getClasses();
        console.log('📋 Classes disponibles:', response);
        
        let classesData = [];
        if (response.data && Array.isArray(response.data)) {
          classesData = response.data;
        } else if (Array.isArray(response)) {
          classesData = response;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          classesData = response.data.data;
        }

        const enrichedClasses = classesData.map(cls => ({
          id: cls.id,
          className: cls.name || 'Classe sans nom',
          name: cls.name || 'Classe sans nom',
          description: cls.description || '',
          priceMultiplier: cls.priceMultiplier || 1
        }));
        
        setClasses(enrichedClasses);
        console.log('✅ Classes enrichies:', enrichedClasses);
      } catch (error) {
        console.error('❌ Erreur chargement classes:', error);
        setClasses([]);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchAllClasses();
  }, []);

  // ============================================
  // FONCTIONS UTILITAIRES
  // ============================================

  const getCompanyName = (flight) => {
    if (!flight) return 'Compagnie inconnue';
    if (flight.company?.name) return flight.company.name;
    if (flight.company) return typeof flight.company === 'string' ? flight.company : 'Compagnie inconnue';
    if (flight.companyVol?.name) return flight.companyVol.name;
    if (flight.companyVol) return typeof flight.companyVol === 'string' ? flight.companyVol : 'Compagnie inconnue';
    return 'Compagnie inconnue';
  };

  const getCompanyId = (flight) => {
    if (!flight) return null;
    if (flight.company?.id) return flight.company.id;
    if (flight.companyVol?.id) return flight.companyVol.id;
    if (flight.companyId) return flight.companyId;
    return null;
  };

  const getDestinationNameById = (id) => {
    if (!destinations || !destinations.length || !id) return 'Inconnue';
    const destination = destinations.find(d => d.id === parseInt(id));
    return destination ? destination.name : 'Inconnue';
  };

  const formatFlightDisplay = (vol) => {
    if (!vol) return '';
    return `${vol.flightName || 'Vol'} - ${vol.companyName || 'Compagnie'} - ${vol.origin || '?'} → ${vol.destination || '?'}`;
  };

  // ============================================
  // GESTION DU MODE DE RECHERCHE
  // ============================================
  const handleSearchModeChange = (mode) => {
    setSearchMode(mode);
    setSelectedCompany(null);
    setCompanySearch('');
    setFilterByCompany(false);
    setVolSearch('');
    setShowVolSuggestions(false);
    
    // Réinitialiser les vols affichés
    if (mode === 'agency') {
      setVols(allVols);
    } else {
      setVols([]);
    }
  };

  // ============================================
  // RECHERCHE DE VOLS (avec mode compagnie)
  // ============================================
  useEffect(() => {
    const fetchVols = async () => {
      if (!agencyId || !includeFlight) return;

      setLoading(true);
      try {
        const response = await agencyAssociationService.getAllFlightAgencies({
          search: volSearch,
          agencyId: agencyId,
          page: 1,
          limit: 50
        });

        let volsData = [];
        if (response?.data) {
          volsData = Array.isArray(response.data) ? response.data : 
                     (response.data.data && Array.isArray(response.data.data) ? response.data.data : []);
        } else if (Array.isArray(response)) {
          volsData = response;
        }

        const transformedVols = volsData.map(vol => {
          const flightData = vol.flight || {};
          const companyData = flightData.company || flightData.companyVol || {};
          const originData = flightData.origin || {};
          const destinationData = flightData.destination || {};
          
          return {
            id: vol.id,
            flightName: flightData.name || 'Vol sans nom',
            companyName: companyData.name || 'Compagnie inconnue',
            companyId: companyData.id || flightData.companyId || null,
            origin: originData.name || originData.city || 'Inconnue',
            originId: originData.id || flightData.originId || null,
            destination: destinationData.name || destinationData.city || 'Inconnue',
            destinationId: destinationData.id || flightData.destinationId || null,
            departureTime: vol.departureTime,
            arrivalTime: vol.arrivalTime,
            price: vol.price || 0,
            agencyName: vol.agency?.name || 'Agence inconnue',
            flight: flightData,
            agency: vol.agency
          };
        });
        
        setAllVols(transformedVols);

        // Application du filtre selon le mode de recherche
        let volsToShow = transformedVols;
        
        if (searchMode === 'company' && selectedCompany) {
          volsToShow = transformedVols.filter(v => {
            const match = v.companyId === selectedCompany.id ||
                          v.flight?.companyId === selectedCompany.id ||
                          v.flight?.company?.id === selectedCompany.id;
            return match;
          });
          console.log(`🔍 ${volsToShow.length} vols trouvés pour la compagnie ${selectedCompany.name}`);
        }
        
        setVols(volsToShow);
        setShowVolSuggestions(volsToShow.length > 0 && volSearch.trim().length > 0);
        
      } catch (error) {
        console.error('❌ Erreur chargement vols:', error);
        setAllVols([]);
        setVols([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (agencyId && includeFlight) {
        fetchVols();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [volSearch, agencyId, searchMode, selectedCompany, includeFlight]);

  // Recherche de vols retour
  useEffect(() => {
    const fetchReturnVols = async () => {
      if (!agencyId ||  !includeFlight) return;
      
      setLoadingReturn(true);
      try {
        const response = await agencyAssociationService.getAllFlightAgencies({
          search: returnVolSearch,
          agencyId: agencyId,
          page: 1,
          limit: 50
        });

        let volsData = [];
        if (response.data?.success && Array.isArray(response.data.data)) {
          volsData = response.data.data;
        } else if (Array.isArray(response.data?.data)) {
          volsData = response.data.data;
        } else if (Array.isArray(response)) {
          volsData = response;
        }

        const transformedVols = volsData.map(vol => {
          const flightData = vol.flight || {};
          const companyData = flightData.company || flightData.companyVol || {};
          const originData = flightData.origin || {};
          const destinationData = flightData.destination || {};
          
          return {
            id: vol.id,
            flightName: flightData.name || 'Vol sans nom',
            companyName: companyData.name || 'Compagnie inconnue',
            companyId: companyData.id || flightData.companyId || null,
            origin: originData.name || originData.city || 'Inconnue',
            originId: originData.id || flightData.originId || null,
            destination: destinationData.name || destinationData.city || 'Inconnue',
            destinationId: destinationData.id || flightData.destinationId || null,
            departureTime: vol.departureTime,
            arrivalTime: vol.arrivalTime,
            price: vol.price || 0,
            agencyName: vol.agency?.name || 'Agence inconnue'
          };
        });

        setReturnVols(transformedVols);
        setShowReturnVolSuggestions(transformedVols.length > 0 && returnVolSearch.trim().length > 0);
      } catch (error) {
        console.error('❌ Erreur chargement vols retour:', error);
        setReturnVols([]);
      } finally {
        setLoadingReturn(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (agencyId && tripType === 'round-trip' && includeFlight) {
        fetchReturnVols();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [returnVolSearch, agencyId,  includeFlight]);
    // ✅ CORRECTION ÉTAPE 2 - Ajouter cette fonction après les useEffects
const fetchReturnVols = async () => {
  if (!agencyId || !includeFlight) return;
  
  setLoadingReturn(true);
  try {
    const response = await agencyAssociationService.getAllFlightAgencies({
      search: returnVolSearch,
      agencyId: agencyId,
      page: 1,
      limit: 50
    });

    let volsData = [];
    if (response.data?.success && Array.isArray(response.data.data)) {
      volsData = response.data.data;
    } else if (Array.isArray(response.data?.data)) {
      volsData = response.data.data;
    } else if (Array.isArray(response)) {
      volsData = response;
    }

    const transformedVols = volsData.map(vol => {
      const flightData = vol.flight || {};
      const companyData = flightData.company || flightData.companyVol || {};
      const originData = flightData.origin || {};
      const destinationData = flightData.destination || {};
      
      return {
        id: vol.id,
        flightName: flightData.name || 'Vol sans nom',
        companyName: companyData.name || 'Compagnie inconnue',
        companyId: companyData.id || flightData.companyId || null,
        origin: originData.name || originData.city || 'Inconnue',
        originId: originData.id || flightData.originId || null,
        destination: destinationData.name || destinationData.city || 'Inconnue',
        destinationId: destinationData.id || flightData.destinationId || null,
        departureTime: vol.departureTime,
        arrivalTime: vol.arrivalTime,
        price: vol.price || 0,
        agencyName: vol.agency?.name || 'Agence inconnue'
      };
    });

    setReturnVols(transformedVols);
    // ✅ Afficher les suggestions immédiatement
    if (transformedVols.length > 0 && returnVolSearch.trim().length > 0) {
      setShowReturnVolSuggestions(true);
    }
  } catch (error) {
    console.error('❌ Erreur chargement vols retour:', error);
    setReturnVols([]);
  } finally {
    setLoadingReturn(false);
  }
};
  // ============================================
  // GESTION DE LA COMPAGNIE (inspiré de ReservationForm)
  // ============================================
  const handleCompanySearch = (value) => {
    setCompanySearch(value);

    if (value.trim() === '') {
      setFilteredCompanies([]);
      setShowCompanySuggestions(false);
      setFilterByCompany(false);
      setSelectedCompany(null);
      setVols(allVols);
      return;
    }

    try {
      const filtered = companies.filter(company =>
        company.name?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCompanies(filtered);
      setShowCompanySuggestions(filtered.length > 0);
    } catch (error) {
      console.error('Failed to search companies:', error);
    }
  };

  const handleCompanySelection = (company) => {
    console.log('🔄 Sélection compagnie:', company);
    
    setSelectedCompany(company);
    setCompanySearch(company.name);
    setShowCompanySuggestions(false);
    setFilterByCompany(true);
    setVolSearch('');
    
    const filteredVols = allVols.filter(v => {
      const match = v.companyId === company.id ||
                    v.flight?.companyId === company.id ||
                    v.flight?.company?.id === company.id;
      return match;
    });
    
    console.log(`🔍 ${filteredVols.length} vols trouvés pour ${company.name}`);
    setVols(filteredVols);
    
    if (filteredVols.length > 0) {
      setShowVolSuggestions(true);
    }
  };

  const clearCompanySelection = () => {
    setSelectedCompany(null);
    setCompanySearch('');
    setShowCompanySuggestions(false);
    setFilterByCompany(false);
    setVols(allVols);
  };

  // ============================================
  // GESTION DES SÉLECTIONS
  // ============================================
  const handleFlightSelect = (vol) => {
    if (!vol || selectionLocked) return;

    setSelectionLocked(true);
    setFilterByCompany(false);
    setSelectedCompany(null);
    setCompanySearch('');
    setVolSearch(formatFlightDisplay(vol));
    setShowVolSuggestions(false);
    setShowCompanySuggestions(false);
    setVols(allVols);
    
    onFlightSelect(vol);
    
    if (vol.originId) {
      const origin = getDestinationNameById(vol.originId);
      setStartDestinationSearch(origin);
      setSelectedStartDestinationId(vol.originId);
      if (onDestinationChange) onDestinationChange('start', vol.originId);
    }
    if (vol.destinationId) {
      const dest = getDestinationNameById(vol.destinationId);
      setEndDestinationSearch(dest);
      setSelectedEndDestinationId(vol.destinationId);
      if (onDestinationChange) onDestinationChange('end', vol.destinationId);
    }

    setTimeout(() => {
      setSelectionLocked(false);
    }, 300);
  };

  const handleReturnFlightSelect = (vol) => {
    if (!vol || selectionLocked) return;

    setSelectionLocked(true);
    setReturnVolSearch(formatFlightDisplay(vol));
    setShowReturnVolSuggestions(false);
    onReturnFlightSelect(vol);

    setTimeout(() => {
      setSelectionLocked(false);
    }, 300);
  };

  // Gestionnaires des destinations
  const handleStartDestinationSearch = (value) => {
    setStartDestinationSearch(value);
    
    if (selectedStartDestinationId) {
      setSelectedStartDestinationId(null);
      if (onDestinationChange) onDestinationChange('start', null);
    }
    
    if (value.trim().length > 0 && destinations.length > 0) {
      const searchLower = value.toLowerCase();
      const filtered = destinations.filter(dest => {
        const destName = dest.name?.toLowerCase() || '';
        const destCountry = (dest.country || '').toLowerCase();
        return destName.includes(searchLower) || destCountry.includes(searchLower);
      });
      setStartDestinations(filtered);
      setShowStartDestinationSuggestions(filtered.length > 0);
    } else {
      setStartDestinations([]);
      setShowStartDestinationSuggestions(false);
    }
  };

  const handleEndDestinationSearch = (value) => {
    setEndDestinationSearch(value);
    
    if (selectedEndDestinationId) {
      setSelectedEndDestinationId(null);
      if (onDestinationChange) onDestinationChange('end', null);
    }
    
    if (value.trim().length > 0 && destinations.length > 0) {
      const searchLower = value.toLowerCase();
      const filtered = destinations.filter(dest => {
        const destName = dest.name?.toLowerCase() || '';
        const destCountry = (dest.country || '').toLowerCase();
        return destName.includes(searchLower) || destCountry.includes(searchLower);
      });
      setEndDestinations(filtered);
      setShowEndDestinationSuggestions(filtered.length > 0);
    } else {
      setEndDestinations([]);
      setShowEndDestinationSuggestions(false);
    }
  };

  const handleStartDestinationSelect = (destination) => {
    setStartDestinationSearch(destination.name);
    setSelectedStartDestinationId(destination.id);
    setShowStartDestinationSuggestions(false);
    if (onDestinationChange) onDestinationChange('start', destination.id);
  };

  const handleEndDestinationSelect = (destination) => {
    setEndDestinationSearch(destination.name);
    setSelectedEndDestinationId(destination.id);
    setShowEndDestinationSuggestions(false);
    if (onDestinationChange) onDestinationChange('end', destination.id);
  };

  // Sélection de classe
  const getFilteredClassesForDropdown = () => {
    if (!classSearch.trim()) {
      return classes;
    }
    const searchLower = classSearch.toLowerCase();
    return classes.filter(cls => {
      const className = cls.className?.toLowerCase() || '';
      const classDescription = cls.description?.toLowerCase() || '';
      return className.includes(searchLower) || classDescription.includes(searchLower);
    });
  };

  const handleClassSelectFromDropdown = (cls) => {
    onClassSelect(cls);
    setShowClassDropdown(false);
    setClassSearch(cls.className);
  };

  const clearClassSelection = () => {
    onClassSelect(null);
    setClassSearch('');
  };

  const handleTripTypeChangeLocal = (type) => {
  onTripTypeChange(type);
  if (type === 'one-way') {
    setReturnVolSearch('');
    onReturnFlightSelect(null);
  } else {
    // ✅ Force le rechargement des vols retour
    setReturnVolSearch('');
    setTimeout(() => {
      if (agencyId && includeFlight) {
        fetchReturnVols();
      }
    }, 100);
  }
};

  // ============================================
  // RENDU
  // ============================================
  return (
    <div className="space-y-6">
      {/* Toggle pour inclure/exclure les vols */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faPlane} className="text-blue-600 text-xl" />
            <div>
              <h3 className="font-semibold text-gray-800">Sélection des vols</h3>
              <p className="text-xs text-gray-600">
                {includeFlight 
                  ? 'Vous pouvez sélectionner un vol spécifique' 
                  : 'Aucun vol ne sera associé à cette réservation'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onIncludeFlightToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              includeFlight 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FontAwesomeIcon icon={includeFlight ? faToggleOn : faToggleOff} className="text-xl" />
            <span className="text-sm font-medium">
              {includeFlight ? 'Vol inclus' : 'Vol non inclus'}
            </span>
          </button>
        </div>
      </div>

      {includeFlight && (
        <div className="space-y-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
          {/* En-tête */}
          <div className="flex items-center gap-2 text-green-800">
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faLockOpen} className="text-green-600" />
            </div>
            <h3 className="font-semibold">Sélectionnez votre vol</h3>
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full ml-auto">
              À choisir
            </span>
          </div>

          {/* ✅ MODE DE RECHERCHE - AGENCE / COMPAGNIE */}
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
                <span className="text-xs text-gray-500">Voir tous les vols de l'agence</span>
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
                <span className="text-xs text-gray-500">Filtrer par compagnie aérienne</span>
              </button>
            </div>
          </div>

          {/* SECTION COMPAGNIE - visible uniquement en mode compagnie */}
          {searchMode === 'company' && (
            <div className="bg-white w-full p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Rechercher une compagnie
                </label>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  Optionnel
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={companySearch}
                  onChange={(e) => handleCompanySearch(e.target.value)}
                  placeholder="Ex: AIR FRANCE, Emirates..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 pl-10"
                />
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                {companySearch && (
                  <button
                    type="button"
                    onClick={clearCompanySelection}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>

              {showCompanySuggestions && filteredCompanies.length > 0 && (
                <div className="absolute z-20 w-full md:w-96 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                  {filteredCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="px-4 py-2 hover:bg-green-50 cursor-pointer flex items-center gap-2 border-b last:border-b-0"
                      onClick={() => handleCompanySelection(company)}
                    >
                      <FontAwesomeIcon icon={faBuilding} className="text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{company.name}</p>
                        {company.code && (
                          <p className="text-xs text-gray-500 truncate">Code: {company.code}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedCompany && (
                <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{selectedCompany.name}</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex-shrink-0">
                    {vols.length} vol(s)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Type de voyage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de voyage <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTripTypeChangeLocal('one-way')}
                className={`p-3 border-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  tripType === 'one-way'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <FontAwesomeIcon icon={faPlaneDeparture} />
                <span>Aller simple</span>
              </button>
              <button
                type="button"
                onClick={() => handleTripTypeChangeLocal('round-trip')}
                className={`p-3 border-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  tripType === 'round-trip'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300'
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
              Vol aller <span className="text-red-500">*</span>
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
                  if (!selectionLocked && vols.length > 0 && volSearch.trim().length > 0) {
                    const isSelectedFlightText = selectedFlight && 
                      volSearch === formatFlightDisplay(selectedFlight);
                    if (!isSelectedFlightText) {
                      setShowVolSuggestions(true);
                    }
                  }
                }}
                placeholder="Rechercher un vol..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 pl-10"
                required
              />
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <FontAwesomeIcon icon={faSync} spin className="text-green-500" />
                </div>
              )}
            </div>

            {!selectionLocked && showVolSuggestions && vols.length > 0 && (
              <ul className="absolute z-50 md:w-[600px] mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {vols.map(vol => (
                  <li
                    key={vol.id}
                    className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      setShowVolSuggestions(false);
                      handleFlightSelect(vol);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{vol.flightName}</p>
                        <p className="text-sm text-gray-600 truncate">{vol.companyName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded truncate">
                            {vol.agencyName}
                          </span>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {vol.departureTime && new Date(vol.departureTime).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="font-bold text-green-600">{vol.price} FCFA</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Vol retour */}
          {tripType === 'round-trip' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vol retour <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={returnVolSearch}
                  onChange={(e) =>{ setReturnVolSearch(e.target.value);if (e.target.value.trim().length > 0) {
            setShowReturnVolSuggestions(true);
          }}}
                  onFocus={() => {
                    if (!selectionLocked && returnVols.length > 0 && returnVolSearch.trim().length > 0) {
                      const isSelectedReturnFlightText = selectedReturnFlight && 
                        returnVolSearch === formatFlightDisplay(selectedReturnFlight);
                      if (!isSelectedReturnFlightText) {
                        setShowReturnVolSuggestions(true);
                      }
                    }
                  }}
                  placeholder="Rechercher un vol retour..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 pl-10"
                  required
                />
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                
                {loadingReturn && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FontAwesomeIcon icon={faSync} spin className="text-purple-500" />
                  </div>
                )}
              </div>

              {!selectionLocked && showReturnVolSuggestions && returnVols.length > 0 && (
                <ul className="absolute z-50 md:w-[600px] mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {returnVols
                    .map(vol => (
                      <li
                        key={vol.id}
                        className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setShowReturnVolSuggestions(false);
                          handleReturnFlightSelect(vol);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{vol.flightName}</p>
                            <p className="text-sm text-gray-600 truncate">
                              {vol.companyName} • {vol.origin} → {vol.destination}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded truncate">
                                {vol.agencyName}
                              </span>
                              <span className="text-xs text-gray-500 flex-shrink-0">
                                {vol.departureTime && new Date(vol.departureTime).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="font-bold text-green-600">{vol.price} FCFA</p>
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}

          {/* Section Classe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classe <span className="text-red-500">*</span>
            </label>

            {loadingClasses ? (
              <div className="flex items-center gap-3 text-blue-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <FontAwesomeIcon icon={faSync} spin className="text-blue-500" />
                <div>
                  <p className="font-medium">Chargement des classes...</p>
                  <p className="text-xs text-gray-500">Veuillez patienter</p>
                </div>
              </div>
            ) : classes.length > 0 ? (
              <div className="space-y-3">
                <div className="relative">
                  <div
                    className={`w-full px-4 py-3 border-2 rounded-xl bg-white cursor-pointer flex items-center justify-between transition-all ${
                      selectedClass 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => setShowClassDropdown(!showClassDropdown)}
                  >
                    {selectedClass ? (
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <FontAwesomeIcon icon={faChair} className="text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">
                              {selectedClass.className}
                            </span>
                            <span className="text-sm font-bold text-green-600 ml-2">
                              x{selectedClass.priceMultiplier}
                            </span>
                          </div>
                          {selectedClass.description && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {selectedClass.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 flex items-center gap-2">
                        <FontAwesomeIcon icon={faChair} className="text-gray-400" />
                        Choisissez une classe
                      </span>
                    )}
                    <FontAwesomeIcon
                      icon={showClassDropdown ? faChevronUp : faChevronDown}
                      className="text-gray-500 ml-2 flex-shrink-0"
                    />
                  </div>

                  {showClassDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-80 overflow-hidden">
                      <div className="p-2 bg-gray-50 border-b border-gray-200">
                        <div className="relative">
                          <input
                            type="text"
                            value={classSearch}
                            onChange={(e) => setClassSearch(e.target.value)}
                            placeholder="Rechercher une classe..."
                            className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                          <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
                          />
                        </div>
                      </div>

                      <div className="overflow-y-auto max-h-60">
                        {getFilteredClassesForDropdown().length > 0 ? (
                          getFilteredClassesForDropdown().map((cls) => {
                            const isSelected = selectedClass?.id === cls.id;

                            return (
                              <div
                                key={cls.id}
                                className={`p-3 cursor-pointer hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                                  isSelected ? 'bg-green-100' : ''
                                }`}
                                onClick={() => handleClassSelectFromDropdown(cls)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    isSelected ? 'bg-green-200' : 'bg-gray-100'
                                  }`}>
                                    <FontAwesomeIcon
                                      icon={faChair}
                                      className={isSelected ? 'text-green-600' : 'text-gray-500'}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className={`font-medium truncate ${
                                        isSelected ? 'text-green-800' : 'text-gray-800'
                                      }`}>
                                        {cls.className}
                                      </p>
                                      <span className="text-sm font-semibold text-green-600 ml-2 flex-shrink-0">
                                        x{cls.priceMultiplier}
                                      </span>
                                    </div>
                                    {cls.description && (
                                      <p className="text-xs text-gray-500 mt-1 truncate">
                                        {cls.description}
                                      </p>
                                    )}
                                    {isSelected && (
                                      <span className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                        Sélectionnée
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            <FontAwesomeIcon icon={faInfoCircle} className="text-gray-400 mb-2" />
                            <p className="text-sm">Aucune classe trouvée</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {selectedClass && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Classe sélectionnée</p>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-gray-900">{selectedClass.className}</p>
                          <span className="text-lg font-bold text-green-600">
                            x{selectedClass.priceMultiplier}
                          </span>
                        </div>
                        {selectedClass.description && (
                          <p className="text-sm text-gray-600 mt-1">{selectedClass.description}</p>
                        )}
                        <button
                          type="button"
                          onClick={clearClassSelection}
                          className="text-xs text-red-600 hover:text-red-800 mt-2"
                        >
                          <FontAwesomeIcon icon={faTimes} className="mr-1" />
                          Changer
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-orange-800">Aucune classe disponible</p>
                    <p className="text-sm text-orange-600 mt-1">
                      Veuillez contacter l'administrateur.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Destinations */}
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

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de départ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startAt}
                onChange={(e) => onDatesChange('startAt', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de retour {tripType === 'round-trip' ? <span className="text-red-500">*</span> : '(optionnelle)'}
              </label>
              <input
                type="date"
                value={endAt}
                onChange={(e) => onDatesChange('endAt', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                min={startAt || new Date().toISOString().split('T')[0]}
                disabled={tripType === 'one-way'}
                required={tripType === 'round-trip'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// Composant principal
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
    
    // État pour contrôler si l'utilisateur souhaite ajouter un vol manuellement
    const [addManualFlight, setAddManualFlight] = useState(false);
    
    // États pour la sélection manuelle de vol
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
        campaignId: '',
        agencyVolId: '',
        returnVolId: '',
        startAt: '',
        endAt: '',
        description: '',
        startDestinationId: '',
        endDestinationId: '',
        agencyClassId: '',
        tripType: 'one-way',
        totalPrice: 0
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

    // Calcul du prix total basé sur la campagne et le nombre de passagers
    const calculateTotalPrice = () => {
        if (!selectedCampaign) return 0;
        
        let pricePerPerson = selectedCampaign.price || 0;
        
        if (addManualFlight && manuallySelectedClass) {
            pricePerPerson = pricePerPerson * (manuallySelectedClass.priceMultiplier || 1);
        }
        
        return pricePerPerson * passengers.length;
    };

    // Mise à jour du prix total
    useEffect(() => {
        const newTotalPrice = calculateTotalPrice();
        setTotalPrice(newTotalPrice);
        setFormData(prev => ({ ...prev, totalPrice: newTotalPrice }));
    }, [selectedCampaign, manuallySelectedClass, passengers.length, addManualFlight]);

    const fetchAgenciesList = async () => {
        try {
            const response = await agencyService.getAgencies({});
            setAgencies(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch agencies list:', error.message);
        }
    };

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
                hasFlight: !!(campaign.volId || campaign.vol?.id),
                tripType: campaign.tripType || 'one-way',
                endAt: campaign.endAt,
                startAt: campaign.startAt
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
            setAddManualFlight(false);
            setFormData({
                ...formData,
                campaignId: '',
                agencyId: ''
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
            
            setFormData(prev => ({
                ...prev,
                campaignId: campaign.id,
                agencyId: campaign.agencyId || ''
            }));
            
            if (campaign.agencyDetails) {
                setAgencySearch(campaign.agencyDetails.name);
            }
            
            if (hasFlight && campaign.volDetails) {
                setManualTripType(campaign.tripType || 'one-way');
                if (campaign.startAt) {
                    setManualStartAt(campaign.startAt.split('T')[0]);
                    setFormData(prev => ({ ...prev, startAt: campaign.startAt.split('T')[0] }));
                }
                if (campaign.endAt) {
                    setManualEndAt(campaign.endAt.split('T')[0]);
                    setFormData(prev => ({ ...prev, endAt: campaign.endAt.split('T')[0] }));
                }
            } else {
                setAddManualFlight(false);
                resetManualSelections();
            }
            
        } catch (error) {
            console.error('❌ Erreur lors de la synchronisation:', error);
            setError('Erreur lors de la synchronisation des données de la campagne');
        } finally {
            setIsSyncing(false);
        }
    };

    const resetManualSelections = () => {
        setManuallySelectedFlight(null);
        setManuallySelectedReturnFlight(null);
        setManuallySelectedClass(null);
        setManualTripType('one-way');
        setManualStartAt('');
        setManualEndAt('');
        setManualStartDestinationId('');
        setManualEndDestinationId('');
        setFormData(prev => ({
            ...prev,
            agencyVolId: '',
            returnVolId: '',
            agencyClassId: '',
            startAt: '',
            endAt: '',
            tripType: 'one-way',
            startDestinationId: '',
            endDestinationId: ''
        }));
    };

    const handleManualFlightSelect = (flight) => {
        setManuallySelectedFlight(flight);
        setFormData(prev => ({ 
            ...prev, 
            agencyVolId: flight?.id || '',
            startDestinationId: flight?.originId || '',
            endDestinationId: flight?.destinationId || ''
        }));
        setManualStartDestinationId(flight?.originId || '');
        setManualEndDestinationId(flight?.destinationId || '');
    };

    const handleManualReturnFlightSelect = (flight) => {
        setManuallySelectedReturnFlight(flight);
        setFormData(prev => ({ 
            ...prev, 
            returnVolId: flight?.id || '' 
        }));
    };

    const handleManualClassSelect = (cls) => {
        setManuallySelectedClass(cls);
        setFormData(prev => ({ 
            ...prev, 
            agencyClassId: cls?.id || '' 
        }));
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

    const handleManualDestinationChange = (type, id) => {
        if (type === 'start') {
            setManualStartDestinationId(id);
            setFormData(prev => ({ ...prev, startDestinationId: id }));
        } else {
            setManualEndDestinationId(id);
            setFormData(prev => ({ ...prev, endDestinationId: id }));
        }
    };

    const toggleIncludeFlight = () => {
        setAddManualFlight(!addManualFlight);
        if (!addManualFlight) {
            resetManualSelections();
        }
    };

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
            campaignId: ''
        }));
        setShowAgencySuggestions(false);
        setSelectedCampaign(null);
        setCampaignHasFlight(false);
        setAddManualFlight(false);
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

    const validateForm = () => {
        if (!formData.agencyId) {
            setError('Veuillez sélectionner une agence');
            return false;
        }
        
        if (!selectedCampaign) {
            setError('Veuillez sélectionner une campagne');
            return false;
        }
        
        if (campaignHasFlight) {
            // Tout est bon
        } else if (addManualFlight) {
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
            if (manualTripType === 'round-trip') {
                if (!manuallySelectedReturnFlight) {
                    setError('Veuillez sélectionner un vol retour');
                    return false;
                }
                if (!manualEndAt) {
                    setError('Veuillez sélectionner une date de retour');
                    return false;
                }
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

            let payload = {
                ...formData,
                passengers: encodedPassengers,
                totalPrice: totalPrice,
            };

            if (campaignHasFlight) {
                payload = {
                    ...payload,
                    agencyVolId: selectedCampaign?.volId || '',
                    returnVolId: '',
                    agencyClassId: '',
                    startAt: selectedCampaign?.startAt?.split('T')[0] || '',
                    endAt: selectedCampaign?.endAt?.split('T')[0] || '',
                    tripType: selectedCampaign?.tripType || 'one-way',
                    startDestinationId: selectedCampaign?.volDetails?.originId || '',
                    endDestinationId: selectedCampaign?.volDetails?.destinationId || '',
                    flightSource: 'campaign'
                };
            } else if (addManualFlight) {
                payload = {
                    ...payload,
                    agencyVolId: manuallySelectedFlight?.id || '',
                    returnVolId: manuallySelectedReturnFlight?.id || '',
                    agencyClassId: manuallySelectedClass?.id || '',
                    startAt: manualStartAt,
                    endAt: manualEndAt,
                    tripType: manualTripType,
                    startDestinationId: manualStartDestinationId,
                    endDestinationId: manualEndDestinationId,
                    flightSource: 'manual'
                };
            } else {
                payload = {
                    ...payload,
                    agencyVolId: '',
                    returnVolId: '',
                    agencyClassId: '',
                    startAt: '',
                    endAt: '',
                    tripType: 'one-way',
                    startDestinationId: '',
                    endDestinationId: '',
                    flightSource: 'none'
                };
            }

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
            <button
                onClick={() => navigate('/customer/reservations')}
                className="mb-6 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
                <FontAwesomeIcon icon={faArrowLeft} />
                Retour aux réservations
            </button>  
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Réservation de Campagne
                        </h1>
                        {selectedCampaign && (
                            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                campaignHasFlight 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : addManualFlight 
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                            }`}>
                                {campaignHasFlight 
                                    ? 'Vol inclus' 
                                    : addManualFlight 
                                        ? 'Ajout de vol manuel'
                                        : 'Sans vol'}
                            </div>
                        )}
                    </div>
                </div>

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
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                                        required
                                    >
                                        <option value="">Choisir une campagne...</option>
                                        {campaigns.map(campaign => (
                                            <option key={campaign.id} value={campaign.id}>
                                                {campaign.title} - {campaign.price.toLocaleString()} FCFA - Agence: {campaign.agencyDetails?.name}
                                                {campaign.hasFlight ? ' (Vol inclus)' : ' (Sans vol)'}
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
                                                            <p className="text-xs text-gray-500">Prix par personne</p>
                                                            <p className="font-bold text-green-600">{selectedCampaign.price.toLocaleString()} FCFA</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Date Début</p>
                                                            <p className="font-medium"> {new Date(selectedCampaign.startAt).toLocaleDateString('fr-FR')}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Date Fin</p>
                                                            <p className="font-medium">{new Date(selectedCampaign.endAt).toLocaleDateString('fr-FR')} </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section pour les campagnes sans vol */}
                            {selectedCampaign && !campaignHasFlight && (
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faPlane} className="text-green-500" />
                                        2. Options de vol
                                    </h2>
                                    
                                    <ManualFlightSelection
                                        agencyId={formData.agencyId}
                                        destinations={destinations}
                                        companies={companies}
                                        onDestinationChange={handleManualDestinationChange}
                                        onFlightSelect={handleManualFlightSelect}
                                        onReturnFlightSelect={handleManualReturnFlightSelect}
                                        onClassSelect={handleManualClassSelect}
                                        onTripTypeChange={handleManualTripTypeChange}
                                        onDatesChange={handleManualDateChange}
                                        selectedFlight={manuallySelectedFlight}
                                        selectedReturnFlight={manuallySelectedReturnFlight}
                                        selectedClass={manuallySelectedClass}
                                        tripType={manualTripType}
                                        startAt={manualStartAt}
                                        endAt={manualEndAt}
                                        onIncludeFlightToggle={toggleIncludeFlight}
                                        includeFlight={addManualFlight}
                                    />
                                </div>
                            )}

                            {/* Informations de la campagne avec vol */}
                            {selectedCampaign && campaignHasFlight && (
                                <div className="p-6 border-b border-gray-200">
                                    <FlightInfoDisplay campaign={selectedCampaign} />
                                </div>
                            )}

                            {/* Passagers */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faUsers} className="text-indigo-500" />
                                        Passagers ({passengers.length})
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

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Prénom <span className="text-red-500">*</span>
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
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Nom <span className="text-red-500">*</span>
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
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
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

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
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
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
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
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
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
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
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

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Type de passager <span className="text-red-500">*</span>
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
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
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
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
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
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
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

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />
                                Résumé
                            </h3>

                            <div className="space-y-4">
                                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                    <p className="text-sm text-gray-600 mb-1">Prix total</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {totalPrice.toLocaleString()} FCFA
                                    </p>
                                    {selectedCampaign && (
                                        <div className="mt-2 text-xs text-gray-500">
                                            <p>• Campagne: {selectedCampaign.price.toLocaleString()} FCFA</p>
                                            {!campaignHasFlight && addManualFlight && manuallySelectedClass && (
                                                <p>• Classe: x{manuallySelectedClass.priceMultiplier} ({(selectedCampaign.price * manuallySelectedClass.priceMultiplier).toLocaleString()} FCFA/pers)</p>
                                            )}
                                            <p>• {passengers.length} passager(s)</p>
                                        </div>
                                    )}
                                </div>

                                {selectedCampaign && (
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm font-medium text-blue-800 mb-2">
                                            {selectedCampaign.title}
                                        </p>
                                        <div className="space-y-1 text-xs">
                                            <p className="flex items-center gap-1 text-gray-600">
                                                <FontAwesomeIcon icon={campaignHasFlight ? faLock : (addManualFlight ? faLockOpen : faPlane)} className="text-blue-500" />
                                                {campaignHasFlight 
                                                    ? 'Vol inclus (verrouillé)' 
                                                    : addManualFlight 
                                                        ? 'Vol ajouté manuellement'
                                                        : 'Sans vol'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {!campaignHasFlight && addManualFlight && manuallySelectedFlight && (
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <p className="text-xs font-medium text-green-800 mb-2">Vol choisi :</p>
                                        <p className="text-sm">{manuallySelectedFlight.flightName}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {manuallySelectedFlight.origin} → {manuallySelectedFlight.destination}
                                        </p>
                                    </div>
                                )}

                                {!campaignHasFlight && addManualFlight && manuallySelectedClass && (
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <p className="text-xs font-medium text-purple-800 mb-2">Classe choisie :</p>
                                        <p className="font-medium text-gray-900">{manuallySelectedClass.className}</p>
                                        <p className="text-xs text-gray-600">Multiplicateur: x{manuallySelectedClass.priceMultiplier}</p>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading || isSyncing || !selectedCampaign}
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateReservationCampaign;
