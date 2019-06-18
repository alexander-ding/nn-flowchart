""" Describes the relational data structure that corresponds
    to the generated sql database

    Each db.Model class is a table of its own, and each corresponding
    ma.Schema is for verifying whether a json input can be used to
    create a new row in the table

    The changes here are reflected by running the migration script
    that updates the sql server
"""

from flask import Flask
from marshmallow import Schema, fields, pre_load, validate
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy
from .utils import new_key

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

class Link(db.Model):
    __tablename__ = "link"
    id = db.Column(db.Integer, primary_key=True)
    modelID = db.Column(db.Integer)
    link = db.Column(db.TEXT(), unique=True)

    def __init__(self, modelID):
        self.modelID = modelID
        links = [l[0] for l in Link.query.with_entities(Link.link).all()]
        link = new_key() # generates a random key for the new row
        while link in links:
            link = new_key()
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

    def __init__(self, link, datasetName, inputShape, outputShape):
        self.datasetName = datasetName
        self.link = link
        ids = [l[0] for l in Dataset.query.with_entities(Dataset.datasetID).all()]
        id = new_key() # generate a new key for the dataset
        while id in ids:
            id = new_key()
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