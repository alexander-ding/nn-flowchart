import {BASE_URL} from "./Constants.js";

// functions to communicate with the server

export function getModel(modelID) {
  /* get a model given its id from the server */
  return fetch(BASE_URL+"Architecture?id="+modelID).then(response => { 
    if (response.status === 200 || response.status === 404 || response.status === 400) {
      return response.json();
    }
    throw new Error("Something went wrong when getting model");
  }).then(json => {
    if ('message' in json) {
      throw new Error(json['message']);
    }
    return json.data['modelJSON'];
  })
}

export function saveModel(serializedModel) {
  /* save the serialized model to the server and returns its id */
  return fetch(BASE_URL+'Architecture', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: serializedModel,
  }).then(response => {
    if (response.status === 201) {
      return response.json();
    } else {
      throw new Error("Something went wrong");
    }
  })
}

export function startSession(id) {
  /* start a new training session given the model id */
  return fetch(BASE_URL+"Train", {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({id:id}),
  }).then(response => {
    if (response.status === 201) {
      return response.json();
    }
    throw new Error("Internal error");
  });
}

export function updateTrain(sessionID) {
  /* get the latest training status of a training session */
  return fetch(BASE_URL+"Train?id="+sessionID).then(response => {
    if (response.status === 200) {
      return response.json();
    }
    throw new Error("Training session failed to be fetched");
  })
}

export function deleteTrain(sessionID) {
  /* delete the training session given its session id */
  return fetch(BASE_URL+"Train", {
    method: "DELETE",
    body: JSON.stringify({id:sessionID}),
  });
}

export function generateLink(id) {
  /* generate a link for a saved model at the server */
  return fetch(BASE_URL+"Link", {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({modelID: id})
  }).then(response => {
    if (response.status === 201) {
      return response.json();
    }
    throw new Error("Failed to generate link");
  })
}

export function getIDFromLink(link) {
  /* get the corresponding model ID from the link */
  return fetch(BASE_URL+"Link?link="+link).then(response => {
    if (response.status === 200 || response.status === 404 || response.status === 400)
      return response.json();
    throw new Error("Something went wrong with retrieving ID from link");
  }).then(json => {
    if ('message' in json) {
      throw new Error(json['message']);
    }
    return json['id'];
  })
}

export function downloadModel(modelID) {
  /* get the json download for the model from its model ID */
  return fetch(BASE_URL+"Download?id="+modelID).then(response => {
    if (response.status === 200 || response.status === 404 || response.status === 400)
      return response.json();
    throw new Error("Something went wrong with downloading the model");
  }).then(json => {
    if ('message' in json) {
      throw new Error(json['message']);
    }
    return json['data'];
  })
}

export function loadInput(url, name, inputShape, outputShape) {
  /* load the custom input from the server */
  return fetch(BASE_URL+"Dataset", {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      link: url,
      datasetName: name,
      inputShape: String(inputShape),
      outputShape: String(outputShape),
    })
  }).then(response => {
    if (response.status === 201 || response.status === 404 || response.status === 400) 
      return response.json();
    throw new Error("Something went wrong when loading the input");
  }).then(json => {
    console.log(json);
    if ('message' in json) {
      throw new Error(json['message']);
    }
    return json['data'];
  });
}