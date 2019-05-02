from flask import Flask
from flask_cors import CORS

import atexit
from shutdown import at_shutdown

def create_app(config_filename):
    app = Flask(__name__)
    app.config.from_object(config_filename)
    
    from app import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    from Model import db
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    return app

if __name__ == "__main__":
    app = create_app("config")
    atexit.register(at_shutdown, app)
    app.run(debug=True)