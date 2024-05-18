Array.prototype.random = function() {
  var index = Math.floor(Math.random() * this.length);
  return this[index];
};

function nxnMove(plane, size) {
  const moves = [['F', 'B'], ['R', 'L'], ['U', 'D']];
  const mod = ['', '\'', '2'];
  let move = moves[plane][0];
  if (size > 2) {
    move = moves[plane].random();
  }
  let mlayers = Math.max(0, Math.floor(size / 2));
  if (size % 2 == 0 && 'BLD'.includes(move)) {
    mlayers--;
  }
  let l = Math.floor(Math.random() * mlayers);
  move = (l > 1 ? l + 1 : '') + move + (l > 0 ? 'w' : '');
  move += mod.random();
  return move;
}

function nxnScramble(size) {
  let nmoves = [9, 20, 45, 60, 80, 100][size - 2];
  let plane = Math.floor(Math.random() * 3);
  let scramble = [];
  for (let i = 0; i < nmoves; i++) {
    scramble.push(nxnMove(plane, size));
    plane += Math.floor(Math.random() * 2) + 1;
    plane %= 3;
  }
  return scramble.join(' ');
}

var scrambles = {
  skewb: function() {
    let scramble = [];
    let plane = Math.floor(Math.random() * 4);
    for (let i = 0; i < 9; i++) {
      scramble.push(['R', 'L', 'U', 'B'][plane] + ['', '\''].random());
      plane += Math.floor(Math.random() * 3) + 1;
      plane %= 4;
    }
    return scramble.join(' ');
  },
  pyraminx: function() {
    let scramble = scrambles.skewb();
    scramble += [' r', ' r\'', ''].random();
    scramble += [' l', ' l\'', ''].random();
    scramble += [' u', ' u\'', ''].random();
    scramble += [' b', ' b\'', ''].random();
    return scramble;
  },
  megaminx: function() {
    let scramble = [];
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 10; j++) {
        scramble.push(['R', 'D'].random() + ['++', '--'].random());
      }
      scramble.push(['U', 'U\''].random());
    }
    return scramble.join(' ');
  },
  square1: function() {
    let scramble = [];
    for (let i = 0; i < 13; i++) {
      let [x, y] = [0, 0];
      while (x == 0 & y == 0) {
        x = Math.floor(Math.random() * 12) - 5;
        y = Math.floor(Math.random() * 12) - 5;
      }
      scramble.push(`(${x}, ${y})`);
    }
    return scramble.join('/ ');
  },
  clock: function() {
    let prefa = ["UR", "DR", "DL", "UL", "U", "R", "D", "L", "ALL"];
    let prefb = ["U", "R", "D", "L", "ALL"];
    let scramble = [];
    for (let p of prefa) {
      let x = Math.floor(Math.random() * 12) - 5;
      scramble.push(p + Math.abs(x) + (x < 0 ? "-" : "+"));
    }
    scramble.push("y2");
    for (let p of prefb) {
      let x = Math.floor(Math.random() * 12) - 5;
      scramble.push(p + Math.abs(x) + (x < 0 ? "-" : "+"));
    }
    return scramble.join(' ');
  },
  none: function() {
    return '';
  }
}

for (let i = 2; i <= 7; i++) {
  scrambles[`${i}x${i}`] = function() { return nxnScramble(i) };
}

function initScrambles(stype) {
  for (let scramble of Object.keys(scrambles)) {
    let opt = document.createElement("option");
    opt.value = scramble;
    opt.innerHTML = scramble;
    stype.appendChild(opt);
  }
}

function genScramble(stype) {
  return scrambles[stype]();
}