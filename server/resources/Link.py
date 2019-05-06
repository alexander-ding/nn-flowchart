from flask import request
from flask_restful import Resource
from ..Model import db, Link, LinkSchema

link_schema = LinkSchema()

class LinkResource(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        if not json_data or "modelID" not in json_data.keys():
            return {'message', 'No modelID provided'}, 400
        _, errs = link_schema.load(json_data)
        if errs:
            return errs, 402
        link = Link(modelID=json_data['modelID'])
        db.session.add(link)
        db.session.commit()
        result = link_schema.dump(link).data

        return {"status":"success!", "data":result}, 201
    
    def get(self):
        link = request.args.get('link', -1)
        if link == -1:
            links = [l[0] for l in Link.query.with_entities(Link.link).all()]
            return {"links": links}, 200
        
        try:
            modelID = [l[0] for l in Link.query.with_entities(Link.modelID).filter_by(link=link).all()]
            if len(modelID) == 0:
                return {"message": "Link not found"}, 404
            return {"id":modelID[0]}, 200
        except Exception as e:
            return {"message":str(e)}, 500