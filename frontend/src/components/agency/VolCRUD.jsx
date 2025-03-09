import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { destinationService } from '../../services/destinationService';
import { companyService } from '../../services/companyService';
import { volService } from '../../services/volService';
import { agencyService } from '../../services/agencyService';

const VolCRUD = () => {
    const [vols, setVols] = useState([]);
    const [classes, setClasses] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        agencyId: '',
        companyId: '',
        destinationId: '',
        description: '',
        status: 'active',
        startAt: '',
        endAt: '',
        prix: '',
        originId: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchVols();
        fetchClasses();
        fetchCompanies();
        fetchDestinations();
        fetchAgencies();
    }, []);

    const fetchVols = async () => {
        try {
            const response = await volService.getVolsByAgency();
            console.log('vol',response)
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

    const fetchDestinations = async () => {
        try {
            const response = await destinationService.getDestinations();
            setDestinations(response);
        } catch (err) {
            setError('Failed to fetch destinations');
        }
    };

    const fetchAgencies = async () => {
        try {
            const response = await agencyService.getUserAgencies();
            console.log('agencyUser',response.data)
            setAgencies(Array.isArray(response.data) ? response : []);
        } catch (err) {
            setError('Failed to fetch agencies');
        }
    };
console.log('agencies',agencies.data)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (editMode) {
                await volService.updateVol(editId, formData);
                setSuccess('Vol updated successfully!');
            } else {
                await volService.createVol(formData);
                setSuccess('Vol created successfully!');
            }
            setFormData({
                name: '',
                agencyId: '',
                companyId: '',
                destinationId: '',
                description: '',
                status: 'active',
                startAt: '',
                endAt: '',
                prix: '',
                originId: '',
            });
            setEditMode(false);
            setEditId(null);
            fetchVols();
        } catch (err) {
            setError('Failed to save vol');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (vol) => {
        setFormData({
            name: vol.name,
            agencyId: vol.agencyId,
            companyId: vol.companyId,
            destinationId: vol.destinationId,
            description: vol.description,
            status: vol.status,
            startAt: vol.startAt,
            endAt: vol.endAt,
            prix: vol.prix,
            originId: vol.originId,
        });
        setEditMode(true);
        setEditId(vol.id);
    };

    const handleDelete = async (id) => {
        try {
            await volService.deleteVol(id);
            setSuccess('Vol deleted successfully!');
            fetchVols();
        } catch (err) {
            setError('Failed to delete vol');
        }
    };

    const getClassById = (id) => {
        if (!classes || !classes.length) return 'Unknown';
        const classItem = classes.find((item) => item.id === parseInt(id));
        console.log('classItem', classItem);
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

    const getAgencyById = (id) => {
        if (!agencies || !agencies.length) return 'Unknown';
        const agency = agencies.data.find((item) => item.id === parseInt(id));
        return agency ? agency.name : 'Unknown';
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Manage Vols</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {success && <div className="text-green-500 mb-4">{success}</div>}
            
            <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-50 to-gray-200 shadow-md rounded-lg p-6 mb-8 max-w-4xl mx-auto">
                <h2 className="text-lg font-bold text-indigo-600 mb-6 text-center">
                    <i className="fas fa-plane mr-2"></i>
                    {editMode ? 'Update Vol' : 'Create Vol'}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-tag mr-2 text-indigo-500"></i> Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-building mr-2 text-indigo-500"></i> Agency
                        </label>
                        <select
                            name="agencyId"
                            value={formData.agencyId}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            required
                        >
                            <option value="">Select Agency</option>
                            {Array.isArray(agencies.data) && agencies.data.map((agency) => (
                                <option key={agency.id} value={agency.id}>
                                    {agency.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-building mr-2 text-indigo-500"></i> Company
                        </label>
                        <select
                            name="companyId"
                            value={formData.companyId}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            required
                        >
                            <option value="">Select Company</option>
                            {Array.isArray(companies) && companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-map-marker-alt mr-2 text-indigo-500"></i> Destination
                        </label>
                        <select
                            name="destinationId"
                            value={formData.destinationId}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            required
                        >
                            <option value="">Select Destination</option>
                            {Array.isArray(destinations) && destinations.map((destination) => (
                                <option key={destination.id} value={destination.id}>
                                    {destination.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-file-alt mr-2 text-indigo-500"></i> Description
                        </label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-check-circle mr-2 text-indigo-500"></i> Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-calendar-alt mr-2 text-indigo-500"></i> Start At
                        </label>
                        <input
                            type="date"
                            name="startAt"
                            value={formData.startAt}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-calendar-check mr-2 text-indigo-500"></i> End At
                        </label>
                        <input
                            type="date"
                            name="endAt"
                            value={formData.endAt}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-dollar-sign mr-2 text-indigo-500"></i> Prix
                        </label>
                        <input
                            type="number"
                            name="prix"
                            value={formData.prix}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-map-marker-alt mr-2 text-indigo-500"></i> Origin
                        </label>
                        <select
                            name="originId"
                            value={formData.originId}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            required
                        >
                            <option value="">Select Origin</option>
                            {Array.isArray(destinations) && destinations.map((destination) => (
                                <option key={destination.id} value={destination.id}>
                                    {destination.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="text-center">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Saving...' : editMode ? 'Update Vol' : 'Create Vol'}
                    </button>
                </div>
            </form>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Vol List</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {vols.map((vol) => (
                                <tr key={vol.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{vol.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getAgencyById(vol.agencyId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getCompanyById(vol.companyId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getDestinationById(vol.destinationId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{vol.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap capitalize">{vol.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(vol.startAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(vol.endAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{vol.prix}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getDestinationById(vol.originId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(vol)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(vol.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VolCRUD;
