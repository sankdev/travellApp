import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';

const initialFormState = {
    firstName: '', lastName: '', email: '', phone: '', address: '', gender: '', profession: '',birthDate:'',
    typeDocument: '', numDocument: '', birthPlace: '', nationality: '',
};

const CustomerProfile = () => {
    const [profiles, setProfiles] = useState([]);
    const [formData, setFormData] = useState(initialFormState);
    const [documentFiles, setDocumentFiles] = useState([]);
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
            const response = await customerService.getCustomerProfile();
            console.log('responseProfile',response.data)
            setProfiles(response.data || []);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load profiles' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileChange = (e) => setDocumentFiles([...e.target.files]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
    
        const formDataToSend = new FormData();
    
        // Ajout des champs en évitant les valeurs nulles/vides
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                formDataToSend.append(key, value);
            }
        });
    
        // Ajout des fichiers si disponibles
        if (documentFiles.length > 0) {
            documentFiles.forEach(file => formDataToSend.append('documents', file));
        }
    
        // Ajout de l'ID pour la mise à jour
        if (editMode) {
            formDataToSend.append('userId', editId);  // Assure-toi que le backend attend bien "userId"
        }
    
        // Vérification des données envoyées
        console.log('FormDataToSend:', Object.fromEntries(formDataToSend.entries()));
    
        try {
            if (editMode) {
                await customerService.updateCustomerProfile(formDataToSend);
                setMessage({ type: 'success', text: 'Profile updated!' });
            } else {
                await customerService.createCustomer(formDataToSend);
                setMessage({ type: 'success', text: 'Profile created!' });
            }
            
            resetForm();
            fetchProfiles();
        } catch (err) {
            console.error('Error saving profile:', err);
            setMessage({ type: 'error', text: 'Failed to save profile' });
        } finally {
            setLoading(false);
        }
    };
    
    const resetForm = () => {
        setFormData(initialFormState);
        setEditMode(false);
        setEditId(null);
        setDocumentFiles([]);
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
            typeDocument: profile.typeDocument || '',
            numDocument: profile.numDocument || '',
            birthPlace: profile.birthPlace || '',
            nationality: profile.nationality || '',
        });
        setEditMode(true);
        setEditId(profile.id);
    };

    const handleDelete = async (id) => {
        try {
            await customerService.deleteCustomer(id);
            setMessage({ type: 'success', text: 'Profile deleted!' });
            fetchProfiles();
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete profile' });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Customer Management</h1>
            {message.text && <div className={`text-${message.type === 'error' ? 'red' : 'green'}-500 mb-4 text-center`}>{message.text}</div>}

            <form onSubmit={handleSubmit} className="bg-gray-100 shadow-md rounded-lg p-6 mb-8 max-w-4xl mx-auto">
                <h2 className="text-lg font-bold text-indigo-600 mb-6 text-center">
                    {editMode ? 'Update Profile' : 'Create Profile'}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.keys(initialFormState).map((key) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-700">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                            <input
                                type={key.includes('email') ? 'email' : 'text'}
                                name={key}
                                value={formData[key]}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm text-sm"
                                required
                            />
                        </div>
                    ))}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Upload Documents</label>
                        <input type="file" multiple onChange={handleFileChange} className="mt-1 block w-full px-3 py-2 border rounded-md" />
                    </div>
                </div>
                <div className="text-center mt-4">
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md">
                        {loading ? 'Saving...' : editMode ? 'Update Profile' : 'Create Profile'}
                    </button>
                </div>
            </form>

            <div className="mb-4">
                <input type="text" placeholder="Search profiles..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-8 px-2 py-1 border rounded-md text-xs" />
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Profile List</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['First Name', 'Last Name', 'Email', 'Phone', 'Actions'].map((header) => (
                                <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.map((profile) => (
                            <tr key={profile.id} className="border-b">
                                <td className="px-4 py-2">{profile.firstName}</td>
                                <td className="px-4 py-2">{profile.lastName}</td>
                                <td className="px-4 py-2">{profile.email}</td>
                                <td className="px-4 py-2">{profile.phone}</td>
                                <td className="px-4 py-2 text-right">
                                    <button onClick={() => handleEdit(profile)} className="text-indigo-600 mr-2">Edit</button>
                                    <button onClick={() => handleDelete(profile.id)} className="text-red-600">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerProfile;
