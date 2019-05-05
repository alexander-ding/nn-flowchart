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