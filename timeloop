let isnNext = true, total = 0

function timeLoop(t) {
  console.log(total, 'frame', t)
  console.timeLog() ?? console.time()

  if (isnNext) {
    total++
    requestAnimationFrame(timeLoop)
  }
}

requestAnimationFrame(t => {
  setTimeout(() => { isnNext = false }, 10 * 1000)

  timeLoop(t)
})

// 0 'frame' 3154.5
// 1 'frame' 3170.7
// default: 11.996826171875 ms

// default: 978.016845703125 ms
// 60 'frame' 4155.1
// default: 994.741943359375 ms

let custom = {
  fps: 60,
  id: 0,
  lastTime: 0,
  requestAnimationFrame: callback => {
    const currentTime = new Date().getTime()
    const nextTime = custom.lastTime + 1000 / custom.fps

    custom.id = setTimeout(() => {
      callback(nextTime)
    }, currentTime < nextTime ? nextTime - currentTime : 0)

    custom.lastTime = structuredClone(nextTime)
    return custom.id
  },
  cancelAnimationFrame: id => {
    clearTimeout(id)
    custom.id = 0
    custom.lastTime = 0
  },
}

let customInterval = {
  fps: 60,
  lastTime: 0,
  total: 0,
  timer: null,
  requestAnimationFrame: callback => {
    if (!timer) {
      customInterval.timer = setInterval(() => {
        const currentTime = new Date().getTime()
        const nextTime = customInterval.lastTime + 1000 / customInterval.fps

        if (currentTime < nextTime && total) {
          total--
          callback(timeToCall)
        }

        customInterval.lastTime = structuredClone(nextTime)
      }, 1000 / customInterval.fps)
    }

    total++

    return customInterval.timer
  },
  cancelAnimationFrame: id => {
    clearInterval(id)
    custom.lastTime = 0
    custom.timer = null
  },
}
