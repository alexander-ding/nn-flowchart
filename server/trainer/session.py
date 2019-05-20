from keras.models import Model
from keras.callbacks import LambdaCallback, Callback
from keras import backend as K
from .layers import *
from .optimizers import *
from .losses import *
from .inputs import *
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
        self.batch_size = int(data['modelInfo']['batchSize'])
        self.epochs = int(data['modelInfo']['epochs'])
        self.dataset = self.model['0']["parameters"]["data"]
        self.max_token = data['modelInfo']['maxToken']
        self.optimizer = data['modelInfo']['optimizer']
        self.lr = float(data['modelInfo']['learningRate'])
        self.loss_function = data['modelInfo']['loss']
        self.num_classes = None
        self.data_loaded = False # is training data loaded
        self.trained = False # is the session done training
        self.thread = None # the training thread
        self.current_epoch = 0
        self.corrects = 0
        self.all = 0
        self.accuracy = 0.0 # 0.0 to 1.0
        self.progress = 0.0 # 0.0 to 1.0
        self.test_accuracy = 0.0 # 0.0 to 1.0
        self.loss = 0.0 # current loss
        self.killed = False # whether the training is killed
    
    def save_model(self):
        return self.compiled_model.to_json()

    def compile_model(self):
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
            para = latest_model['parameters']
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

                epochs = self.epochs
                batch_size = self.batch_size
                num_classes = self.num_classes

                (x_train, y_train), (x_test, y_test) = get_input(self.dataset, num_classes)

                
                

                # now data is ready
                self.data_loaded = True
                batches_per_epoch = x_train.shape[0]//batch_size
                def update_progress(batch, logs={}):
                    self.progress = (self.current_epoch*batches_per_epoch+batch) / (epochs*batches_per_epoch)
                    self.progress = round(self.progress * 1000) / 1000 # round off some digits
                    self.corrects += int(logs.get('acc') * batch_size)
                    self.all += batch_size
                    self.accuracy = self.corrects / self.all
                    self.loss = logs.get('loss')

                def epoch_end(epoch, logs={}):
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
                _, acc = self.compiled_model.evaluate(x_test, y_test,
                                            batch_size=batch_size, 
                                            verbose=0)
                self.test_accuracy = acc
                self.trained = True
        t = threading.Thread(target=thread_function)
        t.start()
        self.thread = t
