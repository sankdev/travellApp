import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { reservationService } from '../../services/reservationService';
import { destinationService } from '../../services/destinationService';
import { companyService } from '../../services/companyService';
import { volService } from '../../services/volService';
import { agencyService } from '../../services/agencyService';


const CustomerReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [vols, setVols] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [classes, setClasses] = useState([]);
        const [companies, setCompanies] = useState([]);
        const [page, setPage] = useState(1);
            const [totalPages, setTotalPages] = useState(1);
        const [destinations, setDestinations] = useState([]);
        const [search, setSearch] = useState('');
            
    const [filters, setFilters] = useState({
        status: 'all',
        startDate: '',
        endDate: ''
    });
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        fetchReservations();
    }, []);
    useEffect(() => {
        fetchVols();
        fetchClasses();
        fetchCompanies();
        fetchDestinations();
        fetchAgencies();
    }, [page, search]);
   
    const fetchVols = async () => {
        try {
            const response = await volService.getVols();
            setVols(Array.isArray(response) ? response : []); // Ensure vols is an array
        } catch (err) {
            setError('Failed to fetch vols');
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await axios.get('/api/classes');
            console.log('classList',response.data)
            setClasses(response.data);
        } catch (err) {
            setError('Failed to fetch classes');
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await companyService.getCompanies();
            console.log('companieList',response)
            setCompanies(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Failed to fetch companies');
        }
    };
    // const fetchCustomers = async () => {
    //       try {
    //           const response = await customerService.getAllCustomers();
    //           console.log('customerUniue',response.data)
    //           setCustomers(Array.isArray(response.data) ? response.data : []);
    //       } catch (err) {
    //           setError('Failed to fetch customers');
    //       }
    //   };
    const fetchDestinations = async () => {
        try {
            const response = await destinationService.getDestinations();
            console.log('destinationList',response.data)
            setDestinations(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Failed to fetch destinations');
        }
    };

    const fetchReservations = async () => {
        try {
            const response = await reservationService.getReservations();
            console.log(response.data)
            setReservations(response.data);
        } catch (err) {
            setError(err.message || 'Failed to load reservations');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelReservation = async (reservationId) => {
        if (!window.confirm('Are you sure you want to cancel this reservation?')) {
            return;
        }

        setCancellingId(reservationId);
        try {
            await reservationService.cancelReservation(reservationId);
            // Mettre à jour la liste des réservations après l'annulation
            setReservations(reservations.map(reservation => 
                reservation.id === reservationId 
                    ? { ...reservation, status: 'cancelled' } 
                    : reservation
            ));
        } catch (err) {
            setError(err.message || 'Failed to cancel reservation');
        } finally {
            setCancellingId(null);
        }
    };
  // fetch agencies 
   const fetchAgencies = async () => {
          try {
              const response = await agencyService.getAgencies({ page, search });
              console.log('API Response:', response);
      
              // Vérifiez si la pagination est présente
              if (response.pagination) {
                  setTotalPages(response.pagination.page);
              } else {
                  console.warn('Pagination is missing in response');
                  setTotalPages(1); // Valeur par défaut si la pagination est absente
              }
      
              // Vérifiez si les données d'agences sont présentes
              if (Array.isArray(response.data)) {
                  setAgencies(response.data);
              } else {
                  setAgencies([]);
                  console.warn('Agencies data is missing or not an array');
              }
          } catch (err) {
              console.error('Fetch error:', err.response ? err.response.data : err.message);
              setError('Failed to fetch agencies');
          }
      };
     

    const filteredReservations = reservations.filter(reservation => {
        if (filters.status !== 'all' && reservation.status !== filters.status) return false;
        if (filters.startDate && new Date(reservation.startAt) < new Date(filters.startDate)) return false;
        if (filters.endDate && new Date(reservation.endAt) > new Date(filters.endDate)) return false;
        return true;
    });

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getClassById = (id) => {
        if (!classes || !classes.length) return 'Unknown';
        const classItem = classes.find((item) => item.id === parseInt(id));
        console.log('classItem', classItem);
        return classItem ? classItem.name : 'Unknown';
    };

    const getAgeciesById = (id) => {
        if (!agencies || !agencies.length) return 'Unknown';
        const classItem = agencies.find((item) => item.id === parseInt(id));
        console.log('agencies', classItem);
        return classItem ? classItem.name : 'Unknown';
    };
    const getCompanyById = (id) => {
        if (!companies || !companies.length) return 'Unknown';
        const company = companies.find((item) => item.id === parseInt(id));
        return company ? company.name : 'Unknown';
    };

    const getDestinationById = (id) => {
        if (!destinations || !destinations.length) return 'Unknown';
        const destination = destinations.find((item) => item.id === parseInt(id));
        return destination ? destination.name : 'Unknown';
    };
    // if (loading) {
    //     return (
    //         <div className="flex justify-center items-center h-64">
    //             <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
    //         </div>
    //     );
    // }

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">My Reservations</h1>
                <div className="mt-4 sm:mt-0">
                    <Link
                        to="/customer/reservations/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        New Reservation
                    </Link>
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input
                            type="date"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <input
                            type="date"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Liste des réservations */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {error && (
                    <div className="p-4 bg-red-50 text-red-700">{error}</div>
                )}
                <ul className="divide-y divide-gray-200">
                    {filteredReservations.map((reservation) => (
                        <li key={reservation.id}>
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                                                {reservation.status}
                                            </span>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {reservation.vol?.name}-{getCompanyById(reservation.vol?.
                                                    companyId
                                                    )}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(reservation.startAt).toLocaleDateString()} - {new Date(reservation.endAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-4">
                                        <Link
                                            to={`/customer/reservations/${reservation.id}`}
                                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                        >
                                            View Details
                                        </Link>
                                        {reservation.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelReservation(reservation.id)}
                                                className="text-red-600 hover:text-red-900 text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <div className="mr-6 flex items-center text-sm text-gray-500">
                                            <span className="material-icons mr-1.5 text-gray-400">business</span>
                                            {getAgeciesById(reservation.agencyId)}
                                        </div>
                                        {reservation.vol && (
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <span className="material-icons mr-1.5 text-gray-400">flight</span>
                                                Vol: {reservation.vol.name}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                        <span className="material-icons mr-1.5 text-gray-400">description</span>
                                        {reservation.typeDocument}: {reservation.numDocument}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

          
        </div>
    );
};

export default CustomerReservations;
