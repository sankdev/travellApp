import React, { useState } from 'react';
import axios from 'axios';

const ImageCreation = () => {
    const [formData, setFormData] = useState({
        entityId: '',
        entityType: '',
        images: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const { files } = e.target;
        setFormData({ ...formData, images: files });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const formDataToSend = new FormData();
        formDataToSend.append('entityId', formData.entityId);
        formDataToSend.append('entityType', formData.entityType);
        Array.from(formData.images).forEach((file) => {
            formDataToSend.append('images', file);
            formDataToSend.append('type', file.type); // Ensure the type field is populated correctly
        });

        try {
            await axios.post('/api/images/entity', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSuccess('Images uploaded successfully!');
            setFormData({
                entityId: '',
                entityType: '',
                images: [], 
            });
        } catch (err) {
            setError('Failed to upload images');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Image Upload</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {success && <div className="text-green-500 mb-4">{success}</div>}
            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Entity ID</label>
                        <input
                            type="text"
                            name="entityId"
                            value={formData.entityId}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Entity Type</label>
                        <select
                            name="entityType"
                            value={formData.entityType}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            required
                        >
                            <option value="">Select Entity Type</option>
                            <option value="campaign">Campaign</option>
                            <option value="company">Company</option>
                            <option value="agency">Agency</option>
                            <option value="destination">Destination</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Images</label>
                        <input
                            type="file"
                            name="images"
                            multiple
                            onChange={handleFileChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            required
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Uploading...' : 'Upload Images'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ImageCreation;
