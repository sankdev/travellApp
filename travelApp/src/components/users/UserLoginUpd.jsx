import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { userService } from '../../services/userService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faLock,
  faUser,
  faArrowRight,
  faPlane,
  faInfoCircle,
  faExclamationTriangle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

const UserLogin = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
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
              origin: reservation.flightData.flight?.origin?.city || 'Départ inconnu'
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Validation simple
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    try {
      const response = await userService.login(formData);
      const user = response?.user;
      const token = response?.token;

      if (!user || !token) {
        throw new Error('Échec de la connexion: réponse invalide du serveur');
      }

      // Sauvegarder les informations utilisateur
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

      // Gestion des redirections standard en fonction du rôle
      if (user.roles?.includes("admin")) {
        navigate("/admin/dashboard", { 
          state: { message: '✅ Connexion réussie en tant qu\'administrateur' }
        });
      } else if (user.roles?.includes("agency")) {
        navigate("/agency/dashboard", { 
          state: { message: '✅ Connexion réussie en tant qu\'agence' }
        });
      } else if (user.roles?.includes("customer")) {
        // Si pas de réservation en attente, rediriger vers la page d'origine ou le dashboard
        navigate(from, { 
          state: { message: '✅ Connexion réussie ! Bienvenue sur votre compte.' }
        });
      } else {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Colonne gauche - Formulaire */}
          <div className="lg:w-1/2">
            <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-200">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  {hasPendingReservation ? 'Finalisez votre réservation' : 'Connectez-vous'}
                </h2>
                <p className="mt-2 text-gray-600">
                  {hasPendingReservation 
                    ? 'Connectez-vous pour compléter votre réservation'
                    : 'Accédez à votre compte'
                  }
                </p>
              </div>

              {/* Messages d'alerte */}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-start gap-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="mt-1" />
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

              {/* Formulaire */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                    Adresse email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="vous@exemple.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                    Mot de passe
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Votre mot de passe"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Se souvenir de moi
                    </label>
                  </div>

                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition-all ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        {hasPendingReservation ? 'Finaliser ma réservation' : 'Se connecter'}
                        <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>

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
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    Créer un compte
                  </button>
                </div>
              </div>

              {onClose && (
                <div className="mt-6 text-center">
                  <button
                    onClick={onClose}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Retour
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite - Informations sur la réservation */}
          {hasPendingReservation && (
            <div className="lg:w-1/2">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white h-full">
                <div className="flex flex-col h-full">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faPlane} className="text-2xl" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Réservation en attente</h2>
                        <p className="text-blue-100">Votre vol vous attend !</p>
                      </div>
                    </div>
                    
                    {pendingFlightInfo && (
                      <div className="space-y-6">
                        <div className="p-5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                          <div className="text-sm text-blue-100 mb-2">VOL SÉLECTIONNÉ</div>
                          <div className="text-xl font-bold mb-2">{pendingFlightInfo.flightName}</div>
                          <div className="flex items-center gap-2 text-blue-100">
                            <span>📍 {pendingFlightInfo.origin}</span>
                            <span>→</span>
                            <span>📍 {pendingFlightInfo.destination}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white/10 rounded-lg border border-white/20">
                            <div className="text-sm text-blue-100 mb-1">AGENCE</div>
                            <div className="font-semibold">{pendingFlightInfo.agencyName}</div>
                          </div>
                          
                          <div className="p-4 bg-white/10 rounded-lg border border-white/20">
                            <div className="text-sm text-blue-100 mb-1">PRIX</div>
                            <div className="font-bold text-xl">
                              {pendingFlightInfo.price.toLocaleString()} FCFA
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-white/20">
                    <div className="flex items-start gap-3">
                      <FontAwesomeIcon icon={faInfoCircle} className="mt-1" />
                      <div className="text-sm text-blue-100">
                        <p className="font-semibold">🎯 Une fois connecté :</p>
                        <ul className="mt-2 space-y-1">
                          <li>✓ Votre vol sera automatiquement pré-rempli</li>
                          <li>✓ Vous pourrez ajouter les passagers</li>
                          <li>✓ Finaliser la réservation en quelques clics</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message pour mobile */}
        {hasPendingReservation && (
          <div className="lg:hidden mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <FontAwesomeIcon icon={faPlane} className="text-blue-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Réservation en attente</h3>
                <p className="text-sm text-gray-600">Connectez-vous pour finaliser votre vol</p>
              </div>
            </div>
            {pendingFlightInfo && (
              <div className="text-sm text-gray-700 space-y-2">
                <div>✈️ {pendingFlightInfo.flightName}</div>
                <div className="flex justify-between">
                  <span>Agence: {pendingFlightInfo.agencyName}</span>
                  <span className="font-bold text-blue-600">{pendingFlightInfo.price.toLocaleString()} FCFA</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLogin;
