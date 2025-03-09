import { faClock, faShieldAlt, faUserCheck, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { roleService } from '../../services/roleService';
import { userService } from '../../services/userService';
import { RecentUsers } from './RecentUsers';
import { RoleDistribution } from './RoleDistribution';
import StatsCard from './StatsCard';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRoles: 0,
    newUsersThisMonth: 0
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const usersResponse = await userService.getAllUsers();
        setRecentUsers(usersResponse);

        const rolesResponse = await roleService.getAllRoles();
        const roles = rolesResponse;

        const totalUsers = usersResponse.length;
        const activeUsers = usersResponse.filter(user => user.status === 'active').length;
        const totalRoles = roles.length;

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newUsersThisMonth = usersResponse.filter(
          user => new Date(user.createdAt) >= firstDayOfMonth
        ).length;

        setStats({
          totalUsers,
          activeUsers,
          totalRoles,
          newUsersThisMonth
        });

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

  return (
    <div className="space-y-6">
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
          title="New Users This Month"
          value={stats.newUsersThisMonth}
          change={{ value: 8, isPositive: true }}
          icon={<FontAwesomeIcon icon={faClock} />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <RecentUsers users={recentUsers} isLoading={isLoading} />
        <RoleDistribution 
          roles={roleDistribution} 
          total={stats.totalUsers} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
};
