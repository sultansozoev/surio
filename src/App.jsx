import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Series from './pages/Series';
import MyList from './pages/MyList';
import Watch from './pages/Watch';
import Search from './pages/Search';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import RequestContent from './pages/RequestContent';
import RequestsPage from './pages/AllRequestsList';
import LoginModal from './components/auth/LoginModal';
import './styles/index.css';

const ProtectedRoute = ({ children, onOpenLogin }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl animate-pulse">Caricamento...</div>
            </div>
        );
    }

    if (!user) {
        if (onOpenLogin) {
            onOpenLogin();
        }
        return <Navigate to="/" replace />;
    }

    return children;
};

function AppContent() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const handleOpenLogin = () => {
        console.log('Opening login modal');
        setIsLoginModalOpen(true);
    };

    const handleCloseLogin = () => {
        console.log('Closing login modal');
        setIsLoginModalOpen(false);
    };

    return (
        <>
            <Routes>
                {/* Public Routes - con Layout completo */}
                <Route
                    path="/"
                    element={
                        <Layout onOpenLogin={handleOpenLogin}>
                            <Home />
                        </Layout>
                    }
                />
                <Route
                    path="/movies"
                    element={
                        <Layout onOpenLogin={handleOpenLogin}>
                            <Movies />
                        </Layout>
                    }
                />
                <Route
                    path="/series"
                    element={
                        <Layout onOpenLogin={handleOpenLogin}>
                            <Series />
                        </Layout>
                    }
                />
                <Route
                    path="/search"
                    element={
                        <Layout onOpenLogin={handleOpenLogin}>
                            <Search />
                        </Layout>
                    }
                />

                {/* Login page - senza Layout */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */
                }
                <Route
                    path="/request"
                    element={
                        <ProtectedRoute onOpenLogin={handleOpenLogin}>
                            <Layout onOpenLogin={handleOpenLogin}>
                                <RequestContent />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/requests"
                    element={
                        <ProtectedRoute onOpenLogin={handleOpenLogin}>
                            <Layout onOpenLogin={handleOpenLogin}>
                                <RequestsPage />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/my-list"
                    element={
                        <ProtectedRoute onOpenLogin={handleOpenLogin}>
                            <Layout onOpenLogin={handleOpenLogin}>
                                <MyList />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* Watch page - senza navbar/footer (fullscreen) */}
                <Route
                    path="/watch/:type/:id"
                    element={
                        <ProtectedRoute onOpenLogin={handleOpenLogin}>
                            <Layout onOpenLogin={handleOpenLogin}>
                                <Watch />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

                {/* 404 */}
                <Route
                    path="*"
                    element={
                        <Layout onOpenLogin={handleOpenLogin}>
                            <NotFound />
                        </Layout>
                    }
                />
            </Routes>

            {/* Login Modal */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={handleCloseLogin}
            />
        </>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;