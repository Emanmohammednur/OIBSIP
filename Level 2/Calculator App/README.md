# Calculator App

A simple, browser-based calculator built with **HTML5**, **CSS3**, and **vanilla JavaScript**. It supports everyday arithmetic, chained expressions, and keyboard input—without third-party libraries or build tools.

## Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Controls](#controls)
- [How Calculations Work](#how-calculations-work)
- [Project Structure](#project-structure)

## Overview

The calculator provides a button-based interface for entering and evaluating arithmetic expressions. Its layout uses CSS Grid, and all calculator buttons are wired with JavaScript event listeners.

## Features

- Addition, subtraction, multiplication, division, and remainder
- Decimal number input
- Standard operator precedence
- Chained calculations
- Clear and backspace controls
- Clear error message for division or remainder by zero
- Keyboard support
- Expression evaluation without `eval()`

## Getting Started

### Requirements

A modern web browser. No installation or dependency setup is needed.

### Run locally

1. Download or clone this project.
2. Open `index.html` in your web browser.

Alternatively, serve the project directory with any static file server.

## Controls

| Action | Calculator button | Keyboard |
| --- | --- | --- |
| Enter a number | `0`-`9` | `0`-`9` |
| Enter a decimal point | `.` | `.` |
| Add, subtract, multiply, divide, or find a remainder | `+`, `-`, `*`, `/`, `%` | `+`, `-`, `*`, `/`, `%` |
| Evaluate the expression | `=` | `Enter` or `=` |
| Delete the last character | `DEL` | `Backspace` |
| Clear the calculation | `C` | `Escape` or `C` |

## How Calculations Work

The calculator parses and evaluates arithmetic expressions directly in JavaScript. Multiplication, division, and remainder are evaluated before addition and subtraction. Division or remainder by zero displays an error message instead of attempting an invalid calculation.

## Project Structure

```text
Calculator App/
├── index.html   # Calculator markup and button layout
├── style.css    # Calculator styling and responsive layout
├── script.js    # Input handling and arithmetic logic
└── README.md    # Project documentation
```

