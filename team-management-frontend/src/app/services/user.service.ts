import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {
    console.log('User API URL:', this.apiUrl);
  }

  getUsers(): Observable<User[]> {
    console.log('Fetching users from:', this.apiUrl);
    return this.http.get<User[]>(this.apiUrl).pipe(
      tap(data => console.log('Users received:', data)),
      catchError(this.handleError)
    );
  }

  getUser(id: string): Observable<User> {
    console.log(`Fetching user with id ${id} from: ${this.apiUrl}/${id}`);
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.log('User received:', data)),
      catchError(this.handleError)
    );
  }

  addUser(user: User): Observable<User> {
    console.log('Adding user:', user);
    return this.http.post<User>(this.apiUrl, user).pipe(
      tap(data => console.log('User added, response:', data)),
      catchError(this.handleError)
    );
  }

  updateUser(id: string, user: User): Observable<User> {
    console.log(`Updating user with id ${id}:`, user);
    return this.http.put<User>(`${this.apiUrl}/${id}`, user).pipe(
      tap(data => console.log('User updated, response:', data)),
      catchError(this.handleError)
    );
  }

  deleteUser(id: string): Observable<any> {
    console.log(`Deleting user with id ${id}`);
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.log('User deleted, response:', data)),
      catchError(this.handleError)
    );
  }

  /**
   * Récupère les équipes dont l'utilisateur est membre
   * @param userId ID de l'utilisateur
   * @returns Observable contenant la liste des équipes
   */
  getUserTeams(userId: string): Observable<any[]> {
    console.log(`Fetching teams for user with id ${userId}`);
    return this.http.get<any[]>(`${this.apiUrl}/${userId}/teams`).pipe(
      tap(data => console.log('User teams received:', data)),
      catchError(this.handleError)
    );
  }

  /**
   * Vérifie si un utilisateur est membre d'une équipe spécifique
   * @param userId ID de l'utilisateur
   * @param teamId ID de l'équipe
   * @returns Observable contenant un booléen
   */
  isUserMemberOfTeam(userId: string, teamId: string): Observable<boolean> {
    console.log(`Checking if user ${userId} is member of team ${teamId}`);
    return this.http.get<boolean>(`${this.apiUrl}/${userId}/teams/${teamId}`).pipe(
      tap(data => console.log('User membership status:', data)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      const status = error.status;
      const message = error.error?.message || error.statusText;

      errorMessage = `Erreur serveur: Code ${status}, Message: ${message}`;

      // Log des détails supplémentaires pour le débogage
      console.error('Error details:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        error: error.error
      });

      if (status === 0) {
        console.error('Le serveur est-il en cours d\'exécution? Vérifiez la connexion réseau.');
      }
    }

    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
