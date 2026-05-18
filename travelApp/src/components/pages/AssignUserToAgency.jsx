import { faCheck, faExclamationTriangle, faPlus, faSearch, faTimes, faTrash, faUserMinus, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { agencyService } from '../../services/agencyService';
import { userAgencyService } from '../../services/userAgencyService';
import { userService } from '../../services/userService';

const AssignUserToAgency = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [assignedAgencies, setAssignedAgencies] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchAgencies();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserAgencies(selectedUser);
    } else {
      setAssignedAgencies(new Set());
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      setUsers(response);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
    }
  };

  const fetchAgencies = async () => {
    try {
      const response = await agencyService.getAgencies();
      setAgencies(response.data);
    } catch (error) {
      console.error("Erreur chargement agences:", error);
    }
  };

  const fetchUserAgencies = async (userId) => {
    try {
      const response = await userAgencyService.getUserAgencies(userId);
          console.log('userAgency',response)
      const agencyIds = response.data?.map(agency => agency.id);
      setAssignedAgencies(new Set(agencyIds));
    } catch (error) {
      console.error("Erreur chargement agences utilisateur:", error);
    }
  };

  const assignUserToAgency = async (agencyId) => {
    if (!selectedUser || !agencyId) return;
    setLoading(true);
    try {
      await userAgencyService.assignUserToAgency({ userId: selectedUser, agencyId });
      setAssignedAgencies(prev => new Set(prev).add(agencyId));
    } catch (error) {
      console.error("Erreur assignation:", error);
    } finally {
      setLoading(false);
    }
  };

  const revokeUserFromAgency = async (agencyId) => {
    if (!selectedUser || !agencyId) return;
    setLoading(true);
    try {
      await userAgencyService.revokeUserFromAgency({ userId: selectedUser, agencyId });
      setAssignedAgencies(prev => {
        const updated = new Set(prev);
        updated.delete(agencyId);
        return updated;
      });
    } catch (error) {
      console.error("Erreur révocation:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeUserFromAgency = async (agencyId) => {
    if (!selectedUser || !agencyId) return;
    setLoading(true);
    try {
      await userAgencyService.deleteUserAgency(parseInt(selectedUser, 10), parseInt(agencyId, 10));
      setAssignedAgencies(prev => {
        const updated = new Set(prev);
        updated.delete(agencyId);
        return updated;
      });
    } catch (error) {
      console.error("Erreur suppression utilisateur de l'agence:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const filteredAgencies = agencies.filter(agency =>
    agency.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Assignation Utilisateur → Agence</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sélection de l'utilisateur */}
        <div className="md:col-span-1 border-r border-gray-200 pr-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sélectionner un utilisateur</h3>
          <div className="space-y-2">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user.id)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  selectedUser === user.id
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <FontAwesomeIcon
                  icon={faCheck}
                  className={`h-5 w-5 mr-2 ${selectedUser === user.id ? 'text-indigo-600' : 'text-gray-400'}`}
                />
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Gestion des agences */}
        <div className="md:col-span-2 pl-6">
          <h3 className="text-lg font-medium text-gray-900">
            {selectedUser ? `Agences de l'utilisateur` : 'Sélectionnez un utilisateur'}
          </h3>
          {selectedUser && (
            <div className="mt-2">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une agence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md shadow-sm py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {selectedUser ? (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredAgencies.map(agency => (
                <div key={agency.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <p className="text-sm font-medium text-gray-900">{agency.name}</p>

                  <div className="flex space-x-2">
                    {assignedAgencies.has(agency.id) ? (
                      <button
                        onClick={() => revokeUserFromAgency(agency.id)}
                        disabled={loading}
                        className="p-2 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                      >
                        <FontAwesomeIcon icon={faUserMinus} className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => assignUserToAgency(agency.id)}
                        disabled={loading}
                        className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                      >
                        <FontAwesomeIcon icon={faUserPlus} className="h-5 w-5" />
                      </button>
                    )}

                    <button
                      onClick={() => removeUserFromAgency(agency.id)}
                      disabled={loading}
                      className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-12 text-gray-500">Aucun utilisateur sélectionné</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignUserToAgency;
