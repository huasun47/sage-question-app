"use client"

interface CircularTimerProps {
  timeRemaining: number // in seconds
  totalTime: number // in seconds
  isPaused: boolean
}

export function CircularTimer({ timeRemaining, totalTime, isPaused }: CircularTimerProps) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const progress = (timeRemaining / totalTime) * circumference
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  // Color based on time remaining
  const getColor = () => {
    const percentage = (timeRemaining / totalTime) * 100
    if (percentage > 50) return "text-green-500"
    if (percentage > 20) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        {/* Background circle */}
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className={getColor()}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-lg font-bold ${getColor()}`}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
        {isPaused && <span className="text-xs text-muted-foreground">已暂停</span>}
      </div>
    </div>
  )
}
