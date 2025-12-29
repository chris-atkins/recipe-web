#!/bin/bash

echo "Testing view-recipe edit mode fixes across 10 runs..."
for i in {1..10}; do
  echo "Run $i..."
  npm run test-single-run > /tmp/view-recipe-edit-fix-test-$i.txt 2>&1
done
echo ""
echo "=== VIEW-RECIPE EDIT MODE TEST FAILURES ==="
cat /tmp/view-recipe-edit-fix-test-*.txt | grep "view recipe.*when in edit mode.*FAILED" | sed 's/\[31m//g' | sed 's/\[39m//g' | sed 's/\[2K//g' | sed 's/\[1A//g' | sed 's/^.*) //' | sed 's/ FAILED$//' | sort | uniq -c | sort -rn
echo ""
echo "=== VIEW-RECIPE NON-EDIT MODE TEST FAILURES ==="
cat /tmp/view-recipe-edit-fix-test-*.txt | grep "view recipe.*when not in edit mode.*FAILED" | sed 's/\[31m//g' | sed 's/\[39m//g' | sed 's/\[2K//g' | sed 's/\[1A//g' | sed 's/^.*) //' | sed 's/ FAILED$//' | sort | uniq -c | sort -rn
echo ""
echo "=== TOTAL COUNTS PER RUN ==="
for i in {1..10}; do
  total=$(grep 'TOTAL:' /tmp/view-recipe-edit-fix-test-$i.txt | sed 's/\[31m//g' | sed 's/\[39m//g' | sed 's/\[32m//g')
  echo "Run $i: $total"
done
