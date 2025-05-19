import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EquipeComponent } from './components/equipe/equipe.component';
import { EquipeListComponent } from './components/equipe-list/equipe-list.component';
import { EquipeFormComponent } from './components/equipe-form/equipe-form.component';
import { EquipeDetailComponent } from './components/equipe-detail/equipe-detail.component';
import { UserComponent } from './components/user/user.component';

const routes: Routes = [
  // Route principale pour les équipes (redirige vers la liste)
  { path: 'equipes', redirectTo: 'equipes/liste', pathMatch: 'full' },

  // Routes pour les équipes
  {
    path: 'equipes',
    children: [
      // Liste des équipes
      { path: 'liste', component: EquipeListComponent },

      // Formulaire pour ajouter une nouvelle équipe
      { path: 'ajouter', component: EquipeFormComponent },

      // Formulaire pour modifier une équipe existante
      { path: 'modifier/:id', component: EquipeFormComponent },

      // Détails d'une équipe spécifique
      { path: 'detail/:id', component: EquipeDetailComponent }
    ]
  },

  // Route pour les utilisateurs
  { path: 'utilisateurs', component: UserComponent },

  // Route par défaut (redirige vers la liste des équipes)
  { path: '', redirectTo: 'equipes/liste', pathMatch: 'full' },

  // Route pour les pages non trouvées
  { path: '**', redirectTo: 'equipes/liste' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }



