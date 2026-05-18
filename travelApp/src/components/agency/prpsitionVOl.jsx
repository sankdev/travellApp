import React, { useState, useEffect } from 'react';
import { agencyAssociationService } from "../../services/agencyAssociationService";
import { useParams } from 'react-router-dom';
import { reservationService } from '../../services/reservationService';
import { classeService } from '../../services/classService';
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
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
        console.error('❌ Erreur:', err);
        setError(err.message || 'Erreur lors du chargement des données');
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await reservationService.createCounterProposals({
        reservationId,
        ...formData
      });
      setSuccess(true);
    } catch (err) {
      console.error('❌ Erreur soumission:', err);
      setError(err.message || 'Échec de l’envoi de la contre-proposition');
    } finally {
      setIsLoading(false);
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

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700">✓ Contre-proposition envoyée avec succès.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Faire une contre-proposition</h2>

      {/* Détails de la réservation originale */}
      <div className="mb-8 p-4 sm:p-5 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Demande initiale</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Trajet</p>
            <p className="font-medium text-gray-800">
              {originalRequest?.startDestination?.city || 'N/A'} → {originalRequest?.endDestination?.city || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              {formatDate(originalRequest?.startAt)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Classe</p>
            <p className="font-medium text-gray-800">
              {originalRequest?.class?.class?.name || 'Non spécifiée'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Compagnie</p>
            <p className="font-medium text-gray-800">
              {originalRequest?.vols?.flight?.name || 'Non spécifiée'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Prix total</p>
            <p className="font-bold text-green-600">
              {originalRequest?.totalPrice?.toLocaleString()} FCFA
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Passagers</p>
            <p className="font-medium text-gray-800">{originalRequest?.passengers?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Formulaire de contre-proposition */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sélection du vol - Version améliorée */}
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
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           transition-all duration-200 appearance-none
                           text-gray-700 text-sm sm:text-base
                           hover:border-gray-400 cursor-pointer"
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
            
            {(!availableFlights || availableFlights.length === 0) && (
              <p className="text-sm text-yellow-600 flex items-center gap-1 mt-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           transition-all duration-200 appearance-none
                           text-gray-700 text-sm sm:text-base
                           hover:border-gray-400 cursor-pointer"
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
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         transition-all duration-200
                         text-gray-700 text-sm sm:text-base
                         hover:border-gray-400"
              required
              min="0"
              step="100"
              placeholder="Saisissez un prix"
            />
            
            {/* Message informatif */}
            {formData.proposedVolId && formData.proposedClassId && (
              filteredClassAgencies.find(ca => ca.classId === parseInt(formData.proposedClassId)) ? (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Un prix existe déjà pour cette combinaison
                </p>
              ) : (
                <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
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
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200
                       flex items-center justify-center gap-2"
          >
            {isLoading ? (
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
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
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
                <p className="flex justify-between">
                  <span className="text-gray-500">Prix:</span>
                  <span className="font-bold text-green-600">{originalRequest?.totalPrice?.toLocaleString()} FCFA</span>
                </p>
              </div>
            </div>

            {/* Proposition */}
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
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
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {existingPrice === parseFloat(formData.proposedPrice) ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          )}
                        </svg>
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
