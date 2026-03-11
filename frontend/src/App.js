import React, { useState, useEffect } from 'react';

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
      <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
        <h2 className="text-center">Вход</h2>
        {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Имя пользователя</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Войти</button>
        </form>
        <p className="text-center mt-2">
          Нет аккаунта? <button className="btn" onClick={() => onLogin('register')}>Регистрация</button>
        </p>
      </div>
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
      <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
        <h2 className="text-center">Регистрация</h2>
        {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Имя пользователя</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Повторите пароль</label>
            <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Зарегистрироваться</button>
        </form>
        <p className="text-center mt-2">
          Уже есть аккаунт? <button className="btn" onClick={() => onRegister('login')}>Вход</button>
        </p>
      </div>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>Мои задачи</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Отмена' : '+ Новая задача'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>Новая задача</h3>
          <div className="form-group">
            <label>Название</label>
            <input type="text" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Категория</label>
            <select value={newTask.category} onChange={(e) => setNewTask({...newTask, category: e.target.value})}>
              <option value="">Выберите категорию</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Время (минут)</label>
            <input type="number" value={newTask.estimated_time} onChange={(e) => setNewTask({...newTask, estimated_time: e.target.value})} />
          </div>
          <button className="btn btn-success" onClick={createTask}>Создать</button>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="card text-center">Нет задач. Создайте первую!</div>
      ) : (
        tasks.map(task => (
          <div key={task.id} className={`card task-card ${task.is_completed ? 'completed' : ''}`}>
            <div>
              <h3 className="task-title">{task.title}</h3>
              <div className="task-meta">
                <span className="category-badge">{task.category_name}</span>
                <span>⏱️ {task.estimated_time} мин</span>
              </div>
            </div>
            <div className="task-actions">
              {!task.is_completed && (
                <button className="btn btn-success btn-small" onClick={() => completeTask(task.id)}>✓</button>
              )}
              <button className="btn btn-danger btn-small" onClick={() => deleteTask(task.id)}>×</button>
            </div>
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
      <div className="card" style={{ display: 'flex', gap: '10px' }}>
        <input type="text" placeholder="Новая категория" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <button className="btn btn-primary" onClick={createCategory}>Добавить</button>
      </div>
      <div className="stats-grid">
        {categories.map(cat => (
          <div key={cat.id} className="stat-card">
            <h3>{cat.name}</h3>
            <p>Задач: {cat.tasks_count || 0}</p>
            <button className="btn btn-danger btn-small" onClick={() => deleteCategory(cat.id)}>Удалить</button>
          </div>
        ))}
      </div>
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
    setNotifications(notifications.map(n => n.id === id ? {...n, is_read: true} : n));
  };

  return (
    <div className="container">
      <h1>Уведомления</h1>
      {notifications.length === 0 ? (
        <div className="card text-center">Нет уведомлений</div>
      ) : (
        notifications.map(n => (
          <div key={n.id} className={`notification-item ${!n.is_read ? 'unread' : ''}`} onClick={() => !n.is_read && markRead(n.id)}>
            <p>{n.message}</p>
            <div className="notification-date">{new Date(n.created_at).toLocaleString()}</div>
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
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total_tasks || 0}</div>
          <div className="stat-label">Всего задач</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completed_tasks || 0}</div>
          <div className="stat-label">Выполнено</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total_focus_time_hours || 0}ч</div>
          <div className="stat-label">Всего времени</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.accuracy || 0}%</div>
          <div className="stat-label">Точность</div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState('dashboard');
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
      <nav className="navbar">
        <a href="#" className="navbar-brand" onClick={(e) => { e.preventDefault(); setPage('dashboard'); }}>TimeWise</a>
        <div className="navbar-menu">
          <a href="#" onClick={(e) => { e.preventDefault(); setPage('dashboard'); }}>Главная</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage('tasks'); }}>Задачи</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage('categories'); }}>Категории</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage('notifications'); }}>Уведомления</a>
          <button onClick={() => { localStorage.removeItem('token'); setIsAuth(false); }}>Выйти</button>
        </div>
      </nav>
      {content}
    </div>
  );
}

export default App;