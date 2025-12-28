#!/bin/bash

for i in {1..10}; do
  echo "=== Test Run $i ==="
  npm run test-single-run 2>&1 | grep "FAILED$" | sed 's/^.*) //' | sort
  echo ""
done
