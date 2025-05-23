import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";

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

    const handleInputChange = ({ target: { name, value } }) =>
        setFormData((prev) => ({ ...prev, [name]: value }));

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const isFormValid = Object.values(formData).every((field) => field.trim());

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) {
            setMessage({ type: "error", text: "Por favor preencha todos os campos" });
            setTimeout(() => setMessage({}), 5000);
            return;
        }
        try {
            const resp = await ApiService.registerUser(formData);
            if (resp.status === 200) {
                setMessage({ type: "success", text: "Usuário registrado com sucesso" });
                setTimeout(() => navigate("/login"), 3000);
            }
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || error.message
            });
            setTimeout(() => setMessage({}), 5000);
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
            {message.text && <p className={`${message.type}-message`}>{message.text}</p>}

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
