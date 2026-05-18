import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faEnvelope,
    faPhone,
    faVenusMars,
    faCalendarAlt,
    faMapMarkerAlt,
    faGlobe,
    faBriefcase,
    faTrash,
    faEdit,
    faSave,
    faTimes,
    faSpinner
} from '@fortawesome/free-solid-svg-icons';

const initialFormState = {
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: '', 
    address: '',
    gender: '', 
    profession: '', 
    birthDate: '', 
    birthPlace: '', 
    nationality: ''
};

const CustomerProfile = () => {
    const [profiles, setProfiles] = useState([]);
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const navigate = useNavigate();

    useEffect(() => {
        fetchProfiles();
    }, [page, search]);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const response = await customerService.getCustomerProfile({ page, search });
            setProfiles(response.data || []);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load profiles' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setLoading(true);

        try {
            const submissionData = {
                ...formData,
                userId: editId || null
            };

            console.log('📤 Envoi des données:', submissionData);

            if (editMode) {
                await customerService.updateCustomerProfile(submissionData);
                setMessage({ type: 'success', text: 'Profil mis à jour avec succès!' });
            } else {
                await customerService.createCustomer(submissionData);
                setMessage({ type: 'success', text: 'Profil créé avec succès!' });
            }

            resetForm();
            fetchProfiles();
            
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);

        } catch (err) {
            console.error('❌ Erreur lors de l\'enregistrement:', err);
            setMessage({ 
                type: 'error', 
                text: err.response?.data?.message || 'Échec de l\'enregistrement du profil' 
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setEditMode(false);
        setEditId(null);
    };

    const handleEdit = (profile) => {
        setFormData({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
            phone: profile.phone || '',
            address: profile.address || '',
            gender: profile.gender || '',
            profession: profile.profession || '',
            birthDate: profile.birthDate ? profile.birthDate.split('T')[0] : '',
            birthPlace: profile.birthPlace || '',
            nationality: profile.nationality || ''
        });
        setEditMode(true);
        setEditId(profile.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce profil ?')) return;
        
        try {
            await customerService.deleteCustomer(id);
            setMessage({ type: 'success', text: 'Profil supprimé!' });
            fetchProfiles();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Échec de la suppression' });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
                Gestion des Clients
            </h1>
            
            {/* Message de notification */}
            {message.text && (
                <div className={`mb-4 p-4 rounded-lg text-center ${
                    message.type === 'error' 
                        ? 'bg-red-100 text-red-700 border border-red-400' 
                        : 'bg-green-100 text-green-700 border border-green-400'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 mb-8 max-w-4xl mx-auto">
                <h2 className="text-xl font-bold text-indigo-600 mb-6 text-center border-b pb-2">
                    {editMode ? '✏️ Modifier le Profil' : '➕ Créer un Profil'}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Prénom */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                            <FontAwesomeIcon icon={faUser} className="text-indigo-500" />
                            Prénom *
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>

                    {/* Nom */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                            <FontAwesomeIcon icon={faUser} className="text-indigo-500" />
                            Nom *
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                            <FontAwesomeIcon icon={faEnvelope} className="text-indigo-500" />
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>

                    {/* Téléphone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                            <FontAwesomeIcon icon={faPhone} className="text-indigo-500" />
                            Téléphone
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Genre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                            <FontAwesomeIcon icon={faVenusMars} className="text-indigo-500" />
                            Genre
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Sélectionner</option>
                            <option value="M">Masculin</option>
                            <option value="F">Féminin</option>
                            <option value="autre">Autre</option>
                        </select>
                    </div>

                    {/* Profession */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                            <FontAwesomeIcon icon={faBriefcase} className="text-indigo-500" />
                            Profession
                        </label>
                        <input
                            type="text"
                            name="profession"
                            value={formData.profession}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Date de naissance */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-indigo-500" />
                            Date de naissance
                        </label>
                        <input
                            type="date"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Lieu de naissance */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-indigo-500" />
                            Lieu de naissance
                        </label>
                        <input
                            type="text"
                            name="birthPlace"
                            value={formData.birthPlace}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Nationalité */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                            <FontAwesomeIcon icon={faGlobe} className="text-indigo-500" />
                            Nationalité
                        </label>
                        <input
                            type="text"
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Adresse (full width) */}
                    <div className="lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Adresse
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                {/* Boutons du formulaire */}
                <div className="flex justify-center gap-4 mt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin />
                                Traitement...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={editMode ? faSave : faUser} />
                                {editMode ? 'Mettre à jour' : 'Créer le profil'}
                            </>
                        )}
                    </button>
                    
                    {editMode && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                            Annuler
                        </button>
                    )}
                </div>
            </form>

            {/* Barre de recherche */}
            <div className="mb-4 max-w-md mx-auto">
                <input
                    type="text"
                    placeholder="Rechercher un profil..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            {/* Liste des profils */}
            <div className="bg-white shadow-lg rounded-lg p-6 overflow-x-auto">
                <h2 className="text-lg font-semibold mb-4">Liste des Profils</h2>
                
                {loading && profiles.length === 0 ? (
                    <div className="text-center py-8">
                        <FontAwesomeIcon icon={faSpinner} spin className="text-indigo-600 text-3xl" />
                        <p className="mt-2 text-gray-600">Chargement...</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {profiles.length > 0 ? (
                                profiles.map((profile) => (
                                    <tr key={profile.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2">{profile.firstName}</td>
                                        <td className="px-4 py-2">{profile.lastName}</td>
                                        <td className="px-4 py-2">{profile.email}</td>
                                        <td className="px-4 py-2">{profile.phone || '-'}</td>
                                        <td className="px-4 py-2">
                                            <button
                                                onClick={() => handleEdit(profile)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                title="Modifier"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(profile.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Supprimer"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                        Aucun profil trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default CustomerProfile;
