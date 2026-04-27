import { ResultLevelDecider } from './result-level-decider';
import type { DimensionProfile } from '@without-ai/shared';

const LOW: DimensionProfile = { understanding: 15, thinking: 20, organization: 15, execution: 10, judgment: 18 };
const MID: DimensionProfile = { understanding: 45, thinking: 55, organization: 40, execution: 35, judgment: 42 };
const HIGH: DimensionProfile = { understanding: 75, thinking: 85, organization: 70, execution: 65, judgment: 78 };
const ONE_HIGH: DimensionProfile = { understanding: 20, thinking: 85, organization: 30, execution: 20, judgment: 25 };

describe('ResultLevelDecider', () => {
  const d = new ResultLevelDecider();

  it('low score no triggers → continue', () => {
    expect(d.decide(20, [], LOW, null)).toBe('continue');
  });
  it('moderate score → limit', () => {
    expect(d.decide(50, [], MID, null)).toBe('limit');
  });
  it('high score → pause', () => {
    expect(d.decide(85, [], HIGH, null)).toBe('pause');
  });
  it('escalation trigger forces continue→limit', () => {
    expect(d.decide(20, ['first_process_replaced'], LOW, null)).toBe('limit');
  });
  it('pause trigger forces limit→pause', () => {
    expect(d.decide(50, ['cannot_finish_without_ai'], MID, null)).toBe('pause');
  });
  it('全面退化 pattern → pause', () => {
    expect(d.decide(50, [], HIGH, '全面退化')).toBe('pause');
  });
  it('替代模式 pattern → limit when score is continue', () => {
    expect(d.decide(20, [], MID, '替代模式')).toBe('limit');
  });
  it('single dimension ≥ 80 → pause', () => {
    expect(d.decide(30, [], ONE_HIGH, null)).toBe('pause');
  });
});
