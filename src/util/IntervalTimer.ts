/**
 * An interval timer with manual updates.
 * Triggers an event every x msec.
 */
export class IntervalTimer {
	
	private readonly startTime: number;
	private readonly action: () => void;
	private remain: number;

	constructor(startTime: number, onIntervalComplete: () => void, phase?: number) {
		this.startTime = startTime;
		this.action = onIntervalComplete;
		this.remain = startTime + (phase || 0);
	}

	preUpdate(timer: number, delta: number) {
		this.remain -= delta;
		if (this.remain < 0) {
			this.action();
			this.remain += this.startTime;
		}
	}
}
