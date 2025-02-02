import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { companyService } from '../../services/companyService';
import { imageService } from '../../services/imageService';

const CompanyCreation = () => {
    const [companies, setCompanies] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        status: 'active',
        image1: '',
        image2: '',
        image3: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await companyService.getCompanies();
            setCompanies(response || []); // Ensure response is an array
        } catch (err) {
            setError('Failed to fetch companies');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData({ ...formData, [name]: files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const token = localStorage.getItem('token');
        const authHeader = { authorization: `Bearer ${token}` };

        const formDataToSend = new FormData();
        Object.keys(formData).forEach((key) => {
            formDataToSend.append(key, formData[key]);
        });

        try {
            if (editMode) {
                await companyService.updateCompany(editId, formDataToSend);

                // Upload images associated with the company
                const imageFormData = new FormData();
                if (formData.image1) {
                    imageFormData.append('images', formData.image1);
                    imageFormData.append('type', formData.image1.type);
                }
                if (formData.image2) {
                    imageFormData.append('images', formData.image2);
                    imageFormData.append('type', formData.image2.type);
                }
                if (formData.image3) {
                    imageFormData.append('images', formData.image3);
                    imageFormData.append('type', formData.image3.type);
                }
                imageFormData.append('entityId', editId);
                imageFormData.append('entityType', 'company');

                await imageService.updateImages('company', editId, imageFormData);

                setSuccess('Company updated successfully!');
            } else {
                const response = await companyService.createCompany(formDataToSend);
                const companyId = response.id;

                // Upload images associated with the company
                const imageFormData = new FormData();
                if (formData.image1) {
                    imageFormData.append('images', formData.image1);
                    imageFormData.append('type', formData.image1.type);
                }
                if (formData.image2) {
                    imageFormData.append('images', formData.image2);
                    imageFormData.append('type', formData.image2.type);
                }
                if (formData.image3) {
                    imageFormData.append('images', formData.image3);
                    imageFormData.append('type', formData.image3.type);
                }
                imageFormData.append('entityId', companyId);
                imageFormData.append('entityType', 'company');

                await imageService.uploadImages(imageFormData);

                setSuccess('Company created successfully!');
            }
            setFormData({
                name: '',
                status: 'active',
                image1: '',
                image2: '',
                image3: '',
            });
            setEditMode(false);
            setEditId(null);
            fetchCompanies();
        } catch (err) {
            setError('Failed to save company');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (company) => {
        setFormData({
            name: company.name,
            status: company.status,
            image1: '',
            image2: '',
            image3: '',
        });
        setEditMode(true);
        setEditId(company.id);
    };

    const handleDelete = async (id) => {
        try {
            await companyService.deleteCompany(id);
            setSuccess('Company deleted successfully!');
            fetchCompanies();
        } catch (err) {
            setError('Failed to delete company');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Manage Companies</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {success && <div className="text-green-500 mb-4">{success}</div>}
            <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-50 to-gray-200 shadow-md rounded-lg p-6 mb-8 max-w-4xl mx-auto">
                <h2 className="text-lg font-bold text-indigo-600 mb-6 text-center">
                    <i className="fas fa-building mr-2"></i>
                    {editMode ? 'Update Company' : 'Create Company'}
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
                            <i className="fas fa-image mr-2 text-indigo-500"></i> Image 1
                        </label>
                        <input
                            type="file"
                            name="image1"
                            onChange={handleFileChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-image mr-2 text-indigo-500"></i> Image 2
                        </label>
                        <input
                            type="file"
                            name="image2"
                            onChange={handleFileChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-image mr-2 text-indigo-500"></i> Image 3
                        </label>
                        <input
                            type="file"
                            name="image3"
                            onChange={handleFileChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
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
                        {loading ? 'Saving...' : editMode ? 'Update Company' : 'Create Company'}
                    </button>
                </div>
            </form>
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Company List</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {companies.map((company) => (
                                <tr key={company.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{company.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap capitalize">{company.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(company)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            <FontAwesomeIcon icon={faEdit} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(company.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <FontAwesomeIcon icon={faTrash} /> Delete
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

export default CompanyCreation;