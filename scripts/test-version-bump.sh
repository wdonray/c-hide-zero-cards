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
    "none:chore: test no bump"
    "major:feat: test breaking change\n\nBREAKING CHANGE: This is a breaking change"
)

# Mock current version
CURRENT_VERSION="1.2.3"

echo -e "${YELLOW}Testing version bump logic...${NC}"
echo "Current version: $CURRENT_VERSION"
echo ""

# Function to analyze conventional commits (same logic as workflow)
analyze_conventional_commits() {
    local commit_messages="$1"
    local has_breaking=false
    local has_feature=false
    local has_fix=false
    
    while IFS= read -r message; do
        # Check for breaking changes
        if [[ "$message" == *"BREAKING CHANGE"* ]] || [[ "$message" == *"!:"* ]]; then
            has_breaking=true
        fi
        
        # Parse conventional commit format - simpler approach
        if [[ "$message" =~ ^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert): ]]; then
            local type=$(echo "$message" | sed -E 's/^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\([^)]*\))?(!)?:.*/\1/')
            local has_exclamation=$(echo "$message" | grep -o '!' | head -1)
            
            if [ "$has_exclamation" = "!" ]; then
                has_breaking=true
            fi
            
            if [ "$type" = "feat" ]; then
                has_feature=true
            fi
            
            if [ "$type" = "fix" ]; then
                has_fix=true
            fi
        fi
    done <<< "$commit_messages"
    
    if [ "$has_breaking" = true ]; then
        echo "major"
    elif [ "$has_feature" = true ]; then
        echo "minor"
    elif [ "$has_fix" = true ]; then
        echo "patch"
    else
        echo "none"
    fi
}

# Function to calculate new version
calculate_version() {
    local current_version="$1"
    local bump_type="$2"
    
    IFS='.' read -r major minor patch <<< "$current_version"
    
    case "$bump_type" in
        "major")
            echo "$((major + 1)).0.0"
            ;;
        "minor")
            echo "${major}.$((minor + 1)).0"
            ;;
        "patch")
            echo "${major}.${minor}.$((patch + 1))"
            ;;
        *)
            echo "$current_version"
            ;;
    esac
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
    new_version=$(calculate_version "$CURRENT_VERSION" "$bump_type")
    
    echo "Detected bump type: $bump_type"
    echo "New version: $new_version"
    
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
