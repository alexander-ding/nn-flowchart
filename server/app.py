from flask import Blueprint
from flask_restful import Api
from .resources.Architecture import ArchitectureResource, ArchitectureResource
from .resources.Train import TrainResource
from .resources.Link import LinkResource

api_bp = Blueprint('api', __name__)
api = Api(api_bp)

# route
api.add_resource(ArchitectureResource, '/Architecture')
api.add_resource(TrainResource, "/Train")
api.add_resource(LinkResource, "/Link")