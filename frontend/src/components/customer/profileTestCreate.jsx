import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { customerService } from '../../services/customerService';

const CustomerProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '', 
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        preferredLanguage: '',
        documentType: '',
        documentNumber: '',
        birthPlace: '',
        nationality: ''
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gender:" ",
        address: "",
        city: "",
        country: "",
        documents:"",
        documentType:"",
        documentNumber:"",
        birthPlace: '',
        nationality: ''
    });
    const [documentFiles, setDocumentFiles] = useState([]); // State for document files

    const navigate = useNavigate(); // Define navigate

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await customerService.getCustomerProfile();
            console.log('getPorfilecus',response.data)
            const data = response.data || {};
            setProfile(data);
            setFormData(data);
            
        } catch (err) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };
    console.log('profileFormData',formData)
    
    const handleModalInputChange = (e) => {
        const { name, value } = e.target;
        setNewCustomerData((prev) => ({
          ...prev,
          [name]: value,
        }));
      };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setDocumentFiles(Array.from(e.target.files)); // Convert FileList to an array
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            formDataToSend.append(key, formData[key]);
        });

        Array.from(documentFiles).forEach(file => {
            formDataToSend.append('documents', file);
        });

        try {
            await customerService.updateCustomerProfile(formDataToSend); // Use customerService to update profile
            setProfile(formData);
            setIsEditing(false);
            setSuccessMessage('Profile updated successfully!');
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address: '',
                city: '',gender:'',
                country: '',
                birthPlace: '',
                nationality: '',
                documentType: '',
                documentNumber: '',documents:""
            });
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        }
    };
    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
    
        const formDataToSend = new FormData();
        // Ajouter les champs texte dans FormData
        Object.keys(newCustomerData).forEach(key => {
            formDataToSend.append(key, newCustomerData[key]);
        });
    
        // Ajouter les fichiers
        Array.from(documentFiles).forEach(file => {
            formDataToSend.append('documents', file);
        });
    
        try {
            await customerService.createCustomer(formDataToSend); // Utilise FormData pour envoyer les données
            setIsModalOpen(false);
            setNewCustomerData({
                firstName: "",
                lastName: "",
                profession: "",
                birthPlace: "",
                nationality: "",
                gender: "",
                birthDate: "",
                documents: "",
                documentType: "",
            });
            setDocumentFiles([]);
            setSuccessMessage("New customer created successfully!");
            fetchProfile();
        } catch (err) {
            setError(err.message || "Failed to create customer");
        }
    };
    

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
            </div>
        );
    }
    
    const inputClassName = "mt-1 block w-full rounded-lg shadow-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Profile Information</h1>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
            {successMessage && <div className="text-green-500 mb-4 text-center">{successMessage}</div>}
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-200 shadow-md rounded-lg p-6 mb-8 max-w-4xl mx-auto">
                <h2 className="text-lg font-bold text-indigo-600 mb-6 text-center">
                    <i className="fas fa-user mr-2"></i>
                    {isEditing ? 'Edit Profile' : 'Profile Details'}
                </h2>
                <div className="md:col-span-1">
                <div className="px-4 sm:px-0">
                    <h3 className="text-lg font-semibold text-gray-900">New Reservation</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Fill in the required details to create a customer Profile. Ensure all fields are correctly filled.
                    </p>
                </div>
            </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <i className="fas fa-user mr-2 text-indigo-500"></i> First Name
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <i className="fas fa-user mr-2 text-indigo-500"></i> Last Name
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <i className="fas fa-envelope mr-2 text-indigo-500"></i> Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <i className="fas fa-phone mr-2 text-indigo-500"></i> Phone
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <i className="fas fa-map-marker-alt mr-2 text-indigo-500"></i> Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <i className="fas fa-city mr-2 text-indigo-500"></i> City
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <i className="fas fa-globe mr-2 text-indigo-500"></i> Country
                            </label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <i className="fas fa-map-marker-alt mr-2 text-indigo-500"></i> Birth Place
                            </label>
                            <input
                                type="text"
                                name="birthPlace"
                                value={formData.birthPlace || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                        {/* Gender */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <i className="fas fa-venus-mars mr-2 text-indigo-500"></i> Gender
                    </label>
                    <select
                        name="gender"
                        value={formData.gender || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <i className="fas fa-flag mr-2 text-indigo-500"></i> Nationality
                            </label>
                            <input
                                type="text"
                                name="nationality"
                                value={formData.nationality || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <i className="fas fa-id-card mr-2 text-indigo-500"></i> Document Type
                            </label>
                            <select
                                name="documentType"
                                value={formData.documentType || ''}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                                <option value="">Select Document Type</option>
                                <option value="passport">Passport</option>
                                <option value="id_card">ID Card</option>
                                <option value="driver_license">Driver's License</option>
                            </select>
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Upload Documents</label>
                        <input
                            type="file"
                            name="documents"
                            multiple
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.jpg,.png"
                            className="mt-1 block w-full px-3 py-2 border rounded-md"
                        />
                        <div className="mt-2">
                            {documentFiles.length > 0 && (
                                <ul className="list-disc ml-5">
                                    {documentFiles && documentFiles.map((file, index) => (
                                        <li key={index} className="text-sm text-gray-600">
                                            {file.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    </div>
                    <div className="text-center">
                        {!isEditing ? (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData(profile);
                                    }}
                                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Save Changes
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
            {/* Button to open modal */}
            <div className="flex justify-end mt-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 py-2 px-5 bg-green-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-5 h-5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Customer
                </button>
            </div>

            {/* Modal for Creating a New Customer */}
            {isModalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
            className="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity"
            onClick={() => setIsModalOpen(false)}
        ></div>

        {/* Modal panel */}
        <div
            className="relative inline-block w-full max-w-md sm:max-w-lg lg:max-w-xl bg-gradient-to-br from-gray-50 to-gray-200 rounded-lg px-6 py-6 text-left overflow-hidden shadow-xl transform transition-all"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
        >
            <h3
                className="text-lg font-bold text-indigo-600 mb-6 text-center"
                id="modal-headline"
            >
                <i className="fas fa-user-plus mr-2"></i>
                Create New Customer
            </h3>
            <form onSubmit={handleCreateCustomer} className="space-y-6">
                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-user mr-2 text-indigo-500"></i> First Name
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={newCustomerData.firstName}
                            onChange={handleModalInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-user mr-2 text-indigo-500"></i> Last Name
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={newCustomerData.lastName}
                            onChange={handleModalInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                    {/* Profession */}
                    <div className="col-span-1 sm:col-span-2 md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-briefcase mr-2 text-indigo-500"></i> Profession
                        </label>
                        <input
                            type="text"
                            name="profession"
                            value={newCustomerData.profession}
                            onChange={handleModalInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-envelope mr-2 text-indigo-500"></i> Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={newCustomerData.email || ''}
                            onChange={handleModalInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-phone mr-2 text-indigo-500"></i> Phone
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={newCustomerData.phone || ''}
                            onChange={handleModalInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                    {/* Address */}
                    <div className="col-span-1 sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-home mr-2 text-indigo-500"></i> Address
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={newCustomerData.address || ''}
                            onChange={handleModalInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <i className="fas fa-city mr-2 text-indigo-500"></i> City
                    </label>
                    <input
                        type="text"
                        name="city"
                        value={newCustomerData.city || ''}
                        onChange={handleModalInputChange}                 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <i className="fas fa-globe mr-2 text-indigo-500"></i> Country
                    </label>
                    <input
                        type="text"
                        name="country"
                        value={newCustomerData.country || ''}
                        onChange={handleModalInputChange}

                        
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                </div>
                <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <i className="fas fa-flag mr-2 text-indigo-500"></i> Nationality
                            </label>
                            <input
                                type="text"
                                name="nationality"
                                value={newCustomerData.nationality || ''}
                                onChange={handleModalInputChange}
                                
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <i className="fas fa-map-marker-alt mr-2 text-indigo-500"></i> Birth Place
                    </label>
                    <input
                        type="text"
                        name="birthPlace"
                        value={newCustomerData.birthPlace || ''}
                        onChange={handleModalInputChange}

                        
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                </div>
                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-venus-mars mr-2 text-indigo-500"></i> Gender
                        </label>
                        <select
                            name="gender"
                            value={newCustomerData.gender || ''}
                            onChange={handleModalInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                    
                                    <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <i className="fas fa-id-card mr-2 text-indigo-500"></i> Document Type
                            </label>
                            <select
                                name="documentType"
                                value={newCustomerData.documentType || ''}
                                onChange={handleModalInputChange}
                                
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                                <option value="">Select Document Type</option>
                                <option value="passport">Passport</option>
                                <option value="id_card">ID Card</option>
                                <option value="driver_license">Driver's License</option>
                            </select>
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Upload Documents</label>
                        <input
                            type="file"
                            name="documents"
                            multiple
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.jpg,.png"
                            className="mt-1 block w-full px-3 py-2 border rounded-md"
                        />
                        <div className="mt-2">
                            {documentFiles.length > 0 && (
                                <ul className="list-disc ml-5">
                                    {documentFiles && documentFiles.map((file, index) => (
                                        <li key={index} className="text-sm text-gray-600">
                                            {file.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    
                </div>

                {/* Modal Buttons */}
                <div className="flex flex-wrap justify-center sm:justify-end space-x-4 mt-6">
    <button
        type="button"
        onClick={() => setIsModalOpen(false)}
        className="px-4 py-2 text-sm font-medium bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
    >
        Cancel
    </button>
    <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
    >
        Save
    </button>
</div>

            </form>
        </div>
    </div>
</div>

            )}
        </div>
    );
};

export default CustomerProfile;
