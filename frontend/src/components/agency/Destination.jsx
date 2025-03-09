import React, { useEffect, useState } from 'react';
import { destinationService } from '../../services/destinationService';
import { imageService } from '../../services/imageService';

const Destination = () => {
    const [destinations, setDestinations] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        address: '',
        city: '',
        country: '',
        continent: '',
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
     const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    useEffect(() => {
        fetchDestinations();
    }, []);

    const fetchDestinations = async () => {
        try {
            const response = await destinationService.getDestinations();
            console.log('destinations',response);
            setDestinations(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Failed to fetch destinations');
        }
    };
//    const fetchDestinations = async () => {
//            try {
//                const response = await destinationService.getDestinations({ page, search });
//                console.log('API Response Destinations:', response);
       
//                // Vérifiez si la pagination est présente
//                if (response.pagination) {
//                    setTotalPages(response.pagination.page);
//                } else {
//                    console.warn('Pagination is missing in response');
//                    setTotalPages(1); // Valeur par défaut si la pagination est absente
//                }
       
//                // Vérifiez si les données d'agences sont présentes
//                if (Array.isArray(response.data)) {
//                    setDestinations(response.data);
//                } else {
//                    setDestinations([]);
//                    console.warn('Agencies data is missing or not an array');
//                }
//            } catch (err) {
//                console.error('Fetch error:', err.response ? err.response.data : err.message);
//                setError('Failed to fetch agencies');
//            }
//        };
   
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

        const formDataToSend = new FormData();
        Object.keys(formData).forEach((key) => {
            formDataToSend.append(key, formData[key]);
        });

        try {
            if (editMode) {
                await destinationService.updateDestination(editId, formDataToSend);
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
                imageFormData.append('entityType', 'destination');

                await imageService.updateImages('destination', editId, imageFormData);
                setSuccess('Destination updated successfully!');
            } else {
                const response = await destinationService.createDestination(formDataToSend);
                const destinationId = response.data.id; // Ensure the correct property is accessed

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
                imageFormData.append('entityId', destinationId);
                imageFormData.append('entityType', 'destination');

                await imageService.uploadImages(imageFormData);

                setSuccess('Destination created successfully!');
            }
            setFormData({
                name: '',
                location: '',
                address: '',
                city: '',
                country: '',
                continent: '',
                status: 'active',
                image1: '',
                image2: '',
                image3: '',
            });
            setEditMode(false);
            setEditId(null);
            fetchDestinations();
        } catch (err) {
            setError('Failed to save destination');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (destination) => {
        setFormData({
            name: destination.name,
            location: destination.location,
            address: destination.address,
            city: destination.city,
            country: destination.country,
            continent: destination.continent,
            status: destination.status,
            image1: '',
            image2: '',
            image3: '',
        });
        setEditMode(true);
        setEditId(destination.id);
    };

    const handleDelete = async (id) => {
        try {
            await destinationService.deleteDestination(id);
            setSuccess('Destination deleted successfully!');
            fetchDestinations();
        } catch (err) {
            setError('Failed to delete destination');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Gestion Destinations</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {success && <div className="text-green-500 mb-4">{success}</div>}
            <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-50 to-gray-200 shadow-md rounded-lg p-6 mb-8 max-w-4xl mx-auto">
                <h2 className="text-lg font-bold text-indigo-600 mb-6 text-center">
                    <i className="fas fa-clipboard-list mr-2"></i>
                    {editMode ? 'Update Destination' : 'Create Destination'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-signature text-indigo-600 mr-2"></i>Name
                        </label>
                        <input
                            type="text"
                            name="name" 
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="Enter the name"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            <i className="fas fa-map-marker-alt text-indigo-600 mr-2"></i>Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="Enter the location"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            <i className="fas fa-home text-indigo-600 mr-2"></i>Address
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="Enter the address"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            <i className="fas fa-city text-indigo-600 mr-2"></i>City
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="Enter the city"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            <i className="fas fa-flag text-indigo-600 mr-2"></i>Country
                        </label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="Enter the country"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            <i className="fas fa-globe text-indigo-600 mr-2"></i>Continent
                        </label>
                        <input
                            type="text"
                            name="continent"
                            value={formData.continent}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="Enter the continent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            <i className="fas fa-image text-indigo-600 mr-2"></i>Image 1
                        </label>
                        <input
                            type="file"
                            name="image1"
                            onChange={handleFileChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            <i className="fas fa-image text-indigo-600 mr-2"></i>Image 2
                        </label>
                        <input
                            type="file"
                            name="image2"
                            onChange={handleFileChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            <i className="fas fa-image text-indigo-600 mr-2"></i>Image 3
                        </label>
                        <input
                            type="file"
                            name="image3"
                            onChange={handleFileChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            <i className="fas fa-toggle-on text-indigo-600 mr-2"></i>Status
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
                </div>
                <div className="text-center">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Saving...' : editMode ? 'Update Destination' : 'Create Destination'}
                    </button>
                </div>
            </form>
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Destination List</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Continent</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(destinations) && destinations.map((destination) => (
                                <tr key={destination.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{destination.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{destination.location}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{destination.address}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{destination.city}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{destination.country}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{destination.continent}</td>
                                    <td className="px-6 py-4 whitespace-nowrap capitalize">{destination.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(destination)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(destination.id)}
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

export default Destination;