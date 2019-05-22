""" Defines the class Dataset that manages one single custom Dataset
"""

from pathlib import Path
import numpy as np
import requests
import threading
import datetime
import os

data_path = Path(__file__).parent.parent.parent / "data" # path to the data directory

def load_file(p):
    """ Load a training data file and extract x and y from it
    """
    archive = np.load(p)
    return archive['x'], archive['y']

class Dataset:
    """ Manages a custom dataset provided by the user (that is already in the sql database)
    """
    def __init__(self, id, url):
        self.id = id
        self.url = url
        self.last_accessed = datetime.datetime.now() # the time when the dataset is last used for training

    def get(self):
        """ Get the x,y of what the dataset represents

            Returns
            -------
            np.array, np.array
        """

        # download only if file doesn't already exist on disk
        target_path = data_path / "{}.npz".format(self.id)
        if not target_path.exists():
            r = requests.get(self.url, allow_redirects=True)
            if not r:
                raise Exception("Failed to retrieve npz from {}".format(self.url))
            with open(target_path, 'wb') as f:
                f.write(r.content)
        
        self.last_accessed = datetime.datetime.now() # update last-accessed
        return load_file(target_path)

    def check_and_remove(self):
        """ Check if the data has been accessed in the last 20 minutes and
            deletes the local copy if not. Returns if there is deletion

            Returns
            -------
            Bool
        """
        # if > 20 min without access
        if (datetime.datetime.now() - self.last_accessed).total_seconds() > (20*60):
            self.remove()
            return True
        return False

    def remove(self):
        """ Removes the local copy of the dataset if it exists
        """

        target_path = data_path / "{}.npz".format(self.id)
        if not target_path.exists():
            return
        print("Removing dataset {}".format(self.id))
        os.remove(target_path)