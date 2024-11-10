import React, { useState } from 'react';
import './login.css';
import { useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ip = process.env.REACT_APP_SECRET_IP as string;

interface LoginForm {
  mail: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null); 
  const [formValue, setFormValue] = useState<LoginForm>({
    mail: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false); // État pour afficher/masquer le mot de passe
  const location = useLocation();
  const message = location.state?.message; 

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const req_login = await fetch(`http://${ip}:3001/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mail: formValue.mail,
          password: formValue.password
        })
      });

      const responseJson = await req_login.json();

      if (req_login.ok && responseJson.token) {
        localStorage.setItem('token', responseJson.token);
        window.location.href = '/';
      } else if (responseJson.error) {
        setError(`Erreur de l'API : ${responseJson.error}`);
      } else {
        setError("Erreur inconnue. Veuillez vérifier vos identifiants.");
      }
    } catch (error) {
      setError("Erreur de réseau ou problème de serveur. Veuillez réessayer plus tard.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValue({
      ...formValue,
      [name]: value,
    });
  };

  return (
    <div className='bodyy'>
      <div className="login-container">
        <div className="logo">MaxHome</div>
        <h1>Se Connecter</h1>
        <form id="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input 
              type="text" 
              id="email" 
              name="mail" 
              placeholder="Email" 
              value={formValue.mail} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div className="input-group">
            <input 
              type={showPassword ? "text" : "password"} // Afficher ou masquer le mot de passe
              id="password" 
              name="password" 
              placeholder="Mot de passe" 
              value={formValue.password} 
              onChange={handleInputChange} 
              required 
            />
            <span 
              className="toggle-password" 
              onClick={() => setShowPassword(!showPassword)} // Basculer l'état d'affichage du mot de passe
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button type="submit" className="login-button">Se Connecter</button>
        </form>
        {/* Affichage de l'erreur */}
        {error && <div className="error-message">{error}</div>}
        <div className="signup">
          Nouveau Membre sur MaxHome? <a href="/signup">S'inscrire</a>.
        </div>
        <div className="recaptcha">
          Cette page est protégée par Google reCAPTCHA pour s'assurer que vous n'êtes pas un bot. <a href="https://developers.google.com/recaptcha?hl=fr" target='_blank'>En savoir plus.</a>
          {message && <p style={{ color: 'red' }}>{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
