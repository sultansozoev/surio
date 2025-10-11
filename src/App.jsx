import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Series from './pages/Series';
import MyList from './pages/MyList';
import ContentDetail from './pages/ContentDetail';
import Watch from './pages/Watch';
import Search from './pages/Search';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import './styles/index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl animate-pulse">Caricamento...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Layout Component
const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-black">
            <Navbar />
            <main className="pt-16">
                {children}
            </main>
            <Footer />
        </div>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route
                        path="/"
                        element={
                            <Layout>
                                <Home />
                            </Layout>
                        }
                    />
                    <Route
                        path="/movies"
                        element={
                            <Layout>
                                <Movies />
                            </Layout>
                        }
                    />
                    <Route
                        path="/series"
                        element={
                            <Layout>
                                <Series />
                            </Layout>
                        }
                    />
                    <Route
                        path="/content/:type/:id"
                        element={
                            <Layout>
                                <ContentDetail />
                            </Layout>
                        }
                    />
                    <Route
                        path="/search"
                        element={
                            <Layout>
                                <Search />
                            </Layout>
                        }
                    />
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes */}
                    <Route
                        path="/my-list"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <MyList />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/watch/:type/:id"
                        element={
                            <ProtectedRoute>
                                <Watch />
                            </ProtectedRoute>
                        }
                    />

                    {/* 404 */}
                    <Route
                        path="*"
                        element={
                            <Layout>
                                <NotFound />
                            </Layout>
                        }
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;