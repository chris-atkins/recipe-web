#!/bin/bash

for i in {1..10}; do
  echo "=== Run $i ==="
  npm run test-single-run > /tmp/test-run-final-$i.txt 2>&1

  echo "Total: $(grep 'TOTAL:' /tmp/test-run-final-$i.txt)"
  echo "New-recipe failures:"
  grep "new recipe.*FAILED" /tmp/test-run-final-$i.txt | sed 's/^.*) /  - /' || echo "  (none)"
  echo ""
done
