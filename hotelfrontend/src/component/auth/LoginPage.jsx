import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import Swal from "sweetalert2";

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const {email, password} = formData;

    if (!email || !password) {
        setError("Por favor, preencha todas os campos");
        setTimeout(() => setError(""), 5000);
        
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

    // Mostrar indicador de carregamento
    Swal.fire({
        title: 'Autenticando...',
        text: 'Verificando suas credenciais',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const {status, token, role} = await ApiService.loginUser(formData);
        if (status === 200) {
            ApiService.saveToken(token)
            ApiService.saveRole(role)
            
            // Fechar o indicador de carregamento e mostrar mensagem de sucesso
            Swal.fire({
                icon: 'success',
                title: 'Login realizado com sucesso!',
                text: 'Você será redirecionado em instantes...',
                timer: 1500,
                timerProgressBar: true,
                showConfirmButton: false
            }).then(() => {
                navigate(redirectPath, {replace: true})
            });
        }
        
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        setError(errorMsg);
        setTimeout(() => setError(""), 5000);
        
        // Mostrar mensagem de erro
        Swal.fire({
            icon: 'error',
            title: 'Falha no login',
            text: errorMsg || 'Ocorreu um erro ao tentar fazer login. Verifique suas credenciais.',
            confirmButtonColor: '#d33',
            footer: errorMsg.toLowerCase().includes('senha') || 
                   errorMsg.toLowerCase().includes('password') ? 
                   '<a href="/forgot-password" style="color: #007F86; font-weight: bold;">Esqueceu sua senha?</a>' : ''
        });
    }
  }

  return(
    <div className="auth-container">
        {error && (<p className="error-message" style={{display: 'none'}}>{error}</p>)}

        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Email: </label>
                <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => {
                        handleChange(e);
                        
                        // Feedback visual em tempo real para o formato do email
                        if (e.target.value && e.target.value.length > 5) {
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (!emailRegex.test(e.target.value)) {
                                // Opcional: mostrar um toast sutil para feedback em tempo real
                                const Toast = Swal.mixin({
                                    toast: true,
                                    position: 'top-end',
                                    showConfirmButton: false,
                                    timer: 2000,
                                    timerProgressBar: true
                                });
                                
                                Toast.fire({
                                    icon: 'warning',
                                    title: 'Formato de email inválido'
                                });
                            }
                        }
                    }}
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
