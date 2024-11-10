import React, { useState } from 'react';
import './profilManagement.css'; 

const ProfilManagement: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState('profileSelection');
    const [profiles, setProfiles] = useState(['Utilisateur 1', 'Utilisateur 2', 'Utilisateur 3']);
    const [newProfileName, setNewProfileName] = useState('');

    const selectProfile = (profileName: string) => {
        alert(`Vous avez sélectionné le profil: ${profileName}`);
    };

    const showAddProfile = () => {
        setCurrentScreen('addProfile');
    };

    const showManageProfiles = () => {
        setCurrentScreen('manageProfiles');
    };

    const showProfileSelection = () => {
        setCurrentScreen('profileSelection');
    };

    const saveProfile = () => {
        if (newProfileName) {
            setProfiles([...profiles, newProfileName]);
            setNewProfileName('');
            alert('Profil enregistré');
            showProfileSelection();
        } else {
            alert('Veuillez entrer un nom de profil');
        }
    };

    return (
        <div className='bodyy'>

        <div className="container">
            <div className="logo">MaxHome</div>

            {/* Écran 1 : Sélection de Profils */}
            {currentScreen === 'profileSelection' && (
                <div className="screen active">
                    <h1>Qui regarde maintenant ?</h1>
                    <div className="profiles">
                        {profiles.map((profile, index) => (
                            <div className="profile" key={index} onClick={() => selectProfile(profile)}>
                                <img src={`https://picsum.photos/id/${index + 1}/150/150`} alt={`Avatar de ${profile}`} />
                                <p>{profile}</p>
                            </div>
                        ))}
                        <div className="profile" onClick={showAddProfile}>
                            <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="150" height="150" fill="#333" />
                                <path d="M75 40V110M40 75H110" stroke="white" strokeWidth="8" />
                            </svg>
                            <p>Ajouter un profil</p>
                        </div>
                    </div>
                    <div className="manage-profiles">
                        <button className="btn" onClick={showManageProfiles}>Gérer les profils</button>
                    </div>
                </div>
                
            )}

            {/* Écran 2 : Ajouter un Profil */}
            {currentScreen === 'addProfile' && (
                <div className="screen">
                    <a href="#" className="back-btn" onClick={showProfileSelection}>← Retour</a>
                    <h1>Ajouter un profil</h1>
                    <div className="profile">
                        <img src="https://picsum.photos/id/4/150/150" alt="Nouvel Avatar" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Nom" 
                        style={{ fontSize: '1.2rem', padding: '10px', margin: '20px 0' }} 
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)} 
                    />
                    <div>
                        <button className="btn" onClick={saveProfile}>Enregistrer</button>
                        <button className="btn" onClick={showProfileSelection}>Annuler</button>
                    </div>
                </div>
            )}

            {/* Écran 3 : Gérer les Profils */}
            {currentScreen === 'manageProfiles' && (
                <div className="screen">
                    <a href="#" className="back-btn" onClick={showProfileSelection}>← Prêt</a>
                    <h1>Gérer les profils</h1>
                    <div className="profiles">
                        {profiles.map((profile, index) => (
                            <div className="profile" key={index}>
                                <img src={`https://picsum.photos/id/${index + 1}/150/150`} alt={`Avatar de ${profile}`} />
                                <p>{profile}</p>
                            </div>
                        ))}
                    </div>
                    <div className="manage-profiles">
                        <button className="btn" onClick={showProfileSelection}>Prêt</button>
                    </div>
                </div>
            )}
        </div>
        </div>

    );
};

export default ProfilManagement;
