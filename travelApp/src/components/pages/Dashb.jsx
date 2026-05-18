import { faClock, faShieldAlt, faUserCheck, faUsers, faBuilding, faCheckCircle, faPauseCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { roleService } from '../../services/roleService';
import { userService } from '../../services/userService';
import { agencyService } from '../../services/agencyService';
import { RecentUsers } from './RecentUsers';
import { RoleDistribution } from './RoleDistribution';
import StatsCard from './StatsCard';
import AgencyTable from './AgencyTable';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRoles: 0,
    newUsersThisMonth: 0,
    totalAgencies: 0,
    activeAgencies: 0,
    suspendedAgencies: 0,
    pendingAgencies: 0
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState([]);
  const [recentAgencies, setRecentAgencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' ou 'agencies'

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch users data
        const usersResponse = await userService.getAllUsers();
        setRecentUsers(usersResponse.slice(0, 5)); // Only show 5 recent users

        // Fetch roles data
        const rolesResponse = await roleService.getAllRoles();
        const roles = rolesResponse;

        // Fetch agencies data
        const agenciesResponse = await agencyService.getAgencies({ page: 1, limit: 50 });
        const agencies = agenciesResponse.data || [];

        // Calculate user statistics
        const totalUsers = usersResponse.length;
        const activeUsers = usersResponse.filter(user => user.status === 'active').length;
        const totalRoles = roles.length;

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newUsersThisMonth = usersResponse.filter(
          user => new Date(user.createdAt) >= firstDayOfMonth
        ).length;

        // Calculate agency statistics
        const totalAgencies = agencies.length;
        const activeAgencies = agencies.filter(agency => agency.status === 'active').length;
        const suspendedAgencies = agencies.filter(agency => agency.status === 'suspended').length;
        const pendingAgencies = agencies.filter(agency => agency.status === 'pending').length;

        // Set recent agencies (last 3 created)
        setRecentAgencies(agencies.slice(0, 3));

        setStats({
          totalUsers,
          activeUsers,
          totalRoles,
          newUsersThisMonth,
          totalAgencies,
          activeAgencies,
          suspendedAgencies,
          pendingAgencies
        });

        // Calculate role distribution
        const distribution = roles.map(role => ({
          role,
          count: Math.floor(Math.random() * totalUsers)
        }));

        setRoleDistribution(distribution);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const RecentAgencies = ({ agencies, isLoading }) => {
    if (isLoading) {
      return (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Agences Récentes</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Agences Récentes</h3>
          <button 
            onClick={() => setActiveTab('agencies')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Voir tout
          </button>
        </div>
        <div className="space-y-3">
          {agencies.map((agency) => (
            <div key={agency.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faBuilding} className="text-white text-sm" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{agency.name}</p>
                  <p className="text-sm text-gray-500">
                    {agency.location || 'Localisation non spécifiée'}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                agency.status === 'active' ? 'bg-green-100 text-green-800' :
                agency.status === 'suspended' ? 'bg-red-100 text-red-800' :
                agency.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {agency.status === 'active' ? 'Actif' :
                 agency.status === 'suspended' ? 'Suspendu' :
                 agency.status === 'pending' ? 'En attente' : 'Inactif'}
              </span>
            </div>
          ))}
          {agencies.length === 0 && (
            <p className="text-center text-gray-500 py-4">Aucune agence trouvée</p>
          )}
        </div>
      </div>
    );
  };

  const AgencyStatsOverview = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Aperçu des Agences</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <FontAwesomeIcon icon={faCheckCircle} className="text-blue-600 text-xl mb-2" />
          <div className="text-2xl font-bold text-blue-600">{stats.activeAgencies}</div>
          <div className="text-sm text-blue-500">Actives</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <FontAwesomeIcon icon={faClock} className="text-yellow-600 text-xl mb-2" />
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingAgencies}</div>
          <div className="text-sm text-yellow-500">En attente</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-xl mb-2" />
          <div className="text-2xl font-bold text-red-600">{stats.suspendedAgencies}</div>
          <div className="text-sm text-red-500">Suspendues</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <FontAwesomeIcon icon={faPauseCircle} className="text-gray-600 text-xl mb-2" />
          <div className="text-2xl font-bold text-gray-600">
            {stats.totalAgencies - stats.activeAgencies - stats.suspendedAgencies - stats.pendingAgencies}
          </div>
          <div className="text-sm text-gray-500">Inactives</div>
        </div>
      </div>
    </div>
  );

  // Overview Tab Content
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<FontAwesomeIcon icon={faUsers} />}
          color="indigo"
        />
        <StatsCard
          title="Active Users"
          value={stats.activeUsers}
          change={{ value: 12, isPositive: true }}
          icon={<FontAwesomeIcon icon={faUserCheck} />}
          color="green"
        />
        <StatsCard
          title="Total Roles"
          value={stats.totalRoles}
          icon={<FontAwesomeIcon icon={faShieldAlt} />}
          color="blue"
        />
        <StatsCard
          title="Total Agences"
          value={stats.totalAgencies}
          change={{ value: 3, isPositive: true }}
          icon={<FontAwesomeIcon icon={faBuilding} />}
          color="purple"
        />
      </div>

      {/* Additional Agency Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Agences Actives"
          value={stats.activeAgencies}
          icon={<FontAwesomeIcon icon={faCheckCircle} />}
          color="green"
          size="sm"
        />
        <StatsCard
          title="Agences En Attente"
          value={stats.pendingAgencies}
          icon={<FontAwesomeIcon icon={faClock} />}
          color="yellow"
          size="sm"
        />
        <StatsCard
          title="Agences Suspendues"
          value={stats.suspendedAgencies}
          icon={<FontAwesomeIcon icon={faExclamationTriangle} />}
          color="red"
          size="sm"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <RecentUsers users={recentUsers} isLoading={isLoading} />
          <RoleDistribution
            roles={roleDistribution}
            total={stats.totalUsers}
            isLoading={isLoading}
          />
        </div>
        <div className="space-y-5">
          <RecentAgencies agencies={recentAgencies} isLoading={isLoading} />
          <AgencyStatsOverview />
        </div>
      </div>
    </div>
  );

  // Agencies Tab Content
  const AgenciesTab = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <FontAwesomeIcon icon={faBuilding} className="text-blue-600" />
              <span>Gestion des Agences</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez le statut et les informations de toutes les agences du système
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex space-x-4 mt-4 lg:mt-0">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalAgencies}</div>
              <div className="text-xs text-blue-500">Total</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.activeAgencies}</div>
              <div className="text-xs text-green-500">Actives</div>
            </div>
          </div>
        </div>
      </div>

      <AgencyTable />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-2xl p-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('agencies')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'agencies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faBuilding} className="mr-2" />
              Gestion des Agences
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? <OverviewTab /> : <AgenciesTab />}
    </div>
  );
};
