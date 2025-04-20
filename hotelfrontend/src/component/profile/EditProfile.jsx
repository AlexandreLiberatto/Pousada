import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';

const EditProfilePage = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await ApiService.myProfile();
                setUser(response.user);
                console.log(response.user)
            } catch (error) {
                setError(error.message);
            }
        };

        fetchUserProfile();
    }, []);

    const handleDeleteProfile = async () => {
        if (!window.confirm('Tem certeza de que deseja excluir sua conta? Se você excluir sua conta, perderá o acesso ao seu perfil e ao histórico de reservas.')) {
            return;
        }
        try {
            await ApiService.deleteAccount();
            navigate('/signup');
        } catch (error) {
            setError(error.response?.data?.message || error.message);
        }
    };

    return (
        <div className="edit-profile-page">
            <h2>Editar Perfil</h2>
            {error && <p className="error-message">{error}</p>}
            {user && (
                <div className="profile-details">
                    <p><strong>Nome:</strong> {user.firstName}</p>
                    <p><strong>Sobrenome:</strong> {user.lastName}</p>
                    <p><strong>E-mail:</strong> {user.email}</p>
                    <p><strong>Número de Telefone:</strong> {user.phoneNumber}</p>
                    <button className="delete-profile-button" onClick={handleDeleteProfile}>Excluir Minha Conta</button>
                </div>
            )}
        </div>
    );
};

export default EditProfilePage;
