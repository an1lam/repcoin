#!/bin/bash
#Script name: populateTestDB.sh
#
# Writes data from the mock json files in this directory to reps_development
# To destroy existing data in reps_development, pass --destroy as an argument
# ex: ./populateTestDB.sh --destroy

destroy=$1
if [ "$destroy" = "--destroy" ];
  then
  echo "Destroying database...";
  mongo reps_development --eval "db.users.remove({}); db.transactions.remove({}); db.categories.remove({});"
fi

echo $REPS_ROOT
mongoimport -d reps_development -c users --jsonArray --file $REPS_ROOT/scripts/mockUserData.json
mongoimport -d reps_development -c transactions --jsonArray --file $REPS_ROOT/scripts/mockTransactionData.json
mongoimport -d reps_development -c categories --jsonArray --file $REPS_ROOT/scripts/mockCategoryData.json
exit 0
