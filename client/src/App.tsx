import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { Search } from './pages/Search';
import { Activity } from './pages/Activity';
import { Messages } from './pages/Messages';
import { PostView } from './features/posts/components/PostView.tsx'; // <--- Nueva importación
import MainLayout from './components/layout/MainLayout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas Protegidas */}
          <Route path="/*" element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/activity" element={<Activity />} />
                  
                  {/* Ruta para ver el detalle de un hilo/post */}
                  <Route path="/post/:id" element={<PostView />} /> {/* <--- Ruta añadida */}
                  
                  {/* Definimos ambas rutas para Mensajes */}
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/messages/:username" element={<Messages />} />
                  
                  <Route path="/profile/:username" element={<Profile />} />
                  <Route path="/profile" element={<Navigate to="/" />} />
                  
                  {/* Si no coincide ninguna, redirigir al Home */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;