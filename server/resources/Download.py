""" /api/Download
"""


from flask import request
from flask_restful import Resource
from ..Model import db, Architecture, ArchitectureSchema
from ..trainer import trainer
from json import loads

architecture_schema = ArchitectureSchema()

class DownloadResource(Resource):
    def get(self):
        """ A get request downloads a model in its json form by its ID
            The downloaded file can be loaded using keras
        """

        # get requested id
        id = request.args.get('id', -1)
        if id == -1:
            return {"message": "No ID provided"}, 400
        
        try:
            # get the sql's corresponding architecture
            architecture = Architecture.query.get(id)
            if architecture is None:
                return {"message": "ID not found"}, 404
            data = architecture_schema.dump(architecture).data

            # use the architecture to generate a new session that compiles
            # the keras model
            session_id = trainer.new_session(loads(data["modelJSON"]))
            trainer.sessions[session_id].compile_model()

            # use the keras method to encode the keras model
            return {"status": "success!", "data":trainer.sessions[session_id].save_model()}, 200
        except Exception as e:
            return {"message":str(e)}, 500
        