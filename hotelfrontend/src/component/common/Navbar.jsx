import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import ApiService from "../../service/ApiService";
import Swal from "sweetalert2";

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const isAuthenticated = ApiService.isAthenticated();
    const isCustomer = ApiService.isCustomer();
    const isAdmin = ApiService.isAdmin();
    const navigate = useNavigate();

    useEffect(() => {
        // Mostrar toast de boas-vindas
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            showClass: {
                popup: 'animate__animated animate__fadeInRight'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutRight'
            }
        });

        Toast.fire({
            icon: 'success',
            title: 'Bem-vindo à Quinta do Ypuã',
            text: isAuthenticated ? 'Navegue pelo menu para acessar as funcionalidades' : 'Faça login para acessar todas as funcionalidades'
        });

        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            
            // Fechar menu ao redimensionar para desktop
            if (!mobile && isMenuOpen) {
                setIsMenuOpen(false);
                
                // Feedback quando o menu é fechado por redimensionamento
                const ResizeToast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true
                });
                
                ResizeToast.fire({
                    icon: 'info',
                    title: 'Ajustando para visualização desktop'
                });
            }
        };
    
        // Verificação inicial
        handleResize();
    
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMenuOpen, isAuthenticated]); 

    const handleLogout = () => {
        Swal.fire({
            title: 'Tem certeza?',
            text: "Você será desconectado do sistema",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, sair',
            cancelButtonText: 'Cancelar',
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Mostrar indicador de carregamento
                Swal.fire({
                    title: 'Saindo...',
                    text: 'Finalizando sua sessão',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                // Executar o logout
                ApiService.logout();
                
                // Exibir mensagem de sucesso
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
                
                Toast.fire({
                    icon: 'success',
                    title: 'Logout realizado com sucesso',
                    text: 'Até logo!'
                });
                
                navigate("/home");
                setIsMenuOpen(false); // Fechar menu após logout
            }
        });
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        
        // Toast para feedback do menu
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
            showClass: {
                popup: 'animate__animated animate__fadeIn'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOut'
            }
        });
        
        if (!isMenuOpen) {
            Toast.fire({
                icon: 'info',
                title: 'Menu aberto'
            });
        } else {
            Toast.fire({
                icon: 'info',
                title: 'Menu fechado'
            });
        }
    };

    const closeMenu = () => {
        if (isMobile && isMenuOpen) {
            setIsMenuOpen(false);
            
            // Toast para feedback de fechamento do menu
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 800,
                timerProgressBar: true,
            });
            
            Toast.fire({
                icon: 'info',
                title: 'Navegando...'
            });
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <NavLink to="/home" onClick={closeMenu}>Quinta do Ypuã</NavLink>
            </div>

            {/* Botão do menu hamburguer apenas para mobile */}
            {isMobile && (
                <button 
                    className={`navbar-toggle ${isMenuOpen ? 'open' : ''}`}
                    onClick={() => {
                        toggleMenu();
                        
                        // Feedback tátil e visual aprimorado
                        if ('vibrate' in navigator) {
                            navigator.vibrate(50); // Vibração suave em dispositivos móveis
                        }
                        
                        // Toast com informação do menu
                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'top',
                            showConfirmButton: false,
                            timer: 1000,
                            timerProgressBar: true,
                            showClass: {
                                popup: 'animate__animated animate__fadeIn'
                            },
                            hideClass: {
                                popup: 'animate__animated animate__fadeOut'
                            }
                        });
                        
                        Toast.fire({
                            icon: 'info',
                            title: isMenuOpen ? 'Fechando menu...' : 'Abrindo menu...',
                            text: isAuthenticated ? 'Acesse todas as funcionalidades' : 'Faça login para mais opções'
                        });
                    }}
                    aria-label="Menu"
                    aria-expanded={isMenuOpen}
                    style={{
                        transition: 'transform 0.3s ease',
                        transform: isMenuOpen ? 'rotate(90deg)' : 'none'
                    }}
                >
                    <span className="hamburger-line" style={{
                        transition: 'all 0.3s ease',
                        transform: isMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
                    }}></span>
                    <span className="hamburger-line" style={{
                        transition: 'all 0.3s ease',
                        opacity: isMenuOpen ? 0 : 1
                    }}></span>
                    <span className="hamburger-line" style={{
                        transition: 'all 0.3s ease',
                        transform: isMenuOpen ? 'rotate(-45deg) translate(7px, -7px)' : 'none'
                    }}></span>
                </button>
            )}

            <ul className={`navbar-ul ${isMenuOpen ? 'active' : ''}`} style={{
                transition: 'all 0.3s ease',
                opacity: isMenuOpen ? 1 : isMobile ? 0 : 1,
                transform: isMenuOpen ? 'translateX(0)' : isMobile ? 'translateX(-100%)' : 'none'
            }}>
                <li>
                    <NavLink 
                        to="/home" 
                        className={({ isActive }) => isActive ? "active" : ""} 
                        onClick={closeMenu}
                        style={{
                            transition: 'all 0.3s ease',
                            position: 'relative'
                        }}
                    >
                        Inicio
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/rooms" 
                        className={({ isActive }) => isActive ? "active" : ""} 
                        onClick={closeMenu}
                        style={{
                            transition: 'all 0.3s ease',
                            position: 'relative'
                        }}
                    >
                        Quartos
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/find-booking" 
                        className={({ isActive }) => isActive ? "active" : ""} 
                        onClick={closeMenu}
                        style={{
                            transition: 'all 0.3s ease',
                            position: 'relative'
                        }}
                    >
                        Reservas
                    </NavLink>
                </li>

                {isCustomer && (
                    <li>
                        <NavLink 
                            to="/profile" 
                            className={({ isActive }) => isActive ? "active" : ""} 
                            onClick={closeMenu}
                            style={{
                                transition: 'all 0.3s ease',
                                position: 'relative'
                            }}
                        >
                            Perfil
                        </NavLink>
                    </li>
                )}
                
                {isAdmin && (
                    <li>
                        <NavLink 
                            to="/admin" 
                            className={({ isActive }) => isActive ? "active" : ""} 
                            onClick={closeMenu}
                            style={{
                                transition: 'all 0.3s ease',
                                position: 'relative'
                            }}
                        >
                            Administrador
                        </NavLink>
                    </li>
                )}

                {!isAuthenticated && (
                    <>
                        <li>
                            <NavLink 
                                to="/login" 
                                className={({ isActive }) => isActive ? "active" : ""} 
                                onClick={closeMenu}
                                style={{
                                    transition: 'all 0.3s ease',
                                    position: 'relative'
                                }}
                            >
                                Conecte-se
                            </NavLink>
                        </li>
                        <li>
                            <NavLink 
                                to="/register" 
                                className={({ isActive }) => isActive ? "active" : ""} 
                                onClick={closeMenu}
                                style={{
                                    transition: 'all 0.3s ease',
                                    position: 'relative'
                                }}
                            >
                                Registrar
                            </NavLink>
                        </li>
                    </>
                )}

                {isAuthenticated && (
                    <li>
                        <button 
                            onClick={handleLogout} 
                            className="logout-button"
                            style={{
                                transition: 'all 0.3s ease',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                letterSpacing: '0.5px'
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
                            Logout
                        </button>
                    </li>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;