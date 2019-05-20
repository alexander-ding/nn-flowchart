from keras.optimizers import *

def get_optimizer(s, lr):
    if s == 'adam':
        return Adam(lr)
    elif s == 'sgd':
        return SGD(lr)
    elif s == 'rmsProp':
        return RMSprop(lr)