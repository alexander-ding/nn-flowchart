""" A file for the Session class that trains one particular model once
"""

from keras.models import Model
from keras.callbacks import LambdaCallback, Callback
from keras import backend as K
import tensorflow as tf
import threading

class EarlyStopper(Callback):
    """ This is for Keras to enable stopping training early
        if the training session is killed
    """
    def __init__(self, base):
        super().__init__()
        self.base = base # a reference to the Keras model 
    
    def on_batch_end(self, batch, logs={}):
        """ Checks every batch whether the training is to be stopped
        """
        if self.base.killed:
            self.model.stop_training = True

class Session:
    """ A training session with a given model and an ID

        Call Session.train() to start training
    """
    def __init__(self, id, data):
        self.id = id
        self.model = data['model']
        self.compiled_model = None
        self.batch_size = int(data['modelInfo']['batchSize'])
        self.epochs = int(data['modelInfo']['epochs'])
        self.dataset = self.model['0']["parameters"]["data"]
        self.datasetID = self.model['0']["parameters"]["datasetID"]
        self.max_token = data['modelInfo']['maxToken']
        self.optimizer = data['modelInfo']['optimizer']
        self.lr = float(data['modelInfo']['learningRate'])
        self.loss_function = data['modelInfo']['loss']

        self.num_classes = None # the number of classes to be classified to (for classifiers)
        self.data_loaded = False # is training data loaded
        self.data_err = None # any error in loading data
        self.trained = False # is the session done training
        self.thread = None # the training thread
        

        self.all = 0 # all the questions predictions currently made 
        self.corrects = 0 # how many of the current predictions are right
        
        self.current_epoch = 0
        self.accuracy = 0.0 # 0.0 to 1.0; training progress
        self.progress = 0.0 # 0.0 to 1.0
        self.test_accuracy = 0.0 # 0.0 to 1.0
        self.loss = 0.0 # current loss
        self.killed = False # whether the training session is killed
    
    def save_model(self):
        """ Return the json string describing the model

            Returns
            -------
            str
        """
        return self.compiled_model.to_json()

    def compile_model(self):
        """ Compile the described model into Keras model ready
            for training
        """
        model = self.model
        
        latest_model = model['0']
    
        # handle input layer
        input = input_layer(latest_model)

        # do middle layers
        layer = input
        while (latest_model['type'] != 'output'):
            # get next layer in model
            latest_model = model[str(latest_model['connectedTo'])]

            # add layer to Keras model
            if (latest_model['type'] == 'dense'):
                layer = dense_layer(latest_model, layer)

            elif (latest_model['type'] == 'conv'):
                layer = conv_layer(latest_model, layer)

            elif (latest_model['type'] == "maxpool"):
                layer = maxpool_layer(latest_model, layer)

            elif (latest_model['type'] == 'embedding'):
                layer = embedding_layer(latest_model, layer, self.max_token)
            
            elif (latest_model['type'] == "flatten"):
                layer = flatten_layer(latest_model, layer)

            elif (latest_model['type'] == "dropout"):
                layer = dropout_layer(latest_model, layer)
                
            elif (latest_model['type'] == "output"):
                layer = output_layer(latest_model, layer)
                
        self.num_classes = latest_model['shapeOut'][-1]
        output = layer

        # setup model
        m = Model(inputs=input, outputs=output)
        m.compile(loss=get_loss(self.loss_function),
                  optimizer=get_optimizer(self.optimizer, self.lr),
                  metrics=['accuracy'])
        m._make_predict_function()
        m._make_test_function()
        m._make_train_function()
        # handle output layer
        self.compiled_model = m
        m.summary()

    def update(self, t, err):
        """ Update whether the data has been loaded
        """
        self.data_loaded = t
        self.data_err = err

    def train(self):
        """ Adds a thread to train the model.
            The thread updates the class about the
            current status of the training

            Calls back when training is done
        """
        def thread_function():
            """ This is pretty much what the parent function is supposed to do
                Just embedded as another function for threading to work
            """

            # need to start a new session with a new graph to make backprop
            # work out
            with tf.Session(graph=tf.Graph()) as sess:
                print("Session {}: compiling model".format(self.id))
                K.set_session(sess)
                self.compile_model()

                # loads data
                print("Session {}: loading and preprocessing data".format(self.id))

                epochs = self.epochs
                batch_size = self.batch_size
                num_classes = self.num_classes

                (x_train, y_train), (x_test, y_test) = get_input(self.dataset, self.datasetID, num_classes, self.update)
                
                print("Data shapes")
                print("x_train: {}; y_train: {}".format(x_train.shape, y_train.shape))
                print("x_test: {}; y_test: {}".format(x_test.shape, y_test.shape))
                # now data is ready
                self.data_loaded = True
                batches_per_epoch = x_train.shape[0]//batch_size
                def update_progress(batch, logs={}):
                    """ Updates the relevant progress values of the class as each batch
                        progresses
                    """
                    self.progress = (self.current_epoch*batches_per_epoch+batch) / (epochs*batches_per_epoch)
                    self.progress = round(self.progress * 1000) / 1000 # round off some digits
                    self.corrects += int(logs.get('acc') * batch_size)
                    self.all += batch_size
                    self.accuracy = self.corrects / self.all
                    self.loss = logs.get('loss')

                def epoch_end(epoch, logs={}):
                    """ Special update for the end of each epoch, clearing out the current
                        accuracy as the new epoch starts
                    """
                    _, acc = self.compiled_model.evaluate(x_test, y_test,
                                            batch_size=batch_size, 
                                            verbose=0)
                    self.test_accuracy = acc
                    self.current_epoch += 1
                    self.corrects = 0
                    self.all = 0
                
                cb = LambdaCallback(on_batch_end=update_progress, on_epoch_end=epoch_end)
                print("Session {}: training".format(self.id))
                self.compiled_model.fit(x_train, y_train,
                                        batch_size=batch_size,
                                        epochs=epochs,
                                        callbacks=[cb, EarlyStopper(self)],
                                        verbose=0)
                print("Session {}: evaluating".format(self.id))
                self.trained = True

        # just starts a new training thread
        t = threading.Thread(target=thread_function)
        t.start()
        self.thread = t
