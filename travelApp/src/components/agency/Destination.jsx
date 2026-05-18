import React, { useEffect, useState } from 'react';
import { destinationService } from '../../services/destinationService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faPlus, 
  faSearch, 
  faSync,
  faMapMarkerAlt,
  faHome,
  faCity,
  faFlag,
  faGlobe,
  faImage,
  faToggleOn,
  faSignature
} from '@fortawesome/free-solid-svg-icons';

const Destination = () => {
    const [destinations, setDestinations] = useState([]);
    const [filteredDestinations, setFilteredDestinations] = useState([]);
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
    
    // Search and Pagination states
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchDestinations();
    }, []);

    useEffect(() => {
        filterDestinations();
        updatePagination();
    }, [destinations, searchTerm, currentPage, itemsPerPage]);

    const fetchDestinations = async () => {
        try {
            setLoading(true);
            const response = await destinationService.getDestinations();
            console.log('destinations', response);
            setDestinations(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Failed to fetch destinations');
        } finally {
            setLoading(false);
        }
    };

    const filterDestinations = () => {
        let filtered = destinations;
        
        if (searchTerm) {
            filtered = destinations.filter(destination =>
                destination.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                destination.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                destination.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                destination.continent?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        setFilteredDestinations(filtered);
        return filtered;
    };

    const updatePagination = () => {
        const filtered = filterDestinations();
        const total = Math.ceil(filtered.length / itemsPerPage);
        setTotalPages(total);
        
        // Adjust current page if necessary
        if (currentPage > total && total > 0) {
            setCurrentPage(total);
        }
    };

    const getCurrentItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredDestinations.slice(startIndex, endIndex);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = async (e) => {
        const { name, files } = e.target;
        const file = files[0];

        if (file) {
            // File validation
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must not exceed 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prevData) => ({
                    ...prevData,
                    [name]: reader.result,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (editMode) {
                await destinationService.updateDestination(editId, formData);
                setSuccess('Destination updated successfully!');
            } else {
                await destinationService.createDestination(formData);
                setSuccess('Destination created successfully!');
            }

            resetForm();
            fetchDestinations();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save destination');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
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
        // Scroll to form
        document.getElementById('destination-form').scrollIntoView({ behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this destination?')) {
            return;
        }

        try {
            await destinationService.deleteDestination(id);
            setSuccess('Destination deleted successfully!');
            fetchDestinations();
        } catch (err) {
            setError('Failed to delete destination');
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    };

    // Pagination functions
    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`px-3 py-1 mx-1 rounded text-sm ${
                        currentPage === i
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDestinations.length)} of {filteredDestinations.length} destinations
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                    >
                        Previous
                    </button>
                    {pages}
                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-gray-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Destination Management</h1>
                <button
                    onClick={fetchDestinations}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                    <FontAwesomeIcon icon={faSync} className="mr-2" />
                    Refresh
                </button>
            </div>

            {/* Alert Messages */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                    {success}
                </div>
            )}

            {/* Form */}
            <form 
                id="destination-form"
                onSubmit={handleSubmit} 
                className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-200"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        <FontAwesomeIcon icon={editMode ? faEdit : faPlus} className="mr-2 text-orange-600" />
                        {editMode ? 'Edit Destination' : 'Create New Destination'}
                    </h2>
                    {editMode && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-sm text-gray-600 hover:text-gray-800 transition duration-150"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FontAwesomeIcon icon={faSignature} className="mr-2 text-indigo-600" />
                            Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                            placeholder="Enter destination name"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-indigo-600" />
                            Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                            placeholder="Enter location"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FontAwesomeIcon icon={faHome} className="mr-2 text-indigo-600" />
                            Address
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                            placeholder="Enter address"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FontAwesomeIcon icon={faCity} className="mr-2 text-indigo-600" />
                            City
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                            placeholder="Enter city"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FontAwesomeIcon icon={faFlag} className="mr-2 text-indigo-600" />
                            Country
                        </label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                            placeholder="Enter country"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FontAwesomeIcon icon={faGlobe} className="mr-2 text-indigo-600" />
                            Continent
                        </label>
                        <input
                            type="text"
                            name="continent"
                            value={formData.continent}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                            placeholder="Enter continent"
                        />
                    </div>

                    {[1, 2, 3].map((num) => (
                        <div key={num}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FontAwesomeIcon icon={faImage} className="mr-2 text-indigo-600" />
                                Image {num}
                            </label>
                            <input
                                type="file"
                                name={`image${num}`}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                            />
                        </div>
                    ))}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FontAwesomeIcon icon={faToggleOn} className="mr-2 text-indigo-600" />
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-200 font-medium ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Processing...' : editMode ? 'Update Destination' : 'Create Destination'}
                    </button>
                </div>
            </form>

            {/* Destination List */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                    <h2 className="text-xl font-semibold text-gray-800">Destination List</h2>
                    
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        <div className="relative">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search destinations..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full sm:w-64"
                            />
                        </div>
                        
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={20}>20 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading destinations...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Continent</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {getCurrentItems().map((destination) => (
                                        <tr key={destination.id} className="hover:bg-gray-50 transition duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{destination.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{destination.location}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{destination.city}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{destination.country}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{destination.continent}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    destination.status === 'active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {destination.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(destination)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4 transition duration-150"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(destination.id)}
                                                    className="text-red-600 hover:text-red-900 transition duration-150"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredDestinations.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No destinations found
                            </div>
                        )}

                        {/* Pagination */}
                        {renderPagination()}
                    </>
                )}
            </div>
        </div>
    );
};

export default Destination;
