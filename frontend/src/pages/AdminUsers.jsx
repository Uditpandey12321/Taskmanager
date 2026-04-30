import React, { useState, useEffect, useContext } from 'react';
import { Trash2, Users } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Member' });
  const { user: currentUser } = useContext(AuthContext);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/auth/users');
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/auth/users/${id}`);
        setUsers(users.filter((user) => user._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/users', newUser);
      setUsers([...users, data]);
      setIsAddModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'Member' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add user');
    }
  };

  const handleVerifyUser = async (id) => {
    try {
      const { data } = await api.put(`/auth/users/${id}/verify`);
      setUsers(users.map((user) => (user._id === id ? { ...user, isVerified: true } : user)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify user');
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Users className="text-primary" size={28} />
          <span>Manage Users</span>
        </h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Add User
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 font-medium">{u.name}</td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        u.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {u.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {!u.isVerified && (
                      <button
                        onClick={() => handleVerifyUser(u._id)}
                        className="text-green-600 hover:text-green-800 transition-colors p-1 text-sm font-medium"
                        title="Verify User"
                      >
                        Verify
                      </button>
                    )}
                    {u.role !== 'Admin' && u._id !== currentUser._id && (
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" required 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" required 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" required 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
