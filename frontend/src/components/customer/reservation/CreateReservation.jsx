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
        customerId: '',
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
        //         console.error("Erreur lors de la récupération des règles de tarification :", error);
        //         setTotalPrice(basePrice);
        //     }
        // };
        
        
        // Recalculer le prix lorsque certains champs du formulaire changent
        useEffect(() => {
            handlePriceCalculation();
        }, [formData.agencyClassId, formData.returnVolId, formData.agencyVolId, formData.tripType, passengers]); 
        
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
    }, [formData.agencyClassId, formData.returnVolId, formData.agencyVolId, formData.tripType]);

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
                const response = await agencyService.getAgencies({ search: agencySearch });
                setAgencies(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Failed to fetch agencies:', error.message);
            }
        };

        if (agencySearch.length > 0) {
            fetchAgencies();
            setShowAgencySuggestions(true);
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
            const response = await axios.get('http://localhost:5000/api/class-agencies');
            console.log('classAgency',response.data);
            setClasses(Array.isArray(response.data) ? response.data : []);
            // setClasses(response.data);

        } catch (err) {
            setError('Failed to fetch classes');
        }
    };

    useEffect(() => {
        const fetchVols = async () => {
            try {
                // const response = await volService.getVols({ search: volSearch });
                const response = await agencyAssociationService.getAllFlightAgencies({ params: { search: volSearch } });
                console.log('Volsagency:',response.data)
                setVols(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Failed to fetch vols:', error.message);
            }
        };

        if (volSearch.length > 0) {
            fetchVols();
            setShowVolSuggestions(true);
        } else {
            setVols([]);
            setShowVolSuggestions(false);
        }
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "tripType" && value === "one-way" ? { returnVolId: "" } : {}),
        }));
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
    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setLoading(true);
    //     setError('');
    
    //     try {
    //         const reservationData = new FormData();
    
    //         // Ajout des données de la réservation
    //         Object.entries(formData).forEach(([key, value]) => {
    //             reservationData.append(key, value);
    //         });
    //         reservationData.forEach((value, key) => {
    //             if (value instanceof File) {
    //                 console.log(`Key: ${key}, File Name: ${value.name}`);
    //             } else {
    //                 console.log(`Key: ${key}, Value: ${value}`);
    //             }
    //         });
            
    //         // Ajout des passagers uniquement
    //         passengers.forEach((passenger, passengerIndex) => {
    //             passenger.document.forEach((doc, docIndex) => {
    //               if (doc.files && doc.files.length > 0) {
    //                 doc.files.forEach((file, fileIndex) => {
    //                   reservationData.append(
    //                     `passengers[${passengerIndex}][documents][${docIndex}][files][${fileIndex}]`,
    //                     file
    //                   );
    //                 });
    //               }
    //             });
    //           });
              
    //         // Envoi de la réservation avec les passagers
    //         const reservationResponse = await reservationService.createReservation(reservationData);
    //         const reservation = reservationResponse.data;
    
    //         if (!reservation) {
    //             console.error('Reservation creation failed');
    //             setError('Failed to create reservation');
    //             setLoading(false);
    //             return;
    //         }
    
    //         // Gestion des documents après la création des passagers
    //         for (const [index, passenger] of passengers.entries()) {
                
    //             for (const doc of passenger.document) {
    //                 const documentData = new FormData();
    //                 documentData.append('relatedEntity', 'Passenger');
    //                 documentData.append('relatedEntityId', reservation.passengers[index].id); // ID du passager
    //                 documentData.append('typeDocument', doc.documentType);
    //                 documentData.append('documentNumber', doc.documentNumber);
    
    //                 // Ajout des fichiers pour chaque document
    //                 if (doc.files && doc.files.length > 0) {
    //                     doc.files.forEach((file) => {
    //                         documentData.append('files', file);
    //                     });
    //                 }
    
    //                 // Envoi du document à l'API
    //                 await documentService.createDocument(documentData);
    //             }
    //         }
    
    //         // Réinitialisation du formulaire après la création
    //         resetFormState();
    
    //         setLoading(false);
    //         alert('Reservation and documents created successfully!');
    //         navigate('/customer/reservations');
    //     } catch (err) {
    //         console.error('Error creating reservation or documents:', err);
    //         setError(err.response?.data?.message || 'Failed to create reservation');
    //         setLoading(false);
    //     }
    // };
    
    // // Fonction pour réinitialiser l'état du formulaire
    // const resetFormState = () => {
    //     setPassengers([{
    //         firstName: '',
    //         lastName: '',
    //         gender: '',
    //         birthDate: '',
    //         birthPlace: '',
    //         nationality: '',
    //         profession: '',
    //         address: '',
    //         document: [], // Réinitialisation des documents
    //         status: 'active',
    //     }]);
    
    //     setFormData({
    //         customerId: '',
    //         agencyId: '',
    //         destinationId: '',
    //         companyId: '',
    //         volId: '',
    //         campaignId: '',
    //         returnVolId: '',
    //         startAt: '',
    //         endAt: '',
    //         description: '',
    //         startDestinationId: '', 
    //         endDestinationId: '', 
    //         classId: '',
    //         tripType: 'one-way',
    //         totalPrice: '',
    //     });
    // };
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
    
    // const handleSubmit = async (e) => {

    //     e.preventDefault();
    //     setLoading(true);
    //     setError('');
    
    //     try {
    //         const reservationData = new FormData();
    //          console.log('reservationData',reservationData)
    //         // Ajouter les champs principaux
    //         Object.entries(formData).forEach(([key, value]) => {
    //             reservationData.append(key, value);
    //         });
    
    //         // Ajouter les passagers
    //         passengers.forEach((passenger, passengerIndex) => {
    //             Object.entries(passenger).forEach(([key, value]) => {
    //                 reservationData.append(`passengers[${passengerIndex}][${key}]`, value);
    //             });
    
    //             // Ajouter les documents des passagers
    //             passenger.document.forEach((doc, docIndex) => {
    //                 reservationData.append(`documents[${passengerIndex}][${docIndex}][documentType]`, doc.documentType);
    //                 reservationData.append(`documents[${passengerIndex}][${docIndex}][documentNumber]`, doc.documentNumber);
    //                 doc.files.forEach((file, fileIndex) => {
    //                     reservationData.append(`documents[${passengerIndex}][files][${docIndex}][${fileIndex}]`, file);
    //                 });
    //             });
    //         });
    
    //         // Envoi des données
    //         const response = await reservationService.createReservation(reservationData);
    
    //         // Réinitialisation
    //         resetFormState();
    //         setLoading(false);
    //         alert('Réservation créée avec succès');
    //         navigate('/customer/reservations');
    //     } catch (err) {
    //         console.error('Error:', err);
    //         setError(err.response?.data?.message || 'Failed to create reservation');
    //         setLoading(false);
    //     }
    // };
    
      
    
    
    

    // const handleSubmit = async (e) => {

    //     e.preventDefault();
    //     setLoading(true);
    //     setError('');

    //     try {
    //         const reservationData = new FormData();

    //         // Add reservation fields
    //         Object.entries(formData).forEach(([key, value]) => {
    //             reservationData.append(key, value);
    //         });

    //         // Add passengers and their documents
    //         passengers.forEach((passenger, index) => {
    //             Object.entries(passenger).forEach(([key, value]) => {
    //                 if (key === 'document') {
    //                     value.forEach((doc, docIndex) => {
    //                         reservationData.append(`passengers[${index}][documents][${docIndex}][documentType]`, doc.documentType);
    //                         reservationData.append(`passengers[${index}][documents][${docIndex}][documentNumber]`, doc.documentNumber);
    //                         doc.files.forEach((file, fileIndex) => {
    //                             reservationData.append(`passengers[${index}][documents][${docIndex}][files][${fileIndex}]`, file);
    //                         });
    //                     });
    //                 } else {
    //                     reservationData.append(`passengers[${index}][${key}]`, value);
    //                 }
    //             });
    //         });

    //         // Submit reservation
    //         const reservationResponse = await reservationService.createReservation(reservationData);
    //         const reservation = reservationResponse.data;

    //         if (!reservation) {
    //             console.error("Reservation creation failed");
    //             setError("Reservation creation failed");
    //             setLoading(false);
    //             return;
    //         }

    //         // Upload documents for each passenger
    //         for (const [index, passenger] of passengers.entries()) {
    //             for (const [docIndex, doc] of passenger.document.entries()) {
    //                 const documentData = new FormData();
    //                 documentData.append('relatedEntity', 'Passenger');
    //                 documentData.append('relatedEntityId', reservation.passengers[index].id);
    //                 documentData.append('typeDocument', doc.documentType);
    //                 documentData.append('documentNumber', doc.documentNumber);
    //                 doc.files.forEach((file) => {
    //                     documentData.append('files', file);
    //                 });

    //                 await documentService.createDocument(documentData);
    //             }
    //         }

    //         // Reset the form and state
    //         setPassengers([{
    //             firstName: '',
    //             lastName: '',
    //             documentType: '',
    //             documentNumber: '',
    //             gender: '',
    //             birthDate: '',
    //             birthPlace: '',
    //             nationality: '',
    //             profession: '',
    //             address: '',
    //             document: [],
    //             status: 'active'
    //         }]);
    //         setFormData({
    //             customerId: '',
    //             agencyId: '',
    //             destinationId: '',
    //             companyId: '',
    //             volId: '',
    //             campaignId: '',
    //             returnVolId: '',
    //             startAt: '',
    //             endAt: '',
    //             description: '',
    //             startDestinationId: '', endDestinationId: '', classId: '',
    //             tripType: 'one-way',
    //             totalPrice: ''
    //         });
    //         setLoading(false);
    //         alert('Reservation created successfully!');
    //         navigate('/customer/reservations');
    //     } catch (err) {
    //         console.error('Error while creating reservation or uploading documents:', err);
    //         setError(err.response?.data?.message || 'Failed to create reservation');
    //         setLoading(false);
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        const reservationData = new FormData();
    
        // Ajouter les champs principaux de la réservation
        Object.entries(formData).forEach(([key, value]) => {
            reservationData.append(key, value);
        });
    
        // Ajouter les passagers et leurs documents
        passengers.forEach((passenger, passengerIndex) => {
            Object.entries(passenger).forEach(([key, value]) => {
                if (key !== 'document') {
                    reservationData.append(`passengers[${passengerIndex}][${key}]`, value);
                }
            });
        
            // Ajouter les documents des passagers
            passenger.document.forEach((doc, docIndex) => {
                reservationData.append(
                    `passengers[${passengerIndex}][documents][${docIndex}][documentType]`,
                    doc.documentType
                );
                reservationData.append(
                    `passengers[${passengerIndex}][documents][${docIndex}][documentNumber]`,
                    doc.documentNumber
                );
                reservationData.append(
                    `passengers[${passengerIndex}][documents][${docIndex}][issueDate]`,
                    doc.issueDate
                );
                reservationData.append(
                    `passengers[${passengerIndex}][documents][${docIndex}][expirationDate]`,
                    doc.expirationDate
                );
        
                // Vérifiez et attachez les fichiers
                if (doc.files && doc.files.length > 0) {
                    Array.from(doc.files).forEach((file) => {
                        console.log(`Ajout du fichier pour ${docIndex} :`, file.name);
                        reservationData.append(
                            `passengers-${passengerIndex}-documents-${docIndex}-file`,
                            file
                        );
                        
                    });
                } else {
                    console.error(`Aucun fichier pour le document ${docIndex} du passager ${passenger.firstName}`);
                }
            });
        });
        
    
        try {
            const response = await reservationService.createReservation(reservationData);
            console.log('✔️ Réservation créée avec succès', response.data);
    
            setLoading(false);
            navigate('/customer/dashboard');
        } catch (err) {
            setLoading(false);
    
            // 🔴 Vérification de la structure de l'erreur
            if (err.response) {
                console.error('❌ Erreur backend:', err.response.data);
                
                // Récupérer le message d'erreur renvoyé par l'API
                setError(err.response.data.error || 'Une erreur est survenue.');
            } else if (err.request) {
                console.error('❌ Aucun retour du serveur:', err.request);
                setError('Le serveur ne répond pas. Vérifiez votre connexion.');
            } else {
                console.error('❌ Erreur inconnue:', err.message);
                setError('Une erreur inattendue est survenue.');
            }
        }
    }; 
    console.log('passengersFields',passengers)
    
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

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faUsers} className="text-blue-500" />
                                    Customer
                                </label>
                                <select
                                    name="customerId"
                                    value={formData.customerId}
                                    onChange={handleInputChange}
                                    required
                                    className="block w-full p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">Select a customer</option>
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.firstName} {customer.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

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
          onChange={(e) => setVolSearch(e.target.value)}
          onFocus={() => setShowVolSuggestions(volSearch.length > 0)}
          onBlur={() => setTimeout(() => setShowVolSuggestions(false), 150)}
          placeholder="Search for a flight..."
          className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 transition-all"
        />
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
      </div>

      {showVolSuggestions && vols.length > 0 && (
        <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto animate-fadeIn">
          {vols.length > 0 ? (
            vols.map((vol) => (
              <li
                key={vol.id}
                className="p-3 cursor-pointer hover:bg-blue-50 flex items-center gap-3 transition-all"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, agencyVolId: vol.id }));
                  handleInputChange({ target: { name: 'agencyVolId', value: vol.id } });
                  setVolSearch(vol.flight.name);
                  setShowVolSuggestions(false);
                }}
              >
                <FontAwesomeIcon icon={faPlaneDeparture} className="text-blue-500 text-md" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {getCompanyById(vol.flight.companyId)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {getDestinationById(vol.flight.originId)} → {getDestinationById(vol.flight.destinationId)}
                  </p>
                  <p className="text-xs text-gray-500 font-semibold">
                    Depart: {formatDate(vol.departureTime)} → {formatDate(vol.arrivalTime)}
                  </p>
                  <p className="text-xs text-gray-350 font-semibold">
                  Agency : {vol.agency.name} → prix de vol : {vol.price}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <li className="p-3 text-gray-500 text-sm text-center">No flights found</li>
          )}
        </ul>
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                                    <input
                                        type="date"
                                        name="endAt"
                                        value={formData.endAt}
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
