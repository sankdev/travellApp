import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agencyService } from '../../../services/agencyService';
import { companyService } from '../../../services/companyService';
import { customerService } from '../../../services/customerService';
import { destinationService } from '../../../services/destinationService';
import { agencyAssociationService } from '../../../services/agencyAssociationService';
import { reservationService } from '../../../services/reservationService';
import { pricingRuleService } from '../../../services/pricingRuleService';
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
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const CreateReservation = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [destinations, setDestinations] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [vols, setVols] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [search, setSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [profile, setProfile] = useState({});
    const [document, setDocumentFiles] = useState([]);
    const [agencySearch, setAgencySearch] = useState('');
    const [volSearch, setVolSearch] = useState('');
    const [classes, setClasses] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [classSearch, setClassSearch] = useState('');
    const [showClassSuggestions, setShowClassSuggestions] = useState(false);
    const [showReturnVolSuggestions, setShowReturnVolSuggestions] = useState(false);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [passengersWithDocuments, setPassengersWithDocuments] = useState([]);
    const [returnVolSearch, setReturnVolSearch] = useState('');
    const [filteredReturnVols, setFilteredReturnVols] = useState([]);
    const [showAgencySuggestions, setShowAgencySuggestions] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [startDestinationSearch, setStartDestinationSearch] = useState('');
const [endDestinationSearch, setEndDestinationSearch] = useState('');
const [startDestinations, setStartDestinations] = useState([]);
const [endDestinations, setEndDestinations] = useState([]);
const [showStartDestinationSuggestions, setShowStartDestinationSuggestions] = useState(false);
const [showEndDestinationSuggestions, setShowEndDestinationSuggestions] = useState(false);


    const [showVolSuggestions, setShowVolSuggestions] = useState(false);
    const [passengers, setPassengers] = useState([{
        firstName: '',
        lastName: '',
        documentType: '',
        documentNumber: '',
        gender: '',
        birthDate: '',
        birthPlace: '',
        nationality: '',
        profession: '',typePassenger:"",
        address: '',
        document:[{
            documentType:'',
            documentNumber:'',
            issueDate: '',expirationDate: '',
            files:null
        }],
        status: 'active'
    }]);
    const [formData, setFormData] = useState({
        
        agencyId: '',
        destinationId: '',
        companyId: '', 
        agencyVolId: '',
        campaignId: '',
        returnVolId: '',
        startAt: '',
        endAt: '',
        description: '',
        startDestinationId: '', endDestinationId: '', agencyClassId: '',
        tripType: 'one-way'
        , totalPrice: ''
    });

    const inputClassName = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm";
  
    const formatDate = (dateString) => { 
        return new Date(dateString).toLocaleString('fr-FR', {
          weekday: 'long', // "dimanche"
          day: '2-digit', // "09"
          month: 'long', // "mars"
          year: 'numeric', // "2025"
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [destResponse, compResponse, profResponse, agResponse, custResponse, volResponse] = await Promise.all([
                    fetchDestinations(),
                    fetchCompanies(),
                    fetchProfile(),
                    fetchCustomers(),
                ]);
            } catch (error) {
                console.error('Error in fetchData:', error);
                setError('Failed to load one or more data sets.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        fetchClasses();
    }, []);

    useEffect(() => {
        if (classSearch.length > 0) {
            const filtered = classes.filter((cls) =>
                cls.class.name.toLowerCase().includes(classSearch.toLowerCase())
            );
            setFilteredClasses(filtered);
        } else {
            setFilteredClasses(classes);
        }
    }, [classSearch, classes]);

    const handleClassSearch = (value) => {
        setClassSearch(value);
        if (value.trim() === '') {
            setFilteredClasses([]);
            setShowClassSuggestions(false);
            return;
        }
        const filtered = classes.filter((cls) =>
            cls.class.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredClasses(filtered);
        setShowClassSuggestions(filtered.length > 0);
    };

    useEffect(() => {
        if (returnVolSearch.length > 0) {
            const filtered = vols.filter((vol) =>
                (vol.flight?.name?.toLowerCase() || '').includes(returnVolSearch.toLowerCase())
            );
            setFilteredReturnVols(filtered);
        } else {
            setFilteredReturnVols(vols);
        }
    }, [returnVolSearch, vols]);
    
        // calcule de price  en fonction de vol class et typePassenger
        // const handlePriceCalculation = async () => {
        //     const selectedVol = vols.find((v) => v.id === formData.agencyVolId);
        //     const selectedClass = Array.isArray(classes) ? classes.find((cls) => cls.id === formData.agencyClassId) : null;
        
        //     if (!selectedVol || !selectedClass) {
        //         setTotalPrice(0);
        //         return;
        //     }
        
        //     let basePrice = selectedVol.price * selectedClass.priceMultiplier;
        
        //     if (formData.tripType === "round-trip") {
        //         const selectedReturnVol = vols.find((v) => v.id === formData.returnVolId);
        //         if (selectedReturnVol) {
        //             basePrice += selectedReturnVol.price * selectedClass.priceMultiplier;
        //         }
        //     }
        
        //     try {
        //         const pricingRules = await pricingRuleService.getAllPricingRules();
        //         console.log('pricingRules', pricingRules);
                
        //         if (!pricingRules || pricingRules.length === 0) {
        //             setTotalPrice(basePrice);
        //             return;
        //         }
        
        //         // Ajout des tarifs spécifiques pour les enfants et nourrissons
        //         let totalPrice = basePrice;
        
        //         passengers.forEach((passenger) => {
        //             if (passenger.typePassenger && passenger.typePassenger !== "ADLT") { // Appliquer règles uniquement pour CHD et INF
        //                 const rule = pricingRules.find(rule =>
        //                     rule.agencyVolId === formData.agencyVolId &&
        //                     rule.agencyClassId === formData.agencyClassId &&
        //                     rule.typePassenger === passenger.typePassenger
        //                 );
        
        //                 if (rule) { 
        //                     totalPrice += rule.price;
        //                 } else {
        //                     console.warn(`Aucune règle tarifaire trouvée pour ${passenger.typePassenger}, utilisation du prix standard.`);
        //                 }
        //             }
        //         });
        
        //         setTotalPrice(totalPrice);
        //     } catch (error) {
        //                 
        // Recalculer le prix lorsque certains champs du formulaire changent
       
        const handleReturnVolSearch = (value) => {
            setReturnVolSearch(value);
        
            if (value.trim() === '') {
                setFilteredReturnVols([]);
                setShowReturnVolSuggestions(false);
                return;
            }
        
            const filtered = vols.filter((vol) =>
                (vol.flight?.name?.toLowerCase() || '').includes(value.toLowerCase()) // Évite les erreurs si `flight` est `undefined`
            );
        
            setFilteredReturnVols(filtered);
            setShowReturnVolSuggestions(filtered.length > 0);
        };
        
      // destination search
      const handleStartDestinationSearch = async (search) => {
        setStartDestinationSearch(search);
        if (search.trim().length > 0) {
          const results = await fetchDestinations(search);
          setStartDestinations(results);
          setShowStartDestinationSuggestions(true);
        } else {
          setStartDestinations([]);
          setShowStartDestinationSuggestions(false);
        }
      };
    
      const handleEndDestinationSearch = async (search) => {
        setEndDestinationSearch(search);
        if (search.trim().length > 0) {
          const results = await fetchDestinations(search);
          setEndDestinations(results);
          setShowEndDestinationSuggestions(true);
        } else {
          setEndDestinations([]);
          setShowEndDestinationSuggestions(false);
        }
      };
      
//     const handlePriceCalculation = () => {
//         const selectedVol = vols.find((v) => v.id === formData.agencyVolId);
//         // const selectedClass = classes.find((cls) => cls.id === formData.agencyClassId);
//         const selectedClass = Array.isArray(classes) ? classes.find((cls) => cls.id === formData.agencyClassId) : null;
//  console.log('selectedClass',selectedClass)

//         if (!selectedVol || !selectedClass) {
//             setTotalPrice(0);
//             return;
//         }

//         let price = selectedVol.price * selectedClass.priceMultiplier;

//         if (formData.tripType === "round-trip") {
//             const selectedReturnVol = vols.find((v) => v.id === formData.returnVolId);
//             if (selectedReturnVol) {
//                 price += selectedReturnVol.price * selectedClass.priceMultiplier;
//             }
//         }

//         setTotalPrice(price);
//     };
  const handlePriceCalculation = async () => {
              const selectedVol = vols.find((v) => v.id === formData.agencyVolId);
              const selectedClass = Array.isArray(classes) ? classes.find((cls) => cls.id === formData.agencyClassId) : null;
          
              if (!selectedVol || !selectedClass) {
                  setTotalPrice(0);
                  return;
              }
          
              let basePrice = selectedVol.price * selectedClass.priceMultiplier;
          
              if (formData.tripType === "round-trip") {
                  const selectedReturnVol = vols.find((v) => v.id === formData.returnVolId);
                  if (selectedReturnVol) {
                      basePrice += selectedReturnVol.price * selectedClass.priceMultiplier;
                  }
              }
          
              try {
                  const pricingRules = await pricingRuleService.getAllPricingRules();
                  console.log('pricingRules', pricingRules);
                  
                  if (!pricingRules || pricingRules.length === 0) {
                      setTotalPrice(basePrice);
                      return;
                  }
          
                  // Ajout des tarifs spécifiques pour les enfants et nourrissons
                  let totalPrice = basePrice;
          
                  passengers.forEach((passenger) => {
                      if (passenger.typePassenger && passenger.typePassenger !== "ADLT") { // Appliquer règles uniquement pour CHD et INF
                          const rule = pricingRules.find(rule =>
                              rule.agencyVolId === formData.agencyVolId &&
                              rule.agencyClassId === formData.agencyClassId &&
                              rule.typePassenger === passenger.typePassenger
                          );
          
                          if (rule) { 
                              totalPrice += rule.price;
                          } else {
                              console.warn(`Aucune règle tarifaire trouvée pour ${passenger.typePassenger}, utilisation du prix standard.`);
                          }
                      }
                  });
          
                  setTotalPrice(totalPrice);
              } catch (error) {
                  console.error("Erreur lors de la récupération des règles de tarification :", error);
                  setTotalPrice(basePrice);
              }
          };
    useEffect(() => {
        handlePriceCalculation();
    }, [formData.agencyClassId, formData.returnVolId, formData.agencyVolId, formData.tripType,passengers]);

    const fetchDestinations = async (search = '') => {
        try {
          const response = await destinationService.getDestinations({ search });
          setDestinations(Array.isArray(response) ? response : [])
          return Array.isArray(response) ? response : [];
          
        } catch (error) {
          console.error('Failed to fetch destinations:', error.message);
          return [];
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

    useEffect(() => {
    const fetchAgencies = async () => {
        try {
            const response = await agencyService.getAgencies({ 
                search: agencySearch,
                status: 'active' // Forcer le statut actif
            });
            
            console.log('🔍 Réponse agences:', response.data);
            
            // CORRECTION: Adapter à la structure de réponse du backend
            let agenciesData = [];
            
            if (response.data && response.data.success) {
                // Structure: { success: true, data: [...], pagination: {...} }
                agenciesData = response.data.data;
                console.log(`✅ ${agenciesData.length} agences actives trouvées`);
            } else if (Array.isArray(response.data)) {
                // Structure alternative: tableau direct
                agenciesData = response.data;
                console.log(`✅ ${agenciesData.length} agences trouvées (structure directe)`);
            } else {
                console.warn('⚠️ Structure de réponse inattendue:', response.data);
                agenciesData = [];
            }
            
            setAgencies(agenciesData);
            setShowAgencySuggestions(agenciesData.length > 0);
            
        } catch (error) {
            console.error('❌ Failed to fetch agencies:', error.message);
            console.error('Détails erreur:', error.response?.data || error.message);
            setAgencies([]);
            setShowAgencySuggestions(false);
        }
    };

    if (agencySearch.length > 0) {
        fetchAgencies();
    } else {
        setAgencies([]);
        setShowAgencySuggestions(false);
    }
}, [agencySearch]);  
    const fetchCustomers = async () => {
        try {
            const response = await customerService.getAllCustomers();
            setCustomers(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError('Failed to fetch customers');
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await agencyAssociationService.getAllClassAgencies();
            console.log('classAgency',response);
            setClasses(Array.isArray(response) ? response : []);
            // setClasses(response.data);

        } catch (err) {
            setError('Failed to fetch classes');
        }
    };

    useEffect(() => {
    const fetchVols = async () => {
        try {
            console.log('🔍 Recherche de vols avec:', volSearch);
            
            const response = await agencyAssociationService.getAllFlightAgencies({ 
                search: volSearch,
                page: 1,
                limit: 1000
            });
            
            console.log('📦 Réponse API:', response.data);
            
            let volsData = [];
            let shouldShowSuggestions = false;
            
            // Gestion flexible de la structure de réponse
            if (response.data?.success && Array.isArray(response.data.data)) {
                volsData = response.data.data;
            } else if (Array.isArray(response.data?.data)) {
                volsData = response.data.data;
            } else if (Array.isArray(response.data)) {
                volsData = response.data;
            }
            
            // Décider si on montre les suggestions
            shouldShowSuggestions = volsData.length > 0 && volSearch.trim().length > 0;
            
            setVols(volsData);
            setShowVolSuggestions(shouldShowSuggestions);
            
            console.log(`📊 Résultats: ${volsData.length} vols, Suggestions: ${shouldShowSuggestions ? 'ON' : 'OFF'}`);
            
        } catch (error) {
            console.error('❌ Erreur fetch vols:', error.message);
            setVols([]);
            setShowVolSuggestions(false);
        }
    };

    // Debounce pour éviter les appais trop fréquents
    const timeoutId = setTimeout(() => {
        if (volSearch.trim().length > 0) {
            fetchVols();
        } else {
            setVols([]);
            setShowVolSuggestions(false);
        }
    }, 300);

    return () => clearTimeout(timeoutId);
}, [volSearch]);
    const getCompanyById = (id) => {
        if (!companies || !companies.length) return 'Unknown';
        const company = companies.find((item) => item.id === parseInt(id));
        return company ? company.name : 'Unknown';
    };

    const getDestinationById = (id) => {
        if (!destinations || !destinations.length) return 'Unknown';
        const destination = destinations.find((item) => item.id === parseInt(id));
        // console.log('destinationOrigin',destination)
        return destination ? destination.country : 'Unknown';
    };

    //const handleInputChange = (e) => {
      //  const { name, value } = e.target;
       // setFormData((prev) => ({
         //   ...prev,
           // [name]: value,
           // ...(name === "tripType" && value === "one-way" ? { returnVolId: "",endAt:null } : {}),
       // }));
   // };
const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
        // Cas spécial pour le type de voyage
        if (name === "tripType") {
            if (value === "one-way") {
                // Aller simple : on vide le vol retour et la date de retour
                return {
                    ...prev,
                    [name]: value,
                    returnVolId: "",
                    endAt: "" // String vide au lieu de null
                };
            } else {
                // Aller-retour : on garde les valeurs existantes
                return {
                    ...prev,
                    [name]: value
                    // returnVolId et endAt gardent leurs valeurs actuelles
                };
            }
        }
        
        // Pour le champ endAt lui-même
        if (name === "endAt") {
            // Si c'est un aller simple, on ignore la modification de endAt
            if (prev.tripType === "one-way") {
                return prev;
            }
        }
        
        // Pour tous les autres champs
        return {
            ...prev,
            [name]: value
        };
    });
};
    const handlePassengerChange = (index, key, value) => {
        setPassengers((prev) =>
            prev.map((passenger, i) => {
                if (i === index) {
                    return {
                        ...passenger,
                        [key]: value,
                        document: passenger.document || [], // Initialiser les documents si non définis
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
                gender: '',
                birthDate: '',
                birthPlace: '',
                nationality: '',
                profession: '',
                address: '',
                document: [], // Initialiser une liste vide
            },
        ]);
    };
    

    const addDocument = (passengerIndex) => {
        setPassengers((prev) =>
            prev.map((passenger, i) => {
                if (i === passengerIndex) {
                    return {
                        ...passenger,
                        document: [
                            ...(passenger.document || []),
                            { documentType: '', documentNumber: '',expirationDate: "",
            issueDate: "", files: [] },
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
        const files = Array.from(e.target.files); // Convert FileList to Array
        setPassengers((prevPassengers) => {
            const updatedPassengers = [...prevPassengers];
            updatedPassengers[passengerIndex].document[docIndex].files = files;
            return updatedPassengers;
        });
    };
    
      
      

    const removePassenger = (index) => {
        const newPassengers = passengers.filter((_, i) => i !== index);
        setPassengers(newPassengers);
    };
    
    const resetFormState = () => {
        setPassengers([{
            firstName: '',
            lastName: '',
            gender: '',
            birthDate: '',
            birthPlace: '',
            nationality: '',
            profession: '',
            address: '',
            document: [],
            status: 'active',
        }]);
    
        setFormData({
            customerId: '',
            agencyId: '',
            destinationId: '',
            companyId: '',
            volId: '',
            campaignId: '',
            returnVolId: '',
            startAt: '',
            endAt: '',
            description: '',
            startDestinationId: '',
            endDestinationId: '',
            classId: '',
            tripType: 'one-way',
            totalPrice: '',
        });
    };
    
    
                   // Fonction dédiée pour la sélection des vols
// Fonction dédiée pour la sélection des vols - CORRIGÉE
const handleFlightSelection = (vol) => {
  console.log('✈️ Vol sélectionné:', vol);

  setFormData((prev) => ({
    ...prev,
    agencyVolId: vol.id,
    // Optionnel: mettre à jour automatiquement les destinations
    startDestinationId: vol.flight?.originId,
    endDestinationId: vol.flight?.destinationId
  }));

  // Mettre à jour la recherche avec un texte significatif
  const displayText = vol.flight?.name ||
    `${getCompanyById(vol.flight?.companyId)} - ${getDestinationById(vol.flight?.originId)} to ${getDestinationById(vol.flight?.destinationId)}`;

  setVolSearch(displayText);
  
  // CORRECTION: Fermer IMMÉDIATEMENT la liste
  setShowVolSuggestions(false);

  // Mettre à jour aussi les champs de destination si nécessaire
  if (vol.flight?.originId) {
    const originDest = destinations.find(d => d.id === vol.flight.originId);
    if (originDest) setStartDestinationSearch(originDest.name);
  }
  if (vol.flight?.destinationId) {
    const destDest = destinations.find(d => d.id === vol.flight.destinationId);
    if (destDest) setEndDestinationSearch(destDest.name);
  }
};          

         const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Validation simple
    if (!formData.startAt) {
        setError('Start date is required');
        setLoading(false);
        return;
    }

    if (formData.tripType === 'round-trip' && !formData.endAt) {
        setError('End date is required for round trips');
        setLoading(false);
        return;
    }
    try {
        // Encodage des fichiers en base64
        const encodedPassengers = await Promise.all(passengers.map(async (passenger) => {
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
                        files: base64Files, // Remplace les fichiers par base64
                    };
                })
            );

            return {
                ...passenger,
                document: encodedDocuments,
            };
        }));
               
                    const cleanedFormData = {
            ...formData,
            // Pour les aller-simple, endAt doit être null
            // Pour les aller-retour, endAt garde sa valeur
            endAt: formData.tripType === 'one-way' ? null : formData.endAt,
            // Nettoyer aussi returnVolId pour les aller-simple
            returnVolId: formData.tripType === 'one-way' ? null : formData.returnVolId
        };
        // Construction du payload final
        const payload = {
            ...cleanedFormData,
            passengers: encodedPassengers,
        };
              console.log('payloadsReservation',payload)
        // Envoi JSON
        const response = await reservationService.createReservation(payload); // Axios envoie JSON par défaut
        console.log('✔️ Réservation créée avec succès', response.data);

        setLoading(false);
        navigate('/customer/dashboard');
    } catch (err) {
        setLoading(false);
        console.error('❌ Erreur de soumission', err);

        if (err.response) {
            setError(err.response.data.error || 'Une erreur est survenue.');
        } else if (err.request) {
            setError('Le serveur ne répond pas. Vérifiez votre connexion.');
        } else {
            setError('Une erreur inattendue est survenue.');
        }
    }
};
    

    
    return (
        <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 to-gray-200 shadow-md rounded-lg p-6 mb-8 max-w-7xl mx-auto">
            <div className="md:col-span-1">
                <div className="px-4 sm:px-0">
                    <h3 className="text-lg font-semibold text-gray-900">New Reservation</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        Fill in the required details to create a reservation. Ensure all fields are correctly filled.
                    </p>
                </div>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">New Reservation</h1>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

            
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                            {error && (
                                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            

                            <div className="relative mb-4">
                                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faBuilding} className="text-green-500" />
                                    Agency
                                </label>
                                <div className="relative flex items-center">
                                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={agencySearch}
                                        onChange={(e) => setAgencySearch(e.target.value)}
                                        placeholder="Type agency name..."
                                        className="block w-full p-2 pl-10 border border-gray-300 rounded-md"
                                    />
                                </div>
                                {showAgencySuggestions && agencies.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                                        {agencies.map((agency) => (
                                            <li
                                                key={agency.id}
                                                className="p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                                                onClick={() => {
                                                    setAgencySearch(agency.name);
                                                    handleInputChange({ target: { name: 'agencyId', value: agency.id } });
                                                    setShowAgencySuggestions(false);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faBuilding} className="text-green-500" />
                                                {agency.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="relative mb-4">
                                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faPlane} className="text-red-500" />
                                    Class
                                </label>
                                <input
                                    type="text"
                                    value={classSearch}
                                    onChange={(e) => handleClassSearch(e.target.value)}
                                    placeholder="Type class name..."
                                    className="block w-full p-2 border border-gray-300 rounded-md"
                                />
                                {showClassSuggestions && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                                        {filteredClasses.map((cls) => (
                                            <li
                                                key={cls.id}
                                                className="p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                                                onClick={() => {
                                                    setFormData((prev) => ({ ...prev, agencyClassId: cls.id }));
                                                    handleInputChange({ target: { name: 'agencyClassId', value: cls.id } });
                                                    setClassSearch(cls.class.name);
                                                    setShowClassSuggestions(false);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faPlane} className="text-red-500" />
                                                {cls.class.name} - Multiplier: {cls.priceMultiplier}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                      <div className="relative mb-4">
  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
    <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-500 text-lg" />
    Select Flight
  </label>

  <div className="relative">
    <input
      type="text"
      value={volSearch}
      onChange={(e) => {
        setVolSearch(e.target.value);
        setShowVolSuggestions(true);
      }}
      onFocus={() => {
        if (vols.length > 0 && volSearch.length > 0) {
          setShowVolSuggestions(true);
        }
      }}
      onBlur={() => {
        // CORRECTION: Réduire le délai pour une fermeture plus rapide
        setTimeout(() => setShowVolSuggestions(false), 100);
      }}
      placeholder="Search for a flight..."
      className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 transition-all"
    />
    <FontAwesomeIcon
      icon={faSearch}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
    />
  </div>

  {showVolSuggestions && vols.length > 0 && (
    <div className="flight-suggestions-container">
      <ul 
        className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto animate-fadeIn"
        // CORRECTION: Empêcher le blur immédiat
        onMouseDown={(e) => e.preventDefault()}
      >
        {vols.map((vol) => (
          <li
            key={vol.id}
            className="p-3 cursor-pointer hover:bg-blue-50 flex items-center gap-3 transition-all border-b border-gray-100 last:border-b-0"
            // CORRECTION: Un seul événement onClick avec fermeture immédiate
            onClick={() => {
              handleFlightSelection(vol);
              // La fermeture est déjà gérée dans handleFlightSelection
            }}
          >
            <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-500 text-md" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                {getCompanyById(vol.flight?.companyId)}
              </p>
              <p className="text-xs text-gray-600">
                {getDestinationById(vol.flight?.originId)} → {getDestinationById(vol.flight?.destinationId)}
              </p>
              <p className="text-xs text-gray-500">
                Depart: {formatDate(vol.departureTime)} → Arrival: {formatDate(vol.arrivalTime)}
              </p>
              <p className="text-xs text-green-600 font-semibold">
                Agency: {vol.agency.name} → Price: {vol.price}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )}

  {showVolSuggestions && vols.length === 0 && volSearch.trim().length > 0 && (
    <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 p-3">
      <p className="text-sm text-gray-500 text-center">No flights found</p>
    </div>
  )}
</div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faPlane} className="text-blue-500" />
                                    Trip Type
                                </label>
                                <select
                                    name="tripType"
                                    value={formData.tripType}
                                    onChange={handleInputChange}
                                    className="block w-full p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="one-way">One-way</option>
                                    <option value="round-trip">Round-trip</option>
                                </select>
                            </div>

                            {formData.tripType === 'round-trip' && (
                                <div className="relative mt-6">
                                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faPlane} className="text-purple-500" />
                                        Return Vol
                                    </label>
                                    <input
                                        type="text"
                                        value={returnVolSearch}
                                        onChange={(e) => handleReturnVolSearch(e.target.value)}
                                        onFocus={() => setShowReturnVolSuggestions(filteredReturnVols.length > 0)}
                                        onBlur={() => {
                                            setTimeout(() => setShowReturnVolSuggestions(false), 150);
                                        }}
                                        placeholder="Type return vol name..."
                                        className="block w-full p-2 border border-gray-300 rounded-md"
                                    />
                                    {showReturnVolSuggestions && (
                                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                                            {filteredReturnVols.map((vol) => (
                                                <li
                                                    key={vol.id}
                                                    className="p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                                                    onClick={() => {
                                                        setFormData((prev) => ({ ...prev, returnVolId: vol.id }));
                                                        handleInputChange({ target: { name: 'returnVolId', value: vol.id } });
                                                        setReturnVolSearch(vol.flight.name);
                                                        setShowReturnVolSuggestions(false);
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faPlane} className="text-purple-500" />
                                                    {vol.flight.name} - {getCompanyById(vol.flight.companyId)} - {getDestinationById(vol.flight.destinationId)}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                 {/* Date de retour (si aller-retour) */}
          
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                Date de retour
              </label>
              <input
                type="date"
                name="endAt"
                value={formData.endAt}
                 required={formData.tripType === 'round-trip'} // Seulement requis pour aller-retour
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          
                                </div>
                            )}

                            

{/* Start Destination */}
<div className="mb-4 relative">
<label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
  Depart Location
</label>
<input
  type="text"
  name="startDestinationSearch"
  value={startDestinationSearch}
  onChange={(e) => handleStartDestinationSearch(e.target.value)}
  className="block w-full p-2 border border-gray-300 rounded-md"
  placeholder="Type to search for a start destination"
/>
{showStartDestinationSuggestions && Array.isArray(startDestinations) && startDestinations.length > 0 && (
  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
    {startDestinations.map((destination) => (
      <li
        key={destination.id}
        className="p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
        onClick={() => {
          setStartDestinationSearch(destination.name);
          handleInputChange({
            target: { name: 'startDestinationId', value: destination.id },
          });
          setShowStartDestinationSuggestions(false);
        }}
      >
        <FontAwesomeIcon icon={faMapPin} className="text-green-500" />
        {destination.name}
      </li>
    ))}
  </ul>
)}
</div>

{/* End Destination */}
<div className="mb-4 relative">
<label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
  <FontAwesomeIcon icon={faMapSigns} className="text-green-500" />
  Final Destination
</label>
<input
  type="text"
  name="endDestinationSearch"
  value={endDestinationSearch}
  onChange={(e) => handleEndDestinationSearch(e.target.value)}
  className="block w-full p-2 border border-gray-300 rounded-md"
  placeholder="Type to search for a final destination"
/>
{showEndDestinationSuggestions && Array.isArray(endDestinations) && endDestinations.length > 0 && (
  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
    {endDestinations.map((destination) => (
      <li
        key={destination.id}
        className="p-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
        onClick={() => {
          setEndDestinationSearch(destination.name);
          handleInputChange({
            target: { name: 'endDestinationId', value: destination.id },
          });
          setShowEndDestinationSuggestions(false);
        }}
      >
        <FontAwesomeIcon icon={faMapPin} className="text-green-500" />
        {destination.name}
      </li>
    ))}
  </ul>
)}
</div>


                            <div className="mt-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={faDollarSign} className="text-yellow-500" />
                                <p className="text-lg font-semibold">Total Price: {totalPrice} FCFA</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input
                                        type="date"
                                        name="startAt"
                                        value={formData.startAt}
                                        onChange={handleInputChange}
                                        required
                                        className={inputClassName}
                                    />
                                </div>
                                
                                    
                            </div>

                            

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className={inputClassName}
                                ></textarea>
                            </div>

                            <div className="border-t border-gray-200 mt-6"></div>

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
                                    <div
                                      key={index}
                                      className="border-t border-gray-200 pt-6 mt-6 bg-white rounded-xl shadow-lg p-6 md:p-8"
                                    >
                                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                        <FontAwesomeIcon icon={faUser} className="text-indigo-500" />
                                        Passenger {index + 1}
                                      </h3>
                                  
                                      {/* Informations du passager */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <FontAwesomeIcon icon={faSignature} className="mr-2 text-blue-500" />
                                            First Name
                                          </label>
                                          <input
                                            type="text"
                                            value={passenger.firstName}
                                            onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                                            className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm p-2"
                                            placeholder="Enter first name"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <FontAwesomeIcon icon={faSignature} className="mr-2 text-blue-500" />
                                            Last Name
                                          </label>
                                          <input
                                            type="text"
                                            value={passenger.lastName}
                                            onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                                            className="border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm p-2"
                                            placeholder="Enter last name"
                                          />
                                        </div>
                                      </div>
                                  
                                      {/* Autres informations */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                        <div>
                                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <FontAwesomeIcon icon={faVenusMars} className="mr-2 text-purple-500" />
                                            Gender
                                          </label>
                                          <select
                                            value={passenger.gender}
                                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                                            className="border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm p-2"
                                          >
                                            <option value="">Select gender</option>
                                            <option value="feminin">Feminin</option>
                                            <option value="masculin">Masculin</option>
                                            <option value="autres">Autres</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-green-500" />
                                            Birth Date
                                          </label>
                                          <input
                                            type="date"
                                            value={passenger.birthDate}
                                            onChange={(e) => handlePassengerChange(index, 'birthDate', e.target.value)}
                                            className="border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm p-2"
                                          />
                                        </div>
                                         {/* Sélection du type de passager */}
          <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Type of Passenger</label>
          <select
            value={passenger.typePassenger}
            onChange={(e) => handlePassengerChange(index, "typePassenger", e.target.value)}
            className="border-gray-300 rounded-lg block w-full p-2"
          >
            <option value="">Select Type</option>
            <option value="ADLT">Adult (ADLT)</option>
            <option value="CHD">Child (CHD)</option>
            <option value="INF">Infant (INF)</option>
          </select>
        </div>
                                      </div>
                                      {/* Documents */}
                                      <div className="mt-6">
                                        <h5 className="text-md font-medium text-gray-900 mb-4">Documents</h5>
                                        {passenger.document.map((doc, docIndex) => (
                                          <div
                                            key={docIndex}
                                            className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-4 bg-gray-50 rounded-lg shadow-sm mb-4"
                                          >
                                          <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Document Type
                                          </label>
                                          <select
                                            value={doc.documentType}
                                            onChange={(e) =>
                                              handleDocumentChange(index, docIndex, 'documentType', e.target.value)
                                            }
                                            className="border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm px-4 py-2"
                                          >
                                            <option value="">Select Document Type</option>
                                            <option value="passport">Passport</option>
                                            <option value="acte_naissance">Acte de Naissance</option>
                                            <option value="permis">Permis</option>
                                            <option value="autres">Autres</option>
                                          </select>
                                        </div>
                                        
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Document Number
                                              </label>
                                              <input
                                                type="text"
                                                value={doc.documentNumber}
                                                onChange={(e) =>
                                                  handleDocumentChange(index, docIndex, 'documentNumber', e.target.value)
                                                }
                                                className="border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm px-4 py-2"
                                                placeholder="e.g., 123456789"
                                              />
                                            </div>
                                            {/* Issue Date */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={doc.issueDate}
                  onChange={(e) => handleDocumentChange(index, docIndex, "issueDate", e.target.value)}
                  className="border-gray-300 rounded-lg block w-full p-2"
                />
              </div>

              {/* Expiration Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                <input
                  type="date"
                  value={doc.expirationDate}
                  onChange={(e) => handleDocumentChange(index, docIndex, "expirationDate", e.target.value)}
                  className="border-gray-300 rounded-lg block w-full p-2"
                />
              </div>
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                                File
                                              </label>
                                              <input
                                                type="file"
                                                multiple
                                                onChange={(e) => handleFileChange(e, index, docIndex)}
                                                className="border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm px-4 py-2"
                                              />
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => removeDocument(index, docIndex)}
                                              className="text-sm text-red-600 hover:text-red-800 mt-4 md:mt-0"
                                            >
                                              Remove Document
                                            </button>
                                          </div>
                                        ))}
                                        <button
                                          type="button"
                                          onClick={() => addDocument(index)}
                                          className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                        >
                                          Add Document
                                        </button>
                                      </div>
                                  
                                      {/* Remove Passenger */}
                                      {index > 0 && (
                                        <button
                                          type="button"
                                          onClick={() => removePassenger(index)}
                                          className="mt-4 text-sm text-red-600 hover:text-red-900"
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
       
    );
};

export default CreateReservation;
