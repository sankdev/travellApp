import React, { useEffect, useState, useCallback } from "react";
import { 
    faEdit, 
    faTrash, 
    faPlus, 
    faPlane, 
    faBuilding, 
    faClock,
    faDollarSign,
    faCalendarAlt,
    faSync,
    faSearch
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { agencyAssociationService } from "../../services/agencyAssociationService";
import { agencyService } from "../../services/agencyService";
import { volService } from "../../services/volService";

const FlightAgency = () => {
    const [flightAgencies, setFlightAgencies] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [vols, setVols] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const [formData, setFormData] = useState({
        volId: "",
        agencyId: "",
        
        departureTime: "",
        arrivalTime: "",
        status: "active",
    });

    // Fetch data with error handling
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError("");
        
        try {
            const [flightAgenciesRes, agenciesRes, volsRes] = await Promise.all([
                agencyAssociationService.getUserFlightAgencies(),
                agencyService.getUserAgencies(),
                volService.getVols()
            ]);

            setFlightAgencies(flightAgenciesRes || []);
            setAgencies(agenciesRes?.data || []);
            setVols(Array.isArray(volsRes) ? volsRes : []);
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to load data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);
 console.log('volsService',vols)
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
        if (!formData.volId) {
            setError("Please select a flight");
            return false;
        }
        if (!formData.agencyId) {
            setError("Please select an agency");
            return false;
        }
        
        if (formData.departureTime && formData.arrivalTime) {
            const departure = new Date(formData.departureTime);
            const arrival = new Date(formData.arrivalTime);
            if (arrival <= departure) {
                setError("Arrival time must be after departure time");
                return false;
            }
        }
        return true;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateForm()) return;

        setSubmitting(true);

        try {
            if (editMode) {
                await agencyAssociationService.updateFlightAgency(editId, formData);
                setSuccess("Flight agency association updated successfully!");
            } else {
                await agencyAssociationService.createFlightAgency(formData);
                setSuccess("Flight agency association created successfully!");
            }
            
            resetForm();
            await fetchData();
            
            // Auto-clear success message
            setTimeout(() => setSuccess(""), 5000);
        } catch (err) {
            console.error("Submission error:", err);
            setError(err.response?.data?.message || "Failed to save flight agency association");
        } finally {
            setSubmitting(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            volId: "",
            agencyId: "",
            
            departureTime: "",
            arrivalTime: "",
            status: "active",
        });
        setEditMode(false);
        setEditId(null);
    };

    // Handle edit
    const handleEdit = (flightAgency) => {
        setFormData({
            volId: flightAgency.volId,
            agencyId: flightAgency.agencyId,
      
            departureTime: flightAgency.departureTime ? formatDateTimeLocal(flightAgency.departureTime) : "",
            arrivalTime: flightAgency.arrivalTime ? formatDateTimeLocal(flightAgency.arrivalTime) : "",
            status: flightAgency.status,
        });
        setEditMode(true);
        setEditId(flightAgency.id);
        
        // Scroll to form
        document.getElementById('flight-agency-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Handle delete with confirmation
    const handleDelete = async (id, flightName, agencyName) => {
        if (!window.confirm(`Are you sure you want to delete the association between "${flightName}" and "${agencyName}"?`)) {
            return;
        }

        try {
            await agencyAssociationService.deleteFlightAgency(id);
            setSuccess("Flight agency association deleted successfully!");
            await fetchData();
            
            setTimeout(() => setSuccess(""), 5000);
        } catch (err) {
            setError("Failed to delete flight agency association");
        }
    };

    // Format date for datetime-local input
    const formatDateTimeLocal = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    // Filter and sort data
    const filteredAndSortedAgencies = React.useMemo(() => {
        let filtered = flightAgencies.filter(fa => 
            fa.flight?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fa.agency?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fa.flight?.companyVol?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle nested properties
                if (sortConfig.key === 'flight') aValue = a.flight?.name;
                if (sortConfig.key === 'agency') aValue = a.agency?.name;
                if (sortConfig.key === 'flight') bValue = b.flight?.name;
                if (sortConfig.key === 'agency') bValue = b.agency?.name;

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [flightAgencies, searchTerm, sortConfig]);

    // Handle sort
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Sort indicator
    const SortIndicator = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return null;
        return (
            <span className="ml-1">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </span>
        );
    };

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
                    <h1 className="text-3xl font-bold text-gray-900">Flight Agency Management</h1>
                    <p className="text-gray-600 mt-2">Manage flight and agency associations</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    <FontAwesomeIcon icon={faSync} className="h-4 w-4" />
                    Refresh
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
            <div id="flight-agency-form" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <FontAwesomeIcon icon={editMode ? faEdit : faPlus} className="text-orange-600" />
                        {editMode ? "Edit Flight Agency Association" : "Create New Association"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Flight Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faPlane} className="text-blue-500" />
                                Flight *
                            </label>
                            <select
                                name="volId"
                                value={formData.volId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                required
                            >
                                <option value="">Select a flight</option>
                                {vols.map((vol) => (
                                    <option key={vol.id} value={vol.id}>
                                        {vol.name} - {vol.companyVol?.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Agency Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faBuilding} className="text-green-500" />
                                Agency *
                            </label>
                            <select
                                name="agencyId"
                                value={formData.agencyId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                required
                            >
                                <option value="">Select an agency</option>
                                {agencies.map((agency) => (
                                    <option key={agency.id} value={agency.id}>
                                        {agency.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                       
                        {/* Departure Time */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faClock} className="text-purple-500" />
                                Departure Time
                            </label>
                            <input
                                type="datetime-local"
                                name="departureTime"
                                value={formData.departureTime}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            />
                        </div>

                        {/* Arrival Time */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-500" />
                                Arrival Time
                            </label>
                            <input
                                type="datetime-local"
                                name="arrivalTime"
                                value={formData.arrivalTime}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            />
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
                                    {editMode ? "Update Association" : "Create Association"}
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
                <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Flight Agency Associations ({filteredAndSortedAgencies.length})
                    </h2>
                    
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search flights or agencies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {[
                                    { key: 'flight', label: 'Flight' },
                                    { key: 'company', label: 'Company' },
                                    { key: 'origin', label: 'Origin' },
                                    { key: 'destination', label: 'Destination' },
                                    { key: 'agency', label: 'Agency' },
                                    
                                    { key: 'departureTime', label: 'Departure' },
                                    { key: 'arrivalTime', label: 'Arrival' },
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
                            {filteredAndSortedAgencies.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                                        {searchTerm ? 'No matching associations found' : 'No flight agency associations created yet'}
                                    </td>
                                </tr>
                            ) : (
                                filteredAndSortedAgencies.map((fa) => (
                                    <tr key={fa.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {fa.flight?.name || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {fa.flight?.companyVol?.name || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {fa.flight?.origin?.name || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {fa.flight?.destination?.name || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {fa.agency?.name || "N/A"}
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {fa.departureTime ? new Date(fa.departureTime).toLocaleString() : "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {fa.arrivalTime ? new Date(fa.arrivalTime).toLocaleString() : "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(fa)}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-lg hover:bg-blue-50"
                                                    title="Edit"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(fa.id, fa.flight?.name, fa.agency?.name)}
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
            </div>
        </div>
    );
};

export default FlightAgency;
