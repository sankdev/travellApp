import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlane,
  faCheckCircle,
  faTimesCircle,
  faArrowLeft,
  faCalendarAlt,
  faMapMarkerAlt,
  faUsers,
  faDollarSign,
  faBuilding,
  faClock,
  faCheckDouble,
  faExchangeAlt,
  faInfoCircle,
  faPlaneDeparture,
  faPlaneArrival,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';
import { reservationService } from '../../../services/reservationService';

const ProposalResponse = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState({
    accept: null,
    rejectionReason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const data = await reservationService.getReservationById(proposalId);
        console.log('Proposition reçue:', data);
        setProposal(data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load proposal');
        setLoading(false);
      }
    };

    fetchProposal();
  }, [proposalId]);

  const handleResponseChange = (e) => {
    const { name, value } = e.target;
    setResponse(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await reservationService.respondToProposal({
        reservationId: proposalId,
        accept: response.accept === 'true',
        rejectionReason: response.rejectionReason
      });

      setSubmitSuccess(true);
      // Redirection après 2 secondes
      setTimeout(() => {
        navigate('/customer/reservations');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement de la proposition...</p>
        </div>
      </div>
    );
  }

  if (error && !proposal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faTimesCircle} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-red-800">Erreur de chargement</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/customer/reservations')}
              className="mt-4 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              Retour aux réservations
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faInfoCircle} className="text-yellow-600 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Proposition non trouvée</h3>
            <p className="text-gray-600 mb-6">Cette contre-proposition n'existe pas ou a été retirée.</p>
            <button
              onClick={() => navigate('/customer/reservations')}
              className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDestinationInfo = (destination) => {
    if (!destination) return { city: 'Unknown', country: 'Unknown' };
    return {
      city: destination.city || destination.name || 'Unknown',
      country: destination.country || 'Unknown'
    };
  };

  const startDest = getDestinationInfo(proposal.startDestination);
  const endDest = getDestinationInfo(proposal.endDestination);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header avec bouton retour */}
      <div className="max-w-5xl mx-auto mb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Retour aux réservations
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-bold mb-3">
              <FontAwesomeIcon icon={faExchangeAlt} />
              Contre-proposition
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Réponse à la proposition de vol
            </h1>
            <p className="text-gray-600 mt-2">
              Examinez les détails et répondez à la contre-proposition de l'agence
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-3 border border-purple-200">
            <div className="text-center">
              <p className="text-sm text-gray-500">Délai de réponse</p>
              <p className="text-lg font-bold text-purple-700">48 heures</p>
              <p className="text-xs text-gray-500">recommandé</p>
            </div>
          </div>
        </div>
      </div>

      {/* Succès de soumission */}
      {submitSuccess && (
        <div className="max-w-5xl mx-auto mb-6">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-green-800">Réponse envoyée avec succès !</h3>
                <p className="text-green-600">
                  Redirection vers votre tableau de bord dans 2 secondes...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche : Détails de la proposition */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carte principale de la proposition */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <FontAwesomeIcon icon={faPlane} className="text-blue-500" />
                      Détails de la proposition
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      ID: #{proposal.id} • Reçue le {formatDate(proposal.updatedAt)}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full font-bold ${
                    proposal.status === 'counter_proposal' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {proposal.status?.replace('_', ' ') || 'counter proposal'}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Itinéraire visuel */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
                    Itinéraire proposé
                  </h3>
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-600" />
                        </div>
                        <p className="font-bold text-gray-900">{startDest.city}</p>
                        <p className="text-sm text-gray-600">{startDest.country}</p>
                      </div>
                      
                      <div className="flex-1 px-4">
                        <div className="flex items-center justify-center">
                          <div className="flex-1 h-0.5 bg-blue-200"></div>
                          <FontAwesomeIcon icon={faPlane} className="mx-2 text-blue-400" />
                          <div className="flex-1 h-0.5 bg-blue-200"></div>
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-2">
                          Durée estimée
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <FontAwesomeIcon icon={faPlaneArrival} className="text-green-600" />
                        </div>
                        <p className="font-bold text-gray-900">{endDest.city}</p>
                        <p className="text-sm text-gray-600">{endDest.country}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid des détails */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vol et Dates */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-500" />
                        Dates du vol
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Départ:</span>
                          <span className="font-bold">{formatDate(proposal.vols?.departureTime)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Heure:</span>
                          <span className="font-medium">
                            {formatTime(proposal.proposalDetails?.proposedVol?.departureTime)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Retour:</span>
                          <span className="font-bold">{formatDate(proposal.endAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUsers} className="text-orange-500" />
                        Informations passagers
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium">
                          {proposal.passengers?.length || 0} passager(s)
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Type: {proposal.tripType || 'One-way'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Classe et Prix */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUserTie} className="text-blue-500" />
                        Classe et service
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="font-bold text-lg text-blue-700">
                          {proposal.proposalDetails?.proposedClass?.class?.name|| 'Standard'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Multiplicateur: {proposal.class?.priceMultiplier || '1.0'}x
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={faDollarSign} className="text-green-500" />
                        Détails financiers
                      </h4>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Prix proposé:</span>
                          <span className="text-2xl font-bold text-green-700">
                            {proposal.totalPrice?.toLocaleString() || '0'} FCFA
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Agence:</span>
                          <span className="font-medium">
                            {proposal.agency?.name || proposal.agencyId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vol spécifique proposé */}
                {proposal.proposalDetails?.proposedVol && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Vol spécifiquement proposé par Agence
                    </h4>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">
                            {proposal.vols?.flight?.companyVol?.name || 'Vol proposé'}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>
                              <FontAwesomeIcon icon={faClock} className="mr-1" />
                              Départ: {formatTime(proposal.proposalDetails.proposedVol.departureTime)}
                            </span>
                            <span>
                              <FontAwesomeIcon icon={faCheckDouble} className="mr-1" />
                              Arrivée: {formatTime(proposal.proposalDetails.proposedVol.arrivalTime)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Référence vol</p>
                          <p className="font-mono font-bold">
                            #{proposal.proposalDetails.proposedVol.id || 'N/A'}
                          </p>
                           <p className="text-sm text-gray-500">Destination vers</p>
                          <p className="font-mono font-bold">
                            {proposal.proposalDetails.proposedVol.flight.destination.city || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Notes de l'agence avec animation combinée */}
{proposal.proposalDetails?.notes && (
  <div className="relative overflow-hidden rounded-2xl border-2 border-yellow-400">
    {/* Fond animé */}
    <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200 animate-gradient-x"></div>
    
    {/* Contenu */}
    <div className="relative bg-white/90 backdrop-blur-sm p-5 m-[2px] rounded-2xl">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <FontAwesomeIcon 
          icon={faInfoCircle} 
          className="text-yellow-600 animate-spin-slow" 
        />
        <span className="bg-yellow-100 px-3 py-1 rounded-full text-sm animate-pulse">
          Information importante
        </span>
      </h4>
      
      <div className="relative overflow-hidden">
        <style jsx>{`
          @keyframes slide {
            0% { transform: translateX(0); }
            20% { transform: translateX(0); }
            25% { transform: translateX(-100%); }
            45% { transform: translateX(-100%); }
            50% { transform: translateX(-200%); }
            70% { transform: translateX(-200%); }
            75% { transform: translateX(-300%); }
            95% { transform: translateX(-300%); }
            100% { transform: translateX(-400%); }
          }
          .animate-slide {
            animation: slide 20s linear infinite;
            width: max-content;
          }
          .animate-slide:hover {
            animation-play-state: paused;
          }
        `}</style>
        
        <div className="flex animate-slide gap-8">
          <div className="flex items-center gap-2 min-w-fit">
            <span className="text-yellow-600">⭐</span>
            <span className="text-gray-700 whitespace-nowrap font-medium">
              {proposal.proposalDetails.notes}
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-fit">
            <span className="text-yellow-600">⭐</span>
            <span className="text-gray-700 whitespace-nowrap font-medium">
              {proposal.proposalDetails.notes}
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-fit">
            <span className="text-yellow-600">⭐</span>
            <span className="text-gray-700 whitespace-nowrap font-medium">
              {proposal.proposalDetails.notes}
            </span>
          </div>
        </div>
      </div>
      
      {/* Texte complet (optionnel) */}
      <div className="mt-3 text-sm text-gray-600 border-t border-yellow-200 pt-3">
        <details>
          <summary className="cursor-pointer text-yellow-700 hover:text-yellow-800">
            Voir le message complet
          </summary>
          <p className="mt-2 text-gray-700 whitespace-pre-line">
            {proposal.proposalDetails.notes}
          </p>
        </details>
      </div>
    </div>
  </div>
)}
            {/* Notes de l'agence */}
            {proposal.proposalDetails?.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-yellow-600" />
                  Notes de l'agence
                </h4>
                <p className="text-gray-700 whitespace-pre-line">
                  {proposal.proposalDetails.notes}
                </p>
              </div>
            )}
          </div>

          {/* Colonne droite : Formulaire de réponse */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 sticky top-6">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                  Votre réponse
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Veuillez répondre dans les 48 heures
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <h3 className="font-semibold text-gray-900">Choisissez votre réponse</h3>
                  
                  {/* Option Accepter */}
                  <label className="flex items-start p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-500 transition-colors">
                    <input
                      type="radio"
                      name="accept"
                      value="true"
                      checked={response.accept === 'true'}
                      onChange={handleResponseChange}
                      className="mt-1 h-5 w-5 text-green-600 focus:ring-green-500"
                      required
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                        </div>
                        <span className="font-bold text-gray-900">Accepter la proposition</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Vous acceptez les termes et conditions de cette contre-proposition.
                      </p>
                    </div>
                  </label>

                  {/* Option Refuser */}
                  <label className="flex items-start p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-red-500 transition-colors">
                    <input
                      type="radio"
                      name="accept"
                      value="false"
                      checked={response.accept === 'false'}
                      onChange={handleResponseChange}
                      className="mt-1 h-5 w-5 text-red-600 focus:ring-red-500"
                      required
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <FontAwesomeIcon icon={faTimesCircle} className="text-red-600" />
                        </div>
                        <span className="font-bold text-gray-900">Refuser la proposition</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Vous déclinez cette contre-proposition.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Raison du refus */}
                {response.accept === 'false' && (
                  <div className="mb-6 animate-slideDown">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Raison du refus (optionnel)
                    </label>
                    <textarea
                      name="rejectionReason"
                      rows="4"
                      value={response.rejectionReason}
                      onChange={handleResponseChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-colors"
                      placeholder="Veuillez expliquer votre décision (ex: prix trop élevé, dates inappropriées...)"
                    />
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={submitting || response.accept === null || submitSuccess}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${
                      submitting || response.accept === null || submitSuccess
                        ? 'bg-gray-300 cursor-not-allowed'
                        : response.accept === 'true'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Envoi en cours...
                      </div>
                    ) : submitSuccess ? (
                      'Réponse envoyée !'
                    ) : response.accept === 'true' ? (
                      'Confirmer l\'acceptation'
                    ) : response.accept === 'false' ? (
                      'Confirmer le refus'
                    ) : (
                      'Sélectionnez une option'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Retour sans répondre
                  </button>
                </div>

                {/* Note informative */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-700">
                    <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                    Votre réponse sera transmise immédiatement à l'agence.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalResponse;
