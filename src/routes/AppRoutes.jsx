// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Home from '../pages/Home';
import Movies from '../pages/Movies';
import Series from '../pages/Series';
import MyList from '../pages/MyList';
import ContentDetail from '../pages/ContentDetail';
import Watch from '../pages/Watch';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/series" element={<Series />} />
            <Route
                path="/my-list"
                element={
                    <ProtectedRoute>
                        <MyList />
                    </ProtectedRoute>
                }
            />
            <Route path="/content/:type/:id" element={<ContentDetail />} />
            <Route
                path="/watch/:type/:id"
                element={
                    <ProtectedRoute>
                        <Watch />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
