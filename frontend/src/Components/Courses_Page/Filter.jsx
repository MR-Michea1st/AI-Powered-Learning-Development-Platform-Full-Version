import React, { useState } from 'react'
import './Filter.css'
import Search from './Search'

function Filter({ onFilterChange }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState([])
  const [selectedTags, setSelectedTags] = useState([])

  // Scalable configuration for filter sections
  const filterConfig = {
    difficulty: {
      title: 'Difficulty Level',
      items: [
        { label: 'Beginner', value: 'BEG' },
        { label: 'Intermediate', value: 'INT' },
        { label: 'Advanced', value: 'ADV' }
      ],
      state: selectedDifficulty,
      setState: setSelectedDifficulty,
      type: 'checkbox'
    },
    categories: {
      title: 'Categories',
      items: [
        { label: 'Web', value: 'Web' },
        { label: 'Security', value: 'Security' },
        { label: 'AI', value: 'AI' },
        { label: 'System Design', value: 'System_Design' },
        { label: 'Algorithms', value: 'Algorithms' },
        { label: 'Programming', value: 'Programming' },
        { label: 'Math', value: 'Math' },
        { label: 'Front-End', value: 'Front-End' },
        { label: 'Back-End', value: 'Back-End' },
        { label: 'Networking', value: 'Networking' },
        { label: 'Operating Systems', value: 'OS' },
        { label: 'Hardware', value: 'Hardware' },
        { label: 'Databases', value: 'Databases' },
      ],
      state: selectedTags,
      setState: setSelectedTags,
      type: 'checkbox'
    }
  }

  const handleFilterChange = (filterKey, item) => {
    const config = filterConfig[filterKey]
    let updatedState = [...config.state]

    if (updatedState.includes(item)) {
      updatedState = updatedState.filter(i => i !== item)
    } else {
      updatedState.push(item)
    }

    config.setState(updatedState)

    // Build filter object based on all current selections
    const filters = {
      difficulty_level: selectedDifficulty.length > 0 ? selectedDifficulty : null,
      tags: selectedTags.length > 0 ? selectedTags : null
    }

    // Update with the new state for the changed filter
    if (filterKey === 'difficulty') {
      filters.difficulty_level = updatedState.length > 0 ? updatedState : null
    } else if (filterKey === 'categories') {
      filters.tags = updatedState.length > 0 ? updatedState : null
    }

    if (onFilterChange) {
      onFilterChange(filters)
    }
  }

  const handleClearFilters = () => {
    setSelectedDifficulty([])
    setSelectedTags([])
    
    if (onFilterChange) {
      onFilterChange({
        difficulty_level: [],
        tags: []
      })
    }
  }

  return (
    <>
      <div className='filters'>
        <h1 className='filter-h1'>Filter Courses</h1>

        {/* Dynamically render filter sections */}
        {Object.entries(filterConfig).map(([key, config]) => (
          <div key={key} className='filter-section'>
            <h3>{config.title}</h3>
            <div className='filter-btns'>
              {config.items.map((item) => {
                const isSelected = config.state.includes(item.value)
                return (
                  <label key={item.value} className='filter-btn'>
                    <input
                      type={config.type}
                      checked={isSelected}
                      onChange={() => handleFilterChange(key, item.value)}
                    />
                    {item.label}
                  </label>
                )
              })}
            </div>
          </div>
        ))}

        <button
          onClick={handleClearFilters}
          className='clear-filters-btn'
          disabled={selectedDifficulty.length === 0 && selectedTags.length === 0}
        >
          Clear Filters
        </button>
      </div>
    </>
  )
}

export default Filter
