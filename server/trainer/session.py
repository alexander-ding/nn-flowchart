import keras
from keras.datasets import mnist
from keras.models import Model
from keras.layers import Dense, Dropout, Flatten, Input
from keras.layers import Conv2D, MaxPooling2D, ReLU
from keras.callbacks import LambdaCallback, Callback
from keras import backend as K
import tensorflow as tf
import threading

class EarlyStopper(Callback):
    def __init__(self, base):
        super().__init__()
        self.base = base
    
    def on_batch_end(self, batch, logs={}):
        if self.base.killed:
            self.model.stop_training = True

class Session:
    def __init__(self, id, data):
        self.id = id
        self.model = data['model']
        self.compiled_model = None
        self.batch_size = int(data['batchSize'])
        self.epochs = int(data['epochs'])
        self.num_classes = None
        self.dataset = None # name of dataset
        self.data_loaded = False # is training data loaded
        self.trained = False # is the session done training
        self.thread = None # the training thread
        self.current_epoch = 0
        self.corrects = 0
        self.all = 0
        self.accuracy = 0.0 # 0.0 to 1.0
        self.progress = 0.0 # 0.0 to 1.0
        self.test_accuracy = 0.0 # 0.0 to 1.0
        self.killed = False # whether the training is killed
        self.train()
    
    def compile_model(self):
        model = self.model
        latest_model = model['0']
        batch_size = latest_model['parameters']['batchSize']

        # handle input layer
        input_layer = Input(latest_model['shapeOut'][1:])

        # do middle layers
        layer = input_layer
        layer = Flatten()(layer) # for now
        while (latest_model['type'] != 'output'):
            # get next layer in model
            latest_model = model[str(latest_model['connectedTo'])]

            # add layer to Keras model
            para = latest_model['parameters']
            if (latest_model['type'] == 'dense'):
                layer = Dense(para['units'], activation=latest_model['activation'])(layer)
            elif (latest_model['type'] == "output"):
                layer = Dense(latest_model['shapeOut'][-1], activation='softmax')(layer)
        self.num_classes = latest_model['shapeOut'][-1]
        output_layer = layer

        # setup model
        m = Model(inputs=input_layer, outputs=output_layer)
        m.compile(loss=keras.losses.categorical_crossentropy,
                  optimizer=keras.optimizers.Adam(lr=0.01),
                  metrics=['accuracy'])
        m._make_predict_function()
        m._make_test_function()
        m._make_train_function()
        # handle output layer
        self.batch_size = batch_size
        self.compiled_model = m

        self.dataset = model["0"]["parameters"]["data"]
    
    def train(self):
        """ Adds a thread to train the model.
            The thread updates the class about the
            current status of the training

            Calls back when training is done
        """
        def thread_function():
            with tf.Session(graph=tf.Graph()) as sess:
                print("Session {}: compiling model".format(self.id))
                K.set_session(sess)
                self.compile_model()

                # loads data
                print("Session {}: loading and preprocessing data".format(self.id))
                if self.dataset == "MNIST":
                    (x_train, y_train), (x_test, y_test) = mnist.load_data()
                
                # preprocess
                x_train = x_train.astype("float32") / 255
                x_test = x_test.astype("float32") / 255

                epochs = self.epochs
                batch_size = self.batch_size
                num_classes = self.num_classes
                y_train = keras.utils.to_categorical(y_train, num_classes)
                y_test = keras.utils.to_categorical(y_test, num_classes)

                # now data is ready
                self.data_loaded = True
                batches_per_epoch = x_train.shape[0]//batch_size
                def update_progress(batch, logs={}):
                    self.progress = (self.current_epoch*batches_per_epoch+batch) / (epochs*batches_per_epoch)
                    self.progress = round(self.progress * 1000) / 1000 # round off some digits
                    self.corrects += int(logs.get('acc') * batch_size)
                    self.all += batch_size
                    self.accuracy = self.corrects / self.all

                def epoch_end(epoch, logs={}):
                    self.current_epoch += 1
                    self.corrects = 0
                    self.all = 0
                
                def training_end(logs={}):
                    self.trained = True
                
                cb = LambdaCallback(on_batch_end=update_progress, on_train_end=training_end, on_epoch_end=epoch_end)
                print("Session {}: training".format(self.id))
                self.compiled_model.fit(x_train, y_train,
                                        batch_size=batch_size,
                                        epochs=epochs,
                                        callbacks=[cb, EarlyStopper(self)],
                                        verbose=0)

                print("Session {}: evaluating".format(self.id))
        t = threading.Thread(target=thread_function)
        t.start()
        self.thread = t
