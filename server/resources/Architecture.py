from flask import request
from flask_restful import Resource
from ..Model import db, Architecture, ArchitectureSchema

architecture_schema = ArchitectureSchema()

class ArchitectureResource(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        
        if not json_data:
            return {'message': 'No input data provided'}, 400
        _, errors = architecture_schema.load(json_data)
        if errors:
            return errors, 402
        architecture = Architecture(modelJSON=json_data["modelJSON"])
        db.session.add(architecture)
        db.session.commit()
        result = architecture_schema.dump(architecture).data

        return {"status": "success!", 'data':result}, 201
        
    def get(self):
        id = request.args.get('id', -1)
        if id == -1:
            return {"message": "No ID provided"}, 400
            
        try:
            architecture = Architecture.query.get(id)
            if architecture is None:
                return {"message": "ID not found"}, 404
            architecture = architecture_schema.dump(architecture).data
            return {"status": "success!", "data":architecture}, 200
        except Exception as e:
            return {"message":str(e)}, 500