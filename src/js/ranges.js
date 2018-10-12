import '../sass/styles.scss'

const VALUES_SRC = '!VALUES_SRC!'
const CHECK_INTERVAL = 5000

const twitch = window.Twitch.ext;
let rangeCache = {}

// Set light/dark mode
twitch.onContext((context) => {
  const bodyClasses = document.body.classList

  if (context.theme === 'light' && bodyClasses.contains('dark')) {
    bodyClasses.remove('dark')
  } else if (context.theme === 'dark' && !bodyClasses.contains('dark')) {
    bodyClasses.add('dark')
  }
})

const getWidth = (current, min, max, maxWidth) => {
  const range = max - min
  return maxWidth * (current - min)/(range)
}

// Turns range value into HTML
const makeRange = (name, range) => {
  const barWidth = document.getElementById('plays-itself-ranges').offsetWidth - 90
  const activeWidth = getWidth(range.value, range.min, range.max, barWidth)
  const activeClass = activeWidth < barWidth/2 ? 'right' : 'left'
  const valuePos = activeWidth < barWidth/2 ? activeWidth + 10 : activeWidth - 10

  return `
    <div class="range" id="range-wrapper-${name}">
      <div class="range-title">
        <h2>${name}</h2>
      </div>
      <div class="range-bar-wrapper">
        <div class="range-min"><span>${range.min}</span></div>
        <div class="range-bar">
          <div class="range-bar-filled" style="width:${activeWidth}px"></div>
          <div class="range-value ${activeClass}" style="left:${valuePos}px">${range.value}</div>
        </div>
        <div class="range-max"><span>${range.max}</span></div>
      </div>
    </div>
  `
}

// Returns `true` if the new range (min, max, or current) has changed from
// from the cached version
const hasChanged = (oldEntry, newEntry) => {
  return oldEntry.value !== newEntry ||
    oldEntry.min !== newEntry.min ||
    oldEntry.max !== newEntry.max
}

const updateOrDeleteRanges = (newRanges) => {
  rangeCache = Object.keys(rangeCache).reduce(
    (updateRanges, key) => {
      // if the key isn't in the old ranges, remove it
      if (!newRanges.hasOwnProperty(key)) return updateRanges
      // if the key has changed, add the updated HTML
      if (hasChanged(newRanges[key], rangeCache[key])) {
        return {
          ...updateRanges,
          [key]: {
            ...newRanges[key],
            html: makeRange(key, newRanges[key]),
          },
        }
      }
      // else, return the key as is in the cache
      return {
        ...updateRanges,
        key: rangeCache[key],
      }
    }, {}
  )
}

const addNewRanges = (newRanges) => {
  for (const entry of Object.entries(newRanges)) {
    if (!rangeCache.hasOwnProperty(entry[0])) {
      rangeCache[entry[0]] = {
        ...newRanges[entry[0]],
        html: makeRange(entry[0], entry[1]),
      }
    }
  }
}

const drawChart = () => {
  const container = document.getElementById('plays-itself-ranges')

  container.innerHTML = Object.entries(rangeCache).sort().reduce(
    (html, entry) => html + entry[1].html, ''
  )
}

const updateChart = (newRanges) => {
  updateOrDeleteRanges(newRanges)
  addNewRanges(newRanges)

  drawChart()
}

const getFilterVals = () => {
  fetch(VALUES_SRC).then(
    response => response.json()
  ).then(
    response => updateChart(response)
  )
}

getFilterVals()
setInterval(getFilterVals, CHECK_INTERVAL);

const rerenderHTML = () => {
  rangeCache = Object.entries(rangeCache).reduce((updatedCache, entry) => ({
      ...updatedCache,
      [entry[0]]: {
        ...entry[1],
        html: makeRange(entry[0], entry[1]),
      }
    }), {}
  )
}

const redraw = () => {
  rerenderHTML()
  drawChart() 
}

window.onresize = redraw
