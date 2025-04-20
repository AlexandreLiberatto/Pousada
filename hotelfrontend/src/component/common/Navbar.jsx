import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import ApiService from "../../service/ApiService";



function Navbar() {
    const isAuthenticated = ApiService.isAthenticated();
    const isCustomer = ApiService.isCustomer();
    const isAdmin = ApiService.isAdmin();

    const navigate = useNavigate();

    const handleLogout = () => {
        const isLogout = window.confirm("Tem certeza de que deseja sair?")
        if (isLogout) {
            ApiService.logout();
            navigate("/home");
        }
    }

    return(
        <nav className="navbar">
            <div className="navbar-brand">
                <NavLink to="/home"> Quinta do Ypuã </NavLink>
            </div>

            <ul className="navbar-ul">
                <li><NavLink to={"/home"} activeClassname="active">Inicio</NavLink></li>
                <li><NavLink to={"/rooms"} activeClassname="active">Quartos</NavLink></li>
                <li><NavLink to={"/find-booking"} activeClassname="active">Ver Minhas Reservas</NavLink></li>

                { isCustomer && <li><NavLink to={"/profile"} activeClassname="active">Perfil</NavLink></li>}
                {isAdmin && <li><NavLink to={"/admin"} activeClassname="active">Administrador</NavLink></li>}

                {!isAuthenticated && <li><NavLink to={"/login"} activeClassname="active">Conecte-se</NavLink></li>}
                {!isAuthenticated && <li><NavLink to={"/register"} activeClassname="active">Registrar</NavLink></li>}

                {isAuthenticated && <li onClick={handleLogout}>Sair</li>}
            </ul>
        </nav>
    )
}

export default Navbar;