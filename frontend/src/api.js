import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const register = (username, email, password, password2) => 
  api.post('users/register/', { username, email, password, password2 });

export const login = (username, password) => 
  api.post('users/login/', { username, password });

export const getCurrentUser = () => 
  api.get('users/me/');

export const getCategories = () => 
  api.get('tasks/categories/');

export const createCategory = (name, color) => 
  api.post('tasks/categories/', { name, color });

export const deleteCategory = (id) => 
  api.delete(`tasks/categories/${id}/`);

export const getTasks = (status = '', category = '') => {
  let url = 'tasks/tasks/';
  const params = [];
  if (status) params.push(`status=${status}`);
  if (category) params.push(`category=${category}`);
  if (params.length) url += '?' + params.join('&');
  return api.get(url);
};

export const createTask = (data) => 
  api.post('tasks/tasks/', data);

export const updateTask = (id, data) => 
  api.put(`tasks/tasks/${id}/`, data);

export const deleteTask = (id) => 
  api.delete(`tasks/tasks/${id}/`);

export const completeTask = (id) => 
  api.post(`tasks/tasks/${id}/complete/`, {});

export const createTimeLog = (taskId, actualTime) => 
  api.post('tasks/time-logs/', { task: taskId, actual_time: actualTime });

  api.get('tasks/notifications/');

export const markNotificationRead = (id) => 
  api.post(`tasks/notifications/${id}/mark-read/`, {});

export const markAllNotificationsRead = () => 
  api.post('tasks/notifications/mark-all-read/', {});

export const getDashboard = () => 
  api.get('tasks/dashboard/');

export default api;