""" A file for the Trainer class, managing the training sessions
"""

from .session import Session
import random
import string
from ..utils import new_key

class Trainer:
    """ This is a master manager of all the training sessions
    """
    def __init__(self):
        self.sessions = {} # training sessions ongoing (dict: key is the session id)

    def new_session(self, data):
        """ Generates a new session with random key
        """
        # generate a new key
        key = new_key()
        # avoid collision
        while (key in self.sessions.keys()):
            key = new_key()

        self.sessions[key] = Session(key, data)
        return key
    
    def train_session(self, key):
        """ Trains a specific session
        """
        self.sessions[key].train()

    def kill_session(self, key):
        """ Kills the session and returns only when the session is
            actually killed (as there is a little delay)
        """
        self.sessions[key].killed = True
        if (self.sessions[key] is not None):
            # wait till thread gets killed before exitting
            self.sessions[key].thread.join() 

    def kill_all(self):
        """ Kill all the sessions, waiting until they're all killed
        """
        for k in self.sessions.keys():
            self.kill_session(k)