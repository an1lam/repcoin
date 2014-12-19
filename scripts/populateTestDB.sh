#!/bin/bash
# Script name: populateTestDB.sh
#
# Writes data from the mock json files in this directory to reps_development
# Pass --saved to use saved json data files. Pass --mock to use mock json data files
# ex. ./populateTestDB.sh -- mock
#
# To destroy existing data in reps_development, pass --destroy as an argument
# ex: ./populateTestDB.sh --mock --destroy

mock=$1
if [ "$mock" = "--mock" ];
  then
  echo "Using mock data files...";
  data="mock";
fi

if [ "$mock" = "--saved" ];
  then
  echo "Using saved data files...";
  data="saved";
fi

destroy=$2
if [ "$destroy" = "--destroy" ];
  then
  echo "Destroying database...";
  mongo reps_development --eval "db.users.remove({}); db.transactions.remove({}); db.categories.remove({});"
fi

mongoimport -d reps_development -c users --jsonArray --file $REPS_ROOT/scripts/${data}UserData.json
mongoimport -d reps_development -c transactions --jsonArray --file $REPS_ROOT/scripts/${data}TransactionData.json
mongoimport -d reps_development -c categories --jsonArray --file $REPS_ROOT/scripts/${data}CategoryData.json
exit 0
