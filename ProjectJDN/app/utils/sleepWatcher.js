const SAMPLE_RATE = 2000
let callbacks = []
let lastTimestamp, intervalId
let isRunning = false

export default {
  onWakeUp(callback) {
    if (callbacks.indexOf(callback) === -1) {
      callbacks.push(callback)
    }
    !isRunning && this.start()
  },
  start() {
    lastTimestamp = Date.now()
    intervalId = setInterval(() => {
      const currentTimestamp = Date.now()
      if (currentTimestamp > (lastTimestamp + SAMPLE_RATE * 2)) {
        callbacks.forEach(callback => callback())
      }
      lastTimestamp = currentTimestamp
    }, SAMPLE_RATE)
    isRunning = true
  },
  stop() {
    intervalId && clearInterval(intervalId)
    intervalId = lastTimestamp = null
    isRunning = false
  }
}
