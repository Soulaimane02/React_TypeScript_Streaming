import React, { useState, useEffect, useRef } from 'react'; // Importation de React et des hooks nécessaires
import './home.css'; // Importation du fichier CSS pour styliser la page d'accueil
import { Movie } from '../../models/movie'; // Importation du modèle Movie
import { Serie } from '../../models/serie'; // Importation du modèle Serie
import { CombinedContent } from '../../models/CombinedContent';
import { Users } from '../../models/users';
import { jwtDecode } from 'jwt-decode';
import { Navigate, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { HistorySchemaPropriety } from '../../models/history';
import { useAppContext } from '../appContext';
import { userInfo } from 'os';

// Clé API pour TMDB
const api_key_TMDB = process.env.REACT_APP_SECRET_API_TMBD as string; // Récupération de la clé API depuis les variables d'environnement
const ip = process.env.REACT_APP_SECRET_IP as string;

const API_KEY = api_key_TMDB; // Affectation de la clé API à une variable
const BASE_URL = 'https://api.themoviedb.org/3'; // URL de base pour accéder à l'API TMDB

const HomePage: React.FC = () => { // Déclaration du composant fonctionnel HomePage
  const [movies, setMovies] = useState<Movie[]>([]); // État pour stocker les films
  const [series, setSeries] = useState<Serie[]>([]); // État pour stocker les séries
  const [bestContent, setBestContent] = useState<CombinedContent[]>([]);
  const [currentSlide, setCurrentSlide] = useState<number>(0); // État pour suivre l'index du slide actuel
  const [query, setQuery] = useState<string>(''); // État pour stocker la requête de recherche
  const [menuOpen, setMenuOpen] = useState<boolean>(false); // État pour gérer l'ouverture du menu
  const [error, setError] = useState<string | null>(null); // État pour stocker les erreurs
  const [userName, setUserName] = useState<string | null>(null); // État pour stocker le prénom de l'utilisateur
  const [userPP, setUserPP] = useState<string | null>(null); // État pour stocker la PP de l'utilisateur

  // Pour la barre de recherche
  const [searchTerm, setSearchTerm] = useState('') ; // État pour le terme de recherche
  const [showResults, setShowResults] = useState(false); // État pour afficher les résultats de recherche
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Par défaut, supposons qu'on est authentifié
  const navigate = useNavigate(); // Hook pour naviguer programmatique
  const [selectedCategory, setSelectedCategory] = useState('all'); 
  const { episodes, history = [], setHistory } = useAppContext();
  const historyArray = Array.isArray(history) ? history : [history];
  // Refs pour les sections
  const filmsSectionRef = useRef<HTMLDivElement>(null);
  const seriesSectionRef = useRef<HTMLDivElement>(null);
  const { clearUserHistory } = useAppContext(); 
  const { deleteUser } = useAppContext();




  useEffect(()=> { // Utilisation de useEffect pour charger les données au montage du composant
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      navigate("/login", { 
        replace: true,
        state: { message: "Vous ne pouvez pas accéder à cette page sans être authentifié." }
      }); // Redirection avec message
      return;
    }
    

    const fetchMoviess = async () => { // Fonction asynchrone pour récupérer les films
      const response = await fetch(`http://${ip}:3001/movies`); // Requête pour récupérer les films
      const responseJson = await response.json(); // Conversion de la réponse en JSON
      //console.error(responseJson); // Affichage de la réponse dans la console pour le débogage
      setMovies(responseJson.allMovies); // Mise à jour de l'état avec les films récupérés
    }

    
  const fetchUserName = () => {
    if (token) {
      try {
        const decodedToken = jwtDecode<Users>(token); // Décode le token ici
        setUserName(decodedToken.first_name); // Mettez à jour le state avec le prénom
      } catch (error) {
        //console.error('Error decoding token:', error);
        setUserName(''); // En cas d'erreur, laissez le prénom vide
      }
    } else {
      //console.warn('No token found in localStorage');
      setUserName(''); // En cas d'absence de token, laissez le prénom vide
    }
  };

  const fetchPP = () => {
    if (token) {
      try {
        const decodedToken = jwtDecode<Users>(token); // Décode le token ici
        setUserPP(decodedToken.profile_picture); // Mettez à jour le state avec le prénom
      } catch (error) {
        //console.error('Error decoding token:', error);
        setUserName(''); // En cas d'erreur, laissez le prénom vide
      }
    } else {
      //console.warn('No token found in localStorage');
      setUserPP(''); // En cas d'absence de token, laissez le prénom vide
    }
  };

  

    const fetchSeriess = async () => { // Fonction asynchrone pour récupérer les séries
      const response = await fetch(" http://my_ip:3001/series"); // Requête pour récupérer les séries
      const responseJson = await response.json(); // Conversion de la réponse en JSON
      setSeries(responseJson.allSeries); // Mise à jour de l'état avec les séries récupérées
    }
   
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const historyResponse = await fetch(` http://${ip}:3001/history`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!historyResponse.ok) {
          //console.error('Erreur lors de la récupération de l\'historique:', historyResponse.status);
          return;
        }
    
        const historyData = await historyResponse.json();
        setHistory(historyData.allHistories); // Met à jour le contexte
      } catch (error) {
        //console.error('Erreur lors de la récupération des données:', error);
      }
    };
    
  
    
    const fetchBestContent = async () => {
      try {
          const response = await fetch(`http://${ip}:3001/movies/content/stars`);
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          const data = await response.json();

          // Combiner films et séries dans un seul tableau
          const combinedContent: CombinedContent[] = [
              ...data.movies.map((movie: Movie) => ({
                  _id: movie._id,
                  name: movie.name,
                  img: movie.img,
                  // Convertir la note "8/10" en nombre
                  rating: parseFloat(movie.ratting.split('/')[0]), // Prendre la première partie avant le '/'
              })),
              ...data.series.map((serie: Serie) => ({
                  _id: serie._id,
                  name: serie.name,
                  img: serie.img,
                  rating: parseFloat(serie.rating), // Assurez-vous que 'rating' est déjà un nombre ou une chaîne convertible
              }))
          ];


          // Trier le contenu par note décroissante
      const sortedContent = combinedContent.sort((a, b) => b.rating - a.rating);

          // Garder les 10 meilleurs contenus
          setBestContent(sortedContent.slice(0, 10));
      } catch (error) {
          //console.error('Error fetching best content:', error);
      }
  };


    fetchMoviess(); // Appel de la fonction pour récupérer les films
    fetchSeriess(); // Appel de la fonction pour récupérer les séries
    fetchBestContent();
    fetchUserName();
    fetchData();
    fetchPP();
  }, []); // Dépendance vide pour exécuter l'effet une seule fois au montage
  

  // Utilisation de useEffect pour changer automatiquement de slide toutes les 3 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % movies.length);
    }, 3000); // Changer toutes les 3 secondes


    return () => clearInterval(interval); // Nettoyage de l'intervalle au démontage
  }, [movies.length]);
  const handleNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % movies.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + movies.length) % movies.length);
  };

  // Pour la barre de recherche
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setShowResults(true); // Affiche les résultats de recherche lorsqu'on commence à taper
  };


  const handleLogout = () => {
    // Supp l'acces
    localStorage.removeItem('accessGranted');
    // Supprimer le token d'authentification (localStorage ou sessionStorage)
    localStorage.removeItem('token'); // Ou sessionStorage selon l'endroit où le token est stocké

    // Mettre à jour l'état d'authentification si nécessaire
    setIsAuthenticated(false); // Assurez-vous que cette fonction soit accessible ici

    // Rediriger vers la page de connexion
    window.location.href = '/access-code';
  };

  // Filtrer les films et séries en fonction du terme de recherche
  const filteredMovies = movies.filter((movie) =>
    movie.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSeries = series.filter((serie) =>
    serie.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // Fonction pour gérer le clic sur un film
  const handleMovieClicke = (id: string, isSerie: boolean = false) => {
    // Cache toutes les bandes-annonces et supprime les iframes (pour arrêter le son)
    document.querySelectorAll('.trailer-container').forEach((container) => {
        (container as HTMLElement).style.display = 'none'; // Cache le conteneur de la bande-annonce
        container.innerHTML = ''; // Supprime l'iframe pour couper le son
    });

    // Redirection vers la page correspondante
    if (isSerie) {
        window.location.href = `/serie/${id}`; // Redirection pour une série
    } else {
        window.location.href = `/movie/${id}`; // Redirection pour un film
    }
};


   

const handleMenuClick = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
  event.preventDefault();

  const category = event.currentTarget.getAttribute('data-category');
  if (!category) {
    //console.error('Erreur: La catégorie est indéfinie.');
    return;
  }

    // Met à jour l'état avec la catégorie sélectionnée
    setSelectedCategory(category);
  };

  // Effet pour faire défiler vers la section après la sélection de catégorie
  useEffect(() => {
    if (selectedCategory === 'films' && filmsSectionRef.current) {
      filmsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (selectedCategory === 'series' && seriesSectionRef.current) {
      seriesSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedCategory]);


  
  const handleTrailerHover = async (movieName: string) => { // Fonction pour gérer le survol d'un film pour afficher la bande-annonce
    try {
      // Recherche du film par nom via l'API de TMDb
      const response = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(movieName)}` // Requête pour chercher le film
      );
      const data = await response.json(); // Conversion de la réponse en JSON
  
      if (data.results && data.results.length > 0) { // Vérifie si des résultats ont été trouvés
        const movieId = data.results[0].id; // Récupération de l'ID du premier film trouvé
  
        // Récupération de la bande-annonce du film
        const videoResponse = await fetch(
          `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}` // Requête pour récupérer les vidéos du film
        );
        const videoData = await videoResponse.json(); // Conversion de la réponse en JSON
  
        // Filtrer pour obtenir la bande-annonce YouTube
        const trailer = videoData.results.find(
          (video: any) => video.site === 'YouTube' && video.type === 'Trailer' // Recherche de la bande-annonce YouTube
        );
  
        if (trailer) { // Si une bande-annonce est trouvée
          // Utilisation de l'iframe pour intégrer directement la bande-annonce YouTube sur le site
          const trailerUrl = `https://www.youtube.com/embed/${trailer.key}`; // Construction de l'URL de la bande-annonce
          const trailerElement = document.getElementById('trailer-frame'); // Récupération de l'élément iframe
          if (trailerElement) {
            trailerElement.setAttribute('src', trailerUrl); // Mise à jour de la source de l'iframe
          }
        }
      } else {
        //console.log(`Aucun film trouvé pour ${movieName}`); // Message dans la console si aucun film n'est trouvé
      }
    } catch (error) {
      //console.error('Erreur lors de la récupération de la bande-annonce :', error); // Gestion des erreurs
    }
  };

  // Pour afficher la bande annonce des films 
  const handleTrailerHoverFilm = async (movieId: string | null, movieName: string | null) => {
    // Si aucun film n'est survolé (ou on a enlevé le doigt), cacher toutes les bandes-annonces
    if (!movieId || !movieName) {
      // Cache toutes les bandes-annonces et supprime les iframes (pour arrêter le son)
      document.querySelectorAll('.trailer-container').forEach((container) => {
        (container as HTMLElement).style.display = 'none'; // Cache le conteneur de la bande-annonce
        container.innerHTML = ''; // Supprime l'iframe pour couper le son
      });
      return; // Quitte la fonction
    }
  
    // Cache toutes les bandes-annonces avant d'en afficher une nouvelle
    document.querySelectorAll('.trailer-container').forEach((container) => {
      (container as HTMLElement).style.display = 'none'; // Cache le conteneur de la bande-annonce
      container.innerHTML = ''; // Supprime l'iframe pour couper le son
    });
  
    try {
      // Recherche du film par nom via l'API de TMDb
      const response = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(movieName)}` // Requête pour chercher le film
      );
      const data = await response.json(); // Conversion de la réponse en JSON
  
      if (data.results && data.results.length > 0) { // Vérifie si des résultats ont été trouvés
        const movieApiId = data.results[0].id; // Récupération de l'ID du premier film trouvé
  
        // Récupération de la bande-annonce du film
        const videoResponse = await fetch(
          `${BASE_URL}/movie/${movieApiId}/videos?api_key=${API_KEY}` // Requête pour récupérer les vidéos du film
        );
        const videoData = await videoResponse.json(); // Conversion de la réponse en JSON
  
        // Filtrer pour obtenir la bande-annonce YouTube
        const trailer = videoData.results.find(
          (video: any) => video.site === 'YouTube' && video.type === 'Trailer' // Recherche de la bande-annonce YouTube
        );
  
        if (trailer) { // Si une bande-annonce est trouvée
          const trailerUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0`; // Construction de l'URL de la bande-annonce
  
          // Afficher l'iframe dans l'élément de la carte survolée ou touchée
          const trailerElement = document.getElementById(`trailer-${movieId}`); // Récupération de l'élément iframe
          if (trailerElement) {
            trailerElement.innerHTML = `<iframe width="100%" height="100%" src="${trailerUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`; // Insertion de l'iframe avec la bande-annonce
            (trailerElement as HTMLElement).style.display = 'block'; // Affiche la bande-annonce
          }
        }
      }
    } catch (error) {
      //console.error('Erreur lors de la récupération de la bande-annonce :', error); // Gestion des erreurs
    }
  };

  // Pour afficher la bande annonce des séries 
  const handleTrailerHoverSerie = async (serieId: string | null, serieName: string | null) => {
    // Si aucune série n'est survolée (ou on a enlevé le doigt), cacher toutes les bandes-annonces
    if (!serieId || !serieName) {
      // Cache toutes les bandes-annonces et supprime les iframes (pour arrêter le son)
      document.querySelectorAll('.trailer-container').forEach((container) => {
        (container as HTMLElement).style.display = 'none'; // Cache le conteneur de la bande-annonce
        container.innerHTML = ''; // Supprime l'iframe pour couper le son
      });
      return; // Quitte la fonction
    }

    // Cache toutes les bandes-annonces avant d'en afficher une nouvelle
    document.querySelectorAll('.trailer-container').forEach((container) => {
      (container as HTMLElement).style.display = 'none'; // Cache le conteneur de la bande-annonce
      container.innerHTML = ''; // Supprime l'iframe pour couper le son
    });

    try {
      // Recherche de la série par nom via l'API de TMDb
      const response = await fetch(
        `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(serieName)}` // Requête pour chercher la série
      );
      const data = await response.json(); // Conversion de la réponse en JSON

      if (data.results && data.results.length > 0) { // Vérifie si des résultats ont été trouvés
        const serieApiId = data.results[0].id; // Récupération de l'ID de la première série trouvée

        // Récupération de la bande-annonce de la série
        const videoResponse = await fetch(
          `${BASE_URL}/tv/${serieApiId}/videos?api_key=${API_KEY}` // Requête pour récupérer les vidéos de la série
        );
        const videoData = await videoResponse.json(); // Conversion de la réponse en JSON

        // Filtrer pour obtenir la bande-annonce YouTube
        const trailer = videoData.results.find(
          (video: any) => video.site === 'YouTube' && video.type === 'Trailer' // Recherche de la bande-annonce YouTube
        );

        if (trailer) { // Si une bande-annonce est trouvée
          const trailerUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=1`; // Construction de l'URL de la bande-annonce

          // Afficher l'iframe dans l'élément de la carte survolée ou touchée
          const trailerElement = document.getElementById(`trailer-${serieId}`); // Récupération de l'élément iframe
          if (trailerElement) {
            trailerElement.innerHTML = `<iframe width="100%" height="100%" src="${trailerUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`; // Insertion de l'iframe avec la bande-annonce
            (trailerElement as HTMLElement).style.display = 'block'; // Affiche la bande-annonce
          }
        }
      }
    } catch (error) {
      //console.error('Erreur lors de la récupération de la bande-annonce :', error); // Gestion des erreurs
    }
  };
  const checkSerieExists = async (contentId: any) => {
    try {
        const response = await fetch(`http://${ip}:3001/series/${contentId}`);
        if (response.ok) {
            return true; // La série existe
        }
    } catch (error) {
        //console.error("Erreur", error);
    }
    return false; 
};

const handleMovieClickFilmOrSerie = async (contentId: any) => {
  //console.log("ID cliqué:", contentId); // Affiche l'ID

  // Vérifie si la série existe
  const serieExists = await checkSerieExists(contentId);

  if (serieExists) {
      navigate(`/serie/${contentId}`); // Redirige vers la page de la série
  } else {
      //console.log("Série non trouvée, redirection vers le film");
      navigate(`/movie/${contentId}`); // Redirige vers la page du film
  }
};




  const filteredContent = selectedCategory === 'films'
  ? filteredMovies // Movies déjà filtrés avec le terme de recherche
  : selectedCategory === 'series'
  ? filteredSeries // Séries déjà filtrées
  : bestContent; // Contenu par défaut ou les mieux notés


  return (
    <div>
        
     {/* Header */}
    <header className="header">
      <div className="logo" onClick={() => window.location.href = '/'}>
        MaxHome
      </div>
      <div className="search-container">
        <input
          type="text"
          className="search-bar"
          placeholder={`Rechercher... ${userName ? userName : ''}`}
          value={searchTerm}
          onChange={handleSearchChange}
          onBlur={() => setTimeout(() => setShowResults(false), 200)} // Cache les résultats au clic hors de l'input
          onFocus={() => setShowResults(true)} // Affiche les résultats lorsqu'on se concentre sur l'input
        />

        {/* Liste des résultats de recherche */}
        {showResults && searchTerm && (
          <div className="search-results">
            {filteredMovies.length === 0 && filteredSeries.length === 0 && (
              <div className="search-result-item">Aucun résultat trouvé</div>
            )}

            {filteredMovies.map((movie) => (
              <div
                key={movie._id}
                className="search-result-item"
                onClick={() => handleMovieClicke(movie._id)}
              >
                {movie.name}
              </div>
            ))}

            {filteredSeries.map((serie) => (
              <div
                key={serie._id}
                className="search-result-item"
                onClick={() => handleMovieClicke(serie._id, true)}
              >
                {serie.name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        className={`hamburger-menu ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        role="button"
        aria-expanded={menuOpen}
        aria-label="Menu"
      >
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
      <nav className={`navbar ${menuOpen ? 'open' : ''}`}>
      <Link to="/" data-category="films" onClick={handleMenuClick}>🎬 Films</Link>
      <Link to="/" data-category="series" onClick={handleMenuClick}>📺 Séries</Link>
      <Link to="/" onClick={clearUserHistory}>🗑️ Historique</Link>
      <Link to="/login" onClick={deleteUser}>Suppression du Compte</Link>

      <button className="btn-logout" onClick={handleLogout}>
          Déconnexion
        </button>
        {userPP && (
        <img src={userPP} alt="Profil" className="profile-picture" />
        )}
    </nav>

     
    </header>


      {/* Hero Section */}
      <div className="hero-container">
      {movies.length > 0 && (
        <div
          className="hero-slide"
          style={{ backgroundImage: `url(${movies[currentSlide].img})` }}
        >
          
          <div className="hero-content">
            <h1>{movies[currentSlide].name}</h1>
            <p>Note : {movies[currentSlide].ratting}</p>
            <button className="cta-button" onClick={() => handleMovieClicke(movies[currentSlide]._id)} onMouseEnter={() => handleTrailerHover(movies[currentSlide]._id)}>
              Voir le film
            </button>
          </div>
        </div>
      )}
      {/* Navigation */}
      <button className="nav-button prev" onClick={handlePrevSlide}>
        Précédent
      </button>
      <button className="nav-button next" onClick={handleNextSlide}>
        Suivant
      </button>
    </div>

      {/* Affichage des messages d'erreur */}
      {error && <div className="error-message">{error}</div>}

    {/* Section Continuer à regarder */}
    <section className="movie-cards-container">
      <h2 className="section-title">Continuer à regarder</h2>
      <div className="movie-cards">
          {history.length === 0 ? (
              <p>Aucun historique trouvé.</p>
          ) : (
              history.map((entry: HistorySchemaPropriety) => {
                  if (!entry) return null; // Si l'entrée est indéfinie, retourne null

                  let content = null; // Initialisation de content à null
                  if (entry.ref_movie) {
                      const movie = movies.find((m) => m._id === entry.ref_movie);
                      if (movie) {
                          const progressPercentage = (entry.progress_time / (movie.duration || 1)) * 100;
                          content = (
                              <div className="movie-card" key={movie._id}>
                                  <img 
                                      src={movie.img} 
                                      alt={movie.name} 
                                      onClick={() => handleMovieClicke(movie._id)} // Redirection sur clic
                                      style={{ cursor: 'pointer' }} // Indique que l'image est cliquable
                                  />
                                  <div className="movie-card-info">
                                      <h3>{movie.name}</h3>
                                      <div className="progress-bar">
                                          <div className="progress" style={{ width: `${progressPercentage}%` }}></div>
                                      </div>
                                      <button 
                                          className="play-button" 
                                          onClick={() => handleMovieClicke(movie._id)} // Redirection aussi sur le bouton
                                      >
                                          🎥
                                      </button>
                                  </div>
                              </div>
                          );
                      }
                  }

                  if (entry.ref_episode) {
                      const episode = episodes.find((e) => e._id === entry.ref_episode);
                      if (episode) {
                          const seriesData = series.find((s) => s._id === episode.ref_series);
                          const progressPercentage = (entry.progress_time / (episode.duration || 1)) * 100;

                          content = (
                              <div className="movie-card" key={episode._id}>
                                  <img 
                                      src={seriesData?.img || 'default_image.jpg'} 
                                      alt={episode.titre} 
                                      onClick={() => handleMovieClicke(episode._id)} // Redirection sur clic
                                      style={{ cursor: 'pointer' }} // Indique que l'image est cliquable
                                  />
                                  <div className="movie-card-info">
                                      <h3>{episode.titre}</h3>
                                      <div className="progress-bar">
                                          <div className="progress" style={{ width: `${progressPercentage}%` }}></div>
                                      </div>
                                      <button 
                                          className="play-button" 
                                          onClick={() => handleMovieClicke(episode._id)} // Redirection aussi sur le bouton
                                      >
                                          🎥
                                      </button>
                                  </div>
                              </div>
                          );
                      }
                  }
                  return content; 
              })
          )}
      </div>
    </section>



          
  {/* Section Nos Films */}
    <section ref={filmsSectionRef} className="movie-cards-container">
      <h2 className="section-title">Nos Films</h2>
      <div className="movie-cards">
        {filteredMovies.map((movie) => (
          <div
            className="movie-card"
            key={movie._id}
            onTouchStart={() => handleTrailerHoverFilm(movie._id, movie.name)}
            onTouchEnd={() => handleTrailerHoverFilm(null, null)}
            onClick={() => handleMovieClicke(movie._id)} 
          >
            <img src={movie.img} alt={movie.name} />
            <div className="movie-card-info">
              <h3>{movie.name}</h3>
              <p>Note : {movie.ratting}</p>
            </div>
            <div className="trailer-container" id={`trailer-${movie._id}`}></div>
          </div>
        ))}
      </div>
    </section>


  {/* Section Nos Séries */}
      <section ref={seriesSectionRef} className="movie-cards-container">
        <h2 className="section-title">Nos Séries</h2>
        <div className="movie-cards">
          {filteredSeries.map((serie) => (
            <div
              className="movie-card"
              key={serie._id}
              onMouseLeave={() => handleTrailerHoverFilm(null, null)} // Désactiver la bande-annonce sur sortie de la carte (PC)
              onTouchStart={() => handleTrailerHoverSerie(serie._id, serie.name)} // Mobile
              onTouchEnd={() => handleTrailerHoverSerie(null, null)} // Mobile
              onClick={() => handleMovieClicke(serie._id, true)} 
            >
              <img src={serie.img} alt={serie.name} />
              <div className="movie-card-info">
                <h3>{serie.name}</h3>
                <p>Note : {parseFloat(serie.rating).toFixed(1)}</p>
              </div>
              <div className="trailer-container" id={`trailer-${serie._id}`}></div>
            </div>
          ))}
        </div>
      </section>





       {/* Section Les Mieux Notée */}
       <section className="movie-cards-container">
            <h2 className="section-title">Top 10 des series et films :</h2>
            <div className="movie-cards">
                {bestContent.map((content) => (
                    <div
                        className="movie-card"
                        key={content._id}
                        onClick={() => handleMovieClickFilmOrSerie(content._id)}
                    >
                        <img src={content.img} alt={content.name} />
                        <div className="movie-card-info">
                            <h3>{content.name}</h3>
                            <p>Note : {content.rating.toFixed(1)}</p> {/* Affiche la note avec une décimale */}
                        </div>
                    </div>
                ))}
            </div>
        </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 MaxHome. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default HomePage;
function isTokenExpired(token: string): boolean {
  throw new Error('Function not implemented.');
}

