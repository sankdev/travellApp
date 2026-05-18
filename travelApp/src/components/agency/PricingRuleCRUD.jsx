import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { agencyAssociationService } from '../../services/agencyAssociationService';
import { agencyService } from '../../services/agencyService';
import { pricingRuleService } from '../../services/pricingRuleService';

const PricingRuleCRUD = () => {
  const [pricingRules, setPricingRules] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [classAgencies, setClassAgencies] = useState([]);
  const [filteredClassAgencies, setFilteredClassAgencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    agencyId: '',
    agencyClassId: '',
    typePassenger: '',
    price: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrer les classes en fonction de l'agence sélectionnée
  useEffect(() => {
    if (formData.agencyId) {
      const filtered = classAgencies.filter(ca => 
        ca.agencyVol?.agencyId === parseInt(formData.agencyId)
      );
      setFilteredClassAgencies(filtered);
      
      // Réinitialiser la classe si elle n'est plus dans la liste
      if (!filtered.some(c => c.id === parseInt(formData.agencyClassId))) {
        setFormData(prev => ({ ...prev, agencyClassId: '' }));
      }
    } else {
      setFilteredClassAgencies([]);
    }
  }, [formData.agencyId, classAgencies]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      // Récupérer les données en parallèle
      const [rulesRes, agenciesRes, classAgenciesRes] = await Promise.all([
        pricingRuleService.getUserPricingRules(),
        agencyService.getUserAgencies(),
        agencyAssociationService.getAllClassAgencies()
      ]);

      console.log('📦 Données reçues:', {
        rules: rulesRes,
        agencies: agenciesRes,
        classAgencies: classAgenciesRes
      });

      // Traitement des règles de prix
      const rulesData = rulesRes?.data || rulesRes || [];
      setPricingRules(rulesData);

      // Traitement des agences
      const agenciesData = agenciesRes?.data || [];
      setAgencies(agenciesData);

      // Traitement des classes
      const classAgenciesData = classAgenciesRes?.data || classAgenciesRes || [];
      setClassAgencies(classAgenciesData);

    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validation
      if (!formData.agencyClassId) {
        setMessage({ type: 'error', text: 'Veuillez sélectionner une classe' });
        setLoading(false);
        return;
      }
      if (!formData.typePassenger) {
        setMessage({ type: 'error', text: 'Veuillez sélectionner un type de passager' });
        setLoading(false);
        return;
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        setMessage({ type: 'error', text: 'Veuillez saisir un prix valide' });
        setLoading(false);
        return;
      }

      // Préparer les données pour l'API (exactement ce que le controller attend)
      const submitData = {
        agencyClassId: parseInt(formData.agencyClassId),
        typePassenger: formData.typePassenger,
        price: parseFloat(formData.price)
      };

      console.log('📤 Envoi des données:', submitData);

      let response;
      if (editMode) {
        response = await pricingRuleService.updatePricingRule(editId, submitData);
        setMessage({ type: 'success', text: 'Règle de prix mise à jour avec succès!' });
      } else {
        response = await pricingRuleService.createPricingRule(submitData);
        setMessage({ type: 'success', text: 'Règle de prix créée avec succès!' });
      }

      console.log('✅ Réponse:', response);
      
      // Réinitialiser le formulaire et recharger les données
      resetForm();
      await fetchData();

    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || error.message || 'Échec de la sauvegarde' 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      agencyId: '',
      agencyClassId: '',
      typePassenger: '',
      price: ''
    });
    setEditMode(false);
    setEditId(null);
  };

  const handleEdit = (rule) => {
    // Trouver l'agence associée via la classe
    const classItem = classAgencies.find(ca => ca.id === rule.agencyClassId);
    const agencyId = classItem?.agencyVol?.agencyId || '';

    setFormData({
      agencyId: agencyId.toString(),
      agencyClassId: rule.agencyClassId?.toString() || '',
      typePassenger: rule.typePassenger || '',
      price: rule.price?.toString() || ''
    });
    setEditMode(true);
    setEditId(rule.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette règle de prix ?')) {
      return;
    }

    try {
      setLoading(true);
      await pricingRuleService.deletePricingRule(id);
      setMessage({ type: 'success', text: 'Règle de prix supprimée avec succès!' });
      await fetchData();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      setMessage({ type: 'error', text: 'Échec de la suppression' });
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour obtenir les libellés
  const getAgencyName = (agencyClassId) => {
    const classItem = classAgencies.find(ca => ca.id === agencyClassId);
    return classItem?.agencyVol?.agency?.name || 'N/A';
  };

  const getFlightName = (agencyClassId) => {
    const classItem = classAgencies.find(ca => ca.id === agencyClassId);
    return classItem?.agencyVol?.flight?.name || 'N/A';
  };

  const getCompanyName = (agencyClassId) => {
    const classItem = classAgencies.find(ca => ca.id === agencyClassId);
    return classItem?.agencyVol?.flight?.company?.name || 'N/A';
  };

  const getClassName = (agencyClassId) => {
    const classItem = classAgencies.find(ca => ca.id === agencyClassId);
    return classItem?.class?.name || 'N/A';
  };

  const getPassengerTypeLabel = (type) => {
    const types = {
      'ADL': 'Adulte',
      'CHD': 'Enfant',
      'INF': 'Bébé'
    };
    return types[type] || type;
  };

  const getPassengerTypeColor = (type) => {
    switch(type) {
      case 'ADL': return 'bg-green-100 text-green-800';
      case 'CHD': return 'bg-blue-100 text-blue-800';
      case 'INF': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6 text-orange-800">
        Gestion des Règles de Prix
      </h1>
      
      {message.text && (
        <div className={`p-4 rounded-md mb-6 text-white text-center ${
          message.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {message.text}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {editMode ? 'Modifier une règle' : 'Ajouter une nouvelle règle'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sélection de l'agence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agence <span className="text-red-500">*</span>
            </label>
            <select
              name="agencyId"
              value={formData.agencyId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Sélectionner une agence</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sélection de la classe (filtrée par agence) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classe <span className="text-red-500">*</span>
            </label>
            <select
              name="agencyClassId"
              value={formData.agencyClassId}
              onChange={handleChange}
              required
              disabled={!formData.agencyId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
            >
              <option value="">Sélectionner une classe</option>
              {filteredClassAgencies.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.class?.name} - {cls.agencyVol?.flight?.name} - {parseFloat(cls.price).toLocaleString()} FCFA
                </option>
              ))}
            </select>
          </div>

          {/* Type de passager */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de passager <span className="text-red-500">*</span>
            </label>
            <select
              name="typePassenger"
              value={formData.typePassenger}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Sélectionner un type</option>
              <option value="ADL">Adulte (ADL)</option>
              <option value="CHD">Enfant (CHD)</option>
              <option value="INF">Bébé (INF)</option>
            </select>
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix (FCFA) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="100"
              placeholder="Ex: 50000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 text-white font-semibold bg-orange-600 rounded-md shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Enregistrement..." : (editMode ? "Mettre à jour" : "Créer")}
          </button>
          
          {editMode && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-md shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* Tableau des règles */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-orange-700">
          Liste des règles de prix
        </h2>
        
        {loading && !pricingRules.length ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <p className="mt-4 text-gray-600">Chargement des règles de prix...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compagnie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type Passager
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix (FCFA)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pricingRules.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Aucune règle de prix trouvée
                    </td>
                  </tr>
                ) : (
                  pricingRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getAgencyName(rule.agencyClassId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getFlightName(rule.agencyClassId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getCompanyName(rule.agencyClassId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getClassName(rule.agencyClassId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPassengerTypeColor(rule.typePassenger)}`}>
                          {getPassengerTypeLabel(rule.typePassenger)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">
                          {parseFloat(rule.price).toLocaleString()} FCFA
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(rule)}
                          className="text-orange-600 hover:text-orange-900 mr-4"
                          title="Modifier"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingRuleCRUD;
