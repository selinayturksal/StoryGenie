import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Lazy load pages
const Login       = React.lazy(() => import('./pages/Login'));
const Register    = React.lazy(() => import('./pages/Register'));
const CreateStory = React.lazy(() => import('./pages/CreateStory'));
const MyStories   = React.lazy(() => import('./pages/MyStories'));
const Explore     = React.lazy(() => import('./pages/Explore'));
const Dashboard   = React.lazy(() => import('./pages/Dashboard'));
const StoryView   = React.lazy(() => import('./pages/StoryView'));
const StoryReader = React.lazy(() => import('./pages/StoryReader'));

function AppShell() {
  return (
    <>
      <Navbar />
      <React.Suspense fallback={
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
          <div className="spinner" />
        </div>
      }>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/explore"  element={<Explore />} />

          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute><CreateStory /></ProtectedRoute>
          } />
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
      <LangProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  );
}
