import React, { useState, useEffect } from 'react';
import { agencyAssociationService } from "../../services/agencyAssociationService";
import { useParams } from 'react-router-dom';
import { reservationService } from '../../services/reservationService';
import { volService } from '../../services/volService';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await reservationService.getReservationById(reservationId);
             console.log('dataPropoReservation',data)
        setOriginalRequest(data);

        const flights = await agencyAssociationService.getUserFlightAgencies({
         // agencyId: data.agencyId,
          //originId: data.startDestinationId,
          //destinationId: data.endDestinationId,
        });
console.log('volParAgency',flights)
        setAvailableFlights(flights);

        const classes = await classeService.getClasses();
        setAvailableClasses(classes);

        setIsLoading(false);
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des données');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [reservationId]);

  useEffect(() => {
    if (formData.proposedVolId && formData.proposedClassId) {
      const selectedFlight = availableFlights.find(f => f.id === parseInt(formData.proposedVolId));
      const selectedClass = availableClasses.find(c => c.id === parseInt(formData.proposedClassId));
      if (selectedFlight && selectedClass) {
        const price = (selectedFlight.price * selectedClass.priceMultiplier).toFixed(2);
        setFormData(prev => ({ ...prev, proposedPrice: price }));
      }
    }
  }, [formData.proposedVolId, formData.proposedClassId, availableFlights, availableClasses]);

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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Make a counter-proposal</h2>

      {/* Détails de la réservation originale */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-3">Demand initiale</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Trajet</p>
            <p className="font-medium">
              {originalRequest?.startDestination.city} ➡ {originalRequest?.endDestination.city}
            </p>
            <p className="text-sm text-gray-600">
              Departure Date : {formatDate(originalRequest?.startAt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Class</p>
            <p className="font-medium">{originalRequest?.class?.class?.name || 'Non spécifiée'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Company</p>
            <p className="font-medium">{originalRequest?.vols?.flight?.name || 'Non spécifiée'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500"> total Price </p>
            <p className="font-medium">{originalRequest?.totalPrice?.toLocaleString()} FCFA</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Passengers</p>
            <p className="font-medium">{originalRequest?.passengers?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Formulaire de contre-proposition */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="proposedVolId" className="block text-sm font-medium mb-1"> alternatif Flight </label>
            <select
              id="proposedVolId"
              name="proposedVolId"
              value={formData.proposedVolId}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- Select a flight --</option>
              {availableFlights.map(vol => (
                <option key={vol.id} value={vol.id}>
                  {vol.flight?.name} - Departure at  {formatDate(vol.departureTime)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="proposedClassId" className="block text-sm font-medium mb-1">Class</label>
            <select
              id="proposedClassId"
              name="proposedClassId"
              value={formData.proposedClassId}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- Select a  class --</option>
              {availableClasses.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} (x{cls.priceMultiplier})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="proposedPrice" className="block text-sm font-medium mb-1">Proposed price (FCFA)</label>
            <input
              type="number"
              name="proposedPrice"
              id="proposedPrice"
              value={formData.proposedPrice}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
              min="0"
              step="100"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full border px-3 py-2 rounded"
            placeholder="Ajoutez un commentaire si nécessaire..."
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ?  'Sending...' : 'submit proposal'}
        </button>
      </form>
           {/* Aperçu comparatif */}
{formData.proposedVolId && formData.proposedClassId && (
  <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
    <h4 className="text-md font-semibold mb-3">Comparison between the original and your proposal</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Original */}
      <div className="p-3 border border-gray-300 rounded bg-white">
        <h5 className="font-medium text-gray-700 mb-2"> Original Demande</h5>
        <p>Vol :{originalRequest?.vols?.flight?.name || 'Non spécifiée'} </p>
        <p>Classe : {originalRequest?.class?.class?.name || 'N/A'}</p>
        <p>Prix : {originalRequest?.totalPrice?.toLocaleString()} FCFA</p>
      </div>

      {/* Proposition */}
      <div className="p-3 border border-blue-300 rounded bg-blue-50">
        <h5 className="font-medium text-blue-700 mb-2">your proposal</h5>
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
        <p>Prix : {Number(formData.proposedPrice).toLocaleString()} FCFA</p>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default FlightProposition;

