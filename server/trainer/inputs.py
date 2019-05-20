import keras 

from keras.preprocessing import sequence
from keras.datasets import mnist, imdb

def get_input(dataset, num_classes):
    if dataset == "MNIST":
        (x_train, y_train), (x_test, y_test) = mnist.load_data()
        x_train = x_train.reshape(x_train.shape[0], x_train.shape[1], x_train.shape[2], 1)
        x_test = x_test.reshape(x_test.shape[0], x_test.shape[1], x_test.shape[2], 1)
        
        # preprocess
        x_train = x_train.astype("float32") / 255
        x_test = x_test.astype("float32") / 255
    elif self.dataset == "IMDB":
        (x_train, y_train), (x_test, y_test) = imdb.load_data(num_words=1000)
        x_train = sequence.pad_sequences(x_train, 500)
        x_test = sequence.pad_sequences(x_test, 500)

    y_train = keras.utils.to_categorical(y_train, num_classes)
    y_test = keras.utils.to_categorical(y_test, num_classes)

    return (x_train, y_train), (x_test, y_test)