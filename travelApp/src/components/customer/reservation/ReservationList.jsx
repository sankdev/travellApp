import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faPaperPlane,
  faArrowLeft,
  faList,
  faExchangeAlt,
  faCheckCircle,
  faTimesCircle,
  faCheckDouble,
  faEye,
  faFileAlt,
  faCalendarAlt,
  faMapMarkerAlt,
  faUsers,
  faPlane,
  faBuilding,
  faInfoCircle,
  faChevronRight,
  faFileContract,
  faHourglassHalf,
  faBars
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
    if (!destinations.length) return { country: 'Inconnu', city: 'Inconnu', name: 'Inconnu' };
    const destination = destinations.find(item => item.id === parseInt(id));
    return destination || { country: 'Inconnu', city: 'Inconnu', name: 'Inconnu' };
  };

  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'demand':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: faPaperPlane,
          label: 'Demande envoyée',
          description: 'Votre demande est en attente de réponse de l\'agence',
          mobileColor: 'border-l-4 border-blue-500'
        };
      case 'counter_proposal':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: faExchangeAlt,
          label: 'Contre-proposition',
          description: 'L\'agence a fait une contre-proposition. À vous de répondre!',
          mobileColor: 'border-l-4 border-purple-500'
        };
      case 'accepted':
        return {
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: faCheckCircle,
          label: 'Acceptée',
          description: 'Vous avez accepté la proposition. Paiement en attente.',
          mobileColor: 'border-l-4 border-green-500'
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: faClock,
          label: 'En attente',
          description: 'Réservation en cours de traitement',
          mobileColor: 'border-l-4 border-yellow-500'
        };
      case 'confirmed':
        return {
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: faCheckDouble,
          label: 'Confirmée',
          description: 'Réservation confirmée et payée',
          mobileColor: 'border-l-4 border-emerald-500'
        };
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: faTimesCircle,
          label: 'Refusée',
          description: 'Demande refusée par l\'agence',
          mobileColor: 'border-l-4 border-red-500'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: faInfoCircle,
          label: status || 'Inconnu',
          description: 'Statut non défini',
          mobileColor: 'border-l-4 border-gray-500'
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

  const formatMobileDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Version mobile simplifiée de la timeline
  const MobileTimeline = ({ reservation }) => {
    const status = reservation.status?.toLowerCase();
    const statusConfig = getStatusConfig(status);
    
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${
          status === 'confirmed' ? 'bg-emerald-500' :
          status === 'accepted' ? 'bg-green-500' :
          status === 'counter_proposal' ? 'bg-purple-500' :
          status === 'demand' ? 'bg-blue-500' :
          status === 'pending' ? 'bg-yellow-500' :
          status === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
        }`} />
        <span className="text-gray-600">Statut actuel:</span>
        <span className="font-medium truncate">{statusConfig.label}</span>
      </div>
    );
  };

  // Composant de Timeline desktop
  const DesktopTimeline = ({ reservation }) => {
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
      <div className="hidden md:flex items-center justify-between px-2 py-1">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header responsive */}
      <div className="sticky top-0 z-10 bg-white shadow-sm p-4 md:p-6">
        {/* Boutons de navigation responsives */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => navigate('/customer/reservations/campaign')}
            className="px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 md:gap-2 text-sm md:text-base flex-1 md:flex-initial justify-center"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3 md:w-4 md:h-4" />
            <span className="truncate">Campagne</span>
          </button>
          
          <button
            onClick={() => navigate('/customer/reservations/demande')}
            className="px-3 md:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1 md:gap-2 text-sm md:text-base flex-1 md:flex-initial justify-center"
          >
            <FontAwesomeIcon icon={faList} className="w-3 h-3 md:w-4 md:h-4" />
            <span className="truncate">Demande</span>
          </button>
          
          <button
            onClick={() => navigate('/customer/reservations/create')}
            className="px-3 md:px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1 md:gap-2 text-sm md:text-base flex-1 md:flex-initial justify-center"
          >
            <FontAwesomeIcon icon={faFileAlt} className="w-3 h-3 md:w-4 md:h-4" />
            <span className="truncate">Nouvelle</span>
          </button>

          {/* Menu mobile pour plus d'options (optionnel) */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 bg-gray-100 rounded-lg"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>

        {/* Titre et description - cachés sur mobile pour économiser l'espace */}
        <div className="hidden md:block">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <FontAwesomeIcon icon={faPlane} className="text-white w-6 h-6" />
            </div>
            Mes Demandes de Réservation
          </h1>
          <p className="text-gray-600 mt-2">Suivez l'état de vos demandes et répondez aux contre-propositions</p>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Cartes de statistiques - version compacte sur mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-3 md:p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">Total</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FontAwesomeIcon icon={faFileContract} className="text-blue-500 text-base md:text-xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-3 md:p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">Contre-props</p>
                <p className="text-lg md:text-2xl font-bold text-purple-600">{stats.counter_proposal}</p>
              </div>
              <FontAwesomeIcon icon={faExchangeAlt} className="text-purple-500 text-base md:text-xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-3 md:p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">Acceptées</p>
                <p className="text-lg md:text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-base md:text-xl" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg md:rounded-xl shadow-sm p-3 md:p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">En attente</p>
                <p className="text-lg md:text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <FontAwesomeIcon icon={faClock} className="text-yellow-500 text-base md:text-xl" />
            </div>
          </div>
        </div>

        {/* Filtres - scroll horizontal sur mobile */}
        <div className="bg-white rounded-xl shadow-md mb-6 p-3 md:p-4">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 md:flex-wrap md:overflow-visible scrollbar-hide">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm md:text-base ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Toutes
            </button>
            <button
              onClick={() => setActiveFilter('counter_proposal')}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all flex items-center gap-1 md:gap-2 whitespace-nowrap text-sm md:text-base ${activeFilter === 'counter_proposal' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <FontAwesomeIcon icon={faExchangeAlt} className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Contre-propositions</span>
              <span className="md:hidden">Props</span>
              <span className="text-xs md:text-sm">({stats.counter_proposal})</span>
            </button>
            <button
              onClick={() => setActiveFilter('demand')}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm md:text-base ${activeFilter === 'demand' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Demandes ({stats.demand})
            </button>
            <button
              onClick={() => setActiveFilter('accepted')}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm md:text-base ${activeFilter === 'accepted' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Acceptées ({stats.accepted})
            </button>
          </div>
        </div>

        {/* Liste des réservations */}
        <div className="space-y-4 md:space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 md:p-4 rounded-lg text-sm md:text-base">
              {error}
            </div>
          )}

          {filteredReservations.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faInfoCircle} className="text-gray-400 text-2xl md:text-3xl" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                {activeFilter === 'all' ? 'Aucune réservation' : `Aucune réservation avec le statut "${activeFilter}"`}
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-6">Créez votre première demande de réservation</p>
              <Link
                to="/customer/reservations/create"
                className="inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-3 bg-blue-600 text-white text-sm md:text-base font-medium rounded-lg hover:bg-blue-700"
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
                <div key={reservation.id} className={`bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:border-blue-300 transition-all ${statusConfig.mobileColor} md:border-l-0`}>
                  {/* Version mobile */}
                  <div className="md:hidden">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.color} border`}>
                          <FontAwesomeIcon icon={statusConfig.icon} className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {reservation.totalPrice?.toLocaleString() || 'N/A'} FCFA
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-gray-500">ID: #{reservation.id}</div>
                        <MobileTimeline reservation={reservation} />
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-600 w-3 h-3" />
                          </div>
                          <span className="text-sm truncate">{startDest.city}, {startDest.country}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600 w-3 h-3" />
                          </div>
                          <span className="text-sm truncate">{endDest.city}, {endDest.country}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                          <span>{formatMobileDate(reservation.startAt)} - {formatMobileDate(reservation.endAt)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/customer/reservations/${reservation.id}`}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                        >
                          <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                          Détails
                        </Link>
                        
                        {reservation.status?.toLowerCase() === 'counter_proposal' && (
                          <Link
                            to={`/customer/proposal/${reservation.id}`}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm hover:from-green-700 hover:to-emerald-700"
                          >
                            <FontAwesomeIcon icon={faExchangeAlt} className="w-3 h-3" />
                            Répondre
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                      Créée le {formatMobileDate(reservation.createdAt)}
                    </div>
                  </div>

                  {/* Version desktop (inchangée) */}
                  <div className="hidden md:block">
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
                      
                      <div className="mt-4">
                        <DesktopTimeline reservation={reservation} />
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            
                            <div className="mt-4 space-y-2">
                              <Link
                                to={`/customer/reservations/${reservation.id}`}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                <FontAwesomeIcon icon={faEye} />
                                Voir les détails
                              </Link>
                              
                              {reservation.status?.toLowerCase() === 'counter_proposal' && (
                                <>
                                  <Link
                                    to={`/customer/proposal/${reservation.id}`}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md"
                                  >
                                    <FontAwesomeIcon icon={faExchangeAlt} />
                                    Répondre à la proposition
                                  </Link>
                                  
                                  <div className="text-xs text-center text-purple-600 bg-purple-50 p-2 rounded-lg border border-purple-200">
                                    <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                                    Cliquez pour accepter ou refuser la contre-proposition
                                  </div>
                                </>
                              )}
                              
                              {(reservation.status?.toLowerCase() === 'demand' || reservation.status?.toLowerCase() === 'pending') && (
                                <div className="text-sm text-gray-500 p-2 bg-blue-50 rounded-lg">
                                  <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                                  En attente de réponse de l'agence
                                </div>
                              )}
                              
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
                </div>
              );
            })
          )}
        </div>

        {/* Pied de page informatif - caché sur mobile pour économiser l'espace */}
        <div className="hidden md:block mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
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

        {/* Version mobile du pied de page */}
        <div className="md:hidden mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-700">
            <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 mr-1" />
            Processus: Demande → Contre-proposition → Acceptation → Confirmation
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReservationList;
