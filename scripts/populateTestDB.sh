#!/bin/bash
mongo reps_development --eval "db.users.remove({}); db.transactions.remove({}); db.categories.remove({});"
mongoimport -d reps_development -c users --jsonArray --file $REPS_ROOT/scripts/mockUserData.json
mongoimport -d reps_development -c transactions --jsonArray --file $REPS_ROOT/scripts/mockTransactionData.json
mongoimport -d reps_development -c categories --jsonArray --file $REPS_ROOT/scripts/mockCategoryData.json
