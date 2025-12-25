import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import View from './pages/View';
import Home from './pages/Home';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { TeamProvider } from './context/TeamContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <TeamProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/view" element={<View />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </TeamProvider>
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;
