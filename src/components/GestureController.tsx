'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { soundManager } from '@/lib/sounds';
import { useStore } from '@/store/useStore';

// Gesture types we detect
type Gesture = 'none' | 'point_up' | 'point_down' | 'point_left' | 'swipe_left' | 'swipe_right' | 'open_palm' | 'pinch' | 'fist' | 'zoom_in' | 'zoom_out';

interface GestureState {
    gesture: Gesture;
    handX: number;
    handY: number;
    fingerTipX: number;
    fingerTipY: number;
    fingerCount: number;
    pinchDistance: number;
    twoHandDistance?: number;
}

const FINGER_TIPS = [4, 8, 12, 16, 20];
const FINGER_PIPS = [3, 6, 10, 14, 18];

function countFingers(landmarks: any[]): number {
    let count = 0;
    const wrist = landmarks[0];

    // Thumb
    if (Math.abs(landmarks[4].x - landmarks[3].x) > 0.04) count++;

    // Other fingers: compare tip distance from wrist to pip distance from wrist
    for (let i = 1; i < 5; i++) {
        const tipDist = Math.hypot(landmarks[FINGER_TIPS[i]].x - wrist.x, landmarks[FINGER_TIPS[i]].y - wrist.y);
        const pipDist = Math.hypot(landmarks[FINGER_PIPS[i]].x - wrist.x, landmarks[FINGER_PIPS[i]].y - wrist.y);
        if (tipDist > pipDist + 0.01) count++;
    }
    return count;
}

function getPinchDistance(landmarks: any[]): number {
    const thumb = landmarks[4];
    const index = landmarks[8];
    return Math.sqrt(
        (thumb.x - index.x) ** 2 +
        (thumb.y - index.y) ** 2 +
        (thumb.z - index.z) ** 2
    );
}

function detectGesture(landmarks: any[], prevX: number, allHands?: any[]): GestureState {
    const fingers = countFingers(landmarks);
    const pinch = getPinchDistance(landmarks);
    const wrist = landmarks[0];
    const indexTip = landmarks[8];

    let gesture: Gesture = 'none';
    let twoHandDistance: number | undefined;

    // Two-hand zoom detection
    if (allHands && allHands.length >= 2) {
        const hand1Center = allHands[0][0]; // wrist of hand 1
        const hand2Center = allHands[1][0]; // wrist of hand 2
        twoHandDistance = Math.sqrt(
            (hand1Center.x - hand2Center.x) ** 2 +
            (hand1Center.y - hand2Center.y) ** 2
        );
    }

    if (fingers === 0) {
        gesture = 'fist';
    } else if (pinch < 0.05) {
        gesture = 'pinch';
    } else if (fingers >= 4) {
        // Open palm: use hand Y position to determine zoom direction
        if (indexTip.y < 0.4) {
            gesture = 'zoom_in';
        } else if (indexTip.y > 0.6) {
            // Zoom out usually looks like palm pushing away or low. 
            // We can add a "palm moving down" check instead.

            // Check if wrist is pointed down or palm is facing down
            // If the finger tips are much lower than the wrist, it's a downward palm.
            if ((landmarks[12].y - wrist.y) > 0.15) {
                gesture = 'point_down'; // repurpose point_down action for palm down
            } else {
                gesture = 'zoom_out';
            }
        } else {
            // Use pinch distance to smoothly determine zoom intensity when palm is open
            // If the hand is wide open (large pinch distance), zoom in
            if (pinch > 0.15) {
                gesture = 'zoom_in';
            } else {
                gesture = 'open_palm';
            }
        }
    } else if (fingers === 1) {
        // Mirrored X for screen coords
        const dx = (1 - indexTip.x) - (1 - wrist.x);
        const dy = indexTip.y - wrist.y;

        if (Math.abs(dx) > Math.abs(dy) * 1.5) {
            // Horizontal pointing
            gesture = 'none'; // Replaced going back with 3 fingers
        } else {
            // Vertical pointing
            if (dy > 0.1) gesture = 'point_down';
            else if (dy < -0.1) gesture = 'point_up';
            else gesture = 'none';
        }
    } else if (fingers === 2) {
        // Mirrored X for screen coords
        const dx = (1 - indexTip.x) - (1 - wrist.x);
        const dy = indexTip.y - wrist.y;

        // 2 fingers (peace sign) = Carousel Control via Hand Spin
        // Measure the angle between the wrist and index finger tip to determine spin
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        // If hand is severely tilted left or right
        if (angle > 120 || angle < -120) {
            gesture = 'swipe_right'; // Hand leaning right (from user perspective)
        } else if (angle > -60 && angle < 60) {
            gesture = 'swipe_left'; // Hand leaning left
        }
    } else if (fingers === 3) {
        // 3 fingers: go back (mapped to point_left action)
        gesture = 'point_left';
    }

    return {
        gesture,
        handX: wrist.x,
        handY: wrist.y,
        fingerTipX: 1 - indexTip.x, // mirror for screen coords
        fingerTipY: indexTip.y,
        fingerCount: fingers,
        pinchDistance: pinch,
        twoHandDistance,
    };
}

export function dispatchGestureEvent(action: string, data?: any) {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vanyx-gesture', { detail: { action, ...data } }));
    }
}

// ──── Click ripple component ────
function ClickRipple({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onDone, 700);
        return () => clearTimeout(timer);
    }, [onDone]);

    return (
        <div
            className="fixed pointer-events-none z-[9998]"
            style={{ left: x - 30, top: y - 30 }}
        >
            <div className="w-[60px] h-[60px] rounded-full border-2 border-cyan-400/80 animate-ping" />
            <div className="absolute inset-0 w-[60px] h-[60px] rounded-full bg-cyan-400/20 animate-pulse" />
        </div>
    );
}

export default function GestureController() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [currentGesture, setCurrentGesture] = useState<Gesture>('none');
    const handDetectorRef = useRef<any>(null);
    const animFrameRef = useRef<number>(0);
    const prevXRef = useRef(0.5);
    const lastActionRef = useRef(0);
    const streamRef = useRef<MediaStream | null>(null);
    const [showPanel, setShowPanel] = useState(false);

    // Cursor position for hand tracking
    const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
    const cursorSmoothRef = useRef({ x: -100, y: -100 });

    // Click ripples
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
    const rippleIdRef = useRef(0);

    // Scroll accumulator for smooth scrolling
    const scrollAccRef = useRef(0);
    const scrollRafRef = useRef<number>(0);

    // Zoom state for dispatching
    const lastZoomRef = useRef(0);

    // Pinch distance tracking for click detection
    const prevPinchRef = useRef(1);
    const pinchClickCooldownRef = useRef(0);

    // Hand velocity tracking for deliberate click detection
    const prevHandPosRef = useRef({ x: 0.5, y: 0.5 });
    const handVelocityRef = useRef(0);

    const throttleMs = 250;

    // Smooth scroll loop - runs independently, drains the accumulator
    useEffect(() => {
        let active = true;
        const loop = () => {
            if (!active) return;
            const acc = scrollAccRef.current;
            if (Math.abs(acc) > 0.5) {
                // Drain a fraction each frame for buttery smoothness
                const step = acc * 0.12;
                window.scrollBy({ top: step });
                scrollAccRef.current -= step;
            } else {
                scrollAccRef.current = 0;
            }
            scrollRafRef.current = requestAnimationFrame(loop);
        };
        scrollRafRef.current = requestAnimationFrame(loop);
        return () => {
            active = false;
            cancelAnimationFrame(scrollRafRef.current);
        };
    }, []);

    const performAction = useCallback((state: GestureState) => {
        const now = Date.now();

        // ── Cursor movement (always, no throttle) ──
        const screenX = state.fingerTipX * window.innerWidth;
        const screenY = state.fingerTipY * window.innerHeight;

        // Smooth interpolation for cursor
        cursorSmoothRef.current.x += (screenX - cursorSmoothRef.current.x) * 0.3;
        cursorSmoothRef.current.y += (screenY - cursorSmoothRef.current.y) * 0.3;
        setCursorPos({ x: cursorSmoothRef.current.x, y: cursorSmoothRef.current.y });

        // Update store cursor so AICore and 3D scene react
        const normX = (state.fingerTipX) * 2 - 1;
        const normY = -(state.fingerTipY) * 2 + 1;
        useStore.getState().setCursorPosition(normX, normY);

        dispatchGestureEvent('cursor_move', {
            x: cursorSmoothRef.current.x,
            y: cursorSmoothRef.current.y,
        });

        // Dispatch rotate/pan event for the 3D scene
        dispatchGestureEvent('rotate', {
            x: state.fingerTipX,
            y: state.fingerTipY
        });

        // ── Track hand velocity for deliberate click detection ──
        const dx = state.fingerTipX - prevHandPosRef.current.x;
        const dy = state.fingerTipY - prevHandPosRef.current.y;
        handVelocityRef.current = Math.sqrt(dx * dx + dy * dy);
        prevHandPosRef.current = { x: state.fingerTipX, y: state.fingerTipY };

        // ── Pinch-to-click: only when hand is relatively still ──
        const isHandStill = handVelocityRef.current < 0.02;
        if (state.pinchDistance < 0.05 && prevPinchRef.current >= 0.05 && now - pinchClickCooldownRef.current > 600 && isHandStill) {
            pinchClickCooldownRef.current = now;
            const cx = cursorSmoothRef.current.x;
            const cy = cursorSmoothRef.current.y;

            // Visual ripple
            const id = rippleIdRef.current++;
            setRipples(prev => [...prev, { id, x: cx, y: cy }]);

            // Simulate click on element under cursor
            const el = document.elementFromPoint(cx, cy);
            if (el) {
                el.dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    clientX: cx,
                    clientY: cy,
                    view: window,
                }));
            }

            dispatchGestureEvent('click', { x: cx, y: cy });
            soundManager.playClick();
        }
        prevPinchRef.current = state.pinchDistance;

        // Throttled actions below
        if (now - lastActionRef.current < throttleMs) return;

        switch (state.gesture) {
            case 'point_up':
                // Accumulate scroll instead of window.scrollBy for smoothness
                scrollAccRef.current -= 180;
                lastActionRef.current = now;
                break;
            case 'point_down':
                scrollAccRef.current += 180;
                lastActionRef.current = now;
                break;
            case 'point_left':
                // navigate back securely to the main page to avoid leaving app
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
                lastActionRef.current = now + 1000; // Longer cooldown for history back
                break;
            case 'swipe_left':
                dispatchGestureEvent('carousel_prev');
                lastActionRef.current = now;
                break;
            case 'swipe_right':
                dispatchGestureEvent('carousel_next');
                lastActionRef.current = now;
                break;
            case 'zoom_in':
                dispatchGestureEvent('zoom', { direction: 'in' });
                lastActionRef.current = now;
                break;
            case 'zoom_out':
                dispatchGestureEvent('zoom', { direction: 'out' });
                lastActionRef.current = now;
                break;
            case 'open_palm':
                // Neutral open palm — no zoom
                break;
        }
    }, []);

    const startDetection = useCallback(async () => {
        if (isActive || isLoading) return;
        setIsLoading(true);
        setErrorMsg('');
        setShowPanel(true);

        await new Promise(r => setTimeout(r, 100));

        let stream: MediaStream | null = null;
        const constraints = [
            { video: { width: 320, height: 240, facingMode: 'user' } },
            { video: { width: { ideal: 320 }, height: { ideal: 240 } } },
            { video: true },
        ];

        for (const constraint of constraints) {
            try {
                stream = await navigator.mediaDevices.getUserMedia(constraint);
                break;
            } catch (e) {
                console.warn('Camera attempt failed:', e);
            }
        }

        if (!stream) {
            setErrorMsg('Camera unavailable — close other apps using it and retry');
            setIsLoading(false);
            return;
        }

        streamRef.current = stream;

        try {
            const video = videoRef.current;
            if (!video) {
                setErrorMsg('Video element not ready — try again');
                setIsLoading(false);
                stream.getTracks().forEach(t => t.stop());
                return;
            }

            video.srcObject = stream;

            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Video load timeout')), 5000);
                video.onloadeddata = () => {
                    clearTimeout(timeout);
                    resolve();
                };
                video.play().catch(reject);
            });

            console.log('Video playing:', video.videoWidth, 'x', video.videoHeight, 'readyState:', video.readyState);

            const vision = await import('@mediapipe/tasks-vision');
            const { HandLandmarker, FilesetResolver } = vision;

            const filesetResolver = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
            );

            let handLandmarker: any = null;
            for (const delegate of ['GPU', 'CPU'] as const) {
                try {
                    handLandmarker = await HandLandmarker.createFromOptions(filesetResolver, {
                        baseOptions: {
                            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                            delegate,
                        },
                        numHands: 2,
                        runningMode: 'VIDEO',
                        minHandDetectionConfidence: 0.3,
                        minHandPresenceConfidence: 0.3,
                        minTrackingConfidence: 0.3,
                    });
                    console.log(`HandLandmarker initialized with ${delegate}`);
                    break;
                } catch (e) {
                    console.warn(`${delegate} delegate failed:`, e);
                }
            }

            if (!handLandmarker) {
                setErrorMsg('Hand model failed to load');
                setIsLoading(false);
                return;
            }

            handDetectorRef.current = handLandmarker;
            setIsActive(true);
            setIsLoading(false);
            useStore.getState().setGestureActive(true);
            soundManager.init();
            soundManager.playPing();

            let lastTimestamp = -1;
            const detect = () => {
                if (!videoRef.current || !handDetectorRef.current) return;
                if (videoRef.current.readyState < 2) {
                    animFrameRef.current = requestAnimationFrame(detect);
                    return;
                }

                const now = performance.now();
                if (now <= lastTimestamp) {
                    animFrameRef.current = requestAnimationFrame(detect);
                    return;
                }
                lastTimestamp = now;

                try {
                    const results = handDetectorRef.current.detectForVideo(videoRef.current, now);

                    if (results.landmarks && results.landmarks.length > 0) {
                        const landmarks = results.landmarks[0];
                        const state = detectGesture(landmarks, prevXRef.current, results.landmarks);
                        prevXRef.current = state.handX;
                        setCurrentGesture(state.gesture);
                        performAction(state);
                        drawHand(landmarks, state);
                    } else {
                        setCurrentGesture('none');
                        setCursorPos({ x: -100, y: -100 });
                        const canvas = canvasRef.current;
                        if (canvas) {
                            const ctx = canvas.getContext('2d');
                            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
                        }
                    }
                } catch (e) {
                    // Silently handle
                }

                animFrameRef.current = requestAnimationFrame(detect);
            };

            detect();
        } catch (err: any) {
            console.error('Gesture init failed:', err);
            setErrorMsg(err?.message || 'Initialization failed — try reloading');
            setIsLoading(false);
            if (stream) stream.getTracks().forEach(t => t.stop());
        }
    }, [isActive, isLoading, performAction]);

    const stopDetection = useCallback(() => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (handDetectorRef.current) {
            handDetectorRef.current.close();
            handDetectorRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsActive(false);
        setCurrentGesture('none');
        setShowPanel(false);
        setCursorPos({ x: -100, y: -100 });
        useStore.getState().setGestureActive(false);
    }, []);

    const drawHand = (landmarks: any[], state: GestureState) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = state.gesture === 'none' ? 'rgba(0,180,255,0.4)' : 'rgba(0,255,180,0.7)';
        ctx.lineWidth = 2;

        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [5, 9], [9, 10], [10, 11], [11, 12],
            [9, 13], [13, 14], [14, 15], [15, 16],
            [13, 17], [17, 18], [18, 19], [19, 20],
            [0, 17],
        ];

        for (const [a, b] of connections) {
            ctx.beginPath();
            ctx.moveTo((1 - landmarks[a].x) * canvas.width, landmarks[a].y * canvas.height);
            ctx.lineTo((1 - landmarks[b].x) * canvas.width, landmarks[b].y * canvas.height);
            ctx.stroke();
        }

        for (const lm of landmarks) {
            ctx.beginPath();
            ctx.arc((1 - lm.x) * canvas.width, lm.y * canvas.height, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,255,255,0.9)';
            ctx.fill();
        }
    };

    useEffect(() => {
        return () => stopDetection();
    }, [stopDetection]);

    const removeRipple = useCallback((id: number) => {
        setRipples(prev => prev.filter(r => r.id !== id));
    }, []);

    const gestureLabels: Record<Gesture, string> = {
        'none': 'No hand detected',
        'point_up': '☝ Scrolling Up',
        'point_down': '👇 Scrolling Down',
        'point_left': '👈 Go Back',
        'swipe_left': '👈 Carousel Prev',
        'swipe_right': '👉 Carousel Next',
        'open_palm': '🖐 Open Palm',
        'pinch': '🤏 Click',
        'fist': '✊ Idle',
        'zoom_in': '🔍+ Zoom In',
        'zoom_out': '🔍- Zoom Out',
    };

    // Active gesture determines scroll arrow visibility
    const showScrollUp = currentGesture === 'point_up';
    const showScrollDown = currentGesture === 'point_down';
    const showZoomIn = currentGesture === 'zoom_in';
    const showZoomOut = currentGesture === 'zoom_out';

    return (
        <>
            {/* ── Hand cursor overlay ── */}
            {isActive && cursorPos.x > 0 && (
                <div
                    className="fixed pointer-events-none z-[9999] transition-opacity duration-200"
                    style={{
                        left: cursorPos.x,
                        top: cursorPos.y,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    {/* Outer glow ring */}
                    <div className="absolute -inset-4 rounded-full opacity-30"
                        style={{
                            background: 'radial-gradient(circle, rgba(0,255,220,0.4), transparent 70%)',
                            filter: 'blur(6px)',
                        }}
                    />
                    {/* Inner dot */}
                    <div className="w-4 h-4 rounded-full border-2 border-cyan-300/90 bg-cyan-400/30"
                        style={{ boxShadow: '0 0 12px rgba(0,255,220,0.6), inset 0 0 4px rgba(0,255,220,0.3)' }}
                    />
                    {/* Center pip */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/90" />
                </div>
            )}

            {/* ── Click ripples ── */}
            {ripples.map(r => (
                <ClickRipple key={r.id} x={r.x} y={r.y} onDone={() => removeRipple(r.id)} />
            ))}

            {/* ── Scroll direction arrows ── */}
            {isActive && currentGesture === 'point_up' && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9997] pointer-events-none animate-bounce">
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-2xl text-cyan-400/80" style={{ textShadow: '0 0 20px rgba(0,255,220,0.6)' }}>↑</div>
                        <span className="text-[8px] font-mono text-cyan-300/50 uppercase tracking-widest">Scrolling Up</span>
                    </div>
                </div>
            )}
            {isActive && currentGesture === 'point_down' && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9997] pointer-events-none animate-bounce">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[8px] font-mono text-cyan-300/50 uppercase tracking-widest">Scrolling Down</span>
                        <div className="text-2xl text-cyan-400/80" style={{ textShadow: '0 0 20px rgba(0,255,220,0.6)' }}>↓</div>
                    </div>
                </div>
            )}
            {isActive && currentGesture === 'point_left' && (
                <div className="fixed top-1/2 left-6 -translate-y-1/2 z-[9997] pointer-events-none animate-bounce-x">
                    <div className="flex items-center gap-2">
                        <div className="text-3xl text-cyan-400/80" style={{ textShadow: '0 0 20px rgba(0,255,220,0.6)' }}>←</div>
                        <span className="text-[10px] font-mono text-cyan-300/50 uppercase tracking-widest" style={{ writingMode: 'vertical-rl' }}>Going Back</span>
                    </div>
                </div>
            )}

            {/* Zoom indicators */}
            {isActive && showZoomIn && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9997] pointer-events-none">
                    <div className="flex flex-col items-center gap-2 animate-pulse">
                        <div className="text-3xl text-emerald-400/80" style={{ textShadow: '0 0 25px rgba(0,255,150,0.6)' }}>🔍+</div>
                        <span className="text-[9px] font-mono text-emerald-300/60 uppercase tracking-widest">Zoom In</span>
                    </div>
                </div>
            )}
            {isActive && showZoomOut && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9997] pointer-events-none">
                    <div className="flex flex-col items-center gap-2 animate-pulse">
                        <div className="text-3xl text-amber-400/80" style={{ textShadow: '0 0 25px rgba(255,180,0,0.6)' }}>🔍-</div>
                        <span className="text-[9px] font-mono text-amber-300/60 uppercase tracking-widest">Zoom Out</span>
                    </div>
                </div>
            )}

            {/* ── Controls panel ── */}
            <div className="fixed top-4 right-4 z-[200] pointer-events-auto">
                {/* Toggle Button */}
                <button
                    onClick={() => isActive ? stopDetection() : startDetection()}
                    disabled={isLoading}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-xl transition-all duration-500 ${isActive
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-black/60 border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
                        }`}
                >
                    {isLoading ? (
                        <div className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-colors">
                            <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M2 12C2 9.5 4.2 8 7 8C9.8 8 12 9.5 12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            {isActive && <circle cx="7" cy="5" r="1" fill="currentColor" />}
                        </svg>
                    )}
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em]">
                        {isLoading ? 'Loading...' : isActive ? 'Gestures ON' : 'Gestures'}
                    </span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                </button>

                {/* Error message */}
                {errorMsg && !isActive && (
                    <div className="mt-2 p-2 rounded-lg border border-red-500/20 bg-red-500/10 max-w-[250px]">
                        <p className="text-[8px] font-mono text-red-300/80 leading-relaxed">{errorMsg}</p>
                        <button
                            onClick={() => { setErrorMsg(''); startDetection(); }}
                            className="mt-1 text-[8px] font-mono text-cyan-300/60 hover:text-cyan-300 uppercase tracking-wider"
                        >
                            ↻ Retry
                        </button>
                    </div>
                )}

                {/* Camera Feed + HUD */}
                {showPanel && (
                    <div className="mt-2 rounded-lg border border-white/10 bg-black/80 overflow-hidden"
                        style={{ boxShadow: '0 0 30px rgba(0,0,0,0.8)' }}>
                        <div className="relative w-[200px] h-[150px]">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover opacity-60"
                                playsInline
                                muted
                                autoPlay
                                style={{ transform: 'scaleX(-1)' }}
                            />
                            <canvas
                                ref={canvasRef}
                                width={200}
                                height={150}
                                className="absolute inset-0 w-full h-full"
                            />
                            {/* Loading overlay */}
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                    <div className="text-center">
                                        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                        <span className="text-[8px] font-mono text-cyan-300/60 uppercase tracking-wider">Loading model...</span>
                                    </div>
                                </div>
                            )}
                            {/* Gesture label */}
                            <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${currentGesture !== 'none' && currentGesture !== 'fist' ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                                    <span className="text-[8px] font-mono text-white/60 uppercase tracking-wider">
                                        {isLoading ? 'Initializing...' : gestureLabels[currentGesture]}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-2 border-t border-white/5">
                            <div className="grid grid-cols-2 gap-1">
                                <div className="text-[7px] font-mono text-white/25">☝ Point up</div>
                                <div className="text-[7px] font-mono text-white/40">Scroll Up</div>
                                <div className="text-[7px] font-mono text-white/25">🖐 Palm down</div>
                                <div className="text-[7px] font-mono text-white/40">Scroll Down</div>
                                <div className="text-[7px] font-mono text-white/25">✌✌ 3 fingers</div>
                                <div className="text-[7px] font-mono text-white/40">Go Back</div>
                                <div className="text-[7px] font-mono text-white/25">✌ 2 fingers tilt</div>
                                <div className="text-[7px] font-mono text-white/40">Carousel (Spin L/R)</div>
                                <div className="text-[7px] font-mono text-white/25">🖐 Palm high</div>
                                <div className="text-[7px] font-mono text-white/40">Zoom In</div>
                                <div className="text-[7px] font-mono text-white/25">🖐 Palm low</div>
                                <div className="text-[7px] font-mono text-white/40">Zoom Out</div>
                                <div className="text-[7px] font-mono text-white/25">🤏 Pinch</div>
                                <div className="text-[7px] font-mono text-white/40">Click</div>
                                <div className="text-[7px] font-mono text-white/25">👆 Move hand</div>
                                <div className="text-[7px] font-mono text-white/40">Cursor</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
