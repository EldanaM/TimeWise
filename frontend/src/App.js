import React, { useState, useEffect } from 'react';
import { 
  login, register, getTasks, getCategories, createTask, deleteTask, completeTask,
  createCategory, deleteCategory, getNotifications, markNotificationRead, 
  markAllNotificationsRead, getDashboard 
} from './api';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await login(username, password);
    if (data && data.token) {
      localStorage.setItem('token', data.token);
      onLogin();
    } else {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
        <h2 className="text-center">Вход в TimeWise</h2>
        {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Имя пользователя</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Войти
          </button>
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
    const data = await register(username, email, password, password2);
    if (data && data.user) {
      const loginData = await login(username, password);
      if (loginData && loginData.token) {
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
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Зарегистрироваться
          </button>
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
    loadData();
  }, []);

  const loadData = async () => {
    const tasksData = await getTasks();
    const catsData = await getCategories();
    setTasks(Array.isArray(tasksData) ? tasksData : []);
    setCategories(Array.isArray(catsData) ? catsData : []);
    setLoading(false);
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.category) return;
    await createTask({
      title: newTask.title,
      category: parseInt(newTask.category),
      estimated_time: parseInt(newTask.estimated_time)
    });
    setShowForm(false);
    setNewTask({ title: '', category: '', estimated_time: 30 });
    loadData();
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Удалить задачу?')) {
      await deleteTask(id);
      loadData();
    }
  };

  const handleCompleteTask = async (id) => {
    await completeTask(id);
    loadData();
  };

  if (loading) return <div className="container">Загрузка...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Мои задачи</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Отмена' : '+ Новая задача'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3>Новая задача</h3>
          <div className="form-group">
            <label>Название</label>
            <input 
              type="text" 
              value={newTask.title} 
              onChange={(e) => setNewTask({...newTask, title: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>Категория</label>
            <select 
              value={newTask.category} 
              onChange={(e) => setNewTask({...newTask, category: e.target.value})}
            >
              <option value="">Выберите категорию</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Время (минут)</label>
            <input 
              type="number" 
              value={newTask.estimated_time} 
              onChange={(e) => setNewTask({...newTask, estimated_time: e.target.value})} 
            />
          </div>
          <button className="btn btn-success" onClick={handleCreateTask}>
            Создать задачу
          </button>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="card text-center">
          <p>У вас пока нет задач</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Создать первую задачу
          </button>
        </div>
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
                <button 
                  className="btn btn-success btn-small" 
                  onClick={() => handleCompleteTask(task.id)}
                >
                  ✓ Выполнить
                </button>
              )}
              <button 
                className="btn btn-danger btn-small" 
                onClick={() => handleDeleteTask(task.id)}
              >
                × Удалить
              </button>
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
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(Array.isArray(data) ? data : []);
  };

  const handleCreateCategory = async () => {
    if (!newName) return;
    await createCategory(newName);
    setNewName('');
    setShowForm(false);
    loadCategories();
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Удалить категорию?')) {
      await deleteCategory(id);
      loadCategories();
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Категории</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Отмена' : '+ Новая категория'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3>Новая категория</h3>
          <div className="form-group">
            <label>Название категории</label>
            <input 
              type="text" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Например: Работа, Учеба, Спорт"
            />
          </div>
          <button className="btn btn-success" onClick={handleCreateCategory}>
            Создать категорию
          </button>
        </div>
      )}

      <div className="stats-grid">
        {categories.map(cat => (
          <div key={cat.id} className="stat-card">
            <h3>{cat.name}</h3>
            <p>Задач: {cat.tasks_count || 0}</p>
            <button 
              className="btn btn-danger btn-small" 
              onClick={() => handleDeleteCategory(cat.id)}
              style={{ marginTop: '10px' }}
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const data = await getNotifications();
    setNotifications(Array.isArray(data) ? data : []);
  };

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    loadNotifications();
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Уведомления</h1>
        {notifications.some(n => !n.is_read) && (
          <button className="btn btn-primary" onClick={handleMarkAllRead}>
            Отметить все
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center">
          <p>Нет уведомлений</p>
        </div>
      ) : (
        notifications.map(n => (
          <div 
            key={n.id} 
            className={`notification-item ${!n.is_read ? 'unread' : ''}`} 
            onClick={() => !n.is_read && handleMarkRead(n.id)}
          >
            <p>{n.message}</p>
            <div className="notification-date">
              {new Date(n.created_at).toLocaleString('ru-RU')}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const data = await getDashboard();
    setStats(data);
  };

  if (!stats) return <div className="container">Загрузка...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>Дашборд</h1>

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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuth) {
      const loadUnreadCount = async () => {
        const data = await getNotifications();
        if (Array.isArray(data)) {
          const unread = data.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        }
      };
      loadUnreadCount();
    }
  }, [isAuth, page]);

  if (!isAuth) {
    if (page === 'register') {
      return <Register onRegister={() => setIsAuth(true)} />;
    }
    return <Login onLogin={() => setIsAuth(true)} />;
  }

  return (
    <div>
      <div className="navbar">
        <span className="navbar-brand">TimeWise</span>
        <div className="navbar-menu">
          <button 
            className={page === 'dashboard' ? 'active' : ''}
            onClick={() => setPage('dashboard')}
          >
            Главная
          </button>
          <button 
            className={page === 'tasks' ? 'active' : ''}
            onClick={() => setPage('tasks')}
          >
            Задачи
          </button>
          <button 
            className={page === 'categories' ? 'active' : ''}
            onClick={() => setPage('categories')}
          >
            Категории
          </button>
          <button 
            className={page === 'notifications' ? 'active' : ''}
            onClick={() => setPage('notifications')}
          >
            Уведомления {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          <button 
            style={{ backgroundColor: '#e74c3c' }}
            onClick={() => { localStorage.removeItem('token'); setIsAuth(false); }}
          >
            Выйти
          </button>
        </div>
      </div>

      {page === 'dashboard' && <Dashboard />}
      {page === 'tasks' && <Tasks />}
      {page === 'categories' && <Categories />}
      {page === 'notifications' && <Notifications />}
    </div>
  );
}

export default App;