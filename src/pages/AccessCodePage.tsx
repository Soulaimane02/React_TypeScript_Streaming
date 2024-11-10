import React, { useState } from 'react';
import { useAccess } from './AccesProvider';
import { useNavigate } from 'react-router-dom';

const AccessCodePage: React.FC = () => {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { grantAccess } = useAccess();
  const navigate = useNavigate();

  const acces_code = process.env.REACT_APP_SECRET_ACCES_CODE as string;

  const correctCode = acces_code; 

  const handleAccess = () => {
    if (inputCode === correctCode) {
      grantAccess();
      navigate('/login'); // Redirige vers la page de connexion
    } else {
      setError("Code d'accès incorrect");
    }
  };

  return (
    <div>
      <h2>Entrer le Code d'Accès</h2>
      <input
        type="text"
        value={inputCode}
        onChange={(e) => setInputCode(e.target.value)}
        placeholder="Code d'accès"
      />
      <button onClick={handleAccess}>Valider</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AccessCodePage;
