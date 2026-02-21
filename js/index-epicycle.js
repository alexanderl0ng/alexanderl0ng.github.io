const canvas = document.getElementById('epicycle');
const ctx    = canvas.getContext('2d');

const W = 200;
const H = 200;
const TWO_PI = Math.PI * 2;

const BG       = '#102C57';
const C_TRAIL  = '#F8F0E5';
const C_H_ORB  = 'rgba(234,219,200,0.20)';
const C_H_ARM  = '#EADBC8';
const C_V_ORB  = 'rgba(218,192,163,0.20)';
const C_V_ARM  = '#DAC0A3';
const C_GUIDE  = 'rgba(248,240,229,0.20)';
const C_DOT    = '#F8F0E5';

const MARGIN = 30;
const HCX = W / 2, HCY = MARGIN;
const VCX = MARGIN, VCY = H / 2;

const R = 26;

const FREQ_H = 3;
const FREQ_V = 2;
const DELTA  = Math.PI / 2;

const PERIOD = 7000;
const MAX_TRAIL = 700;

let trail = [];
let startTime = null;
let animationId = null;

function resetAnimation() {
    trail = [];
    startTime = null;
    ctx.clearRect(0, 0, W, H);
}

function draw(ts) {
    if (!startTime) startTime = ts;

    const elapsed = ts - startTime;
    const t = (elapsed % PERIOD) / PERIOD;
    const angle = t * TWO_PI;

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // ── Horizontal pendulum ──
    const hA    = FREQ_H * angle + DELTA;
    const hTipX = HCX + R * Math.cos(hA);
    const hTipY = HCY + R * Math.sin(hA);

    ctx.beginPath();
    ctx.arc(HCX, HCY, R, 0, TWO_PI);
    ctx.strokeStyle = C_H_ORB;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(HCX, HCY);
    ctx.lineTo(hTipX, hTipY);
    ctx.strokeStyle = C_H_ARM;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const vA    = FREQ_V * angle;
    const vTipX = VCX + R * Math.cos(vA);
    const vTipY = VCY + R * Math.sin(vA);

    ctx.beginPath();
    ctx.arc(VCX, VCY, R, 0, TWO_PI);
    ctx.strokeStyle = C_V_ORB;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(VCX, VCY);
    ctx.lineTo(vTipX, vTipY);
    ctx.strokeStyle = C_V_ARM;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const lx = hTipX;
    const ly = vTipY;

    ctx.save();
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = C_GUIDE;
    ctx.lineWidth = 0.8;

    ctx.beginPath();
    ctx.moveTo(hTipX, hTipY);
    ctx.lineTo(lx, ly);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(vTipX, vTipY);
    ctx.lineTo(lx, ly);
    ctx.stroke();

    ctx.restore();

    trail.push([lx, ly]);
    if (trail.length > MAX_TRAIL) trail.shift();

    if (trail.length > 1) {
	ctx.beginPath();
	ctx.moveTo(trail[0][0], trail[0][1]);
	for (let i = 1; i < trail.length; i++) {
	    ctx.lineTo(trail[i][0], trail[i][1]);
	}
	ctx.strokeStyle = C_TRAIL;
	ctx.lineWidth = 1.5;
	ctx.lineJoin = 'round';
	ctx.lineCap  = 'round';
	ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(lx, ly, 2.5, 0, TWO_PI);
    ctx.fillStyle = C_DOT;
    ctx.fill();

    animationId = requestAnimationFrame(draw);
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
	cancelAnimationFrame(animationId);
    } else {
	resetAnimation();
	animationId = requestAnimationFrame(draw);
    }
});

animationId = requestAnimationFrame(draw);

