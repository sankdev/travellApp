// src/components/agency/AgencyTable.jsx
import React, { useState, useEffect } from 'react';
import { agencyService } from '../../services/agencyService';
//import { agencyStatusService } from '../../services/agencyStatusService';
import StatusBadge from './StatusBadge';
import StatusSelector from './StatusSelector';

const AgencyTable = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAgencies, setSelectedAgencies] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');

  const fetchAgencies = async (page = 1) => {
    try {
      setLoading(true);
      const response = await agencyService.getAgencies({
        page,
        limit: 10
      });

      if (response.success) {
        setAgencies(response.data);
        setTotalPages(response.pagination.pages);
        setCurrentPage(page);
        setSelectedAgencies(new Set()); // Reset selection
      }
    } catch (error) {
      console.error('Erreur lors du chargement des agences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (agencyId, newStatus) => {
    setAgencies(prevAgencies =>
      prevAgencies.map(agency =>
        agency.id === agencyId ? { ...agency, status: newStatus } : agency
      )
    );
  };

  const handleBulkStatusUpdate = async (status) => {
    const agencyIds = Array.from(selectedAgencies);
    
    if (agencyIds.length === 0) {
      alert('Veuillez sélectionner au moins une agence');
      return;
    }

    try {
      const result = await agencyService.bulkUpdateAgencyStatus(
        agencyIds,
        status,
        'Mise à jour en lot par administrateur'
      );

      if (result.success) {
        // Mettre à jour les statuts localement
        setAgencies(prevAgencies =>
          prevAgencies.map(agency =>
            selectedAgencies.has(agency.id) 
              ? { ...agency, status } 
              : agency
          )
        );
        setSelectedAgencies(new Set());
        setBulkAction('');
        console.log('✅ Mise à jour en lot réussie');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour en lot:', error);
    }
  };

  const toggleAgencySelection = (agencyId) => {
    const newSelection = new Set(selectedAgencies);
    if (newSelection.has(agencyId)) {
      newSelection.delete(agencyId);
    } else {
      newSelection.add(agencyId);
    }
    setSelectedAgencies(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedAgencies.size === agencies.length) {
      setSelectedAgencies(new Set());
    } else {
      setSelectedAgencies(new Set(agencies.map(agency => agency.id)));
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
      {/* En-tête avec actions */}
      <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Gestion des Agences</span>
            </h1>
            <p className="text-gray-600 mt-1">Gérez le statut et les informations de vos agences</p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <span className="text-sm text-gray-500">
              {selectedAgencies.size} sélectionné(s)
            </span>
            
            {/* Actions en lot */}
            {selectedAgencies.size > 0 && (
              <div className="flex space-x-2">
                <select
                  value={bulkAction}
                  onChange={(e) => {
                    setBulkAction(e.target.value);
                    if (e.target.value) {
                      handleBulkStatusUpdate(e.target.value);
                    }
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Actions groupées</option>
                  <option value="active">Activer</option>
                  <option value="inactive">Désactiver</option>
                  <option value="suspended">Suspendre</option>
                  <option value="pending">Mettre en attente</option>
                </select>
                
                <button
                  onClick={() => setSelectedAgencies(new Set())}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedAgencies.size === agencies.length && agencies.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Agence
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Localisation
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agencies.map((agency) => (
              <tr 
                key={agency.id} 
                className={`hover:bg-gray-50 transition-colors ${
                  selectedAgencies.has(agency.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedAgencies.has(agency.id)}
                    onChange={() => toggleAgencySelection(agency.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{agency.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {agency.description || 'Aucune description'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2 text-sm text-gray-900">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{agency.location || 'Non spécifiée'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{agency.phone1 || 'Non renseigné'}</span>
                    </div>
                    {agency.manager && (
                      <div className="text-xs text-gray-400">{agency.manager}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={agency.status} size="md" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <StatusSelector
                    agency={agency}
                    currentStatus={agency.status}
                    onStatusUpdate={handleStatusUpdate}
                    size="sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* État de chargement */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-gray-600">Chargement des agences...</span>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="px-8 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-700 mb-4 sm:mb-0">
            Page {currentPage} sur {totalPages} • {agencies.length} agence(s)
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => fetchAgencies(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Précédent
            </button>
            
            <button
              onClick={() => fetchAgencies(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyTable;
