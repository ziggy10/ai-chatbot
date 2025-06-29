import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { RecorderState, RecordingState } from '../types';

const MAX_RECORDING_TIME = 600;

export function useRecording() {
  const [recorderState, setRecorderState] = useState<RecorderState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const updateWaveform = useCallback(() => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const waveform = [];
    const samples = 120;
    const step = Math.floor(bufferLength / samples);
    
    for (let i = 0; i < samples; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += dataArray[i * step + j];
      }
      const normalizedValue = (sum / step / 255) * 0.8 + Math.random() * 0.2;
      waveform.push(Math.min(1, normalizedValue));
    }
    
    setWaveformData(waveform);
    
    if (recorderState === 'recording') {
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    }
  }, [recorderState]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.8;
      source.connect(analyserRef.current);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };
      
      mediaRecorder.start(100);
      setRecorderState('recording');
      setRecordingTime(0);
      
      updateWaveform();
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);
      
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  }, [updateWaveform]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recorderState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecorderState('paused');
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [recorderState]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recorderState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecorderState('recording');
      
      updateWaveform();
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);
    }
  }, [recorderState, updateWaveform]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecorderState('processing');
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, []);

  const deleteRecording = useCallback(() => {
    if (mediaRecorderRef.current && (recorderState === 'recording' || recorderState === 'paused')) {
      mediaRecorderRef.current.stop();
    }
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setRecorderState('idle');
    setRecordingTime(0);
    setAudioBlob(null);
    setWaveformData([]);
    
    toast.info('Recording deleted');
  }, [recorderState]);

  const retryRecording = useCallback(() => {
    setRecorderState('paused');
    setAudioBlob(null);
    toast.info('Ready to retry transcription');
  }, []);

  const recordingState: RecordingState = {
    recorderState,
    recordingTime,
    audioBlob,
    waveformData,
  };

  return {
    recordingState,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    deleteRecording,
    retryRecording,
    setRecorderState,
  };
}