import React, { useState, useEffect } from 'react';
import { agencyAssociationService } from "../../services/agencyAssociationService";
import { useParams } from 'react-router-dom';
import { reservationService } from '../../services/reservationService';
import { classeService } from '../../services/classService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlane, 
  faPlaneDeparture, 
  faPlaneArrival,
  faCalendarAlt,
  faMapMarkerAlt,
  faBuilding,
  faChair,
  faInfoCircle,
  faExclamationTriangle,
  faCheckCircle,
  faClock,
  faRedoAlt,
  faArrowLeft,
  faUser
} from '@fortawesome/free-solid-svg-icons';

const FlightProposition = () => {
  const { id: reservationId } = useParams();
  const [formData, setFormData] = useState({
    proposedVolId: '',
    proposedClassId: '',
    proposedPrice: '',
    notes: ''
  });
  const [originalRequest, setOriginalRequest] = useState(null);
  const [availableFlights, setAvailableFlights] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [classAgencies, setClassAgencies] = useState([]);
  const [filteredClassAgencies, setFilteredClassAgencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setErrorMessage('');
        const { data } = await reservationService.getReservationById(reservationId);
        console.log('📦 Données réservation:', data);
        setOriginalRequest(data);

        const flights = await agencyAssociationService.getUserFlightAgencies({});
        console.log('✈️ Vols disponibles:', flights);
        
        // ✅ Extraire correctement les données des vols
        const flightsData = flights?.data || flights || [];
        setAvailableFlights(Array.isArray(flightsData) ? flightsData : []);

        const classes = await classeService.getClasses();
        console.log('📚 Classes disponibles:', classes);
        
        // ✅ Extraire correctement les données des classes
        const classesData = classes?.data || classes || [];
        setAvailableClasses(Array.isArray(classesData) ? classesData : []);

        const classAgenciesData = await agencyAssociationService.getAllClassAgencies();
        console.log('💰 ClassAgencies:', classAgenciesData);
        
        // ✅ Extraire le tableau de données
        const classAgenciesArray = classAgenciesData?.data || classAgenciesData || [];
        setClassAgencies(Array.isArray(classAgenciesArray) ? classAgenciesArray : []);

        setIsLoading(false);
      } catch (err) {
        console.error('❌ Erreur chargement:', err);
        setErrorMessage(
          err.response?.data?.message || 
          err.message || 
          'Erreur lors du chargement des données'
        );
        setIsLoading(false);
      }
    };

    fetchData();
  }, [reservationId]);

  // Filtrer les ClassAgency en fonction du vol sélectionné
  useEffect(() => {
    if (formData.proposedVolId && Array.isArray(classAgencies)) {
      const filtered = classAgencies.filter(ca => {
        // ✅ Vérifier la structure correcte (agencyVol?.id)
        return ca.agencyVol?.id === parseInt(formData.proposedVolId);
      });
      setFilteredClassAgencies(filtered);
      console.log('🔍 ClassAgency filtrées:', filtered);
    } else {
      setFilteredClassAgencies([]);
    }
  }, [formData.proposedVolId, classAgencies]);

  // Mettre à jour le prix quand le vol ou la classe change
  useEffect(() => {
    if (formData.proposedVolId && formData.proposedClassId && Array.isArray(filteredClassAgencies)) {
      const selectedClassAgency = filteredClassAgencies.find(
        ca => ca.classId === parseInt(formData.proposedClassId)
      );
      
      if (selectedClassAgency) {
        setFormData(prev => ({ 
          ...prev, 
          proposedPrice: selectedClassAgency.price 
        }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          proposedPrice: '' 
        }));
      }
    }
  }, [formData.proposedVolId, formData.proposedClassId, filteredClassAgencies]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur de validation pour ce champ quand l'utilisateur modifie
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Effacer les messages d'erreur/succès
    setErrorMessage('');
    setSuccessMessage('');
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.proposedVolId) {
      errors.proposedVolId = 'Veuillez sélectionner un vol';
    }
    if (!formData.proposedClassId) {
      errors.proposedClassId = 'Veuillez sélectionner une classe';
    }
    if (!formData.proposedPrice) {
      errors.proposedPrice = 'Veuillez saisir un prix';
    } else if (isNaN(formData.proposedPrice) || parseFloat(formData.proposedPrice) <= 0) {
      errors.proposedPrice = 'Le prix doit être un nombre positif';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation côté client
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setErrorMessage('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    setValidationErrors({});

    try {
      console.log('📤 Envoi de la contre-proposition:', {
        reservationId,
        ...formData
      });

      const response = await reservationService.createCounterProposals({
        reservationId,
        ...formData
      });

      console.log('✅ Réponse succès:', response);
      setSuccessMessage('Contre-proposition envoyée avec succès !');
      
      // Optionnel: rediriger après 2 secondes
      setTimeout(() => {
        window.history.back();
      }, 2000);

    } catch (err) {
      console.error('❌ Erreur soumission:', err);
      
      // Analyser le type d'erreur pour afficher un message approprié
      if (err.response) {
        // Erreur avec réponse du serveur
        if (err.response.status === 400) {
          setErrorMessage('Données invalides. Veuillez vérifier votre saisie.');
        } else if (err.response.status === 401) {
          setErrorMessage('Session expirée. Veuillez vous reconnecter.');
        } else if (err.response.status === 403) {
          setErrorMessage('Vous n\'êtes pas autorisé à effectuer cette action.');
        } else if (err.response.status === 404) {
          setErrorMessage('Réservation non trouvée.');
        } else if (err.response.status === 409) {
          setErrorMessage('Une contre-proposition existe déjà pour cette réservation.');
        } else if (err.response.status >= 500) {
          setErrorMessage('Erreur serveur. Veuillez réessayer plus tard.');
        } else {
          setErrorMessage(err.response.data?.message || 'Erreur lors de l\'envoi de la contre-proposition');
        }
      } else if (err.request) {
        // Requête envoyée mais pas de réponse
        setErrorMessage('Impossible de contacter le serveur. Vérifiez votre connexion.');
      } else {
        // Erreur de configuration de la requête
        setErrorMessage(err.message || 'Une erreur est survenue');
      }
      
      // Scroll vers le haut pour voir l'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonctions utilitaires pour extraire les données de manière sécurisée
  const getCompanyName = (flight) => {
    if (!flight) return 'Compagnie inconnue';
    
    // Différentes structures possibles
    if (flight.company?.name) return flight.company.name;
    if (flight.company) return typeof flight.company === 'string' ? flight.company : 'Compagnie inconnue';
    if (flight.companyVol?.name) return flight.companyVol.name;
    if (flight.companyVol) return typeof flight.companyVol === 'string' ? flight.companyVol : 'Compagnie inconnue';
    
    return 'Compagnie inconnue';
  };

  const getDestinationName = (destination) => {
    if (!destination) return 'Inconnue';
    return destination.name || destination.city || 'Inconnue';
  };

  const formatDate = (date) => {
    if (!date) return 'Date non spécifiée';
    try {
      return new Date(date).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  };

  // Fonction pour obtenir le prix existant
  const getExistingPrice = (volId, classId) => {
    if (!Array.isArray(classAgencies)) return null;
    const found = classAgencies.find(ca => 
      ca.agencyVol?.id === parseInt(volId) && 
      ca.classId === parseInt(classId)
    );
    return found ? found.price : null;
  };

  // Fonction pour obtenir le libellé du type de voyage
  const getTripTypeLabel = (type) => {
    return type === 'round-trip' ? 'Aller-retour' : 'Aller simple';
  };

  if (isLoading && !originalRequest) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faCheckCircle} className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-green-800 mb-2">Succès !</h3>
              <p className="text-green-700">{successMessage}</p>
              <p className="text-sm text-green-600 mt-2">Redirection en cours...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vérifier si le statut est "demand"
  const isDemandStatus = originalRequest?.status?.toLowerCase() === 'demand';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
      {/* Bouton retour */}
      <div className="mb-4">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Retour
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Faire une contre-proposition</h2>

      {/* Message d'erreur en rouge */}
      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="flex-shrink-0 text-red-500 hover:text-red-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Message pour le statut "demand" */}
      {isDemandStatus && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-blue-800">Demande en cours de traitement</h3>
              <p className="text-sm text-blue-700 mt-1">
                Cette demande est encore en cours de traitement par le client. 
                Vous pouvez faire une contre-proposition qui lui sera notifiée.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Détails de la réservation originale */}
      <div className="mb-8 p-4 sm:p-5 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
          <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600" />
          Demande initiale
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Trajet */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
              Trajet
            </p>
            <p className="font-medium text-gray-800">
              {originalRequest?.startDestination?.city || 'N/A'} → {originalRequest?.endDestination?.city || 'N/A'}
            </p>
          </div>

          {/* Type de voyage - AJOUTÉ */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <FontAwesomeIcon icon={faRedoAlt} className="text-gray-400" />
              Type de voyage
            </p>
            <p className="font-medium text-gray-800">
              {getTripTypeLabel(originalRequest?.tripType)}
              {originalRequest?.tripType === 'round-trip' && (
                <span className="ml-2 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  Aller-retour
                </span>
              )}
            </p>
          </div>

          {/* Dates */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
              Dates
            </p>
            <p className="text-sm text-gray-600">
              {formatDate(originalRequest?.startAt)}
              {originalRequest?.tripType === 'round-trip' && originalRequest?.endAt && (
                <> → {formatDate(originalRequest.endAt)}</>
              )}
            </p>
          </div>

          {/* Classe */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <FontAwesomeIcon icon={faChair} className="text-gray-400" />
              Classe
            </p>
            <p className="font-medium text-gray-800">
              {originalRequest?.class?.class?.name || 'Non spécifiée'}
            </p>
          </div>

          {/* Compagnie */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <FontAwesomeIcon icon={faBuilding} className="text-gray-400" />
              Compagnie
            </p>
            <p className="font-medium text-gray-800">
              {originalRequest?.vols?.flight?.name || 'Non spécifiée'}
            </p>
          </div>

          {/* Prix total - Masqué si le statut est "demand" */}
          {!isDemandStatus && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Prix total</p>
              <p className="font-bold text-green-600">
                {originalRequest?.totalPrice?.toLocaleString()} FCFA
              </p>
            </div>
          )}

          {/* Passagers */}
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <FontAwesomeIcon icon={faUser} className="text-gray-400" />
              Passagers
            </p>
            <p className="font-medium text-gray-800">{originalRequest?.passengers?.length || 0}</p>
          </div>
        </div>

        {/* Indicateur de statut demand */}
        {isDemandStatus && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
              <FontAwesomeIcon icon={faClock} />
              <span>Le prix sera déterminé par votre contre-proposition</span>
            </div>
          </div>
        )}
      </div>

      {/* Formulaire de contre-proposition */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sélection du vol */}
          <div className="space-y-2 lg:col-span-2">
            <label htmlFor="proposedVolId" className="block text-sm font-medium text-gray-700">
              Vol alternatif <span className="text-red-500 ml-1">*</span>
            </label>
            
            <div className="relative">
              <select
                id="proposedVolId"
                name="proposedVolId"
                value={formData.proposedVolId}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 bg-white border rounded-xl shadow-sm 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           transition-all duration-200 appearance-none
                           text-gray-700 text-sm sm:text-base
                           hover:border-gray-400 cursor-pointer
                           ${validationErrors.proposedVolId ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              >
                <option value="">-- Sélectionnez un vol alternatif --</option>
                {availableFlights?.map(vol => {
                  const companyName = getCompanyName(vol.flight);
                  const originCity = vol.flight?.origin?.city || vol.flight?.origin?.name || 'Inconnue';
                  const destinationName = getDestinationName(vol.flight?.destination);
                  const departureDate = vol.departureTime ? formatDate(vol.departureTime) : 'Date N/A';
                  
                  return (
                    <option key={vol.id} value={vol.id} className="py-2">
                      {`${companyName} • ${originCity} → ${destinationName} • Départ: ${departureDate}`}
                    </option>
                  );
                })}
              </select>
              
              {/* Flèche personnalisée */}
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {validationErrors.proposedVolId && (
              <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
                {validationErrors.proposedVolId}
              </p>
            )}
            
            {(!availableFlights || availableFlights.length === 0) && (
              <p className="text-sm text-yellow-600 flex items-center gap-1 mt-1">
                <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4" />
                Aucun vol disponible pour le moment
              </p>
            )}
            
            {availableFlights?.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {availableFlights.length} vol(s) disponible(s)
              </p>
            )}
          </div>

          {/* Sélection de la classe */}
          <div className="space-y-2">
            <label htmlFor="proposedClassId" className="block text-sm font-medium text-gray-700">
              Classe <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <select
                id="proposedClassId"
                name="proposedClassId"
                value={formData.proposedClassId}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 bg-white border rounded-xl shadow-sm 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           transition-all duration-200 appearance-none
                           text-gray-700 text-sm sm:text-base
                           hover:border-gray-400 cursor-pointer
                           ${validationErrors.proposedClassId ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              >
                <option value="">-- Sélectionnez une classe --</option>
                {availableClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {validationErrors.proposedClassId && (
              <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
                {validationErrors.proposedClassId}
              </p>
            )}
          </div>

          {/* Prix proposé */}
          <div className="space-y-2">
            <label htmlFor="proposedPrice" className="block text-sm font-medium text-gray-700">
              Prix proposé (FCFA) <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              name="proposedPrice"
              id="proposedPrice"
              value={formData.proposedPrice}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white border rounded-xl shadow-sm 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         transition-all duration-200
                         text-gray-700 text-sm sm:text-base
                         hover:border-gray-400
                         ${validationErrors.proposedPrice ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              required
              min="0"
              step="100"
              placeholder="Saisissez un prix"
            />
            
            {validationErrors.proposedPrice && (
              <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
                {validationErrors.proposedPrice}
              </p>
            )}
            
            {/* Message informatif */}
            {formData.proposedVolId && formData.proposedClassId && !validationErrors.proposedPrice && (
              filteredClassAgencies.find(ca => ca.classId === parseInt(formData.proposedClassId)) ? (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                  Un prix existe déjà pour cette combinaison
                </p>
              ) : (
                <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4" />
                  Aucun prix prédéfini, saisissez un prix manuellement
                </p>
              )
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes (optionnelles)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       transition-all duration-200
                       text-gray-700 text-sm
                       hover:border-gray-400 resize-none"
            placeholder="Ajoutez un commentaire si nécessaire..."
          />
        </div>

        {/* Boutons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200
                       flex items-center justify-center gap-2 min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Envoi en cours...
              </>
            ) : (
              'Soumettre la proposition'
            )}
          </button>
          
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl
                       hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                       transition-all duration-200"
          >
            Annuler
          </button>
        </div>
      </form>

      {/* Aperçu comparatif */}
      {formData.proposedVolId && formData.proposedClassId && (
        <div className="mt-8 p-4 sm:p-5 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-md font-semibold mb-4 text-gray-700">Comparaison</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original */}
            <div className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faPlane} className="text-gray-500" />
                </div>
                <h5 className="font-medium text-gray-700">Demande originale</h5>
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-500">Vol:</span>
                  <span className="font-medium text-gray-800">{originalRequest?.vols?.flight?.name || 'N/A'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">Classe:</span>
                  <span className="font-medium text-gray-800">{originalRequest?.class?.class?.name || 'N/A'}</span>
                </p>
                {!isDemandStatus && (
                  <p className="flex justify-between">
                    <span className="text-gray-500">Prix:</span>
                    <span className="font-bold text-green-600">{originalRequest?.totalPrice?.toLocaleString()} FCFA</span>
                  </p>
                )}
              </div>
            </div>

            {/* Proposition */}
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-600" />
                </div>
                <h5 className="font-medium text-blue-700">Votre proposition</h5>
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-blue-600">Vol:</span>
                  <span className="font-medium text-gray-800">
                    {availableFlights.find(f => f.id === parseInt(formData.proposedVolId))?.flight?.name || 'N/A'}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-blue-600">Classe:</span>
                  <span className="font-medium text-gray-800">
                    {availableClasses.find(c => c.id === parseInt(formData.proposedClassId))?.name || 'N/A'}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-blue-600">Prix:</span>
                  <span className="font-bold text-green-600">
                    {Number(formData.proposedPrice).toLocaleString()} FCFA
                  </span>
                </p>
                
                {/* Indication sur le prix */}
                {formData.proposedVolId && formData.proposedClassId && (
                  (() => {
                    const existingPrice = getExistingPrice(formData.proposedVolId, formData.proposedClassId);
                    return existingPrice && (
                      <p className={`text-xs mt-2 flex items-center gap-1 ${
                        existingPrice === parseFloat(formData.proposedPrice) 
                          ? 'text-green-600' 
                          : 'text-orange-600'
                      }`}>
                        <FontAwesomeIcon icon={existingPrice === parseFloat(formData.proposedPrice) ? faCheckCircle : faInfoCircle} className="w-4 h-4" />
                        {existingPrice === parseFloat(formData.proposedPrice)
                          ? 'Prix conforme à la grille tarifaire'
                          : `Prix différent du tarif standard (${parseFloat(existingPrice).toLocaleString()} FCFA)`
                        }
                      </p>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightProposition;
