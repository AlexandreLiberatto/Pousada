import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "../../service/ApiService";
import Swal from "sweetalert2";

function validatePasswordStrength(password) {
  // Pelo menos 8 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 caractere especial
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  return regex.test(password);
}

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { search } = useLocation();

  const token = new URLSearchParams(search).get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!newPassword || !confirmPassword) {
      setError("Preencha todos os campos.");
      
      // Alerta visual para campos vazios
      Swal.fire({
        icon: 'error',
        title: 'Campos obrigatórios',
        text: 'Por favor, preencha todos os campos.',
        confirmButtonColor: '#d33'
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      
      // Alerta visual para senhas diferentes
      Swal.fire({
        icon: 'error',
        title: 'Senhas diferentes',
        text: 'As senhas digitadas não coincidem.',
        confirmButtonColor: '#d33'
      });
      return;
    }
    if (!validatePasswordStrength(newPassword)) {
      setError("A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.");
      
      // Alerta visual para senha fraca
      Swal.fire({
        icon: 'warning',
        title: 'Senha fraca',
        text: 'A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.',
        confirmButtonColor: '#f8bb86'
      });
      return;
    }
    
    setLoading(true);
    
    // Mostrar indicador de carregamento
    Swal.fire({
      title: 'Processando...',
      text: 'Redefinindo sua senha',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    try {
      await ApiService.resetPassword(token, newPassword);
      setSuccess("Senha redefinida com sucesso! Redirecionando para login...");
      
      // Fechar o indicador de carregamento e mostrar mensagem de sucesso
      Swal.fire({
        icon: 'success',
        title: 'Senha redefinida!',
        text: 'Sua senha foi redefinida com sucesso. Você será redirecionado para a página de login.',
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false
      }).then(() => {
        navigate("/login", { replace: true });
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      
      // Mostrar mensagem de erro
      Swal.fire({
        icon: 'error',
        title: 'Falha na redefinição',
        text: errorMsg || 'Ocorreu um erro ao redefinir sua senha. O link pode ter expirado.',
        confirmButtonColor: '#d33',
        footer: '<a href="/forgot-password">Solicitar um novo link de redefinição</a>'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    // Mostrar alerta para token inválido
    setTimeout(() => {
      Swal.fire({
        icon: 'error',
        title: 'Token inválido',
        text: 'O token de redefinição de senha é inválido ou expirou.',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Solicitar novo link',
        showCancelButton: true,
        cancelButtonText: 'Voltar para login'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/forgot-password");
        } else {
          navigate("/login");
        }
      });
    }, 500);
    
    return <div className="auth-container"><p className="error-message">Token inválido ou expirado.</p></div>;
  }

  return (
    <div className="auth-container">
      <h2>Redefinir senha</h2>
      {success && <p className="success-message" style={{display: 'none'}}>{success}</p>}
      {error && <p className="error-message" style={{display: 'none'}}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nova senha:</label>
          <div style={{ position: 'relative', width: '90%' }}>
            <input
              style={{ width: '100%' }}
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={e => {
                setNewPassword(e.target.value);
                
                // Verificar força da senha enquanto digita (se tiver pelo menos 5 caracteres)
                if (e.target.value.length > 5) {
                  const isStrong = validatePasswordStrength(e.target.value);
                  const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                  });
                  
                  if (!isStrong) {
                    Toast.fire({
                      icon: 'warning',
                      title: 'Senha fraca',
                      text: 'Inclua maiúsculas, minúsculas, números e caracteres especiais'
                    });
                  } else {
                    Toast.fire({
                      icon: 'success',
                      title: 'Senha forte!'
                    });
                  }
                }
              }}
              required
            />
            <button 
              type="button"
              onClick={() => {
                setShowNewPassword(!showNewPassword);
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
                  title: showNewPassword ? 'Senha oculta' : 'Senha visível'
                });
              }}
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
              {showNewPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label>Confirmar senha:</label>
          <div style={{ position: 'relative', width: '90%' }}>
            <input
              style={{ width: '100%' }}
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={e => {
                setConfirmPassword(e.target.value);
                
                // Verificar se as senhas coincidem quando acabar de digitar
                if (newPassword && e.target.value.length >= newPassword.length) {
                  const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                  });
                  
                  if (e.target.value !== newPassword) {
                    Toast.fire({
                      icon: 'error',
                      title: 'Senhas não coincidem'
                    });
                  } else {
                    Toast.fire({
                      icon: 'success',
                      title: 'Senhas coincidem!'
                    });
                  }
                }
              }}
              required
            />
            <button 
              type="button"
              onClick={() => {
                setShowConfirmPassword(!showConfirmPassword);
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
                  title: showConfirmPassword ? 'Senha oculta' : 'Senha visível'
                });
              }}
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
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Redefinindo..." : "Redefinir"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
