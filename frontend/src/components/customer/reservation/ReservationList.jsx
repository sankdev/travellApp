import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../../../services/customerService';
import { reservationService } from '../../../services/reservationService';
import { destinationService } from '../../../services/destinationService';

const ReservationList = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled, active
    const [destinations, setDestinations] = useState([]);
    useEffect(() => {
        fetchReservations();
        fetchDestinations();
    }, []);

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

    const handleCancelReservation = async (id) => {
        if (window.confirm('Are you sure you want to cancel this reservation?')) {
            try {
                await reservationService.cancelReservation(id);
                fetchReservations(); // Refresh the list
            } catch (err) {
                setError('Failed to cancel reservation');
            }
        }
    };
   const fetchDestinations = async () => {
           try {
               const response = await destinationService.getDestinations();
               console.log('destinationList',response)
               setDestinations(response);
           } catch (err) {
               setError('Failed to fetch destinations');
           }
       };
    const getDestinationById = (id) => {
        if (!destinations || !destinations.length) return { country: 'Unknown', city: 'Unknown' };
        const destination = destinations.find((item) => item.id === parseInt(id));
        return destination 
            ? { country: destination.country || 'Unknown', city: destination.city || 'Unknown',name:destination.name ||'Unknown' } 
            : { country: 'Unknown', city: 'Unknown' };
    };
    const filteredReservations = reservations.filter(reservation => {
        if (filter === 'all') return true;
        return reservation.status.toLowerCase() === filter;
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

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">My Reservations</h1>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-200 shadow-md rounded-lg p-6 mb-8 max-w-7xl mx-auto">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h2 className="text-lg font-bold text-indigo-600 mb-6 text-center">
                            <i className="fas fa-clipboard-list mr-2"></i>
                            Reservation List
                        </h2>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        <Link
                            to="/customer/reservations/create"
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            New Reservation
                        </Link>
                    </div>
                </div>

                <div className="mt-4 mb-6">
                    <div className="sm:flex sm:items-center space-x-4">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                                filter === 'all'
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                                filter === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('confirmed')}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                                filter === 'confirmed'
                                    ? 'bg-green-100 text-green-700'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Confirmed
                        </button>
                        <button
                            onClick={() => setFilter('cancelled')}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                                filter === 'cancelled'
                                    ? 'bg-red-100 text-red-700'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Cancelled
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                                filter === 'active'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Active
                        </button>
                    </div>
                </div>

                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                Destination
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Dates
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Status
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Passengers
                                            </th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {filteredReservations.map((reservation) => (
                                            <tr key={reservation.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                    <div className="font-medium text-gray-900">
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                    {(() => {
                                                        const destination = getDestinationById(reservation?.startDestinationId || 'Unknown');
                                                        return `${destination.country}`
                                                    })()}
                                                </dd>
                                                    </div>
                                                    <div className="text-gray-500">
                                                       <dd className="mt-1 text-sm text-gray-900">
                                {(() => {
                                    const destination = getDestinationById(reservation?.endDestinationId || 'Unknown');
                                    return `${destination.city}, ${destination.country}`;
                                })()}
                            </dd>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <div>
                                                        {formatDate(reservation.startAt)}
                                                    </div>
                                                    <div>
                                                        {formatDate(reservation.endAt)}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(reservation.status)}`}>
                                                        {reservation.status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {reservation.passengers.length} passenger(s)
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <Link
                                                        to={`/customer/reservations/${reservation.id}`}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                    >
                                                        View
                                                    </Link>
                                                    {reservation.status === 'Pending' && (
                                                        <button
                                                            onClick={() => handleCancelReservation(reservation.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReservationList;
