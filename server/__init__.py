""" The module is the whole server, exposing its api and database
"""

from .shutdown import at_shutdown
from .app import api_bp
from .Model import db

