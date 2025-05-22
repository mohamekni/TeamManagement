import { Component, Input, OnInit } from '@angular/core';
import { AiService } from '../../services/ai.service';
import { TaskService } from '../../services/task.service';
import { NotificationService } from '../../services/notification.service';
import { Equipe } from '../../models/equipe.model';
import { Task } from '../../models/task.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-ai-chat',
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.css']
})
export class AiChatComponent implements OnInit {
  @Input() team!: Equipe;

  projectTitle: string = '';
  isGenerating: boolean = false;
  generatedContent: any = null;
  error: string | null = null;

  // Pour le chat
  messages: {role: 'user' | 'assistant', content: string}[] = [];
  userQuestion: string = '';
  isAskingQuestion: boolean = false;

  constructor(
    private aiService: AiService,
    private taskService: TaskService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Ajouter un message de bienvenue
    this.messages.push({
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant IA pour la gestion de projet. Entrez le titre de votre projet pour que je puisse vous aider à le diviser en tâches, ou posez-moi une question sur la gestion de projet.'
    });
  }

  generateTasks(): void {
    if (!this.projectTitle.trim()) {
      this.notificationService.showError('Veuillez entrer un titre de projet');
      return;
    }

    // Vérifier si l'équipe a des membres, sinon utiliser un nombre par défaut
    const memberCount = this.team && this.team.members ? this.team.members.length : 3;
    if (memberCount === 0) {
      this.notificationService.showWarning('L\'équipe n\'a pas de membres. Des tâches génériques seront créées.');
    }

    this.isGenerating = true;
    this.error = null;

    // Ajouter la demande aux messages
    this.messages.push({
      role: 'user',
      content: `Génère des tâches pour le projet "${this.projectTitle}" pour une équipe de ${memberCount} membres.`
    });

    // Ajouter un message de chargement
    const loadingMessageIndex = this.messages.length;
    this.messages.push({
      role: 'assistant',
      content: 'Je génère des tâches pour votre projet...'
    });

    this.aiService.generateProjectTasks(this.projectTitle, memberCount)
      .pipe(finalize(() => this.isGenerating = false))
      .subscribe({
        next: (result: any) => {
          if (!result || !result.entities || result.entities.length === 0) {
            console.error('Résultat invalide reçu de l\'API:', result);
            this.handleGenerationError(loadingMessageIndex, 'Format de réponse invalide');
            return;
          }

          this.generatedContent = result;

          // Remplacer le message de chargement par la réponse
          this.messages[loadingMessageIndex] = {
            role: 'assistant',
            content: `J'ai généré ${result.entities.length} entités pour votre projet "${result.projectTitle}" avec un total de ${this.countTasks(result)} tâches.`
          };

          this.notificationService.showSuccess('Tâches générées avec succès');
        },
        error: (error: any) => {
          console.error('Erreur lors de la génération des tâches:', error);
          this.handleGenerationError(loadingMessageIndex, error.message || 'Erreur inconnue');
        }
      });
  }

  // Méthode pour gérer les erreurs de génération
  private handleGenerationError(messageIndex: number, errorDetails: string): void {
    this.error = 'Impossible de générer les tâches. Veuillez réessayer.';

    // Remplacer le message de chargement par le message d'erreur
    this.messages[messageIndex] = {
      role: 'assistant',
      content: 'Désolé, je n\'ai pas pu générer les tâches. Veuillez réessayer avec un titre de projet différent.'
    };

    this.notificationService.showError('Erreur lors de la génération des tâches: ' + errorDetails);
  }

  askQuestion(): void {
    if (!this.userQuestion.trim()) {
      return;
    }

    const question = this.userQuestion.trim();
    this.userQuestion = '';
    this.isAskingQuestion = true;

    // Ajouter la question aux messages
    this.messages.push({
      role: 'user',
      content: question
    });

    const projectContext = {
      title: this.projectTitle || (this.generatedContent ? this.generatedContent.projectTitle : ''),
      description: 'Projet géré par l\'équipe ' + (this.team ? this.team.name : '')
    };

    this.aiService.askProjectQuestion(question, projectContext)
      .pipe(finalize(() => this.isAskingQuestion = false))
      .subscribe({
        next: (response: string) => {
          // Ajouter la réponse aux messages
          this.messages.push({
            role: 'assistant',
            content: response
          });
        },
        error: (error: any) => {
          console.error('Erreur lors de la demande à l\'IA:', error);

          // Ajouter l'erreur aux messages
          this.messages.push({
            role: 'assistant',
            content: 'Désolé, je n\'ai pas pu répondre à votre question. Veuillez réessayer.'
          });

          this.notificationService.showError('Erreur lors de la communication avec l\'IA');
        }
      });
  }

  createTasks(): void {
    if (!this.generatedContent || !this.team || !this.team._id) {
      this.notificationService.showError('Aucune tâche générée ou équipe invalide');
      return;
    }

    let createdCount = 0;
    const totalTasks = this.countTasks(this.generatedContent);

    // Pour chaque entité
    this.generatedContent.entities.forEach((entity: any, entityIndex: number) => {
      // Pour chaque tâche dans l'entité
      entity.tasks.forEach((taskData: any) => {
        const task: Task = {
          title: taskData.title,
          description: `[${entity.name}] ${taskData.description}`,
          status: taskData.status || 'todo',
          priority: taskData.priority || 'medium',
          teamId: this.team._id || '',
          // Assigner à un membre de l'équipe de manière cyclique
          assignedTo: this.team.members && this.team.members.length > 0
            ? (typeof this.team.members[entityIndex % this.team.members.length] === 'string'
              ? this.team.members[entityIndex % this.team.members.length]
              : (this.team.members[entityIndex % this.team.members.length] as any).userId)
            : undefined
        };

        this.taskService.createTask(task).subscribe({
          next: () => {
            createdCount++;
            if (createdCount === totalTasks) {
              this.notificationService.showSuccess(`${createdCount} tâches créées avec succès`);
              // Réinitialiser après création
              this.generatedContent = null;
              this.projectTitle = '';
            }
          },
          error: (error) => {
            console.error('Erreur lors de la création de la tâche:', error);
            this.notificationService.showError('Erreur lors de la création des tâches');
          }
        });
      });
    });
  }

  countTasks(content: any): number {
    if (!content || !content.entities) return 0;

    return content.entities.reduce((total: number, entity: any) => {
      return total + (entity.tasks ? entity.tasks.length : 0);
    }, 0);
  }
}
