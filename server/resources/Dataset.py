""" /api/Dataset
"""


from flask import request
from flask_restful import Resource
from ..Model import db, Dataset, DatasetSchema
from ..utils import get_ext
from ..datasets import datasets

dataset_schema = DatasetSchema()

class DatasetResource(Resource):
    def post(self):
        """ A post request adds a user custom dataset
        """

        # get json and enforce form
        json_data = request.get_json(force=True)
        
        if not json_data:
            return {'message': 'No input data provided'}, 400

        _, errors = dataset_schema.load(json_data)
        if errors:
            return {'message': str(errors)}, 400
        try:
            # make sure that the link provided actually points to an .npz file
            # if an error is thrown, then it means that the link is malformed
            if get_ext(json_data['link']) != ".npz":
                return {'message': "Link does not refer to a numpy archive"}, 400
        except:
            return {'message': "Link {} is malformed. Remember to include https:// or http://".format(json_data['link'])}, 400
        
        # adds to sql
        dataset = Dataset(link=json_data["link"], datasetName=json_data['datasetName'], inputShape=json_data["inputShape"], outputShape=json_data["outputShape"])
        db.session.add(dataset)
        db.session.commit()
        
        result = dataset_schema.dump(dataset).data
        # add to local representation
        datasets.new_dataset(result['datasetID'], result['link'])
        return {"status": "success!", 'data':result}, 201
        
    def get(self):
        """ A get request gets a user custom dataset by its dataset id
        """
        datasets.initialize() # in case it hasn't been initialized yet

        # get requested id
        id = request.args.get('id', -1)
        if id == -1:
            return {"message": "No ID provided"}, 400
            
        try:
            # get the sql corresponding dataset information
            dataset = Dataset.query.filter_by(datasetID=id).all()
            if len(dataset) == 0:
                return {"message": "Dataset not found"}, 404
            dataset = dataset_schema.dump(dataset[0]).data
            return {"status": "success!", "data":dataset}, 200
        except Exception as e:
            return {"message":str(e)}, 500