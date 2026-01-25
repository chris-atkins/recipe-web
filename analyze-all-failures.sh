#!/bin/bash

echo "Analyzing test failures across 10 runs..."
echo ""

# Extract all unique failures (removing ANSI color codes)
cat /tmp/all-tests-*.txt | grep "Chrome.*FAILED" | grep -v "Executed" | sed 's/\[31m//g' | sed 's/\[39m//g' | sed 's/\[2K//g' | sed 's/\[1A//g' | sed 's/^.*) //' | sed 's/ FAILED$//' | sort | uniq -c | sort -rn > /tmp/failure-summary.txt

echo "=== FAILURE FREQUENCY (out of 10 runs) ==="
echo ""
cat /tmp/failure-summary.txt

echo ""
echo "=== TOTAL COUNTS PER RUN ==="
for i in {1..10}; do
  total=$(grep 'TOTAL:' /tmp/all-tests-$i.txt | sed 's/\[31m//g' | sed 's/\[39m//g')
  echo "Run $i: $total"
done

echo ""
echo "=== TESTS BY MODULE ==="
echo ""
echo "View Recipe:"
grep "view recipe" /tmp/failure-summary.txt | wc -l
echo ""
echo "Recipe Book:"
grep "recipe book" /tmp/failure-summary.txt | wc -l
echo ""
echo "New Recipe:"
grep "new recipe" /tmp/failure-summary.txt | wc -l
echo ""
echo "Search:"
grep -i "search" /tmp/failure-summary.txt | wc -l
echo ""
echo "Navbar:"
grep -i "navbar" /tmp/failure-summary.txt | wc -l
echo ""
echo "Home:"
grep -i "home" /tmp/failure-summary.txt | wc -l
