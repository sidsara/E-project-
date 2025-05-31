import React, { useState } from 'react';
import './TaskList.css';
import { EditTaskIcon, DeleteTaskIcon, NoTasksYet } from '../icons/projectIcons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

export default function TaskList({ tasks, setTasks }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const calculateDaysAgo = (dateString) => {
    if (!dateString) return 'No deadline';
    
    const deadline = new Date(dateString);
    const today = new Date();
    
    if (deadline < today) {
      const diffTime = today - deadline;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days overdue`;
    }
    
    const diffTime = deadline - today;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/deleteTask/${id}`);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      setError(null);
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-message"> <div className="loadercontainer">
  <div className="loader">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
       </div></div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!tasks.length) return <div className="no-tasks-message"><div className='no-data-yet'><NoTasksYet/></div></div>;

  return (
    <div className="tasks-container">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`task-item ${task.status === 'DONE' ? 'task-done' : ''}`}
        >
          <div className="task-content">
            <div className="task-text">{task.description || 'Untitled Task'}</div>
            <div className="task-date-container">
              <div className="task-date">
                {formatDate(task.deadline)}
              </div>
              <div className={`days-ago ${task.deadline && new Date(task.deadline) < new Date() ? 'overdue' : ''}`}>
                {calculateDaysAgo(task.deadline)}
              </div>
            </div>
          </div>
          
          <div className="task-actions">
            <button className="icon edit-icon">
              <EditTaskIcon />
            </button>
            <button 
              className="icon delete-icon" 
              onClick={() => handleDelete(task.id)}
            >
              <DeleteTaskIcon />
            </button>
          </div>
        </div>
      ))}
      <div style={{ marginBottom: '20rem' }}/>
    </div>
  );
}