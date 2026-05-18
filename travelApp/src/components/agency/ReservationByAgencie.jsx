import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlane, 
  faBuilding, 
  faFileAlt, 
  faCircle, 
  faSearch, 
  faFilter, 
  faCalendarAlt,
  faUser,
  faEye,
  faPlaneDeparture,
  faTimes,
  faCheckCircle,
  faClock,
  faExclamationTriangle,
  faEllipsisVertical,faInfoCircle,
  faDownload,
  faPrint,
  faShare,
  faChevronDown,
  faChevronUp,
  faSort,
  faSortUp,
  faSortDown,
  faUsers,
  faMapMarkerAlt,
  faDollarSign
} from '@fortawesome/free-solid-svg-icons';
import { customerService } from '../../services/customerService';
import { reservationService } from '../../services/reservationService';
import { destinationService } from '../../services/destinationService';
import { companyService } from '../../services/companyService';
import { volService } from '../../services/volService';
import { agencyService } from '../../services/agencyService';
import { classeService } from '../../services/classService';

const ReservationsByAgencie = () => {
    const [reservationsByCustomer, setReservationsByCustomer] = useState([]);
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
    const [customers, setCustomers] = useState([]);
    const [customerId, setCustomerId] = useState('');
    const [allCustomer, setAllCustomer] = useState([]);
    const [filter, setFilter] = useState('all');
    const [filters, setFilters] = useState({
        status: 'all',
        startDate: '',
        endDate: '',
        agency: '',
        customer: ''
    });
    const [cancellingId, setCancellingId] = useState(null);
    const [expandedAgencies, setExpandedAgencies] = useState({});
    const [sortConfig, setSortConfig] = useState({ key: 'startAt', direction: 'desc' });
    const [selectedReservations, setSelectedReservations] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        demand: 0
    });

    useEffect(() => {
        fetchCustomersAndReservations();
        fetchVols();
        fetchClasses();
        fetchCompanies();
        fetchDestinations();
        fetchAgencies();
        fetchCustomersAll();
    }, []);

    useEffect(() => {
        calculateStats();
    }, [reservationsByCustomer]);

    const fetchCustomersAndReservations = async () => {
        setLoading(true);
        try {
            const agenciesResponse = await agencyService.getUserAgencies();
            const agenciesList = Array.isArray(agenciesResponse.data) ? agenciesResponse.data : [];
            setCustomers(agenciesList);

            const reservationsPromises = agenciesList.map(async (customer) => {
                const reservationResponse = await reservationService.getReservationsByAgency(customer.id);
                return {
                    customer,
                    reservations: reservationResponse.data || []
                };
            });

            const customerReservations = await Promise.all(reservationsPromises);
            setReservationsByCustomer(customerReservations);
        } catch (err) {
            setError('Erreur lors du chargement des données');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchVols = async () => {
        try {
            const response = await volService.getVols();
            setVols(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Failed to fetch vols');
        }
    };

    const fetchCustomersAll = async () => {
        try {
            const response = await customerService.getAllCustomersWithoutRestriction();
            setAllCustomer(response.data || []);
        } catch (err) {
            setError('Failed to fetch customers');
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await classeService.getClasses();
            setClasses(response || []);
        } catch (err) {
            setError('Failed to fetch classes');
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await companyService.getCompanies();
            setCompanies(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Failed to fetch companies');
        }
    };

    const fetchDestinations = async () => {
        try {
            const response = await destinationService.getDestinations();
            setDestinations(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Failed to fetch destinations');
        }
    };

    const fetchAgencies = async () => {
        try {
            const response = await agencyService.getAgencies({ page, search });
            if (response.pagination) {
                setTotalPages(response.pagination.page);
            } else {
                setTotalPages(1);
            }
            setAgencies(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Fetch error:', err.response ? err.response.data : err.message);
            setError('Failed to fetch agencies');
        }
    };

    const handleCancelReservation = async (reservationId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
            return;
        }

        setCancellingId(reservationId);
        try {
            await reservationService.cancelReservation(reservationId);
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

    const calculateStats = () => {
        let statsData = {
            total: 0,
            pending: 0,
            confirmed: 0,
            cancelled: 0,
            demand: 0
        };

        reservationsByCustomer.forEach(customerData => {
            customerData.reservations.forEach(reservation => {
                statsData.total++;
                const status = reservation.status.toLowerCase();
                if (status === 'pending') statsData.pending++;
                if (status === 'confirmed') statsData.confirmed++;
                if (status === 'cancelled') statsData.cancelled++;
                if (status === 'demand') statsData.demand++;
            });
        });

        setStats(statsData);
    };

    const toggleAgencyExpansion = (agencyId) => {
        setExpandedAgencies(prev => ({
            ...prev,
            [agencyId]: !prev[agencyId]
        }));
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortedReservations = (reservations) => {
        if (!sortConfig.key) return reservations;

        return [...reservations].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    const filteredReservations = reservationsByCustomer.map((customerData) => {
        const filteredData = customerData.reservations.filter((reservation) => {
            const { status, startAt, endAt } = reservation;

            if (filters.status !== 'all' && status.toLowerCase() !== filters.status.toLowerCase()) {
                return false;
            }

            if (filters.startDate && new Date(startAt) < new Date(filters.startDate)) {
                return false;
            }

            if (filters.endDate && new Date(endAt) > new Date(filters.endDate)) {
                return false;
            }

            if (filters.agency && reservation.agencyId !== parseInt(filters.agency)) {
                return false;
            }

            if (filters.customer && reservation.customerId !== parseInt(filters.customer)) {
                return false;
            }

            return true;
        });

        return { ...customerData, reservations: filteredData };
    }).filter(customerData => customerData.reservations.length > 0);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: faClock };
            case 'confirmed':
                return { bg: 'bg-green-100', text: 'text-green-800', icon: faCheckCircle };
            case 'cancelled':
                return { bg: 'bg-red-100', text: 'text-red-800', icon: faTimes };
            case 'demand':
                return { bg: 'bg-blue-100', text: 'text-blue-800', icon: faExclamationTriangle };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800', icon: faCircle };
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCustomerById = (id) => {
        if (!allCustomer || !allCustomer.length) return 'Unknown';
        const customerItem = allCustomer.find((item) => item.id === parseInt(id));
        return customerItem
            ? `${customerItem.firstName || 'Unknown'} ${customerItem.lastName || 'Unknown'}`
            : 'Unknown';
    };

    const getAgenciesById = (id) => {
        if (!agencies || !agencies.length) return 'Unknown';
        const agencyItem = agencies.find((item) => item.id === parseInt(id));
        return agencyItem ? agencyItem.name : 'Unknown';
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

    const StatusBadge = ({ status }) => {
        const statusConfig = getStatusColor(status);
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                <FontAwesomeIcon icon={statusConfig.icon} className="mr-1.5 w-3 h-3" />
                {status}
            </span>
        );
    };

    const LoadingSpinner = () => (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Chargement des réservations...</p>
        </div>
    );

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
                                <FontAwesomeIcon icon={faPlane} className="text-white w-6 h-6" />
                            </div>
                            <span>Gestion des Réservations</span>
                        </h1>
                        <p className="text-gray-600 mt-2">Suivez et gérez toutes les réservations de vos agences</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FontAwesomeIcon icon={faFilter} className="text-gray-600" />
                            <span className="font-medium">Filtres</span>
                            {showFilters ? 
                                <FontAwesomeIcon icon={faChevronUp} className="text-gray-400" /> :
                                <FontAwesomeIcon icon={faChevronDown} className="text-gray-400" />
                            }
                        </button>
                        
                        <div className="relative">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher une réservation..."
                                className="pl-10 pr-4 py-2.5 w-full md:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <FontAwesomeIcon icon={faUsers} className="text-blue-600 w-5 h-5" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">En attente</p>
                                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                            </div>
                            <div className="bg-yellow-100 p-2 rounded-lg">
                                <FontAwesomeIcon icon={faClock} className="text-yellow-600 w-5 h-5" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Confirmées</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">{stats.confirmed}</p>
                            </div>
                            <div className="bg-green-100 p-2 rounded-lg">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 w-5 h-5" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Annulées</p>
                                <p className="text-2xl font-bold text-red-600 mt-1">{stats.cancelled}</p>
                            </div>
                            <div className="bg-red-100 p-2 rounded-lg">
                                <FontAwesomeIcon icon={faTimes} className="text-red-600 w-5 h-5" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Demandes</p>
                                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.demand}</p>
                            </div>
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-blue-600 w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
                <div className="bg-white rounded-xl shadow-lg mb-6 p-5 border border-gray-200 animate-slideDown">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                            <select
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="pending">En attente</option>
                                <option value="confirmed">Confirmée</option>
                                <option value="cancelled">Annulée</option>
                                <option value="demand">Demande</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                            <div className="relative">
                                <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                            <div className="relative">
                                <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Agence</label>
                            <select
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                value={filters.agency}
                                onChange={(e) => setFilters({ ...filters, agency: e.target.value })}
                            >
                                <option value="">Toutes les agences</option>
                                {agencies.map(agency => (
                                    <option key={agency.id} value={agency.id}>{agency.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-5 pt-5 border-t border-gray-200">
                        <button
                            onClick={() => setFilters({
                                status: 'all',
                                startDate: '',
                                endDate: '',
                                agency: '',
                                customer: ''
                            })}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Réinitialiser
                        </button>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Appliquer les filtres
                        </button>
                    </div>
                </div>
            )}

            {/* Reservations List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {error && (
                    <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {filteredReservations.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FontAwesomeIcon icon={faPlane} className="text-gray-400 w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation trouvée</h3>
                        <p className="text-gray-500">Aucune réservation ne correspond à vos critères de recherche.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredReservations.map((customerData) => (
                            <div key={customerData.customer.id} className="p-5 hover:bg-gray-50 transition-colors">
                                {/* Agency Header */}
                                <div 
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => toggleAgencyExpansion(customerData.customer.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-2.5 rounded-lg">
                                            <FontAwesomeIcon icon={faBuilding} className="text-purple-600 w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {customerData.customer.name}
                                            </h3>
                                            {customerData.customer.location && (
                                                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3" />
                                                    {customerData.customer.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                            {customerData.reservations.length} réservation{customerData.reservations.length > 1 ? 's' : ''}
                                        </span>
                                        <FontAwesomeIcon 
                                            icon={expandedAgencies[customerData.customer.id] ? faChevronUp : faChevronDown} 
                                            className="text-gray-400"
                                        />
                                    </div>
                                </div>

                                {/* Reservations List */}
                                {expandedAgencies[customerData.customer.id] && (
                                    <div className="mt-4 space-y-3 animate-fadeIn">
                                        {getSortedReservations(customerData.reservations).map((reservation) => (
                                            <div key={reservation.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    {/* Left Column */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <StatusBadge status={reservation.status} />
                                                            <span className="text-sm text-gray-500">
                                                                #{reservation.id?.toString().slice(-8) || 'N/A'}
                                                            </span>
                                                        </div>
                                                        
                                                        <h4 className="text-base font-semibold text-gray-900 mb-1">
                                                            {reservation.vols?.flight.name || 'Vol non spécifié'}
                                                        </h4>
                                                        
                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                            <div className="flex items-center gap-1.5">
                                                                <FontAwesomeIcon icon={faCalendarAlt} className="w-3.5 h-3.5" />
                                                                <span>{formatDate(reservation.startAt)}</span>
                                                                <span className="mx-1">→</span>
                                                                <span>{formatDate(reservation.endAt)}</span>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-1.5">
                                                                <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5" />
                                                                <span>{getCustomerById(reservation.customerId)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right Column - Actions */}
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <Link
                                                                to={`/agency/reservations/${reservation.id}`}
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                                            >
                                                                <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                                                                Détails
                                                            </Link>
                                                            
                                                            {reservation.status.toLowerCase() === 'demand' && (
                                                                <Link
                                                                    to={`/agency/proposer/${reservation.id}`}
                                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                                                >
                                                                    <FontAwesomeIcon icon={faPlaneDeparture} className="w-3.5 h-3.5" />
                                                                    Proposer
                                                                </Link>
                                                            )}
                                                            
                                                            {reservation.status === 'pending' && (
                                                                <button
                                                                    onClick={() => handleCancelReservation(reservation.id)}
                                                                    disabled={cancellingId === reservation.id}
                                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    {cancellingId === reservation.id ? (
                                                                        <>
                                                                            <div className="w-3.5 h-3.5 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>
                                                                            Annulation...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5" />
                                                                            Annuler
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Additional Info */}
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <FontAwesomeIcon icon={faBuilding} className="text-gray-400 w-4 h-4" />
                                                            <span className="text-gray-600">Agence:</span>
                                                            <span className="font-medium">{getAgenciesById(reservation.agencyId)}</span>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2">
                                                            <FontAwesomeIcon icon={faDollarSign} className="text-gray-400 w-4 h-4" />
                                                            <span className="text-gray-600">Prix:</span>
                                                            <span className="font-medium">{reservation.totalPrice?.toLocaleString() || '0'} FCFA</span>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2">
                                                            <FontAwesomeIcon icon={faFileAlt} className="text-gray-400 w-4 h-4" />
                                                            <span className="text-gray-600">Créé le:</span>
                                                            <span className="font-medium">{formatDateTime(reservation.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4" />
                    <span>{filteredReservations.reduce((acc, curr) => acc + curr.reservations.length, 0)} réservation(s) affichée(s)</span>
                </div>
                
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <FontAwesomeIcon icon={faPrint} className="w-4 h-4" />
                        Imprimer
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
                        Exporter
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReservationsByAgencie;
