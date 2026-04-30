import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', deadline: '' });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('/projects');
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/projects', newProject);
      setProjects([...projects, data]);
      setIsModalOpen(false);
      setNewProject({ title: '', description: '', deadline: '' });
    } catch (error) {
      console.error('Failed to create project', error);
    }
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        {user?.role === 'Admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>New Project</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link key={project._id} to={`/projects/${project._id}`} className="block group">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{project.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  project.status === 'Active' ? 'bg-green-100 text-green-700' :
                  project.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {project.status}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">{project.description}</p>
              
              <div className="flex justify-between items-center text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 mr-1">Admin:</span>
                  {project.admin.name}
                </div>
                <div>
                  {format(new Date(project.deadline), 'MMM dd, yyyy')}
                </div>
              </div>
            </div>
          </Link>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            No projects found.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  required 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  value={newProject.title}
                  onChange={e => setNewProject({...newProject, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  value={newProject.description}
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input 
                  type="date" 
                  required 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                  value={newProject.deadline}
                  onChange={e => setNewProject({...newProject, deadline: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
