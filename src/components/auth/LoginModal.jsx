import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username è obbligatorio';
        }

        if (!formData.password) {
            newErrors.password = 'Password è obbligatoria';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password deve essere almeno 6 caratteri';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Rimuovi errore quando l'utente inizia a digitare
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const result = await login(formData.username, formData.password);

            if (result.success) {
                onClose();
                setFormData({ username: '', password: '' });
            } else {
                setErrors({ general: result.message });
            }
        } catch (error) {
            setErrors({ general: 'Errore durante il login' });
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ username: '', password: '' });
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Accedi"
            className="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {errors.general && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {errors.general}
                    </div>
                )}

                <div>
                    <Input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        error={errors.username}
                        autoFocus
                        className="w-full"
                    />
                </div>

                <div>
                    <Input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        className="w-full"
                    />
                </div>

                <div className="flex flex-col space-y-3">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isLoading ? 'Accesso...' : 'Accedi'}
                    </Button>

                    <div className="text-center text-gray-600">
                        Non hai un account?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToRegister}
                            className="text-red-600 hover:underline font-medium"
                        >
                            Registrati
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default LoginModal;
