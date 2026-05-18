import React, { useState } from 'react';

const FlightList = ({ flights }) => {
  const [visibleFlights, setVisibleFlights] = useState(6); // Affiche 6 vols initialement
  const flightsPerPage = 6; // Nombre de vols à ajouter à chaque clic
   console.log('flights list a Corrige',flights)
  const calculateFlightDuration = (departure, arrival) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diff = arr - dep;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLoadMore = () => {
    setVisibleFlights(prev => prev + flightsPerPage);
  };

  const displayedFlights = flights.slice(0, visibleFlights);

  return (
    <section className="py-12 bg-[#0F172A]">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Liste des vols disponibles
          </h2>
          <p className="text-gray-300">
            {flights.length} vols trouvés • {displayedFlights.length} affichés
          </p>
        </div>

        {/* Liste des vols */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedFlights.map((flight) => (
            <div
              key={flight.id || `${flight.flight?.id}-${flight.departureTime}`}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* En-tête de la carte */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {flight.flight?.origin?.city || 'Non spécifié'} → {flight.flight?.destination?.city || 'Non spécifié'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {flight.flight?.name || 'Vol sans nom'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-[#F97316]">
                      {flight.price ? `${flight.price.toFixed(0)} Fcfa` : 'Prix non disponible'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">par personne</p>
                  </div>
                </div>

                {/* Compagnie et agence */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    {flight.flight?.companyVol?.logo ? (
                      <img 
                        src={flight.flight.companyVol.logo} 
                        alt={flight.flight.companyVol.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">
                          {flight.flight?.company?.name?.charAt(0) || 'V'}
                        </span>
                      </div>
                    )}
                    <span className="font-medium text-gray-700">
                      {flight.flight?.company?.name || 'Compagnie inconnue'}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {flight.agency?.name || 'Agence'}
                  </span>
                </div>
              </div>

              {/* Détails du vol */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Départ</div>
                    <div className="font-bold text-gray-900">{formatTime(flight.departureTime)}</div>
                    <div className="text-sm text-gray-600">{flight.flight?.origin?.city}</div>
                    <div className="text-xs text-gray-500">{formatDate(flight.departureTime)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Arrivée</div>
                    <div className="font-bold text-gray-900">{formatTime(flight.arrivalTime)}</div>
                    <div className="text-sm text-gray-600">{flight.flight?.destination?.city}</div>
                    <div className="text-xs text-gray-500">{formatDate(flight.arrivalTime)}</div>
                  </div>
                </div>

                {/* Durée et statut */}
                <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                  <div>
                    <div className="text-xs text-gray-500">Durée</div>
                    <div className="font-medium text-gray-900">
                      {calculateFlightDuration(flight.departureTime, flight.arrivalTime)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Statut</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      flight.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {flight.status === 'active' ? 'Disponible' : 'Indisponible'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bouton d'action */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => {
                      const classId = flight.classes?.[0]?.id;
                      if (classId) {
                        window.location.href = `/flights/${classId}`;
                      } else {
                        alert("Aucune classe disponible pour ce vol");
                      }
                    }}

                  className="w-full py-3 bg-[#F97316] text-white rounded-lg font-semibold hover:bg-orange-600 transition duration-300"
                >
                  Réserver maintenant
                </button>
                <button
                  onClick={() => console.log('Détails du vol:', flight)}
                  className="w-full mt-3 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition duration-300"
                >
                  Voir les détails
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bouton Voir plus */}
        {visibleFlights < flights.length && (
          <div className="mt-10 text-center">
            <button
              onClick={handleLoadMore}
              className="px-8 py-3 bg-white text-[#0D1426] font-semibold rounded-lg hover:bg-gray-100 transition duration-300 shadow-md"
            >
              Voir plus de vols ({flights.length - visibleFlights} restants)
            </button>
            <p className="text-gray-400 text-sm mt-3">
              Affichage de {displayedFlights.length} sur {flights.length} vols
            </p>
          </div>
        )}

        {/* Message si tous les vols sont affichés */}
        {visibleFlights >= flights.length && flights.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-300 font-medium">
              ✅ Tous les vols sont affichés ({flights.length} vols)
            </p>
          </div>
        )}

        {/* Message si aucun vol */}
        {flights.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Aucun vol disponible
            </h3>
            <p className="text-gray-400">
              Aucun vol ne correspond à vos critères de recherche.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FlightList;
