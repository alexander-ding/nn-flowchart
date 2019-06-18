# Configures the application with some constant variables, to be imported
import os

# You need to replace the next values with the appropriate values for your configuration

basedir = os.path.abspath(os.path.dirname(__file__))
SQLALCHEMY_ECHO = False
SQLALCHEMY_TRACK_MODIFICATIONS = True
if 'DATABASE_URL' in os.environ.keys():
    SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']
else:
    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:postgres@localhost/nn_flowchart"