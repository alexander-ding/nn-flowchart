""" Handling the details of getting different kinds of Keras layers from the server's model's layer
"""

from keras.layers import Dense, Dropout, Flatten, Input, Embedding
from keras.layers import Conv1D, Conv2D, Conv3D, MaxPooling2D, MaxPooling1D, MaxPooling3D, ReLU

def input_layer(layer):
    """ Gets an Input layer

        Returns
        -------
        keras.layer
    """
    return Input(['shapeOut'][1:])

def dense_layer(layer, model):
    """ Gets a Dense layer and applies it to the current model

        Returns
        -------
        keras.layer
    """
    para = layer['parameters']
    return Dense(para['units'], activation=layer['activation'])(model)

def conv_layer(layer, model):
    """ Gets a Convolutional layer (ndim to-be-determined) and applies it 
        to the current model

        Returns
        -------
        keras.layer
    """
    para = layer['parameters']
    if isinstance(para['kernelSize'], int):
        conv = Conv1D
    elif len(para['kernelSize']) == 2:
        conv = Conv2D
    elif len(para['kernelSize']) == 3:
        conv = Conv3D
    
    return conv(filters=para['filters'], kernel_size=para['kernelSize'], strides=para['stride'], activation=layer['activation'])(model)

def maxpool_layer(layer, model):
    """ Gets a MaxPool layer (ndim to-be-determined) and applies it
        to the current model

        Returns
        -------
        keras.layer
    """
    para = layer['parameters']
    # convert to list if number only
    para['poolSize'] = para['poolSize'] if isinstance(para['poolSize'], (list, tuple)) else [para['poolSize']]

    if len(para['poolSize']) == 1:
        maxpool = MaxPooling1D
    elif len(para['poolSize']) == 2:
        maxpool = MaxPooling2D
    elif len(para['poolSize']) == 3:
        maxpool = MaxPooling3D
    
    return maxpool(pool_size=para['poolSize'])(model)

def embedding_layer(layer, model, max_token):
    """ Gets an Embedding layer given the biggest possible token index
        and applies it to the current model

        Returns
        -------
        keras.layer
    """
    para = layer['parameters']
    return Embedding(max_token, para["units"], input_length=layer["shapeIn"][1])(model)

def flatten_layer(layer, model):
    """ Gets a Flatten layer and applies it to the current model

        Returns
        -------
        keras.layer
    """
    return Flatten()(model)

def dropout_layer(layer, model):
    """ Gets a Dropout layer and applies it to the current model

        Returns
        -------
        keras.layer
    """
    para = layer['parameters']
    return Dropout(para['rate'])(model)

def output_layer(layer, model):
    """ Gets an Output layer and applies it to the current model

        Returns
        -------
        keras.layer
    """
    return Dense(layer['shapeOut'][-1], activation=layer['activation'])(model)