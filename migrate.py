# Migration script

from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand
print("Importing db")
from server import db
from run import create_app
print("Creating app")
app = create_app('config')
print("App created")

migrate = Migrate(app, db)
manager = Manager(app)
manager.add_command('db', MigrateCommand)


if __name__ == '__main__':
    manager.run()