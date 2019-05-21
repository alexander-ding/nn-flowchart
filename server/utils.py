from os.path import splitext
from urllib.parse import urlparse
import numpy as np
import requests
import mimetypes

def get_ext(url):
    """ Return the filename extension from url, or '.'
    """
    r = requests.get(url)
    if not r:
        return None
    if r.headers['Content-Type'] == "application/x-zip":
        return '.npz'
    parsed = urlparse(url)
    root, ext = splitext(parsed.path)
    return ext

def shuffle_together(a, b):
    indices = np.random.permutation(a.shape[0])
    return (a[indices], b[indices])