from flask import Flask
from marshmallow import Schema, fields, pre_load, validate
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy

ma = Marshmallow()
db = SQLAlchemy()

class Architecture(db.Model):
    __tablename__ = "architectures"
    id = db.Column(db.Integer, primary_key=True)
    modelJSON = db.Column(db.TEXT())

    def __init__(self, modelJSON):
        self.modelJSON = modelJSON

class ArchitectureSchema(ma.Schema):
    id = fields.Integer()
    modelJSON = fields.String(required=True)

class Train(db.Model):
    __tablename__ = "train"
    id = db.Column(db.Integer, primary_key=True)
    modelID = db.Column(db.Integer)
    sessionID = db.Column(db.TEXT()) # sessionID in service
    done = db.Column(db.Boolean, default=False)

    def __init__(self, modelID, sessionID):
        self.modelID = modelID
        self.sessionID = sessionID

class TrainSchema(ma.Schema):
    id = fields.Integer()
    modelID = fields.Integer(required=True)
    sessionID = fields.String(required=True)
    done = fields.Boolean()

class Link(db.Model):
    __tablename__ = "link"
    id = db.Column(db.Integer, primary_key=True)
    modelID = db.Column(db.Integer)
    link = db.Column(db.TEXT(), unique=True)

    def new_key(self, N=10):
        import random
        import string
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=N))

    def __init__(self, modelID):
        self.modelID = modelID
        links = [l[0] for l in Link.query.with_entities(Link.link).all()]
        link = self.new_key()
        while link in links:
            link = self.new_key()
        self.link = link

class LinkSchema(ma.Schema):
    id = fields.Integer()
    modelID = fields.Integer(required=True)
    link = fields.String()

class Dataset(db.Model):
    __tablename__ = "dataset"
    id = db.Column(db.Integer, primary_key=True)
    datasetID = db.Column(db.TEXT(), unique=True)
    link = db.Column(db.TEXT())
    datasetName = db.Column(db.TEXT())
    inputShape = db.Column(db.TEXT())
    outputShape = db.Column(db.TEXT())

    def new_key(self, N=10):
        import random
        import string
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=N))

    def __init__(self, link, datasetName, inputShape, outputShape):
        self.datasetName = datasetName
        self.link = link
        ids = [l[0] for l in Dataset.query.with_entities(Dataset.datasetID).all()]
        id = self.new_key()
        while id in ids:
            id = self.new_key()
        self.inputShape = str(inputShape)
        self.outputShape = str(outputShape)
        self.datasetID = id

class DatasetSchema(ma.Schema):
    id = fields.Integer()
    link = fields.String(required=True)
    datasetID = fields.String()
    datasetName = fields.String(required=True)
    inputShape = fields.String(required=True)
    outputShape = fields.String(required=True)