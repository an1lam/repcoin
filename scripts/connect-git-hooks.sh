#!/bin/bash
for file in $REPS_ROOT/scripts/git-hooks/*
do
  cp $file $REPS_ROOT/.git/hooks
done
