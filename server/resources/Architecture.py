""" /api/Architecture
"""

from flask import request
from flask_restful import Resource
from ..Model import db, Architecture, ArchitectureSchema

architecture_schema = ArchitectureSchema()

class ArchitectureResource(Resource):
    def post(self):
        """ A post request adds a new architecture (frontend's model)
        """
        json_data = request.get_json(force=True)
        
        if not json_data:
            return {'message': 'No input data provided'}, 400

        # check if json conforms
        _, errors = architecture_schema.load(json_data)
        if errors:
            return {'message': str(errors)}, 402
        
        # add to sql
        architecture = Architecture(modelJSON=json_data["modelJSON"])
        db.session.add(architecture)
        db.session.commit()

        # return the added data
        result = architecture_schema.dump(architecture).data

        return {"status": "success!", 'data':result}, 201
        
    def get(self):
        """ A get request gets an architecture by its id
        """

        # get the requested id
        id = request.args.get('id', -1)
        if id == -1:
            return {"message": "No ID provided"}, 400
        
        # try except in case server breaks
        try:
            architecture = Architecture.query.get(id) # query the sql
            # check if the id exists
            if architecture is None:
                return {"message": "ID not found"}, 404
            architecture = architecture_schema.dump(architecture).data
            return {"status": "success!", "data":architecture}, 200
        except Exception as e:
            return {"message":str(e)}, 500