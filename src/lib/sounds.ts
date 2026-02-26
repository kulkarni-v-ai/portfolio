'use client';

// Singleton sound manager using Web Audio API
class SoundManager {
    private static instance: SoundManager;
    private ctx: AudioContext | null = null;
    private initialized = false;
    private muted = false;

    static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    private getCtx(): AudioContext | null {
        if (typeof window === 'undefined') return null;
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.ctx;
    }

    init() {
        if (this.initialized) return;
        const ctx = this.getCtx();
        if (ctx && ctx.state === 'suspended') ctx.resume();
        this.initialized = true;
    }

    toggle() {
        this.muted = !this.muted;
        return !this.muted;
    }

    isMuted() { return this.muted; }

    // Hover: soft high-frequency blip
    playHover() {
        if (this.muted) return;
        const ctx = this.getCtx();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    }

    // Click: sharper percussive pop
    playClick() {
        if (this.muted) return;
        const ctx = this.getCtx();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    }

    // Rocket launch: rising sweep + rumble
    playRocketLaunch() {
        if (this.muted) return;
        const ctx = this.getCtx();
        if (!ctx) return;

        // Rising sweep
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(80, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 1.2);
        gain1.gain.setValueAtTime(0.08, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 1.4);

        // Rumble bass
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(40, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.8);
        gain2.gain.setValueAtTime(0.1, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 1.0);

        // Noise burst for woosh
        const bufferSize = ctx.sampleRate * 0.8;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(500, ctx.currentTime);
        noiseFilter.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.8);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noiseGain.gain.setValueAtTime(0.06, ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 0.8);
    }

    // Ambient ping for UI actions
    playPing() {
        if (this.muted) return;
        const ctx = this.getCtx();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    }
}

export const soundManager = SoundManager.getInstance();
