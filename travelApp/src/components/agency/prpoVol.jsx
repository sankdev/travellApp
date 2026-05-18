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
        console.log('dataPropoReservation', data);
        setOriginalRequest(data);

        const flights = await agencyAssociationService.getUserFlightAgencies({});
        console.log('volParAgency', flights);
        
        // ✅ Extraire correctement les données des vols
        const flightsData = flights?.data || flights || [];
        setAvailableFlights(Array.isArray(flightsData) ? flightsData : []);

        const classes = await classeService.getClasses();
        console.log('classes', classes);
        
        // ✅ Extraire correctement les données des classes
        const classesData = classes?.data || classes || [];
        setAvailableClasses(Array.isArray(classesData) ? classesData : []);

        const classAgenciesData = await agencyAssociationService.getAllClassAgencies();
        console.log('classAgencies', classAgenciesData);
        
        // ✅ CORRECTION: Extraire le tableau de données
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
      console.log('ClassAgency filtrées pour le vol', formData.proposedVolId, filtered);
    } else {
      setFilteredClassAgencies([]);
    }
  }, [formData.proposedVolId, classAgencies]);

  // Mettre à jour le prix quand le vol ou la classe change
  useEffect(() => {
    if (formData.proposedVolId && formData.proposedClassId && Array.isArray(filteredClassAgencies)) {
      // Chercher dans les ClassAgency filtrées
      const selectedClassAgency = filteredClassAgencies.find(
        ca => ca.classId === parseInt(formData.proposedClassId)
      );
      
      if (selectedClassAgency) {
        // Si une ClassAgency existe, utiliser son prix
        setFormData(prev => ({ 
          ...prev, 
          proposedPrice: selectedClassAgency.price 
        }));
      } else {
        // Sinon, laisser l'utilisateur saisir manuellement
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

  if (isLoading && !originalRequest) {
    return <div className="text-center py-10 text-gray-500">Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-500 bg-red-100 p-4 rounded">{error}</div>;
  }

  if (success) {
    return <div className="text-green-700 bg-green-100 p-4 rounded">Contre-proposition envoyée avec succès.</div>;
  }

  const formatDate = (date) => new Date(date).toLocaleString();

  // Fonction pour obtenir le prix existant
  const getExistingPrice = (volId, classId) => {
    if (!Array.isArray(classAgencies)) return null;
    const found = classAgencies.find(ca => 
      ca.agencyVol?.id === parseInt(volId) && 
      ca.classId === parseInt(classId)
    );
    return found ? found.price : null;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Faire une contre-proposition</h2>

      {/* Détails de la réservation originale */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-3">Demande initiale</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Trajet</p>
            <p className="font-medium">
              {originalRequest?.startDestination?.city || 'N/A'} ➡ {originalRequest?.endDestination?.city || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              Date de départ : {formatDate(originalRequest?.startAt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Classe</p>
            <p className="font-medium">{originalRequest?.class?.class?.name || 'Non spécifiée'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Compagnie</p>
            <p className="font-medium">{originalRequest?.vols?.flight?.name || 'Non spécifiée'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Prix total</p>
            <p className="font-medium">{originalRequest?.totalPrice?.toLocaleString()} FCFA</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Passagers</p>
            <p className="font-medium">{originalRequest?.passengers?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Formulaire de contre-proposition */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sélection du vol */}
          <div className="space-y-2">
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
      aria-label="Sélectionner un vol alternatif"
    >
      <option value="" className="text-gray-500">-- Sélectionnez un vol alternatif --</option>
      {availableFlights?.map(vol => {
        // Construction du libellé de manière sécurisée
        const company = vol.flight?.company?.name || 'Compagnie inconnue';
        const originCity = vol.flight?.origin?.name || 'Ville inconnue';
        const destinationName = vol.flight?.destination?.name || vol.flight?.destination?.city || 'Destination inconnue';
        const className = vol.class?.name || '';
        const departureDate = vol.departureTime ? formatDate(vol.departureTime) : 'Date non spécifiée';
        
        // Informations supplémentaires pour le débogage
        const flightNumber = vol.flight?.flightNumber ? ` - Vol ${vol.flight.flightNumber}` : '';
        
        return (
          <option 
            key={vol.id} 
            value={vol.id}
            className="py-2"
          >
            {`${company}${flightNumber} • ${originCity} → ${destinationName} ${className ? `• ${className}` : ''} • Départ: ${departureDate}`}
          </option>
        );
      })}
    </select>
    
    {/* Icône de chevron personnalisée pour le select */}
    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
  
  {/* Message d'aide ou d'information optionnel */}
  {availableFlights?.length === 0 && (
    <p className="text-sm text-yellow-600 flex items-center gap-1 mt-1">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Aucun vol disponible pour le moment
    </p>
  )}
  
  {/* Indication du nombre de vols disponibles */}
  {availableFlights?.length > 0 && (
    <p className="text-xs text-gray-500 mt-1">
      {availableFlights.length} vol(s) disponible(s)
    </p>
  )}
</div>

          {/* Sélection de la classe */}
          <div>
            <label htmlFor="proposedClassId" className="block text-sm font-medium mb-1">
              Classe <span className="text-red-500">*</span>
            </label>
            <select
              id="proposedClassId"
              name="proposedClassId"
              value={formData.proposedClassId}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Sélectionnez une classe --</option>
              {availableClasses.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Prix proposé */}
          <div>
            <label htmlFor="proposedPrice" className="block text-sm font-medium mb-1">
              Prix proposé (FCFA) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="proposedPrice"
              id="proposedPrice"
              value={formData.proposedPrice}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              step="100"
              placeholder="Saisissez un prix"
            />
            
            {/* Message informatif sur le prix existant */}
            {formData.proposedVolId && formData.proposedClassId && (
              filteredClassAgencies.find(ca => ca.classId === parseInt(formData.proposedClassId)) ? (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Un prix existe déjà pour cette combinaison
                </p>
              ) : (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠ Aucun prix prédéfini pour cette combinaison, saisissez un prix manuellement
                </p>
              )
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Ajoutez un commentaire si nécessaire..."
          ></textarea>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Envoi en cours...' : 'Soumettre la proposition'}
        </button>
      </form>

      {/* Aperçu comparatif */}
      {formData.proposedVolId && formData.proposedClassId && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-md font-semibold mb-3">Comparaison entre l'original et votre proposition</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original */}
            <div className="p-3 border border-gray-300 rounded bg-white">
              <h5 className="font-medium text-gray-700 mb-2">Demande originale</h5>
              <p>Vol : {originalRequest?.vols?.flight?.name || 'Non spécifiée'}</p>
              <p>Classe : {originalRequest?.class?.class?.name || 'N/A'}</p>
              <p>Prix : {originalRequest?.totalPrice?.toLocaleString()} FCFA</p>
            </div>

            {/* Proposition */}
            <div className="p-3 border border-blue-300 rounded bg-blue-50">
              <h5 className="font-medium text-blue-700 mb-2">Votre proposition</h5>
              <p>
                Vol : {
                  availableFlights.find(f => f.id === parseInt(formData.proposedVolId))?.flight?.name || 'N/A'
                }
              </p>
              <p>
                Classe : {
                  availableClasses.find(c => c.id === parseInt(formData.proposedClassId))?.name || 'N/A'
                }
              </p>
              <p className="font-bold text-green-600">
                Prix : {Number(formData.proposedPrice).toLocaleString()} FCFA
              </p>
              
              {/* Indication si le prix vient d'une ClassAgency */}
              {formData.proposedVolId && formData.proposedClassId && (
                (() => {
                  const existingPrice = getExistingPrice(formData.proposedVolId, formData.proposedClassId);
                  
                  return existingPrice && existingPrice === parseFloat(formData.proposedPrice) ? (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Prix issu de la grille tarifaire
                    </p>
                  ) : existingPrice ? (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠ Prix différent du tarif standard ({parseFloat(existingPrice).toLocaleString()} FCFA)
                    </p>
                  ) : null;
                })()
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightProposition;
