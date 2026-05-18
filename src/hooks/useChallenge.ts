import { useState, useEffect, useRef } from 'react';
import type { VimState, ChallengeConfig } from '@/core/types';

export const useChallenge = (
  config: ChallengeConfig,
  state: VimState,
  onComplete?: (result: { time: number }) => void
) => {
  const [goalsStatus, setGoalsStatus] = useState<Record<string, boolean>>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const prevConfigRef = useRef(config);
  // 把"易变值"放进 ref，避免进入 validator effect 的 deps：
  // - elapsedRef：onComplete 调用时读取最新计时，但 elapsed 自身的 setInterval 更新
  //   不应触发 validator 重跑。
  // - goalsStatusRef：判断"是否已完成"也无需把 goalsStatus 放 deps。
  // - onCompleteRef：父组件每次 render 传入新引用也不应触发 validator。
  const elapsedRef = useRef(0);
  const goalsStatusRef = useRef<Record<string, boolean>>({});
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  useEffect(() => {
    goalsStatusRef.current = goalsStatus;
  }, [goalsStatus]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Reset challenge state when config changes (e.g., switching lessons)
  useEffect(() => {
    if (prevConfigRef.current !== config) {
      setGoalsStatus({});
      goalsStatusRef.current = {};
      setStartTime(null);
      setElapsed(0);
      elapsedRef.current = 0;
      setIsComplete(false);
      prevConfigRef.current = config;
    }
  }, [config]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime && !isComplete) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isComplete]);

  useEffect(() => {
    if (isComplete) return;

    const newStatus = { ...goalsStatusRef.current };
    let changed = false;

    config.goals.forEach(g => {
      if (!newStatus[g.id]) {
        if (g.validator(null, state, state.lastCommand)) {
          newStatus[g.id] = true;
          changed = true;
        }
      }
    });

    if (changed) {
      goalsStatusRef.current = newStatus;
      setGoalsStatus(newStatus);
      setStartTime(prev => prev ?? Date.now());

      const completedCount = Object.values(newStatus).filter(Boolean).length;
      if (completedCount >= config.goalsRequired) {
        setIsComplete(true);
        onCompleteRef.current?.({ time: elapsedRef.current });
      }
    }
  }, [state, config, isComplete]);

  const restart = () => {
    setGoalsStatus({});
    goalsStatusRef.current = {};
    setStartTime(null);
    setElapsed(0);
    elapsedRef.current = 0;
    setIsComplete(false);
  };

  const startTimer = () => {
    setStartTime(prev => prev ?? Date.now());
  };

  return {
    goalsStatus,
    elapsed,
    isComplete,
    restart,
    startTimer,
    completedCount: Object.values(goalsStatus).filter(Boolean).length
  };
};
