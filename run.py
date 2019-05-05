from flask import Flask
from flask_cors import CORS

import atexit
from server import api_bp, db, at_shutdown

def create_app(config_filename):
    app = Flask(__name__)
    app.config.from_object(config_filename)

    app.register_blueprint(api_bp, url_prefix='/api')

    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    return app

if __name__ == "__main__":
    app = create_app("config")
    atexit.register(at_shutdown, app)
    app.run(debug=True)