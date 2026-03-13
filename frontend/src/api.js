const API_URL = 'http://127.0.0.1:8000/api';

async function apiCall(url, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  const token = localStorage.getItem('token');
  if (token) {
    options.headers.Authorization = `Token ${token}`;
  }
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(API_URL + url, options);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}

export const login = (username, password) => 
  apiCall('/users/login/', 'POST', { username, password });

export const register = (username, email, password, password2) => 
  apiCall('/users/register/', 'POST', { username, email, password, password2 });

export const getCategories = () => 
  apiCall('/tasks/categories/');

export const createCategory = (name, color = '#4a90e2') => 
  apiCall('/tasks/categories/', 'POST', { name, color });

export const deleteCategory = (id) => 
  apiCall(`/tasks/categories/${id}/`, 'DELETE');

export const getTasks = (status = '', category = '') => {
  let url = '/tasks/tasks/';
  const params = [];
  if (status) params.push(`status=${status}`);
  if (category) params.push(`category=${category}`);
  if (params.length) url += '?' + params.join('&');
  return apiCall(url);
};

export const createTask = (taskData) => 
  apiCall('/tasks/tasks/', 'POST', taskData);

export const deleteTask = (id) => 
  apiCall(`/tasks/tasks/${id}/`, 'DELETE');

export const completeTask = (id) => 
  apiCall(`/tasks/tasks/${id}/complete/`, 'POST', {});

export const getNotifications = () => 
  apiCall('/tasks/notifications/');

export const markNotificationRead = (id) => 
  apiCall(`/tasks/notifications/${id}/mark-read/`, 'POST', {});

export const markAllNotificationsRead = () => 
  apiCall('/tasks/notifications/mark-all-read/', 'POST', {});

export const getDashboard = () => 
  apiCall('/tasks/dashboard/');

export default apiCall;