import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { state } = useLocation();

  const redirectPath = state?.from?.pathname || "/home";

  //handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) =>{
    e.preventDefault()
    const {email, password} = formData;

    if (!email || !password) {
        setError("Por favor, preencha todas os campos")
        setTimeout(() => setError(""), 5000);
        return;
    }

    try {
        const {status, token, role} = await ApiService.loginUser(formData);
        if (status === 200) {
            ApiService.saveToken(token)
            ApiService.saveRole(role)
            navigate(redirectPath, {replace: true})
        }
        
    } catch (error) {
        setError(error.response?.data?.message || error.message)
        setTimeout(() => setError(""), 5000);
        
    }
  }

  return(
    <div className="auth-container">
        {error && (<p className="error-message">{error}</p>)}

        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Email: </label>
                <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label>Password: </label>
                <div style={{ position: 'relative', width: '90%' }}>
                    <input 
                        style={{ width: '100%' }}
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
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
            </div>
            <button type="submit">Login</button>
        </form>
        <p className="register-link"> Não tem uma conta? <a href="/register">Registrar</a></p>
        <p className={
          `register-link forgot-link` +
          (error && (
            error.toLowerCase().includes('senha incorreta') ||
            error.toLowerCase().includes('senha') ||
            error.toLowerCase().includes('password') ||
            error.toLowerCase().includes('incorret') ||
            error.toLowerCase().includes('incorrect')
          ) ? ' highlight-forgot' : '')
        }>
          <a href="/forgot-password" style={
            error && (
              error.toLowerCase().includes('senha incorreta') ||
              error.toLowerCase().includes('senha') ||
              error.toLowerCase().includes('password') ||
              error.toLowerCase().includes('incorret') ||
              error.toLowerCase().includes('incorrect')
            ) ? {
              color: '#fff',
              background: '#007F86',
              borderRadius: '6px',
              padding: '6px 16px',
              fontWeight: 'bold',
              boxShadow: '0 2px 12px rgb(66, 201, 32)',
              textDecoration: 'none',
              animation: 'pulse-forgot 1.2s infinite',
              marginLeft: 8,
              transition: 'all 0.2s',
            } : {}}
          >Esqueci minha senha</a>
        </p>
    </div>
  )
};

export default LoginPage;
