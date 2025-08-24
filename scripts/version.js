#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unused-vars */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

function getLatestTag() {
  try {
    const tags = execSync('git tag --sort=-version:refname', { encoding: 'utf8' }).trim()
    return tags.split('\n')[0] || '0.0.0'
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
      command = `git log --pretty=format:"%s" ${latestTag}..HEAD`
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

function createGitTag(version) {
  try {
    execSync(`git tag v${version}`, { encoding: 'utf8' })
    console.log(`Created git tag v${version}`)
  } catch (_error) {
    console.warn(`Failed to create git tag v${version}`)
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
createGitTag(newVersion)

console.log(`Version bumped from ${currentVersion} to ${newVersion}`)
