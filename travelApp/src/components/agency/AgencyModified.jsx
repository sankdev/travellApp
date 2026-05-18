import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { agencyService } from '../../services/agencyService';
import { imageService } from '../../services/imageService';
import { Link } from 'react-router-dom';

const CreationAgency = () => {
    const [agencies, setAgencies] = useState([]);
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
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchAgencies = async () => {
        try {
            const response = await agencyService.getUserAgencies();
            console.log('API Response:', response);
    
         
    
            // Vérifiez si les données d'agences sont présentes
            
                setAgencies(response.data);
            
        } catch (err) {
            console.error('Fetch error:', err.response ? err.response.data : err.message);
            setError('Failed to fetch agencies');
        }
    };

    useEffect(() => {
        fetchAgencies();
    }, [page, search]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

     const handleFileChange = (e) => {
  const { name, files } = e.target;
  if (files.length > 0) {
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
  }
};




    const convertToBase64 = (file) => {
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
    const encodeFileToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    };

    // Convertir logo en Base64
    let logoBase64 = null;
    if (formData.logo) {
      logoBase64 = await encodeFileToBase64(formData.logo);
    }

    // Convertir les 3 images en Base64
    const images = [];
    const imageFields = ['image1', 'image2', 'image3'];

    for (const field of imageFields) {
      if (formData[field]) {
        const base64 = await encodeFileToBase64(formData[field]);
        if (base64) images.push(base64);
      }
    }

    // Construire le payload final
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
      images, // tableau d'images en base64
    };
    console.log('payloadsAgency',payload)
    let response = null;
    if (editMode) {
      response = await agencyService.updateAgency(editId, payload);
      setSuccess('Agency updated successfully!');
    } else {
      response = await agencyService.createAgency(payload);
      setSuccess('Agency created successfully!');
    }

    console.log('Response:', response);

    // Reset le formulaire
    setFormData({
      name: '',
      description: '',
      logo: '',
      location: '',
      status: 'active',
      address: '',
      phone1: '',
      phone2: '',
      phone3: '',
      manager: '',
      secretary: '',
      image1: '',
      image2: '',
      image3: '',
    });
    setEditMode(false);
    setEditId(null);
    fetchAgencies();
  } catch (err) {
    console.error('Submit error:', err);
    setError('Failed to save agency');
  } finally {
    setLoading(false);
  }
};


    

    const handleEdit = (agency) => {
        setFormData({
            name: agency.name,
            description: agency.description,
            logo: '',
            location: agency.location,
            status: agency.status,
            address: agency.address,
            phone1: agency.phone1,
            phone2: agency.phone2,
            phone3: agency.phone3,
            manager: agency.manager,
            secretary: agency.secretary,
            image1: '',
            image2: '',
            image3: '',
        });
        setEditMode(true);
        setEditId(agency.id);
    };

    const handleDelete = async (id) => {
        try {
            await agencyService.deleteAgency(id);
            setSuccess('Agency deleted successfully!');
            fetchAgencies();
        } catch (err) {
            setError('Failed to delete agency');
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4 text-center text-orange-600">Agency Management</h1>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
            {success && <div className="text-green-500 mb-4 text-center">{success}</div>}

            <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-50 to-gray-200 shadow-md rounded-lg p-6 mb-8 max-w-4xl mx-auto">
                <h2 className="text-lg font-bold text-orange-600 mb-6 text-center">
                    <i className="fas fa-building mr-2"></i>
                    {editMode ? 'Update Agency' : 'Create Agency'}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            <i className="fas fa-file-alt mr-2 text-indigo-500"></i> Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="Short description about the agency"
                        />
                    </div>
                     <div className="col-span-2">
  <label className="block text-sm font-medium text-gray-700">Logo</label>
  {formData.logoPreview ? (
    <img
      src={formData.logoPreview}
      alt="Preview Logo"
      className="w-20 h-20 object-cover rounded-full border mt-2"
    />
  ) : (
    <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-full mt-2">
      <span className="text-sm text-gray-500">Aucun</span>
    </div>
  )}
  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        setFormData((prev) => ({
          ...prev,
          logo: file,
          logoPreview: URL.createObjectURL(file),
        }));
      }
    }}
    className="mt-2 block w-full"
  />
</div>


                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-map-marker-alt mr-2 text-indigo-500"></i> Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="Agency location"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-address-card mr-2 text-indigo-500"></i> Address
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="Agency address"
                        />
                    </div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i}>
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <i className="fas fa-phone mr-2 text-indigo-500"></i> Phone {i + 1}
                            </label>
                            <input
                                type="text"
                                name={`phone${i + 1}`}
                                value={formData[`phone${i + 1}`]}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                placeholder={`Phone ${i + 1}`}
                            />
                        </div>
                    ))}
                    {['manager', 'secretary'].map((field) => (
                        <div key={field}>
                            <label className="block text-sm font-medium text-gray-700 flex items-center">
                                <i className={`fas fa-user-${field === 'manager' ? 'tie' : 'secretary'} mr-2 text-indigo-500`}></i> {field.charAt(0).toUpperCase() + field.slice(1)}
                            </label>
                            <input
                                type="text"
                                name={field}
                                value={formData[field]}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                            />
                        </div>
                    ))}
                    {[...Array(3)].map((_, i) => (
  <div key={i} className="mb-4">
    <label className="block text-sm font-medium text-gray-700 flex items-center mb-1">
      <i className="fas fa-image mr-2 text-indigo-500"></i> Image {i + 1}
    </label>
    <input
      type="file"
      name={`image${i + 1}`} // ✅ correct avec backticks
      accept="image/*" // ✅ permet de filtrer que des images
      onChange={handleFileChange}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
    />
  </div>
))}


                </div>
                <div className="text-center">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Saving...' : editMode ? 'Update Agency' : 'Create Agency'}
                    </button>
                </div>
            </form>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search agencies..."
                    value={search}
                    onChange={handleSearchChange}
                    className="w-full h-8 px-2 py-1 border rounded-md focus:ring-2 focus:ring-indigo-500 text-xs"
                />
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 text-orange-500">Agency List</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {agencies && agencies.map((agency) => (
                                <tr key={agency.id}>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <Link to={`/agency/${agency.id}`}>
                                            {agency.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">{agency.location}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{agency.address}</td>
                                    <td className="px-4 py-2 whitespace-nowrap capitalize">{agency.status}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(agency)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                                        >
                                            <FontAwesomeIcon icon={faEdit} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(agency.id)}
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
                <div className="flex justify-between mt-4">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="px-3 py-1 text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-xs"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="px-3 py-1 text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-xs"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreationAgency;
