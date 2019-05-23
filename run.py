""" The script to run to launch the server!
"""

from flask import Flask, send_file
from flask_cors import CORS

import atexit
from server import api_bp, db, at_shutdown

def create_app(config_filename):
    """ Create an app given the filename of the configuration file
    """

    app = Flask(__name__, static_folder="build", static_url_path="")
    app.config.from_object(config_filename)

    app.register_blueprint(api_bp, url_prefix='/api')

    db.init_app(app)
    app.app_context().push()
    db.create_all()
    CORS(app, resources={r"/api/*": {"origins": "*"}}) # this allows the api to be accessed by other users!
    return app


app = create_app("config")
app.debug = True
    
@app.route("/")
def index():  
    return send_file('build/index.html')
    
atexit.register(at_shutdown, app) # ready the at_shutdown for a graceful shutdown
app.run()