import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivitiesSection } from './ActivitiesSection'

describe('ActivitiesSection', () => {
  it('renders the five activities and classroom tips', () => {
    render(<ActivitiesSection />)
    expect(screen.getByText('Interactive Learning Activities')).toBeInTheDocument()
    expect(screen.getByText('Classroom Implementation Tips')).toBeInTheDocument()
    for (const activity of [
      'Activity 1: Number Exploration',
      'Activity 2: Card Sorting Challenge',
      'Activity 3: Number Forms Exploration',
      'Activity 4: Random Number Practice',
      'Activity 5: Zero Card Investigation',
    ]) {
      expect(screen.getByText(activity)).toBeInTheDocument()
    }
    expect(screen.getByText('Whole Class Activities')).toBeInTheDocument()
    expect(screen.getByText('Individual Practice')).toBeInTheDocument()
  })
})
