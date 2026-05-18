import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { reservationService } from '../../services/reservationService';

const CustomerDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        profile: null,
        reservations: [],
        invoices: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [warnings, setWarnings] = useState([]);

    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;

        const fetchDashboardData = async () => {
            setLoading(true);
            setError('');
            setWarnings([]);

            try {
                const [profileRes, reservationsRes, invoicesRes] = await Promise.allSettled([
                    customerService.getCustomerProfile(),
                    reservationService.getReservations(),
                    customerService.getCustomerInvoices()
                ]);

                console.log("Profile response:", profileRes);
                console.log("Reservations response:", reservationsRes);
                console.log("Invoices response:", invoicesRes);

                const newWarnings = [];
                const newData = {
                    profile: null,
                    reservations: [],
                    invoices: []
                };

                // Traitement du profil
                if (profileRes.status === "fulfilled") {
                    if (profileRes.value?.data) {
                        newData.profile = profileRes.value.data;
                    } else {
                        newWarnings.push("Aucune donnée de profil disponible");
                    }
                } else {
                   // newWarnings.push(`Profil: ${profileRes.reason?.message || "Erreur de chargement"}`);
                          mewWarnings.push("pas de donnees disponibles")               
 }

                // Traitement des réservations
                if (reservationsRes.status === "fulfilled") {
                    if (reservationsRes.value?.data && Array.isArray(reservationsRes.value.data)) {
                        newData.reservations = reservationsRes.value.data;
                    } else {
                        newWarnings.push("Aucune réservation trouvée");
                        newData.reservations = [];
                    }
                } else {
                   // newWarnings.push(`Réservations: ${reservationsRes.reason?.message || "Erreur de chargement"}`);
                       newWarnings.push("pas de donnees disponibles")
                         }

                // Traitement des factures - avec plusieurs niveaux de vérification
                if (invoicesRes.status === "fulfilled") {
                    const invoicesData = invoicesRes.value?.data;
                    
                    if (invoicesData) {
                        // Vérifier différents formats possibles
                        if (Array.isArray(invoicesData)) {
                            newData.invoices = invoicesData;
                        } else if (invoicesData.data && Array.isArray(invoicesData.data)) {
                            newData.invoices = invoicesData.data;
                        } else if (invoicesData.invoices && Array.isArray(invoicesData.invoices)) {
                            newData.invoices = invoicesData.invoices;
                        } else {
                            newWarnings.push("Format des factures non reconnu");
                            newData.invoices = [];
                        }
                    } else {
                        newWarnings.push("Aucune facture disponible");
                        newData.invoices = [];
                    }
                } else {
                    //newWarnings.push(`Factures: ${invoicesRes.reason?.message || "Erreur de chargement"}`);
                    newWarnings.push(" pas de Factures disponibles")
                         newData.invoices = [];
                }

                // Vérifier si le composant est toujours monté
                if (isMounted.current) {
                    setDashboardData(newData);
                    setWarnings(newWarnings);

                    // Définir une erreur principale seulement si tout a échoué
                    const successCount = [newData.profile, newData.reservations.length, newData.invoices.length].filter(Boolean).length;
                    if (successCount === 0) {
                        setError("Impossible de charger les données du tableau de bord");
                    }
                }

            } catch (err) {
                if (isMounted.current) {
                      //setError( error.message || "Erreur lors du chargement des données");
                       setError("pas des donnees disponibles")
                }

            } finally {
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        fetchDashboardData();

        return () => {
            isMounted.current = false;
        };
    }, []);

    console.log('Dashboard data:', dashboardData);
    console.log('Warnings:', warnings);

    // Affichage du chargement
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
                <span className="ml-4 text-gray-600">Chargement du tableau de bord...</span>
            </div>
        );
    }

    // Affichage des erreurs principales
    if (error && !dashboardData.reservations.length && !dashboardData.invoices.length) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="text-red-500 text-xl mb-4">❌</div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur de chargement</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    // Calcul des données pour l'affichage
    const activeReservations = dashboardData.reservations.filter(res => 
        res.status === 'confirmed' || res.status === 'active'
    );
    const unpaidInvoices = dashboardData.invoices.filter(inv => 
        inv.status === 'unpaid' || inv.status === 'pending'
    );

    return (
        <div className="space-y-6">
            {/* Affichage des avertissements */}
            {warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="text-yellow-600 mr-3">⚠️</div>
                        <div>
                            <h4 className="text-sm font-semibold text-yellow-800">
                                Informations partielles
                            </h4>
                            <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                                {warnings.map((warning, index) => (
                                    <li key={index}>{warning}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Résumé */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Carte Réservations confirmées */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                            Réservations confirmées
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {activeReservations.length}
                        </dd>
                        {dashboardData.reservations.length > 0 ? (
                            <Link
                                to="/customer/reservations"
                                className="text-indigo-600 hover:text-indigo-900 mt-2 block"
                            >
                                Voir les réservations
                            </Link>
                        ) : (
                            <p className="text-gray-400 text-sm mt-2">Aucune réservation</p>
                        )}
                    </div>
                </div>

                {/* Carte Factures impayées */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                            Factures impayées
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {unpaidInvoices.length}
                        </dd>
                        {dashboardData.invoices.length > 0 ? (
                            <Link
                                to="/customer/invoices"
                                className="text-indigo-600 hover:text-indigo-900 mt-2 block"
                            >
                                Voir les factures
                            </Link>
                        ) : (
                            <p className="text-gray-400 text-sm mt-2">Aucune facture</p>
                        )}
                    </div>
                </div>

                {/* Carte Total des voyages */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                            Total des voyages
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {dashboardData.reservations.length}
                        </dd>
                        <p className="text-gray-400 text-sm mt-2">Toutes vos réservations</p>
                    </div>
                </div>
            </div>

            {/* Section Réservations récentes */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Réservations récentes
                    </h2>
                    
                    {dashboardData.reservations.length > 0 ? (
                        <>
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
                                                Statut
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
                                                    {reservation.startDestination?.city || 'N/A'} - {reservation.endDestination?.city || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {reservation.createdAt ? new Date(reservation.createdAt).toLocaleDateString() : 'Date inconnue'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        reservation.status === 'confirmed' || reservation.status === 'active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : reservation.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {reservation.status || 'Inconnu'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                                                    <Link to={`/customer/reservations/${reservation.id}`}>
                                                        Voir détails
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
                                    Voir toutes les réservations →
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-4xl mb-4">📋</div>
                            <p className="text-gray-500">Aucune réservation trouvée</p>
                            <Link
                                to="/reservations"
                                className="text-indigo-600 hover:text-indigo-900 mt-2 inline-block"
                            >
                                Faire une réservation
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Section Factures récentes */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Factures récentes
                    </h2>
                    
                    {dashboardData.invoices.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Référence
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Montant
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Statut
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date d'émission
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {dashboardData.invoices.slice(0, 5).map((invoice) => (
                                            <tr key={invoice.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {invoice.reference || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {invoice.amount ? `${invoice.amount} XOF` : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        invoice.status === 'paid'
                                                            ? 'bg-green-100 text-green-800'
                                                            : invoice.status === 'unpaid'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {invoice.status || 'Inconnu'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {invoice.emissionAt ? new Date(invoice.emissionAt).toLocaleDateString() : 'N/A'}
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
                                    Voir toutes les factures →
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-4xl mb-4">🧾</div>
                            <p className="text-gray-500">Aucune facture disponible</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
