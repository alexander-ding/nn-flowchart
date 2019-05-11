from flask import request
from flask_restful import Resource
from ..Model import db, Architecture, ArchitectureSchema
from ..trainer import trainer
from json import loads

architecture_schema = ArchitectureSchema()

class DownloadResource(Resource):
    def get(self):
        id = request.args.get('id', -1)
        if id == -1:
            return {"message": "No ID provided"}, 400
        
        try:
            architecture = Architecture.query.get(id)
            if architecture is None:
                return {"message": "ID not found"}, 404
            data = architecture_schema.dump(architecture).data
            session_id = trainer.new_session(loads(data["modelJSON"]))
            trainer.sessions[session_id].compile_model()

            return {"status": "success!", "data":trainer.sessions[session_id].save_model()}, 200
        except Exception as e:
            return {"message":str(e)}, 500
        