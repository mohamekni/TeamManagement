from flask import Flask, jsonify, request
import subprocess
import os

app = Flask(__name__)

# This is a basic example where we will run a simple linter (like ESLint) or analyze code quality.
def evaluate_project(project_path):
    # Example: Run a linter or other evaluation tool on the project files
    result = subprocess.run(["eslint", project_path], capture_output=True, text=True)
    
    # If we are getting output from ESLint, we can use that as our evaluation metric.
    evaluation_score = 0
    if result.returncode == 0:
        evaluation_score = 90  # Assume a high score if no errors found.
    else:
        evaluation_score = 50  # A lower score if there are issues.

    # Return the evaluation result.
    return {
        "score": evaluation_score,
        "details": result.stdout
    }

# API endpoint for project evaluation
@app.route('/evaluate/<team_id>', methods=['POST'])
def evaluate_project(team_id):
    data = request.json
    project_path = data.get('project_path')

    # Traitement ici
    return jsonify({"team_id": team_id, "status": "ok"})

# Run the app
if __name__ == "__main__":
    app.run(debug=True)


    #   flask run