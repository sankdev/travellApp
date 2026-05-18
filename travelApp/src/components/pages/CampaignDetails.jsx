// components/CampaignDetails.jsx
import React, { useState,useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { compaignService } from '../../services/compaignService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faBuilding, 
  faPhone, 
  faUser, 
  faPlane,faChevronRight,
  faArrowRight,
  faStar,
  faUsers,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';

const CampaignDetails = () => {
  const { id } = useParams();
  
const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
const [campaign,setCampaign]=useState([])
 const [campaigns, setCampaigns] = useState([]);
  
      const handleReservation = () => {
    // Vérifier si l'utilisateur est connecté
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (user && token) {
      // Utilisateur connecté, aller directement au formulaire
      navigate('/customer/reservations/campaign/create', {
        state: { campaignData: campaign }
      });
    } else {
      // Sauvegarder la campagne dans localStorage
      const reservationData = {
        campaignData: campaign,
        timestamp: new Date().toISOString(),
        type: 'campaign'
      };
      
      localStorage.setItem('pendingCampaignReservation', JSON.stringify(reservationData));
      
      // Rediriger vers la connexion
      navigate('/login', {
        state: {
          message: 'Connectez-vous pour finaliser votre réservation de campagne',
          from: `/campaigns/${campaign.id}`
        }
      });
    }
  };
    
   useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
      //const result = await compaignService.getCompaignById(id);
        const result = await compaignService.getActiveCampaigns();
                console.log('Campaign by ID:', result);
            setCampaigns(result);
         const foundCampaign = result.find(camp => camp.id === parseInt(id));
        console.log('Found campaign by ID:', foundCampaign);
        setCampaign(foundCampaign);
      } catch (error) {
        console.error('Failed to fetch campaign:', error);
        setCampaign(null);
      } finally {
        setLoading(false);
      }
    };

   if (id) {
      fetchCampaign();
    }
  }, [id]); 
  // Trouver la campagne par ID
  
//const campaign = campaigns?.find(camp => camp.id === parseInt(id));
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-orange-200">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faStar} className="text-white text-3xl animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Chargement...</h2>
          <p className="text-gray-600 mb-6">Chargement des détails de la campagne</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-blue-200">
          <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faBuilding} className="text-white text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Campagne non trouvée</h2>
          <p className="text-gray-600 mb-6">La campagne que vous recherchez n'existe pas ou a été supprimée.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const nextImage = () => {
    if (campaign.images && campaign.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === campaign.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (campaign.images && campaign.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? campaign.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50  to-amber-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bouton de retour */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-orange-600 hover:text-blue-800 font-bold py-3 px-6 rounded-xl transition-all duration-300 border border-blue-200 shadow-sm hover:shadow-md"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="mr-1" />
            Retour aux campagnes
          </button>
        </div>

        {/* En-tête de la campagne */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-orange-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <h1 className="text-4xl font-bold text-orange-600 bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                  {campaign.title}
                </h1>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                  campaign.status === 'active' 
                    ? 'bg-gradient-to-r from-orange-400 to-emerald-500 text-white shadow-lg' 
                    : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                }`}>
                  {campaign.status === 'active' ? '🟢 Active' : '⚫ Inactive'}
                </span>
              </div>
              
              <p className="text-gray-700 text-xl mb-6 leading-relaxed bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                {campaign.description}
              </p>
              
              <div className="flex flex-wrap gap-6 text-gray-700 bg-gradient-to-r from-orange-50 to-indigo-50 p-6 rounded-2xl border border-orange-200">
                <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-sm">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-white text-sm" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Du {formatDate(campaign.startAt)}</span>
                    <br />
                    <span className="font-semibold text-gray-900">au {formatDate(campaign.endAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-sm">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faStar} className="text-white text-sm" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Prix</span>
                    <div className="font-bold text-xl text-gray-900">{formatPrice(campaign.price)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-gradient-to-r from-orange-400 to-orange-500 px-4 py-3 rounded-lg shadow-lg">
                  <span className="text-white font-bold text-sm">{campaign.condition}</span>
                </div>
                
                <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 rounded-lg shadow-lg">
                  <span className="text-white font-bold text-sm">{campaign.type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images de la campagne */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faBuilding} className="text-white text-lg" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Galerie de la campagne
              </span>
            </h2>
            
            {campaign.images && campaign.images.length > 0 ? (
              <div className="relative">
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-200">
                  <img
                    src={campaign.images[currentImageIndex].url || campaign.images[currentImageIndex]}
                    alt={`Image ${currentImageIndex + 1} de ${campaign.title}`}
                    className="w-full h-80 object-cover"
                  />
                </div>
                
                {campaign.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-purple-600 text-white p-3 rounded-full hover:from-orange-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
                    >
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                    
                    <div className="flex justify-center mt-6 space-x-3">
                      {campaign.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-4 h-4 rounded-full transition-all duration-300 transform hover:scale-125 ${
                            index === currentImageIndex 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg' 
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border-2 border-dashed border-blue-300">
                <FontAwesomeIcon icon={faBuilding} className="text-blue-300 text-5xl mb-4" />
                <p className="text-gray-500 text-lg">Aucune image disponible</p>
              </div>
            )}
          </div>

          {/* Informations de l'agence */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-orange-500 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} className="text-white text-lg" />
              </div>
              <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Informations de l'agence
              </span>
            </h2>
            
            {campaign.associatedAgency && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                  {campaign.associatedAgency.logo && (
                    <img
                      src={campaign.associatedAgency.logo}
                      alt={`Logo ${campaign.associatedAgency.name}`}
                      className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-2xl text-gray-900 mb-2">
                      {campaign.associatedAgency.name}
                    </h3>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {campaign.associatedAgency.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  
                  
                  
                  
                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 hover:border-red-300 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-white text-lg" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-700">Adresse:</span>
                      <span className="ml-2 text-gray-900 text-lg">{campaign.associatedAgency.address}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 hover:border-red-300 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-white text-lg" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-700">Localisation:</span>
                      <span className="ml-2 text-gray-900 text-lg">{campaign.associatedAgency.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faPhone} className="text-white text-lg" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-700">Téléphones:</span>
                      <span className="ml-2 text-gray-900 text-lg">
                        {[campaign.associatedAgency.phone1, campaign.associatedAgency.phone2]
                          .filter(phone => phone)
                          .join(' / ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <span className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold ${
                    campaign.associatedAgency.status === 'active' 
                      ? 'bg-gradient-to-r from-orange-400 to-emerald-500 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                  }`}>
                    {campaign.associatedAgency.status === 'active' ? '✅' : '❌'} 
                    Agence {campaign.associatedAgency.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informations du vol */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faPlane} className="text-white text-lg" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Informations du vol
            </span>
          </h2>
          
          {campaign.vol ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl border-2 border-orange-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FontAwesomeIcon icon={faBuilding} className="text-white text-2xl" />
                </div>
                <h4 className="font-bold text-gray-900 text-xl mb-3">Compagnie aérienne</h4>
                <p className="text-gray-800 font-semibold text-lg mb-2">{campaign.vol.companyVol?.name || 'Non spécifié'}</p>
                <p className="text-gray-600 text-sm">{campaign.vol.description}</p>
              </div>
              
              <div className="text-center p-8 bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl border-2 border-emerald-200 hover:border-emerald-300 transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-white text-2xl" />
                </div>
                <h4 className="font-bold text-gray-900 text-xl mb-3">Origine</h4>
                <p className="text-gray-800 font-semibold text-lg">
                  {campaign.vol.destination.name}
                </p>
              </div>
              
              <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FontAwesomeIcon icon={faArrowRight} className="text-white text-2xl" />
                </div>
                <h4 className="font-bold text-gray-900 text-xl mb-3">Destination</h4>
                <p className="text-gray-800 font-semibold text-lg mb-2">
                  {campaign.vol.destination?.name || `ID: ${campaign.vol.destinationId}`}
                </p>
                <p className="text-gray-600 text-sm">
                  {campaign.vol.destination?.address}
                </p>
              </div>

              <div className="md:col-span-3 mt-8">
                <div className="flex flex-wrap gap-8 justify-center text-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                  <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-sm">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-500 text-xl" />
                    <span><strong className="text-gray-700">Début:</strong> <span className="text-gray-900">{formatDate(campaign.vol.startAt)}</span></span>
                  </div>
                  <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-sm">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-500 text-xl" />
                    <span><strong className="text-gray-700">Fin:</strong> <span className="text-gray-900">{formatDate(campaign.vol.endAt)}</span></span>
                  </div>
                  <span className={`inline-flex items-center gap-2 px-6 py-4 rounded-xl text-lg font-bold ${
                    campaign.vol.status === 'active' 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                  }`}>
                    {campaign.vol.status === 'active' ? '✈️' : '🛑'} 
                    Vol {campaign.vol.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border-2 border-dashed border-blue-300">
              <FontAwesomeIcon icon={faPlane} className="text-blue-300 text-5xl mb-4" />
              <p className="text-gray-500 text-lg">Aucune information de vol disponible</p>
            </div>
          )}
        </div>

        {/* Bouton d'action */}
        <div className="text-center mt-12">
          <button
            onClick={handleReservation}
            className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-bold text-lg py-4 px-12 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
            <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-3" />
            Réserver maintenant
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
