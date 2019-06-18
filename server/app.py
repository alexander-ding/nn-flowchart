""" The file describing the flask app and its api
"""

from flask import Blueprint
from flask_restful import Api
from .resources.Architecture import ArchitectureResource, ArchitectureResource
from .resources.Link import LinkResource
from .resources.Dataset import DatasetResource

api_bp = Blueprint('api', __name__)
api = Api(api_bp)

# route the api
api.add_resource(ArchitectureResource, '/Architecture')
api.add_resource(LinkResource, "/Link")
api.add_resource(DatasetResource, "/Dataset")