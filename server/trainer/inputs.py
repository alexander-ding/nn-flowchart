""" Handles getting input given the model
"""

import keras 

from keras.preprocessing import sequence
from keras.datasets import mnist, imdb

from pathlib import Path
from ..utils import shuffle_together
from ..Model import db
from ..datasets import datasets
BASE = Path(__file__).parent.parent.parent

def get_custom_input(datasetID):
    """ Gets a custom (user-specified) training dataset like
        (x_train, y_train), (x_test, y_test)

        Returns
        -------
        ((np.array, np.array), (np.array, np.array))
    """
    x, y = datasets.get(datasetID)
    x, y = shuffle_together(x, y)
    return (x[x.shape[0]//5:,:], y[x.shape[0]//5:]), (x[:x.shape[0]//5,:], y[:y.shape[0]//5])
    
def get_input(dataset, datasetID, num_classes, update):
    """ Gets the training dataset specified like
        (x_train, y_train), (x_test, y_test)
        and calls update when loaded

        Returns
        -------
        ((np.array, np.array), (np.array, np.array))
    """

    # if it is not a preset
    if dataset not in ["MNIST", "IMDB"]:
        (x_train, y_train), (x_test, y_test) = get_custom_input(datasetID)
    
    # presets: preprocess
    if dataset == "MNIST":
        (x_train, y_train), (x_test, y_test) = mnist.load_data()
        x_train = x_train.reshape(x_train.shape[0], x_train.shape[1], x_train.shape[2], 1)
        x_test = x_test.reshape(x_test.shape[0], x_test.shape[1], x_test.shape[2], 1)
        
        x_train = x_train.astype("float32") / 255
        x_test = x_test.astype("float32") / 255

    elif dataset == "IMDB":
        (x_train, y_train), (x_test, y_test) = imdb.load_data(num_words=1000)
        x_train = sequence.pad_sequences(x_train, 500)
        x_test = sequence.pad_sequences(x_test, 500)

    y_train = keras.utils.to_categorical(y_train, num_classes)
    y_test = keras.utils.to_categorical(y_test, num_classes)

    # randomize the data
    
    x_train, y_train = shuffle_together(x_train, y_train)
    x_test, y_test = shuffle_together(x_test, y_test)
    update(True, None)
    return (x_train, y_train), (x_test, y_test)