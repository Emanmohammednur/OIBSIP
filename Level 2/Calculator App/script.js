const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");

let currentInput = "";
let justEvaluated = false;

function tokenize(expression) {
    const tokens = [];
    let index = 0;

    while (index < expression.length) {
        const character = expression[index];

        if (/\d|\./.test(character)) {
            const start = index;
            let decimalCount = 0;

            while (index < expression.length && /[\d.]/.test(expression[index])) {
                if (expression[index] === ".") {
                    decimalCount += 1;
                }
                index += 1;
            }

            const numberText = expression.slice(start, index);
            if (decimalCount > 1 || numberText === ".") {
                throw new Error("Invalid number");
            }
            tokens.push(parseFloat(numberText));
            continue;
        }

        if ("+-*/%".includes(character)) {
            tokens.push(character);
            index += 1;
            continue;
        }

        throw new Error("Invalid expression");
    }

    return tokens;
}

function calculate(expression) {
    const tokens = tokenize(expression);
    let position = 0;

    function parseNumber() {
        const token = tokens[position];
        if (typeof token !== "number" || Number.isNaN(token)) {
            throw new Error("Enter a complete expression");
        }
        position += 1;
        return token;
    }

    function parseUnary() {
        if (tokens[position] === "+") {
            position += 1;
            return parseUnary();
        }
        if (tokens[position] === "-") {
            position += 1;
            return -parseUnary();
        }
        return parseNumber();
    }

    function parseTerm() {
        let value = parseUnary();

        while (["*", "/", "%"].includes(tokens[position])) {
            const operator = tokens[position];
            position += 1;
            const right = parseUnary();

            if ((operator === "/" || operator === "%") && right === 0) {
                throw new Error("Cannot divide by zero");
            }

            if (operator === "*") value *= right;
            if (operator === "/") value /= right;
            if (operator === "%") value %= right;
        }

        return value;
    }

    function parseExpression() {
        let value = parseTerm();

        while (tokens[position] === "+" || tokens[position] === "-") {
            const operator = tokens[position];
            position += 1;
            const right = parseTerm();
            value = operator === "+" ? value + right : value - right;
        }

        return value;
    }

    if (tokens.length === 0) {
        throw new Error("Enter an expression");
    }

    const result = parseExpression();
    if (position !== tokens.length) {
        throw new Error("Enter a complete expression");
    }
    if (!Number.isFinite(result)) {
        throw new Error("Result is outside the supported range");
    }
    return result;
}

function formatResult(value) {
    return String(Number(value.toPrecision(12)));
}

function render() {
    display.textContent = currentInput || "0";
}

function clearCalculator() {
    currentInput = "";
    justEvaluated = false;
    render();
}

function enterValue(value) {
    if (/^\d$/.test(value)) {
        if (justEvaluated) {
            currentInput = "";
        }
        currentInput += value;
        justEvaluated = false;
        render();
        return;
    }

    if (value === ".") {
        if (justEvaluated) {
            currentInput = "";
        }
        const currentNumber = currentInput.split(/[+\-*/%]/).pop();
        if (currentNumber.includes(".")) {
            return;
        }
        if (!currentNumber) {
            currentInput += "0";
        }
        currentInput += ".";
        justEvaluated = false;
        render();
        return;
    }

    if (!"+-*/%".includes(value)) {
        return;
    }

    if (justEvaluated) {
        justEvaluated = false;
    }

    if (!currentInput) {
        if (value === "-") {
            currentInput = "-";
            render();
        }
        return;
    }

    if (/[+\-*/%]$/.test(currentInput)) {
        if (value === "-" && !currentInput.endsWith("-")) {
            currentInput += value;
        } else {
            currentInput = currentInput.slice(0, -1) + value;
        }
    } else {
        currentInput += value;
    }

    render();
}

function evaluate() {
    if (!currentInput) {
        return;
    }

    try {
        currentInput = formatResult(calculate(currentInput));
        justEvaluated = true;
        render();
    } catch (error) {
        display.textContent = error.message;
    }
}

function backspace() {
    if (justEvaluated) {
        clearCalculator();
        return;
    }
    currentInput = currentInput.slice(0, -1);
    render();
}

function handleInput(value) {
    if (value === "AC" || value === "C") {
        clearCalculator();
    } else if (value === "DEL" || value === "Backspace") {
        backspace();
    } else if (value === "=" || value === "Enter") {
        evaluate();
    } else {
        enterValue(value);
    }
}

buttons.forEach((button) => {
    button.addEventListener("click", () => handleInput(button.textContent.trim()));
});

document.addEventListener("keydown", (event) => {
    if (/^\d$/.test(event.key) || ".+-*/%".includes(event.key)) {
        handleInput(event.key);
    } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        handleInput("=");
    } else if (event.key === "Backspace") {
        handleInput("DEL");
    } else if (event.key === "Escape" || event.key.toLowerCase() === "c") {
        handleInput("AC");
    }
});


render();
