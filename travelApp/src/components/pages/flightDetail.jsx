import { faArrowLeft, faBuilding, faClock, faExternalLinkAlt, faMapMarkerAlt, faMoneyBill, faPlane, faTicketAlt, faStar, faUsers, faShieldAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { flightService } from "../../services/flightService";

const FlightDetails = () => {
  const { flightId } = useParams();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  // Couleurs principales basées sur votre landing page
  const colors = {
    primary: '#0F172A', // Bleu foncé du header
    secondary: '#D97706', // Orange des boutons
    accent: '#F59E0B', // Orange clair
    background: '#F8FAFC', // Gris clair de fond
    text: '#1E293B', // Gris foncé pour le texte
    lightText: '#64748B' // Gris moyen
  };

  useEffect(() => {
    const fetchFlightDetails = async () => {
      try {
        const response = await flightService.getFlightDetails(flightId);
        console.log('resposeDetailVol', response);
        setFlight(response);
      } catch (err) {
        setError("Impossible de récupérer les détails du vol.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlightDetails();
  }, [flightId]);
     const handleReservation = () => {
    if (!isAuthenticated) {
      // Sauvegarder les détails du vol avant redirection
      localStorage.setItem('pendingReservation', JSON.stringify({
        flightId,
        flightData: flight,
        timestamp: new Date().toISOString()
      }));
      
      // Rediriger vers login avec l'état de retour
      navigate("/login", { 
        state: { 
          from: `/flights/${flightId}`,
          message: "Connectez-vous pour réserver ce vol"
        } 
      });
    } else {
      navigate(`/customer/reservations/new?flightId=${flightId}`);
    }
  };
 // const handleReservation = () => {
   // if (!isAuthenticated) {
     // navigate("/login");
    //} else {
      //navigate(`/reserve/${flightId}`);
  //  }
//  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <svg className="animate-spin h-16 w-16 mx-auto mb-4" style={{ color: colors.secondary }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
          </svg>
          <p style={{ color: colors.text }} className="text-lg font-semibold">Chargement des détails du vol...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <p className="text-red-500 text-xl font-semibold">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition duration-300"
            style={{ backgroundColor: colors.secondary }}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: colors.background }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-6xl mx-auto">
          {/* En-tête avec bouton retour */}
          <div className="p-6 border-b" style={{ borderColor: '#E2E8F0' }}>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 px-6 py-3 rounded-lg text-white font-semibold transition duration-300 hover:shadow-lg"
              style={{ backgroundColor: colors.primary }}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Retour aux vols
            </button>
          </div>

          {/* Contenu principal */}
          <div className="p-8">
            {/* Titre principal */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>
                <FontAwesomeIcon icon={faPlane} className="mr-3" style={{ color: colors.secondary }} />
                Détails du Vol
              </h1>
              <p className="text-lg" style={{ color: colors.lightText }}>
                Toutes les informations pour votre voyage
              </p>
            </div>

            {/* Grid des informations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Colonne gauche - Informations voyage */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 rounded-xl border" style={{ borderColor: '#F1F5F9' }}>
                  <h3 className="text-xl font-semibold mb-4 flex items-center" style={{ color: colors.primary }}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3" style={{ color: colors.secondary }} />
                    Informations du Trajet
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="font-medium" style={{ color: colors.text }}>De</span>
                      <span className="font-semibold" style={{ color: colors.primary }}>
                        {flight?.flight.origin?.city}
                      </span>
                    </div>
                    
                    <div className="flex justify-center">
                      <FontAwesomeIcon icon={faPlane} style={{ color: colors.secondary }} className="text-xl" />
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="font-medium" style={{ color: colors.text }}>Vers</span>
                      <span className="font-semibold" style={{ color: colors.primary }}>
                        {flight?.flight.destination?.city}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-white rounded-lg shadow-sm">
                    <p className="flex items-center gap-2" style={{ color: colors.text }}>
                      <FontAwesomeIcon icon={faClock} style={{ color: colors.secondary }} />
                      <strong>Type de voyage :</strong> 
                      <span style={{ color: colors.primary }}>
                        {flight?.reservation?.[0]?.tripType || "Aller simple"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Horaires */}
                <div className="bg-white p-6 rounded-xl border shadow-sm" style={{ borderColor: '#F1F5F9' }}>
                  <h3 className="text-xl font-semibold mb-4 flex items-center" style={{ color: colors.primary }}>
                    <FontAwesomeIcon icon={faClock} className="mr-3" style={{ color: colors.secondary }} />
                    Horaires
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: '#FFFBEB' }}>
                      <span style={{ color: colors.text }}>Départ</span>
                      <span className="font-semibold" style={{ color: colors.primary }}>
                        {new Date(flight?.departureTime).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: '#F0F9FF' }}>
                      <span style={{ color: colors.text }}>Arrivée</span>
                      <span className="font-semibold" style={{ color: colors.primary }}>
                        {new Date(flight?.arrivalTime).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne droite - Informations prix et compagnies */}
              <div className="space-y-6">
                {/* Prix */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border shadow-sm" style={{ borderColor: '#F1F5F9' }}>
                  <h3 className="text-xl font-semibold mb-4 flex items-center" style={{ color: colors.primary }}>
                    <FontAwesomeIcon icon={faMoneyBill} className="mr-3" style={{ color: colors.secondary }} />
                    Prix du Vol
                  </h3>
                  
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold mb-2" style={{ color: colors.secondary }}>
                      {flight?.price} Fcfa
                    </div>
                    <p className="text-sm" style={{ color: colors.lightText }}>
                      Prix TTC pour une personne
                    </p>
                  </div>
                </div>

                {/* Informations compagnies */}
                <div className="bg-white p-6 rounded-xl border shadow-sm" style={{ borderColor: '#F1F5F9' }}>
                  <h3 className="text-xl font-semibold mb-4 flex items-center" style={{ color: colors.primary }}>
                    <FontAwesomeIcon icon={faBuilding} className="mr-3" style={{ color: colors.secondary }} />
                    Informations Partenaires
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#F8FAFC' }}>
                      <FontAwesomeIcon icon={faUsers} style={{ color: colors.secondary }} />
                      <div>
                        <p className="font-medium" style={{ color: colors.text }}>Agence</p>
                        <p className="font-semibold" style={{ color: colors.primary }}>{flight?.agency?.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#F8FAFC' }}>
                      <FontAwesomeIcon icon={faShieldAlt} style={{ color: colors.secondary }} />
                      <div>
                        <p className="font-medium" style={{ color: colors.text }}>Compagnie</p>
                        <p className="font-semibold" style={{ color: colors.primary }}>{flight?.flight?.company?.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#F8FAFC' }}>
                      <FontAwesomeIcon icon={faExternalLinkAlt} style={{ color: colors.secondary }} />
                      <div>
                        <p className="font-medium" style={{ color: colors.text }}>Type de vol</p>
                        <p className="font-semibold" style={{ color: colors.primary }}>
                          {flight?.external ? "Vol externe 🌍" : "Vol local 🏠"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Offres similaires */}
            {flight?.similarOffers?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-2xl font-semibold mb-6 text-center" style={{ color: colors.primary }}>
                  <FontAwesomeIcon icon={faStar} className="mr-2" style={{ color: colors.accent }} />
                  Offres Similaires
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {flight.similarOffers.map((offer, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="text-center mb-3">
                        <p className="font-semibold text-lg" style={{ color: colors.primary }}>
                          {offer.destinationPlace}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="flex justify-between">
                          <span style={{ color: colors.lightText }}>Prix:</span>
                          <span className="font-semibold" style={{ color: colors.secondary }}>
                            {offer.price} Fcfa
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span style={{ color: colors.lightText }}>Départ:</span>
                          <span style={{ color: colors.text }}>
                            {new Date(offer.startDate).toLocaleDateString('fr-FR')}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bouton de réservation */}
            <div className="mt-12 text-center">
              <button
                onClick={handleReservation}
                className="inline-flex items-center gap-3 px-12 py-4 text-lg font-bold rounded-full text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                style={{ 
                  backgroundColor: colors.secondary,
                  background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})`
                }}
              >
                <FontAwesomeIcon icon={faTicketAlt} className="text-xl" />
                {isAuthenticated ? "Réserver ce vol" : "Se connecter pour réserver"}
              </button>
              
              {!isAuthenticated && (
                <p className="mt-3 text-sm" style={{ color: colors.lightText }}>
                  Connectez-vous pour finaliser votre réservation
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;
