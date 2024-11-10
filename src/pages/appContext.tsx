import React, { createContext, useContext, useEffect, useState } from 'react';
import { Movie } from '../models/movie';
import { Serie, SeasonSchemaPropriety, EpisodeSchemaPropriety } from '../models/serie';
import { HistorySchemaPropriety } from '../models/history';

const ip = process.env.REACT_APP_SECRET_IP as string;

interface User {
  _id: string;
}

interface AppContextType {
  movies: Movie[];
  series: Serie[];
  moviesWatch: Movie[];
  seasons: SeasonSchemaPropriety[];
  episodes: EpisodeSchemaPropriety[];
  history: HistorySchemaPropriety[];
  currentUser?: User;
  seriesWatch?: Serie[];
  setHistory: React.Dispatch<React.SetStateAction<HistorySchemaPropriety[]>>;
  updateHistory: (historyEntry: HistorySchemaPropriety) => void;
  clearUserHistory: () => Promise<void>; 
  deleteUser: () => Promise<void>; 
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [moviesWatch, setMoviesWatch] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [seasons, setSeasons] = useState<SeasonSchemaPropriety[]>([]);
  const [episodes, setEpisodes] = useState<EpisodeSchemaPropriety[]>([]);
  const [history, setHistory] = useState<HistorySchemaPropriety[]>([]);
  const [seriesWatch, setSeriesWatch] = useState<Serie[]>([]);
  const [currentUser, setCurrentUser] = useState<User>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          //console.error('Token is missing or expired');
          return;
        }

        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload._id;
        setCurrentUser({ _id: userId });

        const movieResponse = await fetch(`http://${ip}:3001/movies`);
        const movieData = await movieResponse.json();
        setMovies(movieData.allMovies);

        const serieResponse = await fetch(`http://${ip}:3001/series`);
        const serieData = await serieResponse.json();
        setSeries(serieData.allSeries);

        const seasonResponse = await fetch(`http://${ip}:3001/season`);
        const seasonData = await seasonResponse.json();
        setSeasons(seasonData.allSeason);

        const episodeResponse = await fetch(`http://${ip}:3001/episode`);
        const episodeData = await episodeResponse.json();
        setEpisodes(episodeData.allEpisodes);
        //console.log("Données chargées:", { movies: movieData.allMovies, series: serieData.allSeries, seasons: seasonData.allSeason, episodes: episodeData.allEpisodes });
      } catch (error) {
      //console.error('Erreur lors de la récupération des données:', error);
    }
  };

    fetchData();
  }, []);

  const updateHistory = async (historyEntry: HistorySchemaPropriety) => {
   
};


const clearUserHistory = async () => 
{
  if (!currentUser) {
    //console.error("Aucun utilisateur n'est connecté.");
    return;
  }

  try {
    const response = await fetch(`http://${ip}:3001/historique/clear_history/${currentUser._id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return;
    }

    setHistory([]);
  } catch (error) {
    //console.error(error);
  }
};

const deleteUser = async () => {
  if (!currentUser) {
    //console.error("Aucun utilisateur n'est connecté.");
    return;
  }

  const confirmation = window.confirm("Êtes-vous sûr à 100% de vouloir supprimer votre compte ? Cette action est irréversible.");
  if (!confirmation) {
    window.location.href = '/'; 
    return;
  }

  try {
    const response = await fetch(`http://${ip}:3001/users/delete_user/${currentUser._id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      //console.error("Erreur lors de la suppression du compte :", errorText);
      return;
    }

    //console.log("Compte supprimé avec succès !");
    localStorage.removeItem('token'); // Supprimez le token
    setCurrentUser(undefined); // Réinitialisez l'utilisateur courant
    setHistory([]); // Optionnel : videz l'historique
    window.location.href = "/login"; // Redirigez vers la page de connexion
  } catch (error) {
    //console.error("Erreur lors de la suppression du compte :", error);
  }
};




  
  
  return (
    <AppContext.Provider value={{ movies, series, seasons, episodes, history, currentUser, setHistory, updateHistory, moviesWatch, clearUserHistory, deleteUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
