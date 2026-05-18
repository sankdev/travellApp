import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { roleService } from "../../services/roleService";
import { userService } from "../../services/userService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCheck, 
  faEnvelope, 
  faLock, 
  faSpinner, 
  faUser, 
  faPhone, 
  faAddressCard,
  faPlane,
  faInfoCircle,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";

const UserRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleId: "",
    roleName: ""
  });
  
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [hasPendingReservation, setHasPendingReservation] = useState(false);
  const [pendingFlightInfo, setPendingFlightInfo] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await roleService.getAllRoles();
        setRoles(response || []);
      } catch (err) {
        console.error("Error fetching roles:", err);
        setRoles([]);
      }
    };

    // Vérifier s'il y a une réservation en attente
    const checkPendingReservation = () => {
      try {
        const pendingData = localStorage.getItem('pendingReservation');
        if (pendingData) {
          const reservation = JSON.parse(pendingData);
          
          // Vérifier si les données sont expirées
          const timestamp = new Date(reservation.timestamp).getTime();
          const now = new Date().getTime();
          const thirtyMinutes = 30 * 60 * 1000;
          
          if (now - timestamp > thirtyMinutes) {
            localStorage.removeItem('pendingReservation');
            return;
          }
          
          setHasPendingReservation(true);
          
          // Extraire les informations du vol
          if (reservation.flightData) {
            const flightInfo = {
              flightName: reservation.flightData.flight?.name || 'Vol sélectionné',
              agencyName: reservation.flightData.agency?.name || 'Agence inconnue',
              price: reservation.flightData.price || 0,
              destination: reservation.flightData.flight?.destination?.city || 'Destination inconnue'
            };
            setPendingFlightInfo(flightInfo);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la réservation en attente:', error);
      }
    };

    fetchRoles();
    checkPendingReservation();

    // Vérifier le message de redirection
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError("❌ Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("❌ Les mots de passe ne correspondent pas");
      return false;
    }

    if (!formData.roleId) {
      setError("❌ Veuillez sélectionner un type de compte");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);
  setError("");
  setSuccessMessage("");

  try {
    const selectedRole = roles.find(r => r.id === formData.roleId);

    const registerData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      password: formData.password,
      roleId: formData.roleId,
      roleName: selectedRole?.name || ""
   // roleName: formData.roleName    

 };

    // Appel API pour créer le compte
    await userService.register(registerData);
    
    // Message de succès
    setSuccessMessage("Compte créé avec succès ! Redirection vers la page de connexion...");
    
    // Redirection vers login après un court délai
    setTimeout(() => {
      navigate('/login', {
        state: {
          message: '✅ Inscription réussie ! Vous pouvez maintenant vous connecter.'
        }
      });
    }, 1500);

  } catch (err) {
    console.error('❌ Erreur d\'inscription:', err);

    if (err.response?.status === 409) {
      setError('❌ Cet email est déjà utilisé. Veuillez vous connecter.');
    } else if (err.response?.data?.error) {
      setError(`❌ ${err.response.data.error}`);
    } else if (err.message) {
      setError(`❌ ${err.message}`);
    } else {
      setError('❌ Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
    }
  } finally {
    setLoading(false);
  }
};
     
   
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Colonne gauche - Formulaire */}
          <div className="lg:w-2/3">
            <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-200">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  Créer un compte
                </h2>
                <p className="mt-2 text-gray-600">
                  {hasPendingReservation 
                    ? 'Inscrivez-vous pour finaliser votre réservation'
                    : 'Rejoignez-nous et profitez de nos services'
                  }
                </p>
              </div>

              {/* Messages d'alerte */}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-start gap-3">
                  <FontAwesomeIcon icon={faInfoCircle} className="mt-1" />
                  <div>
                    <p className="font-medium">{successMessage}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="mt-1" />
                  <div>
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                    Nom complet *
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Issa Kone"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                    Adresse email *
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                
                

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                    Mot de passe *
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Minimum 6 caractères"
                    />
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                    Confirmer le mot de passe *
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Retapez votre mot de passe"
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-2">
                    Type de compte *
                  </label>
                    <select
                    id="roleId"
                    name="roleId"
                    required
                    value={formData.roleId}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionnez un type de compte</option>
                    {roles.filter((r) => ["agency", "customer"].includes(r.name)).map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name === "agency" ? "Agence de voyage" : "Client voyageur"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition-all ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
                    }`}
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                        Création en cours...
                      </>
                    ) : (
                      hasPendingReservation ? 'Créer mon compte et réserver' : 'Créer mon compte'
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Déjà un compte ?</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Se connecter
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite - Informations sur la réservation */}
          {hasPendingReservation && (
            <div className="lg:w-1/3">
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-2xl p-8 text-white h-full">
                <div className="flex flex-col h-full">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faPlane} className="text-2xl" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Votre vol vous attend</h2>
                        <p className="text-orange-100">Inscrivez-vous pour réserver</p>
                      </div>
                    </div>
                    
                    {pendingFlightInfo && (
                      <div className="space-y-4">
                        <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                          <div className="text-sm text-orange-100 mb-1">VOL SÉLECTIONNÉ</div>
                          <div className="text-lg font-bold">{pendingFlightInfo.flightName}</div>
                        </div>
                        
                        <div className="p-3 bg-white/10 rounded-lg">
                          <div className="text-sm text-orange-100 mb-1">AGENCE</div>
                          <div className="font-semibold">{pendingFlightInfo.agencyName}</div>
                        </div>
                        
                        <div className="p-3 bg-white/10 rounded-lg">
                          <div className="text-sm text-orange-100 mb-1">DESTINATION</div>
                          <div className="font-semibold">{pendingFlightInfo.destination}</div>
                        </div>
                        
                        <div className="p-3 bg-white/10 rounded-lg">
                          <div className="text-sm text-orange-100 mb-1">PRIX</div>
                          <div className="font-bold text-xl">
                            {pendingFlightInfo.price.toLocaleString()} FCFA
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-white/20">
                    <div className="text-sm text-orange-100">
                      <div className="font-semibold mb-2">🎯 Après votre inscription :</div>
                      <ul className="space-y-1">
                        <li>✓ Votre compte sera créé instantanément</li>
                        <li>✓ Vous serez redirigé vers le formulaire de réservation</li>
                        <li>✓ Votre vol sera automatiquement pré-rempli</li>
                        <li>✓ Finalisez en ajoutant vos informations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
