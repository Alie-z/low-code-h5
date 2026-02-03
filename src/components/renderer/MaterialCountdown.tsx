import { useState, useEffect } from 'react'

interface MaterialCountdownProps {
  endTime?: string
  title?: string
  showDays?: boolean
  style?: React.CSSProperties
  onEnd?: () => void
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(endTime: string): TimeLeft {
  const difference = new Date(endTime).getTime() - Date.now()
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  }
}

export default function MaterialCountdown({
  endTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  title = '距离活动结束',
  showDays = true,
  style,
  onEnd
}: MaterialCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(endTime))
  const [ended, setEnded] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(endTime)
      setTimeLeft(newTimeLeft)
      
      if (
        newTimeLeft.days === 0 && 
        newTimeLeft.hours === 0 && 
        newTimeLeft.minutes === 0 && 
        newTimeLeft.seconds === 0 &&
        !ended
      ) {
        setEnded(true)
        onEnd?.()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime, ended, onEnd])

  const padZero = (num: number) => String(num).padStart(2, '0')

  return (
    <div 
      className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-4"
      style={style}
    >
      <div className="text-center text-sm mb-3 opacity-90">{title}</div>
      <div className="flex items-center justify-center gap-2">
        {showDays && (
          <>
            <div className="flex flex-col items-center">
              <span className="bg-white/20 rounded px-2 py-1 text-2xl font-bold font-mono">
                {padZero(timeLeft.days)}
              </span>
              <span className="text-xs mt-1 opacity-80">天</span>
            </div>
            <span className="text-2xl font-bold">:</span>
          </>
        )}
        <div className="flex flex-col items-center">
          <span className="bg-white/20 rounded px-2 py-1 text-2xl font-bold font-mono">
            {padZero(timeLeft.hours)}
          </span>
          <span className="text-xs mt-1 opacity-80">时</span>
        </div>
        <span className="text-2xl font-bold">:</span>
        <div className="flex flex-col items-center">
          <span className="bg-white/20 rounded px-2 py-1 text-2xl font-bold font-mono">
            {padZero(timeLeft.minutes)}
          </span>
          <span className="text-xs mt-1 opacity-80">分</span>
        </div>
        <span className="text-2xl font-bold">:</span>
        <div className="flex flex-col items-center">
          <span className="bg-white/20 rounded px-2 py-1 text-2xl font-bold font-mono">
            {padZero(timeLeft.seconds)}
          </span>
          <span className="text-xs mt-1 opacity-80">秒</span>
        </div>
      </div>
    </div>
  )
}