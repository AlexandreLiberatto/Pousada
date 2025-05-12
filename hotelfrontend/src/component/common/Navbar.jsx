import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import ApiService from "../../service/ApiService";

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const isAuthenticated = ApiService.isAthenticated();
    const isCustomer = ApiService.isCustomer();
    const isAdmin = ApiService.isAdmin();
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            // Fechar menu ao redimensionar para desktop
            if (!mobile && isMenuOpen) {
                setIsMenuOpen(false);
            }
        };
    
        // Verificação inicial
        handleResize();
    
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMenuOpen]); 

    const handleLogout = () => {
        const isLogout = window.confirm("Tem certeza de que deseja sair?");
        if (isLogout) {
            ApiService.logout();
            navigate("/home");
            setIsMenuOpen(false); // Fechar menu após logout
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        if (isMobile) {
            setIsMenuOpen(false);
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
                    onClick={toggleMenu}
                    aria-label="Menu"
                    aria-expanded={isMenuOpen}
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>
            )}

            <ul className={`navbar-ul ${isMenuOpen ? 'active' : ''}`}>
                <li><NavLink to="/home" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMenu}>Inicio</NavLink></li>
                <li><NavLink to="/rooms" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMenu}>Quartos</NavLink></li>
                <li><NavLink to="/find-booking" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMenu}>Ver Minhas Reservas</NavLink></li>

                {isCustomer && <li><NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMenu}>Perfil</NavLink></li>}
                {isAdmin && <li><NavLink to="/admin" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMenu}>Administrador</NavLink></li>}

                {!isAuthenticated && (
                    <>
                        <li><NavLink to="/login" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMenu}>Conecte-se</NavLink></li>
                        <li><NavLink to="/register" className={({ isActive }) => isActive ? "active" : ""} onClick={closeMenu}>Registrar</NavLink></li>
                    </>
                )}

                {isAuthenticated && (
                    <li>
                        <button onClick={handleLogout} className="logout-button">Logoff</button>
                    </li>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;