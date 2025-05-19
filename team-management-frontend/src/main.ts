import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Enable production mode if needed
if (environment.production) {
  // Enable production mode
}

// Bootstrap the application
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => {
    console.error('Error bootstrapping the application:', err);

    // Display a user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.style.color = 'red';
    errorDiv.style.padding = '20px';
    errorDiv.style.margin = '20px';
    errorDiv.style.border = '1px solid red';
    errorDiv.style.borderRadius = '5px';
    errorDiv.style.backgroundColor = '#fff8f8';
    errorDiv.innerHTML = `
      <h2>Application Error</h2>
      <p>The application failed to start. Please check the console for more details.</p>
      <p>Error: ${err.message || 'Unknown error'}</p>
    `;
    document.body.appendChild(errorDiv);
  });


