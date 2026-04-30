import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', priority: 'Medium', assignedUser: '' });
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const [projectRes, tasksRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/projects/${id}/tasks`)
        ]);
        setProject(projectRes.data);
        setTasks(tasksRes.data);
      } catch (error) {
        console.error('Failed to fetch project details', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      if (user?.role === 'Admin') {
        try {
          const { data } = await api.get('/auth/users');
          setAllUsers(data);
        } catch (error) {
          console.error('Failed to fetch users', error);
        }
      }
    };

    fetchProjectDetails();
    fetchUsers();
  }, [id, user?.role]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newTask };
      if (!payload.assignedUser) delete payload.assignedUser;
      const { data } = await api.post(`/projects/${id}/tasks`, payload);
      setTasks([...tasks, { ...data, assignedUser: allUsers.find(u => u._id === data.assignedUser) }]);
      setIsTaskModalOpen(false);
      setNewTask({ title: '', description: '', dueDate: '', priority: 'Medium', assignedUser: '' });
      // Refresh tasks to get properly populated user
      const tasksRes = await api.get(`/projects/${id}/tasks`);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserToAdd) return;
    try {
      await api.post(`/projects/${id}/members`, { userId: selectedUserToAdd });
      const projectRes = await api.get(`/projects/${id}`);
      setProject(projectRes.data);
      setSelectedUserToAdd('');
    } catch (error) {
      console.error('Failed to add member', error);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      const projectRes = await api.get(`/projects/${id}`);
      setProject(projectRes.data);
    } catch (error) {
      console.error('Failed to remove member', error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error('Failed to update task status', error);
    }
  };

  const handleAssignTask = async (taskId, newUserId) => {
    try {
      await api.put(`/tasks/${taskId}`, { assignedUser: newUserId || null });
      const userObj = newUserId 
        ? allUsers.find(u => u._id === newUserId) || project.members.find(m => m._id === newUserId) || (project.admin._id === newUserId ? project.admin : null)
        : null;
      setTasks(tasks.map(t => t._id === taskId ? { ...t, assignedUser: userObj } : t));
    } catch (error) {
      console.error('Failed to update task assignment', error);
    }
  };

  if (loading) return <div>Loading project details...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            project.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {project.status}
          </span>
        </div>
        
        <div className="flex space-x-6 text-sm mt-6 pt-6 border-t border-gray-100">
          <div>
            <span className="text-gray-500 block mb-1">Deadline</span>
            <span className="font-medium text-gray-900">{format(new Date(project.deadline), 'MMM dd, yyyy')}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Admin</span>
            <span className="font-medium text-gray-900">{project.admin.name}</span>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-500 block">Team Members</span>
              {user?.role === 'Admin' && (
                <button 
                  onClick={() => setIsMemberModalOpen(true)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Manage
                </button>
              )}
            </div>
            <div className="flex -space-x-2 overflow-hidden">
              {project.members.map(member => (
                <div key={member._id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-primary text-white flex items-center justify-center text-xs font-bold" title={member.name}>
                  {member.name.charAt(0)}
                </div>
              ))}
              {project.members.length === 0 && <span className="text-gray-400 text-xs mt-1">No members</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Tasks</h2>
          {user?.role === 'Admin' && (
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Add Task
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500">
                <th className="pb-3 font-medium">Task</th>
                <th className="pb-3 font-medium">Assigned To</th>
                <th className="pb-3 font-medium">Due Date</th>
                <th className="pb-3 font-medium">Priority</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-4">
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500 truncate w-48">{task.description}</p>
                  </td>
                  <td className="py-4 text-sm text-gray-600">
                    {user?.role === 'Admin' ? (
                      <select
                        value={task.assignedUser?._id || ''}
                        onChange={(e) => handleAssignTask(task._id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-lg border border-gray-200 cursor-pointer outline-none bg-white text-gray-700 max-w-[120px]"
                      >
                        <option value="">Unassigned</option>
                        {allUsers.map(u => (
                          <option key={u._id} value={u._id}>{u.name}</option>
                        ))}
                      </select>
                    ) : (
                      task.assignedUser?.name || 'Unassigned'
                    )}
                  </td>
                  <td className="py-4 text-sm text-gray-600">{format(new Date(task.dueDate), 'MMM dd')}</td>
                  <td className="py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      task.priority === 'High' ? 'bg-red-100 text-red-700' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-4">
                    {user?.role === 'Admin' || task.assignedUser?._id === user?._id ? (
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer outline-none ${
                          task.status === 'Done' ? 'bg-green-100 text-green-700' :
                          task.status === 'In Progress' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        task.status === 'Done' ? 'bg-green-100 text-green-700' :
                        task.status === 'In Progress' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">No tasks found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" required 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input 
                    type="date" required 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  value={newTask.assignedUser} onChange={e => setNewTask({...newTask, assignedUser: e.target.value})}
                >
                  <option value="">Unassigned</option>
                  {user?.role === 'Admin' ? (
                    allUsers.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))
                  ) : (
                    <>
                      {project.members.map(m => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                      <option value={project.admin._id}>{project.admin.name} (Admin)</option>
                    </>
                  )}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Manage Members</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Add Member</label>
              <div className="flex space-x-2">
                <select 
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  value={selectedUserToAdd} onChange={e => setSelectedUserToAdd(e.target.value)}
                >
                  <option value="">Select a user...</option>
                  {allUsers.filter(u => u.role !== 'Admin' && !project.members.some(m => m._id === u._id)).map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <button 
                  onClick={handleAddMember}
                  disabled={!selectedUserToAdd}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Members</h3>
              <ul className="divide-y divide-gray-100 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                {project.members.map(member => (
                  <li key={member._id} className="p-3 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{member.name}</span>
                    <button 
                      onClick={() => handleRemoveMember(member._id)}
                      className="text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  </li>
                ))}
                {project.members.length === 0 && (
                  <li className="p-3 text-sm text-gray-500 italic text-center">No members yet.</li>
                )}
              </ul>
            </div>

            <div className="flex justify-end pt-6">
              <button onClick={() => setIsMemberModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
