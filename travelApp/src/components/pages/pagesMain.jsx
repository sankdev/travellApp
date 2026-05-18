import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faBuilding,faPlane, faCalendar,faMapMarkerAlt,
 faArrowRight, faCalendarAlt, faChevronLeft, faChevronRight, faExternalLinkAlt, faMapPin,faPhone, faEnvelope, faSearch, faStar, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agencyService } from '../../services/agencyService';
import { compaignService } from '../../services/compaignService';
import { destinationService } from '../../services/destinationService';
import { flightService } from '../../services/flightService';
import { formatDate } from '../../utils/formatters';
import SearchFlight from '../agency/flightSearchCompo';
import UserLogin from '../users/UserLogin';
import Header from './Header';
import FlightList from './FlightList'
export function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isFlightSearchOpen, setIsFlightSearchOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    originId: undefined,
    destinationId: undefined,
    startDate: '',
    endDate: '',
    passengers: 1,
    class: "economy"
  });

   const navigate = useNavigate();
  const [placeSearchResults, setPlaceSearchResults] = useState({ origin: [], destination: [] });
  const [searchResults, setSearchResults] = useState(null);
  const [filters, setFilters] = useState({
    maxPrice: Infinity,
    minRating: 0,
    showExternal: true,
    showLocal: true,
    agencies: [], // Ensure agencies is defined
    destinations: [] // Ensure destinations is defined
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [flights, setFlights] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState(''); 
  // États pour les valeurs textuelles des champs de recherche
const [inputValues, setInputValues] = useState({
  origin: '',
  destination: ''
});

 console.log('campaigns',campaigns)
  const searchPlaces = async (query, type) => {
    if (query.length < 2) return;
    try {
      const response = await flightService.searchPlaces(query);
      setPlaceSearchResults((prev) => ({ ...prev, [type]: response.places }));
    } catch (err) {
      console.error("Erreur lors de la recherche :", err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchParams.originId || !searchParams.destinationId || !searchParams.startDate) {
      setError("Veuillez remplir tous les champs requis.");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      console.log("Données envoyées à l'API :", searchParams);
      const results = await flightService.searchFlights({
        originPlace: searchParams.originId,
        destinationPlace: searchParams.destinationId,
        startDate: searchParams.startDate,
        endDate: searchParams.endDate,
        passengers: searchParams.passengers,
        class: searchParams.class
      });
      setSearchResults(results);
    } catch (err) {
      setError("Erreur lors de la recherche des vols.");
    } finally {
      setLoading(false);
    }
  };
  console.log('searchResult',searchResults)
 
  const filterFlights = (flights) => {
    console.log('Flight',flights) 
   return flights?.filter((flight) => {
      if (!filters.showExternal && flight.external) return false;
      if (!filters.showLocal && !flight.external) return false;
      if (flight.prix > filters.maxPrice) return false;
      if (flight.agency?.rating && flight.agency.rating < filters.minRating) return false;
      return true;
    });
  };
  console.log('searchResults',searchResults)
  const handlePlaceSelect = useCallback(
  (type, place) => {
    // 1. Mettre à jour l'ID dans searchParams
    setSearchParams((prev) => ({ ...prev, [`${type}Id`]: place.id }));
    
    // 2. Mettre à jour la valeur textuelle de l'input
    const displayText = `${place.name}, ${place.city}${place.country ? `, ${place.country}` : ''}`;
    setInputValues((prev) => ({ ...prev, [type]: displayText }));
    
    // 3. Vider les résultats de recherche pour ce champ
    setPlaceSearchResults((prev) => ({ ...prev, [type]: [] }));
  },
  [setSearchParams, setPlaceSearchResults, setInputValues]
);
  
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const result = await destinationService.getDestinations();
        setDestinations(result);
      } catch (error) {
        console.error('Failed to fetch destinations:', error);
      }
    };

    const fetchFlights = async () => {
      try {
        const searchParams = { 
          destinationPlace: selectedDestination,
          originPlace: selectedOrigin
        };
        const result = await flightService.searchFlights(searchParams);
        console.log('rechercheFlight',result)
        setFlights(result.flights);
      } catch (error) {
        console.error('Failed to fetch flights:', error);
      }
    };
  console.log('flights',flights)
    const fetchAgencies = async () => {
      try {
        const result = await agencyService.getAgencies();
        setAgencies(Array.isArray(result.data) ? result.data : result.data || []);
        console.log('agencies',result.data)   
   } catch (error) {
        console.error('Failed to fetch agencies:', error);
      }
    };

    const fetchCampaigns = async () => {
      try {
        const result = await compaignService.getActiveCampaigns();
        console.log('resultActive Campaign',result)
        setCampaigns(result);
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
      }
    };

    if (selectedDestination && selectedOrigin) {
      fetchFlights();
    }
    fetchDestinations();
    fetchAgencies();
    fetchCampaigns();
  }, [selectedDestination, selectedOrigin]);

  const filteredFlights = useMemo(() => 
    flights?.filter(flight => 
      selectedDestination ? flight.destinationId === selectedDestination : true
    ), [flights, selectedDestination]);

  const filteredAgencies = useMemo(() => 
    agencies?.filter(agency => 
      agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agency.location.toLowerCase().includes(searchQuery.toLowerCase())
    ), [agencies, searchQuery]);

  return (
  <div className="min-h-screen bg-gray-200">
    <Header isLoginOpen={isLoginOpen} setIsLoginOpen={setIsLoginOpen} setIsFlightSearchOpen={setIsFlightSearchOpen} />
    {isLoginOpen && (
      <Modal>
        <UserLogin onClose={() => setIsLoginOpen(false)} />
      </Modal>
    )}
    {isFlightSearchOpen && (
      <Modal onClose={() => setIsFlightSearchOpen(false)}>
        <SearchFlight />
      </Modal>
    )}
    <HeroSection 
      handleSearch={handleSearch} 
      searchParams={searchParams} 
      setSearchParams={setSearchParams} 
      placeSearchResults={placeSearchResults} 
      searchPlaces={searchPlaces}
      inputValues={inputValues}  // ← Nouveau prop
  setInputValues={setInputValues} 
       setPlaceSearchResults={setPlaceSearchResults} 
    />
    <div className="mt-5">
      <AvailableFlights searchResults={searchResults} filters={filters} setFilters={setFilters} filterFlights={filterFlights} />
      
      {/* Ajouter l'ID agencies */}
      <section id="agencies">
        <FeaturedAgencies filteredAgencies={filteredAgencies} />
      </section>
      
      {/* Ajouter l'ID campaigns */}
      <section id="campaigns">
        <SpecialCampaigns campaigns={campaigns} />
      </section>
      
      <Footer />
    </div>
  </div>
);
};
const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-100 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
      {children}
      
    </div>
  </div>
);

const PlaceResultsList = ({ results, onSelect }) => (
  results.length > 0 && (
    <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
      {results.map((place) => (
        <div
          key={place.id}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
          onClick={() => onSelect(place)}
        >
          <span className="flex-1">
            {place.name}, {place.city}
            <span className="text-sm text-gray-500 ml-1">{place.country}</span>
          </span>
          {place.source === "external" && (
            <FontAwesomeIcon icon={faExternalLinkAlt} className="w-4 h-4 text-gray-400" />
          )}
        </div>
      ))}
    </div>
  )
);
      const HeroSection = ({
  handleSearch,
  searchParams,
  setSearchParams,
  placeSearchResults,
  searchPlaces,
  setPlaceSearchResults, inputValues,  
  setInputValues  
}) => {
  const handleInputChange = (type, value) => {
    // Mettre à jour la valeur textuelle
    setInputValues(prev => ({ ...prev, [type]: value }));
    
    // Effectuer la recherche des lieux
    if (value.length >= 2) {
      searchPlaces(value, type);
    } else {
      // Vider les résultats si moins de 2 caractères
      setPlaceSearchResults(prev => ({ ...prev, [type]: [] }));
    }
  };
  
  const handlePlaceSelect = useCallback(
  (type, place) => {
    // 1. Mettre à jour l'ID dans searchParams
    setSearchParams((prev) => ({ ...prev, [`${type}Id`]: place.id }));
    
    // 2. Mettre à jour la valeur textuelle de l'input
    const displayText = `${place.name}, ${place.city}${place.country ? `, ${place.country}` : ''}`;
    setInputValues((prev) => ({ ...prev, [type]: displayText }));
    
    // 3. Vider les résultats de recherche pour ce champ
    setPlaceSearchResults((prev) => ({ ...prev, [type]: [] }));
  },
  [setSearchParams, setPlaceSearchResults, setInputValues]
);

  return (
    <section
      className="relative min-h-[500px] flex items-center justify-center py-12"
      style={{
        backgroundImage: "url('/hero-plane.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Contenu */}
      <div className="relative z-10 container mx-auto px-4">
        {/* Titre principal centré */}
        <div className="text-center text-white mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            BIENVENU SUR TRAVEL AGENCIES
          </h1>
          <p className="text-base md:text-lg text-gray-100 max-w-2xl mx-auto">
            Votre partenaire de voyage de confiance, connectant les voyageurs aux meilleures agences et offres.
          </p>
        </div>

        {/* Formulaire de recherche transparent */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl  p-6 max-w-4xl mx-auto border border-white/10">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Ligne 1: Départ et Arrivée */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Départ */}
              <div className="relative">
                <label className="block text-sm font-semibold text-white mb-2">
                  Départ
                </label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faMapPin} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" 
                  />
                  <input
                    type="text"
                    placeholder="Ville de départ"
                    value={inputValues.origin} 
                     onChange={(e) => handleInputChange("origin", e.target.value)}
                    className="pl-10 pr-3 py-3 block w-full rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/70 focus:border-orange-400 focus:ring-2 focus:ring-orange-300 transition backdrop-blur-sm"
                  />
                </div>
                <PlaceResultsList
                  results={placeSearchResults.origin}
                  onSelect={(place) => handlePlaceSelect("origin", place)}
                />
              </div>

              {/* Arrivée */}
              <div className="relative">
                <label className="block text-sm font-semibold text-white mb-2">
                  Arrivée
                </label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faMapPin} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" 
                  />
                  <input
                    type="text"
                    placeholder="Ville d'arrivée"
                     value={inputValues.destination} 
                    onChange={(e) => handleInputChange("destination", e.target.value)}
                    className="pl-10 pr-3 py-3 block w-full rounded-lg border border-white/30 bg-white/20 text-white placeholder-white/70 focus:border-orange-400 focus:ring-2 focus:ring-orange-300 transition backdrop-blur-sm"
                  />
                </div>
                <PlaceResultsList
                  results={placeSearchResults.destination}
                  onSelect={(place) => handlePlaceSelect("destination", place)}
                />
              </div>
            </div>

            {/* Ligne 2: Dates et Passagers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Date de début */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Date de début
                </label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faCalendarAlt} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" 
                  />
                  <input
                    type="date"
                    onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
                    className="pl-10 pr-3 py-3 block w-full rounded-lg border border-white/30 bg-white/20 text-white placeholder-white/70 focus:border-orange-400 focus:ring-2 focus:ring-orange-300 transition backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Date de fin */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Date de fin
                </label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faCalendarAlt} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" 
                  />
                  <input
                    type="date"
                    onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
                    className="pl-10 pr-3 py-3 block w-full rounded-lg border border-white/30 bg-white/20 text-white placeholder-white/70 focus:border-orange-400 focus:ring-2 focus:ring-orange-300 transition backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Nombre de personnes */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Nombre de personne
                </label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faUsers} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" 
                  />
                  <input
                    type="number"
                    min="1"
                    value={searchParams.passengers || 1}
                    onChange={(e) => setSearchParams({ ...searchParams, passengers: parseInt(e.target.value) })}
                    className="pl-10 pr-3 py-3 block w-full rounded-lg border border-white/30 bg-white/20 text-white placeholder-white/70 focus:border-orange-400 focus:ring-2
                focus:ring-orange-300 transition backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* Bouton de recherche */}
            <div className="text-center pt-4">
              <button
                type="submit"
                className="px-8 py-4 rounded-xl text-white font-semibold bg-orange-500 hover:bg-orange-600 transition flex items-center gap-3 justify-center mx-auto shadow-lg hover:shadow-xl"
              >
                <FontAwesomeIcon icon={faSearch} /> 
                <span>Rechercher</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

const AvailableFlights = ({ searchResults, filters, setFilters, filterFlights }) => {
  const scrollRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showFlightList, setShowFlightList] = useState(false);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });

      setIsScrolling(true);
      setTimeout(() => setIsScrolling(false), 800);
    }
  };

  const calculateFlightDuration = (departure, arrival) => {
    if (!departure || !arrival) return "N/A";
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diff = arr - dep;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Filtrer les vols
  const flights = searchResults?.data?.flights ? filterFlights(searchResults.data.flights) : [];

  return (
    <section className="py-16 bg-[#0F172A] relative">
      <div className="container mx-auto px-4">
        {/* Titre */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 text-center">
          Vols disponibles
        </h2>

        {flights.length > 0 && (
          <div className="relative group">
            {/* Bouton gauche */}
            <button
              onClick={() => scroll("left")}
              className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white text-gray-700 p-3 rounded-full shadow-md z-10
              transition-all duration-300
              ${isScrolling ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              aria-label="Scroll left"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
            </button>

            {/* Carrousel */}
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide px-2"
            >
              {flights.slice(0, 10).map((flight) => ( // Limiter à 10 dans le carrousel
                <div
                  key={flight.id}
                  className="min-w-[280px] md:min-w-[320px] bg-white rounded-lg shadow-md hover:shadow-lg transition snap-center p-6 flex flex-col justify-between"
                >
                  {/* Prix */}
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {flight?.flight?.origin?.city} - {flight?.flight?.destination?.city}
                    </h3>
                    <p className="text-3xl font-extrabold text-[#F97316]">
                      {flight.price ? `${flight.price.toFixed(0)} Fcfa` : "N/A"}
                    </p>
                  </div>

                  {/* Infos */}
                  <ul className="text-sm text-gray-600 mb-4 space-y-1">
                    <li>
                      <span className="font-semibold">Départ :</span>{" "}
                      {flight?.flight?.origin?.city}
                    </li>
                    <li>
                      <span className="font-semibold">Arrivée :</span>{" "}
                      {flight?.flight?.destination?.city}
                    </li>
                    <li>
                      <span className="font-semibold">Durée :</span>{" "}
                      {calculateFlightDuration(flight.departureTime, flight.arrivalTime)}
                    </li>
                    <li>
                      <span className="font-semibold">Heure départ :</span>{" "}
                      <span className="text-gray-800">
                        {new Date(flight.departureTime).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </li>
                    <li>
                      <span className="font-semibold">Heure arrivée :</span>{" "}
                      <span className="text-gray-800">
                        {new Date(flight.arrivalTime).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </li>
                  </ul>

                  {/* Bouton Commander */}
                  <button
                    onClick={() => {
                      const classId = flight.classes?.[0]?.id;
                      if (classId) {
                        window.location.href = `/flights/${classId}`;
                      } else {
                        alert("Aucune classe disponible pour ce vol");
                      }
                    }}
                    className="mt-auto w-full py-2 bg-[#F97316] text-white rounded-md font-semibold hover:bg-orange-600 transition"
                  >
                    Commander
                  </button>
                </div>
              ))}
            </div>

            {/* Bouton droit */}
            <button
              onClick={() => scroll("right")}
              className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white text-gray-700 p-3 rounded-full shadow-md z-10
              transition-all duration-300
              ${isScrolling ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              aria-label="Scroll right"
            >
              <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Message si aucun vol */}
        {flights.length === 0 && (
          <div className="text-center text-white py-10">
            <p className="text-xl">Aucun vol disponible pour le moment</p>
          </div>
        )}

        {/* Bouton Voir plus - affiché seulement s'il y a plus de 10 vols */}
        {flights.length > 3 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowFlightList(true)}
              className="px-5 py-2 rounded-md bg-white text-[#0D1426] hover:bg-gray-200 transition"
            >
              ➔ Voir plus ({flights.length - 10} vols supplémentaires)
            </button>
          </div>
        )}

        {/* Liste complète des vols */}
        {showFlightList && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Tous les vols disponibles</h3>
              <button
                onClick={() => setShowFlightList(false)}
                className="text-white hover:text-orange-400 transition"
              >
                ✕ Fermer
              </button>
            </div>
            <FlightList flights={flights} />
          </div>
        )}
      </div>
    </section>
  );
};
                             
const FeaturedAgencies = ({ filteredAgencies }) => {
  
  const navigate = useNavigate();
const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
  
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesomeIcon
          key={`full-${i}`}
          icon={faStar}
          className="text-yellow-400 w-4 h-4"
        />
      );
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FontAwesomeIcon
          key={`empty-${i}`}
          icon={faStar}
          className="text-gray-300 w-4 h-4"
        />
      );
    }
    return stars;
  };

  // Carrousel petits cards
  const smallCardSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 4000,
  responsive: [
    { 
      breakpoint: 1024, 
      settings: { 
        slidesToShow: 3,
        adaptiveHeight: true 
      } 
    },
    { 
      breakpoint: 768, 
      settings: { 
        slidesToShow: 2,
        adaptiveHeight: true 
      } 
    },
    { 
      breakpoint: 480, 
      settings: { 
        slidesToShow: 1,
        adaptiveHeight: true 
      } 
    },
  ],
};

  // Carrousel grandes agences avec bannière
  const bigCardSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [{ breakpoint: 1024, settings: { slidesToShow: 1 } }],
  };


  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Titre */}
         <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#0D1426] mb-2">
          Partenaires de voyage mondiaux
        </h2>
        <p className="text-gray-600 mb-6">
          Recommandé par les voyageurs du monde entier
        </p> </div>
             <div className="mb-10">
        {/* === Carrousel 1 : petites agences === */}
        <Slider {...smallCardSettings} >
          {filteredAgencies
    ?.filter((agency) => !agency.bannierUrl)
    .map((agency) => (
              <div key={agency.id} className="px-2">
                <div className="bg-white border rounded-lg shadow hover:shadow-lg p-4 flex flex-col h-full">
                  {/* Stars */}
                  <div className="flex items-center mb-2">
                    {renderRatingStars(agency.rating || 3)}
                  </div>
                    
                 {/* Infos */}
          <h3 className="text-lg font-bold text-[#0D1426] mb-1">
            {agency.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {agency.description || "Bon voyage pour la suite de vos trajets"}
          </p>

          {/* Logo à côté du numéro */}
          <div className="flex items-center mb-3">
            {/* Logo circulaire */}
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-100 flex-shrink-0 mr-3">
              <img
                src={agency.logo || "/agency-placeholder.jpg"}
                alt={agency.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/agency-placeholder.jpg";
                  e.target.classList.add("object-contain", "p-2");
                }}
              />
            </div>
            
            {/* Numéro de téléphone */}
            <p className="text-sm text-gray-500">
              📞 {agency.phone1 || "-"}
            </p>
          </div>

          {/* Localisation */}
          <p className="text-sm text-[#F97316] font-semibold mb-4 flex items-center">
            <span className="mr-2">📍</span> 
            {agency.location || "Bamako, Mali"}
          </p>

          {/* Bouton */}
          <button onClick={() => navigate(`/agencies/${agency.id}`)}
     className="mt-auto py-2 px-4 bg-[#F97316] hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors">
            En savoir plus
          </button>
        </div>
      </div>
    ))}
</Slider>

              
              
      </div>
        {/* === Carrousel 2 : grandes agences (bannière) === */}
    <div className="mb-10">
      <Slider {...bigCardSettings}>
        {filteredAgencies
          ?.filter((agency) => agency.logo) // agences avec bannière
          .map((agency) => (
            <div key={agency.id} className="px-2">
              {/* Conteneur responsive avec ratio 565/376 ≈ 1.5 */}
              <div className="relative overflow-hidden rounded-lg shadow hover:shadow-xl transition bg-gray-100"
                   style={{ paddingTop: '66.5%' }}> {/* 376/565 ≈ 0.665 */}
                
                <img
                  src={agency.logo || "/agency-placeholder.jpg"}
                  alt={agency.name}
                  className="absolute top-0 left-0 w-full h-full object-cover p-6 md:p-10 lg:p-[43px]"
                />
                
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/60 px-4 py-3 rounded-lg text-center min-w-[200px] max-w-[80%]">
                  <h3 className="text-base md:text-xl font-bold text-white">
                    {agency.name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-200">
                    {agency.location || "BKO-MALI"}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </Slider>

        {/* Bouton Voir plus */}
        <div className="text-center mt-6">
          <button className="px-5 py-2 rounded-md bg-[#0D1426] text-white hover:bg-[#1A2238] transition">
            ➔ Voir plus
          </button>
        </div>
      </div></div>
    </section>
  );
};

  const SpecialCampaigns = ({ campaigns }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
    const navigate = useNavigate();
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
    };

    // Vérifier la taille initiale
    checkScreenSize();

    // Écouter les changements de taille
    window.addEventListener('resize', checkScreenSize);

    // Nettoyer l'écouteur
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const getCampaignImage = (url) => {
    if (!url) return "/campaign-placeholder.jpg";
    try {
      const fileName = url.includes("\\") ? url.split("\\").pop() : url.split("/").pop();
      return `https://agencesvoyage.com/uploads/${fileName}`;
    } catch {
      return "/campaign-placeholder.jpg";
    }
  };

  // Settings du carrousel adaptatifs
  const settings = {
    dots: true,
    infinite: campaigns && campaigns.length > 1,
    speed: 500,
    slidesToShow: Math.min(3, campaigns?.length || 1),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, campaigns?.length || 1),
          dots: campaigns && campaigns.length > 2
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          dots: campaigns && campaigns.length > 1
        }
      },
    ],
  };

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Titre CENTRÉ */}
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0D1426] mb-3">
            Campagnes de voyage en vedette
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Découvrez nos promotions voyages exclusives et nos offres spéciales
          </p>
        </div>

        {/* Carrousel campaigns */}
        {campaigns && campaigns.length > 0 ? (
          <>
            <Slider {...settings}>
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="px-2 focus:outline-none">
                  {/* Carte avec fond orange et dimensions adaptatives */}
                  <div
                    className="border border-gray-200 rounded-lg flex flex-col overflow-hidden mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300"
                    style={{
                      maxWidth: "363px",
                      width: "100%",
                      minHeight: "420px",
                      height: "auto",
                      padding: "16px",
                      gap: "16px",
                      backgroundColor: "#D9770680"
                    }}
                  >
                    {/* Zone logo avec espace et fond blanc */}
                    <div className="bg-white p-3 md:p-4 flex items-center justify-center rounded-lg h-32 md:h-40">
  <div className="w-full h-full flex items-center justify-center p-1">
    <img
      src={getCampaignImage(campaign.logo || campaign.images?.[0]?.url)}
      alt={campaign.title}
      className="w-full h-full object-cover rounded"
      onError={(e) => {
        e.target.src = "/campaign-placeholder.jpg";
      }}
    />
  </div>
</div>

                    {/* Content avec fond orange */}
                    <div className="flex flex-col flex-grow text-[#0D1426] justify-between mt-2">
                      <div>
                        <h3 className="text-base md:text-lg font-bold mb-2 text-center text-[#0D1426] line-clamp-2">
                          {campaign.title}
                        </h3>
                        <p className="text-xs md:text-sm text-[#0D1426] mb-3 line-clamp-3 text-center opacity-90 px-1">
                          {campaign.description || "Description non disponible"}
                        </p>

                        {/* Agency & Dates avec fond légèrement plus opaque */}
                        <div className="bg-[#D97706] bg-opacity-30 p-2 rounded-md mb-4">
                          <p className="text-xs md:text-sm font-semibold text-center text-[#0D1426] line-clamp-1">
                            {campaign.associatedAgency?.name || "Agence inconnue"}
                          </p>
                          <p className="text-xs text-[#0D1426] text-center mt-1 opacity-100">
                            {new Date(campaign.startAt).toLocaleDateString("fr-FR")} -{" "}
                            {new Date(campaign.endAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>

                      {/* Bouton avec dimensions adaptatives */}
                      <div className="text-center">
                        <button
                          onClick={() => navigate(`/campaigns/${campaign.id}`)}
                          className="bg-[#0D1426] text-white font-semibold hover:bg-[#1A2238] transition-all duration-300 transform hover:scale-105"
                          style={{
                            width: isMobile ? "140px" : "184px",
                            height: isMobile ? "32px" : "36px",
                            borderRadius: "50px",
                            fontSize: isMobile ? "12px" : "14px"
                          }}
                        >
                          En savoir plus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>

            {/* Bouton Voir plus global - CENTRÉ */}
            <div className="mt-8 text-center">
              <button className="px-6 py-2 bg-[#0D1426] text-white font-semibold rounded-lg hover:bg-[#1A2238] transition-colors duration-300">
                Voir toutes les campagnes
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
            <p className="text-lg">Aucune campagne disponible pour le moment</p>
            <p className="text-sm mt-2">Revenez plus tard pour découvrir nos offres spéciales</p>
          </div>
        )}
      </div>
    </section>
  );
};
 



const Footer = ({footerPage}) => {
  return (
    <footer className="bg-[#0F172A] text-white pt-12 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Principale */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Colonne 1 - Logo et description */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
             
            <img
              src="/agence-logo.png" // ton fichier placé dans public/logo.png
              alt="Travel Agency Logo"
              className="h-8 w-auto sm:h-10"
            />

            </div>
            <p className="text-gray-400 mb-4">
              Votre partenaire de voyage de confiance, connectant les voyageurs aux meilleures agences et offres.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FontAwesomeIcon icon={faFacebook} className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FontAwesomeIcon icon={faTwitter} className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FontAwesomeIcon icon={faInstagram} className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Colonne 2 - Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition">Accueil</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Agences</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Campagnes</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Réservations</a></li>
            </ul>
          </div>

          {/* Colonne 3 - Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Nos Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition">Vols</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Hôtels</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Circuits</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Assurance</a></li>
            </ul>
          </div>

          {/* Colonne 4 - Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contactez-nous</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mt-1 mr-2 flex-shrink-0" />
                <span>Tours d'Afrique ,Bamako ,Mali</span>
              </li>
              <li className="flex items-center">
                <FontAwesomeIcon icon={faPhone} className="mr-2" />
                <span>+223 .. .. .78</span>
              </li>
              <li className="flex items-center">
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                <span>contact@travelapp.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-gray-800 my-6"></div>

        {/* Bas de page */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} TravelApp. Tous droits réservés.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-white text-sm transition">Conditions d'utilisation</a>
            <a href="#" className="text-gray-500 hover:text-white text-sm transition">Politique de confidentialité</a>
            <a href="#" className="text-gray-500 hover:text-white text-sm transition">Mentions légales</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

