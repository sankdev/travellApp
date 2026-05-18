import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { userService } from "../../services/userService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faSpinner,
  faTimes,
  faEye,
  faEyeSlash,
  faPlane,
  faInfoCircle,
  faCheckCircle,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";

const UserLogin = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasPendingReservation, setHasPendingReservation] = useState(false);
  const [pendingFlightInfo, setPendingFlightInfo] = useState(null);

  // Récupérer l'état de redirection
  const from = location.state?.from || '/customer/dashboard';
  const message = location.state?.message || '';

  useEffect(() => {
    // Vérifier s'il y a une réservation en attente
    const checkPendingReservation = () => {
      try {
        const pendingData = localStorage.getItem('pendingReservation');
        if (pendingData) {
          const reservation = JSON.parse(pendingData);
          
          // Vérifier si les données sont expirées (plus de 30 minutes)
          const timestamp = new Date(reservation.timestamp).getTime();
          const now = new Date().getTime();
          const thirtyMinutes = 30 * 60 * 1000;
          
          if (now - timestamp > thirtyMinutes) {
            localStorage.removeItem('pendingReservation');
            return;
          }
          
          setHasPendingReservation(true);
          
          // Extraire les informations du vol pour l'affichage
          if (reservation.flightData) {
            const flightInfo = {
              flightName: reservation.flightData.flight?.name || 'Vol sélectionné',
              agencyName: reservation.flightData.agency?.name || 'Agence inconnue',
              price: reservation.flightData.price || 0,
              destination: reservation.flightData.flight?.destination?.city || 'Destination inconnue',
              origin: reservation.flightData.flight?.origin?.city || 'Départ inconnu',
              company: reservation.flightData.flight?.companyVol?.name || 'Compagnie inconnue'
            };
            setPendingFlightInfo(flightInfo);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la réservation en attente:', error);
      }
    };

    checkPendingReservation();
    
    // Afficher un message contextuel si présent
    if (message) {
      setSuccessMessage(message);
    }
  }, [message]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    // Validation
    if (!formData.email || !formData.password) {
      setError("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    try {
      const response = await userService.login(formData);
      const user = response?.user;
      const token = response?.token;

      if (!user || !token) {
        throw new Error("Identifiants invalides");
      }

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      // Vérifier s'il y a une réservation en attente
      const pendingReservation = localStorage.getItem('pendingReservation');
      
      if (pendingReservation && user.roles?.includes("customer")) {
        try {
          const reservationData = JSON.parse(pendingReservation);
          
          console.log('📦 Réservation en attente détectée:', reservationData);
          
          // Nettoyer le localStorage
          localStorage.removeItem('pendingReservation');
          
          // Rediriger vers la création de réservation avec les données
          navigate(`/customer/reservations/new`, { 
            state: { 
              flightData: reservationData.flightData,
              fromFlight: true,
              message: '✅ Connexion réussie ! Complétez votre réservation.'
            }
          });
          return;
          
        } catch (reservationError) {
          console.error('Erreur lors du traitement de la réservation en attente:', reservationError);
          // Continuer avec la redirection normale en cas d'erreur
        }
      }

      // Gestion des redirections en fonction du rôle
      switch (user.roles?.[0]) {
        case "admin":
          navigate("/admin", { 
            state: { message: '✅ Connexion réussie en tant qu\'administrateur' }
          });
          break;
        case "agency":
          navigate("/agency/dashboard", { 
            state: { message: '✅ Connexion réussie en tant qu\'agence' }
          });
          break;
        case "customer":
          navigate(from, { 
            state: { message: '✅ Connexion réussie ! Bienvenue sur votre compte.' }
          });
          break;
        default:
          navigate("/login");
      }
    } catch (err) {
      console.error('❌ Erreur de connexion:', err);
      
      // Messages d'erreur plus spécifiques
      if (err.response?.status === 401) {
        setError('❌ Email ou mot de passe incorrect');
      } else if (err.response?.status === 403) {
        setError('⚠️ Votre compte est désactivé. Contactez l\'administrateur.');
      } else if (err.response?.data?.error) {
        setError(`❌ ${err.response.data.error}`);
      } else if (err.message) {
        setError(`❌ ${err.message}`);
      } else {
        setError('❌ Une erreur est survenue lors de la connexion. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
    navigate("/");
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleRegisterRedirect = () => {
    // Sauvegarder la réservation en attente avant la redirection
    const pendingReservation = localStorage.getItem('pendingReservation');
    if (pendingReservation) {
      navigate('/register', { 
        state: { 
          hasPendingReservation: true,
          from: '/login',
          message: 'Créez un compte pour finaliser votre réservation'
        }
      });
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-100 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden ${hasPendingReservation ? 'max-w-4xl' : 'max-w-md'}`}>
        {/* Header */}
        <div className="bg-[#0F172A] px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {hasPendingReservation ? 'Finalisez votre réservation' : 'Connexion'}
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-orange-800 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row">
          {/* Formulaire de connexion */}
          <div className="p-6 flex-1">
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm flex items-start gap-2">
                <FontAwesomeIcon icon={faCheckCircle} className="mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Bannière de réservation en attente */}
            {hasPendingReservation && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FontAwesomeIcon icon={faPlane} className="text-blue-500" />
                  <span className="font-semibold text-blue-800">Réservation en attente</span>
                </div>
                <p className="text-sm text-blue-600">
                  Connectez-vous pour finaliser votre réservation de vol
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Se souvenir de moi
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600
 hover:bg-[#D97706] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500  ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      {hasPendingReservation ? 'Finaliser ma réservation' : 'Se connecter'}
                      {hasPendingReservation && <FontAwesomeIcon icon={faArrowRight} className="ml-2" />}
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Separator */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Pas encore de compte ?</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleRegisterRedirect}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Créer un compte
                </button>
              </div>
            </div>
          </div>

          {/* Panel d'informations sur la réservation */}
          {hasPendingReservation && pendingFlightInfo && (
            <div className="md:w-1/2 bg-gradient-to-br from-blue-50 to-indigo-50 border-l border-gray-200 p-6">
              <div className="h-full flex flex-col">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faPlane} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Votre vol vous attend</h3>
                      <p className="text-sm text-gray-600">Connectez-vous pour réserver</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Nom du vol */}
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <div className="text-xs text-gray-500 mb-1">VOL</div>
                      <div className="font-semibold text-gray-900">{pendingFlightInfo.flightName}</div>
                    </div>
                    
                    {/* Agence et Compagnie */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded-lg border border-blue-100">
                        <div className="text-xs text-gray-500 mb-1">AGENCE</div>
                        <div className="font-medium text-gray-900">{pendingFlightInfo.agencyName}</div>
                      </div>
                      
                      <div className="p-3 bg-white rounded-lg border border-blue-100">
                        <div className="text-xs text-gray-500 mb-1">COMPAGNIE</div>
                        <div className="font-medium text-gray-900">{pendingFlightInfo.company}</div>
                      </div>
                    </div>
                    
                    {/* Trajet */}
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <div className="text-xs text-gray-500 mb-1">TRAJET</div>
                      <div className="font-medium text-gray-900">
                        {pendingFlightInfo.origin} → {pendingFlightInfo.destination}
                      </div>
                    </div>
                    
                    {/* Prix */}
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <div className="text-xs text-gray-500 mb-1">PRIX</div>
                      <div className="font-bold text-xl text-blue-600">
                        {pendingFlightInfo.price.toLocaleString()} FCFA
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Informations utiles */}
                <div className="mt-auto pt-4 border-t border-gray-200">
                  <div className="flex items-start gap-2">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 mt-0.5" />
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-700 mb-1">Après connexion :</p>
                      <ul className="space-y-1">
                        <li>• Votre vol sera automatiquement pré-rempli</li>
                        <li>• Ajoutez les informations des passagers</li>
                        <li>• Finalisez en quelques clics</li>
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

export default UserLogin;
