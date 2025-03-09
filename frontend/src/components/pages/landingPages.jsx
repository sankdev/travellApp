{/* Previous imports remain the same */}

export function LandingPage() {
    {/* Previous state and hooks remain the same */}
  
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section remains the same */}
  
        {/* Available Flights */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Available Flights</h2>
            <div className="relative">
              <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-6 snap-x scroll-smooth scrollbar-hide">
                {filteredVols?.map((vol) => (
                  <div key={vol.id} className="flex-none w-[300px] snap-start">
                    <div className="bg-white rounded-lg shadow-md p-6 border">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Plane className="w-6 h-6 text-primary mr-2" />
                          <h3 className="font-semibold">{vol.name}</h3>
                        </div>
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {vol.class?.name}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(vol.startAt)} - {formatDate(vol.endAt)}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {vol.destination?.name}
                        </div>
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-2" />
                          {vol.company?.name}
                        </div>
                      </div>
                      <Button className="w-full mt-4">Book Now</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
  
        {/* Travel Agencies */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Featured Agencies</h2>
            <div className="relative">
              <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-6 snap-x scroll-smooth scrollbar-hide">
                {filteredAgencies?.map((agency) => (
                  <div key={agency.id} className="flex-none w-[350px] snap-start">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
                      {agency.image1 && (
                        <img
                          src={agency.image1}
                          alt={agency.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{agency.name}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{agency.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-1" />
                            {agency.location}
                          </div>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < agency.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
  
        {/* Current Campaigns */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Special Campaigns</h2>
            <div className="relative">
              <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-6 snap-x scroll-smooth scrollbar-hide">
                {campaigns?.map((campaign) => (
                  <div key={campaign.id} className="flex-none w-[350px] snap-start">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
                      {campaign.image1 && (
                        <img
                          src={campaign.image1}
                          alt={campaign.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-semibold">{campaign.title}</h3>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                            {campaign.type}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
                        <div className="space-y-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(campaign.startAt)} - {formatDate(campaign.endAt)}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {campaign.destination?.name}
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(campaign.price)}
                          </span>
                          <Button size="sm">View Details</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
  import { faArrowRight, faBuilding, faCalendar, faMapMarkerAlt, faPlane, faSearch, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useMemo, useState } from 'react';
import { agencyService } from '../../services/agencyService';
import { compaignService } from '../../services/compaignService';
import { destinationService } from '../../services/destinationService';
import { flightService } from '../../services/flightService';
import { formatCurrency, formatDate } from '../../utils/formatters'; // Corrected import for formatters
import Header from './Header'; // Import Header component
import UserLogin from '../users/UserLogin'; // Import UserLogin component

export function LandingPage() {
  const [destinations, setDestinations] = useState([]);
  const [flights, setFlights] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState(''); // Define selectedOrigin state
  const [isLoginOpen, setIsLoginOpen] = useState(false);

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
          originPlace: selectedOrigin  // Ajouter l'origine
        };
        const result = await flightService.searchFlights(searchParams);
        setFlights(result.flights);
      } catch (error) {
        console.error('Failed to fetch flights:', error);
      }
    };
    

    const fetchAgencies = async () => {
      try {
        const result = await agencyService.getAgencies();
        console.log('result',result)
        setAgencies(Array.isArray(result.data) ? result.data:result.data || []);
      } catch (error) {
        console.error('Failed to fetch agencies:', error);
      }
    };

    const fetchCampaigns = async () => {
      try {
        const result = await compaignService.getCompaigns();
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
  }, [selectedDestination,selectedOrigin]);
 
  
  
  // Memoize the filtered flights based on the selected destination
  const filteredFlights = useMemo(() => 
    flights?.filter(flight => 
      selectedDestination ? flight.destinationId === selectedDestination : true
    ), [flights, selectedDestination]);

  // Memoize the filtered agencies based on the search query
  const filteredAgencies = useMemo(() => 
    agencies?.filter(agency => 
      agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agency.location.toLowerCase().includes(searchQuery.toLowerCase())
    ), [agencies, searchQuery]);

  console.log('Filtered Agencies:', filteredAgencies);
 

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoginOpen={isLoginOpen} setIsLoginOpen={setIsLoginOpen} /> {/* Use Header component */}
      {isLoginOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <UserLogin onClose={() => setIsLoginOpen(false)} />
          </div>
        </div>
      )}
      {/* Hero Section */}
      <section className="relative h-[400px] bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative container mx-auto px-4 py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-white mb-6">Discover Your Next Adventure</h1>
            <p className="text-xl text-white/90 mb-8">Find the best travel deals from trusted agencies worldwide</p>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="">All Destinations</option>
                  {destinations?.map((destination) => (
                    <option key={destination.id} value={destination.id}>{destination.name}, {destination.country}</option>
                  ))}
                </select>
                <select
  value={selectedOrigin}
  onChange={(e) => setSelectedOrigin(e.target.value)}
  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
>
  <option value="">Choose Origin</option>
  {destinations?.map((destination) => (
    <option key={destination.id} value={destination.id}>
      {destination.name}, {destination.country}
    </option>
  ))}
</select>

                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search agencies, destinations..."
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
                <button className="h-full w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                  Search Flights <FontAwesomeIcon icon={faArrowRight} className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Flights */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Available Flights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlights?.map((flight) => (
              <div key={flight.id} className="bg-white rounded-lg shadow-md p-6 border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center">
                    <FontAwesomeIcon icon={faPlane} className="w-6 h-6 text-primary mr-2" />
                    {flight.name}
                  </h3>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{flight.class?.name}</span>
                </div>
                <p className="text-sm text-gray-600">
                  <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 mr-2" /> {formatDate(flight.startAt)} - {formatDate(flight.endAt)}
                </p>
                <p className="text-sm text-gray-600">
  <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 mr-2" />
  {flight.origin?.name || "Unknown Origin"}
</p>

                <p className="text-sm text-gray-600">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 mr-2" /> {flight.destination?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 mr-2" /> {flight.company?.name}
                </p>
                <button className="w-full mt-4 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

     {/* Travel Agencies */}
<section className="py-16 bg-gray-100">
<div className="container mx-auto px-4">
  <h2 className="text-4xl font-bold text-gray-800 mb-10 text-center">
    Featured Travel Agencies
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {filteredAgencies?.map((agency) => (
      <div
        key={agency.id}
        className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform transform hover:scale-105"
      >
        {agency.image1 && (
          <img
            src={agency.image1}
            alt={agency.name}
            className="w-full h-56 object-cover"
          />
        )}
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
                  className={`w-5 h-5 ${
                    i < agency.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
</section>


      {/* Current Campaigns */}
<section className="py-16 bg-white">
  <div className="container mx-auto px-4">
    <h2 className="text-4xl font-bold text-gray-800 mb-10 text-center">
      Special Campaigns
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {campaigns?.map((campaign) => (
        <div
          key={campaign.id}
          className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform transform hover:scale-105"
        >
          {campaign.image1 && (
            <img
              src={campaign.image1}
              alt={campaign.title}
              className="w-full h-56 object-cover"
            />
          )}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-2xl font-semibold text-gray-900">{campaign.title}</h3>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                {campaign.type}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{campaign.description}</p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 mr-2" />
                {formatDate(campaign.startAt)} - {formatDate(campaign.endAt)}
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 mr-2" />
                {campaign.destination?.name}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-bold text-indigo-600">
                {formatCurrency(campaign.price)}
              </span>
              <button className="py-2 px-5 rounded-lg bg-indigo-600 text-white font-medium shadow-md hover:bg-indigo-700 transition">
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

    </div>
  );
}