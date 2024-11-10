import React, { useState, FormEvent } from 'react';
import './signup.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ip = process.env.REACT_APP_SECRET_IP as string;

const Signup: React.FC = () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    const [error, setError] = useState<string | null>(null); 
    const [formValue, setFormValue] = useState<{
        name: string;
        first_name: string;
        date_of_birth: string;
        mail: string;
        password: string;
        confirmPassword: string; 
        profile_picture: File | string;
    }>({
        name: '',
        first_name: '',
        date_of_birth: '',
        mail: '',
        password: '',
        confirmPassword: '', 
        profile_picture: ''
    });

    const [showPassword, setShowPassword] = useState(false); 

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;

        if (name in formValue) {
            if (name === "profile_picture" && files && files.length > 0) {
                setFormValue(prevFormValue => ({
                    ...prevFormValue,
                    profile_picture: files[0]
                }));
            } else {
                setFormValue(prevFormValue => ({
                    ...prevFormValue,
                    [name]: value
                }));
            }
        } else {
            setError(`Le champ avec le nom "${name}" n'existe pas dans formValue`);
        }
    };
    
    const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null); 
    
        // Validation du mot de passe
        if (!passwordRegex.test(formValue.password)) {
            setError("Mot de passe invalide. Il doit contenir au moins une majuscule, une minuscule, un chiffre, un caractère spécial et faire au moins 8 caractères.");
            return;
        }
    
        if (formValue.password !== formValue.confirmPassword) { 
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
    
        if (!formValue.date_of_birth) {
            setError("La date de naissance est requise.");
            return;
        }
    
        const formData = new FormData();
        formData.append('name', formValue.name);
        formData.append('first_name', formValue.first_name);
        formData.append('date_of_birth', formValue.date_of_birth);
        formData.append('mail', formValue.mail);
        formData.append('password', formValue.password); 
        if (formValue.profile_picture) {
            formData.append('profile_picture', formValue.profile_picture); 
        }
    
        try {
            const register = await fetch(`http://${ip}:3001/auth/register`, {
                method: "POST",
                body: formData,
            });
    
            const responseJson = await register.json();
    
            if (register.ok && responseJson.token) {
                localStorage.setItem('token', responseJson.token);
                window.location.href = '/';
            } else if (responseJson.error) {
                setError(`Erreur de l'API : ${responseJson.error}`);
            } else {
                setError("Réponse inattendue du serveur.");
            }
        } catch (error) {
            setError("Erreur de réseau ou problème de serveur. Veuillez réessayer plus tard.");
        }
    };
    
    
    return (
        <div className='bodyy'>
            <div className="signup-container">
                <div className="background"></div>
                <div className="form-box">
                    <h1>Inscription</h1>
                    <form onSubmit={handleFormSubmit}>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            placeholder="Nom"
                            value={formValue.name}
                            onChange={handleInput}
                            required
                        />
                        <input
                            type="text"
                            name="first_name"
                            className="form-control"
                            placeholder="Prénom"
                            value={formValue.first_name}
                            onChange={handleInput}
                            required
                        />
                        <input
                            type="date"
                            name="date_of_birth"
                            className="form-control"
                            placeholder="Date de naissance"
                            value={formValue.date_of_birth}
                            onChange={handleInput}
                            required
                        />
                        <input
                            type="email"
                            name="mail"
                            className="form-control"
                            placeholder="Email"
                            value={formValue.mail}
                            onChange={handleInput}
                            required
                        />
                        <div className="password-container">
                            <input
                                type={showPassword ? "text" : "password"} 
                                name="password"
                                className="form-control"
                                placeholder="Mot de passe"
                                value={formValue.password}
                                onChange={handleInput}
                                required
                            />
                            <span 
                                className="toggle-password" 
                                onClick={() => setShowPassword(!showPassword)} 
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <div className="password-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                className="form-control"
                                placeholder="Confirmer le mot de passe"
                                value={formValue.confirmPassword}
                                onChange={handleInput}
                                required
                            />
                            <span 
                                className="toggle-password" 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <input
                            type="file"
                            name="profile_picture"
                            className="form-control"
                            accept="image/*"
                            onChange={handleInput}
                            required
                        />

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="btn-signup">S'inscrire</button>
                        <div className="recaptcha">
                            <button onClick={() => window.location.href = '/login'}>Vous avez un compte ?</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
