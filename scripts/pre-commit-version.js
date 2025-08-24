#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unused-vars */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

function getLatestTag() {
  try {
    const tags = execSync('git tag --sort=-version:refname', { encoding: 'utf8' }).trim()
    const latestTag = tags.split('\n')[0] || '0.0.0'
    // Remove 'v' prefix if present
    return latestTag.startsWith('v') ? latestTag.slice(1) : latestTag
  } catch (_error) {
    return '0.0.0'
  }
}

function getCommitMessagesSinceLastTag() {
  try {
    const latestTag = getLatestTag()
    let command

    if (latestTag === '0.0.0') {
      command = 'git log --pretty=format:"%s" HEAD'
    } else {
      // Use the full tag name with 'v' prefix for git commands
      const tagName = latestTag.startsWith('v') ? latestTag : `v${latestTag}`
      command = `git log --pretty=format:"%s" ${tagName}..HEAD`
    }

    const output = execSync(command, { encoding: 'utf8' }).trim()
    return output ? output.split('\n') : []
  } catch (_error) {
    return []
  }
}

function analyzeConventionalCommits(commitMessages) {
  let hasBreaking = false
  let hasFeature = false
  let hasFix = false

  for (const message of commitMessages) {
    // Check for breaking changes
    if (message.includes('BREAKING CHANGE') || message.includes('!:')) {
      hasBreaking = true
    }

    // Parse conventional commit format
    const conventionalPattern = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+?\))?(!)?:/
    const match = message.match(conventionalPattern)

    if (match) {
      const [, type, , hasExclamation] = match

      if (hasExclamation) {
        hasBreaking = true
      }

      if (type === 'feat') {
        hasFeature = true
      }

      if (type === 'fix') {
        hasFix = true
      }
    }
  }

  if (hasBreaking) return 'major'
  if (hasFeature) return 'minor'
  if (hasFix) return 'patch'
  return null
}

function calculateVersion() {
  const latestTag = getLatestTag()
  const [major, minor, patch] = latestTag.split('.').map(Number)
  const commitMessages = getCommitMessagesSinceLastTag()

  if (commitMessages.length === 0) {
    return latestTag
  }

  const bumpType = analyzeConventionalCommits(commitMessages)

  if (bumpType === 'major') {
    return `${major + 1}.0.0`
  } else if (bumpType === 'minor') {
    return `${major}.${minor + 1}.0`
  } else if (bumpType === 'patch') {
    return `${major}.${minor}.${patch + 1}`
  }

  return latestTag
}

function updatePackageVersion(version) {
  const packagePath = path.join(process.cwd(), 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  packageJson.version = version
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n')
  console.log(`Updated package.json version to ${version}`)
}

function stageVersionChanges() {
  try {
    execSync('git add package.json', { encoding: 'utf8' })
    console.log('Staged package.json changes')
  } catch (_error) {
    console.warn('Failed to stage package.json changes')
  }
}

// Main execution
const newVersion = calculateVersion()
const currentVersion = getLatestTag()

if (newVersion === currentVersion) {
  console.log(`No version change needed. Current version: ${currentVersion}`)
  process.exit(0)
}

updatePackageVersion(newVersion)
stageVersionChanges()

console.log(`Version bumped from ${currentVersion} to ${newVersion} and staged for commit`)
