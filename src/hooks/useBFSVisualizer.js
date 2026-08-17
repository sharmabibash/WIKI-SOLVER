'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { bidirectionalBFSStepper } from '../algorithms/bidirectionalBFS';
import { WikiGraphModel } from '../wiki/buildGraph';
import confetti from 'canvas-confetti';

export function useBFSVisualizer() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [speed, setSpeed] = useState(1); // 0.25x, 0.5x, 1x, 2x, 5x, 0 for instant
  
  const [startNode, setStartNode] = useState('');
  const [targetNode, setTargetNode] = useState('');
  
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [shortestPath, setShortestPath] = useState([]);
  const [intersectionNode, setIntersectionNode] = useState(null);
  
  const [currentStepInfo, setCurrentStepInfo] = useState({
    message: 'Ready to solve. Choose Start and Target articles.',
    direction: null,
    activeNode: null,
    level: 0
  });

  const [stats, setStats] = useState({
    forwardCount: 0,
    backwardCount: 0,
    depth: 0,
    queueForwardSize: 0,
    queueBackwardSize: 0,
    hops: 0,
    startTime: null,
    elapsedMs: 0
  });

  const [logs, setLogs] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // References to preserve state across async generator ticks
  const graphModelRef = useRef(new WikiGraphModel());
  const stepperRef = useRef(null);
  const isPausedRef = useRef(false);
  const isRunningRef = useRef(false);
  const speedRef = useRef(1);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const addLog = useCallback((message, type = 'info') => {
    setLogs(prev => [
      {
        id: Math.random().toString(36).substring(2, 9),
        time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message,
        type
      },
      ...prev.slice(0, 150)
    ]);
  }, []);

  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#c084fc', '#facc15', '#10b981', '#f43f5e']
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const handleStep = useCallback(async () => {
    if (!stepperRef.current) return false;

    const next = await stepperRef.current.next();
    if (next.done || !next.value) {
      setIsRunning(false);
      setIsPaused(false);
      return false;
    }

    const event = next.value;
    const model = graphModelRef.current;

    if (startTimeRef.current) {
      setStats(prev => ({
        ...prev,
        elapsedMs: Date.now() - startTimeRef.current
      }));
    }

    switch (event.type) {
      case 'INIT': {
        model.clear();
        model.addNode(event.start, 'forward', 'frontier', 0);
        model.addNode(event.target, 'backward', 'frontier', 0);
        setGraphData(model.toD3Format());
        addLog(event.message, 'info');
        setCurrentStepInfo({
          message: event.message,
          direction: null,
          activeNode: null,
          level: 0
        });
        break;
      }

      case 'EXPAND_START': {
        if (model.nodes.has(event.node)) {
          model.nodes.get(event.node).status = 'expanding';
        }
        setGraphData(model.toD3Format());
        setCurrentStepInfo({
          message: event.message,
          direction: event.direction,
          activeNode: event.node,
          level: event.level
        });
        if (event.stats) {
          setStats(prev => ({ ...prev, ...event.stats }));
        }
        addLog(event.message, event.direction);
        break;
      }

      case 'FETCH_COMPLETE': {
        setCurrentStepInfo(prev => ({
          ...prev,
          message: event.message
        }));
        break;
      }

      case 'NODE_DISCOVERED': {
        const { direction, source, target, level } = event;
        // If forward: source is parent, target is discovered child
        // If backward: target is parent, source is discovered child (backlink)
        if (direction === 'forward') {
          model.addNode(target, 'forward', 'frontier', level, source);
          model.addEdge(source, target, 'forward');
        } else {
          model.addNode(source, 'backward', 'frontier', level, target);
          model.addEdge(source, target, 'backward');
        }
        setGraphData(model.toD3Format());
        if (event.stats) {
          setStats(prev => ({ ...prev, ...event.stats }));
        }
        break;
      }

      case 'EXPAND_END': {
        if (model.nodes.has(event.node)) {
          model.nodes.get(event.node).status = 'visited';
        }
        setGraphData(model.toD3Format());
        break;
      }

      case 'COLLISION': {
        setIntersectionNode(event.intersection);
        setShortestPath(event.path);
        setIsComplete(true);
        setIsRunning(false);
        setIsPaused(false);

        model.markShortestPath(event.path);
        setGraphData(model.toD3Format());

        if (event.stats) {
          setStats(prev => ({
            ...prev,
            ...event.stats,
            hops: event.path.length - 1,
            elapsedMs: startTimeRef.current ? Date.now() - startTimeRef.current : 0
          }));
        }

        setCurrentStepInfo({
          message: event.message,
          direction: 'collision',
          activeNode: event.intersection,
          level: event.stats?.depth || 0
        });

        addLog(event.message, 'collision');
        triggerCelebration();
        return false;
      }

      case 'LIMIT_REACHED':
      case 'NO_PATH': {
        setIsComplete(true);
        setIsRunning(false);
        setIsPaused(false);
        setCurrentStepInfo({
          message: event.message,
          direction: 'error',
          activeNode: null,
          level: 0
        });
        addLog(event.message, 'warning');
        return false;
      }

      default:
        break;
    }

    return true;
  }, [addLog, triggerCelebration]);

  // Main loop runner that respects speed and pause
  const runLoop = useCallback(async () => {
    while (isRunningRef.current && !isPausedRef.current) {
      const hasMore = await handleStep();
      if (!hasMore) break;

      const currentSpeed = speedRef.current;
      if (currentSpeed > 0) {
        // High-speed smooth delay: 1x = 70ms, 2x = 35ms, 5x = 10ms, Max = 0ms
        const delay = currentSpeed >= 10 ? 0 : Math.max(5, Math.floor(70 / currentSpeed));
        if (delay > 0) {
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
  }, [handleStep]);

  const startSolving = useCallback((start, target) => {
    if (!start || !target) return;
    const cleanStart = start.trim();
    const cleanTarget = target.trim();

    setStartNode(cleanStart);
    setTargetNode(cleanTarget);
    setShortestPath([]);
    setIntersectionNode(null);
    setIsComplete(false);
    setLogs([]);
    
    startTimeRef.current = Date.now();
    setStats({
      forwardCount: 0,
      backwardCount: 0,
      depth: 0,
      queueForwardSize: 0,
      queueBackwardSize: 0,
      hops: 0,
      startTime: Date.now(),
      elapsedMs: 0
    });

    graphModelRef.current.clear();
    setGraphData({ nodes: [], links: [] });

    stepperRef.current = bidirectionalBFSStepper(cleanStart, cleanTarget, {
      maxDepth: 10,
      maxNodesExplored: 1200,
      batchSize: 20,
      branchLimit: 45
    });

    setIsRunning(true);
    setIsPaused(false);
    isRunningRef.current = true;
    isPausedRef.current = false;

    // Trigger run loop on next tick
    setTimeout(() => {
      runLoop();
    }, 50);
  }, [runLoop]);

  const pauseSolving = useCallback(() => {
    setIsPaused(true);
    isPausedRef.current = true;
  }, []);

  const resumeSolving = useCallback(() => {
    setIsPaused(false);
    isPausedRef.current = false;
    runLoop();
  }, [runLoop]);

  const stepForward = useCallback(async () => {
    if (!stepperRef.current) return;
    if (isRunning && !isPaused) {
      pauseSolving();
    }
    await handleStep();
  }, [handleStep, isRunning, isPaused, pauseSolving]);

  const resetSolving = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setIsComplete(false);
    isRunningRef.current = false;
    isPausedRef.current = false;
    stepperRef.current = null;
    graphModelRef.current.clear();
    setGraphData({ nodes: [], links: [] });
    setShortestPath([]);
    setIntersectionNode(null);
    setCurrentStepInfo({
      message: 'Reset complete. Ready to search.',
      direction: null,
      activeNode: null,
      level: 0
    });
    setStats({
      forwardCount: 0,
      backwardCount: 0,
      depth: 0,
      queueForwardSize: 0,
      queueBackwardSize: 0,
      hops: 0,
      startTime: null,
      elapsedMs: 0
    });
  }, []);

  return {
    isRunning,
    isPaused,
    isComplete,
    speed,
    setSpeed,
    startNode,
    targetNode,
    graphData,
    shortestPath,
    intersectionNode,
    currentStepInfo,
    stats,
    logs,
    selectedArticle,
    setSelectedArticle,
    startSolving,
    pauseSolving,
    resumeSolving,
    stepForward,
    resetSolving
  };
}
