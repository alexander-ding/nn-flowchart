""" Functions to clean up the mess as the server shuts down
"""

from .Model import db, Train
from .trainer import trainer
from flask import request

def at_shutdown(app):
    """ Final actions before an app shuts down

        Kill training threads and delete the training sessions
        in the database
    """
    
    print("Shutting down server")
    # first, kill all ongoing training threads
    trainer.kill_all()
    
    # then, remove all ongoing trainings
    with app.app_context():
        db.session.query(Train).delete()
        db.session.commit()
