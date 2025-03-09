import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { customerService } from '../../../services/customerService';
import { destinationService } from '../../../services/destinationService';
import { companyService } from '../../../services/companyService';
import { volService } from '../../../services/volService';
import { agencyService } from '../../../services/agencyService';
import { reservationService } from '../../../services/reservationService';
const ReservationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [reservation, setReservation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
     const [classes, setClasses] = useState([]);
            const [companies, setCompanies] = useState([]);
            const [page, setPage] = useState(1);
                const [totalPages, setTotalPages] = useState(1);
            const [destinations, setDestinations] = useState([]);
            const [search, setSearch] = useState('');
             const [agencies, setAgencies] = useState([]);
             const [vols, setVols] = useState([]);

    useEffect(() => {
        fetchReservationDetails();
        fetchVols();
        fetchClasses();
        fetchCompanies();
        fetchDestinations();
        fetchAgencies();
    }, [id]);
    
    const fetchVols = async () => {
        try {
            const response = await volService.getVols();
            setVols(Array.isArray(response) ? response : []); // Ensure vols is an array
        } catch (err) {
            setError('Failed to fetch vols');
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await axios.get('/api/classes');
            console.log('classList',response.data)
            setClasses(response.data);
        } catch (err) {
            setError('Failed to fetch classes');
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await companyService.getCompanies();
            console.log('companieList',response)
            setCompanies(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Failed to fetch companies');
        }
    };

    const fetchDestinations = async () => {
        try {
            const response = await destinationService.getDestinations();
            console.log('destinationList',response)
            setDestinations(response);
        } catch (err) {
            setError('Failed to fetch destinations');
        }
    };
    console.log('destinationState',destinations)
   
    const fetchReservationDetails = async () => {
        try {
            const response = await reservationService.getReservationById(id);
            console.log('reservationDetail',response.data)
            setReservation(response.data); // Update to access the correct data structure
            setLoading(false);
        } catch (err) {
            setError('Failed to load reservation details');
            setLoading(false);
        }
    };

    const handleCancelReservation = async () => {
        if (window.confirm('Are you sure you want to cancel this reservation?')) {
            try {
                await reservationService.cancelReservation(id);
                fetchReservationDetails(); // Refresh the details
            } catch (err) {
                setError('Failed to cancel reservation');
            }
        }
    };

     const fetchAgencies = async () => {
              try {
                  const response = await agencyService.getAgencies({ page, search });
                  console.log('API Response:', response);
          
                  // Vérifiez si la pagination est présente
                  if (response.pagination) {
                      setTotalPages(response.pagination.page);
                  } else {
                      console.warn('Pagination is missing in response');
                      setTotalPages(1); // Valeur par défaut si la pagination est absente
                  }
          
                  // Vérifiez si les données d'agences sont présentes
                  if (Array.isArray(response.data)) {
                      setAgencies(response.data);
                  } else {
                      setAgencies([]);
                      console.warn('Agencies data is missing or not an array');
                  }
              } catch (err) {
                  console.error('Fetch error:', err.response ? err.response.data : err.message);
                  setError('Failed to fetch agencies');
              }
          };
         
    
      
    
       
    
        const getClassById = (id) => {
            if (!classes || !classes.length) return 'Unknown';
            const classItem = classes.find((item) => item.id === parseInt(id));
            console.log('classItem', classItem);
            return classItem ? classItem.name : 'Unknown';
        };
    
        const getAgeciesById = (id) => {
            if (!agencies || !agencies.length) return 'Unknown';
            const classItem = agencies.find((item) => item.id === parseInt(id));
            console.log('agencies', classItem);
            return classItem ? classItem.name : 'Unknown';
        };
        const getCompanyById = (id) => {
            if (!companies || !companies.length) return 'Unknown';
            const company = companies.find((item) => item.id === parseInt(id));
            return company ? company.name : 'Unknown';
        };
    
        const getDestinationById = (id) => {
            if (!destinations || !destinations.length) return { country: 'Unknown', city: 'Unknown' };
            const destination = destinations.find((item) => item.id === parseInt(id));
            return destination 
                ? { country: destination.country || 'Unknown', city: destination.city || 'Unknown' } 
                : { country: 'Unknown', city: 'Unknown' };
        };
        

    const getStatusColor = (status) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // if (loading) {
    //     return (
    //         <div className="flex justify-center items-center h-64">
    //             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    //         </div>
    //     );
    // }

    // if (!reservation) {
    //     return (
    //         <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    //             <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
    //                 {error || 'Reservation not found'}
    //             </div>
    //         </div>
    //     );
    // }
    console.log('reservationdisplay',reservation)

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl">
                        Reservation Details
                    </h2>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                    <button
                        onClick={() => navigate('/customer/reservations')}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
                    >
                        <i className="fas fa-arrow-left mr-2"></i> Back to List
                    </button>
                    {reservation?.status === 'Pending' && (
                        <button
                            onClick={handleCancelReservation}
                            className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300"
                        >
                            <i className="fas fa-times mr-2"></i> Cancel Reservation
                        </button>
                    )}
                </div>
            </div>

            {/* Reservation Info */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">{reservation?.vols.flight.name}</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation?.status)}`}>
                    {reservation?.status}
                </span>
            </div>
            <div className="p-6">
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-8">
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Destination</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                            {(() => {
                                const destination = getDestinationById(reservation?.
                                    endDestinationId || 'Unknown');
                                return `${destination.city}, ${destination.country}`;
                            })()}
                        </dd>  
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Travel Dates</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                            {formatDate(reservation?.startAt)} - {formatDate(reservation?.endAt)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Trip Type</dt>
                        <dd className="mt-1 text-sm text-gray-900">{reservation?.tripType}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Reservation Price</dt>
                        <dd className="mt-1 text-sm text-gray-900">{reservation?.totalPrice}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Class</dt>
                        <dd className="mt-1 text-sm text-gray-900">{reservation?.class?.class.name}</dd>
                    </div>
                    {reservation?.description && (
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                            <dd className="mt-1 text-sm text-gray-900">{reservation.description}</dd>
                        </div>
                    )}
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Document Information</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                            {reservation?.typeDocument}: {reservation?.numDocument}
                        </dd>
                    </div>
                </dl>
            </div>
        </div>

            {/* Passengers Section */}
            <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">Passengers</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Type</th>
   
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Date Issue</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Date Expiration</th>

                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {reservation?.passengers?.map((passenger, index) => (
                          <tr key={index}>
                            {/* Nom du passager */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {passenger.firstName} {passenger.lastName}
                            </td>
                      
                            {/* Type et numéro de document */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {passenger.Documents?.length > 0 ? (
                                <ul>
                                  {passenger.Documents.map((doc, docIndex) => {
                                    // Construction de l'URL correcte
                                    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                                    const documentUrl = doc.documentPath.startsWith("http")
                                      ? doc.documentPath
                                      : `${baseUrl}/${doc.documentPath.split('\\').slice(-2).join('/')}`;
                      
                                    return (
                                      <li key={docIndex} className="flex items-center space-x-2">
                                        <span>{doc.typeDocument} ({doc.documentNumber})</span>
                                        <a
                                          href={documentUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-500 hover:underline"
                                        >
                                          Télécharger PDF
                                        </a>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <span className="text-gray-400">Aucun document</span>
                              )}
                            </td>
                      
                            {/* Date d'émission */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {passenger.Documents?.length > 0 ? (
                                <ul>
                                  {passenger.Documents.map((doc, docIndex) => (
                                    <li key={docIndex}>{doc.issueDate ? new Date(doc.issueDate).toLocaleDateString() : 'N/A'}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                      
                            {/* Date d'expiration */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {passenger.Documents?.length > 0 ? (
                                <ul>
                                  {passenger.Documents.map((doc, docIndex) => (
                                    <li key={docIndex}>{doc.expirationDate ? new Date(doc.expirationDate).toLocaleDateString() : 'N/A'}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      
                    </table>
                </div>
            </div>

            {/* Additional Information */}
            {(reservation?.vols?.flight.company || reservation?.vols || reservation?.campaign) && (
                <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
                    <dl className="divide-y divide-gray-200">
                        {reservation?.company && (
                            <div className="px-6 py-5">
                                <dt className="text-sm font-medium text-gray-500">Company</dt>
                                <dd className="mt-1 text-sm text-gray-900">{reservation.company.name}</dd>
                            </div>
                        )}
                        {reservation?.vols?.flight && (
                            <div className="px-6 py-5">
                                <dt className="text-sm font-medium text-gray-500">Flight</dt>
                                <dd className="mt-1 text-sm text-gray-900">{reservation.vols?.flight.name}</dd>
                                <dt className="text-sm font-medium text-gray-500">One -Type Price</dt>
                                <dd className="mt-1 text-sm text-gray-900">  {reservation.vols.price} Fcfa</dd>

                                
                            </div>
                            
                        )}
                        {reservation?.campaign && (
                            <div className="px-6 py-5">
                                <dt className="text-sm font-medium text-gray-500">Campaign</dt>
                                <dd className="mt-1 text-sm text-gray-900">{reservation.campaign.name}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            )}
        </div>
    );
};

export default ReservationDetail;
