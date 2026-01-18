"use client"

import { ReactNode, useRef, useState, useEffect } from "react"

interface ScrollingCardGridProps {
  children: ReactNode
  /** Animation duration in seconds (default: 35) */
  duration?: number
  /** Whether scrolling is enabled (default: true) */
  enabled?: boolean
  /** Additional className for the outer container */
  className?: string
}

export function ScrollingCardGrid({
  children,
  duration = 20,
  enabled = true,
  className = "",
}: ScrollingCardGridProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef(0)
  const manualScrollPositionRef = useRef(0)
  const animationRef = useRef<Animation | null>(null)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // Initialize and manage animation
  useEffect(() => {
    if (!contentRef.current || !enabled || prefersReducedMotion) return

    const content = contentRef.current

    // Wait for content to be fully rendered
    const initAnimation = () => {
      if (!contentRef.current) return
      
      const content = contentRef.current
      const contentHeight = content.offsetHeight
      
      // Only initialize if we have content height
      if (contentHeight === 0) {
        // Retry after a short delay if height is not ready
        setTimeout(initAnimation, 50)
        return
      }

      if (!animationRef.current) {
        // Initialize animation using Web Animations API for better control
        animationRef.current = content.animate(
          [
            { transform: 'translate3d(0, 0, 0)' },
            { transform: 'translate3d(0, -50%, 0)' }
          ],
          {
            duration: duration * 1000,
            iterations: Infinity,
            easing: 'linear',
            fill: 'forwards'
          }
        )
        animationRef.current.play()
      }
    }

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      initAnimation()
    })

    return () => {
      if (animationRef.current) {
        animationRef.current.cancel()
        animationRef.current = null
      }
    }
  }, [duration, enabled, prefersReducedMotion])

  // Handle manual scrolling when paused
  useEffect(() => {
    if (!isPaused || !contentRef.current || !enabled) return

    const content = contentRef.current
    const animation = animationRef.current
    const container = containerRef.current
    
    // Get current transform position from animation
    const getCurrentTransform = (): number => {
      if (animation) {
        const currentTime = animation.currentTime
        // Use animation progress if available and currentTime is a number
        if (currentTime !== null && typeof currentTime === 'number') {
          const progress = (currentTime % (duration * 1000)) / (duration * 1000)
          const contentHeight = content.offsetHeight
          const maxScroll = -(contentHeight / 2)
          return progress * maxScroll
        }
      }
      
      // Fallback to computed style
      {
        // Fallback to computed style
        const computedStyle = window.getComputedStyle(content)
        const matrix = computedStyle.transform
        
        if (matrix && matrix !== 'none') {
          const values = matrix.split('(')[1]?.split(')')[0]?.split(',')
          if (values && values.length >= 6) {
            return parseFloat(values[5] || '0')
          } else if (values && values.length >= 2) {
            return parseFloat(values[1] || '0')
          }
        }
        return manualScrollPositionRef.current || 0
      }
    }
    
    // Cancel animation and capture current position
    if (animation) {
      const currentTransform = getCurrentTransform()
      manualScrollPositionRef.current = currentTransform
      scrollPositionRef.current = currentTransform
      animation.pause()
      animation.cancel()
      animationRef.current = null
    }
    
    // Get current position from ref (which was just updated) or compute it
    let currentTransform = manualScrollPositionRef.current
    
    // If we don't have a valid position, try to get it
    if (currentTransform === 0 || isNaN(currentTransform)) {
      const computedStyle = window.getComputedStyle(content)
      const matrix = computedStyle.transform
      
      if (matrix && matrix !== 'none') {
        const values = matrix.split('(')[1]?.split(')')[0]?.split(',')
        if (values && values.length >= 6) {
          currentTransform = parseFloat(values[5] || '0')
        } else if (values && values.length >= 2) {
          currentTransform = parseFloat(values[1] || '0')
        }
      }
    }
    
    const contentHeight = content.offsetHeight
    const maxScroll = -(contentHeight / 2)
    
    // Ensure we have a valid position
    if (isNaN(currentTransform)) {
      currentTransform = 0
    }
    
    // Clamp to valid range
    currentTransform = Math.max(maxScroll, Math.min(0, currentTransform))
    
    // Apply the current position immediately
    content.style.transform = `translate3d(0, ${currentTransform}px, 0)`
    manualScrollPositionRef.current = currentTransform
    scrollPositionRef.current = currentTransform

    const handleWheel = (e: WheelEvent) => {
      // Check if the event is within our container bounds
      if (container) {
        const rect = container.getBoundingClientRect()
        const x = e.clientX
        const y = e.clientY
        
        // Only handle if mouse is over the container
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
          return
        }
      }
      
      e.preventDefault()
      e.stopPropagation()
      
      // Get current position from ref
      let currentPos = manualScrollPositionRef.current
      
      // Calculate scroll amount (negative for scrolling down, positive for up)
      const scrollAmount = e.deltaY * 0.5 // Adjust sensitivity here
      
      // Calculate new position (clamp between 0 and -50%)
      const newPosition = Math.max(
        maxScroll,
        Math.min(0, currentPos + scrollAmount)
      )
      
      // Update refs
      manualScrollPositionRef.current = newPosition
      scrollPositionRef.current = newPosition
      
      // Apply transform manually
      content.style.transform = `translate3d(0, ${newPosition}px, 0)`
    }

    // Attach wheel listener to both container and window for better coverage
    // Use container to catch events when mouse is over the container area
    if (container) {
      container.addEventListener('wheel', handleWheel, { 
        passive: false,
        capture: false 
      })
    }
    
    // Also listen on content as fallback
    content.addEventListener('wheel', handleWheel, { 
      passive: false,
      capture: false 
    })
    
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel)
      }
      content.removeEventListener('wheel', handleWheel)
    }
  }, [isPaused, duration, enabled])

  // Handle animation resume
  useEffect(() => {
    if (!contentRef.current || !enabled || isPaused) return

    const content = contentRef.current
    const currentPosition = manualScrollPositionRef.current
    const contentHeight = content.offsetHeight
    
    if (contentHeight > 0) {
      const totalDistance = contentHeight / 2
      const progress = Math.abs(currentPosition) / totalDistance
      
      // Ensure progress is between 0 and 1
      const clampedProgress = Math.max(0, Math.min(1, progress))
      
      // Cancel any existing animation
      if (animationRef.current) {
        animationRef.current.cancel()
        animationRef.current = null
      }
      
      // If we're at the end (or very close), restart from beginning
      if (clampedProgress >= 0.99) {
        // Reset to start
        content.style.transform = 'translate3d(0, 0, 0)'
        manualScrollPositionRef.current = 0
        
        // Create new infinite animation from start
        animationRef.current = content.animate(
          [
            { transform: 'translate3d(0, 0, 0)' },
            { transform: 'translate3d(0, -50%, 0)' }
          ],
          {
            duration: duration * 1000,
            iterations: Infinity,
            easing: 'linear',
            fill: 'forwards'
          }
        )
      } else {
        // Create animation from current position to end, then loop
        const remainingDistance = totalDistance - Math.abs(currentPosition)
        const remainingDuration = (remainingDistance / totalDistance) * duration * 1000
        
        // First, animate from current position to -50%
        const firstAnimation = content.animate(
          [
            { transform: `translate3d(0, ${currentPosition}px, 0)` },
            { transform: 'translate3d(0, -50%, 0)' }
          ],
          {
            duration: remainingDuration,
            easing: 'linear',
            fill: 'forwards'
          }
        )
        
        // When first animation finishes, start infinite loop
        firstAnimation.addEventListener('finish', () => {
          if (!isPaused && contentRef.current) {
            // Reset to start and create infinite animation
            content.style.transform = 'translate3d(0, 0, 0)'
            
            animationRef.current = content.animate(
              [
                { transform: 'translate3d(0, 0, 0)' },
                { transform: 'translate3d(0, -50%, 0)' }
              ],
              {
                duration: duration * 1000,
                iterations: Infinity,
                easing: 'linear',
                fill: 'forwards'
              }
            )
            animationRef.current.play()
          }
        }, { once: true })
        
        animationRef.current = firstAnimation
      }
      
      animationRef.current.play()
      
      // Clear manual transform after animation starts
      requestAnimationFrame(() => {
        if (content && animationRef.current) {
          // Keep transform during transition
        }
      })
    }
  }, [isPaused, duration, enabled])

  // If animation is disabled or user prefers reduced motion, render static content
  if (!enabled || prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <div
      ref={containerRef}
      className={`scrolling-card-container overflow-hidden relative ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        // Use full viewport height minus minimal offset for edge-to-edge vignette
        height: "100vh",
        // Pull container to viewport edges
        marginTop: "-2rem",
        paddingTop: "2rem",
        marginBottom: "-2rem", 
        paddingBottom: "2rem",
      }}
    >
      <div
        ref={contentRef}
        className="scrolling-card-content"
      >
        {/* First set of cards - wrapped with gap */}
        <div className="scrolling-card-set">
          <div className="scrolling-card-inner">{children}</div>
        </div>
        {/* Duplicate set for seamless loop */}
        <div className="scrolling-card-set" aria-hidden="true">
          <div className="scrolling-card-inner">{children}</div>
        </div>
      </div>
    </div>
  )
}

