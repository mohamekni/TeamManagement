from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/')
def helloworld():
    return 'hello , world'

    #   flask run