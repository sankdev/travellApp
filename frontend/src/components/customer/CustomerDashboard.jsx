import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../../services/customerService';

const CustomerDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        profile: null,
        reservations: [],
        invoices: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // useEffect(() => {
    //     const fetchDashboardData = async () => {
    //         try {
    //             const [profile, reservations, invoices] = await Promise.all([
    //                 customerService.getCustomerProfile(),
    //                 // customerService.getCustomerReservations(),
    //                 // customerService.getCustomerInvoices()
    //             ]);

    //             setDashboardData({
    //                 profile: profile.data,
    //                 reservations: reservations.data,
    //                 invoices: invoices.data
    //             });
    //         } catch (err) {
    //             setError(err.message || 'Failed to load dashboard data');
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchDashboardData();
    // }, []);
useEffect(() => {
    const fetchDashboardData = async () => {
        const results = await Promise.allSettled([
            customerService.getCustomerProfile(),
            customerService.getCustomerReservations(),
            customerService.getCustomerInvoices()
        ]);

        const [profileResult, reservationsResult, invoicesResult] = results;

        // Vérifiez chaque résultat et définissez les données en conséquence
        if (profileResult.status === 'fulfilled') {
            setDashboardData(prev => ({ ...prev, profile: profileResult.value.data }));
        } else {
            console.error('Error fetching profile:', profileResult.reason);
        }

        if (reservationsResult.status === 'fulfilled') {
            setDashboardData(prev => ({ ...prev, reservations: reservationsResult.value.data }));
        } else {
            console.error('Error fetching reservations:', reservationsResult.reason);
        }

        if (invoicesResult.status === 'fulfilled') {
            setDashboardData(prev => ({ ...prev, invoices: invoicesResult.value.data }));
        } else {
            console.error('Error fetching invoices:', invoicesResult.reason);
        }

        setLoading(false);
    };

    fetchDashboardData();
}, []);
    // if (loading) {
    //     return (
    //         <div className="flex justify-center items-center h-64">
    //             <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
    //         </div>
            
    //     );
    // }
    

    if (error) {
        return (
            <div className="text-center p-4">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    const activeReservations = dashboardData.reservations.filter(res => res.status === 'active');
    const unpaidInvoices = dashboardData.invoices.filter(inv => inv.status === 'unpaid');

    return (
        <div className="space-y-6">
            {/* Résumé */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                            Active Reservations
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {activeReservations.length}
                        </dd>
                        <Link
                            to="/customer/reservations"
                            className="text-indigo-600 hover:text-indigo-900 mt-2 block"
                        >
                            View Reservations
                        </Link>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                            Unpaid Invoices
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {unpaidInvoices.length}
                        </dd>
                        <Link
                            to="/customer/invoices"
                            className="text-indigo-600 hover:text-indigo-900 mt-2 block"
                        >
                            View Invoices
                        </Link>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Trips
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {dashboardData.reservations.length}
                        </dd>
                    </div>
                </div>
            </div>

            {/* Réservations récentes */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Recent Reservations
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Destination
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dashboardData.reservations.slice(0, 5).map((reservation) => (
                                    <tr key={reservation.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {reservation.destination?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(reservation.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                reservation.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {reservation.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                                            <Link to={`/customer/reservations/${reservation.id}`}>
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4">
                        <Link
                            to="/customer/reservations"
                            className="text-indigo-600 hover:text-indigo-900"
                        >
                            View all reservations →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Factures récentes */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Recent Invoices
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Invoice #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Due Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dashboardData.invoices.slice(0, 5).map((invoice) => (
                                    <tr key={invoice.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            #{invoice.number}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            ${invoice.amount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                invoice.status === 'paid'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(invoice.dueDate).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4">
                        <Link
                            to="/customer/invoices"
                            className="text-indigo-600 hover:text-indigo-900"
                        >
                            View all invoices →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
