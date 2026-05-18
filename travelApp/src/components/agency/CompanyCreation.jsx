import { faEdit, faTrash, faPlus, faSearch, faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { companyService } from '../../services/companyService';

const CompanyCreation = () => {
    const [companies, setCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
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
    const [searchTerm, setSearchTerm] = useState('');
    
    // States for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        filterCompanies();
        updatePagination();
    }, [companies, searchTerm, currentPage, itemsPerPage]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await companyService.getCompanies();
            setCompanies(response || []);
        } catch (err) {
            setError('Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    const filterCompanies = () => {
        let filtered = companies;
        
        if (searchTerm) {
            filtered = companies.filter(company =>
                company.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        setFilteredCompanies(filtered);
        return filtered;
    };

    const updatePagination = () => {
        const filtered = filterCompanies();
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
        return filteredCompanies.slice(startIndex, endIndex);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = async (e) => {
        const { name, files } = e.target;
        const file = files[0];
        if (file) {
            // File size validation (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must not exceed 5MB');
                return;
            }

            // File type validation
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file');
                return;
            }

            try {
                const base64 = await toBase64(file);
                setFormData((prev) => ({
                    ...prev,
                    [name]: base64,
                }));
            } catch (error) {
                setError('Error converting image');
            }
        }
    };

    const toBase64 = (file) => {
        return new Promise((resolve, reject) => {
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
            const payload = { ...formData };

            if (editMode) {
                await companyService.updateCompany(editId, payload);
                setSuccess('Company updated successfully!');
            } else {
                await companyService.createCompany(payload);
                setSuccess('Company created successfully!');
            }

            resetForm();
            fetchCompanies();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save company');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            status: 'active',
            image1: '',
            image2: '',
            image3: '',
        });
        setEditMode(false);
        setEditId(null);
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
        // Scroll to form
        document.getElementById('company-form').scrollIntoView({ behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this company?')) {
            return;
        }

        try {
            await companyService.deleteCompany(id);
            setSuccess('Company deleted successfully!');
            fetchCompanies();
        } catch (err) {
            setError('Failed to delete company');
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
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
                    className={`px-3 py-1 mx-1 rounded ${
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
            <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCompanies.length)} of {filteredCompanies.length} companies
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                    >
                        Previous
                    </button>
                    {pages}
                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
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
                <h1 className="text-3xl font-bold text-gray-800">Company Management</h1>
                <button
                    onClick={fetchCompanies}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                    <FontAwesomeIcon icon={faSync} className="mr-2" />
                    Refresh
                </button>
            </div>

            {/* Alert messages */}
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
                id="company-form"
                onSubmit={handleSubmit} 
                className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-200"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        <FontAwesomeIcon icon={editMode ? faEdit : faPlus} className="mr-2 text-orange-600" />
                        {editMode ? 'Edit Company' : 'New Company'}
                    </h2>
                    {editMode && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-sm text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="col-span-2 lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                            required
                            placeholder="Enter company name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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

                    {[1, 2, 3].map((num) => (
                        <div key={num}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        {loading ? 'Processing...' : editMode ? 'Update Company' : 'Create Company'}
                    </button>
                </div>
            </form>

            {/* Company List */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                    <h2 className="text-xl font-semibold text-gray-800">Company List</h2>
                    
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        <div className="relative">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for a company..."
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
                        <p className="mt-2 text-gray-600">Loading companies...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {getCurrentItems().map((company) => (
                                        <tr key={company.id} className="hover:bg-gray-50 transition duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{company.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    company.status === 'active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {company.status === 'active' ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(company)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4 transition duration-150"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(company.id)}
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

                        {filteredCompanies.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No companies found
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

export default CompanyCreation;
