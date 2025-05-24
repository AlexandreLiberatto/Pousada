import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState(null);
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
                const myProfileResponse = await ApiService.myProfile();
                setUser(myProfileResponse.user);
                const myBookingResponse = await ApiService.myBookings();
                setBookings(Array.isArray(myBookingResponse.bookings) ? myBookingResponse.bookings : []);
                Swal.close();
            } catch (error) {
                showError(error.response?.data?.message || error.message);
                setError(error.response?.data?.message || error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleLogout = () => {
        Swal.fire({
            title: 'Deseja Sair?',
            text: 'Você será desconectado da sua conta',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sim, sair',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                ApiService.logout();
                navigate("/home");
            }
        });
    };

    const handleEditProfile = () => {
        navigate('/edit-profile');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Pendente":
                return "#ffc107"; // amarelo
            case "Concluído":
                return "#28a745"; // verde
            case "Falhou":
                return "#dc3545"; // vermelho
            case "Reembolsado":
                return "#17a2b8"; // azul
            case "Revertido":
                return "#6c757d"; // cinza
            default:
                return "#6c757d";
        }
    };

    const getBookingStatusColor = (status) => {
        switch (status) {
            case "Reservado":
                return "#007bff"; // azul
            case "Check-in Realizado":
                return "#28a745"; // verde
            case "Check-out Realizado":
                return "#6c757d"; // cinza
            case "Cancelado":
                return "#dc3545"; // vermelho
            default:
                return "#6c757d";
        }
    };

    if (loading) return null; // O loader já está sendo mostrado pelo Swal

    return (
        <div style={{
            padding: window.innerWidth <= 768 ? '1rem' : '2rem',
            backgroundColor: '#f8f9fa',
            minHeight: '100vh'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {user && (
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '10px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden',
                        marginBottom: '2rem'
                    }}>
                        <div style={{
                            backgroundColor: '#4a90e2',
                            color: 'white',
                            padding: window.innerWidth <= 768 ? '1.5rem' : '2rem',
                            display: 'flex',
                            flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                            alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center',
                            justifyContent: 'space-between',
                            gap: window.innerWidth <= 768 ? '1rem' : '0'
                        }}>
                            <div>
                                <h2 style={{ 
                                    margin: 0, 
                                    fontSize: window.innerWidth <= 768 ? '1.5rem' : '1.8rem',
                                    color: '#ffffff',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                                    fontWeight: '600',
                                    letterSpacing: '0.5px'
                                }}>Bem Vindo, {user.firstName}!</h2>
                                <p style={{ 
                                    margin: '0.5rem 0 0 0',
                                    color: '#E8F0FE',
                                    fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem',
                                    opacity: 0.95,
                                    textShadow: '1px 1px 1px rgba(0,0,0,0.1)',
                                    wordBreak: 'break-word'
                                }}>{user.email}</p>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                gap: '1rem',
                                flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                                width: window.innerWidth <= 768 ? '100%' : 'auto'
                            }}>
                                <button
                                    onClick={handleEditProfile}
                                    style={{
                                        backgroundColor: '#fff',
                                        color: '#4a90e2',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        fontWeight: '500',
                                        transition: 'all 0.3s',
                                        width: window.innerWidth <= 768 ? '100%' : 'auto'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}
                                >
                                    <i className="fas fa-user-edit" style={{ marginRight: '8px' }}></i>
                                    Visualizar Perfil
                                </button>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        color: '#fff',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        fontWeight: '500',
                                        transition: 'all 0.3s',
                                        width: window.innerWidth <= 768 ? '100%' : 'auto'
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                                >
                                    <i className="fas fa-sign-out-alt" style={{ marginRight: '8px' }}></i>
                                    Sair
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid #e9ecef'
                    }}>
                        <h3 style={{ margin: 0, color: '#2d3748' }}>
                            <i className="fas fa-history" style={{ marginRight: '10px', color: '#4a90e2' }}></i>
                            Histórico de Reservas
                        </h3>
                    </div>

                    <div style={{ padding: '1.5rem' }}>
                        {bookings && bookings.length > 0 ? (
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                {bookings.map((booking) => {
                                    let paymentStatus;
                                    switch (booking.paymentStatus) {
                                        case "PENDING":
                                            paymentStatus = "Pendente";
                                            break;
                                        case "COMPLETED":
                                            paymentStatus = "Concluído";
                                            break;
                                        case "FAILED":
                                            paymentStatus = "Falhou";
                                            break;
                                        case "REFUNDED":
                                            paymentStatus = "Reembolsado";
                                            break;
                                        case "REVERSED":
                                            paymentStatus = "Revertido";
                                            break;
                                        default:
                                            paymentStatus = booking.paymentStatus;
                                    }

                                    let bookingStatus;
                                    switch (booking.bookingStatus) {
                                        case "BOOKED":
                                            bookingStatus = "Reservado";
                                            break;
                                        case "CHECKED_IN":
                                            bookingStatus = "Check-in Realizado";
                                            break;
                                        case "CHECKED_OUT":
                                            bookingStatus = "Check-out Realizado";
                                            break;
                                        case "CANCELLED":
                                            bookingStatus = "Cancelado";
                                            break;
                                        default:
                                            bookingStatus = booking.bookingStatus;
                                    }

                                    let roomType;
                                    switch (booking.room.type) {
                                        case "SINGLE":
                                            roomType = "Solteiro";
                                            break;
                                        case "DOUBLE":
                                            roomType = "Duplo";
                                            break;
                                        case "TRIPLE":
                                            roomType = "Triplo";
                                            break;
                                        case "SUIT":
                                            roomType = "Suíte";
                                            break;
                                        default:
                                            roomType = booking.room.type;
                                    }

                                    return (
                                        <div key={booking.id} style={{
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '8px',
                                            padding: window.innerWidth <= 768 ? '1rem' : '1.5rem',
                                            display: 'grid',
                                            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 2fr',
                                            gap: window.innerWidth <= 768 ? '1rem' : '1.5rem'
                                        }}>
                                            <div>
                                                <img 
                                                    src={booking.room && booking.room.id 
                                                        ? `${process.env.REACT_APP_API_BACKEND || ''}/api/rooms/${booking.room.id}/image`
                                                        : "/images/no-image.png"}
                                                    alt="Room"
                                                    style={{
                                                        width: '100%',
                                                        height: window.innerWidth <= 768 ? '150px' : '200px',
                                                        objectFit: 'cover',
                                                        borderRadius: '4px'
                                                    }}
                                                    onError={e => {e.target.onerror=null; e.target.src="/images/no-image.png";}}
                                                />
                                            </div>
                                            <div>
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <p style={{ 
                                                        margin: '0 0 0.5rem 0',
                                                        fontSize: '1.1rem',
                                                        color: '#2d3748'
                                                    }}>
                                                        <strong>Código da Reserva:</strong> {booking.bookingReference}
                                                    </p>
                                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                        <span style={{
                                                            backgroundColor: getStatusColor(paymentStatus),
                                                            color: '#fff',
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '999px',
                                                            fontSize: '0.875rem'
                                                        }}>
                                                            {paymentStatus}
                                                        </span>
                                                        <span style={{
                                                            backgroundColor: getBookingStatusColor(bookingStatus),
                                                            color: '#fff',
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '999px',
                                                            fontSize: '0.875rem'
                                                        }}>
                                                            {bookingStatus}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div style={{ 
                                                    display: 'grid', 
                                                    gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr',
                                                    gap: '1rem'
                                                }}>
                                                    <div>
                                                        <p style={{ margin: '0 0 0.5rem 0', color: '#718096' }}>
                                                            <i className="fas fa-calendar-check" style={{ marginRight: '8px', color: '#4a90e2' }}></i>
                                                            Check-in
                                                        </p>
                                                        <p style={{ margin: 0, color: '#2d3748' }}>
                                                            {new Date(booking.checkInDate).toLocaleDateString('pt-BR')}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: '0 0 0.5rem 0', color: '#718096' }}>
                                                            <i className="fas fa-calendar-minus" style={{ marginRight: '8px', color: '#4a90e2' }}></i>
                                                            Check-out
                                                        </p>
                                                        <p style={{ margin: 0, color: '#2d3748' }}>
                                                            {new Date(booking.checkOutDate).toLocaleDateString('pt-BR')}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: '0 0 0.5rem 0', color: '#718096' }}>
                                                            <i className="fas fa-bed" style={{ marginRight: '8px', color: '#4a90e2' }}></i>
                                                            Quarto
                                                        </p>
                                                        <p style={{ margin: 0, color: '#2d3748' }}>
                                                            {roomType} - Nº {booking.room.roomNumber}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: '0 0 0.5rem 0', color: '#718096' }}>
                                                            <i className="fas fa-tag" style={{ marginRight: '8px', color: '#4a90e2' }}></i>
                                                            Valor Total
                                                        </p>
                                                        <p style={{ margin: 0, color: '#2d3748', fontWeight: '600' }}>
                                                            R$ {booking.totalPrice.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: '3rem',
                                color: '#718096'
                            }}>
                                <i className="fas fa-calendar-times" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#cbd5e0' }}></i>
                                <p style={{ margin: 0 }}>Nenhuma reserva encontrada.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
