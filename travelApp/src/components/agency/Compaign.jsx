import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { agencyService } from '../../services/agencyService';
import { compaignService } from '../../services/compaignService';
import { companyService } from '../../services/companyService';
import { destinationService } from '../../services/destinationService';
import { imageService } from '../../services/imageService';
import{volService} from '../../services/volService';

const Compaign = () => {
    const [compaigns, setCompaigns] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [vols, setVols] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [agencyId, setAgencyId] = useState(null); // State variable for agency ID
    const [agencies, setAgencies] = useState([]); // State variable for agencies
    const [formData, setFormData] = useState({
        title: '',
        type: '',
        description: '',
        condition: '',
        startAt: '',
        endAt: '',
        price: '',
        volId: '',
        image1: '',
        image2: '',
        image3: '',
        status: 'active',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchCompaigns();
        fetchDestinations();
        fetchVols();
        fetchCompanies();
        fetchAgencies(); // Fetch agencies when component mounts
    }, []);

    const fetchAgencies = async () => {
        try {
            const response = await agencyService.getUserAgencies();
            console.log('agencesCampaign',response.data)
            setAgencies(response.data || []); // Ensure response is an array
        } catch (err) {
            setError('Failed to fetch agencies');
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await companyService.getCompanies();
            
            setCompanies(response || []); // Ensure response is an array
        } catch (err) {
            setError('Failed to fetch companies');
        }
    };

    const fetchDestinations = async () => {
        try {
            const response = await destinationService.getDestinations();
            setDestinations(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Failed to fetch destinations');
        }
    };

    const fetchCompaigns = async () => {
        try {
            const response = await compaignService.getCompaignsByUser();
            console.log('Compaign',response)
            setCompaigns(response)
        } catch (err) {
            setError('Failed to fetch compaigns');
        }
    };

    const fetchVols = async () => {
        try {
            const response = await volService.getVols();
         console.log('volCampaign',response) 
           setVols(response);
        } catch (err) {
            setError('Failed to fetch vols');
        }
    };

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


    const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess('');

  try {
    const encodeFileToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        if (!file) resolve(null);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    };

    // Convertir les fichiers en Base64
    const images = [];
    const imageFields = ['image1', 'image2', 'image3'];

    for (const field of imageFields) {
      if (formData[field]) {
        const base64 = await encodeFileToBase64(formData[field]);
        if (base64) images.push(base64);
      }
    }

    const payload = {
       agencyId:formData.agencyId,
      title: formData.title,
      type: formData.type,
      description: formData.description,
      condition: formData.condition,
      startAt: formData.startAt,
      endAt: formData.endAt,
      price: formData.price,
      volId: formData.volId,
      status: formData.status,
      images, // tableau des images en Base64
    };
     console.log('payloads',payload)
    let response = null;
    if (editMode) {
      response = await compaignService.updateCompaign(editId, payload);
      setSuccess('Campaign updated successfully!');
    } else {
      response = await compaignService.createCompaign(payload);
      setSuccess('Campaign created successfully!');
    }

    console.log('Response:', response);

    setFormData({
      title: '',
      type: '',
      description: '',
      condition: '',
      startAt: '',
      endAt: '',
      price: '',
      volId: '',
      image1: '',
      image2: '',
      image3: '',
      status: 'active',
    });
    setEditMode(false);
    setEditId(null);
    fetchCompaigns();
  } catch (err) {
    console.error('Error:', err);
    setError('Failed to save campaign');
  } finally {
    setLoading(false);
  }
};

           
    const handleEdit = (compaign) => {
        setFormData({
            title: compaign.title,
            type: compaign.type,
            description: compaign.description,
            condition: compaign.condition,
            startAt: compaign.startAt,
            endAt: compaign.endAt,
            price: compaign.price,
            volId: compaign.volId,
            image1: '',
            image2: '',
            image3: '',
            status: compaign.status,
        });
        setEditMode(true);
        setEditId(compaign.id);
    };

    const handleDelete = async (id) => {
        try {
            await compaignService.deleteCompaign(id);
            setSuccess('Compaign deleted successfully!');
            fetchCompaigns();
        } catch (err) {
            setError('Failed to delete compaign');
        }
    };

    const getCompanyName = (companyId) => {
        const company = companies.find((company) => company.id === companyId);
        return company ? company.name : 'No Company';
    };

    const getDestinationName = (destinationId) => {
        const destination = destinations.find((destination) => destination.id === destinationId);
        return destination ? destination.name : 'No Destination';
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl text-orange-600 font-bold mb-4">Gestion Compaigns</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {success && <div className="text-green-500 mb-4">{success}</div>}
            
            <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-50 to-gray-200 shadow-md rounded-lg p-6 mb-8 max-w-4xl mx-auto">
                <h2 className="text-lg font-bold text-orange-600 mb-6 text-center">
                    <i className="fas fa-clipboard-list mr-2"></i>
                    {editMode ? 'Update Campaign' : 'Create Campaign'}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-tag mr-2 text-indigo-500"></i> Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-tag mr-2 text-indigo-500"></i> Type
                        </label>
                        <input
                            type="text"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-file-alt mr-2 text-indigo-500"></i> Description
                        </label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-check-circle mr-2 text-indigo-500"></i> Condition
                        </label>
                        <input
                            type="text"
                            name="condition"
                            value={formData.condition}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-calendar-alt mr-2 text-indigo-500"></i> Start At
                        </label>
                        <input
                            type="date"
                            name="startAt"
                            value={formData.startAt}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-calendar-check mr-2 text-indigo-500"></i> End At
                        </label>
                        <input
                            type="date"
                            name="endAt"
                            value={formData.endAt}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-dollar-sign mr-2 text-indigo-500"></i> Price
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-plane-departure mr-2 text-indigo-500"></i> Vol
                        </label>
                        <select
                            name="volId"
                            value={formData.volId}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        >
                            <option value="">Select Vol</option>
                            {Array.isArray(vols) && vols.map((vol) => (
  <option key={vol.id} value={vol.id}>
    {vol.name} - {getCompanyName(vol.companyId)} - {getDestinationName(vol.destinationId)}
  </option>
))}

                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-building mr-2 text-indigo-500"></i> Agency
                        </label>
                        <select
                            name="agencyId"
                            value={formData.agencyId}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            required
                        >
                            <option value="">Select Agency</option>
                            {agencies.map((agency) => (
                                <option key={agency.id} value={agency.id}>
                                    {agency.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-image mr-2 text-indigo-500"></i> Image 1
                        </label>
                        <input
                            type="file"
                            name="image1"
                            onChange={handleFileChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-image mr-2 text-indigo-500"></i> Image 2
                        </label>
                        <input
                            type="file"
                            name="image2"
                            onChange={handleFileChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <i className="fas fa-image mr-2 text-indigo-500"></i> Image 3
                        </label>
                        <input
                            type="file"
                            name="image3"
                            onChange={handleFileChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                </div>

                <div className="text-center">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Saving...' : editMode ? 'Update Campaign' : 'Create Campaign'}
                    </button>
                </div>
            </form>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-orange-800">Compaign List</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {Array.isArray(compaigns) && compaigns.map((compaign) => (
                                <tr key={compaign.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{compaign.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{compaign.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{compaign.condition}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(compaign.startAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(compaign.endAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{compaign.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap capitalize">{compaign.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(compaign)}
                                            className="text-orange-600 hover:text-orange-900 mr-4"
                                        >
                                            <FontAwesomeIcon icon={faEdit} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(compaign.id)}
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
            </div>
        </div>
    );
};

export default Compaign;
