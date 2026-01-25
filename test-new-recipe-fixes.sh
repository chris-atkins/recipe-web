#!/bin/bash

echo "Testing new-recipe fixes across 10 runs..."
for i in {1..10}; do
  echo "Run $i..."
  npm run test-single-run > /tmp/new-recipe-fix-test-$i.txt 2>&1
done
echo ""
echo "=== NEW-RECIPE TEST FAILURES ==="
cat /tmp/new-recipe-fix-test-*.txt | grep "new recipe.*FAILED" | sed 's/\[31m//g' | sed 's/\[39m//g' | sed 's/\[2K//g' | sed 's/\[1A//g' | sed 's/^.*) //' | sed 's/ FAILED$//' | sort | uniq -c | sort -rn
echo ""
echo "=== TOTAL COUNTS PER RUN ==="
for i in {1..10}; do
  total=$(grep 'TOTAL:' /tmp/new-recipe-fix-test-$i.txt | sed 's/\[31m//g' | sed 's/\[39m//g' | sed 's/\[32m//g')
  echo "Run $i: $total"
done
