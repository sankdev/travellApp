import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
    faPlane, 
    faBuilding, 
    faMapMarkerAlt, 
    faFileAlt, 
    faCheckCircle, 
    faCalendarAlt, 
    faCalendarCheck,
    faEdit,
    faTrash,
    faPlus,
    faSync,
    faSearch,
    faFilter,
    faSort,
    faSortUp,
    faSortDown
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { destinationService } from '../../services/destinationService';
import { companyService } from '../../services/companyService';
import { classeService } from '../../services/classService';
import { volService } from '../../services/volService';
import { agencyService } from '../../services/agencyService';

const VolCRUD = () => {
    // States
    const [vols, setVols] = useState([]);
    const [classes, setClasses] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    
    // Pagination & Filtering
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const [formData, setFormData] = useState({
        name: '',
        companyId: '',
        destinationId: '',
        description: '',
        status: 'active',
        
        
        originId: '',
    });

    // Fetch all data with error handling
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        
        try {
            const [volsRes, classesRes, companiesRes, destinationsRes, agenciesRes] = await Promise.all([
                volService.getVols(),
                classeService.getClasses(),
                companyService.getCompanies(),
                destinationService.getDestinations(),
                agencyService.getUserAgencies()
            ]);

            setVols(Array.isArray(volsRes) ? volsRes : []);
            setClasses(classesRes || []);
            setCompanies(Array.isArray(companiesRes) ? companiesRes : []);
            setDestinations(destinationsRes || []);
            setAgencies(Array.isArray(agenciesRes?.data) ? agenciesRes.data : []);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Validate form data
    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Flight name is required');
            return false;
        }
        if (!formData.companyId) {
            setError('Please select a company');
            return false;
        }
        if (!formData.originId) {
            setError('Please select origin destination');
            return false;
        }
        if (!formData.destinationId) {
            setError('Please select destination');
            return false;
        }
        if (formData.originId === formData.destinationId) {
            setError('Origin and destination cannot be the same');
            return false;
        }
        
        
        return true;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) return;

        setSubmitting(true);

        try {
            if (editMode) {
                await volService.updateVol(editId, formData);
                setSuccess('Flight updated successfully!');
            } else {
                await volService.createVol(formData);
                setSuccess('Flight created successfully!');
            }
            
            resetForm();
            await fetchData();
            
            // Auto-clear success message
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            console.error('Submission error:', err);
            setError(err.response?.data?.message || 'Failed to save flight');
        } finally {
            setSubmitting(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            companyId: '',
            destinationId: '',
            description: '',
            status: 'active',
            
            originId: '',
        });
        setEditMode(false);
        setEditId(null);
    };

    // Handle edit
    const handleEdit = (vol) => {
        setFormData({
            name: vol.name,
            companyId: vol.companyId,
            destinationId: vol.destinationId,
            description: vol.description || '',
            status: vol.status,
            originId: vol.originId,
        });
        setEditMode(true);
        setEditId(vol.id);
        
        // Scroll to form
        document.getElementById('flight-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Handle delete with confirmation
    const handleDelete = async (id, flightName) => {
        if (!window.confirm(`Are you sure you want to delete flight "${flightName}"?`)) {
            return;
        }

        try {
            await volService.deleteVol(id);
            setSuccess('Flight deleted successfully!');
            await fetchData();
            
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError('Failed to delete flight');
        }
    };

    // Utility functions
    const getCompanyById = (id) => {
        const company = companies.find(item => item.id === parseInt(id));
        return company ? company.name : 'Unknown';
    };

    const getDestinationById = (id) => {
        const destination = destinations.find(item => item.id === parseInt(id));
        return destination ? destination.name : 'Unknown';
    };

    // Filtering and sorting
    const filteredAndSortedVols = useMemo(() => {
        let filtered = vols.filter(vol => 
            vol.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getCompanyById(vol.companyId)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getDestinationById(vol.destinationId)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getDestinationById(vol.originId)?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(vol => vol.status === statusFilter);
        }

        // Apply sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle nested properties and special cases
                if (sortConfig.key === 'company') {
                    aValue = getCompanyById(a.companyId);
                    bValue = getCompanyById(b.companyId);
                } else if (sortConfig.key === 'destination') {
                    aValue = getDestinationById(a.destinationId);
                    bValue = getDestinationById(b.destinationId);
                } else if (sortConfig.key === 'origin') {
                    aValue = getDestinationById(a.originId);
                    bValue = getDestinationById(b.originId);
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [vols, searchTerm, statusFilter, sortConfig, companies, destinations]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedVols.length / itemsPerPage);
    const paginatedVols = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedVols.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedVols, currentPage, itemsPerPage]);

    // Handle sort
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Sort indicator component
    const SortIndicator = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <FontAwesomeIcon icon={faSort} className="text-gray-400" />;
        return sortConfig.direction === 'asc' ? 
            <FontAwesomeIcon icon={faSortUp} className="text-orange-600" /> : 
            <FontAwesomeIcon icon={faSortDown} className="text-orange-600" />;
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Flight Management</h1>
                    <p className="text-gray-600 mt-2">Manage airline flights and schedules</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <FontAwesomeIcon icon={faSync} className="h-4 w-4" />
                    Refresh Data
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
                        ×
                    </button>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>{success}</span>
                    <button onClick={() => setSuccess("")} className="text-green-500 hover:text-green-700">
                        ×
                    </button>
                </div>
            )}

            {/* Form Section */}
            <div id="flight-form" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <FontAwesomeIcon icon={editMode ? faEdit : faPlus} className="text-orange-600" />
                        {editMode ? "Edit Flight" : "Create New Flight"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Flight Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faPlane} className="text-blue-500" />
                                Flight Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., AF1234"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                required
                            />
                        </div>

                        {/* Company */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faBuilding} className="text-green-500" />
                                Airline Company *
                            </label>
                            <select
                                name="companyId"
                                value={formData.companyId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                required
                            >
                                <option value="">Select Airline</option>
                                {companies.map((company) => (
                                    <option key={company.id} value={company.id}>
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Origin */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-red-500" />
                                Origin *
                            </label>
                            <select
                                name="originId"
                                value={formData.originId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                required
                            >
                                <option value="">Select Origin</option>
                                {destinations.map((destination) => (
                                    <option key={destination.id} value={destination.id}>
                                        {destination.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Destination */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-600" />
                                Destination *
                            </label>
                            <select
                                name="destinationId"
                                value={formData.destinationId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                required
                            >
                                <option value="">Select Destination</option>
                                {destinations.map((destination) => (
                                    <option key={destination.id} value={destination.id}>
                                        {destination.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Start Date */}
                        

                        {/* End Date */}
             

                        {/* Description */}
                        <div className="md:col-span-2 lg:col-span-3 space-y-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faFileAlt} className="text-gray-500" />
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Flight description or notes..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="canceled">Canceled</option>
                            </select>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`flex-1 inline-flex justify-center items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors ${
                                submitting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    {editMode ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={editMode ? faEdit : faPlus} />
                                    {editMode ? "Update Flight" : "Create Flight"}
                                </>
                            )}
                        </button>

                        {editMode && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex-1 inline-flex justify-center items-center gap-2 px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Flight List ({filteredAndSortedVols.length})
                        </h2>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            {/* Search */}
                            <div className="relative w-full sm:w-64">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search flights..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="canceled">Canceled</option>
                                </select>
                            </div>

                            {/* Items Per Page */}
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            >
                                <option value={5}>5 per page</option>
                                <option value={10}>10 per page</option>
                                <option value={25}>25 per page</option>
                                <option value={50}>50 per page</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {[
                                    { key: 'name', label: 'Flight' },
                                    { key: 'company', label: 'Airline' },
                                    { key: 'origin', label: 'Origin' },
                                    { key: 'destination', label: 'Destination' },
                                  
                                    { key: 'status', label: 'Status' },
                                    { key: 'actions', label: 'Actions' }
                                ].map(({ key, label }) => (
                                    <th 
                                        key={key}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={() => key !== 'actions' && handleSort(key)}
                                    >
                                        <div className="flex items-center gap-1">
                                            {label}
                                            {key !== 'actions' && <SortIndicator columnKey={key} />}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedVols.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                        {searchTerm || statusFilter !== 'all' ? 'No matching flights found' : 'No flights created yet'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedVols.map((vol) => (
                                    <tr key={vol.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faPlane} className="text-blue-500" />
                                                <span className="text-sm font-medium text-gray-900">{vol.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getCompanyById(vol.companyId)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {getDestinationById(vol.originId)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {getDestinationById(vol.destinationId)}
                                        </td>
                                       
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                vol.status === 'active' ? 'bg-green-100 text-green-800' :
                                                vol.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {vol.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(vol)}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-lg hover:bg-blue-50"
                                                    title="Edit"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(vol.id, vol.name)}
                                                    className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-lg hover:bg-red-50"
                                                    title="Delete"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-700">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedVols.length)} of {filteredAndSortedVols.length} flights
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 border text-sm font-medium rounded-md transition-colors ${
                                            currentPage === pageNum
                                                ? 'border-orange-500 bg-orange-500 text-white'
                                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VolCRUD;
