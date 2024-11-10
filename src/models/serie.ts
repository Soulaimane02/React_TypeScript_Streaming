export interface EpisodeSchemaPropriety {
    _id: string;
    numero_episode: number;
    titre: string;
    description: string;
    video: string;
    duration: number;
    ref_season: string;
    ref_series: string;
  }
  

  export interface SeasonSchemaPropriety {
    _id?: string;
    number_saison: number;
    ref_serie: string;
    ref_series?: string;
    description: string;
    nb_total_episode: number;
    episodes: EpisodeSchemaPropriety[];
  }
  

  export interface Serie {
    _id: string;
    name: string;
    description: string;
    img: string;
    date_created: Date;
    categorie: string;
    rating: string;
    seasons: SeasonSchemaPropriety[]; // Ajout des saisons dans la série
  }
  