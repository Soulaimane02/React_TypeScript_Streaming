import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../appContext'; 
import './serie.css';
import { Serie, SeasonSchemaPropriety, EpisodeSchemaPropriety } from '../../models/serie';

const SeriePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { series, seasons = [], episodes = [], history = [], updateHistory, currentUser } = useAppContext();

  const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const serie = series.find((s) => s._id === id);
  
  const serieSeasons = serie ? seasons.filter(season => season.ref_serie === serie._id || season.ref_series === serie._id) : [];
  const currentSeason = serieSeasons[currentSeasonIndex] || null;
  const currentSeasonEpisodes = currentSeason
    ? episodes.filter((episode: EpisodeSchemaPropriety) => episode.ref_season === currentSeason._id)
    : [];

  const currentEpisode = currentSeasonEpisodes[currentEpisodeIndex] || null;
  const previousEpisode = currentEpisodeIndex > 0 ? currentSeasonEpisodes[currentEpisodeIndex - 1] : null;
  const nextEpisode = currentEpisodeIndex < currentSeasonEpisodes.length - 1 ? currentSeasonEpisodes[currentEpisodeIndex + 1] : null;

  useEffect(() => {
    if (!currentEpisode || !videoRef.current || !currentUser) {
      //console.log("Conditions non remplies pour démarrer le hook dans SeriePage", { currentEpisode, videoRef: videoRef.current, currentUser });
      return;
    }
  
    const video = videoRef.current;
    const lastProgress = history.find((h: any) => h.ref_episode === currentEpisode._id && h.ref_user === currentUser._id);
  
    //console.log("Dernière progression trouvée pour l'épisode:", lastProgress);
  
    if (lastProgress) {
      video.currentTime = lastProgress.progress_time;
    }
  
    const handleProgress = () => {
      if (videoRef.current) {
        const progressTime = videoRef.current.currentTime;
        //console.log("Progression actuelle de l'épisode:", progressTime);
  
        updateHistory({
          date_history: new Date(),
          ref_user: currentUser._id,
          ref_episode: currentEpisode._id,
          progress_time: progressTime,
        });
      }
    };
  
    video.addEventListener('timeupdate', handleProgress);
    return () => video.removeEventListener('timeupdate', handleProgress);
  }, [currentEpisode, history, updateHistory, currentUser]);
  
  if (!serie) {
    return <h2>Série non trouvée</h2>;
  }

  const handleSeasonChange = (seasonIndex: number) => {
    setCurrentSeasonIndex(seasonIndex);
    setCurrentEpisodeIndex(0);
  };

  

  return (
    <div className="serie-page">
      <div className="content-container">
        {/* Section de l'image */}
        <div className="image-section">
          <img src={serie.img} alt={serie.name} className="serie-image" />
          <div className="serie-description">
            <p>{serie.description}</p>
          </div>
        </div>

        {/* Section de la vidéo */}
        <div className="video-section">
          <div className="title-rating">
            <h1>{serie.name}</h1>
            {currentSeason && currentEpisode && (
              <span className="rating-badge">
                Saison {currentSeason.number_saison} - Épisode {currentEpisode.numero_episode}: {currentEpisode.titre}
              </span>
            )}
          </div>
          {currentEpisode ? (
            <video controls ref={videoRef} src={currentEpisode.video} className="serie-video" />
          ) : (
            <h2>Aucun épisode disponible pour cette saison</h2>
          )}

          {/* Navigation des épisodes */}
          <div className="navigation-container">
            <div className="episode-navigation">
              {previousEpisode && (
                <button onClick={() => setCurrentEpisodeIndex(currentEpisodeIndex - 1)} className="nav-button">
                  Épisode Précédent
                </button>
              )}
              {nextEpisode && (
                <button onClick={() => setCurrentEpisodeIndex(currentEpisodeIndex + 1)} className="nav-button">
                  Épisode Suivant
                </button>
              )}
            </div>

            {/* Sélection des saisons */}
            <div className="season-selection">
              {serieSeasons.map((season, index) => (
                <button
                  key={season._id}
                  className={`season-button ${index === currentSeasonIndex ? 'active' : ''}`}
                  onClick={() => handleSeasonChange(index)}
                >
                  Saison {season.number_saison} - {season.nb_total_episode} episodes
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriePage;
