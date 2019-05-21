from flask import request
from flask_restful import Resource
from ..Model import db, Dataset, DatasetSchema
from ..utils import get_ext
from ..datasets import datasets

dataset_schema = DatasetSchema()

class DatasetResource(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        
        if not json_data:
            return {'message': 'No input data provided'}, 400

        _, errors = dataset_schema.load(json_data)
        if errors:
            return {'message': str(errors)}, 400
        try:
            if get_ext(json_data['link']) != ".npz":
                return {'message': "Link does not refer to a numpy archive"}, 400
        except:
            return {'message': "Link {} is malformed. Remember to include https:// or http://".format(json_data['link'])}, 400
        
        dataset = Dataset(link=json_data["link"], datasetName=json_data['datasetName'], inputShape=json_data["inputShape"], outputShape=json_data["outputShape"])
        db.session.add(dataset)
        db.session.commit()
        
        result = dataset_schema.dump(dataset).data
        datasets.new_dataset(result['datasetID'], result['link'])
        return {"status": "success!", 'data':result}, 201
        
    def get(self):
        datasets.initialize()
        id = request.args.get('id', -1)
        if id == -1:
            return {"message": "No ID provided"}, 400
            
        try:
            dataset = Dataset.query.filter_by(datasetID=id).all()
            if len(dataset) == 0:
                return {"message": "Dataset not found"}, 404
            dataset = dataset_schema.dump(dataset[0]).data
            return {"status": "success!", "data":dataset}, 200
        except Exception as e:
            return {"message":str(e)}, 500