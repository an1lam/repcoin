#!/bin/bash
# Script name: saveDB.sh
#
# Saves data from mongo collections from reps_development to json files

mongoexport -d reps_development -c users --jsonArray -o $REPS_ROOT/scripts/savedUserData.json
mongoexport -d reps_development -c transactions --jsonArray -o $REPS_ROOT/scripts/savedTransactionData.json
mongoexport -d reps_development -c categories --jsonArray -o $REPS_ROOT/scripts/savedCategoryData.json
exit 0
