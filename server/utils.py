""" Utility functions for little things
"""

from os.path import splitext
from urllib.parse import urlparse
import numpy as np
import requests
import mimetypes
import random
import string

def get_ext(url):
    """ Return the filename extension from url, or '.'

        Returns
        -------
        str
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
    """ Shuffle two arrays (of the same size) together

        Returns
        -------
        np.array, np.array
    """
    indices = np.random.permutation(a.shape[0])
    return (a[indices], b[indices])

def new_key(N=10):
    """ Helper function to generate a random key

        Returns
        -------
        str
    """

    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=N))