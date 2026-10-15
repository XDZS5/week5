let x, y, xDir, yDir, speed;
let bodySize;
let angle;
let eyes = [];
let bubbles = [];
let tank;
let t = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  tank = createGraphics(80, 60);
  tank.pixelDensity(1);

  x = width / 2;
  y = height / 2;
  xDir = random([-1, 1]) * random(0.8, 1.5);
  yDir = random([-1, 1]) * random(0.8, 1.5);
  speed = 2;
  bodySize = min(width, height) * 0.12;
  angle = 0;

  for (let i = 0; i < 5; i++) addEye();
  makeSores();
  makeVeins();
  makeLimbs();
  for (let i = 0; i < 60; i++) bubbles.push(newBubble(true));
}

function draw() {
  drawTank();
  updateBubbles();
  drawBubbles();

  updateTrail();
  drawTrail();

  update();
  keepInCanvas();
  display();

  drawGlass();

  angle += 3;
}

function mapSin(a, target1, target2) {
  let myMap = map(sin(a), -1, 1, target1, target2);
  return myMap;
}

function update() {
  x += xDir * speed;
  y += yDir * speed;
}

function keepInCanvas() {
  let m = bodySize * 1.6;
  let left = m;
  let right = width - m;
  let top = height * 0.06 + m;
  let bottom = height * 0.94 - m;

  if (x < left || x > right) {
    xDir = -xDir;
    addEye();
  }
  if (y < top || y > bottom) {
    yDir = -yDir;
    addEye();
  }
  x = constrain(x, left, right);
  y = constrain(y, top, bottom);
}

function display() {

  let r = bodySize + mapSin(angle * 1.5, -bodySize * 0.08, bodySize * 0.08);

  drawLimbs(r);

  let fleshR = mapSin(angle * 0.8, 190, 255);
  let fleshG = mapSin(angle * 0.8, 15, 170);
  let fleshB = mapSin(angle * 0.8, 25, 0);

  stroke(70, 0, 10);
  strokeWeight(4);
  fill(fleshR, fleshG, fleshB);
  beginShape();
  for (let a = 0; a < 360; a += 6) {
    let wob = mapSin(angle * 2 + a * 4, -r * 0.06, r * 0.06);
    let lump = (noise(cos(a) + 2, sin(a) + 2, frameCount * 0.01) - 0.5) * r * 0.5;
    let rr = r + wob + lump;
    vertex(x + cos(a) * rr, y + sin(a) * rr * 0.9);
  }
  endShape(CLOSE);

  noStroke();
  fill(255, 220, 200, 35);
  ellipse(x - r * 0.3, y - r * 0.45, r * 0.4, r * 0.15);

  drawVeins(r);
  drawSores(r);
  drawMouth(r);
  drawEyes(r);
}

let trail = [];
let goo = [];

function updateTrail() {

  trail.push({ x: x, y: y });
  if (trail.length > 140) trail.shift();

  for (let k = 0; k < 2; k++) {
    goo.push({
      x: x + random(-0.5, 0.5) * bodySize,
      y: y + random(-0.4, 0.6) * bodySize,
      s: random(0.12, 0.35) * bodySize,
      vx: random(-0.15, 0.15),
      vy: random(0.1, 0.45),
      life: 1
    });
  }
  for (let i = goo.length - 1; i >= 0; i--) {
    let g = goo[i];
    g.x += g.vx;
    g.y += g.vy;
    g.s *= 1.004;
    g.life -= 1 / 260;
    if (g.life <= 0) goo.splice(i, 1);
  }
}

function drawTrail() {

  for (let i = 1; i < trail.length; i++) {
    let f = i / trail.length;
    stroke(110, 5, 12, f * 110);
    strokeWeight(bodySize * 0.9 * f);
    line(trail[i - 1].x, trail[i - 1].y, trail[i].x, trail[i].y);
  }

  noStroke();
  for (let g of goo) {
    let pulse = mapSin(angle * 2 + g.s * 10, 0.9, 1.1);
    fill(120, 8, 14, 150 * g.life);
    circle(g.x, g.y, g.s * pulse);
    fill(230, 110, 30, 70 * g.life);
    circle(g.x - g.s * 0.15, g.y - g.s * 0.15, g.s * 0.45 * pulse);
  }
}

let sores = [];
let veins = [];
let limbs = [];

function makeSores() {
  sores = [];
  for (let i = 0; i < 6; i++) {
    sores.push({
      a: random(360),
      d: random(0.15, 0.6),
      s: random(0.12, 0.26),
      seed: random(1000),
      ph: random(360)
    });
  }
}

function irregularBlob(cx, cy, s, seed) {
  beginShape();
  for (let a = 0; a < 360; a += 20) {
    let rr = s * 0.5 * (0.65 + noise(seed + cos(a) + 1, seed + sin(a) + 1) * 0.7);
    vertex(cx + cos(a) * rr, cy + sin(a) * rr);
  }
  endShape(CLOSE);
}

function drawSores(r) {
  noStroke();
  for (let b of sores) {
    let bx = x + cos(b.a) * b.d * r;
    let by = y + sin(b.a) * b.d * r * 0.85;

    let swell = mapSin(angle * 1.2 + b.ph, 0.85, 1.15);
    let bs = b.s * r * swell;

    drawingContext.shadowBlur = mapSin(angle * 1.2 + b.ph, 8, 30);
    drawingContext.shadowColor = 'rgba(255, 190, 60, 0.85)';
    fill(110, 15, 10, 210);
    irregularBlob(bx, by, bs, b.seed);
    drawingContext.shadowBlur = 0;

    fill(255, 200, 70, mapSin(angle * 1.2 + b.ph, 80, 210));
    irregularBlob(bx, by, bs * 0.45, b.seed + 50);
  }
}

function growVein(px, py, dir, steps, w) {
  let pts = [[px, py]];
  for (let s = 0; s < steps; s++) {
    dir += random(-45, 45);
    px += cos(dir) * 0.07;
    py += sin(dir) * 0.07;
    if (px * px + py * py > 0.75) break;
    pts.push([px, py]);
  }
  veins.push({ pts: pts, w: w, ph: random(360) });
  return pts;
}

function makeVeins() {
  veins = [];
  for (let i = 0; i < 10; i++) {
    let a = random(360);
    let d = random(0.05, 0.5);
    let pts = growVein(cos(a) * d, sin(a) * d, random(360), floor(random(4, 9)), random(1.5, 3.5));
    if (pts.length > 3 && random() < 0.7) {
      let p = pts[floor(random(1, pts.length - 1))];
      growVein(p[0], p[1], random(360), floor(random(2, 5)), random(0.8, 1.6));
    }
  }
}

function drawVeins(r) {
  noFill();
  for (let v of veins) {
    let pump = mapSin(angle * 2 + v.ph, 0.7, 1.4);
    stroke(70, 0, 15, mapSin(angle * 2 + v.ph, 110, 200));
    strokeWeight(v.w * pump);
    let p0 = v.pts[0];
    let pl = v.pts[v.pts.length - 1];
    beginShape();
    curveVertex(x + p0[0] * r, y + p0[1] * r * 0.9);
    for (let p of v.pts) curveVertex(x + p[0] * r, y + p[1] * r * 0.9);
    curveVertex(x + pl[0] * r, y + pl[1] * r * 0.9);
    endShape();
  }
}

function makeLimbs() {
  limbs = [];
  let n = 16;
  for (let i = 0; i < n; i++) {
    limbs.push({
      a: i * (360 / n) + random(-10, 10),
      segs: floor(random(10, 18)),
      len: random(0.06, 0.09),
      w: random(0.1, 0.17),
      curl: random([-1, 1]) * random(8, 16),
      seed: random(1000)
    });
  }
}

function drawLimbs(r) {
  for (let L of limbs) {
    let dir = L.a;
    let px = x + cos(dir) * r * 0.8;
    let py = y + sin(dir) * r * 0.75;

    let coil = mapSin(angle * 1.3 + L.seed, 0.2, 1.3);

    for (let s = 1; s <= L.segs; s++) {
      let wriggle = (noise(L.seed, s * 0.25, frameCount * 0.015) - 0.5) * 40;
      dir += L.curl * coil * (s / L.segs) * 1.6 + wriggle * 0.4;

      let nx = px + cos(dir) * L.len * r;
      let ny = py + sin(dir) * L.len * r;
      stroke(120, 10, 20);
      strokeWeight(map(s, 1, L.segs, L.w * r, 1.5));
      line(px, py, nx, ny);
      px = nx;
      py = ny;
    }
  }
}

function drawMouth(r) {
  let h = r * 0.1;
  let open = mapSin(angle * 1.2, h, r * 0.34);
  let mx = x;
  let my = y + r * 0.45;
  let mw = r * 0.8;
  let topY = my - open / 2;
  let botY = my + open / 2;

  stroke(50, 0, 10);
  strokeWeight(3);
  fill(30, 0, 8);
  rect(mx - mw / 2, topY, mw, open, open * 0.45);

  let rowW = mw * 0.8;
  let n = 7;
  let sp = rowW / n;
  let left = mx - rowW / 2;
  fill(230, 220, 170);
  stroke(90, 70, 40);
  strokeWeight(1);
  for (let i = 0; i < n; i++) {
    let cx = left + sp * (i + 0.5);
    triangle(cx - sp / 2, topY, cx + sp / 2, topY, cx, topY + h);
  }
  for (let i = 1; i < n; i++) {
    let cx = left + sp * i;
    triangle(cx - sp / 2, botY, cx + sp / 2, botY, cx, botY - h);
  }

  noStroke();
  fill(130, 0, 15, 210);
  let drip = mapSin(angle * 0.7, r * 0.05, r * 0.45);
  rect(mx + mw * 0.2, botY, r * 0.05, drip, 5);
  circle(mx + mw * 0.2 + r * 0.025, botY + drip, r * 0.09);
}

function drawEyes(r) {
  for (let e of eyes) {
    let ex = x + cos(e.a) * e.d * r;
    let ey = y + sin(e.a) * e.d * r * 0.85;
    let es = e.s * r + mapSin(angle * 2 + e.ph, -2, 2);
    let blinking = (frameCount + floor(e.ph)) % e.blinkEvery < 8;

    stroke(70, 0, 10);
    strokeWeight(2);
    if (blinking) {
      fill(120, 10, 20);
      ellipse(ex, ey, es, es * 0.25);
      continue;
    }
    fill(235, 225, 180);
    ellipse(ex, ey, es, es * 0.85);

    stroke(200, 20, 30, 160);
    strokeWeight(1);
    for (let v = 0; v < 4; v++) {
      let va = v * 90 + e.ph;
      line(ex + cos(va) * es * 0.45, ey + sin(va) * es * 0.38,
           ex + cos(va + 15) * es * 0.25, ey + sin(va + 15) * es * 0.2);
    }

    let look = atan2(mouseY - ey, mouseX - ex);
    let ix = ex + cos(look) * es * 0.15;
    let iy = ey + sin(look) * es * 0.12;
    noStroke();

    fill(240, mapSin(angle * 2 + e.ph, 110, 230), 0);
    circle(ix, iy, es * 0.5);
    fill(0);
    ellipse(ix, iy, es * 0.1, es * 0.42);
    fill(255, 255, 255, 200);
    circle(ix - es * 0.1, iy - es * 0.1, es * 0.12);
  }
}

function addEye() {
  if (eyes.length >= 12) return;
  for (let tries = 0; tries < 60; tries++) {
    let a = random(360);
    let d = random(0.1, 0.62);
    let sz = random(0.16, 0.3);
    let ex = cos(a) * d;
    let ey = sin(a) * d * 0.85;

    if (d + sz / 2 > 0.8) continue;
    if (abs(ex) < 0.5 && ey + sz / 2 > 0.22) continue;

    let free = true;
    for (let o of eyes) {
      let ox = cos(o.a) * o.d;
      let oy = sin(o.a) * o.d * 0.85;

      if (dist(ex, ey, ox, oy) < (sz + o.s) / 2 + 0.04) {
        free = false;
        break;
      }
    }
    if (free) {
      eyes.push({ a: a, d: d, s: sz, ph: random(360), blinkEvery: floor(random(120, 400)) });
      return;
    }
  }
}

function drawTank() {
  tank.loadPixels();
  for (let j = 0; j < tank.height; j++) {
    for (let i = 0; i < tank.width; i++) {
      let n = noise(i * 0.06, j * 0.06 + t, t * 0.5);
      let glow = mapSin(n * 900 + frameCount * 2, 0, 1);
      let depth = j / tank.height;
      let idx = (j * tank.width + i) * 4;
      tank.pixels[idx] = 10 + n * 40 + glow * 20;
      tank.pixels[idx + 1] = (120 + n * 120 + glow * 40) * (1 - depth * 0.5);
      tank.pixels[idx + 2] = 40 + n * 50;
      tank.pixels[idx + 3] = 255;
    }
  }
  tank.updatePixels();
  image(tank, 0, 0, width, height);
  t += 0.003;
}

function newBubble(anywhere) {
  return {
    x: random(width),
    y: anywhere ? random(height) : height + random(20, 200),
    s: random(4, 18),
    sp: random(0.6, 2.2),
    ph: random(360)
  };
}

function updateBubbles() {
  for (let i = 0; i < bubbles.length; i++) {
    let b = bubbles[i];
    b.y -= b.sp;
    b.x += mapSin(angle + b.ph, -0.6, 0.6);
    if (b.y < -20) bubbles[i] = newBubble(false);
  }
}

function drawBubbles() {
  for (let b of bubbles) {
    stroke(200, 255, 200, 120);
    strokeWeight(1.2);
    fill(180, 255, 180, 35);
    circle(b.x, b.y, b.s);
    noStroke();
    fill(255, 255, 255, 150);
    circle(b.x - b.s * 0.2, b.y - b.s * 0.2, b.s * 0.25);
  }
}

function drawGlass() {
  noStroke();

  let edge = width * 0.12;
  strokeWeight(1);
  for (let i = 0; i < edge; i++) {
    stroke(0, 30, 10, map(i, 0, edge, 150, 0));
    line(i, 0, i, height);
    line(width - i, 0, width - i, height);
  }
  noStroke();

  fill(55, 62, 66);
  rect(0, 0, width, height * 0.06);
  rect(0, height * 0.94, width, height * 0.06);
  fill(90, 100, 105);
  rect(0, height * 0.06 - 4, width, 4);
  rect(0, height * 0.94, width, 4);
  fill(30, 34, 36);
  for (let bx = 30; bx < width; bx += 80) {
    circle(bx, height * 0.03, 10);
  }

  fill(200, 255, 200, 180);
  textFont('monospace');
  textSize(max(11, height * 0.018));
  textAlign(LEFT, CENTER);
  text('SPECIMEN 05  //  EYES: ' + eyes.length + '  //  DO NOT TAP THE GLASS', 20, height * 0.97);
}

function mousePressed() {
  addEye();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  bodySize = min(width, height) * 0.12;
}
