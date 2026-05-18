// components/AgencyDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { agencyService } from '../../services/agencyService'; // À créer selon votre structure
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faCalendarAlt,
  faMapMarkerAlt,
  faBuilding,
  faPhone,
  faUser,
  faStar,
  faUsers,
  faEnvelope,
  faGlobe,faChevronRight,
  faCamera
} from '@fortawesome/free-solid-svg-icons';
import {
  faFacebook,
  faTwitter,
  faInstagram
} from '@fortawesome/free-brands-svg-icons';

const AgencyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgency = async () => {
      try {
        setLoading(true);
        // Remplacez par votre service d'agence
        const result = await agencyService.getAgency(id);
        console.log('Agency by ID:', result);
        setAgency(Array.isArray(result.data) ? result.data : result.data || []);
      } catch (error) {
        console.error('Failed to fetch agency:', error);
        setAgency(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAgency();
    }
  }, [id]);

  const nextImage = () => {
    if (agency?.agencyImages?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === agency.agencyImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (agency?.agencyImages?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? agency.agencyImages.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-orange-200">
          <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faBuilding} className="text-white text-3xl animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Chargement...</h2>
          <p className="text-gray-600 mb-6">Chargement des détails de l'agence</p>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-orange-200">
          <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faBuilding} className="text-white text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Agence non trouvée</h2>
          <p className="text-gray-600 mb-6">L'agence que vous recherchez n'existe pas ou a été supprimée.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bouton de retour */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-white hover:bg-orange-50 text-orange-600 hover:text-orange-800 font-bold py-3 px-6 rounded-xl transition-all duration-300 border border-orange-200 shadow-sm hover:shadow-md"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="mr-1" />
            Retour à l'accueil
          </button>
        </div>

        {/* En-tête de l'agence */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-orange-200">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            {/* Logo et informations principales */}
            <div className="flex items-start gap-6">
              {agency.logo && (
                <img
                  src={agency.logo}
                  alt={`Logo ${agency.name}`}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
              )}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {agency.name}
                  </h1>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                    agency.status === 'active' 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                  }`}>
                    {agency.status === 'active' ? '🟢 Active' : '⚫ Inactive'}
                  </span>
                </div>
                
                <p className="text-gray-700 text-xl mb-6 leading-relaxed bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                  {agency.description}
                </p>

                {/* Informations rapides */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-orange-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Manager</span>
                      <div className="font-semibold text-gray-900">{agency.manager}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-orange-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Secrétaire</span>
                      <div className="font-semibold text-gray-900">{agency.secretary}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galerie d'images */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faCamera} className="text-white text-lg" />
              </div>
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Galerie de l'agence
              </span>
            </h2>
            
            {agency.agencyImages && agency.agencyImages.length > 0 ? (
              <div className="relative">
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100 border-2 border-orange-200">
                  <img
                    src={agency.agencyImages[currentImageIndex].url}
                    alt={`Image ${currentImageIndex + 1} de ${agency.name}`}
                    className="w-full h-80 object-cover"
                  />
                </div>
                
                {agency.agencyImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-white p-3 rounded-full hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-white p-3 rounded-full hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg"
                    >
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                    
                    <div className="flex justify-center mt-6 space-x-3">
                      {agency.agencyImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-4 h-4 rounded-full transition-all duration-300 transform hover:scale-125 ${
                            index === currentImageIndex 
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg' 
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl border-2 border-dashed border-orange-300">
                <FontAwesomeIcon icon={faCamera} className="text-orange-300 text-5xl mb-4" />
                <p className="text-gray-500 text-lg">Aucune image disponible</p>
              </div>
            )}
          </div>

          {/* Informations de contact */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} className="text-white text-lg" />
              </div>
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Informations de contact
              </span>
            </h2>
            
            <div className="space-y-6">
              {/* Localisation */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-200">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-500" />
                  Localisation
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-700 min-w-20">Adresse:</span>
                    <span className="text-gray-900">{agency.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-700 min-w-20">Localisation:</span>
                    <span className="text-gray-900">{agency.location}</span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faPhone} className="text-blue-500" />
                  Contact
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-700 min-w-20">Téléphone 1:</span>
                    <span className="text-gray-900">{agency.phone1}</span>
                  </div>
                  {agency.phone2 && (
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-700 min-w-20">Téléphone 2:</span>
                      <span className="text-gray-900">{agency.phone2}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faGlobe} className="text-purple-500" />
                  Suivez-nous
                </h3>
                <div className="flex gap-4">
                  <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition duration-300 transform hover:scale-110">
                    <FontAwesomeIcon icon={faFacebook} />
                  </button>
                  <button className="w-12 h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-full flex items-center justify-center transition duration-300 transform hover:scale-110">
                    <FontAwesomeIcon icon={faTwitter} />
                  </button>
                  <button className="w-12 h-12 bg-pink-600 hover:bg-pink-700 text-white rounded-full flex items-center justify-center transition duration-300 transform hover:scale-110">
                    <FontAwesomeIcon icon={faInstagram} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-8 border border-orange-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faBuilding} className="text-white text-lg" />
            </div>
            <span className="bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent">
              Informations complémentaires
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500 text-2xl mb-3" />
              <h4 className="font-bold text-gray-900 mb-2">Date de création</h4>
              <p className="text-gray-700">{formatDate(agency.createdAt)}</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl border-2 border-amber-200">
              <FontAwesomeIcon icon={faStar} className="text-amber-500 text-2xl mb-3" />
              <h4 className="font-bold text-gray-900 mb-2">Note</h4>
              <p className="text-gray-700">
                {agency.rating ? `${agency.rating}/5` : 'Non notée'}
              </p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border-2 border-green-200">
              <FontAwesomeIcon icon={faUsers} className="text-green-500 text-2xl mb-3" />
              <h4 className="font-bold text-gray-900 mb-2">Statut</h4>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                agency.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {agency.status === 'active' ? '✅ Active' : '❌ Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Bouton d'action */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-lg py-4 px-12 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
            <FontAwesomeIcon icon={faEnvelope} className="mr-3" />
            Contacter cette agence
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgencyDetails;
