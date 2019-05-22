""" /api/Train
"""

from flask import request
from flask_restful import Resource
from ..Model import db, Architecture, ArchitectureSchema, Train, TrainSchema
from ..trainer import trainer
from json import loads

architecture_schema = ArchitectureSchema()
train_schema = TrainSchema()

class TrainResource(Resource):
    def post(self):
        """ A post request generates a training session for a model
            given the model ID
        """
    
        # get model ID
        json_data = request.get_json(force=True)
        
        if not json_data or "id" not in json_data.keys():
            return {'message': 'No ID provided'}, 400
        
        id = json_data["id"]
        # check if model by that id exists
        architecture = Architecture.query.get(id)
        if architecture is None:
            return {"message": "ID not found in database"}, 404
        # extract model
        data = architecture_schema.dump(architecture).data
        try:
            # generate a new training session (with its own id)
            session_id = trainer.new_session(loads(data["modelJSON"]))
            trainer.train_session(session_id)
            train = Train(modelID=id, sessionID=session_id)
        except Exception as e:
            return {"message": str(e)}, 400

        # add the training session to sql
        db.session.add(train)
        db.session.commit()
        result = train_schema.dump(train).data

        return {"status": "success!", 'data':result}, 201

    def get(self):
        """ A get request gets the current status about the training session
        """

        # get session ID
        id = request.args.get('id', -1)
        if id == -1:
            return {"message": "No session ID provided"}, 400
        if id not in trainer.sessions.keys():
            return {"message": "Session not found"}, 404
        s = trainer.sessions[id]
        resp = {"accuracy": round(s.accuracy * 1000)/1000, 
                "progress": s.progress,
                "trained": s.trained,
                "test_accuracy": s.test_accuracy,
                "loss": str(s.loss)}

        return resp, 200
    
    def delete(self):
        """ A delete request kills the session given session id 
        """
        json_data = request.get_json(force=True)
        
        if not json_data or "id" not in json_data.keys():
            return {'message': 'No ID provided'}, 400
        
        id = json_data["id"]
        if id not in trainer.sessions.keys():
            return {'message': "Session is not found"}, 404
        Train.query.filter_by(sessionID=id).delete()
        trainer.kill_session(id)
        db.session.commit()

        return {'status':'success'}, 204
        