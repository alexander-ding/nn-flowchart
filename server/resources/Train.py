from flask import request
from flask_restful import Resource
from Model import db, Architecture, ArchitectureSchema, Train, TrainSchema
from trainer import trainer
from json import loads

architecture_schema = ArchitectureSchema()
train_schema = TrainSchema()

class TrainResource(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        
        if not json_data or "id" not in json_data.keys():
            return {'message': 'No ID provided'}, 400
        
        id = json_data["id"]
        # check if model by that id exists
        architecture = Architecture.query.get(id)
        if architecture is None:
            return {"message": "ID not found in database"}, 404
        # extract model
        model = architecture_schema.dump(architecture).data
        try:
            train = Train(modelID=id, model=loads(model["modelJSON"]))
        except Exception as e:
            return {"message": str(e)}, 400

        db.session.add(train)
        db.session.commit()
        result = train_schema.dump(train).data

        return {"status": "success!", 'data':result}, 201

    def get(self):
        """ Gets current status about the trianing session
        """
        id = request.args.get('id', -1)
        if id == -1:
            return {"message": "No session ID provided"}, 400
        if id not in trainer.sessions.keys():
            return {"message": "Session not found"}, 404
        s = trainer.sessions[id]
        resp = {"accuracy": round(s.accuracy * 1000)/1000, 
                "progress": s.progress,
                "trained": s.trained,
                "test_accuracy": s.test_accuracy}

        return resp, 500
    
    def delete(self):
        """ Deletes session given session id """
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
        