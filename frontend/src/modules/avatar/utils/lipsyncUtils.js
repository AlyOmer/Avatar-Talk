/**
 * Lip-sync utility functions for audio-time-based synchronization
 */

/**
 * Get current viseme index based on audio playback time
 * Uses binary search for O(log n) performance on long sequences
 * 
 * @param {number} audioTime - Current audio.currentTime in seconds
 * @param {Array} visemeSequence - Viseme data from backend with start/end times
 * @returns {number} Current viseme index (0-7)
 */
export const getVisemeAtTime = (audioTime, visemeSequence) => {
  if (!visemeSequence || visemeSequence.length === 0) {
    return 0; // Silence
  }
  
  // For small sequences (< 50), linear search is faster
  if (visemeSequence.length < 50) {
    for (let i = 0; i < visemeSequence.length; i++) {
      const viseme = visemeSequence[i];
      const start = viseme.start || 0;
      const end = viseme.end || (start + (viseme.duration || 0));
      
      if (audioTime >= start && audioTime < end) {
        return viseme.viseme || 0;
      }
    }
  } else {
    // Binary search for longer sequences
    let left = 0;
    let right = visemeSequence.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const viseme = visemeSequence[mid];
      const start = viseme.start || 0;
      const end = viseme.end || (start + (viseme.duration || 0));
      
      if (audioTime >= start && audioTime < end) {
        return viseme.viseme || 0;
      } else if (audioTime < start) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
  }
  
  // If past end, return last viseme or silence
  const lastViseme = visemeSequence[visemeSequence.length - 1];
  const lastEnd = lastViseme.end || (lastViseme.start + (lastViseme.duration || 0));
  
  return audioTime < lastEnd ? (lastViseme.viseme || 0) : 0;
};

/**
 * Frame interpolation system for smooth transitions
 */
export class FrameInterpolator {
  constructor(transitionDuration = 0.05) { // 50ms default
    this.transitionDuration = transitionDuration;
    this.currentFrame = 1;
    this.targetFrame = 1;
    this.transitionStartTime = 0;
    this.isTransitioning = false;
  }
  
  /**
   * Set target frame and start transition
   */
  setTargetFrame(frame, currentTime) {
    if (frame !== this.targetFrame) {
      this.currentFrame = this.targetFrame; // Start from current
      this.targetFrame = frame;
      this.transitionStartTime = currentTime;
      this.isTransitioning = true;
    }
  }
  
  /**
   * Get interpolated frame at current time
   * @param {number} currentTime - Current audio time
   * @returns {number} Frame number to display
   */
  getInterpolatedFrame(currentTime) {
    if (!this.isTransitioning) {
      return this.targetFrame;
    }
    
    const elapsed = currentTime - this.transitionStartTime;
    const progress = Math.min(elapsed / this.transitionDuration, 1.0);
    
    if (progress >= 1.0) {
      this.isTransitioning = false;
      this.currentFrame = this.targetFrame;
      return this.targetFrame;
    }
    
    // Ease-in-out interpolation for natural motion
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    // For sprite frames, we round to nearest integer
    const interpolated = Math.round(
      this.currentFrame + (this.targetFrame - this.currentFrame) * eased
    );
    
    return interpolated;
  }
  
  /**
   * Reset interpolator state
   */
  reset() {
    this.isTransitioning = false;
    this.currentFrame = this.targetFrame;
    this.transitionStartTime = 0;
  }
}

/**
 * Get frame for viseme with smooth cycling through candidate frames
 * 
 * @param {number} visemeIndex - Current viseme (0-7)
 * @param {Array} visemeSequence - Full viseme sequence with timing
 * @param {number} audioTime - Current audio time
 * @param {Object} visemeFrameMap - Mapping of viseme to frame arrays
 * @returns {number} Frame number to display
 */
export const getFrameForViseme = (
  visemeIndex, 
  visemeSequence, 
  audioTime, 
  visemeFrameMap
) => {
  // Get candidate frames for this viseme
  const candidateFrames = visemeFrameMap[visemeIndex] || visemeFrameMap[0] || [1];
  
  if (candidateFrames.length === 0) {
    return 1; // Default frame
  }
  
  // Find current viseme data to get timing
  const visemeData = visemeSequence.find(v => {
    const start = v.start || 0;
    const end = v.end || (start + (v.duration || 0));
    return audioTime >= start && audioTime < end && v.viseme === visemeIndex;
  });
  
  let targetFrame;
  if (visemeData && visemeData.duration) {
    // Cycle through frames within viseme duration
    const timeInViseme = audioTime - (visemeData.start || 0);
    const cycleRate = 8; // 8 frames per second within viseme
    const frameIndex = Math.floor(timeInViseme * cycleRate) % candidateFrames.length;
    targetFrame = candidateFrames[frameIndex];
  } else {
    // Default to first frame of viseme
    targetFrame = candidateFrames[0];
  }
  
  return targetFrame;
};

