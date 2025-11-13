import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

interface SecureVideoPlayerProps {
  videoId: string;
  title: string;
  studentName?: string;
  studentEmail?: string;
  teacherName?: string;
  onTimeUpdate?: (currentTime: number) => void;
  initialTime?: number;
}

export default function SecureVideoPlayer({
  videoId,
  title,
  studentName,
  studentEmail,
  teacherName,
  onTimeUpdate,
  initialTime = 0,
}: SecureVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const timeTrackingIntervalRef = useRef<NodeJS.Timeout>();
  const lastReportedTimeRef = useRef<number>(0);

  // Initialize YouTube Player API
  useEffect(() => {
    const initPlayer = () => {
      // Destroy existing player before creating new one
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      try {
        playerRef.current = new (window as any).YT.Player(`youtube-player-container`, {
          videoId: videoId,
          playerVars: {
            modestbranding: 1,
            rel: 0,
            disablekb: 1,
            controls: 0, // Hide YouTube controls
            showinfo: 0,
            iv_load_policy: 3,
            fs: 0,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              setDuration(event.target.getDuration());
              if (initialTime > 0) {
                event.target.seekTo(initialTime, true);
              }
              setVolume(event.target.getVolume());
              setPlayerError(null);
            },
            onStateChange: (event: any) => {
              if (event.data === (window as any).YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                startTimeTracking();
              } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
                setIsPlaying(false);
                stopTimeTracking();
              } else if (event.data === (window as any).YT.PlayerState.ENDED) {
                setIsPlaying(false);
                stopTimeTracking();
              }
            },
            onError: (event: any) => {
              setPlayerError("Video unavailable or invalid");
              console.error("YouTube player error:", event.data);
            },
          },
        });
      } catch (error) {
        setPlayerError("Invalid video ID or URL");
        console.error("Failed to initialize YouTube player:", error);
      }
    };

    // Check if YouTube API is already loaded
    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      // Load YouTube IFrame API if not already loaded
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      // Set up the callback
      (window as any).onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    }

    return () => {
      stopTimeTracking();
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [videoId, initialTime]);

  // Start time tracking - only one interval at a time
  const startTimeTracking = () => {
    // Clear any existing interval first
    stopTimeTracking();

    timeTrackingIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);

        // Throttle updates: only report every 5 seconds
        const flooredTime = Math.floor(time);
        if (flooredTime % 5 === 0 && flooredTime !== lastReportedTimeRef.current) {
          lastReportedTimeRef.current = flooredTime;
          onTimeUpdate?.(time);
        }
      }
    }, 1000);
  };

  // Stop time tracking
  const stopTimeTracking = () => {
    if (timeTrackingIntervalRef.current) {
      clearInterval(timeTrackingIntervalRef.current);
      timeTrackingIntervalRef.current = undefined;
    }
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleSeek = (value: number[]) => {
    if (!playerRef.current) return;
    const newTime = value[0];
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
    lastReportedTimeRef.current = -1; // Reset to allow immediate update after seek
  };

  const handleVolumeChange = (value: number[]) => {
    if (!playerRef.current) return;
    const newVolume = value[0];
    setVolume(newVolume);
    playerRef.current.setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
      setVolume(playerRef.current.getVolume());
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    const doc = document as any;
    const fullscreenElement =
      document.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement;

    const requestFullscreen = (
      element: HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void> | void;
        mozRequestFullScreen?: () => Promise<void> | void;
        msRequestFullscreen?: () => Promise<void> | void;
      },
    ) => {
      return (
        element.requestFullscreen?.bind(element) ||
        element.webkitRequestFullscreen?.bind(element) ||
        element.mozRequestFullScreen?.bind(element) ||
        element.msRequestFullscreen?.bind(element)
      );
    };

    if (!fullscreenElement) {
      const requestFn =
        requestFullscreen(container) ||
        (playerRef.current?.getIframe &&
          requestFullscreen(playerRef.current.getIframe()));

      if (requestFn) {
        try {
          await requestFn();
          if (window.screen?.orientation?.lock) {
            window.screen.orientation.lock("landscape").catch(() => {});
          }
        } catch (error) {
          console.warn("Failed to enter fullscreen", error);
        }
      }
      return;
    }

    const exitFullscreen =
      document.exitFullscreen?.bind(document) ||
      doc.webkitExitFullscreen?.bind(doc) ||
      doc.mozCancelFullScreen?.bind(doc) ||
      doc.msExitFullscreen?.bind(doc);

    if (exitFullscreen) {
      try {
        await exitFullscreen();
      } catch (error) {
        console.warn("Failed to exit fullscreen", error);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Prevent right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Block DevTools keyboard shortcuts (deterrent only - not absolute prevention)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Windows/Linux shortcuts
      const isWindowsLinuxDevTools = 
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) ||
        (e.ctrlKey && (e.key === "u" || e.key === "U"));
      
      // macOS shortcuts (Cmd+Option+I/J/C)
      const isMacDevTools = 
        (e.metaKey && e.altKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) ||
        (e.metaKey && (e.key === "u" || e.key === "U"));

      if (isWindowsLinuxDevTools || isMacDevTools) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Use capture phase on window to catch all keyboard events
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-primary/20"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onContextMenu={handleContextMenu}
      data-testid="secure-video-player"
    >
      {/* YouTube iframe */}
      <div
        id="youtube-player-container"
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none" }}
      />

      {/* Blocking overlay - prevents clicking through to YouTube */}
      <div 
        className="absolute inset-0 w-full h-full" 
        style={{ pointerEvents: "auto" }}
        onContextMenu={handleContextMenu}
      />

      {/* Error overlay */}
      {playerError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-none">
          <div className="text-center text-white px-6">
            <p className="text-lg font-medium mb-2">⚠️ Video Error</p>
            <p className="text-sm opacity-75">{playerError}</p>
            <p className="text-xs opacity-50 mt-2">Please contact the teacher to update the video URL</p>
          </div>
        </div>
      )}

      {/* Enhanced Watermark - dual display for branding and security */}
      {!playerError && (teacherName || studentName || studentEmail) && (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-4 pointer-events-none">
          {/* Teacher branding (left side) */}
          {teacherName && (
            <div className="bg-gradient-to-br from-primary/90 to-primary/70 text-primary-foreground px-4 py-2 rounded-lg backdrop-blur-md shadow-lg border border-primary-foreground/20">
              <p className="text-xs font-medium opacity-75">Instructor</p>
              <p className="font-semibold text-sm">{teacherName}</p>
            </div>
          )}
          
          {/* Student watermark (right side) - for security tracking */}
          {(studentName || studentEmail) && (
            <div className="bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-md shadow-lg border border-white/10">
              <p className="text-xs font-medium opacity-60">Licensed to</p>
              {studentName && <p className="font-semibold text-sm">{studentName}</p>}
              {studentEmail && <p className="text-xs opacity-75 mt-0.5">{studentEmail}</p>}
            </div>
          )}
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        style={{ pointerEvents: showControls ? "auto" : "none" }}
      >
        {/* Progress bar */}
        <div className="mb-3">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleSeek}
            className="cursor-pointer"
            data-testid="video-progress-slider"
          />
          <div className="flex justify-between text-xs text-white mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="text-white hover:bg-white/20"
            data-testid="button-play-pause"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
              data-testid="button-mute"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <div className="w-24">
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
                data-testid="volume-slider"
              />
            </div>
          </div>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/20"
            data-testid="button-fullscreen"
          >
            <Maximize className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
