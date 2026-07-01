import './Search.css'
import { useState , useEffect } from 'react'
import api from '../../services/api.js'
import Filter from './Filter.jsx'
import Courses from './Courses.jsx'
import Qs from 'qs'

function Search() {
  const [searchInput, setSearchInput] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    difficulty_level: null,
    tags: null,
  })
  
 // useEffect(()=> {console.log(filters.tags)} , [filters])

  const buildRequestParams = () => {
    const params = {}
    
    if (searchInput.trim()) {
      params.search = searchInput
    }

    if (filters.difficulty_level && filters.difficulty_level.length > 0) {
     // console.log("filters :: " , filters.difficulty_level);
      
      params.difficulty_level = filters.difficulty_level
    }

    if (filters.tags && filters.tags.length > 0) {
      
      params.tags = filters.tags
    }

    if (filters.tags.length === 0 && filters.difficulty_level.length === 0) {
      setSearchResults([]);
    }

 
    return params
  }

  const fetchCourses = async (params) => {
    setLoading(true)
    setError(null)
    setSearchResults([])
    if (Object.keys(params).length === 0) {setLoading(false); return ;}  
    console.log("params :: " ,params);
    try {
      const response = await api.get(`/api/courses/`, {
        params,
        paramsSerializer: params => {
         return Qs.stringify(params, { arrayFormat: 'repeat' })
       }
      } 
    )
      // console.log('Backend response:', response)
      //console.log('Response data:', response.data.results)
      setSearchResults(response.data.results)
    } catch (err) {
      setError('Failed to fetch courses. Please try again.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const search = async () => {
    const params = buildRequestParams()

    if (!searchInput.trim() && (!filters.difficulty_level || filters.difficulty_level.length === 0) && (!filters.name || filters.name.length === 0)) {
      setError('Please enter a search term or select a filter')
      return
    }

    await fetchCourses(params)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)

    const params = {}
    
    if (searchInput.trim()) {
      params.search = searchInput
    }

    if (params.tags?.length === 0 && params.difficulty_level?.length === 0 && searchInput.length === 0) {
      setFilters([]);
      setSearchInput("");
    }

    if (newFilters.difficulty_level && newFilters.difficulty_level.length > 0) {
      params.difficulty_level = newFilters.difficulty_level
    }

    if (newFilters.tags && newFilters.tags.length > 0) {
      params.tags = newFilters.tags
    }

    setError(null)
    fetchCourses(params)
  }


  // console.log(searchResults);
  
  return (
    <>
     <div className='hero-cont'>

       <h1 className='search-h1'>Learn Anything, On your Schedule</h1>

       <div className='search-cont'>
            <input
              type="text"
              className='search-inp'
              placeholder="What do you want to learn..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          <button className='search-btn' onClick={search} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
       </div>
       {error && <p className='error-message'>{error}</p>}
     </div>


     <Filter onFilterChange={handleFilterChange}/>

     <Courses searchResults={searchResults}/>
    </>
  )
}

export default Search
