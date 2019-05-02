from Model import db, Train
from trainer import trainer

def at_shutdown():
    # first, kill all ongoing training threads
    trainer.kill_all()
    
    # then, remove all ongoing trainings
    db.session.query(Train).delete()
    db.session.commit()