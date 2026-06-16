/**
 * Dice Game Probability Analyzer using Dynamic Programming
 * DAA Mini Project
 */

const PIP_POSITIONS = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

let probChart = null;
let complexityChart = null;

const numDiceInput = document.getElementById('numDice');
const targetSumInput = document.getElementById('targetSum');
const sumRangeHint = document.getElementById('sumRangeHint');
const analyzeBtn = document.getElementById('analyzeBtn');
const rollBtn = document.getElementById('rollBtn');
const diceArena = document.getElementById('diceArena');
const rollResult = document.getElementById('rollResult');
const stepsContainer = document.getElementById('stepsContainer');
const dpTableWrapper = document.getElementById('dpTableWrapper');
const distributionInsights = document.getElementById('distributionInsights');
const complexityTableBody = document.getElementById('complexityTableBody');
const complexityDetails = document.getElementById('complexityDetails');
const complexityN = document.getElementById('complexityN');
const complexityT = document.getElementById('complexityT');

// ─── DP Engine ───────────────────────────────────────────────

function buildDPTable(n) {
  const maxSum = n * 6;
  const dp = Array.from({ length: n + 1 }, () => Array(maxSum + 1).fill(0));

  for (let s = 1; s <= 6; s++) dp[1][s] = 1;

  for (let d = 2; d <= n; d++) {
    for (let s = d; s <= d * 6; s++) {
      for (let face = 1; face <= 6; face++) {
        if (s - face >= 1) dp[d][s] += dp[d - 1][s - face];
      }
    }
  }
  return dp;
}

function getWays(n, target, dp) {
  if (target < n || target > n * 6) return 0;
  return dp[n][target];
}

function getTotalOutcomes(n) {
  return Math.pow(6, n);
}

function getAllCombinations(n, target) {
  const results = [];
  const current = [];

  function backtrack(remaining, sumSoFar, startFace) {
    if (remaining === 0) {
      if (sumSoFar === target) results.push([...current]);
      return;
    }
    for (let f = 1; f <= 6; f++) {
      const newSum = sumSoFar + f;
      const minPossible = newSum + (remaining - 1);
      const maxPossible = newSum + (remaining - 1) * 6;
      if (target < minPossible || target > maxPossible) continue;
      current.push(f);
      backtrack(remaining - 1, newSum, f);
      current.pop();
    }
  }

  backtrack(n, 0, 1);
  return results;
}

function getDistribution(n, dp) {
  const total = getTotalOutcomes(n);
  const dist = [];
  for (let s = n; s <= n * 6; s++) {
    const ways = dp[n][s];
    dist.push({
      sum: s,
      ways,
      probability: (ways / total) * 100,
    });
  }
  return dist;
}

// ─── Dice UI ─────────────────────────────────────────────────

function createDieElement(value) {
  const die = document.createElement('div');
  die.className = 'die';
  die.setAttribute('role', 'img');
  die.setAttribute('aria-label', `Die showing ${value}`);

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const pip = document.createElement('span');
      pip.className = 'pip';
      const positions = PIP_POSITIONS[value] || [];
      const visible = positions.some(([pr, pc]) => pr === r && pc === c);
      if (!visible) pip.classList.add('hidden');
      die.appendChild(pip);
    }
  }
  return die;
}

function renderDice(count, values = null) {
  diceArena.innerHTML = '';
  if (count < 1) {
    diceArena.innerHTML = '<p class="arena-placeholder">Enter at least 1 die</p>';
    return;
  }

  for (let i = 0; i < count; i++) {
    const val = values ? values[i] : 1;
    diceArena.appendChild(createDieElement(val));
  }
}

function rollDiceAnimated() {
  const n = parseInt(numDiceInput.value, 10) || 1;
  const diceEls = diceArena.querySelectorAll('.die');

  if (diceEls.length !== n) {
    renderDice(n, Array(n).fill(1));
  }

  const finalValues = [];
  const els = diceArena.querySelectorAll('.die');

  els.forEach((el) => el.classList.add('rolling'));

  let ticks = 0;
  const interval = setInterval(() => {
    els.forEach((el, i) => {
      const rand = Math.floor(Math.random() * 6) + 1;
      const newDie = createDieElement(rand);
      newDie.classList.add('rolling');
      el.replaceWith(newDie);
    });
    ticks++;
    if (ticks >= 8) {
      clearInterval(interval);
      const values = Array.from({ length: n }, () => Math.floor(Math.random() * 6) + 1);
      renderDice(n, values);
      const sum = values.reduce((a, b) => a + b, 0);
      const target = parseInt(targetSumInput.value, 10);
      const match = sum === target;
      rollResult.innerHTML = `Rolled: <strong>(${values.join(', ')})</strong> → Sum = <strong>${sum}</strong>` +
        (match ? ' <span style="color:#34d399">✓ Matches target!</span>' : '');
      diceArena.querySelectorAll('.die').forEach((d) => d.classList.add('glow'));
    }
  }, 80);
}

// ─── Step-by-Step Display ────────────────────────────────────

function renderSteps(n, target, dp) {
  const total = getTotalOutcomes(n);
  const ways = getWays(n, target, dp);
  const prob = ways / total;
  const percent = (prob * 100).toFixed(2);
  const combinations = getAllCombinations(n, target);
  const valid = target >= n && target <= n * 6;

  const steps = [];

  steps.push({
    title: 'Step 1 — Number of Dice',
    html: `<p>Number of Dice = <span class="math">${n}</span></p>`,
  });

  steps.push({
    title: 'Step 2 — Target Sum',
    html: `<p>Target Sum = <span class="math">${target}</span></p>
           <p>Valid sum range for ${n} dice: <span class="math">${n} ≤ sum ≤ ${n * 6}</span></p>`,
  });

  steps.push({
    title: 'Step 3 — Total Possible Outcomes',
    html: `<p>Each die has 6 faces. With ${n} dice:</p>
           <p class="math">Total Outcomes = 6<sup>${n}</sup> = ${total.toLocaleString()}</p>`,
  });

  if (!valid) {
    steps.push({
      title: 'Step 4 — Invalid Target',
      html: `<p>Target ${target} is outside the valid range [${n}, ${n * 6}]. Successful Ways = 0.</p>`,
    });
  } else if (combinations.length > 0 && combinations.length <= 120) {
    const listItems = combinations
      .map((c) => `<li class="${c.reduce((a, b) => a + b, 0) === target ? 'target-match' : ''}">(${c.join(', ')})</li>`)
      .join('');
    steps.push({
      title: 'Step 4 — Successful Combinations',
      html: `<p>All ordered outcomes that sum to ${target}:</p>
             <ul class="combinations-list">${listItems}</ul>`,
    });
  } else if (combinations.length > 120) {
    steps.push({
      title: 'Step 4 — Successful Combinations',
      html: `<p>There are <span class="math">${ways.toLocaleString()}</span> ordered combinations (too many to list individually).</p>
             <p>Examples: ${combinations.slice(0, 5).map((c) => `(${c.join(', ')})`).join(', ')} …</p>`,
    });
  } else {
    steps.push({
      title: 'Step 4 — Successful Combinations',
      html: `<p>No combinations achieve sum ${target}.</p>`,
    });
  }

  steps.push({
    title: 'Step 5 — Successful Ways (via DP)',
    html: `<p>Using DP table: <span class="math">DP[${n}][${target}] = ${ways.toLocaleString()}</span></p>
           <p>Recurrence: DP[d][s] = Σ DP[d−1][s−i] for i = 1..6</p>`,
  });

  steps.push({
    title: 'Step 6 — Probability Formula',
    html: `<p class="math">P(sum = ${target}) = Successful Ways / Total Outcomes = ${ways} / ${total}</p>`,
  });

  steps.push({
    title: 'Step 7 — Final Probability',
    html: `<p class="math">${ways} / ${total} = ${percent}%</p>`,
    final: true,
  });

  stepsContainer.innerHTML = steps
    .map(
      (s) => `
    <div class="step-block ${s.final ? 'step-final' : ''}">
      <h3>${s.title}</h3>
      ${s.html}
    </div>`
    )
    .join('');

  document.getElementById('probPercent').textContent = valid ? `${percent}%` : '0%';
  document.getElementById('successWays').textContent = ways.toLocaleString();
  document.getElementById('totalOutcomes').textContent = total.toLocaleString();
  document.getElementById('probFraction').textContent = valid ? `${ways} / ${total}` : '0 / ' + total;
}

// ─── DP Table Display ────────────────────────────────────────

function renderDPTable(n, target, dp) {
  const maxSum = n * 6;
  let html = '<table class="dp-table"><thead><tr><th>d \\ s</th>';
  for (let s = 1; s <= maxSum; s++) html += `<th>${s}</th>`;
  html += '</tr></thead><tbody>';

  for (let d = 1; d <= n; d++) {
    html += `<tr><th class="row-header">${d}</th>`;
    for (let s = 1; s <= maxSum; s++) {
      const val = s >= d && s <= d * 6 ? dp[d][s] : 0;
      const isTarget = d === n && s === target;
      const cls = [val === 0 ? 'zero' : '', isTarget ? 'highlight' : ''].filter(Boolean).join(' ');
      html += `<td class="${cls}">${val || '·'}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  dpTableWrapper.innerHTML = html;
}

// ─── Charts ──────────────────────────────────────────────────

function updateProbChart(n, dp) {
  const dist = getDistribution(n, dp);
  const labels = dist.map((d) => d.sum);
  const data = dist.map((d) => parseFloat(d.probability.toFixed(2)));
  const target = parseInt(targetSumInput.value, 10);
  const bgColors = labels.map((s) =>
    s === target ? 'rgba(251, 191, 36, 0.85)' : 'rgba(0, 212, 255, 0.6)'
  );

  const ctx = document.getElementById('probChart').getContext('2d');
  if (probChart) probChart.destroy();

  probChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Probability %',
          data,
          backgroundColor: bgColors,
          borderColor: 'rgba(0, 212, 255, 0.9)',
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const d = dist[ctx.dataIndex];
              return `P(sum=${d.sum}) = ${d.probability.toFixed(2)}% (${d.ways} ways)`;
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Possible Sum', color: '#94a3b8' },
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        y: {
          title: { display: true, text: 'Probability %', color: '#94a3b8' },
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255,255,255,0.08)' },
          beginAtZero: true,
        },
      },
    },
  });

  const maxEntry = dist.reduce((a, b) => (b.probability > a.probability ? b : a), dist[0]);
  const minEntry = dist.reduce((a, b) => (b.probability < a.probability ? b : a), dist[0]);
  const targetEntry = dist.find((d) => d.sum === target);

  distributionInsights.innerHTML = `
    <span class="insight-chip max">Highest: sum ${maxEntry.sum} → ${maxEntry.probability.toFixed(2)}%</span>
    <span class="insight-chip min">Lowest: sum ${minEntry.sum} → ${minEntry.probability.toFixed(2)}%</span>
    ${targetEntry ? `<span class="insight-chip">Target ${target}: ${targetEntry.probability.toFixed(2)}%</span>` : ''}
  `;
}

function estimateOperations(n, target) {
  const brute = Math.pow(6, n);
  const recursive = Math.pow(6, n) * 0.8;
  const dpOps = n * (n * 6) * 6;
  return { brute, recursive, dp: dpOps };
}

function updateComplexitySection(n, target) {
  complexityN.textContent = n;
  complexityT.textContent = target;
  const maxSum = n * 6;
  const ops = estimateOperations(n, target);

  complexityTableBody.innerHTML = `
    <tr>
      <td><strong>Brute Force</strong></td>
      <td><code>O(6<sup>n</sup>)</code> ≈ O(${formatBig(Math.pow(6, n))})</td>
      <td><code>O(n)</code></td>
      <td><span class="efficiency poor">Very Poor</span></td>
    </tr>
    <tr>
      <td><strong>Recursion (naive)</strong></td>
      <td><code>O(6<sup>n</sup>)</code> — Exponential</td>
      <td><code>O(n)</code> — call stack</td>
      <td><span class="efficiency poor">Very Poor</span></td>
    </tr>
    <tr>
      <td><strong>Dynamic Programming</strong></td>
      <td><code>O(n × target)</code> ≈ O(${n} × ${maxSum}) = O(${n * maxSum})</td>
      <td><code>O(n × target)</code> ≈ O(${n * maxSum})</td>
      <td><span class="efficiency excellent">Excellent</span></td>
    </tr>
  `;

  complexityDetails.innerHTML = `
    <div class="complexity-card">
      <h4>Brute Force Operations</h4>
      <p>Enumerate all ${Math.pow(6, n).toLocaleString()} outcomes</p>
      <div class="ops">~${formatBig(ops.brute)} ops</div>
    </div>
    <div class="complexity-card">
      <h4>Recursive Operations</h4>
      <p>Repeated subproblems without memoization</p>
      <div class="ops">~${formatBig(ops.recursive)} ops</div>
    </div>
    <div class="complexity-card">
      <h4>DP Operations</h4>
      <p>Fill table: ${n} × ${maxSum} states × 6 transitions</p>
      <div class="ops">~${ops.dp.toLocaleString()} ops</div>
    </div>
  `;
}

function formatBig(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toLocaleString();
}

function updateComplexityChart(n) {
  const diceRange = [];
  for (let i = 1; i <= Math.min(8, Math.max(n, 6)); i++) diceRange.push(i);

  const bruteData = diceRange.map((d) => Math.pow(6, d));
  const dpData = diceRange.map((d) => d * (d * 6) * 6);

  const ctx = document.getElementById('complexityChart').getContext('2d');
  if (complexityChart) complexityChart.destroy();

  complexityChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: diceRange.map((d) => `${d} dice`),
      datasets: [
        {
          label: 'Brute Force O(6ⁿ)',
          data: bruteData,
          borderColor: '#f87171',
          backgroundColor: 'rgba(248, 113, 113, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
        },
        {
          label: 'Dynamic Programming O(n × target)',
          data: dpData,
          borderColor: '#34d399',
          backgroundColor: 'rgba(52, 211, 153, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900 },
      plugins: {
        legend: {
          labels: { color: '#94a3b8', font: { family: 'Outfit' } },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ~${ctx.raw.toLocaleString()} operations`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        y: {
          type: 'logarithmic',
          title: { display: true, text: 'Operations (log scale)', color: '#94a3b8' },
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255,255,255,0.08)' },
        },
      },
    },
  });
}

// ─── Main Analysis ─────────────────────────────────────────────

function analyze() {
  const n = Math.min(8, Math.max(1, parseInt(numDiceInput.value, 10) || 1));
  const target = parseInt(targetSumInput.value, 10) || n;
  numDiceInput.value = n;

  const minSum = n;
  const maxSum = n * 6;
  if (target < minSum) targetSumInput.value = minSum;
  if (target > maxSum) targetSumInput.value = maxSum;

  const t = parseInt(targetSumInput.value, 10);
  const dp = buildDPTable(n);

  renderDice(n, Array(n).fill(1).map(() => Math.floor(Math.random() * 6) + 1));
  renderSteps(n, t, dp);
  renderDPTable(n, t, dp);
  updateProbChart(n, dp);
  updateComplexitySection(n, t);
  updateComplexityChart(n);
}

function updateSumHint() {
  const n = Math.min(8, Math.max(1, parseInt(numDiceInput.value, 10) || 1));
  sumRangeHint.textContent = `Valid sum: ${n} to ${n * 6}`;
  targetSumInput.min = n;
  targetSumInput.max = n * 6;
}

// ─── Event Listeners ─────────────────────────────────────────

analyzeBtn.addEventListener('click', analyze);

rollBtn.addEventListener('click', () => {
  const n = Math.min(8, Math.max(1, parseInt(numDiceInput.value, 10) || 1));
  numDiceInput.value = n;
  renderDice(n);
  setTimeout(rollDiceAnimated, 50);
});

numDiceInput.addEventListener('input', () => {
  updateSumHint();
  const n = Math.min(8, Math.max(1, parseInt(numDiceInput.value, 10) || 1));
  renderDice(n);
});

numDiceInput.addEventListener('change', () => {
  const n = Math.min(8, Math.max(1, parseInt(numDiceInput.value, 10) || 1));
  numDiceInput.value = n;
  updateSumHint();
  renderDice(n);
});

targetSumInput.addEventListener('input', updateSumHint);

// Initial load
updateSumHint();
renderDice(parseInt(numDiceInput.value, 10) || 2);
analyze();
