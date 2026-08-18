function init() {
    const form = document.getElementById('calc-form');
    const resultsContainer = document.getElementById('results-container');
    const errorMessage = document.getElementById('error-message');
    const successResults = document.getElementById('success-results');
    
    const t1Result = document.getElementById('t1-result');
    const t2Result = document.getElementById('t2-result');
    const totalTimeResult = document.getElementById('total-time-result');
    const energyResult = document.getElementById('energy-result');
    const maxSpeedResult = document.getElementById('max-speed-result');
    const flipDistanceResult = document.getElementById('flip-distance-result');

    const t1Card = t1Result.closest('.result-card');
    const t2Card = t2Result.closest('.result-card');
    t1Card.style.cursor = 'pointer';
    t2Card.style.cursor = 'pointer';
    t1Card.title = 'Click to start/pause countdown';
    t2Card.title = 'Click to start/pause countdown';

    let t1State = { interval: null, remaining: 0, lastTick: 0, running: false };
    let t2State = { interval: null, remaining: 0, lastTick: 0, running: false };

    const updateTimer = (state, element) => {
        const now = Date.now();
        const delta = (now - state.lastTick) / 1000;
        state.lastTick = now;
        state.remaining -= delta;
        if (state.remaining <= 0) {
            state.remaining = 0;
            clearInterval(state.interval);
            state.running = false;
        }
        element.textContent = formatTime(state.remaining);
    };

    t1Card.addEventListener('click', () => {
        if (!t1State.running && t1State.remaining > 0) {
            t1State.running = true;
            t1State.lastTick = Date.now();
            t1State.interval = setInterval(() => updateTimer(t1State, t1Result), 100);
        } else if (t1State.running) {
            t1State.running = false;
            clearInterval(t1State.interval);
        }
    });

    t2Card.addEventListener('click', () => {
        if (!t2State.running && t2State.remaining > 0) {
            t2State.running = true;
            t2State.lastTick = Date.now();
            t2State.interval = setInterval(() => updateTimer(t2State, t2Result), 100);
        } else if (t2State.running) {
            t2State.running = false;
            clearInterval(t2State.interval);
        }
    });

    const formatNumber = (num, unit) => {
        if (num >= 1e9) {
            return (num / 1e9).toFixed(2) + ' B ' + unit;
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(2) + ' M ' + unit;
        } else {
            return num.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + ' ' + unit;
        }
    };
    
    const formatTime = (seconds) => {
        if (seconds < 60) {
            return seconds.toFixed(2) + ' s';
        } else if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            const secs = (seconds % 60).toFixed(1);
            return `${mins}m ${secs}s`;
        } else if (seconds < 86400) {
            const hours = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${mins}m`;
        } else {
            const days = Math.floor(seconds / 86400);
            const hours = Math.floor((seconds % 86400) / 3600);
            return `${days}d ${hours}h`;
        }
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const d = parseFloat(document.getElementById('distance').value);
        const a = parseFloat(document.getElementById('acceleration').value);
        const p = parseFloat(document.getElementById('energy-rate').value);
        const v0 = parseFloat(document.getElementById('velocity').value);

        resultsContainer.classList.remove('hidden');
        resultsContainer.style.display = 'block';

        // min distance required to stop from v0 at acceleration a is: v0^2 / (2*a)
        const minDistanceToStop = (v0 * v0) / (2 * a);
        
        if (d < minDistanceToStop) {
            errorMessage.classList.remove('hidden');
            successResults.style.display = 'none';
            return;
        }

        errorMessage.classList.add('hidden');
        successResults.style.display = 'grid';

        // t1 = -v0/a + sqrt(v0^2/(2*a^2) + D/a)
        const t1 = (-v0 / a) + Math.sqrt((v0 * v0) / (2 * a * a) + (d / a));
        
        // t2 = t1 + v0/a
        const t2 = t1 + (v0 / a);

        const totalTime = t1 + t2;
        const totalEnergy = p * totalTime;
        const maxSpeed = v0 + (a * t1);
        const flipDistance = (maxSpeed * maxSpeed) / (2 * a);

        if (t1State.interval) clearInterval(t1State.interval);
        if (t2State.interval) clearInterval(t2State.interval);
        t1State = { interval: null, remaining: t1, lastTick: 0, running: false };
        t2State = { interval: null, remaining: t2, lastTick: 0, running: false };

        t1Result.textContent = formatTime(t1);
        t2Result.textContent = formatTime(t2);
        maxSpeedResult.textContent = formatNumber(maxSpeed, 'm/s');
        flipDistanceResult.textContent = formatNumber(flipDistance, 'm');
        totalTimeResult.textContent = formatTime(totalTime);
        energyResult.textContent = formatNumber(totalEnergy, 'J');
        
        resultsContainer.style.transform = 'scale(0.98)';
        setTimeout(() => {
            resultsContainer.style.transform = 'scale(1)';
        }, 150);
    });

};

document.addEventListener('DOMContentLoaded', init);