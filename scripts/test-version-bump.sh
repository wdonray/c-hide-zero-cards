#!/bin/bash

# Test script for version bump logic
# This simulates the GitHub Actions workflow locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test scenarios
declare -a TEST_SCENARIOS=(
    "patch:fix: test patch bump"
    "minor:feat: test minor bump"
    "major:feat!: test major bump"
    "patch:chore: test no bump"
    "major:feat: test breaking change\n\nBREAKING CHANGE: This is a breaking change"
)

echo -e "${YELLOW}Testing version bump logic...${NC}"
echo ""

# Function to analyze conventional commits (same logic as workflow)
analyze_conventional_commits() {
    local commit_message="$1"
    
    # Check for breaking changes
    if [[ "$commit_message" == *"BREAKING CHANGE"* ]] || [[ "$commit_message" == *"!:"* ]]; then
        echo "major"
    elif [[ "$commit_message" =~ ^feat: ]]; then
        echo "minor"
    elif [[ "$commit_message" =~ ^fix: ]]; then
        echo "patch"
    else
        echo "patch"
    fi
}

# Run tests
passed=0
total=${#TEST_SCENARIOS[@]}

for scenario in "${TEST_SCENARIOS[@]}"; do
    IFS=':' read -r expected_bump commit_message <<< "$scenario"
    
    echo -e "${YELLOW}Testing: $expected_bump${NC}"
    echo "Commit message: $commit_message"
    
    # Analyze the commit
    bump_type=$(analyze_conventional_commits "$commit_message")
    
    echo "Detected bump type: $bump_type"
    
    # Validate result
    if [ "$bump_type" = "$expected_bump" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((passed++))
    else
        echo -e "${RED}❌ FAIL - Expected $expected_bump, got $bump_type${NC}"
    fi
    
    echo ""
done

# Summary
echo -e "${YELLOW}Test Summary:${NC}"
echo "Passed: $passed/$total"

if [ $passed -eq $total ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
