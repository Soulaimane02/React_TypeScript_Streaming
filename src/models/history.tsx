export interface HistorySchemaPropriety
{
    _id?: string; 
    date_history: Date;
    ref_user: string; 
    ref_movie?: string; 
    ref_episode?: string; 
    progress_time: number; // Temps de progression dans la vidéo (en secondes)

}