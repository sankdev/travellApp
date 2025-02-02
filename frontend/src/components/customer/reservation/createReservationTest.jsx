import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agencyService } from '../../../services/agencyService';
import { companyService } from '../../../services/companyService';
import { customerService } from '../../../services/customerService';
import { destinationService } from '../../../services/destinationService';
import { reservationService } from '../../../services/reservationService'; // Import reservationService
import { volService } from '../../../services/volService'; // Import volService

const CreateReservation = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [destinations, setDestinations] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [vols, setVols] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [profile, setProfile] = useState({});
    const [passengers, setPassengers] = useState([{ 
        firstName: '', 
        lastName: '', 
        documentType: '', 
        documentNumber: '', 
        gender: '', 
        birthDate: '', 
        birthPlace: '', 
        nationality: '', 
        profession: '', 
        address: '', 
        document: '', 
        status: 'active' 
    }]);
    const [formData, setFormData] = useState({
        customerId: '',
        agencyId: '',
        destinationId: '',
        companyId: '',
        volId: '',
        campaignId: '',
        startAt: '',
        endAt: '',
        description: '',
        typeDocument: '',
        numDocument: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [destResponse, compResponse, profResponse, agResponse, custResponse, volResponse] = await Promise.all([
                    fetchDestinations(),
                    fetchCompanies(),
                    fetchProfile(),
                    fetchAgencies(),
                    fetchCustomers(),
                    fetchVols()
                ]);
            } catch (error) {
                console.error('Error in fetchData:', error);
                setError('Failed to load one or more data sets.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const fetchDestinations = async () => {
        try {
            const response = await destinationService.getDestinations();
            console.log('destination',response)
            setDestinations(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Failed to fetch destinations');
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await companyService.getCompanies();
            setCompanies(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Failed to fetch companies');
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await customerService.getCustomerProfile();
            const data = response.data || {};
            setProfile(data);
            setFormData(prev => ({
                ...prev,
                customerId: data.id || ''
            }));
        } catch (err) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchAgencies = async () => {
        try {
            const response = await agencyService.getAgencies();
            setAgencies(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Failed to fetch agencies');
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await customerService.getAllCustomers();
            console.log('customerUniue',response.data)
            setCustomers(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Failed to fetch customers');
        }
    };

    const fetchVols = async () => {
        try {
            const response = await volService.getVols(); // Use volService to fetch Vols
            setVols(Array.isArray(response) ? response : []); // Ensure vols is an array
        } catch (err) {
            setError('Failed to fetch vols');
        }
    };

    const getCompanyById = (id) => {
        if (!companies || !companies.length) return 'Unknown';
        const company = companies.find((item) => item.id === parseInt(id));
        return company ? company.name : 'Unknown';
    };

    const getDestinationById = (id) => {
        if (!destinations || !destinations.length) return 'Unknown';
        const destination = destinations.find((item) => item.id === parseInt(id));
        return destination ? destination.country : 'Unknown';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePassengerChange = (index, field, value) => {
        const newPassengers = [...passengers];
        newPassengers[index] = {
            ...newPassengers[index],
            [field]: value
        };
        setPassengers(newPassengers);
    };

    const addPassenger = () => {
        setPassengers([...passengers, { 
            firstName: '', 
            lastName: '', 
            documentType: '', 
            documentNumber: '', 
            gender: '', 
            birthDate: '', 
            birthPlace: '', 
            nationality: '', 
            profession: '', 
            address: '', 
            document: '', 
            status: 'active' 
        }]);
    };

    const removePassenger = (index) => {
        const newPassengers = passengers.filter((_, i) => i !== index);
        setPassengers(newPassengers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        try {
            const formData = new FormData();
    
            // Ajouter les données principales
            Object.keys(formData).forEach((key) => {
                formData.append(key, formData[key]);
            });
    
            // Ajouter les passagers
            passengers.forEach((passenger, index) => {
                Object.keys(passenger).forEach((key) => {
                    if (key === 'document' && passenger[key]) {
                        formData.append(
                            `passengers[${index}][document]`,
                            passenger[key]
                        );
                    } else {
                        formData.append(
                            `passengers[${index}][${key}]`,
                            passenger[key]
                        );
                    }
                });
            });
    
            await reservationService.createReservation(formData); // Envoyer les données au backend
            navigate('/customer/reservations');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create reservation');
        } finally {
            setLoading(false);
        }
    };
    
    
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">New Reservation</h1>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-200 shadow-md rounded-lg p-6 mb-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Sidebar */}
                    <div className="md:col-span-1">
                        <div className="px-4 sm:px-0">
                            <h3 className="text-lg font-semibold text-gray-900">New Reservation</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Fill in the required details to create a reservation. Ensure all fields are correctly filled.
                            </p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                            {/* Error Display */}
                            {error && (
                                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            {/* Customer */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Customer</label>
                                <select
                                    name="customerId"
                                    value={formData.customerId}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-2 w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">Select a customer</option>
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.firstName} {customer.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Agency */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Agency</label>
                                <select
                                    name="agencyId"
                                    value={formData.agencyId}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-2 w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">Select an agency</option>
                                    {agencies.map((agency) => (
                                        <option key={agency.id} value={agency.id}>
                                            {agency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Vol */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Vol</label>
                                <select
                                    name="volId"
                                    value={formData.volId}
                                    onChange={handleInputChange}
                                    className="mt-2 w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">Select Vol</option>
                                    {vols.map((vol) => (
                                        <option key={vol.id} value={vol.id}>
                                            {vol.name} - {getCompanyById(vol.companyId)} - {getDestinationById(vol.destinationId)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input
                                        type="date"
                                        name="startAt"
                                        value={formData.startAt}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-2 w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                                    <input
                                        type="date"
                                        name="endAt"
                                        value={formData.endAt}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-2 w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Document Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Document Type</label>
                                    <select
                                        name="typeDocument"
                                        value={formData.typeDocument}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-2 w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="">Select document type</option>
                                        <option value="passport">Passport</option>
                                        <option value="id_card">ID Card</option>
                                        <option value="driver_license">Driver's License</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Document Number</label>
                                    <input
                                        type="text"
                                        name="numDocument"
                                        value={formData.numDocument}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-2 w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="mt-2 w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                ></textarea>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 mt-6"></div>

                            {/* Passengers */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-lg font-medium text-gray-900">Passengers</h4>
                                    <button
                                        type="button"
                                        onClick={addPassenger}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Add Passenger
                                    </button>
                                </div>
                                
                                {passengers.map((passenger, index) => (
                                    <div key={index} className="border-t border-gray-200 pt-4 mt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                                <input
                                                    type="text"
                                                    value={passenger.firstName}
                                                    onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"

                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={passenger.lastName}
                                                    onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"

                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Document Type</label>
                                                <select
                                                    value={passenger.documentType}
                                                    onChange={(e) => handlePassengerChange(index, 'documentType', e.target.value)}
                                                    className="mt-2 w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                >
                                                    <option value="">Select document type</option>
                                                    <option value="passport">Passport</option>
                                                    <option value="id_card">ID Card</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Document Number</label>
                                                <input
                                                    type="text"
                                                    value={passenger.documentNumber}
                                                    onChange={(e) => handlePassengerChange(index, 'documentNumber', e.target.value)}
                                                    className="mt-2 w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                                <select
                                                    value={passenger.gender}
                                                    onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                                                    className="mt-2 w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                >
                                                    <option value="">Select gender</option>
                                                    <option value="feminin">Feminin</option>
                                                    <option value="masculin">Masculin</option>
                                                    <option value="autres">Autres</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                                                <input
                                                    type="date"
                                                    value={passenger.birthDate}
                                                    onChange={(e) => handlePassengerChange(index, 'birthDate', e.target.value)}
                                                    className="mt-2 w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Birth Place</label>
                                                <input
                                                    type="text"
                                                    value={passenger.birthPlace}
                                                    onChange={(e) => handlePassengerChange(index, 'birthPlace', e.target.value)}
                                                    className="mt-2 w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Nationality</label>
                                                <input
                                                    type="text"
                                                    value={passenger.nationality}
                                                    onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                                                    className="mt-2 w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Profession</label>
                                                <input
                                                    type="text"
                                                    value={passenger.profession}
                                                    onChange={(e) => handlePassengerChange(index, 'profession', e.target.value)}
                                                    className="mt-2 w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                                <input
                                                    type="text"
                                                    value={passenger.address}
                                                    onChange={(e) => handlePassengerChange(index, 'address', e.target.value)}
                                                    className="mt-2 w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Document</label>
                                                <input
                                                   type="file"
                                                   name={`passenger_${index}_document`}
                                                   multiple
                                                   onChange={(e) =>
                                                       handlePassengerChange(index, 'document', e.target.files[0])
                                                   }
                                                    className="mt-2 w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                                <select
                                                    value={passenger.status}
                                                    onChange={(e) => handlePassengerChange(index, 'status', e.target.value)}
                                                    className="mt-2 w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                            </div>
                                        </div>
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => removePassenger(index)}
                                                className="mt-2 text-sm text-red-600 hover:text-red-900"
                                            >
                                                Remove Passenger
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {loading ? 'Creating...' : 'Create Reservation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateReservation;
