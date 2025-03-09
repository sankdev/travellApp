import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { agencyAssociationService } from '../../services/agencyAssociationService';
import { agencyService } from '../../services/agencyService';

const ClassAgency = () => {
    const [classAgencies, setClassAgencies] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [classes, setClasses] = useState([]);
    const [formData, setFormData] = useState({ classId: '', agencyId: '', priceMultiplier: '', status: 'active' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchClassAgencies();
        fetchAgencies();
        fetchClasses();
    }, []);

    const fetchClassAgencies = async () => {
        try {
            console.log("Fetching class agencies...");
            const response = await agencyAssociationService.getUserClassAgencies();
            console.log("Class Agencies Response:", response);
            setClassAgencies(response || []);
        } catch (err) {
            console.error("Error fetching class agencies:", err);
            setError('Failed to fetch class agencies');
        }
    };

    const fetchAgencies = async () => {
        try {
            const response = await agencyService.getUserAgencies();
            setAgencies(response.data || []);
        } catch (err) {
            setError('Failed to fetch agencies');
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/classes');
            setClasses(response.data || []);
        } catch (err) {
            setError('Failed to fetch classes');
        }
    };

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
                await axios.put(`http://localhost:5000/api/class-agencies/${editId}`, formData);
                setSuccess('Class agency updated successfully!');
            } else {
                await axios.post('http://localhost:5000/api/class-agencies', formData);
                setSuccess('Class agency created successfully!');
            }
            setFormData({ classId: '', agencyId: '', priceMultiplier: '', status: 'active' });
            setEditMode(false);
            setEditId(null);
            fetchClassAgencies();
        } catch (err) {
            setError('Failed to save class agency');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (classAgency) => {
        setFormData({ classId: classAgency.classId, agencyId: classAgency.agencyId, priceMultiplier: classAgency.priceMultiplier, status: classAgency.status });
        setEditMode(true);
        setEditId(classAgency.id);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/class-agencies/${id}`);
            setSuccess('Class agency deleted successfully!');
            fetchClassAgencies();
        } catch (err) {
            setError('Failed to delete class agency');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Manage Class Agencies</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {success && <div className="text-green-500 mb-4">{success}</div>}
            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Class</label>
                        <select
                            name="classId"
                            value={formData.classId}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        >
                            <option value="">Select Class</option>
                            {classes.length > 0 && classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Agency</label>
                        <select
                            name="agencyId"
                            value={formData.agencyId}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        >
                            <option value="">Select Agency</option>
                            {agencies.length > 0 && agencies.map((agency) => (
                                <option key={agency.id} value={agency.id}>
                                    {agency.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price Multiplier</label>
                        <input
                            type="number"
                            name="priceMultiplier"
                            value={formData.priceMultiplier}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Saving...' : editMode ? 'Update Class Agency' : 'Create Class Agency'}
                    </button>
                </div>
            </form>
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Class Agency List</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Multiplier</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {classAgencies.length > 0 && classAgencies.map((classAgency) => (
                                <tr key={classAgency.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{classAgency.class?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{classAgency.agency?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{classAgency.priceMultiplier}</td>
                                    <td className="px-6 py-4 whitespace-nowrap capitalize">{classAgency.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(classAgency)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(classAgency.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
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

export default ClassAgency;
