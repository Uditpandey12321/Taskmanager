import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import api from '../api/axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const statCards = [
    { title: 'Total Tasks', value: stats?.totalTasks || 0, icon: <FileText size={24} className="text-blue-500" />, bg: 'bg-blue-50' },
    { title: 'Tasks (To Do)', value: stats?.tasksByStatus?.['To Do'] || 0, icon: <AlertTriangle size={24} className="text-yellow-500" />, bg: 'bg-yellow-50' },
    { title: 'Tasks (In Progress)', value: stats?.tasksByStatus?.['In Progress'] || 0, icon: <Clock size={24} className="text-purple-500" />, bg: 'bg-purple-50' },
    { title: 'Tasks (Done)', value: stats?.tasksByStatus?.['Done'] || 0, icon: <CheckCircle size={24} className="text-green-500" />, bg: 'bg-green-50' },
    { title: 'Overdue Tasks', value: stats?.overdueTasks || 0, icon: <AlertTriangle size={24} className="text-red-500" />, bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
            <div className={`p-4 rounded-full ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Project Completion Overview</h2>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary/10">
                  Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-primary">
                  {stats?.projectCompletionPercentage || 0}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/10">
              <div style={{ width: `${stats?.projectCompletionPercentage || 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Tasks Per User</h2>
          <div className="overflow-y-auto max-h-48 pr-2">
            <ul className="space-y-3">
              {stats?.tasksPerUser?.map((user, idx) => (
                <li key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 font-medium">{user.name}</span>
                  <span className="bg-gray-100 text-gray-800 py-1 px-3 rounded-full">{user.count} Tasks</span>
                </li>
              ))}
              {(!stats?.tasksPerUser || stats.tasksPerUser.length === 0) && (
                <li className="text-gray-500 text-sm italic">No assigned tasks found.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
