import { faArrowLeft, faBuilding, faClock, faExternalLinkAlt, faMapMarkerAlt, faMoneyBill, faPlane, faTicketAlt } from "@fortawesome/free-solid-svg-icons";
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
  useEffect(() => {
    const fetchFlightDetails = async () => {
      try {
        const response = await flightService.getFlightDetails(flightId);
        console.log('resposeDetailVol',response)
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
      navigate("/login"); // Rediriger vers la page de connexion si non connecté
    } else {
      navigate(`/reserve/${flightId}`); // Aller vers la page de réservation
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg className="animate-spin h-16 w-16 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-4xl mx-auto">
          {/* Bouton Retour */}
        <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-600 transition duration-300"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Retour
      </button>
        {/* Titre */}
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faPlane} className="text-indigo-500" />
          Détails du vol
        </h2>

        {/* Détails du vol */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-4">
            <p className="text-gray-700 flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-indigo-500" />
              <strong>Destination :</strong> {flight?.destination?.city}, {flight?.destination?.country}
            </p>
            <p className="text-gray-700 flex items-center gap-2">
  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-indigo-500" />
  <strong>Trip Type :</strong> {flight?.reservation?.[0]?.tripType || "Non spécifié"}
</p>

            <p className="text-gray-700 flex items-center gap-2">
              <FontAwesomeIcon icon={faClock} className="text-indigo-500" />
              <strong>Départure :</strong> {new Date(flight?.departureTime).toLocaleString()}
              <strong>Arrival :</strong> {new Date(flight?.arrivalTime).toLocaleString()}
            </p>
            <p className="text-gray-700 flex items-center gap-2">
              <FontAwesomeIcon icon={faMoneyBill} className="text-indigo-500" />
              <strong>Prix :</strong> {flight?.price} Fcfa
            </p>
          </div>

          {/* Infos Compagnie */}
          <div className="space-y-4">
            <p className="text-gray-700 flex items-center gap-2">
              <FontAwesomeIcon icon={faBuilding} className="text-indigo-500" />
              <strong> Agency:</strong> {flight?.agency?.name}
            </p>
            <p className="text-gray-700 flex items-center gap-2">
              <FontAwesomeIcon icon={faExternalLinkAlt} className="text-indigo-500" />
              <strong>Type :</strong> {flight?.external ? "Vol externe" : "Vol local"}
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-gray-700 flex items-center gap-2">
              <FontAwesomeIcon icon={faBuilding} className="text-indigo-500" />
              <strong> Company:</strong> {flight?.flight?.name}
            </p>
            
          </div>
        </div>

        {/* Offres similaires */}
        {flight?.similarOffers?.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800">Offres similaires</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {flight.similarOffers.map((offer, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-md">
                  <p className="text-gray-700"><strong>Destination :</strong> {offer.destinationPlace}</p>
                  <p className="text-gray-700"><strong>Prix :</strong> {offer.price} €</p>
                  <p className="text-gray-700"><strong>Départ :</strong> {new Date(offer.startDate).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
          
        {/* Bouton Réserver */}
<div className="mt-6 flex justify-center">
  <button
    onClick={handleReservation}
    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 text-sm font-semibold rounded-full shadow-md hover:bg-green-600 hover:scale-105 transition-transform duration-300"
  >
    <FontAwesomeIcon icon={faTicketAlt} className="text-lg" />
    Réserver ce vol
  </button>
</div>

      </div>
    </div>
  );
};

export default FlightDetails;
