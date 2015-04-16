# A script that outputs metrics about Repcoin usage
from pymongo import MongoClient
from datetime import datetime
from datetime import timedelta
import os

MONGOLAB_URI = "mongodb://admin:" + os.environ['DB_PASSWORD'] + "@ds051681-a0.mongolab.com:51681/heroku_app31747026?replicaSet=rs-ds051681"
def output_metrics():
  print "Connecting to MongoLab"
  client = MongoClient(MONGOLAB_URI,
                     connectTimeoutMS=30000,
                     socketTimeoutMS=None,
                     socketKeepAlive=True)
  db = client.heroku_app31747026
  print "Connected!"

  print "\nuser counts"
  output_user_count(db)

  print "\ncategory counts"
  output_category_count(db)

  print "\ntransaction counts"
  output_transaction_count(db)

  print "\ntransaction creators per day"
  output_transaction_creating_users_per_day(db)

  print "\ntransaction receivers per day"
  output_transaction_receiving_users_per_day(db)

  print "\ncategories with transactions per day"
  output_categories_with_transactions_per_day(db)

  print "\nUsers with expert categories per day"
  output_users_with_expert_categories_per_day(db)

  print "\nUsers with investments per day"
  output_users_with_investments_per_day(db)

  print "\nPercent of users with no activity per day"
  output_percent_inactive_users_per_day(db)

  print "\nUsers with content links"
  print users_with_content_links(db)

  print "\nUsers with location"
  print users_with_location(db)

def output_user_count(db):
  day = datetime(2015, 2, 16)
  while (day < datetime.now()):
    print db.usersnapshots.find({ "timeStamp": { "$gte": day, "$lt": day + timedelta(days=1) }}).count()
    day += timedelta(days=1)

def output_category_count(db):
  day = datetime(2015, 2, 16)
  while (day < datetime.now()):
    print db.categorysnapshots.find({ "timeStamp": { "$gte": day, "$lt": day + timedelta(days=1) }}).count()
    day += timedelta(days=1)

def output_transaction_count(db):
  day = datetime(2015, 2, 16)
  while (day < datetime.now()):
    print db.transactions.find({ "timeStamp": { "$gte": day, "$lt": day + timedelta(days=1) }}).count()
    day += timedelta(days=1)

def output_categories_with_transactions_per_day(db):
  day = datetime(2015, 2, 16)
  while (day < datetime.now()):
    categories = db.transactions.aggregate([
      { "$match": { "timeStamp": { "$gte": day, "$lt": day + timedelta(days=1) }}},
      { "$group": { "_id": "$category" }}
    ])
    print getSize(categories)
    day += timedelta(days=1)

def output_transaction_creating_users_per_day(db):
  day = datetime(2015, 2, 16)
  while (day < datetime.now()):
    transactionsToday = db.transactions.aggregate([
      { "$match": { "timeStamp": { "$gte": day, "$lt": day + timedelta(days=1) }}},
      { "$group": { "_id": "$from.id" }}
    ])
    print getSize(transactionsToday)
    day += timedelta(days=1)

def output_transaction_receiving_users_per_day(db):
  day = datetime(2015, 2, 16)
  while (day < datetime.now()):
    transactionsToday = db.transactions.aggregate([
      { "$match": { "timeStamp": { "$gte": day, "$lt": day + timedelta(days=1) }}},
      { "$group": { "_id": "$to.id" }}
    ])
    print getSize(transactionsToday)
    day += timedelta(days=1)

def users_with_content_links(db):
  return db.users.find({ "$where": "this.links.length > 0" }).count()

def users_with_location(db):
  return db.users.find({ "location": { "$exists": "true" }}).count()

def output_users_with_expert_categories_per_day(db):
  day = datetime(2015, 2, 16)
  while (day < datetime.now()):
    print db.usersnapshots.find(
      {
        "$where": "this.categories.length > 0",
        "timeStamp": { "$gte": day, "$lt": day + timedelta(days=1) }
      }
    ).count()
    day += timedelta(days=1)

def output_users_with_investments_per_day(db):
  day = datetime(2015, 2, 16)
  while (day < datetime.now()):
    print db.usersnapshots.find(
      {
        "$where": "this.portfolio.length > 0",
        "timeStamp": { "$gte": day, "$lt": day + timedelta(days=1) }
      }
    ).count()
    day += timedelta(days=1)

def output_percent_inactive_users_per_day(db):
  day = datetime(2015, 2, 16)
  while (day < datetime.now()):
    total = db.usersnapshots.find({
      "timeStamp": { "$gte": day, "$lt": day + timedelta(days=1) }
    }).count()
    active = db.usersnapshots.find(
      {
        "$or":
          [
            { "$where": "this.categories.length > 0" },
            { "$where": "this.portfolio.length > 0" }
          ],
        "timeStamp": { "$gte": day, "$lt": day + timedelta(days=1) }
      }
    ).count()
    print active * 1.0/total
    day += timedelta(days=1)

# Function to get the size of the CommandCursor, which cannot be counted
def getSize(commandCursor):
  i = 0
  for c in commandCursor:
    i += 1
  return i

output_metrics()
