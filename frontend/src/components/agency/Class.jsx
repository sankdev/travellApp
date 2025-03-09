import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { volService } from '../../services/volService';

const ClassComponent = () => {
    const [classes, setClasses] = useState([]);
    const [vols, setVols] = useState([]);
    const [formData, setFormData] = useState({ name: '', status: 'active', volId: '', priceMultiplier: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchClasses();
        fetchVols();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/classes');
            console.log('classList',response)
            setClasses(response.data);
        } catch (err) {
            setError('Failed to fetch classes');
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        const token=localStorage.getItem('token')
         
        try {
            if (editMode) {
                await axios.put(`http://localhost:5000/api/classes/${editId}`, formData);
                setSuccess('Class updated successfully!');
            } else {
                await axios.post('http://localhost:5000/api/classes/post', formData,{headers:{Authorization:`Bearer ${token}`}});
                setSuccess('Class created successfully!');
            }
            setFormData({ name: '', status: 'active', volId: '', priceMultiplier: '' });
            setEditMode(false);
            setEditId(null);
            fetchClasses();
        } catch (err) {
            setError('Failed to save class');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (classItem) => {
        setFormData({ name: classItem.name, status: classItem.status, volId: classItem.volId, priceMultiplier: classItem.priceMultiplier });
        setEditMode(true);
        setEditId(classItem.id);
    };

    const handleDelete = async (id) => {
        const token=localStorage.getItem('token')
        try {
            await axios.delete(`http://localhost:5000/api/classes/${id}`);
            setSuccess('Class deleted successfully!');
            fetchClasses();
        } catch (err) {
            setError('Failed to delete class');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Manage Classes</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {success && <div className="text-green-500 mb-4">{success}</div>}
             {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm font-medium border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm font-medium border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Vol</label>
                        <select
                            name="volId"
                            value={formData.volId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm font-medium border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        >
                            <option value="">Select Vol</option>
                            {Array.isArray(vols) && vols.map((vol) => (
                                <option key={vol.id} value={vol.id}>
                                    {vol.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Price Multiplier</label>
                        <input
                            type="number"
                            name="priceMultiplier"
                            value={formData.priceMultiplier}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm font-medium border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-md mt-4 px-4 py-2 text-white font-semibold bg-indigo-600 rounded-md shadow-md transition duration-200 ease-in-out transform hover:scale-105 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    {loading ? 'Saving...' : editMode ? 'Update Class' : 'Create Class'}
                </button>
            </form>
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Class List</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vol</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Multiplier</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {classes.map((classItem) => (
                                <tr key={classItem.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{classItem.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap capitalize">{classItem.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{classItem.Vol?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{classItem.priceMultiplier}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(classItem)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(classItem.id)}
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

export default ClassComponent;