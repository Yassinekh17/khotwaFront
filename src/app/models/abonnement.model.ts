


export enum PlanAbonnement {
  MENSUEL = 'MENSUEL',
  TRIMESTRIEL = 'TRIMESTRIEL',
  ANNUEL = 'ANNUEL'
  
}

export interface Abonnement {
  id_abonnement: number;
  date_debut: Date;
  date_fin: Date;
  plan: PlanAbonnement;
  prix: number;
  

}
