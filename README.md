# Neural Net Flowchart

An in-browser playground to rapidly experiment with simple neural network architectures.

## Features

- Use the simple drag-and-drop UI to define neural network architecture
- Train and test in the browser with Tensorflow.js
- Save your model and share the permalink
- Download your model as a Tensorflow.js JSON file

## Getting Started

This codebase uses two servers: a Flask server for the backend API and a React-based frontend (which, after it is built, can be deployed by any static server).

### For the Frontend (assuming Mac OS)

First install `homebrew`.

```Bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Then use it to install `NodeJS`.

```Bash
brew install node
```

Go install all the dependencies via

```Bash
npm install
```

Finally, go make a production build, which bundles together the frontend code into one `/build` folder to be served by the server.

```Bash
npm run build
```

To serve the build, install

```Bash
npm i serve
serve -s build
```

Or use your preferred static server.

Now you're all set for the frontend.

### For the Backend

Setup an SQL server and create a database. Then go to `config.py` to setup the SQL login.

For example, for Postgres,

```Python
SQLALCHEMY_DATABASE_URI = "postgresql://{login}:{password}@{database_url}/{tablename}"
```

Now we install the Python dependencies:

```Bash
pip install -r requirements.txt
```

One last thing, be sure to migrate the database (see below). Run `python run.py` to start the server.
Then go `serve -s build` to serve the frontend. Things should be working now.

## Migrate Database

If the directory `server/migrations` does not exist, run

```Bash
python migrate.py db init
```

and complete the following.

Every time the SQL database structure is updated in the Python code, run the following code in order to update the SQL server.

```Bash
python migrate.py db migrate
python migrate.py db upgrade
```
