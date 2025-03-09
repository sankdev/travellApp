import { faBuilding, faCalendar, faCalendarAlt, faChevronLeft, faChevronRight, faExternalLinkAlt, faMapMarkerAlt, faMapPin, faSearch, faStar, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { agencyService } from '../../services/agencyService';
import { compaignService } from '../../services/compaignService';
import { destinationService } from '../../services/destinationService';
import { flightService } from '../../services/flightService';
import { formatDate } from '../../utils/formatters';
import SearchFlight from '../agency/flightSearchCompo';
import UserLogin from '../users/UserLogin';
import Header from './Header';

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
    return flights.filter((flight) => {
      if (!filters.showExternal && flight.external) return false;
      if (!filters.showLocal && !flight.external) return false;
      if (flight.prix > filters.maxPrice) return false;
      if (flight.agency?.rating && flight.agency.rating < filters.minRating) return false;
      return true;
    });
  };
  console.log('searchResults',searchResults)
  

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
        <Modal >
          <UserLogin onClose={() => setIsLoginOpen(false)} />
        </Modal>
      )}
      {isFlightSearchOpen && (
        <Modal onClose={() => setIsFlightSearchOpen(false)}>
          <SearchFlight />
        </Modal>
      )}
      <HeroSection handleSearch={handleSearch} searchParams={searchParams} setSearchParams={setSearchParams} placeSearchResults={placeSearchResults} searchPlaces={searchPlaces} setPlaceSearchResults={setPlaceSearchResults} />
      <div className="mt-5"> {/* Add larger margin between Hero section and other sections */}
        <AvailableFlights searchResults={searchResults} filters={filters} setFilters={setFilters} filterFlights={filterFlights} />
        <FeaturedAgencies filteredAgencies={filteredAgencies} />
        <SpecialCampaigns campaigns={campaigns} />
      </div>
    </div>
  );
}

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
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
  setPlaceSearchResults,
}) => {
  const handlePlaceSelect = useCallback(
    (type, place) => {
      setSearchParams((prev) => ({ ...prev, [`${type}Id`]: place.id }));
      setPlaceSearchResults((prev) => ({ ...prev, [type]: [] }));
    },
    [setSearchParams, setPlaceSearchResults]
  );

  return (
    <section className="relative min-h-[500px] bg-gradient-to-r from-blue-600 to-blue-800 pb-15">
      <div className="absolute inset-0 bg-black/15" />

      {/* Titre et sous-titre repositionnés */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 text-center text-white px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Your Next Adventure</h1>
        <p className="text-lg md:text-xl text-white/90">
          Find the best travel deals from trusted agencies worldwide
        </p>
      </div>

      {/* Conteneur principal */}
      <div className="relative container mx-auto px-4 pt-40">
        {/* Formulaire de recherche */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl mx-auto w-full max-w-4xl">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative group">
                <SearchInput
                  label="Origin"
                  icon={faMapPin}
                  placeholder="From where?"
                  onChange={(e) => searchPlaces(e.target.value, "origin")}
                />
                <PlaceResultsList
                  results={placeSearchResults.origin}
                  onSelect={(place) => handlePlaceSelect("origin", place)}
                />
              </div>

              <div className="relative group">
                <SearchInput
                  label="Destination"
                  icon={faMapPin}
                  placeholder="Where to?"
                  onChange={(e) => searchPlaces(e.target.value, "destination")}
                />
                <PlaceResultsList
                  results={placeSearchResults.destination}
                  onSelect={(place) => handlePlaceSelect("destination", place)}
                />
              </div>

              <DateInput
                label="Start Date"
                icon={faCalendarAlt}
                onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
              />

              <DateInput
                label="End Date"
                icon={faCalendarAlt}
                onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
              />

              <NumberInput
                label="Passengers"
                icon={faUsers}
                value={searchParams.passengers}
                onChange={(e) => setSearchParams({ ...searchParams, passengers: parseInt(e.target.value) })}
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 w-full md:w-auto rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
            >
              <FontAwesomeIcon icon={faSearch} className="mr-2" /> Search
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};


const SearchInput = ({ label, icon, placeholder, onChange }) => (
  <div className="relative">
    <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center">
      <FontAwesomeIcon icon={icon} className="text-indigo-500 mr-2" /> {label}
    </label>
    <div className="relative">
      <FontAwesomeIcon icon={icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        className="pl-10 pr-4 py-3 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition-all duration-300 outline-none"
      />
    </div>
  </div>
);

const DateInput = ({ label, icon, onChange }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center">
      <FontAwesomeIcon icon={icon} className="text-indigo-500 mr-2" /> {label}
    </label>
    <div className="relative">
      <FontAwesomeIcon icon={icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="date"
        onChange={onChange}
        className="pl-10 pr-4 py-3 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition-all duration-300 outline-none"
      />
    </div>
  </div>
);

const NumberInput = ({ label, icon, value, onChange }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center">
      <FontAwesomeIcon icon={icon} className="text-indigo-500 mr-2" /> {label}
    </label>
    <div className="relative">
      <FontAwesomeIcon icon={icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="number"
        min="1"
        value={value}
        onChange={onChange}
        className="pl-10 pr-4 py-3 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition-all duration-300 outline-none"
      />
    </div>
  </div>
);


const AvailableFlights = ({ searchResults, filters, setFilters, filterFlights }) => {
  const scrollRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });

      setIsScrolling(true);
      setTimeout(() => setIsScrolling(false), 1000);
    }
  };
 console.log('searchReservations',filters) 
  return (
    <section className="py-16 bg-gray-100 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center mb-10">
          Available Flights ✈️
        </h2>

        {searchResults && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Header avec filtres */}
            <div className="flex flex-wrap justify-between items-center mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-700">
                ✈️ Found {searchResults.totalCount} flights
              </h2>

              <div className="flex flex-wrap gap-4">
                {/* Filtres */}
                <label className="flex items-center space-x-2 text-gray-600">
                  <input
                    type="checkbox"
                    checked={filters.showExternal}
                    onChange={(e) => setFilters({ ...filters, showExternal: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>External Flights</span>
                </label>

                <label className="flex items-center space-x-2 text-gray-600">
                  <input
                    type="checkbox"
                    checked={filters.showLocal}
                    onChange={(e) => setFilters({ ...filters, showLocal: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Local Flights</span>
                </label>

                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
                  className="rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="0">All Ratings</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>
            </div>

            {/* Section défilable */}
            <div className="relative group">
              {/* Bouton gauche */}
              <button
                onClick={() => scroll("left")}
                className={`absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-md hover:bg-gray-700 z-10 transition-opacity duration-300 
                  ${isScrolling ? "opacity-100 visible" : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"}`}
              >
                <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
              </button>

              {/* Liste des vols */}
              <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide px-4 md:px-10"
                style={{ scrollBehavior: "smooth", scrollbarWidth: "none" }}
              >
                {filterFlights(searchResults.flights).map((flight) => (
                  <div
                    key={flight.id}
                    className="min-w-full md:min-w-[300px] bg-white rounded-lg shadow-lg p-6 transition-transform transform hover:-translate-y-2 hover:shadow-xl snap-center"
                  >
                    {/* Titre et prix */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                          {flight.flight.name}
                          {flight.external && (
                            <FontAwesomeIcon
                              icon={faExternalLinkAlt}
                              className="w-4 h-4 ml-2 text-gray-400"
                            />
                          )}
                        </h3>
                        
                        <p className="text-sm text-gray-500">
                          Departure Hours {new Date(flight.departureTime).toLocaleString()} -{" "}
                          Arrival Hours {new Date(flight.arrivalTime).toLocaleString()}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-indigo-600">
                        {flight.price ? `${flight.price.toFixed(1)} Fcfa` : "N/A"}
                      </span>
                    </div>

                    {/* Détails de l'agence */}
                    {flight.agency && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">{flight.agency.name}-{flight.agency.address}</p>
                          {flight.agency.rating && (
                            <div className="flex items-center text-yellow-500">
                              <FontAwesomeIcon icon={faStar} className="w-4 h-4 fill-current" />
                              <span className="ml-1 text-sm">{flight.agency.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Destinations */}
                    {flight.flight && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700">Destinations:</h4>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {flight.flight.destination.city} - {flight.flight.destination.country}
                        </ul>
                      </div>
                    )}

                    {/* Bouton de détails */}
                    <button
                      onClick={() => (window.location.href = `/flights/${flight.id}`)}
                      className="mt-4 w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:scale-105"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>

              {/* Bouton droit */}
              <button
                onClick={() => scroll("right")}
                className={`absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-md hover:bg-gray-700 z-10 transition-opacity duration-300 
                  ${isScrolling ? "opacity-100 visible" : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"}`}
              >
                <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};


const FeaturedAgencies = ({ filteredAgencies }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
 console.log('filteredAgencie',filteredAgencies)
  const checkScroll = () => {
    if (scrollRef.current) {
      setCanScrollLeft(scrollRef.current.scrollLeft > 0);
      setCanScrollRight(
        scrollRef.current.scrollLeft + scrollRef.current.clientWidth < scrollRef.current.scrollWidth
      );
    }
  };

  useEffect(() => {
    checkScroll();
    if (scrollRef.current) {
      scrollRef.current.addEventListener("scroll", checkScroll);
    }
    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener("scroll", checkScroll);
      }
    };
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  return (
    <section className="py-16 bg-gray-100 relative">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-gray-800 mb-10 text-center">
          Featured Travel Agencies
        </h2>

        <div className="relative group">
          {/* Bouton gauche */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-md hover:bg-gray-700 z-10 transition-opacity duration-300"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
            </button>
          )}

          {/* Liste d'agences */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide px-10"
            style={{ scrollBehavior: "smooth", scrollbarWidth: "none" }}
          >
          {filteredAgencies?.map((agency) => {
            // Vérification et transformation de l'URL de l'image
            const agencyImage = agency.agencyImages?.length > 0 
              ? `${baseUrl}/${agency.agencyImages[0].url.split('\\').slice(-2).join('/')}`
              : "/default-image.jpg"; // Image par défaut
          
            return (
              <div
                key={agency.id}
                className="snap-center min-w-full sm:min-w-[300px] bg-white rounded-xl shadow-lg overflow-hidden transition-transform transform hover:scale-105"
              >
                <img
                  src={agencyImage}
                  alt={agency.name}
                  className="w-full h-56 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    {agency.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{agency.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-sm">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 mr-2" />
                      {agency.location}
                    </div>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStar}
                          className={`w-5 h-5 ${i < agency.rating ? "text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          {/* Bouton droit */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-md hover:bg-gray-700 z-10 transition-opacity duration-300"
            >
              <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

const SpecialCampaigns = ({ campaigns }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        setCanScrollLeft(scrollRef.current.scrollLeft > 0);
        setCanScrollRight(
          scrollRef.current.scrollLeft < scrollRef.current.scrollWidth - scrollRef.current.clientWidth
        );
      }
    };
    checkScroll();
    scrollRef.current?.addEventListener("scroll", checkScroll);
    return () => scrollRef.current?.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-16 bg-gray-100 relative">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-gray-800 mb-10 text-center">Special Campaigns</h2>

        <div className="relative group">
          {canScrollLeft && (
            <button 
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-md hover:bg-gray-700 z-10"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
            </button>
          )}

          <div 
            ref={scrollRef} 
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide px-10"
          >
            {campaigns?.map((campaign) => {
              // Vérification et formatage du chemin de l'image
              const campaignImage = campaign.images?.length > 0 
                ? campaign.images[0].url.startsWith("http")
                  ? campaign.images[0].url
                  : `${baseUrl}/${campaign?.images[0].url.split('\\').slice(-2).join('/')}`
                : "/default-image.jpg"; 

              return (
                <div
                  key={campaign.id}
                  className="min-w-full md:min-w-[300px] bg-white rounded-xl shadow-lg overflow-hidden transition-transform transform hover:scale-105 snap-center"
                >
                  <img
                    src={campaignImage}
                    alt={campaign.title}
                    className="w-full h-56 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-2xl font-semibold text-gray-900">{campaign.title}</h3>
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                        {campaign.type}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{campaign.description}</p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p><FontAwesomeIcon icon={faCalendar} className="mr-2" />Start Date: {new Date(campaign.startAt).toLocaleString()}</p>
                      <p><FontAwesomeIcon icon={faCalendar} className="mr-2" />End Date: {new Date(campaign.endAt).toLocaleString()}</p>
                      <p><FontAwesomeIcon icon={faBuilding} className="mr-2" />Agency: {campaign.associatedAgency?.name}</p>
                    </div>
                    <button 
                      onClick={() => window.location.href = `/campaigns/${campaign.id}`}
                      className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {canScrollRight && (
            <button 
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-md hover:bg-gray-700 z-10"
            >
              <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

