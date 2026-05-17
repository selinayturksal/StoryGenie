import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';

// Sayfalar gecikmeli yüklenir
const Login          = React.lazy(() => import('./pages/Login'));
const Register       = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword  = React.lazy(() => import('./pages/ResetPassword'));
const CreateStory    = React.lazy(() => import('./pages/CreateStory'));
const MyStories      = React.lazy(() => import('./pages/MyStories'));
const Explore        = React.lazy(() => import('./pages/Explore'));
const Dashboard      = React.lazy(() => import('./pages/Dashboard'));
const StoryView      = React.lazy(() => import('./pages/StoryView'));
const StoryReader    = React.lazy(() => import('./pages/StoryReader'));
const Settings       = React.lazy(() => import('./pages/Settings'));
const Profile        = React.lazy(() => import('./pages/Profile'));
const Favorites               = React.lazy(() => import('./pages/Favorites'));
const ConfirmPasswordChange   = React.lazy(() => import('./pages/ConfirmPasswordChange'));

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <div className="spinner" />
  </div>
);

/* Giriş yapmamış kullanıcılara LandingPage, giriş yapmışlara CreateStory göster */
function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) return (
    <React.Suspense fallback={<Spinner />}>
      <CreateStory />
    </React.Suspense>
  );
  return <LandingPage />;
}

function AppShell() {
  return (
    <>
      <Navbar />
      <React.Suspense fallback={<Spinner />}>
        <Routes>
          {/* Home: landing for guests, story creator for users */}
          <Route path="/" element={<HomeRoute />} />

          {/* Public routes */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password"        element={<ForgotPassword />} />
          <Route path="/reset-password/:token"          element={<ResetPassword />} />
          <Route path="/confirm-password-change/:token" element={<ConfirmPasswordChange />} />
          <Route path="/explore"               element={<Explore />} />

          {/* Protected routes */}
          <Route path="/my-stories" element={
            <ProtectedRoute><MyStories /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/story/:id" element={
            <ProtectedRoute><StoryReader /></ProtectedRoute>
          } />
          <Route path="/story-view" element={
            <ProtectedRoute><StoryView /></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><Settings /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/favorites" element={
            <ProtectedRoute><Favorites /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LangProvider>
          <AuthProvider>
            <AppShell />
          </AuthProvider>
        </LangProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}