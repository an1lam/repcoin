# A script that outputs metrics about Repcoin usage
from pymongo import MongoClient
from datetime import datetime
from datetime import timedelta
import os

MONGOLAB_URI = "mongodb://admin:" + os.environ['DB_PASSWORD'] + "@ds051681-a0.mongolab.com:51681/heroku_app31747026?replicaSet=rs-ds051681"
def output_metrics():
  print "Connecting to MongoLab..."
  client = MongoClient(MONGOLAB_URI,
                     connectTimeoutMS=30000,
                     socketTimeoutMS=None,
                     socketKeepAlive=True)
  db = client.heroku_app31747026
  print "Connected!\n"
  print "\nOutputting user counts...\n"
  output_user_count(db)
  print "\nOutputting category counts...\n"
  output_category_count(db)

def output_user_count(db):
  usersnapshots = db.usersnapshots
  day = datetime(2015, 2, 15)
  while (day < datetime.now()):
    shots = usersnapshots.find({ "timeStamp": { "$gte": day, "$lt": day + timedelta(days=1) }})
    print shots.count()
    day += timedelta(days=1)

def output_category_count(db):
  categorysnapshots = db.categorysnapshots
  day = datetime(2015, 2, 15)
  while (day < datetime.now()):
    shots = categorysnapshots.find({ "timeStamp": { "$gte": day, "$lt": day + timedelta(days=1) }})
    print shots.count()
    day += timedelta(days=1)

output_metrics()
