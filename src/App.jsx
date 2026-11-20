import React, { useState, useRef, useEffect } from 'react';
import Canvas3D from './components/Canvas3D.jsx';
import TopBar from './components/TopBar.jsx';
import BottomBar from './components/BottomBar.jsx';
import CameraHint from './components/CameraHint.jsx';
import CreateKrathongModal from './components/CreateKrathongModal.jsx';
import VoteModal from './components/VoteModal.jsx';
import LeaderboardModal from './components/LeaderboardModal.jsx';
import { appState } from './three/state.js';
import { soundSystem } from './three/audio.js';

export default function App() {
  const [contestants, setContestants] = useState([...appState.contestants]);
  const [selectedContestant, setSelectedContestant] = useState(null);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [userVotedIds, setUserVotedIds] = useState([...appState.userVotedIds]);

  const canvasRef = useRef(null);

  // Subscribe to Realtime Firestore updates
  useEffect(() => {
    const unsubscribe = appState.subscribeToFirestore((updatedList) => {
      setContestants([...updatedList]);
      setSelectedContestant((prev) => {
        if (!prev) return null;
        const fresh = updatedList.find(c => c.id === prev.id);
        return fresh || prev;
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Toggle Audio
  const handleToggleAudio = () => {
    const active = soundSystem.toggleMusic();
    setIsAudioActive(active);
  };

  // Reset Camera View
  const handleResetCamera = () => {
    if (canvasRef.current) {
      canvasRef.current.resetCamera();
    }
  };

  // When user taps on a Krathong in 3D River
  const handleSelectKrathongFromScene = (contestant) => {
    const freshData = contestants.find(c => c.id === contestant.id) || contestant;
    setSelectedContestant(freshData);
    setIsVoteModalOpen(true);
    if (canvasRef.current) {
      canvasRef.current.highlightKrathong(contestant.id);
    }
  };

  // Close Vote Modal
  const handleCloseVoteModal = () => {
    setIsVoteModalOpen(false);
    setSelectedContestant(null);
    if (canvasRef.current) {
      canvasRef.current.resetHighlight();
    }
  };

  // Handle Vote Action with Firestore persistence
  const handleVote = async (id, clientX, clientY) => {
    const newVotes = await appState.voteFor(id);
    setContestants([...appState.contestants]);
    setUserVotedIds([...appState.userVotedIds]);

    if (selectedContestant && selectedContestant.id === id) {
      setSelectedContestant({ ...selectedContestant, votes: newVotes });
    }

    soundSystem.playVoteSound();
    triggerHeartBurst(clientX, clientY);
  };

  // Handle New Krathong Creation with image compression <= 500KB and Firestore
  const handleCreateKrathong = async (data) => {
    const newContestant = await appState.addContestant(data);
    setContestants([...appState.contestants]);

    if (canvasRef.current) {
      canvasRef.current.addNewKrathong(newContestant);
    }
    soundSystem.playLaunchSound();
  };

  // Fly to contestant from Leaderboard
  const handleSelectFromLeaderboard = (id) => {
    setIsLeaderboardOpen(false);
    if (canvasRef.current) {
      canvasRef.current.focusOnKrathong(id);
    }
    const target = contestants.find(c => c.id === id);
    if (target) {
      setTimeout(() => {
        setSelectedContestant(target);
        setIsVoteModalOpen(true);
      }, 700);
    }
  };

  // Heart particle burst effect
  const triggerHeartBurst = (clientX, clientY) => {
    const x = clientX || window.innerWidth / 2;
    const y = clientY || window.innerHeight / 2;
    const hearts = ['💖', '❤️', '✨', '🌸', '💫'];

    for (let i = 0; i < 8; i++) {
      const el = document.createElement('div');
      el.className = 'burst-heart';
      el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;

      const angle = (i / 8) * Math.PI * 2 + (Math.random() * 0.4);
      const dist = 60 + Math.random() * 80;
      el.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      el.style.setProperty('--dy', `${Math.sin(angle) * dist - 30}px`);

      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1000);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#070e1c] select-none">
      {/* 3D WebGL Canvas Layer */}
      <Canvas3D
        ref={canvasRef}
        contestants={contestants}
        onSelectKrathong={handleSelectKrathongFromScene}
      />

      {/* React UI Overlay Layer */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 md:p-4">
        {/* Top Header */}
        <TopBar
          contestantCount={contestants.length}
          isAudioActive={isAudioActive}
          onToggleAudio={handleToggleAudio}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onResetCamera={handleResetCamera}
        />

        {/* Gesture Guidance Pill */}
        <CameraHint />

        {/* Bottom Floating Action Bar */}
        <BottomBar onOpenCreate={() => setIsCreateModalOpen(true)} />
      </div>

      {/* Modals */}
      <CreateKrathongModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateKrathong}
      />

      <VoteModal
        isOpen={isVoteModalOpen}
        contestant={selectedContestant}
        hasVoted={selectedContestant ? userVotedIds.includes(selectedContestant.id) : false}
        onVote={handleVote}
        onClose={handleCloseVoteModal}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        leaderboardList={appState.getLeaderboard(15)}
        onSelectContestant={handleSelectFromLeaderboard}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </div>
  );
}
