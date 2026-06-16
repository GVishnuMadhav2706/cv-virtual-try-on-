# Dice Game Probability Analyzer using Dynamic Programming

A web-based DAA (Design and Analysis of Algorithms) mini project that analyzes dice game probabilities using **Dynamic Programming**, with step-by-step math, charts, and complexity comparison.

## Features

- **Dice input** — Set number of dice (1–8) and target sum
- **Visual dice** — Exactly as many dice as you enter; roll with animation
- **DP engine** — `DP[d][s] = Σ DP[d-1][s-i]` for faces 1–6
- **Step-by-step calculation** — From inputs to final probability %
- **DP table** — Full tabulation with target cell highlighted
- **Probability chart** — Chart.js bar graph of distribution
- **Complexity analysis** — Time/space for brute force, recursion, and DP
- **Growth chart** — Log-scale line chart comparing algorithm growth
- **Education section** — DP concepts explained

## How to Run

1. Open `index.html` in any modern browser (Chrome, Edge, Firefox).
2. No build step or server required.
3. Requires internet for Chart.js CDN and background image.

## Usage

1. Enter **number of dice** and **target sum**.
2. Click **Analyze Probability** for full results.
3. Click **Roll Dice** to animate a random roll.
4. Review steps, DP table, charts, and complexity sections.

## Files

| File        | Description                    |
|-------------|--------------------------------|
| `index.html`| Structure and sections         |
| `styles.css`| Glassmorphism UI, dice, responsive layout |
| `script.js` | DP logic, charts, dice simulation |

## Tech Stack

- HTML5, CSS3, JavaScript
- [Chart.js](https://www.chartjs.org/) (CDN)

## Academic Use

Suitable for mini project submission, viva, and portfolio demonstration.
