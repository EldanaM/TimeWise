import React, { useState, useEffect } from 'react';
import './App.css';


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
  
  const response = await fetch(API_URL + url, options);
  return await response.json();
}


function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await apiCall('/users/login/', 'POST', { username, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      onLogin();
    } else {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="container">
      <h2>Вход</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Логин" value={username} 
               onChange={(e) => setUsername(e.target.value)} required /><br/>
        <input type="password" placeholder="Пароль" value={password} 
               onChange={(e) => setPassword(e.target.value)} required /><br/>
        <button type="submit">Войти</button>
      </form>
      <p>Нет аккаунта? <button onClick={() => onLogin('register')}>Регистрация</button></p>
    </div>
  );
}


function Register({ onRegister }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      setError('Пароли не совпадают');
      return;
    }
    const data = await apiCall('/users/register/', 'POST', { username, email, password, password2 });
    if (data.user) {
      
      const loginData = await apiCall('/users/login/', 'POST', { username, password });
      if (loginData.token) {
        localStorage.setItem('token', loginData.token);
        onRegister();
      }
    } else {
      setError('Ошибка регистрации');
    }
  };

  return (
    <div className="container">
      <h2>Регистрация</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Логин" value={username} 
               onChange={(e) => setUsername(e.target.value)} required /><br/>
        <input type="email" placeholder="Email" value={email} 
               onChange={(e) => setEmail(e.target.value)} required /><br/>
        <input type="password" placeholder="Пароль" value={password} 
               onChange={(e) => setPassword(e.target.value)} required /><br/>
        <input type="password" placeholder="Повторите пароль" value={password2} 
               onChange={(e) => setPassword2(e.target.value)} required /><br/>
        <button type="submit">Зарегистрироваться</button>
      </form>
      <p>Уже есть аккаунт? <button onClick={() => onRegister('login')}>Вход</button></p>
    </div>
  );
}

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', category: '', estimated_time: 30 });

  
  useEffect(() => {
    async function loadData() {
      const tasksData = await apiCall('/tasks/tasks/');
      const catsData = await apiCall('/tasks/categories/');
      setTasks(tasksData);
      setCategories(catsData);
      setLoading(false);
    }
    loadData();
  }, []);

  
  const createTask = async () => {
    await apiCall('/tasks/tasks/', 'POST', newTask);
    setShowForm(false);
    setNewTask({ title: '', category: '', estimated_time: 30 });
    const tasksData = await apiCall('/tasks/tasks/');
    setTasks(tasksData);
  };

  const deleteTask = async (id) => {
    if (window.confirm('Удалить задачу?')) {
      await apiCall(`/tasks/tasks/${id}/`, 'DELETE');
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  
  const completeTask = async (id) => {
    await apiCall(`/tasks/tasks/${id}/complete/`, 'POST', {});
    const tasksData = await apiCall('/tasks/tasks/');
    setTasks(tasksData);
  };

  if (loading) return <div className="container">Загрузка...</div>;

  return (
    <div className="container">
      <h1>Мои задачи</h1>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Отмена' : '+ Новая задача'}
      </button>

      {showForm && (
        <div style={{border: '1px solid #ccc', padding: 10, margin: '10px 0'}}>
          <h3>Новая задача</h3>
          <input type="text" placeholder="Название" value={newTask.title}
                 onChange={(e) => setNewTask({...newTask, title: e.target.value})} /><br/>
          <select value={newTask.category} onChange={(e) => setNewTask({...newTask, category: e.target.value})}>
            <option value="">Выберите категорию</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select><br/>
          <input type="number" placeholder="Минут" value={newTask.estimated_time}
                 onChange={(e) => setNewTask({...newTask, estimated_time: e.target.value})} /><br/>
          <button onClick={createTask}>Создать</button>
        </div>
      )}

      {tasks.length === 0 ? (
        <p>Нет задач. Создайте первую!</p>
      ) : (
        tasks.map(task => (
          <div key={task.id} style={{border: '1px solid #ddd', padding: 10, margin: '10px 0'}}>
            <h3 style={{textDecoration: task.is_completed ? 'line-through' : 'none'}}>
              {task.title}
            </h3>
            <p>Категория: {task.category_name}</p>
            <p>Время: {task.estimated_time} мин</p>
            {!task.is_completed && (
              <button onClick={() => completeTask(task.id)}>✓ Выполнить</button>
            )}
            <button onClick={() => deleteTask(task.id)}>× Удалить</button>
          </div>
        ))
      )}
    </div>
  );
}


function Categories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    async function load() {
      const data = await apiCall('/tasks/categories/');
      setCategories(data);
    }
    load();
  }, []);

  const createCategory = async () => {
    if (!newName) return;
    await apiCall('/tasks/categories/', 'POST', { name: newName, color: '#4a90e2' });
    setNewName('');
    const data = await apiCall('/tasks/categories/');
    setCategories(data);
  };

  const deleteCategory = async (id) => {
    if (window.confirm('Удалить категорию?')) {
      await apiCall(`/tasks/categories/${id}/`, 'DELETE');
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="container">
      <h1>Категории</h1>
      
      <div>
        <input type="text" placeholder="Новая категория" value={newName}
               onChange={(e) => setNewName(e.target.value)} />
        <button onClick={createCategory}>Добавить</button>
      </div>

      {categories.map(cat => (
        <div key={cat.id} style={{border: '1px solid #ddd', padding: 10, margin: '10px 0'}}>
          <h3>{cat.name}</h3>
          <p>Задач: {cat.tasks_count || 0}</p>
          <button onClick={() => deleteCategory(cat.id)}>Удалить</button>
        </div>
      ))}
    </div>
  );
}

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await apiCall('/tasks/notifications/');
      setNotifications(data);
    }
    load();
  }, []);

  const markRead = async (id) => {
    await apiCall(`/tasks/notifications/${id}/mark-read/`, 'POST', {});
    setNotifications(notifications.map(n => 
      n.id === id ? {...n, is_read: true} : n
    ));
  };

  return (
    <div className="container">
      <h1>Уведомления</h1>
      {notifications.length === 0 ? (
        <p>Нет уведомлений</p>
      ) : (
        notifications.map(n => (
          <div key={n.id} 
               style={{background: n.is_read ? '#f5f5f5' : '#e3f2fd', padding: 10, margin: '10px 0'}}
               onClick={() => !n.is_read && markRead(n.id)}>
            <p>{n.message}</p>
            <small>{new Date(n.created_at).toLocaleString()}</small>
          </div>
        ))
      )}
    </div>
  );
}


function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await apiCall('/tasks/dashboard/');
      setStats(data);
    }
    load();
  }, []);

  if (!stats) return <div className="container">Загрузка...</div>;

  return (
    <div className="container">
      <h1>Дашборд</h1>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
        <div style={{border: '1px solid #ccc', padding: 20, textAlign: 'center'}}>
          <h2>{stats.total_tasks || 0}</h2>
          <p>Всего задач</p>
        </div>
        <div style={{border: '1px solid #ccc', padding: 20, textAlign: 'center'}}>
          <h2>{stats.completed_tasks || 0}</h2>
          <p>Выполнено</p>
        </div>
        <div style={{border: '1px solid #ccc', padding: 20, textAlign: 'center'}}>
          <h2>{stats.total_focus_time_hours || 0}ч</h2>
          <p>Всего времени</p>
        </div>
        <div style={{border: '1px solid #ccc', padding: 20, textAlign: 'center'}}>
          <h2>{stats.accuracy || 0}%</h2>
          <p>Точность</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState('login');
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));

  if (!isAuth) {
    if (page === 'register') {
      return <Register onRegister={() => setIsAuth(true)} />;
    }
    return <Login onLogin={() => setIsAuth(true)} />;
  }

  
  let content;
  if (page === 'tasks') content = <Tasks />;
  else if (page === 'categories') content = <Categories />;
  else if (page === 'notifications') content = <Notifications />;
  else content = <Dashboard />;

  return (
    <div>
      
      <div style={{background: '#4a90e2', padding: 10, color: 'white'}}>
        <button onClick={() => setPage('dashboard')} style={{marginRight: 10}}>Главная</button>
        <button onClick={() => setPage('tasks')} style={{marginRight: 10}}>Задачи</button>
        <button onClick={() => setPage('categories')} style={{marginRight: 10}}>Категории</button>
        <button onClick={() => setPage('notifications')}>Уведомления</button>
        <button style={{float: 'right'}} onClick={() => {
          localStorage.removeItem('token');
          setIsAuth(false);
        }}>Выйти</button>
      </div>
      {content}
    </div>
  );
}

export default App;