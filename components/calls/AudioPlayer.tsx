'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardBody, Button, Slider, Chip } from '@nextui-org/react';
import { Database } from '@/types/database.types';

type CallRecord = Database['public']['Tables']['calls']['Row'];

interface AudioPlayerProps {
  call: CallRecord;
  className?: string;
}

export default function AudioPlayer({ call, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setError('Failed to load audio file');
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [call.recording_url]);

  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      setError('Failed to play audio');
      console.error('Audio play error:', err);
    }
  };

  const handleSeek = (value: number | number[]) => {
    if (!audioRef.current) return;
    const time = Array.isArray(value) ? value[0] : value;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleSpeedChange = (speed: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const handleVolumeChange = (value: number | number[]) => {
    if (!audioRef.current) return;
    const vol = (Array.isArray(value) ? value[0] : value) / 100;
    audioRef.current.volume = vol;
    setVolume(vol);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  if (!call.recording_url) {
    return (
      <Card className={className}>
        <CardBody className="text-center py-8">
          <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Recording Available
          </h3>
          <p className="text-muted-foreground text-sm">
            This call doesn't have a recording or it may still be processing.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={`w-full max-w-2xl ${className}`}>
      <CardBody className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Call Recording
            </h3>
            <p className="text-sm text-muted-foreground">
              {call.caller_name || call.caller_number} •{' '}
              {call.call_duration
                ? `${Math.floor(call.call_duration / 60)}:${(call.call_duration % 60).toString().padStart(2, '0')}`
                : 'Duration unknown'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isLoading && (
              <Chip size="sm" variant="flat" color="primary">
                Loading...
              </Chip>
            )}
            {error && (
              <Chip size="sm" variant="flat" color="danger">
                Error
              </Chip>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
            <p className="text-danger-900 text-sm">{error}</p>
          </div>
        )}

        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={call.recording_url}
          preload="metadata"
          className="hidden"
        />

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            size="sm"
            color="primary"
            value={currentTime}
            maxValue={duration || 100}
            onChange={handleSeek}
            className="w-full"
            classNames={{
              track: 'border-s-primary-100',
              filler: 'bg-gradient-to-r from-primary-500 to-primary-300',
              thumb:
                'shadow-lg border-4 border-white after:bg-primary-500 hover:after:bg-primary-600',
            }}
            isDisabled={!duration || isLoading}
          />

          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{duration ? formatTime(duration) : '--:--'}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Skip Backward */}
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={() => skipTime(-15)}
            isDisabled={!duration || isLoading}
            aria-label="Skip backward 15 seconds"
            className="hover:scale-110 transition-transform"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
              />
            </svg>
          </Button>

          {/* Play/Pause */}
          <Button
            isIconOnly
            color="primary"
            size="lg"
            onPress={togglePlayPause}
            isDisabled={!duration || isLoading}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            className="hover:scale-110 transition-transform w-14 h-14"
          >
            {isPlaying ? (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                />
              </svg>
            )}
          </Button>

          {/* Skip Forward */}
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={() => skipTime(15)}
            isDisabled={!duration || isLoading}
            aria-label="Skip forward 15 seconds"
            className="hover:scale-110 transition-transform"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
              />
            </svg>
          </Button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-between gap-6">
          {/* Playback Speed */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Speed:
            </span>
            <div className="flex gap-1">
              {playbackSpeeds.map((speed) => (
                <Button
                  key={speed}
                  size="sm"
                  variant={playbackSpeed === speed ? 'solid' : 'flat'}
                  color={playbackSpeed === speed ? 'primary' : 'default'}
                  onPress={() => handleSpeedChange(speed)}
                  className="min-w-unit-12 text-xs hover:scale-105 transition-transform"
                >
                  {speed}x
                </Button>
              ))}
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 flex-1 max-w-32">
            <svg
              className="w-4 h-4 text-muted-foreground flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.59-.63-1.59-1.41V9.91c0-.78.71-1.41 1.59-1.41H6.75Z"
              />
            </svg>
            <Slider
              size="sm"
              color="secondary"
              value={volume * 100}
              onChange={handleVolumeChange}
              className="flex-1"
              classNames={{
                filler: 'bg-gradient-to-r from-secondary-500 to-secondary-300',
                thumb:
                  'shadow-lg border-4 border-white after:bg-secondary-500 hover:after:bg-secondary-600',
              }}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
