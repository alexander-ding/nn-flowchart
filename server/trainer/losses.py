from keras.losses import *

def get_loss(s):
    if s=="mse":
        return mean_squared_error
    elif s=="logcosh":
        return logcosh
    elif s=="cce":
        return categorical_crossentropy