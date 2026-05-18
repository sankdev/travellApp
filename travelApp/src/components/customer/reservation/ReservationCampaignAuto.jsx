import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { agencyService } from '../../../services/agencyService';
import { companyService } from '../../../services/companyService';
import { compaignService } from '../../../services/compaignService';
import { customerService } from '../../../services/customerService';
import { destinationService } from '../../../services/destinationService';
import { pricingRuleService } from '../../../services/pricingRuleService';
import { reservationService } from '../../../services/reservationService';
import { agencyAssociationService } from '../../../services/agencyAssociationService';
import { passengerService } from '../../../services/passengerService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faBuilding,
  faSearch,
  faPlane,
  faDollarSign,
  faPlaneDeparture,
  faMapSigns,
  faMapMarkerAlt,
  faMapPin,
  faCalendarAlt,
  faVenusMars,
  faSignature,
  faUser,
  faInfoCircle,
  faCheckCircle,
  faExclamationTriangle,
  faSync,
  faTimes,
  faPlus,
  faTrash,
  faUpload,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

const CreateCampaignReservationAuto = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [classes, setClasses] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  
  const [formData, setFormData] = useState({
    campaignId: '',
    agencyId: '',
    companyId: '',
    agencyVolId: '',
    startDestinationId: '',
    endDestinationId: '',
    agencyClassId: '',
    startAt: '',
    endAt: '',
    description: '',
    tripType: 'one-way',
    totalPrice: '',
    specialRequests: ''
  });

  const [passengers, setPassengers] = useState([{
    firstName: '',
    lastName: '',
    gender: 'masculin',
    birthDate: '',
    birthPlace: '',
    nationality: '',
    profession: '',
    typePassenger: "ADLT",
    address: '',
    document: [{
      documentType: '',
      documentNumber: '',
      expirationDate: "",
      issueDate: "",
      files: []
    }],
    status: 'active',
  }]);

  const inputClassName = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm";

  // Fonction pour formater la date au format YYYY-MM-DD
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return '';
    }
  };

  // Fonction pour formater l'affichage des dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Initialisation des données
  useEffect(() => {
    const initializeFromCampaign = async () => {
      setLoading(true);
      setError('');
      
      try {
        let campaignData = null;
        
        // 1. Vérifier location.state
        if (location.state?.campaignData) {
          campaignData = location.state.campaignData;
          console.log('🎯 Campagne depuis location.state:', campaignData);
        }
        // 2. Vérifier localStorage
        else {
          const storedData = localStorage.getItem('pendingCampaignReservation');
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            campaignData = parsedData.campaignData;
            localStorage.removeItem('pendingCampaignReservation');
            console.log('🎯 Campagne depuis localStorage:', campaignData);
          }
        }

        if (!campaignData) {
          setError('Aucune donnée de campagne trouvée');
          navigate('/campaigns');
          return;
        }

        setCampaign(campaignData);
        
        // Synchroniser les données de la campagne
        await syncCampaignData(campaignData);
        
        // Charger les données complémentaires
        await Promise.all([
          fetchDestinations(),
          fetchCompanies(),
          fetchAgenciesList(),
          fetchClassesForAgency(campaignData.agencyId || campaignData.associatedAgency?.id)
        ]);
        
        setSuccess(`✅ Campagne "${campaignData.title}" pré-remplie avec succès !`);
        
      } catch (err) {
        console.error('❌ Erreur d\'initialisation:', err);
        setError('Erreur lors du chargement des données de la campagne');
      } finally {
        setLoading(false);
      }
    };

    initializeFromCampaign();
  }, [location, navigate]);

  // Synchroniser les données de la campagne
  const syncCampaignData = async (campaignData) => {
    setIsSyncing(true);
    try {
      console.log('🚀 Synchronisation des données de la campagne:', campaignData);

      // Mettre à jour l'ID de la campagne
      setFormData(prev => ({
        ...prev,
        campaignId: campaignData.id,
        totalPrice: campaignData.price
      }));

      // Synchroniser l'agence
      if (campaignData.agencyId || campaignData.associatedAgency?.id) {
        const agencyId = campaignData.agencyId || campaignData.associatedAgency?.id;
        setFormData(prev => ({
          ...prev,
          agencyId: agencyId
        }));
        console.log('✅ Agence synchronisée:', campaignData.associatedAgency?.name);
      }

      // Synchroniser le vol
      if (campaignData.volId || campaignData.vol?.id) {
        const volId = campaignData.volId || campaignData.vol?.id;
        setFormData(prev => ({
          ...prev,
          agencyVolId: volId
        }));
        console.log('✅ Vol synchronisé:', campaignData.vol?.name);
      }

      // Synchroniser la compagnie
      if (campaignData.vol?.companyId) {
        setFormData(prev => ({
          ...prev,
          companyId: campaignData.vol.companyId
        }));
        console.log('✅ Compagnie synchronisée:', campaignData.vol?.companyVol?.name);
      }

      // Synchroniser les destinations
      if (campaignData.vol?.originId) {
        setFormData(prev => ({
          ...prev,
          startDestinationId: campaignData.vol.originId
        }));
      }

      if (campaignData.vol?.destinationId) {
        setFormData(prev => ({
          ...prev,
          endDestinationId: campaignData.vol.destinationId
        }));
      }

      // Synchroniser les dates
      if (campaignData.startAt) {
        const formattedStartDate = formatDateForInput(campaignData.startAt);
        setFormData(prev => ({
          ...prev,
          startAt: formattedStartDate
        }));
      }

      if (campaignData.endAt) {
        const formattedEndDate = formatDateForInput(campaignData.endAt);
        setFormData(prev => ({
          ...prev,
          endAt: formattedEndDate
        }));
      }

      // Mettre à jour le prix
      setTotalPrice(campaignData.price || 0);

      // Mettre à jour la description
      const description = `Réservation pour la campagne: ${campaignData.title}${campaignData.description ? ` - ${campaignData.description}` : ''}`;
      setFormData(prev => ({
        ...prev,
        description: description
      }));

    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
      setError('Erreur lors de la synchronisation des données de la campagne');
    } finally {
      setIsSyncing(false);
    }
  };

  // Charger les destinations
  const fetchDestinations = async () => {
    try {
      const response = await destinationService.getDestinations({});
      setDestinations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des destinations:', error);
    }
  };

  // Charger les compagnies
  const fetchCompanies = async () => {
    try {
      const response = await companyService.getCompanies({});
      setCompanies(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des compagnies:', error);
    }
  };

  // Charger la liste complète des agences
  const fetchAgenciesList = async () => {
    try {
      const response = await agencyService.getAgencies({});
      setAgencies(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des agences:', error);
    }
  };

  // Charger les classes pour une agence
  const fetchClassesForAgency = async (agencyId) => {
    if (!agencyId) return;
    
    try {
      const response = await agencyAssociationService.getClassAgencyByAgencyId(agencyId);
      if (response && Array.isArray(response.data)) {
        setClasses(response.data);
        // Sélectionner automatiquement la première classe si disponible
        if (response.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            agencyClassId: response.data[0].id
          }));
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des classes:', error);
    }
  };

  // Gestion du changement dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestion des passagers
  const handlePassengerChange = (index, key, value) => {
    setPassengers((prev) =>
      prev.map((passenger, i) => {
        if (i === index) {
          return {
            ...passenger,
            [key]: value,
            document: passenger.document || [],
          };
        }
        return passenger;
      })
    );
  };

  const addPassenger = () => {
    setPassengers((prev) => [
      ...prev,
      {
        firstName: '',
        lastName: '',
        gender: 'masculin',
        birthDate: '',
        birthPlace: '',
        nationality: '',
        profession: '',
        typePassenger: "ADLT",
        address: '',
        document: [{
          documentType: '',
          documentNumber: '',
          expirationDate: "",
          issueDate: "",
          files: []
        }],
        status: 'active',
      },
    ]);
  };

  const removePassenger = (index) => {
    if (passengers.length === 1) {
      setError('Au moins un passager est requis');
      return;
    }
    const newPassengers = passengers.filter((_, i) => i !== index);
    setPassengers(newPassengers);
  };

  // Gestion des documents
  const addDocument = (passengerIndex) => {
    setPassengers((prev) =>
      prev.map((passenger, i) => {
        if (i === passengerIndex) {
          return {
            ...passenger,
            document: [
              ...(passenger.document || []),
              {
                documentType: '',
                documentNumber: '',
                expirationDate: "",
                issueDate: "",
                files: []
              },
            ],
          };
        }
        return passenger;
      })
    );
  };

  const removeDocument = (passengerIndex, docIndex) => {
    setPassengers((prevPassengers) => {
      const updatedPassengers = [...prevPassengers];
      updatedPassengers[passengerIndex].document.splice(docIndex, 1);
      return updatedPassengers;
    });
  };

  const handleDocumentChange = (passengerIndex, docIndex, field, value) => {
    setPassengers((prevPassengers) => {
      const updatedPassengers = [...prevPassengers];
      updatedPassengers[passengerIndex].document[docIndex][field] = value;
      return updatedPassengers;
    });
  };

  const handleFileChange = (e, passengerIndex, docIndex) => {
    const files = Array.from(e.target.files);
    setPassengers((prevPassengers) => {
      const updatedPassengers = [...prevPassengers];
      updatedPassengers[passengerIndex].document[docIndex].files = files;
      return updatedPassengers;
    });
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    // Validation des passagers
    const hasInvalidPassengers = passengers.some(p => 
      !p.firstName.trim() || !p.lastName.trim()
    );
    
    if (hasInvalidPassengers) {
      setError('Veuillez remplir les noms et prénoms de tous les passagers');
      setSubmitting(false);
      return;
    }

    try {
      // Encoder les documents en base64
      const encodedPassengers = await Promise.all(
        passengers.map(async (passenger) => {
          const encodedDocuments = await Promise.all(
            (passenger.document || []).map(async (doc) => {
              let base64Files = [];
              if (doc.files && doc.files.length > 0) {
                base64Files = await Promise.all(
                  doc.files.map((file) => {
                    return new Promise((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onload = () => resolve({
                        name: file.name,
                        type: file.type,
                        base64: reader.result,
                      });
                      reader.onerror = reject;
                      reader.readAsDataURL(file);
                    });
                  })
                );
              }
              return {
                ...doc,
                files: base64Files,
              };
            })
          );
          
          return {
            ...passenger,
            document: encodedDocuments,
          };
        })
      );

      // Préparer le payload
      const payload = {
        ...formData,
        passengers: encodedPassengers,
        totalPrice: totalPrice,
        // S'assurer que tous les IDs sont des nombres
        campaignId: Number(formData.campaignId),
        agencyId: Number(formData.agencyId),
        companyId: Number(formData.companyId),
        agencyVolId: Number(formData.agencyVolId),
        agencyClassId: formData.agencyClassId ? Number(formData.agencyClassId) : null,
        startDestinationId: formData.startDestinationId ? Number(formData.startDestinationId) : null,
        endDestinationId: formData.endDestinationId ? Number(formData.endDestinationId) : null,
      };

      console.log('📤 Envoi de la réservation de campagne:', payload);
      
      const response = await reservationService.createReservationCampaign(payload);
      
      console.log('✅ Réservation créée avec succès:', response.data);
      setSuccess('🎉 Réservation de campagne créée avec succès ! Redirection...');
      
      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate('/customer/reservations', {
          state: { 
            message: '✅ Votre réservation de campagne a été créée avec succès !'
          }
        });
      }, 2000);
      
    } catch (err) {
      console.error('❌ Erreur de soumission:', err);
      if (err.response) {
        setError(err.response.data.error || 'Une erreur est survenue lors de la création de la réservation.');
      } else if (err.request) {
        setError('Le serveur ne répond pas. Vérifiez votre connexion.');
      } else {
        setError('Une erreur inattendue est survenue.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Recalculer le prix basé sur le nombre de passagers
  useEffect(() => {
    if (campaign?.price) {
      const newTotal = campaign.price * passengers.length;
      setTotalPrice(newTotal);
      setFormData(prev => ({
        ...prev,
        totalPrice: newTotal
      }));
    }
  }, [passengers.length, campaign]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faSync} spin className="text-4xl text-purple-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Chargement des données de la campagne...</h2>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-red-500 mb-3" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Campagne non trouvée</h2>
          <p className="text-gray-600 mb-4">Les données de la campagne sont introuvables.</p>
          <button
            onClick={() => navigate('/campaigns')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour aux campagnes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/campaigns')}
          className="mb-4 flex items-center text-purple-600 hover:text-purple-800"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Retour aux campagnes
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Réservation: {campaign.title}
            </h1>
            <p className="text-gray-600">Remplissez les informations pour finaliser votre réservation de campagne</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-800 font-medium mb-1">Prix total</div>
            <div className="text-3xl font-bold text-purple-600">
              {totalPrice.toLocaleString()} FCFA
            </div>
            <div className="text-sm text-gray-600">
              {passengers.length} passager(s) × {campaign.price?.toLocaleString()} FCFA
            </div>
          </div>
        </div>
      </div>

      {/* Messages d'alerte */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 font-medium">Erreur</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button onClick={() => setError('')}>
            <FontAwesomeIcon icon={faTimes} className="text-red-500 hover:text-red-700" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-green-700 font-medium">Succès</p>
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        </div>
      )}

      {isSyncing && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
          <FontAwesomeIcon icon={faSync} spin className="text-blue-500" />
          <p className="text-blue-700">Synchronisation des données de la campagne...</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel gauche: Détails de la campagne */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faPlane} className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-900">{campaign.title}</h3>
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full mt-1">
                    {campaign.type}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Agence</p>
                  <p className="font-medium text-gray-900">{campaign.associatedAgency?.name || 'Non spécifié'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Compagnie</p>
                  <p className="font-medium text-gray-900">{campaign.vol?.companyVol?.name || 'Non spécifié'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Vol</p>
                  <p className="font-medium text-gray-900">{campaign.vol?.name || 'Vol de campagne'}</p>
                  {campaign.vol?.origin?.city && campaign.vol?.destination?.city && (
                    <p className="text-sm text-gray-600 mt-1">
                      {campaign.vol.origin.city} → {campaign.vol.destination.city}
                    </p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Dates</p>
                  <p className="text-sm text-gray-900">
                    Du {formatDate(campaign.startAt)} au {formatDate(campaign.endAt)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Prix unitaire</p>
                  <p className="text-2xl font-bold text-green-600">
                    {campaign.price?.toLocaleString()} FCFA
                  </p>
                </div>
                
                {campaign.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
                    <p className="text-sm text-gray-700">{campaign.description}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-purple-200">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-purple-500" />
                  <p className="text-sm text-gray-600">
                    Les données ci-dessus sont automatiquement pré-remplies depuis la campagne sélectionnée.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Statut de la réservation */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">Statut de la réservation</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Passagers</span>
                  <span className="font-medium text-gray-900">{passengers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Prix total</span>
                  <span className="font-bold text-purple-600">{totalPrice.toLocaleString()} FCFA</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Statut</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                    En attente
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel droit: Formulaire de réservation */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            {/* Informations générales (en lecture seule) */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FontAwesomeIcon icon={faInfoCircle} className="text-purple-500" />
                Informations de la campagne
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Agence (lecture seule) */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FontAwesomeIcon icon={faBuilding} className="mr-2 text-green-500" />
                    Agence
                  </label>
                  <input
                    type="text"
                    value={campaign.associatedAgency?.name || ''}
                    readOnly
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded cursor-not-allowed text-gray-700"
                  />
                </div>
                
                {/* Compagnie (lecture seule) */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FontAwesomeIcon icon={faPlane} className="mr-2 text-blue-500" />
                    Compagnie
                  </label>
                  <input
                    type="text"
                    value={campaign.vol?.companyVol?.name || ''}
                    readOnly
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded cursor-not-allowed text-gray-700"
                  />
                </div>
                
                {/* Dates (lecture seule) */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-green-500" />
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={formData.startAt}
                    readOnly
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded cursor-not-allowed text-gray-700"
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-green-500" />
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.endAt}
                    readOnly
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded cursor-not-allowed text-gray-700"
                  />
                </div>
              </div>
              
              {/* Description */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description additionnelle (optionnel)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Ajoutez des informations complémentaires..."
                />
              </div>
            </div>

            {/* Section Passagers */}
            <div className="border-t pt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUsers} className="text-purple-500" />
                  Passagers ({passengers.length})
                </h3>
                <button
                  type="button"
                  onClick={addPassenger}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Ajouter un passager
                </button>
              </div>

              {passengers.map((passenger, index) => (
                <div key={index} className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FontAwesomeIcon icon={faUser} className="text-purple-500" />
                      Passager {index + 1}
                    </h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removePassenger(index)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        Supprimer
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Prénom */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={passenger.firstName}
                        onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Jean"
                      />
                    </div>

                    {/* Nom */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={passenger.lastName}
                        onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Dupont"
                      />
                    </div>

                    {/* Genre */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Genre
                      </label>
                      <select
                        value={passenger.gender}
                        onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="masculin">Masculin</option>
                        <option value="feminin">Féminin</option>
                        <option value="autres">Autres</option>
                      </select>
                    </div>

                    {/* Type de passager */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type de passager
                      </label>
                      <select
                        value={passenger.typePassenger}
                        onChange={(e) => handlePassengerChange(index, 'typePassenger', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="ADLT">Adulte (ADLT)</option>
                        <option value="CHD">Enfant (CHD)</option>
                        <option value="INF">Bébé (INF)</option>
                      </select>
                    </div>

                    {/* Date de naissance */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de naissance
                      </label>
                      <input
                        type="date"
                        value={passenger.birthDate}
                        onChange={(e) => handlePassengerChange(index, 'birthDate', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    {/* Nationalité */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nationalité
                      </label>
                      <input
                        type="text"
                        value={passenger.nationality}
                        onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Française"
                      />
                    </div>

                    {/* Profession */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profession
                      </label>
                      <input
                        type="text"
                        value={passenger.profession}
                        onChange={(e) => handlePassengerChange(index, 'profession', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Ingénieur"
                      />
                    </div>

                    {/* Adresse */}
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse
                      </label>
                      <input
                        type="text"
                        value={passenger.address}
                        onChange={(e) => handlePassengerChange(index, 'address', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="123 Rue de Paris, 75000 Paris"
                      />
                    </div>
                  </div>

                  {/* Documents du passager */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-md font-medium text-gray-900 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUpload} />
                        Documents d'identité
                      </h5>
                      <button
                        type="button"
                        onClick={() => addDocument(index)}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                        Ajouter un document
                      </button>
                    </div>

                    {passenger.document.map((doc, docIndex) => (
                      <div key={docIndex} className="mb-4 p-4 bg-white rounded border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Type de document */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Type de document
                            </label>
                            <select
                              value={doc.documentType}
                              onChange={(e) => handleDocumentChange(index, docIndex, 'documentType', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="">Sélectionner</option>
                              <option value="passport">Passeport</option>
                              <option value="carte_identite">Carte d'identité</option>
                              <option value="acte_naissance">Acte de naissance</option>
                            </select>
                          </div>
                               <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                                                    <input
                                                        type="date"
                                                        value={doc.issueDate}
                                                        onChange={(e) => handleDocumentChange(index, docIndex, "issueDate", e.target.value)}
                                                        className="border-gray-300 rounded-lg block w-full p-2"
                                                    />
                                                </div>

                          {/* Numéro de document */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Numéro
                            </label>
                            <input
                              type="text"
                              value={doc.documentNumber}
                              onChange={(e) => handleDocumentChange(index, docIndex, 'documentNumber', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                              placeholder="AB123456"
                            />
                          </div>

                          {/* Date d'expiration */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date d'expiration
                            </label>
                            <input
                              type="date"
                              value={doc.expirationDate}
                              onChange={(e) => handleDocumentChange(index, docIndex, 'expirationDate', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                            />
                          </div>

                          {/* Fichier */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Fichier
                            </label>
                            <input
                              type="file"
                              onChange={(e) => handleFileChange(e, index, docIndex)}
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                              accept=".pdf,.jpg,.jpeg,.png"
                            />
                          </div>
                        </div>

                        {/* Bouton supprimer document */}
                        {docIndex > 0 && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => removeDocument(index, docIndex)}
                              className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                              Supprimer ce document
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Prix total et bouton de soumission */}
            <div className="border-t pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-purple-700">
                    {totalPrice.toLocaleString()} FCFA
                  </div>
                  <div className="text-sm text-gray-600">
                    Total pour {passengers.length} passager(s) • {campaign.price?.toLocaleString()} FCFA par personne
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Les prix incluent toutes les taxes et frais de la campagne
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/campaigns')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-8 py-3 text-lg font-semibold text-white rounded-lg transition-all flex items-center justify-center gap-2 ${
                      submitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <FontAwesomeIcon icon={faSync} spin />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Finaliser la réservation
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Informations légales */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-gray-400 mt-0.5" />
                  <p className="text-xs text-gray-600">
                    En cliquant sur "Finaliser la réservation", vous acceptez les conditions générales de vente 
                    et confirmez que toutes les informations fournies sont exactes.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignReservationAuto;
