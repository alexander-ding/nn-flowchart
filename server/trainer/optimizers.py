""" Any operation regarding an optimizer
"""

from keras.optimizers import *

def get_optimizer(s, lr):
    """ Generates a Keras optimizer based on the name and the learning rate

        Returns
        -------
        keras.optimizer
    """
    if s == 'adam':
        return Adam(lr)
    elif s == 'sgd':
        return SGD(lr)
    elif s == 'rmsProp':
        return RMSprop(lr)