import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import Swal from "sweetalert2";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phoneNumber: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const navigate = useNavigate();

    const handleInputChange = ({ target: { name, value } }) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        
        // Validação do email durante a digitação
        if (name === "email" && value.trim() !== "") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value) && value.length > 5) {
                // Mostrar toast apenas se o email parece estar sendo digitado (com mais de 5 caracteres)
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
                
                Toast.fire({
                    icon: 'warning',
                    title: 'Email inválido',
                    text: 'Por favor, insira um email válido'
                });
            }
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
        
        // Toast para indicar mudança na visibilidade da senha
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true
        });
        
        Toast.fire({
            icon: 'info',
            title: showPassword ? 'Senha oculta' : 'Senha visível'
        });
    };

    const isFormValid = Object.values(formData).every((field) => field.trim());

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) {
            setMessage({ type: "error", text: "Por favor preencha todos os campos" });
            setTimeout(() => setMessage({}), 5000);
            
            // Alerta visual para campos vazios
            Swal.fire({
                icon: 'error',
                title: 'Campos obrigatórios',
                text: 'Por favor, preencha todos os campos',
                confirmButtonColor: '#d33',
                timer: 5000,
                timerProgressBar: true
            });
            return;
        }
        
        // Validação básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setMessage({ type: "error", text: "Por favor, digite um endereço de email válido" });
            setTimeout(() => setMessage({}), 5000);
            
            Swal.fire({
                icon: 'warning',
                title: 'Email inválido',
                text: 'Por favor, digite um endereço de email válido',
                confirmButtonColor: '#f8bb86'
            });
            return;
        }
        
        // Mostrar indicador de carregamento
        Swal.fire({
            title: 'Processando...',
            text: 'Registrando sua conta',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        try {
            const resp = await ApiService.registerUser(formData);
            if (resp.status === 200) {
                setMessage({ type: "success", text: "Usuário registrado com sucesso" });
                
                // Fechar o indicador de carregamento e mostrar mensagem de sucesso
                Swal.fire({
                    icon: 'success',
                    title: 'Registro concluído!',
                    text: 'Usuário registrado com sucesso. Você será redirecionado para a página de login em instantes.',
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false
                }).then(() => {
                    navigate("/login");
                });
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            setMessage({
                type: "error",
                text: errorMsg
            });
            setTimeout(() => setMessage({}), 5000);
            
            // Mostrar mensagem de erro
            Swal.fire({
                icon: 'error',
                title: 'Falha no registro',
                text: errorMsg || 'Ocorreu um erro ao registrar o usuário. Tente novamente.',
                confirmButtonColor: '#d33'
            });
        }
    };

    const fieldLabels = {
        firstName: "Nome",
        lastName: "Sobrenome",
        email: "E-mail",
        phoneNumber: "Número de telefone",
        password: "Senha"
    };

    return (
        <div className="auth-container">
            {message.text && <p className={`${message.type}-message`} style={{display: 'none'}}>{message.text}</p>}

            <h2>Registrar</h2>
            <form onSubmit={handleSubmit}>
                {Object.keys(fieldLabels).map((field) => (
                    <div className="form-group" key={field}>
                        <label>{fieldLabels[field]}:</label>
                        {field === "password" ? (
                            <div style={{ position: 'relative', width: '90%' }}>
                                <input
                                    style={{ width: '100%' }}
                                    type={showPassword ? "text" : "password"}
                                    name={field}
                                    value={formData[field]}
                                    onChange={handleInputChange}
                                    required
                                />
                                <button 
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0',
                                        color: '#666'
                                    }}
                                >
                                    {showPassword ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>
                        ) : (
                            <input
                                type={field === "email" ? "email" : "text"}
                                name={field}
                                value={formData[field]}
                                onChange={handleInputChange}
                                required
                            />
                        )}
                    </div>
                ))}
                <button type="submit">Registrar</button>
            </form>
            <p className="register-link">
                Já tem uma conta? <a href="/login">Conecte-se</a>
            </p>
        </div>
    );
};

export default RegisterPage;
