# The script to migrate the python representation of database into
# the actual sql server

from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand
print("Importing db")
from server import db
from run import create_app
import os
print("Creating app")
app = create_app('config')
print("App created")

MIGRATION_DIR = os.path.join('server', 'migrations')

migrate = Migrate(app, db, directory=MIGRATION_DIR)
manager = Manager(app)
manager.add_command('db', MigrateCommand)


if __name__ == '__main__':
    manager.run()