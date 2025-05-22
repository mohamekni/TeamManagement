import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppComponent } from './app.component';
import { EquipeComponent } from './components/equipe/equipe.component';
import { EquipeFormComponent } from './components/equipe-form/equipe-form.component';
import { EquipeListComponent } from './components/equipe-list/equipe-list.component';
import { EquipeDetailComponent } from './components/equipe-detail/equipe-detail.component';
import { NotificationComponent } from './components/notification/notification.component';
import { UserComponent } from './components/user/user.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { TaskListComponent } from './components/task-list/task-list.component';

@NgModule({
  declarations: [
    AppComponent,
    EquipeComponent,
    EquipeFormComponent,
    EquipeListComponent,
    EquipeDetailComponent,
    NotificationComponent,
    UserComponent,
    NavbarComponent,
    TaskListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    DragDropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }



