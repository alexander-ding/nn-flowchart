""" Defines the class Datasets to manage all the Dataset
"""

from .dataset import Dataset, data_path
import time, threading

class Datasets:
    """ Manage all the datasets
    """

    def __init__(self):
        self.datasets = {} # key is the dataset ID
        self.initialized = False

    def get(self, id):
        """ Gets the dataset represented by the ID

            Returns
            -------
            np.array, np.array
        """

        if id not in self.datasets.keys() and self.initialized:
            # get the dataset on the sql database if it is not stored locally yet
            from ..Model import Dataset, Link
            r = Dataset.query.with_entities(Link.modelID, Link.link).filter_by(datasetID=p.stem).all()
            if len(r) != 0:
                r = r[0]
                
                # add it to the local representation
                self.new_dataset(r[0], r[1])

        # if it is already existing locally, then go get
        return self.datasets[id].get()

    def new_dataset(self, id, url):
        """ Adds a new local representation of a dataset in the SQL server,
            initializing the class if not already
        """

        if not self.initialized:
            self.initialize()
        self.datasets[id] = Dataset(id, url)

    def clean(self):
        """ Periodically clears all the local datasets that have not been accessed
            lately
        """
        print("Cleaning routine!")
        self.datasets = {k:v for k,v in self.datasets.items() if not v.check_and_remove()}
        threading.Timer(600, self.clean).start() # schedule the next one
    
    def initialize(self):
        """ Initialize self and adds all datasets whose files exist in the data/ directory
            as local representations (to clean up later)
        """
        
        if self.initialized:
            return
        self.initialized = True
        from ..Model import Dataset
        for p in data_path.glob("*.npz"):
            self.new_dataset(p.stem, Dataset.query.filter_by(datasetID=p.stem).all()[0])
        self.clean()

