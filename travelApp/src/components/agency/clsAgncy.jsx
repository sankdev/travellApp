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
    const [agencies, setAgencies] = useState([]);
    const [vols, setVols] = useState([]);
    const [classes, setClasses] = useState([]);
    const [formData, setFormData] = useState({ 
        classId: '', 
        agencyVolId: '', 
        price: '', 
        status: 'active' 
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    // Méthode pour récupérer toutes les données
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [classAgenciesRes, flightAgenciesRes, agenciesRes, volsRes, classesRes] = await Promise.all([
                agencyAssociationService.getAllClassAgencies(),
                agencyAssociationService.getUserFlightAgencies(),
                agencyService.getUserAgencies(),
                volService.getVols(),
                classeService.getClasses()
            ]);

            console.log('ClassAgencies response:', classAgenciesRes);
            console.log('Flight Agencies data:', flightAgenciesRes);

            // ✅ CORRECTION: Extraire correctement les données
            // La réponse peut être dans response.data ou directement dans response
            const classAgenciesData = classAgenciesRes?.data || classAgenciesRes || [];
            const flightAgenciesData = flightAgenciesRes?.data || flightAgenciesRes || [];
            const agenciesData = agenciesRes?.data || [];
            const volsData = Array.isArray(volsRes) ? volsRes : (volsRes?.data || []);
            const classesData = classesRes?.data || classesRes || [];

            // S'assurer que ce sont des tableaux
            setClassAgencies(Array.isArray(classAgenciesData) ? classAgenciesData : []);
            setFlightAgencies(Array.isArray(flightAgenciesData) ? flightAgenciesData : []);
            setAgencies(Array.isArray(agenciesData) ? agenciesData : []);
            setVols(Array.isArray(volsData) ? volsData : []);
            setClasses(Array.isArray(classesData) ? classesData : []);

        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to load data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

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

        // Validation
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

        // Préparer les données pour l'API
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
            
            // Reset form
            setFormData({ classId: '', agencyVolId: '', price: '', status: 'active' });
            setEditMode(false);
            setEditId(null);
            
            // Recharger les données
            fetchData();
        } catch (err) {
            console.error('Erreur sauvegarde:', err);
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
            console.error('Erreur suppression:', err);
            setError('Échec de la suppression');
        }
    };

    // Helper pour obtenir le libellé d'un vol agence dans le select
    const getFlightAgencyLabel = (flightAgency) => {
        if (!flightAgency) return 'Vol agence inconnu';
        
        const agency = flightAgency.agency;
        const flight = flightAgency.flight;
        
        const agencyName = agency?.name || 'Agence inconnue';
        
        // Utiliser les relations origin et destination du vol
        const originName = flight?.origin?.name || 'Origine inconnue';
        const destinationName = flight?.destination?.name || 'Destination inconnue';
        const companyName = flight?.companyVol?.name || flight?.companyId || 'Compagnie inconnue';
        
        const flightInfo = flight ? 
            `${flight.name} - ${companyName} (${originName} → ${destinationName})` : 
            `Vol #${flightAgency.volId}`;
        
        return `${agencyName} - ${flightInfo} - Départ: ${formatDateTime(flightAgency.departureTime)}`;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-orange-700">
                Gestion des prix par classe pour les vols agence
            </h1>

            {/* Messages */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            {/* Formulaire */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    {editMode ? 'Modifier le prix' : 'Définir un prix pour une classe'}
                </h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Sélection classe */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Classe <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="classId"
                                value={formData.classId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
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

                        {/* Sélection vol agence */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vol Agence <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="agencyVolId"
                                value={formData.agencyVolId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                required
                            >
                                <option value="">Sélectionnez un vol agence</option>
                                {flightAgencies.map((fa) => (
                                    <option key={fa.id} value={fa.id}>
                                        {getFlightAgencyLabel(fa)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Prix */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                required
                            />
                        </div>

                        {/* Statut */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Statut
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                            >
                                <option value="active">Actif</option>
                                <option value="inactive">Inactif</option>
                            </select>
                        </div>
                    </div>

                    {/* Boutons */}
                    <div className="mt-6 flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
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
                                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                Annuler
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Liste des associations */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Liste des prix par classe
                </h2>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        <p className="mt-2 text-gray-600">Chargement...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Classe
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vol Agence
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trajet
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Compagnie
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
                                {!Array.isArray(classAgencies) || classAgencies.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                            Aucune association trouvée
                                        </td>
                                    </tr>
                                ) : (
                                    classAgencies.map((item) => {
                                        // Chercher le flightAgency correspondant
                                        const flightAgency = flightAgencies.find(fa => fa.id === item.agencyVolId);
                                        const flight = flightAgency?.flight;
                                        const agency = flightAgency?.agency;
                                        
                                        const originName = flight?.origin?.name || 'N/A';
                                        const destinationName = flight?.destination?.name || 'N/A';
                                        const companyName = flight?.companyVol?.name || flight?.companyId || 'N/A';
                                        
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.class?.name || `Classe #${item.classId}`}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {flight?.name || `Vol #${item.agencyVolId}`}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Agence: {agency?.name || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        Départ: {flightAgency?.departureTime ? formatDateTime(flightAgency.departureTime) : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {originName} → {destinationName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {companyName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-bold text-green-600">
                                                        {item.price ? `${parseFloat(item.price).toLocaleString()} FCFA` : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                                                        title="Modifier"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Supprimer"
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
                )}
            </div>
        </div>
    );
};

export default ClassAgency;
