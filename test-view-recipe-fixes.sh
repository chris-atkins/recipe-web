#!/bin/bash

echo "Testing view-recipe fixes across 10 runs..."
echo ""

for i in {1..10}; do
  echo "Run $i..."
  npm run test-single-run > /tmp/view-recipe-test-$i.txt 2>&1
done

echo ""
echo "=== VIEW-RECIPE TEST FAILURES ==="
cat /tmp/view-recipe-test-*.txt | grep "view recipe.*FAILED" | sed 's/\[31m//g' | sed 's/\[39m//g' | sed 's/\[2K//g' | sed 's/\[1A//g' | sed 's/^.*) //' | sed 's/ FAILED$//' | sort | uniq -c | sort -rn

echo ""
echo "=== TOTAL COUNTS PER RUN ==="
for i in {1..10}; do
  total=$(grep 'TOTAL:' /tmp/view-recipe-test-$i.txt | sed 's/\[31m//g' | sed 's/\[39m//g' | sed 's/\[32m//g')
  echo "Run $i: $total"
done
