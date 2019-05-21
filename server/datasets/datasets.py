from .dataset import Dataset, data_path
import time, threading

class Datasets:
    def __init__(self):
        self.datasets = {}
        self.initialized = False

    def get(self, id):
        if id not in self.datasets.keys() and self.initialized:
            from ..Model import Dataset, Link
            r = Dataset.query.with_entities(Link.modelID, Link.link).filter_by(datasetID=p.stem).all()
            if len(r) != 0:
                r = r[0]
                
                self.new_dataset(r[0], r[1])

        return self.datasets[id].get()

    def new_dataset(self, id, url):
        if not self.initialized:
            self.initialize()
        self.datasets[id] = Dataset(id, url)

    def clean(self):
        print("Cleaning routine!")
        self.datasets = {k:v for k,v in self.datasets.items() if not v.check_and_remove()}
        threading.Timer(600, self.clean).start()
    
    def initialize(self):
        if self.initialized:
            return
        self.initialized = True
        from ..Model import Dataset
        for p in data_path.glob("*.npz"):
            self.new_dataset(p.stem, Dataset.query.filter_by(datasetID=p.stem).all()[0])
        self.clean()

