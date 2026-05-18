import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState, useCallback } from 'react';
import { agencyAssociationService } from '../../services/agencyAssociationService';
import { agencyService } from '../../services/agencyService';
import { volService } from '../../services/volService';
import { classeService } from '../../services/classService';

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ClassAgency = () => {
    const [classAgencies, setClassAgencies] = useState([]);
    const [flightAgencies, setFlightAgencies] = useState([]);
    const [classes, setClasses] = useState([]);
    const [userAgency, setUserAgency] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingAgency, setLoadingAgency] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ 
        classId: '', 
        agencyVolId: '', 
        price: '', 
        status: 'active' 
    });

    // ✅ Récupérer l'agence de l'utilisateur connecté
    const fetchUserAgency = useCallback(async () => {
        setLoadingAgency(true);
        try {
            const response = await agencyService.getUserAgencies();
            console.log('🏢 Réponse agence utilisateur:', response);
            
            let agencyData = null;
            
            if (response?.data) {
                if (Array.isArray(response.data) && response.data.length > 0) {
                    agencyData = response.data[0];
                } else if (response.data && response.data.id) {
                    agencyData = response.data;
                }
            } else if (Array.isArray(response) && response.length > 0) {
                agencyData = response[0];
            } else if (response && response.id) {
                agencyData = response;
            }
            
            if (agencyData) {
                console.log('✅ Agence trouvée:', agencyData);
                setUserAgency(agencyData);
                return agencyData;
            } else {
                console.log('⚠️ Aucune agence trouvée');
                setError("Aucune agence associée à votre compte");
                return null;
            }
        } catch (error) {
            console.error('❌ Erreur récupération agence:', error);
            setError("Impossible de récupérer votre agence");
            return null;
        } finally {
            setLoadingAgency(false);
        }
    }, []);

    // ✅ Récupérer les FlightAgency de l'agence connectée
    const fetchFlightAgenciesByAgency = useCallback(async (agencyId) => {
        try {
            const response = await agencyAssociationService.getAllFlightAgencies();
            console.log('📦 Tous les FlightAgency:', response);
            
            // Extraire les données
            let allFlightAgencies = [];
            if (response?.data) {
                allFlightAgencies = Array.isArray(response.data) ? response.data : [];
            } else if (Array.isArray(response)) {
                allFlightAgencies = response;
            }
            
            // Filtrer par agence
            const agencyFlights = allFlightAgencies.filter(flight => 
                flight.agencyId === agencyId || flight.agency?.id === agencyId
            );
            
            console.log(`✅ ${agencyFlights.length} FlightAgency trouvés pour l'agence ${agencyId}`);
            return agencyFlights;
        } catch (error) {
            console.error('❌ Erreur récupération FlightAgency:', error);
            return [];
        }
    }, []);

    // ✅ Récupérer les ClassAgency de l'agence connectée
    const fetchClassAgenciesByAgency = useCallback(async (agencyId, agencyFlightIds) => {
        try {
            const response = await agencyAssociationService.getAllClassAgencies();
            console.log('📦 Toutes les ClassAgency:', response);
            
            // ✅ CORRECTION: Extraire correctement les données selon la structure de votre API
            let allClassAgencies = [];
            
            // Votre API retourne { count: 1, data: [...] }
            if (response?.data && Array.isArray(response.data)) {
                allClassAgencies = response.data;
            } else if (response?.data?.data && Array.isArray(response.data.data)) {
                allClassAgencies = response.data.data;
            } else if (Array.isArray(response)) {
                allClassAgencies = response;
            }
            
            console.log('📦 ClassAgencies extraites:', allClassAgencies);
            
            // Filtrer par les IDs des vols de l'agence
            const agencyClasses = allClassAgencies.filter(classItem => {
                // Vérifier différentes possibilités
                const volId = classItem.agencyVolId || classItem.agencyVol?.id;
                return volId && agencyFlightIds.includes(volId);
            });
            
            console.log(`✅ ${agencyClasses.length} ClassAgency trouvées pour l'agence ${agencyId}`);
            return agencyClasses;
        } catch (error) {
            console.error('❌ Erreur récupération ClassAgency:', error);
            return [];
        }
    }, []);

    // ✅ Méthode principale pour récupérer toutes les données
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const agency = await fetchUserAgency();
            
            if (!agency) {
                setLoading(false);
                return;
            }

            console.log('🏢 Agence connectée:', agency);

            // Récupérer les classes
            const classesRes = await classeService.getClasses();
            let classesData = [];
            if (classesRes?.data) {
                classesData = Array.isArray(classesRes.data) ? classesRes.data : [];
            } else if (Array.isArray(classesRes)) {
                classesData = classesRes;
            }
            setClasses(classesData);

            // Récupérer les FlightAgency
            const agencyFlights = await fetchFlightAgenciesByAgency(agency.id);
            setFlightAgencies(agencyFlights);
            
            const agencyFlightIds = agencyFlights.map(f => f.id);
            console.log('🆔 IDs des vols de l\'agence:', agencyFlightIds);

            // Récupérer les ClassAgency
            if (agencyFlightIds.length > 0) {
                const agencyClasses = await fetchClassAgenciesByAgency(agency.id, agencyFlightIds);
                console.log('📊 ClassAgency finales:', agencyClasses);
                setClassAgencies(agencyClasses);
            } else {
                setClassAgencies([]);
            }

        } catch (err) {
            console.error("❌ Fetch error:", err);
            setError("Échec du chargement des données. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    }, [fetchUserAgency, fetchFlightAgenciesByAgency, fetchClassAgenciesByAgency]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!formData.classId || !formData.agencyVolId) {
            setError('Veuillez sélectionner une classe et un vol agence');
            setLoading(false);
            return;
        }

        if (!formData.price || formData.price.trim() === '') {
            setError('Le prix est requis');
            setLoading(false);
            return;
        }

        const price = parseFloat(formData.price);
        if (isNaN(price) || price <= 0) {
            setError('Le prix doit être un nombre positif');
            setLoading(false);
            return;
        }

        const selectedFlight = flightAgencies.find(f => f.id === parseInt(formData.agencyVolId));
        if (!selectedFlight) {
            setError('Vol non autorisé pour votre agence');
            setLoading(false);
            return;
        }

        const submitData = {
            classId: parseInt(formData.classId),
            agencyVolId: parseInt(formData.agencyVolId),
            price: price,
            status: formData.status
        };

        try {
            if (editMode) {
                await agencyAssociationService.updateClassAgency(editId, submitData);
                setSuccess('Association mise à jour avec succès!');
            } else {
                await agencyAssociationService.createClassAgency(submitData);
                setSuccess('Association créée avec succès!');
            }
            
            setFormData({ classId: '', agencyVolId: '', price: '', status: 'active' });
            setEditMode(false);
            setEditId(null);
            
            fetchData();
        } catch (err) {
            console.error('❌ Erreur sauvegarde:', err);
            setError(err.response?.data?.message || 'Échec de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (classAgency) => {
        setFormData({
            classId: classAgency.classId.toString(),
            agencyVolId: classAgency.agencyVolId.toString(),
            price: classAgency.price?.toString() || '',
            status: classAgency.status
        });
        setEditMode(true);
        setEditId(classAgency.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette association ?')) {
            return;
        }

        try {
            await agencyAssociationService.deleteClassAgency(id);
            setSuccess('Association supprimée avec succès!');
            fetchData();
        } catch (err) {
            console.error('❌ Erreur suppression:', err);
            setError('Échec de la suppression');
        }
    };

    // ✅ Helper pour obtenir le libellé d'un vol agence
    const getFlightAgencyLabel = (flightAgency) => {
        if (!flightAgency) return 'Vol agence inconnu';
        
        const agency = flightAgency.agency;
        const flight = flightAgency.flight;
        
        const agencyName = agency?.name || 'Agence inconnue';
        const originName = flight?.origin?.name || 'Origine inconnue';
        const destinationName = flight?.destination?.name || 'Destination inconnue';
        const companyName = flight?.companyVol?.name || flight?.companyId || 'Compagnie inconnue';
        const flightName = flight?.name || 'Vol inconnu';
        
        return `${agencyName} - ${flightName} - ${companyName} (${originName} → ${destinationName}) - Départ: ${formatDateTime(flightAgency.departureTime)}`;
    };

    // ✅ Helper pour obtenir les détails d'un vol
    const getFlightDetails = (agencyVolId) => {
        const flight = flightAgencies.find(f => f.id === agencyVolId);
        if (!flight) return null;
        
        return {
            flightName: flight.flight?.name || 'N/A',
            agencyName: flight.agency?.name || 'N/A',
            origin: flight.flight?.origin?.name || 'N/A',
            destination: flight.flight?.destination?.name || 'N/A',
            company: flight.flight?.companyVol?.name || 'N/A',
            departureTime: flight.departureTime
        };
    };

    // ✅ Helper pour obtenir le nom de la classe
    const getClassName = (classItem) => {
        // La classe peut être dans classItem.class ou directement dans classItem
        return classItem.class?.name || 
               classItem.className || 
               (classes.find(c => c.id === classItem.classId)?.name) || 
               'Classe inconnue';
    };

    if (loadingAgency) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mb-4"></div>
                    <p className="text-gray-600">Chargement de votre agence...</p>
                </div>
            </div>
        );
    }

    if (!userAgency && !loadingAgency) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Agence non trouvée</h2>
                    <p className="text-gray-600 mb-6">
                        Vous n'êtes pas associé à une agence. Veuillez contacter l'administrateur.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        Gestion des prix par classe
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">
                        Agence: <span className="font-semibold text-orange-600">{userAgency?.name}</span>
                    </p>
                </div>

                {error && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="text-sm sm:text-base text-red-700">{error}</p>
                    </div>
                )}
                
                {success && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="text-sm sm:text-base text-green-700">{success}</p>
                    </div>
                )}

                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
                        {editMode ? 'Modifier le prix' : 'Définir un prix pour une classe'}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Classe <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="classId"
                                    value={formData.classId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm"
                                    required
                                >
                                    <option value="">Sélectionnez une classe</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name || `Classe #${cls.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Vol Agence <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="agencyVolId"
                                    value={formData.agencyVolId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm disabled:bg-gray-100"
                                    required
                                    disabled={flightAgencies.length === 0}
                                >
                                    <option value="">
                                        {flightAgencies.length === 0 
                                            ? 'Aucun vol disponible' 
                                            : 'Sélectionnez un vol agence'}
                                    </option>
                                    {flightAgencies.map((fa) => (
                                        <option key={fa.id} value={fa.id}>
                                            {getFlightAgencyLabel(fa)}
                                        </option>
                                    ))}
                                </select>
                                {flightAgencies.length === 0 && (
                                    <p className="text-xs text-yellow-600 mt-1">
                                        Aucun vol disponible pour votre agence
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Prix (FCFA) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    step="100"
                                    min="100"
                                    placeholder="Ex: 15000"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Statut
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm"
                                >
                                    <option value="active">Actif</option>
                                    <option value="inactive">Inactif</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full sm:w-auto px-6 py-2.5 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? 'En cours...' : editMode ? 'Mettre à jour' : 'Créer'}
                            </button>
                            
                            {editMode && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditMode(false);
                                        setEditId(null);
                                        setFormData({ classId: '', agencyVolId: '', price: '', status: 'active' });
                                    }}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                >
                                    Annuler
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
                        Liste des prix par classe
                    </h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-600 mb-4"></div>
                            <p className="text-gray-600">Chargement...</p>
                        </div>
                    ) : (
                        <>
                            <div className="block sm:hidden space-y-4">
                                {classAgencies.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">
                                        Aucune association trouvée pour votre agence
                                    </p>
                                ) : (
                                    classAgencies.map((item) => {
                                        const flight = getFlightDetails(item.agencyVolId);
                                        const className = getClassName(item);
                                        
                                        return (
                                            <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {className}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {flight?.flightName}
                                                            </p>
                                                        </div>
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                            item.status === 'active' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {item.status === 'active' ? 'Actif' : 'Inactif'}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="text-sm">
                                                        <p className="text-gray-600">
                                                            <span className="font-medium">Trajet:</span> {flight?.origin} → {flight?.destination}
                                                        </p>
                                                        <p className="text-gray-600 mt-1">
                                                            <span className="font-medium">Compagnie:</span> {flight?.company}
                                                        </p>
                                                        <p className="text-gray-600 mt-1">
                                                            <span className="font-medium">Départ:</span> {flight?.departureTime ? formatDateTime(flight.departureTime) : 'N/A'}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                                        <p className="text-lg font-bold text-green-600">
                                                            {item.price ? `${parseFloat(item.price).toLocaleString()} FCFA` : '-'}
                                                        </p>
                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={() => handleEdit(item)}
                                                                className="text-orange-600 hover:text-orange-800"
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="hidden sm:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Classe
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Vol
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Trajet
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Compagnie
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Départ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Prix
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Statut
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {classAgencies.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                                    Aucune association trouvée pour votre agence
                                                </td>
                                            </tr>
                                        ) : (
                                            classAgencies.map((item) => {
                                                const flight = getFlightDetails(item.agencyVolId);
                                                const className = getClassName(item);
                                                
                                                return (
                                                    <tr key={item.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {className}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {flight?.flightName}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {flight?.origin} → {flight?.destination}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {flight?.company}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500">
                                                                {flight?.departureTime ? formatDateTime(flight.departureTime) : 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm font-bold text-green-600">
                                                                {item.price ? `${parseFloat(item.price).toLocaleString()} FCFA` : '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                                item.status === 'active' 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {item.status === 'active' ? 'Actif' : 'Inactif'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                onClick={() => handleEdit(item)}
                                                                className="text-orange-600 hover:text-orange-900 mr-4"
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClassAgency;
