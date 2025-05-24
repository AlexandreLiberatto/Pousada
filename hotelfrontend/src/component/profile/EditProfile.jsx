import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const EditProfilePage = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const showLoader = () => {
        Swal.fire({
            title: 'Carregando Perfil',
            html: 'Buscando suas informações...',
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
            },
            allowOutsideClick: false
        });
    };

    const showError = (message) => {
        Swal.fire({
            icon: 'error',
            title: 'Ops!',
            text: message,
            confirmButtonColor: '#dc3545'
        });
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            showLoader();
            try {
                const response = await ApiService.myProfile();
                setUser(response.user);
                Swal.close();
            } catch (error) {
                showError(error.message);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleDeleteProfile = async () => {
        const result = await Swal.fire({
            title: 'Tem certeza?',
            html: `
                <p>Você está prestes a excluir sua conta permanentemente.</p>
                <ul style="text-align: left; list-style: none;">
                    <li>❌ Perderá acesso ao seu perfil</li>
                    <li>❌ Perderá histórico de reservas</li>
                    <li>❌ Esta ação não pode ser desfeita</li>
                </ul>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sim, excluir conta',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                await ApiService.deleteAccount();
                Swal.fire({
                    icon: 'success',
                    title: 'Conta Excluída',
                    text: 'Sua conta foi excluída com sucesso.',
                    confirmButtonColor: '#28a745'
                }).then(() => {
                    navigate('/signup');
                });
            } catch (error) {
                showError(error.response?.data?.message || error.message);
                setError(error.response?.data?.message || error.message);
            }
        }
    };

    if (loading) return null; // O loader já está sendo mostrado pelo Swal

    return (
        <div style={{
            minHeight: '80vh',
            padding: window.innerWidth <= 768 ? '1rem' : '2rem',
            backgroundColor: '#f8f9fa'
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                backgroundColor: '#fff',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
            }}>
                <div style={{
                    backgroundColor: '#4a90e2',
                    color: 'white',
                    padding: window.innerWidth <= 768 ? '1.25rem' : '1.5rem',
                    textAlign: 'center'
                }}>
                    <h2 style={{ 
                        margin: 0, 
                        fontSize: window.innerWidth <= 768 ? '1.5rem' : '1.8rem',
                        color: '#ffffff',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                        fontWeight: '600',
                        letterSpacing: '0.5px'
                    }}>Seu Perfil</h2>
                </div>

                {error && (
                    <div style={{
                        padding: '1rem',
                        margin: window.innerWidth <= 768 ? '0.75rem' : '1rem',
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem'
                    }}>
                        {error}
                    </div>
                )}

                {user && (
                    <div style={{ 
                        padding: window.innerWidth <= 768 ? '1rem' : '2rem'
                    }}>
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                            borderRadius: '8px',
                            marginBottom: '2rem'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                                alignItems: window.innerWidth <= 768 ? 'center' : 'flex-start',
                                marginBottom: '2rem',
                                textAlign: window.innerWidth <= 768 ? 'center' : 'left',
                                gap: window.innerWidth <= 768 ? '1rem' : '0'
                            }}>
                                <div style={{
                                    width: window.innerWidth <= 768 ? '70px' : '80px',
                                    height: window.innerWidth <= 768 ? '70px' : '80px',
                                    backgroundColor: '#4a90e2',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: window.innerWidth <= 768 ? '0' : '1.5rem',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    <span style={{ 
                                        fontSize: window.innerWidth <= 768 ? '1.75rem' : '2rem', 
                                        color: 'white',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                                    }}>
                                        {`${user.firstName[0]}${user.lastName[0]}`}
                                    </span>
                                </div>
                                <div>
                                    <h3 style={{ 
                                        margin: '0 0 0.5rem 0', 
                                        color: '#2d3748',
                                        fontSize: window.innerWidth <= 768 ? '1.3rem' : '1.5rem'
                                    }}>
                                        {user.firstName} {user.lastName}
                                    </h3>
                                    <p style={{ 
                                        margin: 0, 
                                        color: '#718096',
                                        fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem'
                                    }}>Membro desde {new Date().getFullYear()}</p>
                                </div>
                            </div>

                            <div style={{ 
                                display: 'grid', 
                                gap: window.innerWidth <= 768 ? '1.25rem' : '1.5rem'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center',
                                    flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                                    gap: window.innerWidth <= 768 ? '0.5rem' : '0'
                                }}>
                                    <i className="fas fa-envelope" style={{ 
                                        color: '#4a90e2', 
                                        marginRight: window.innerWidth <= 768 ? '0' : '1rem',
                                        width: '20px',
                                        textAlign: 'center'
                                    }}></i>
                                    <div>
                                        <small style={{ 
                                            color: '#718096',
                                            fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.875rem'
                                        }}>E-mail</small>
                                        <p style={{ 
                                            margin: '0.25rem 0 0 0', 
                                            color: '#2d3748',
                                            fontSize: window.innerWidth <= 768 ? '0.95rem' : '1rem',
                                            wordBreak: 'break-word'
                                        }}>{user.email}</p>
                                    </div>
                                </div>

                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center',
                                    flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                                    gap: window.innerWidth <= 768 ? '0.5rem' : '0'
                                }}>
                                    <i className="fas fa-phone" style={{ 
                                        color: '#4a90e2', 
                                        marginRight: window.innerWidth <= 768 ? '0' : '1rem',
                                        width: '20px',
                                        textAlign: 'center'
                                    }}></i>
                                    <div>
                                        <small style={{ 
                                            color: '#718096',
                                            fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.875rem'
                                        }}>Telefone</small>
                                        <p style={{ 
                                            margin: '0.25rem 0 0 0', 
                                            color: '#2d3748',
                                            fontSize: window.innerWidth <= 768 ? '0.95rem' : '1rem'
                                        }}>{user.phoneNumber}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ 
                            textAlign: 'center', 
                            borderTop: '1px solid #e2e8f0', 
                            paddingTop: window.innerWidth <= 768 ? '1.5rem' : '2rem'
                        }}>
                            <button 
                                onClick={handleDeleteProfile}
                                style={{
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    fontSize: window.innerWidth <= 768 ? '0.95rem' : '1rem',
                                    transition: 'all 0.3s ease',
                                    width: window.innerWidth <= 768 ? '100%' : 'auto',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    fontWeight: '600'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#c82333';
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = '#dc3545';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                }}
                            >
                                <i className="fas fa-trash-alt" style={{ marginRight: '8px' }}></i>
                                Excluir Conta
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditProfilePage;
