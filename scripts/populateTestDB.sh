#!/bin/bash
mongo reps_test --eval "db.users.remove(); db.transactions.remove(); db.categories.remove();"
mongoimport -d reps_test -c users --jsonArray --file $REPS_ROOT/scripts/mockUserData.json
mongoimport -d reps_test -c transactions --jsonArray --file $REPS_ROOT/scripts/mockTransactionData.json
mongoimport -d reps_test -c categories --jsonArray --file $REPS_ROOT/scripts/mockCategoryData.json
