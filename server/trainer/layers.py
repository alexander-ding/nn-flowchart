from keras.layers import Dense, Dropout, Flatten, Input, Embedding
from keras.layers import Conv1D, Conv2D, Conv3D, MaxPooling2D, MaxPooling1D, MaxPooling3D, ReLU

def input_layer(latest_model):
    return Input(latest_model['shapeOut'][1:])

def dense_layer(latest_model, layer):
    para = latest_model['parameters']
    return Dense(para['units'], activation=latest_model['activation'])(layer)

def conv_layer(latest_model, layer):
    para = latest_model['parameters']
    if isinstance(para['kernelSize'], int):
        conv = Conv1D
    elif len(para['kernelSize']) == 2:
        conv = Conv2D
    elif len(para['kernelSize']) == 3:
        conv = Conv3D
    
    return conv(filters=para['filters'], kernel_size=para['kernelSize'], strides=para['stride'], activation=latest_model['activation'])(layer)

def maxpool_layer(latest_model, layer):
    para = latest_model['parameters']
    # convert to list if number only
    para['poolSize'] = para['poolSize'] if isinstance(para['poolSize'], (list, tuple)) else [para['poolSize']]

    if len(para['poolSize']) == 1:
        maxpool = MaxPooling1D
    elif len(para['poolSize']) == 2:
        maxpool = MaxPooling2D
    elif len(para['poolSize']) == 3:
        maxpool = MaxPooling3D
    
    return maxpool(pool_size=para['poolSize'])(layer)

def embedding_layer(latest_model, layer, max_token):
    para = latest_model['parameters']
    return Embedding(max_token, para["units"], input_length=latest_model["shapeIn"][1])(layer)

def flatten_layer(latest_model, layer):
    return Flatten()(layer)

def dropout_layer(latest_model, layer):
    para = latest_model['parameters']
    return Dropout(para['rate'])(layer)

def output_layer(latest_model, layer):
    return Dense(latest_model['shapeOut'][-1], activation=latest_model['activation'])(layer)