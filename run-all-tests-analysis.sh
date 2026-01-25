#!/bin/bash

echo "Running comprehensive test analysis across 10 runs..."
for i in {1..10}; do
  echo "Run $i..."
  npm run test-single-run > /tmp/all-tests-$i.txt 2>&1
done
echo ""
echo "=== ALL TEST FAILURES BY FREQUENCY ==="
cat /tmp/all-tests-*.txt | grep "Chrome.*FAILED" | grep -v "Executed" | sed 's/\[31m//g' | sed 's/\[39m//g' | sed 's/\[2K//g' | sed 's/\[1A//g' | sed 's/^.*) //' | sed 's/ FAILED$//' | sort | uniq -c | sort -rn
