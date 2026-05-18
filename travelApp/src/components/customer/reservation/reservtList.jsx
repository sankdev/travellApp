import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faPaperPlane,faArrowLeft,faList,
  faExchangeAlt,
  faCheckCircle,
  faTimesCircle,
  faCheckDouble,
  faEye,faFileAlt,
  faCalendarAlt,
  faMapMarkerAlt,
  faUsers,
  faPlane,
  faBuilding,
  faInfoCircle,
  faChevronRight,
  faFileContract,
  faHourglassHalf
} from '@fortawesome/free-solid-svg-icons';
import { reservationService } from '../../../services/reservationService';
import { destinationService } from '../../../services/destinationService';

const ReservationList = () => {
 const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [destinations, setDestinations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    demand: 0,
    counter_proposal: 0,
    accepted: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchReservations();
    fetchDestinations();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [reservations]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationService.getReservations();
      // Assurez-vous que l'API retourne bien les statuts demandés
      setReservations(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const response = await destinationService.getDestinations();
      setDestinations(response || []);
    } catch (err) {
      console.error('Failed to fetch destinations:', err);
    }
  };

  const calculateStats = () => {
    const newStats = {
      total: reservations.length,
      demand: 0,
      counter_proposal: 0,
      accepted: 0,
      pending: 0,
      confirmed: 0,
      rejected: 0
    };

    reservations.forEach(reservation => {
      const status = reservation.status?.toLowerCase();
      if (status && newStats.hasOwnProperty(status)) {
        newStats[status]++;
      }
    });

    setStats(newStats);
  };

  const getDestinationById = (id) => {
    if (!destinations.length) return { country: 'Unknown', city: 'Unknown', name: 'Unknown' };
    const destination = destinations.find(item => item.id === parseInt(id));
    return destination || { country: 'Unknown', city: 'Unknown', name: 'Unknown' };
  };

  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'demand':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: faPaperPlane,
          label: 'Demande envoyée',
          description: 'Votre demande est en attente de réponse de l\'agence'
        };
      case 'counter_proposal':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: faExchangeAlt,
          label: 'Contre-proposition',
          description: 'L\'agence a fait une contre-proposition. À vous de répondre!'
        };
      case 'accepted':
        return {
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: faCheckCircle,
          label: 'Acceptée',
          description: 'Vous avez accepté la proposition. Paiement en attente.'
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: faClock,
          label: 'En attente',
          description: 'Réservation en cours de traitement'
        };
      case 'confirmed':
        return {
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: faCheckDouble,
          label: 'Confirmée',
          description: 'Réservation confirmée et payée'
        };
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: faTimesCircle,
          label: 'Refusée',
          description: 'Demande refusée par l\'agence'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: faInfoCircle,
          label: status || 'Inconnu',
          description: 'Statut non défini'
        };
    }
  };

  const filteredReservations = activeFilter === 'all' 
    ? reservations 
    : reservations.filter(r => r.status?.toLowerCase() === activeFilter);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleAcceptProposal = async (reservationId) => {
    if (window.confirm('Acceptez-vous cette contre-proposition ? Cette action est définitive.')) {
      try {
        // À adapter selon votre API
        await reservationService.updateStatus(reservationId, 'accepted');
        fetchReservations();
      } catch (err) {
        setError('Failed to accept proposal');
      }
    }
  };

  const handleRejectProposal = async (reservationId) => {
    const reason = window.prompt('Raison du refus (optionnel):');
    try {
      // À adapter selon votre API
      await reservationService.updateStatus(reservationId, 'rejected', { reason });
      fetchReservations();
    } catch (err) {
      setError('Failed to reject proposal');
    }
  };

  // Composant de Timeline pour une réservation
  const ReservationTimeline = ({ reservation }) => {
    const steps = [
      { status: 'pending', label: 'Créée', icon: faHourglassHalf },
      { status: 'demand', label: 'Demandée', icon: faPaperPlane },
      { status: 'counter_proposal', label: 'Contre-proposée', icon: faExchangeAlt },
      { status: 'accepted', label: 'Acceptée', icon: faCheckCircle },
      { status: 'confirmed', label: 'Confirmée', icon: faCheckDouble }
    ];

    const currentStatus = reservation.status?.toLowerCase();
    const currentIndex = steps.findIndex(s => s.status === currentStatus);

    return (
      <div className="flex items-center justify-between px-2 py-1">
        {steps.map((step, index) => (
          <React.Fragment key={step.status}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentIndex 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-400'
              }`}>
                <FontAwesomeIcon icon={step.icon} className="w-4 h-4" />
              </div>
              <span className="text-xs mt-1 text-gray-600">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 ${
                index < currentIndex ? 'bg-blue-500' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header avec statistiques */}
      <div className="mb-8">
       <div className="flex flex-wrap gap-3 mb-4 p-4 bg-white rounded-xl shadow-sm">
    <button
      onClick={() => navigate('/customer/reservations/campaign')}
      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
    >
      <FontAwesomeIcon icon={faArrowLeft} />
      Reservation Campaign
    </button>
    
    <button
      onClick={() => navigate('/customer/reservations/demande')}
      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
    >
      <FontAwesomeIcon icon={faList} />
      Faire Demande
    </button>
     <button
      onClick={() => navigate('/customer/reservations/create')}
      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
    >
      <FontAwesomeIcon icon={faFileAlt} />
      Nouvelle Reservation
    </button>
    </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <FontAwesomeIcon icon={faPlane} className="text-white w-6 h-6" />
              </div>
              Mes Demandes de Réservation
            </h1>
            <p className="text-gray-600 mt-2">Suivez l'état de vos demandes et répondez aux contre-propositions</p>
          </div>
          
          

        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FontAwesomeIcon icon={faFileContract} className="text-blue-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contre-propositions</p>
                <p className="text-2xl font-bold text-purple-600">{stats.counter_proposal}</p>
              </div>
              <FontAwesomeIcon icon={faExchangeAlt} className="text-purple-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acceptées</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <FontAwesomeIcon icon={faClock} className="text-yellow-500 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-md mb-6 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Toutes
          </button>
          <button
            onClick={() => setActiveFilter('counter_proposal')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeFilter === 'counter_proposal' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={faExchangeAlt} />
            Contre-propositions ({stats.counter_proposal})
          </button>
          <button
            onClick={() => setActiveFilter('demand')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === 'demand' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Demandes envoyées ({stats.demand})
          </button>
          <button
            onClick={() => setActiveFilter('accepted')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === 'accepted' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Acceptées ({stats.accepted})
          </button>
        </div>
      </div>

      {/* Liste des réservations */}
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {filteredReservations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faInfoCircle} className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeFilter === 'all' ? 'Aucune réservation' : `Aucune réservation avec le statut "${activeFilter}"`}
            </h3>
            <p className="text-gray-600 mb-6">Créez votre première demande de réservation</p>
            <Link
              to="/customer/reservations/create"
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
              Nouvelle Demande
            </Link>
          </div>
        ) : (
          filteredReservations.map(reservation => {
            const statusConfig = getStatusConfig(reservation.status);
            const startDest = getDestinationById(reservation.startDestinationId);
            const endDest = getDestinationById(reservation.endDestinationId);
            
            return (
              <div key={reservation.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:border-blue-300 transition-all">
                {/* En-tête avec statut et timeline */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${statusConfig.color} border`}>
                          <FontAwesomeIcon icon={statusConfig.icon} />
                          {statusConfig.label}
                        </span>
                        <span className="text-sm text-gray-500">ID: #{reservation.id}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{statusConfig.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900">
                        {reservation.totalPrice?.toLocaleString() || 'N/A'} FCFA
                      </span>
                    </div>
                  </div>
                  
                  {/* Timeline */}
                  <div className="mt-4">
                    <ReservationTimeline reservation={reservation} />
                  </div>
                </div>

                {/* Corps de la carte */}
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Itinéraire */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
                        Itinéraire
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faPlane} className="text-blue-600 w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{startDest.city}, {startDest.country}</p>
                            <p className="text-sm text-gray-500">Départ</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-center">
                          <FontAwesomeIcon icon={faChevronRight} className="text-gray-400" />
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600 w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{endDest.city}, {endDest.country}</p>
                            <p className="text-sm text-gray-500">Destination</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dates et Détails */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-500" />
                        Dates
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Départ:</span>
                          <span className="font-medium">{formatDate(reservation.startAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Retour:</span>
                          <span className="font-medium">{formatDate(reservation.endAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">{reservation.tripType || 'One-way'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Passagers et Actions */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUsers} className="text-orange-500" />
                        Détails
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faUsers} className="text-gray-400" />
                          <span>{reservation.passengers?.length || 0} passager(s)</span>
                        </div>
                        
                        {/* Actions contextuelles selon le statut */}
                        <div className="mt-4 space-y-2">
                          {/* TOUJOURS visible : Voir les détails */}
                          <Link
                            to={`/customer/reservations/${reservation.id}`}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <FontAwesomeIcon icon={faEye} />
                            Voir les détails
                          </Link>
                          
                          {/* Visible uniquement pour counter_proposal */}
                           {/* Visible uniquement pour counter_proposal - LIEN vers la page de réponse */}
  {reservation.status?.toLowerCase() === 'counter_proposal' && (
    <>
      <Link
        to={`/customer/proposal/${reservation.id}`}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md"
      >
        <FontAwesomeIcon icon={faExchangeAlt} />
        Répondre à la proposition
      </Link>
      
      {/* Optionnel : Indicateur visuel */}
      <div className="text-xs text-center text-purple-600 bg-purple-50 p-2 rounded-lg border border-purple-200">
        <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
        Cliquez pour accepter ou refuser la contre-proposition
      </div>
    </>
  )}
                          
                          {/* Visible pour 'demand' et 'pending' */}
                          {(reservation.status?.toLowerCase() === 'demand' || reservation.status?.toLowerCase() === 'pending') && (
                            <div className="text-sm text-gray-500 p-2 bg-blue-50 rounded-lg">
                              <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                              En attente de réponse de l'agence
                            </div>
                          )}
                          
                          {/* Visible pour 'accepted' */}
                          {reservation.status?.toLowerCase() === 'accepted' && (
                            <div className="text-sm text-green-700 p-2 bg-green-50 rounded-lg">
                              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                              En attente de confirmation de paiement
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer avec dates de création */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-500">
                  <div className="flex justify-between items-center">
                    <span>
                      Créée le {formatDate(reservation.createdAt)}
                    </span>
                    {reservation.proposalDetails && (
                      <span className="text-purple-600 font-medium">
                        Contre-proposition reçue le {formatDate(reservation.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pied de page informatif */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 text-xl" />
          <div>
            <h4 className="font-semibold text-gray-900">Comment fonctionne le processus ?</h4>
            <ul className="text-sm text-gray-600 mt-1 space-y-1">
              <li>1. <strong>Demande</strong> : Vous soumettez votre demande à l'agence</li>
              <li>2. <strong>Contre-proposition</strong> : L'agence vous fait une proposition adaptée</li>
              <li>3. <strong>Acceptation</strong> : Vous acceptez la proposition</li>
              <li>4. <strong>Confirmation</strong> : Après paiement, votre réservation est confirmée</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationList;
