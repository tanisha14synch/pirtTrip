import { LAUNCH_COUNTDOWN_INITIAL } from '~/constants/launch-countdown'

export function useLaunchCountdown() {
  const timeLeft = ref({ ...LAUNCH_COUNTDOWN_INITIAL })

  let timerId: ReturnType<typeof setInterval> | undefined

  const countdownUnits = computed(() => [
    { label: 'DAYS', value: timeLeft.value.days },
    { label: 'HRS', value: timeLeft.value.hours },
    { label: 'MINS', value: timeLeft.value.minutes },
    { label: 'SECS', value: timeLeft.value.seconds },
  ])

  const pad = (value: number) => String(value).padStart(2, '0')

  const tickCountdown = () => {
    let total = timeLeft.value.days * 86400
      + timeLeft.value.hours * 3600
      + timeLeft.value.minutes * 60
      + timeLeft.value.seconds

    total = Math.max(0, total - 1)

    timeLeft.value = {
      days: Math.floor(total / 86400),
      hours: Math.floor((total % 86400) / 3600),
      minutes: Math.floor((total % 3600) / 60),
      seconds: total % 60,
    }
  }

  onMounted(() => {
    timerId = window.setInterval(tickCountdown, 1000)
  })

  onUnmounted(() => {
    if (timerId) clearInterval(timerId)
  })

  return {
    timeLeft,
    countdownUnits,
    pad,
  }
}
