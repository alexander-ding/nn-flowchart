from pathlib import Path
import numpy as np
import requests
import threading
import datetime
import os

data_path = Path(__file__).parent.parent.parent / "data"

def load_file(p):
    archive = np.load(p)
    return archive['x'], archive['y']

class Dataset:
    def __init__(self, id, url):
        self.id = id
        self.url = url
        self.last_accessed = datetime.datetime.now()

    def get(self):
        # download only if file doesn't already exist on disk
        target_path = data_path / "{}.npz".format(self.id)
        if not target_path.exists():
            r = requests.get(self.url, allow_redirects=True)
            if not r:
                raise Exception("Failed to retrieve npz from {}".format(self.url))
            with open(target_path, 'wb') as f:
                f.write(r.content)
        
        self.last_accessed = datetime.datetime.now()
        return load_file(target_path)

    def check_and_remove(self):
        # if > 20 min without access
        if (datetime.datetime.now() - self.last_accessed).total_seconds() > (20*60):
            self.remove()
            return True
        return False

    def remove(self):
        target_path = data_path / "{}.npz".format(self.id)
        if not target_path.exists():
            return
        print("Removing dataset {}".format(self.id))
        os.remove(target_path)
    
datasets = {}