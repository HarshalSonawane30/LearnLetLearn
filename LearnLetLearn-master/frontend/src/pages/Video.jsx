import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../app/AuthContext';
import { socketService } from '../services/socketService';
import { LoadingSpinner, ErrorMessage } from '../components/ui';

const Video = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [roomId, setRoomId] = useState('');
  const [status, setStatus] = useState('idle'); // idle, joining, connected, calling
  const [error, setError] = useState('');
  const [remoteUserId, setRemoteUserId] = useState('');
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  // Initialize socket and handle video events
  useEffect(() => {
    if (!user?._id) return;

    socketService.initialize(user._id, () => {
      console.log('Video socket connected');
    });

    const socket = socketService.getInstance();

    // Handle incoming video offer
    socket?.on('video_offer', async ({ offer, senderId }) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          socket.emit('video_answer', { roomId, answer, senderId: user._id, receiverId: senderId });
        }
      } catch (err) {
        console.error('Error handling video offer:', err);
        setError('Failed to handle incoming call');
      }
    });

    // Handle incoming video answer
    socket?.on('video_answer', async ({ answer }) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          setStatus('connected');
        }
      } catch (err) {
        console.error('Error handling video answer:', err);
        setError('Failed to establish connection');
      }
    });

    // Handle ICE candidates
    socket?.on('ice_candidate', async ({ candidate }) => {
      try {
        if (candidate && peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    });

    return () => {
      socket?.off('video_offer');
      socket?.off('video_answer');
      socket?.off('ice_candidate');
    };
  }, [user?._id, roomId]);

  // Join room and get media stream
  const joinRoom = useCallback(async () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    try {
      setStatus('joining');
      setError('');

      const socket = socketService.getInstance();
      socket?.emit('join_video_room', { roomId, userId: user._id });

      // Get local media stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });

      localStreamRef.current = mediaStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      // Create peer connection
      const iceServers = {
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
        ],
      };

      const peerConnection = new RTCPeerConnection(iceServers);
      peerConnectionRef.current = peerConnection;

      // Add local stream tracks
      mediaStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, mediaStream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (event.streams?.[0]) {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit('ice_candidate', {
            roomId,
            candidate: event.candidate,
            senderId: user._id,
          });
        }
      };

      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'failed') {
          setError('Connection failed');
          setStatus('idle');
        }
      };

      setStatus('idle');
    } catch (err) {
      console.error('Error joining room:', err);
      const errorMsg = err.name === 'NotAllowedError' 
        ? 'Camera/microphone access denied' 
        : 'Failed to join room';
      setError(errorMsg);
      setStatus('idle');
    }
  }, [roomId, user?._id]);

  // Start call (create offer)
  const startCall = useCallback(async () => {
    if (!remoteUserId.trim()) {
      setError('Please enter peer user ID');
      return;
    }

    try {
      setStatus('calling');
      setError('');

      if (!peerConnectionRef.current) {
        setError('Please join a room first');
        setStatus('idle');
        return;
      }

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      const socket = socketService.getInstance();
      socket?.emit('video_offer', {
        roomId,
        offer,
        senderId: user._id,
        receiverId: remoteUserId,
      });
    } catch (err) {
      console.error('Error starting call:', err);
      setError('Failed to start call');
      setStatus('idle');
    }
  }, [roomId, remoteUserId, user?._id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  if (authLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-gray-800">Video Call</h2>
        <p className="text-gray-600 mb-6">Connect with others via video</p>

        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError('')}
          />
        )}

        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Room ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={joinRoom}
                  disabled={status === 'joining' || !roomId.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {status === 'joining' ? 'Joining...' : 'Join Room'}
                </button>
              </div>
            </div>

            {status !== 'idle' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Peer User ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter peer user ID to call"
                    value={remoteUserId}
                    onChange={(e) => setRemoteUserId(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={startCall}
                    disabled={status === 'calling' || !remoteUserId.trim()}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {status === 'calling' ? 'Calling...' : 'Start Call'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {status !== 'idle' && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded">
              Status: {status === 'joining' ? 'Joining room...' : status === 'calling' ? 'Calling...' : 'Connected'}
            </div>
          )}
        </div>

        {/* Video Grid */}
        <div className="bg-black rounded-lg overflow-hidden shadow-lg">
          {status === 'idle' && !localStreamRef.current ? (
            <div className="aspect-video flex items-center justify-center text-gray-400">
              <p>Join a room to start video call</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 aspect-video">
              <div className="bg-black relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-gray-900/70 text-white px-2 py-1 rounded text-xs">
                  You
                </div>
              </div>
              <div className="bg-black relative">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-gray-900/70 text-white px-2 py-1 rounded text-xs">
                  Peer
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Video;
