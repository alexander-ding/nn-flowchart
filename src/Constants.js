export const DELETE_KEY = 8; // keycode
export const BASE = "http://localhost:5000/"
export const BASE_URL = BASE + "api/"; //"http://localhost:5000"; 

export const DATASET_SHAPE = {
    "MNIST": {
        "input": [28, 28, 1],
        "output": [10],
    },
    "IMDB": {
        "input": [500],
        "output": [2],
    }
}