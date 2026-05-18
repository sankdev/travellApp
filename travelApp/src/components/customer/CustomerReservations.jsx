import { faBuilding, faFileAlt, faPlane, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { agencyService } from '../../services/agencyService';
import { companyService } from '../../services/companyService';
import { customerService } from '../../services/customerService';
import { destinationService } from '../../services/destinationService';
import { reservationService } from '../../services/reservationService';
import { volService } from '../../services/volService';
import  { classeService } from '../../services/classService'
import ReservationListes from './reservation/ReservationListes'
const CustomerReservations = () => {
    const [reservationsByCustomer, setReservationsByCustomer] = useState([]); // Liste des réservations par client
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
    const [customers, setCustomers] = useState([]); // Define setCustomers
    const [customerId, setCustomerId] = useState(''); // Define customerId
    const [filters, setFilters] = useState({
        status: 'all',
        startDate: '',
        endDate: ''
    });
    const [cancellingId, setCancellingId] = useState(null);
  const [showComponent, setShowComponent] = useState(true)
    useEffect(() => {
        fetchCustomersAndReservations();
    }, []); // Charger les clients et leurs réservations au chargement de la page

    useEffect(() => {
        fetchVols();
        fetchClasses();
        fetchCompanies();
        fetchDestinations();
        fetchAgencies();
    }, [page, search]);

    const fetchCustomersAndReservations = async () => {
        setLoading(true);
        try {
            const customerResponse = await customerService.getAllCustomers();  // Récupérer tous les clients
            const customersList = Array.isArray(customerResponse.data) ? customerResponse.data : [];
            setCustomers(customersList);
            
            // Récupérer les réservations pour chaque client
            const reservationsPromises = customersList.map(async (customer) => {
                const reservationResponse = await reservationService.getReservationsByCustomer(customer.id);
                //console.log('reservationRespNew',reservationResponse)
                return {
                    customer,
                    reservations: reservationResponse.data || []
                };
            });

            const customerReservations = await Promise.all(reservationsPromises);
            setReservationsByCustomer(customerReservations); // Mettre à jour les réservations par client
        } catch (err) {
            setError('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

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
            const response = classeService.getClasses();
            console.log('classList', response);
            setClasses(response);
        } catch (err) {
            setError('Failed to fetch classes');
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await companyService.getCompanies();
            console.log('companieList', response);
            setCompanies(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Failed to fetch companies');
        }
    };

    const fetchDestinations = async () => {
        try {
            const response = await destinationService.getDestinations();
            console.log('destinationList', response);
            setDestinations(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Failed to fetch destinations');
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
            setReservationsByCustomer(reservationsByCustomer.map(customerData => ({
                ...customerData,
                reservations: customerData.reservations.map(reservation =>
                    reservation.id === reservationId
                        ? { ...reservation, status: 'cancelled' }
                        : reservation
                )
            })));
        } catch (err) {
            setError(err.message || 'Failed to cancel reservation');
        } finally {
            setCancellingId(null);
        }
    };

    const fetchAgencies = async () => {
        try {
            const response = await agencyService.getAgencies({ page, search });
            //console.log('API Response:', response);
    
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

    // const filteredReservations = reservationsByCustomer.map((customerData) => {
    //     const filteredData = customerData.reservations.filter((reservation) => {
    //         if (filters.status !== 'all' && reservation.status !== filters.status) return false;
    //         if (filters.startDate && new Date(reservation.startAt) < new Date(filters.startDate)) return false;
    //         if (filters.endDate && new Date(reservation.endAt) > new Date(filters.endDate)) return false;
    //         return true;
    //     });

    //     return {
    //         customer: customerData.customer,
    //         reservations: filteredData
    //     };
    // });

    const filteredReservations = reservationsByCustomer.map((customerData) => {
        const filteredData = customerData.reservations.filter((reservation) => {
            const { status, startAt, endAt } = reservation;
      
            // Afficher toutes les réservations si le filtre est "all"
            if (filters.status === 'all') return true;
    
            // Filtrer par statut en gérant la casse
            if (filters.status && status.toLowerCase() !== filters.status.toLowerCase()) return false;
    
            // Appliquer les filtres de date
            if (filters.startDate && new Date(startAt) < new Date(filters.startDate)) return false;
            if (filters.endDate && new Date(endAt) > new Date(filters.endDate)) return false;
    
            return true;
        });
    
        return {
            customer: customerData.customer,
            reservations: filteredData
        };
    });
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'text-yellow-500';
            case 'confirmed':
                return 'text-green-500';
            case 'cancelled':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: '2-digit' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
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
        // console.log('agencies', classItem);
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
            </div>
        );
    }
//console.log('customerDAta',filteredReservations);
    return (
        <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2 sm:space-x-4">   
        
        <Link
        to="/customer/reservations/demande"
        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm w-full sm:w-auto justify-center"
    >
        <FontAwesomeIcon icon={faPlus} className="mr-2" />
        Demande Reservation
    </Link>

    <Link
        to="/customer/reservations/new"
        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm w-full sm:w-auto justify-center"
    >
        <FontAwesomeIcon icon={faSearch} className="mr-2" />
        New Reservation
    </Link>
    <Link
        to="/customer/reservations/campaign"
        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm w-full sm:w-auto justify-center"
    >
        <FontAwesomeIcon icon={faPlus} className="mr-2" />
        Reservation Campaign
    </Link>
    

</div>

 </div>
 {showComponent && (
                <ReservationListes/>
            )}
</div>
    );
};

export default CustomerReservations;
