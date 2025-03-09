// import {
//     faCalendarAlt,
//     faExternalLinkAlt,
//     faMapPin,
//     faSearch,
//     faStar,
//     faUsers
// } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import React, { useState } from "react";
// import { flightService } from "../../services/flightService";

// const SearchFlight = () => {
//   const [searchParams, setSearchParams] = useState({
//     startDate: "",
//     endDate: "",
//     passengers: 1,
//     class: "economy",
//   });

//   const [searchResults, setSearchResults] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [places, setPlaces] = useState({
//     origin: [],
//     destination: [],
//   });

//   const [filters, setFilters] = useState({
//     maxPrice: Infinity,
//     minRating: 0,
//     showExternal: true,
//     showLocal: true,
//   });

//   const [placeSearchResults, setPlaceSearchResults] = useState({
//     origin: [],
//     destination: [],
//   });

//   // Fonction de recherche des lieux (origine/destination)
//   const searchPlaces = async (query, type) => {
//     if (query.length < 2) return;
//     try {
//       const response = await flightService.searchPlaces(query);
//       setPlaceSearchResults((prev) => ({ ...prev, [type]: response.places }));
//     } catch (err) {
//       console.error("Erreur lors de la recherche :", err);
//     }
//   };

//   // Fonction de recherche de vols
//   const handleSearch = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const results = await flightService.searchFlights(searchParams);
//       setSearchResults(results);
//     } catch (err) {
//       setError("Erreur lors de la recherche des vols.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filtrage des résultats
//   const filterFlights = (flights) => {
//     return flights.filter((flight) => {
//       if (!filters.showExternal && flight.external) return false;
//       if (!filters.showLocal && !flight.external) return false;
//       if (flight.prix > filters.maxPrice) return false;
//       if (flight.agency?.rating && flight.agency.rating < filters.minRating) return false;
//       return true;
//     });
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       <div className="bg-white rounded-lg shadow-lg p-6">
//         <form onSubmit={handleSearch} className="space-y-6">
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
//             {/* Origin Search */}
//             <div className="relative">
//               <label className="block text-sm font-medium text-gray-700">
//                 <FontAwesomeIcon icon={faMapPin} className="inline-block w-4 h-4 mr-1" />
//                 Origin
//               </label>
//               <input
//                 type="text"
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                 placeholder="From where?"
//                 onChange={(e) => {
//                   searchPlaces(e.target.value, 'origin');
//                   setSearchParams({ ...searchParams, originId: undefined });
//                 }}
//               />
//               {placeSearchResults.origin.length > 0 && (
//                 <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
//                   {placeSearchResults.origin.map((place) => (
//                     <div
//                       key={place.id}
//                       className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
//                       onClick={() => {
//                         setSearchParams({ ...searchParams, originId: place.id });
//                         setPlaceSearchResults(prev => ({ ...prev, origin: [] }));
//                       }}
//                     >
//                       <span className="flex-1">
//                         {place.name}, {place.city}
//                         <span className="text-sm text-gray-500 ml-1">
//                           {place.country}
//                         </span>
//                       </span>
//                       {place.source === 'external' && (
//                         <FontAwesomeIcon icon={faExternalLinkAlt} className="w-4 h-4 text-gray-400" />
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Destination Search */}
//             <div className="relative">
//               <label className="block text-sm font-medium text-gray-700">
//                 <FontAwesomeIcon icon={faMapPin} className="inline-block w-4 h-4 mr-1" />
//                 Destination
//               </label>
//               <input
//                 type="text"
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                 placeholder="Where to?"
//                 onChange={(e) => {
//                   searchPlaces(e.target.value, 'destination');
//                   setSearchParams({ ...searchParams, destinationId: undefined });
//                 }}
//               />
//               {placeSearchResults.destination.length > 0 && (
//                 <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
//                   {placeSearchResults.destination.map((place) => (
//                     <div
//                       key={place.id}
//                       className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
//                       onClick={() => {
//                         setSearchParams({ ...searchParams, destinationId: place.id });
//                         setPlaceSearchResults(prev => ({ ...prev, destination: [] }));
//                       }}
//                     >
//                       <span className="flex-1">
//                         {place.name}, {place.city}
//                         <span className="text-sm text-gray-500 ml-1">
//                           {place.country}
//                         </span>
//                       </span>
//                       {place.source === 'external' && (
//                         <FontAwesomeIcon icon={faExternalLinkAlt} className="w-4 h-4 text-gray-400" />
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Date */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 flex items-center">
//                 <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /> Date de départ
//               </label>
//               <input
//                 type="date"
//                 className="mt-1 block w-full border rounded-md px-3 py-2"
//                 onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
//               />
//             </div>

//             {/* Passagers */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 flex items-center">
//                 <FontAwesomeIcon icon={faUsers} className="mr-2" /> Passagers
//               </label>
//               <input
//                 type="number"
//                 min="1"
//                 className="mt-1 block w-full border rounded-md px-3 py-2"
//                 value={searchParams.passengers}
//                 onChange={(e) => setSearchParams({ ...searchParams, passengers: parseInt(e.target.value) })}
//               />
//             </div>
//           </div>

//           {/* Bouton de recherche */}
//           <div className="flex justify-center">
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-6 py-3 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 flex items-center"
//             >
//               {loading ? "Recherche..." : <><FontAwesomeIcon icon={faSearch} className="mr-2" /> Rechercher</>}
//             </button>
//           </div>
//         </form>

//         {/* Affichage des résultats */}
//         {error && <p className="mt-4 text-red-500">{error}</p>}

//         {searchResults && (
//           <div className="mt-8">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl font-semibold">
//                 Found {searchResults.totalCount} flights
//               </h2>
              
//               {/* Filters */}
//               <div className="flex items-center space-x-4">
//                 <div className="flex items-center space-x-2">
//                   <input
//                     type="checkbox"
//                     id="showExternal"
//                     checked={filters.showExternal}
//                     onChange={(e) => setFilters({ ...filters, showExternal: e.target.checked })}
//                     className="rounded text-indigo-600 focus:ring-indigo-500"
//                   />
//                   <label htmlFor="showExternal" className="text-sm text-gray-600">
//                     External Flights
//                   </label>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <input
//                     type="checkbox"
//                     id="showLocal"
//                     checked={filters.showLocal}
//                     onChange={(e) => setFilters({ ...filters, showLocal: e.target.checked })}
//                     className="rounded text-indigo-600 focus:ring-indigo-500"
//                   />
//                   <label htmlFor="showLocal" className="text-sm text-gray-600">
//                     Local Flights
//                   </label>
//                 </div>
//                 <select
//                   value={filters.minRating}
//                   onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
//                   className="rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
//                 >
//                   <option value="0">All Ratings</option>
//                   <option value="3">3+ Stars</option>
//                   <option value="4">4+ Stars</option>
//                   <option value="4.5">4.5+ Stars</option>
//                 </select>
//               </div>
//             </div>

//             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//               {filterFlights(searchResults.flights).map((flight) => (
//                 <div key={flight.id} className="bg-white rounded-lg shadow-md p-6">
//                   <div className="flex justify-between items-start mb-4">
//                     <div>
//                       <h3 className="text-lg font-medium flex items-center">
//                         {flight.name}
//                         {flight.external && (
//                           <FontAwesomeIcon icon={faExternalLinkAlt} className="w-4 h-4 ml-2 text-gray-400" />
//                         )}
//                       </h3>
//                       <p className="text-sm text-gray-500">
//                         {new Date(flight.startAt).toLocaleString()} - 
//                         {new Date(flight.endAt).toLocaleString()}
//                       </p>
//                     </div>
//                     <span className="text-lg font-bold text-indigo-600">
//                       €{flight.prix.toFixed(2)}
//                     </span>
//                   </div>
                  
//                   {flight.agency && (
//                     <div className="mt-4 pt-4 border-t border-gray-200">
//                       <div className="flex items-center justify-between">
//                         <p className="text-sm text-gray-600">
//                           {flight.agency.name}
//                         </p>
//                         {flight.agency.rating && (
//                           <div className="flex items-center text-yellow-500">
//                             <FontAwesomeIcon icon={faStar} className="w-4 h-4 fill-current" />
//                             <span className="ml-1 text-sm">
//                               {flight.agency.rating.toFixed(1)}
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}

//                   {flight.localAgencies?.length > 0 && (
//                     <div className="mt-2 text-sm text-gray-600">
//                       <p>Also available through {flight.localAgencies.length} local agencies</p>
//                     </div>
//                   )}

//                   <button 
//                     onClick={() => window.location.href = `/flights/${flight.id}`}
//                     className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                   >
//                     View Details
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SearchFlight;
import {
  faCalendarAlt,
  faExternalLinkAlt,
  faMapPin,
  faSearch,
  faStar,
  faUsers
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { flightService } from "../../services/flightService";

const SearchFlight = () => {
  const [searchParams, setSearchParams] = useState({
    startDate: "",
    endDate: "", // Add endDate to the state
    passengers: 1,
    class: "economy",
  });

  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [places, setPlaces] = useState({
    origin: [],
    destination: [],
  });

  const [filters, setFilters] = useState({
    maxPrice: Infinity,
    minRating: 0,
    showExternal: true,
    showLocal: true,
  });

  const [placeSearchResults, setPlaceSearchResults] = useState({
    origin: [],
    destination: [],
  });

  // Fonction de recherche des lieux (origine/destination)
  const searchPlaces = async (query, type) => {
    if (query.length < 2) return;
    try {
      const response = await flightService.searchPlaces(query);
      setPlaceSearchResults((prev) => ({ ...prev, [type]: response.places }));
    } catch (err) {
      console.error("Erreur lors de la recherche :", err);
    }
  };

  // Fonction de recherche de vols
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

  // Filtrage des résultats
  const filterFlights = (flights) => {
    return flights.filter((flight) => {
      if (!filters.showExternal && flight.external) return false;
      if (!filters.showLocal && !flight.external) return false;
      if (flight.prix > filters.maxPrice) return false;
      if (flight.agency?.rating && flight.agency.rating < filters.minRating) return false;
      return true;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Origin Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                <FontAwesomeIcon icon={faMapPin} className="inline-block w-4 h-4 mr-1" />
                Origin
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="From where?"
                onChange={(e) => {
                  searchPlaces(e.target.value, 'origin');
                  setSearchParams({ ...searchParams, originId: undefined });
                }}
              />
              {placeSearchResults.origin.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
                  {placeSearchResults.origin.map((place) => (
                    <div
                      key={place.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => {
                        setSearchParams({ ...searchParams, originId:place.id });
                        setPlaceSearchResults(prev => ({ ...prev, origin: [] }));
                      }}
                    >
                      <span className="flex-1">
                        {place.name}, {place.city}
                        <span className="text-sm text-gray-500 ml-1">
                          {place.country}
                        </span>
                      </span>
                      {place.source === 'external' && (
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Destination Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                <FontAwesomeIcon icon={faMapPin} className="inline-block w-4 h-4 mr-1" />
                Destination
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Where to?"
                onChange={(e) => {
                  searchPlaces(e.target.value, 'destination');
                  setSearchParams({ ...searchParams, destinationId: undefined });
                }}
              />
              {placeSearchResults.destination.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
                  {placeSearchResults.destination.map((place) => (
                    <div
                      key={place.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => {
                        setSearchParams({ ...searchParams, destinationId:place.id });
                        setPlaceSearchResults(prev => ({ ...prev, destination: [] }));
                      }}
                    >
                      <span className="flex-1">
                        {place.name}, {place.city}
                        <span className="text-sm text-gray-500 ml-1">
                          {place.country}
                        </span>
                      </span>
                      {place.source === 'external' && (
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /> Start Date
              </label>
              <input
                type="date"
                className="mt-1 block w-full border rounded-md px-3 py-2"
                onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /> End Date
              </label>
              <input
                type="date"
                className="mt-1 block w-full border rounded-md px-3 py-2"
                onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
              />
            </div>

            {/* Passagers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <FontAwesomeIcon icon={faUsers} className="mr-2" /> Passagers
              </label>
              <input
                type="number"
                min="1"
                className="mt-1 block w-full border rounded-md px-3 py-2"
                value={searchParams.passengers}
                onChange={(e) => setSearchParams({ ...searchParams, passengers: parseInt(e.target.value) })}
              />
            </div>
          </div>

          {/* Bouton de recherche */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 flex items-center"
            >
              {loading ? "Recherche..." : <><FontAwesomeIcon icon={faSearch} className="mr-2" /> Rechercher</>}
            </button>
          </div>
        </form>

        {/* Affichage des résultats */}
        {error && <p className="mt-4 text-red-500">{error}</p>}

        {searchResults && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                Found {searchResults.totalCount} flights
              </h2>
              
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showExternal"
                    checked={filters.showExternal}
                    onChange={(e) => setFilters({ ...filters, showExternal: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="showExternal" className="text-sm text-gray-600">
                    External Flights
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showLocal"
                    checked={filters.showLocal}
                    onChange={(e) => setFilters({ ...filters, showLocal: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="showLocal" className="text-sm text-gray-600">
                    Local Flights
                  </label>
                </div>
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

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filterFlights(searchResults.flights).map((flight) => (
                <div key={flight.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium flex items-center">
                        {flight.name}
                        {flight.external && (
                          <FontAwesomeIcon icon={faExternalLinkAlt} className="w-4 h-4 ml-2 text-gray-400" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(flight.startAt).toLocaleString()} - 
                        {new Date(flight.endAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-indigo-600">
                      {flight.prix !== null && flight.prix !== undefined ? `€${flight.prix.toFixed(2)}` : "N/A"}
                    </span>
                  </div>
                  
                  {flight.agency && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {flight.agency.name}
                        </p>
                        {flight.agency.rating && (
                          <div className="flex items-center text-yellow-500">
                            <FontAwesomeIcon icon={faStar} className="w-4 h-4 fill-current" />
                            <span className="ml-1 text-sm">
                              {flight.agency.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {flight.localAgencies?.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Also available through {flight.localAgencies.length} local agencies</p>
                    </div>
                  )}

                  <button 
                    onClick={() => window.location.href = `/flights/${flight.id}`}
                    className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* Display Agencies */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Agencies</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.filters.agencies.map((agency) => (
                  <div key={agency.id} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium">{agency.name}</h3>
                    <p className="text-sm text-gray-500">Rating: {agency.rating}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Display Destinations */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Destinations</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.filters.destinations.map((destination) => (
                  <div key={destination.id} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium">{destination.name}</h3>
                    <p className="text-sm text-gray-500">{destination.city}, {destination.country}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFlight;
