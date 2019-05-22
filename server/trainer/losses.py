""" Loss function handling
"""

from keras.losses import *

def get_loss(s):
    """ Returns a loss function based on the name

        Returns
        -------
        keras.losses
    """
    if s=="mse":
        return mean_squared_error
    elif s=="logcosh":
        return logcosh
    elif s=="cce":
        return categorical_crossentropy