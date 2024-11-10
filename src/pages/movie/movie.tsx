import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../appContext';
import ReactPlayer from 'react-player';
import './movie.css';

const ip = process.env.REACT_APP_SECRET_IP as string;

const MoviePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { movies, currentUser } = useAppContext();
  const [history, setHistory] = useState<any[]>([]);
  const [playedSeconds, setPlayedSeconds] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const playerRef = useRef<ReactPlayer | null>(null);

  const movie = movies.find((m) => m._id === id);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`http://${ip}:3001/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        //console.error("Erreur lors de la récupération de l'historique :", errorText);
        throw new Error(`Erreur du serveur : ${response.status} ${response.statusText}`);
      }

      const historyData = await response.json();
      setHistory(historyData.allHistories);
    } catch (error) {
      //console.error("Erreur de récupération de l'historique:", error);
    }
  };

  const addHistoryEntry = async (newHistoryEntry: any) => {
    try {
      const addResponse = await fetch(`http://${ip}:3001/historique/add_history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newHistoryEntry),
      });

      if (!addResponse.ok) {
        const errorText = await addResponse.text();
        //console.error("Erreur lors de l'ajout à l'historique:", errorText);
        return;
      }

      fetchHistory();
    } catch (error) {
      //console.error("Erreur lors de la requête d'ajout d'historique:", error);
    }
  };

  const updateHistoryEntry = async (existingProgress: any, newProgressTime: number) => {
    const updateResponse = await fetch(`http://${ip}:3001/historique/edit_history/${existingProgress._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        ref_user: existingProgress.ref_user,
        ref_movie: existingProgress.ref_movie,
        progress_time: newProgressTime,
      }),
    });

    if (updateResponse.ok) {
      fetchHistory();
    } else {
      //console.error("Erreur lors de la mise à jour de l'historique");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!currentUser || !movie) return;

    const lastProgress = history.find((h) =>
      h.ref_user === currentUser._id && h.ref_movie === movie._id
    );

    if (lastProgress) {
      setPlayedSeconds(lastProgress.progress_time);
    }
  }, [history, currentUser, movie]);

  useEffect(() => {
    if (isReady && playerRef.current) {
      playerRef.current.seekTo(playedSeconds, 'seconds');
    }
  }, [isReady, playedSeconds]);

  const handlePlay = () => {
    if (!currentUser || !movie) return;

    const currentPlayedSeconds = playerRef.current ? playerRef.current.getCurrentTime() : 0;
    const lastProgress = history.find((h) =>
        h.ref_user === currentUser._id && h.ref_movie === movie._id
    );

    if (lastProgress) {
        updateHistoryEntry(lastProgress, currentPlayedSeconds);
    } else {
        addHistoryEntry({
            ref_user: currentUser._id,
            ref_movie: movie._id,
            progress_time: currentPlayedSeconds,
        });
    }
};


  const handlePause = () => {
    if (currentUser && movie) {
      const currentPlayedSeconds = playerRef.current ? playerRef.current.getCurrentTime() : 0;

      const lastProgress = history.find((h) =>
        h.ref_user === currentUser._id && h.ref_movie === movie._id
      );
      if (lastProgress) {
        updateHistoryEntry(lastProgress, currentPlayedSeconds); 
      }
    }
  };

  if (!movie) {
    return <h2>Film non trouvé</h2>;
  }

  return (
    <div className="movie-page">
      <div className="content-container">
        <div className="image-section">
          <img src={movie.img} alt={movie.name} className="movie-image" />
          <div className="movie-description">
            <p>{movie.description}</p>
          </div>
        </div>
        <div className="video-section">
          <div className="title-rating">
            <h1>{movie.name}</h1>
            <span className="rating-badge">Noté {movie.ratting}</span>
          </div>
          <ReactPlayer
            ref={playerRef}
            url={movie.video}
            controls
            playing={false}
            onPlay={handlePlay}
            onPause={handlePause}
            onReady={() => setIsReady(true)}
            width="100%"
            height="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default MoviePage;
