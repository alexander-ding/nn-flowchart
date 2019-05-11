import {BASE_URL} from "./Constants.js";

export function getModel(modelID) {
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
  return fetch(BASE_URL+"Train?id="+sessionID).then(response => {
    if (response.status === 200) {
      return response.json();
    }
    throw new Error("Training session failed to be fetched");
  })
}

export function deleteTrain(sessionID) {
  return fetch(BASE_URL+"Train", {
    method: "DELETE",
    body: JSON.stringify({id:sessionID}),
  });
}

export function generateLink(id) {
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