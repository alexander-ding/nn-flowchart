from trainer.session import Session
import random
import string

def new_key(N=10):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=N)) 

class Trainer:
    def __init__(self):
        self.sessions = {} # training sessions ongoing

    def new_session(self, model):
        """ Generates a new session with random key
        """
        # avoid collision
        key = new_key()
        while (key in self.sessions.keys()):
            key = new_key()

        self.sessions[key] = Session(model)
        self.sessions[key].train()
        return key
    
    def kill_session(self, key):
        self.sessions[key].killed = True
        if (self.sessions[key] is not None):
            # wait till thread gets killed before exitting
            self.sessions[key].thread.join() 

    def kill_all(self):
        for k in self.sessions.keys():
            self.kill_session(k)