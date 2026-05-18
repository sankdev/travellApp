import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faTimes,
  faSave,
  faMoneyBill,
  faUniversity,
  faMobile,
  faMoneyCheck,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faBan,
  faCheck,
  faSearch,
  faSync,
  faStar,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';
import { paymentModeService} from '../../services/paymentModeService';
import {agencyService} from '../../services/agencyService';
import { toast } from 'react-toastify';

const ModePayment = () => {
  const [paymentModes, setPaymentModes] = useState([]);
  const [filteredModes, setFilteredModes] = useState([]);
  const [userAgencies, setUserAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMode, setEditingMode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // État du formulaire
  const [formData, setFormData] = useState({
    agencyId: '',
    type: 'mobile_money',
    organization: '',
    accountNumber: '',
    accountName: '',
    description: '',
    isDefault: false,
    status: 'active'
  });

  const [formErrors, setFormErrors] = useState({});

  // Types de paiement disponibles
  const paymentTypes = [
    { value: 'mobile_money', label: 'Mobile Money', icon: faMobile, color: 'green' },
    { value: 'bank', label: 'Banque', icon: faUniversity, color: 'blue' },
    { value: 'cash', label: 'Espèces', icon: faMoneyBill, color: 'orange' },
    { value: 'cheque', label: 'Chèque', icon: faMoneyCheck, color: 'purple' }
  ];

  // Charger les données initiales
  useEffect(() => {
    fetchUserAgencies();
  }, []);

  useEffect(() => {
    if (selectedAgency) {
      fetchPaymentModes();
    }
  }, [selectedAgency]);

  useEffect(() => {
    filterPaymentModes();
  }, [paymentModes, searchTerm, filterType]);

  // Récupérer les agences de l'utilisateur
  const fetchUserAgencies = async () => {
    try {
      setLoading(true);
      const response = await agencyService.getUserAgencies();
      console.log('Agences utilisateur:', response);
      
      // Adapter selon la structure de réponse
      const agencies = response.data || response || [];
      setUserAgencies(agencies);
      
      if (agencies.length > 0) {
        setSelectedAgency(agencies[0].id || agencies[0].agencyId);
      }
    } catch (error) {
      console.error('Erreur chargement agences:', error);
      toast.error('Impossible de charger vos agences');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les modes de paiement
  const fetchPaymentModes = async () => {
    try {
      setLoading(true);
      // À adapter selon votre API
      const response = await paymentModeService.getPaymentModesByAgency(selectedAgency);
      const modes = response.data || response || [];
      setPaymentModes(modes);
      setFilteredModes(modes);
    } catch (error) {
      console.error('Erreur chargement modes de paiement:', error);
      toast.error('Impossible de charger les modes de paiement');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les modes de paiement
  const filterPaymentModes = () => {
    let filtered = [...paymentModes];

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(mode => 
        mode.organization?.toLowerCase().includes(term) ||
        mode.accountNumber?.toLowerCase().includes(term) ||
        mode.accountName?.toLowerCase().includes(term) ||
        mode.description?.toLowerCase().includes(term)
      );
    }

    // Filtre par type
    if (filterType !== 'all') {
      filtered = filtered.filter(mode => mode.type === filterType);
    }

    setFilteredModes(filtered);
  };

  // Valider le formulaire
  const validateForm = () => {
    const errors = {};

    if (!formData.agencyId) {
      errors.agencyId = 'L\'agence est requise';
    }
    if (!formData.type) {
      errors.type = 'Le type de paiement est requis';
    }
    if (!formData.organization?.trim()) {
      errors.organization = 'L\'organisation est requise';
    }
    if (formData.type === 'mobile_money' && !formData.accountNumber?.trim()) {
      errors.accountNumber = 'Le numéro de téléphone est requis';
    }
    if (formData.type === 'bank' && !formData.accountNumber?.trim()) {
      errors.accountNumber = 'Le numéro de compte est requis';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Effacer l'erreur du champ modifié
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Ouvrir le modal pour créer
  const handleAdd = () => {
    setEditingMode(null);
    setFormData({
      agencyId: selectedAgency || '',
      type: 'mobile_money',
      organization: '',
      accountNumber: '',
      accountName: '',
      description: '',
      isDefault: false,
      status: 'active'
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Ouvrir le modal pour éditer
  const handleEdit = (mode) => {
    setEditingMode(mode);
    setFormData({
      agencyId: mode.agencyId,
      type: mode.type,
      organization: mode.organization || '',
      accountNumber: mode.accountNumber || '',
      accountName: mode.accountName || '',
      description: mode.description || '',
      isDefault: mode.isDefault || false,
      status: mode.status || 'active'
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingMode) {
        // Mise à jour
        await paymentModeService.updatePaymentMode(editingMode.id, formData);
        toast.success('Mode de paiement mis à jour avec succès');
      } else {
        // Création
        await paymentModeService.createPaymentMode(formData);
        toast.success('Mode de paiement créé avec succès');
      }
      setShowModal(false);
      fetchPaymentModes();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer un mode de paiement
  const handleDelete = async (mode) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${mode.organization} ?`)) {
      return;
    }

    try {
      await paymentModeService.deletePaymentMode(mode.id);
      toast.success('Mode de paiement supprimé avec succès');
      fetchPaymentModes();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  // Obtenir l'icône du type
  const getTypeIcon = (type) => {
    const found = paymentTypes.find(t => t.value === type);
    return found?.icon || faMoneyBill;
  };

  // Obtenir la couleur du type
  const getTypeColor = (type) => {
    const found = paymentTypes.find(t => t.value === type);
    return found?.color || 'gray';
  };

  // Formater le type pour affichage
  const getTypeLabel = (type) => {
    const found = paymentTypes.find(t => t.value === type);
    return found?.label || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des moyens de paiement
          </h1>
          <p className="text-gray-600">
            Gérez les moyens de paiement disponibles pour vos agences
          </p>
        </div>

        {/* Sélecteur d'agence */}
        {userAgencies.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agence
            </label>
            <select
              value={selectedAgency || ''}
              onChange={(e) => setSelectedAgency(parseInt(e.target.value))}
              className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {userAgencies.map(agency => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Barre d'outils */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 flex items-center gap-4">
              {/* Recherche */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>

              {/* Filtre par type */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les types</option>
                {paymentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bouton ajouter */}
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              Nouveau moyen de paiement
            </button>
          </div>
        </div>

        {/* Liste des modes de paiement */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <FontAwesomeIcon icon={faSync} spin className="text-4xl text-blue-500" />
          </div>
        ) : filteredModes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FontAwesomeIcon icon={faMoneyBill} className="text-5xl text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun moyen de paiement
            </h3>
            <p className="text-gray-500 mb-4">
              Commencez par ajouter un moyen de paiement pour cette agence.
            </p>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              Ajouter un moyen de paiement
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModes.map(mode => {
              const color = getTypeColor(mode.type);
              return (
                <div
                  key={mode.id}
                  className={`bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-${color}-500`}
                >
                  {/* En-tête */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-${color}-100 flex items-center justify-center`}>
                          <FontAwesomeIcon icon={getTypeIcon(mode.type)} className={`text-${color}-600`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{mode.organization}</h3>
                          <p className="text-sm text-gray-500">{getTypeLabel(mode.type)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {mode.isDefault && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1">
                            <FontAwesomeIcon icon={faStar} className="text-xs" />
                            Par défaut
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          mode.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {mode.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Détails */}
                  <div className="p-4 space-y-2">
                    {mode.accountNumber && (
                      <p className="text-sm">
                        <span className="text-gray-500">Numéro:</span>{' '}
                        <span className="font-medium">{mode.accountNumber}</span>
                      </p>
                    )}
                    {mode.accountName && (
                      <p className="text-sm">
                        <span className="text-gray-500">Titulaire:</span>{' '}
                        <span className="font-medium">{mode.accountName}</span>
                      </p>
                    )}
                    {mode.description && (
                      <p className="text-sm text-gray-600">{mode.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(mode)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(mode)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de création/édition */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingMode ? 'Modifier' : 'Nouveau'} moyen de paiement
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Agence (caché si une seule agence) */}
                {userAgencies.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agence <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="agencyId"
                      value={formData.agencyId}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        formErrors.agencyId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Sélectionner une agence</option>
                      {userAgencies.map(agency => (
                        <option key={agency.id} value={agency.id}>
                          {agency.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.agencyId && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.agencyId}</p>
                    )}
                  </div>
                )}

                {/* Type de paiement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de paiement <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {paymentTypes.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                        className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                          formData.type === type.value
                            ? `border-${type.color}-500 bg-${type.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <FontAwesomeIcon 
                          icon={type.icon} 
                          className={`text-xl ${
                            formData.type === type.value ? `text-${type.color}-600` : 'text-gray-400'
                          }`}
                        />
                        <span className={`text-xs ${
                          formData.type === type.value ? `text-${type.color}-700` : 'text-gray-600'
                        }`}>
                          {type.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  {formErrors.type && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.type}</p>
                  )}
                </div>

                {/* Organisation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organisation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    placeholder="Ex: Orange Money, BNDA, etc."
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      formErrors.organization ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.organization && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.organization}</p>
                  )}
                </div>

                {/* Numéro/Identifiant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.type === 'mobile_money' ? 'Numéro de téléphone' :
                     formData.type === 'bank' ? 'Numéro de compte' :
                     formData.type === 'cheque' ? 'Numéro de chèque' : 'Référence'}
                    {formData.type !== 'cash' && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder={
                      formData.type === 'mobile_money' ? 'Ex: 77 123 45 67' :
                      formData.type === 'bank' ? 'Ex: ML 123 4567 89' :
                      'Numéro de référence'
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      formErrors.accountNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.accountNumber && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.accountNumber}</p>
                  )}
                </div>

                {/* Nom du titulaire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titulaire (optionnel)
                  </label>
                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleInputChange}
                    placeholder="Nom du titulaire du compte"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optionnelle)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Informations supplémentaires..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Options */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Moyen de paiement par défaut</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="status"
                      checked={formData.status === 'active'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        status: e.target.checked ? 'active' : 'inactive'
                      }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Actif</span>
                  </label>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <FontAwesomeIcon icon={faSync} spin />
                        En cours...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} />
                        {editingMode ? 'Mettre à jour' : 'Créer'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModePayment;
