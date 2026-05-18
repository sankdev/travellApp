import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faPlus, 
  faSearch, 
  faSync,
  faBuilding,
  faFileAlt,
  faMapMarkerAlt,
  faAddressCard,
  faPhone,
  faUserTie,
  faUser,
  faImage,
  faToggleOn,
  faEye,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import { agencyService } from '../../services/agencyService';
import { Link } from 'react-router-dom';

const CreationAgency = () => {
    const [agencies, setAgencies] = useState([]);
    const [filteredAgencies, setFilteredAgencies] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        logo: null,
        location: '',
        status: 'active',
        address: '',
        phone1: '',
        phone2: '',
        phone3: '',
        manager: '',
        secretary: '',
        image1: null,
        image2: null,
        image3: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    
    // Enhanced search and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchAgencies();
    }, []);

    useEffect(() => {
        filterAgencies();
        updatePagination();
    }, [agencies, searchTerm, currentPage, itemsPerPage]);

    const fetchAgencies = async () => {
        try {
            setLoading(true);
            const response = await agencyService.getUserAgencies();
            console.log('API Response:', response);
            
            if (response && response.data) {
                setAgencies(response.data);
            } else {
                setAgencies([]);
            }
        } catch (err) {
            console.error('Fetch error:', err.response ? err.response.data : err.message);
            setError('Failed to fetch agencies');
        } finally {
            setLoading(false);
        }
    };

    const filterAgencies = () => {
        let filtered = agencies;
        
        if (searchTerm) {
            filtered = agencies.filter(agency =>
                agency.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                agency.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                agency.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                agency.manager?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        setFilteredAgencies(filtered);
        return filtered;
    };

    const updatePagination = () => {
        const filtered = filterAgencies();
        const total = Math.ceil(filtered.length / itemsPerPage);
        setTotalPages(total);
        
        if (currentPage > total && total > 0) {
            setCurrentPage(total);
        }
    };

    const getCurrentItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredAgencies.slice(startIndex, endIndex);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length > 0) {
            const file = files[0];
            
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must not exceed 5MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file');
                return;
            }

            setFormData((prev) => ({ 
                ...prev, 
                [name]: file,
                ...(name === 'logo' && { logoPreview: URL.createObjectURL(file) })
            }));
        }
    };

    const encodeFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) return resolve(null);
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Convert logo to Base64
            let logoBase64 = null;
            if (formData.logo) {
                logoBase64 = await encodeFileToBase64(formData.logo);
            }

            // Convert images to Base64
            const images = [];
            const imageFields = ['image1', 'image2', 'image3'];

            for (const field of imageFields) {
                if (formData[field]) {
                    const base64 = await encodeFileToBase64(formData[field]);
                    if (base64) images.push(base64);
                }
            }

            const payload = {
                name: formData.name,
                description: formData.description,
                logo: logoBase64,
                location: formData.location,
                status: formData.status,
                address: formData.address,
                phone1: formData.phone1,
                phone2: formData.phone2,
                phone3: formData.phone3,
                manager: formData.manager,
                secretary: formData.secretary,
                images,
            };

            console.log('payloadsAgency', payload);

            if (editMode) {
                await agencyService.updateAgency(editId, payload);
                setSuccess('Agency updated successfully!');
            } else {
                await agencyService.createAgency(payload);
                setSuccess('Agency created successfully!');
            }

            resetForm();
            fetchAgencies();
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.response?.data?.message || 'Failed to save agency');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            logo: null,
            location: '',
            status: 'active',
            address: '',
            phone1: '',
            phone2: '',
            phone3: '',
            manager: '',
            secretary: '',
            image1: null,
            image2: null,
            image3: null,
        });
        setEditMode(false);
        setEditId(null);
    };

    const handleEdit = (agency) => {
        setFormData({
            name: agency.name,
            description: agency.description,
            logo: null,
            location: agency.location,
            status: agency.status,
            address: agency.address,
            phone1: agency.phone1,
            phone2: agency.phone2,
            phone3: agency.phone3,
            manager: agency.manager,
            secretary: agency.secretary,
            image1: null,
            image2: null,
            image3: null,
            logoPreview: agency.logo || ''
        });
        setEditMode(true);
        setEditId(agency.id);
        document.getElementById('agency-form').scrollIntoView({ behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this agency? This action cannot be undone.')) {
            return;
        }

        try {
            await agencyService.deleteAgency(id);
            setSuccess('Agency deleted successfully!');
            fetchAgencies();
        } catch (err) {
            setError('Failed to delete agency');
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
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAgencies.length)} of {filteredAgencies.length} agencies
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
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Agency Management</h1>
                    <p className="text-gray-600 mt-2">Manage your travel agencies and their information</p>
                </div>
                <button
                    onClick={fetchAgencies}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
                >
                    <FontAwesomeIcon icon={faSync} className="mr-2" />
                    Refresh
                </button>
            </div>

            {/* Alert Messages */}
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm">{success}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Agency Form */}
            <form 
                id="agency-form"
                onSubmit={handleSubmit} 
                className="bg-white shadow-xl rounded-2xl p-8 mb-8 border border-gray-100"
            >
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        <FontAwesomeIcon icon={editMode ? faEdit : faPlus} className="mr-3 text-orange-600" />
                        {editMode ? 'Edit Agency' : 'Create New Agency'}
                    </h2>
                    {editMode && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-sm text-gray-600 hover:text-gray-800 transition duration-150 font-medium"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
                    {/* Basic Information */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FontAwesomeIcon icon={faTag} className="mr-2 text-indigo-600" />
                                Agency Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                                placeholder="Enter agency name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-indigo-600" />
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                                placeholder="Brief description about the agency"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FontAwesomeIcon icon={faToggleOn} className="mr-2 text-indigo-600" />
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Location Information */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Location Details</h3>
                        
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                                placeholder="City, Region"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FontAwesomeIcon icon={faAddressCard} className="mr-2 text-indigo-600" />
                                Full Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                                placeholder="Street address"
                            />
                        </div>

                        {/* Phone Numbers */}
                        <div className="space-y-4">
                            <h4 className="text-md font-medium text-gray-700">Contact Numbers</h4>
                            {[1, 2, 3].map((i) => (
                                <div key={i}>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        <FontAwesomeIcon icon={faPhone} className="mr-2 text-indigo-600" />
                                        Phone {i}
                                    </label>
                                    <input
                                        type="text"
                                        name={`phone${i}`}
                                        value={formData[`phone${i}`]}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                                        placeholder={`Phone ${i}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Media & Personnel */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Media & Staff</h3>

                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FontAwesomeIcon icon={faBuilding} className="mr-2 text-indigo-600" />
                                Agency Logo
                            </label>
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                    {formData.logoPreview ? (
                                        <img
                                            src={formData.logoPreview}
                                            alt="Logo preview"
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    ) : (
                                        <FontAwesomeIcon icon={faImage} className="text-gray-400 text-xl" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                                </div>
                            </div>
                        </div>

                        {/* Staff Information */}
                        <div className="space-y-4">
                            {['manager', 'secretary'].map((field) => (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FontAwesomeIcon 
                                            icon={field === 'manager' ? faUserTie : faUser} 
                                            className="mr-2 text-indigo-600" 
                                        />
                                        {field.charAt(0).toUpperCase() + field.slice(1)}
                                    </label>
                                    <input
                                        type="text"
                                        name={field}
                                        value={formData[field]}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                                        placeholder={`${field.charAt(0).toUpperCase() + field.slice(1)}'s name`}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Additional Images */}
                        <div className="space-y-4">
                            <h4 className="text-md font-medium text-gray-700">Additional Images</h4>
                            {[1, 2, 3].map((i) => (
                                <div key={i}>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        <FontAwesomeIcon icon={faImage} className="mr-2 text-indigo-600" />
                                        Image {i}
                                    </label>
                                    <input
                                        type="file"
                                        name={`image${i}`}
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={resetForm}
                        className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-200 font-medium shadow-md ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                            </span>
                        ) : editMode ? (
                            <span className="flex items-center">
                                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                Update Agency
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                Create Agency
                            </span>
                        )}
                    </button>
                </div>
            </form>

            {/* Agency List Section */}
            <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">Agency List</h2>
                        <p className="text-gray-600 mt-1">Manage your registered agencies</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
                        <div className="relative">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search agencies..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full lg:w-80"
                            />
                        </div>
                        
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={20}>20 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading agencies...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-xl">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Agency</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {getCurrentItems().map((agency) => (
                                        <tr key={agency.id} className="hover:bg-gray-50 transition duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {agency.logo ? (
                                                            <img className="h-10 w-10 rounded-full object-cover" src={agency.logo} alt={agency.name} />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                                                <FontAwesomeIcon icon={faBuilding} className="text-orange-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <Link 
                                                            to={`/agency/${agency.id}`}
                                                            className="text-sm font-medium text-gray-900 hover:text-orange-600 transition duration-150"
                                                        >
                                                            {agency.name}
                                                        </Link>
                                                        <p className="text-sm text-gray-500 truncate max-w-xs">{agency.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{agency.location}</div>
                                                <div className="text-sm text-gray-500">{agency.address}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{agency.phone1}</div>
                                                <div className="text-sm text-gray-500">{agency.manager}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                    agency.status === 'active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {agency.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-3">
                                                    <Link
                                                        to={`/agency/${agency.id}`}
                                                        className="text-blue-600 hover:text-blue-900 transition duration-150"
                                                        title="View Details"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleEdit(agency)}
                                                        className="text-orange-600 hover:text-orange-900 transition duration-150"
                                                        title="Edit Agency"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(agency.id)}
                                                        className="text-red-600 hover:text-red-900 transition duration-150"
                                                        title="Delete Agency"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredAgencies.length === 0 && (
                            <div className="text-center py-12">
                                <FontAwesomeIcon icon={faBuilding} className="text-gray-400 text-4xl mb-4" />
                                <p className="text-gray-500 text-lg">No agencies found</p>
                                <p className="text-gray-400 mt-2">Create your first agency to get started</p>
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

export default CreationAgency;
