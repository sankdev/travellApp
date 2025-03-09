import React, { useEffect, useState } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { agencyService } from '../../services/agencyService';
import ClassComponent from './Class';
import Compaign from './Compaign';
import CompanyCreation from './CompanyCreation';
import Destination from './Destination';
import CreationImage from './ImageCreation';

const AgencyDashboard = () => {
    const { agencyId } = useParams(); // Get agencyId from URL parameters
    const [agencyData, setAgencyData] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAgencyData = async () => {
            try {
                const agencyResponse = await agencyService.getUserAgencies();
                const ageniciesList = Array.isArray(agencyResponse.data) ? agencyResponse.data : [];
            console.log('agenciesList',ageniciesList)
                setAgencyData(ageniciesList.find(agencyData=>agencyData._id===agencyId));
                // const statsResponse = await agencyService.getAgencyStats();
                // setStats(statsResponse.data);
            } catch (err) {
                setError(err.message || 'Failed to load agency data');
            } finally {
                setLoading(false);
            }
        };

        
            fetchAgencyData();
        
    }, [agencyId]);
 console.log(agencyData?.agencyImages)
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (!agencyData) {
        return (
            <div className="text-center p-4">
                <div className="text-gray-500">No agency data available</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* En-tête du tableau de bord */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <div className="flex items-center space-x-4">
            {agencyData.logo && <img 
                src={ `http://localhost:5000${agencyData.logo}` } 
                alt="Agency Logo"
                className="h-20 w-20 rounded-full object-cover"
            />}
               
            
            
            
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{agencyData?.name}</h1>
                        <p className="text-gray-500">{agencyData?.location}</p>
                    </div>
                </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="text-gray-500">Total Bookings</div>
                    <div className="text-3xl font-bold">{stats?.totalBookings || 0}</div>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="text-gray-500">Rating</div>
                    <div className="text-3xl font-bold">{agencyData?.rating || 'N/A'}</div>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="text-gray-500">Active Tours</div>
                    <div className="text-3xl font-bold">{stats?.activeTours || 0}</div>
                </div>
            </div>

            {/* Informations de l'agence */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Agency Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-500">Address</label>
                        <p>{agencyData?.address || 'Not specified'}</p>
                    </div>
                    <div>
                        <label className="block text-gray-500">Phone</label>
                        <p>{agencyData?.phone1 || 'Not specified'}</p>
                    </div>
                    <div>
                        <label className="block text-gray-500">Manager</label>
                        <p>{agencyData?.manager || 'Not specified'}</p>
                    </div>
                    <div>
                        <label className="block text-gray-500">Status</label>
                        <p className={`capitalize ${
                            agencyData?.status === 'active' ? 'text-green-500' : 'text-red-500'
                        }`}>
                            {agencyData?.status || 'Not specified'}
                        </p>
                    </div>
                </div>
            </div>

          {agencyData?.agencyImages?.length > 0 && (
    <div className="bg-white shadow rounded-lg p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Agency Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agencyData.agencyImages.map((image, index) => {
                const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                const imageUrl = image.url.includes('\\') 
                    ? `${baseUrl}/${image.url.split('\\').slice(-2).join('/')}`
                    : image.url;
                
                return (
                    <img 
                        key={index}
                        src={imageUrl} 
                        alt={`Agency Image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                    />
                );
            })}
        </div>
    </div>
)}


            {/* Routes for nested components */}
            <Routes>
                <Route path="destination" element={<Destination />} />
                <Route path="company" element={<CompanyCreation />} />
                <Route path="class" element={<ClassComponent />} />
                <Route path="compaign" element={<Compaign />} />
                <Route path="image" element={<CreationImage />} />
            </Routes>
        </div>
    );
};

export default AgencyDashboard;
