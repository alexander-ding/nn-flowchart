from flask import Flask, send_file
from flask_cors import CORS

import atexit
from server import api_bp, db, at_shutdown

def create_app(config_filename):
    app = Flask(__name__, static_folder="build", static_url_path="")
    app.config.from_object(config_filename)

    app.register_blueprint(api_bp, url_prefix='/api')

    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    return app



if __name__ == "__main__":
    app = create_app("config")
    @app.route("/")
    def index():  
        return send_file('build/index.html')
    atexit.register(at_shutdown, app)
    app.run(debug=True)