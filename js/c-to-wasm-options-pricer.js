    let lib = null;

OptionLib({ locateFile: (path) => path }).then(m => {
    lib = m;
    calculate();
    calculateSensitivity();
});

const pricingModel      = document.getElementById("pricing-model");
const optionType        = document.getElementById("option-type");
const optionStyle       = document.getElementById("option-style");
const spotPrice         = document.getElementById("spot-price");
const strikePrice       = document.getElementById("strike-price");
const timeToExpiry      = document.getElementById("time-to-expiry");
const riskFreeRate      = document.getElementById("risk-free-rate");
const volatility        = document.getElementById("volatility");
const dividendYield     = document.getElementById("dividend-yield");
const steps             = document.getElementById("steps");
const optionValue       = document.getElementById("option-value");
const volMin            = document.getElementById("min-volatility");
const volMax            = document.getElementById("max-volatility");
const volMinDisplay     = document.getElementById("min-volatility-display");
const volMaxDisplay     = document.getElementById("max-volatility-display");
const spotMin           = document.getElementById("min-spot-price");
const spotMax           = document.getElementById("max-spot-price");
const sensitivityButton = document.querySelector(".sensitivity-button");

pricingModel.addEventListener("change", () => {
    document.querySelectorAll("[id$='-settings']").forEach(el => el.classList.add("hidden"));
    const settingId = pricingModel.options[pricingModel.selectedIndex].getAttribute("data-setting");
    document.getElementById(settingId)?.classList.remove("hidden");
    calculate();
});

[optionType, optionStyle, spotPrice, strikePrice, timeToExpiry,
 riskFreeRate, volatility, dividendYield, steps].forEach(el => {
    el.addEventListener("change", calculate);
    el.addEventListener("input", calculate);
});

volMin.addEventListener("input", () => {
    if (parseFloat(volMin.value) > parseFloat(volMax.value)) {
        volMin.value = volMax.value;
    }
    const val = parseFloat(volMin.value).toFixed(2);
    volMinDisplay.textContent = val;
    document.querySelector('label[for="min-volatility"] .vol-label-value').textContent = `(${val})`;
});

volMax.addEventListener("input", () => {
    if (parseFloat(volMax.value) < parseFloat(volMin.value)) {
        volMax.value = volMin.value;
    }
    const val = parseFloat(volMax.value).toFixed(2);
    volMaxDisplay.textContent = parseFloat(volMax.value).toFixed(2);
    document.querySelector('label[for="max-volatility"] .vol-label-value').textContent = `(${val})`;
});

function calculate() {
    if (!lib) return;

    const S     = parseFloat(spotPrice.value);
    const K     = parseFloat(strikePrice.value);
    const T     = parseFloat(timeToExpiry.value);
    const r     = parseFloat(riskFreeRate.value);
    const sigma = parseFloat(volatility.value);
    const q     = parseFloat(dividendYield.value);
    const n     = parseInt(steps.value);

    const model       = pricingModel.value;
    const type        = optionType.value;
    const style       = optionStyle.value;
    const hasDividend = q > 0;

    let result;

    if (model === "blackscholes") {
        if (type === "call") {
            result = hasDividend
                ? lib._black_scholes_call_with_dividend(S, K, T, r, sigma, q)
                : lib._black_scholes_call(S, K, T, r, sigma);
        } else {
            result = hasDividend
                ? lib._black_scholes_put_with_dividend(S, K, T, r, sigma, q)
                : lib._black_scholes_put(S, K, T, r, sigma);
        }
    } else if (model == "binomial") {
        if (style === "european") {
            if (type === "call") {
                result = hasDividend
                    ? lib._binomial_tree_call_european_with_dividend(S, K, T, r, sigma, n, q)
                    : lib._binomial_tree_call_european(S, K, T, r, sigma, n);
            } else {
                result = hasDividend
                    ? lib._binomial_tree_put_european_with_dividend(S, K, T, r, sigma, n, q)
                    : lib._binomial_tree_put_european(S, K, T, r, sigma, n);
            }
        } else {
            if (type === "call") {
                result = hasDividend
                    ? lib._binomial_tree_call_american_with_dividend(S, K, T, r, sigma, n, q)
                    : lib._binomial_tree_call_american(S, K, T, r, sigma, n);
            } else {
                result = hasDividend
                    ? lib._binomial_tree_put_american_with_dividend(S, K, T, r, sigma, n, q)
                    : lib._binomial_tree_put_american(S, K, T, r, sigma, n);
            }
        }
    }

    optionValue.textContent = isFinite(result) ? result.toFixed(4) : "Error";
}

sensitivityButton.addEventListener("click", calculateSensitivity);

function calculateSensitivity() {
    if (!lib) return;

    const K     = parseFloat(strikePrice.value);
    const T     = parseFloat(timeToExpiry.value);
    const r     = parseFloat(riskFreeRate.value);
    const q     = parseFloat(dividendYield.value);
    const n     = parseInt(steps.value);

    const model       = pricingModel.value;
    const type        = optionType.value;
    const style       = optionStyle.value;
    const hasDividend = q > 0;

    const minS     = parseFloat(spotMin.value);
    const maxS     = parseFloat(spotMax.value);
    const minSigma = parseFloat(volMin.value);
    const maxSigma = parseFloat(volMax.value);

    const GRID = 20;

    const spotValues = Array.from({ length: GRID }, (_, i) => minS + (i / (GRID - 1)) * (maxS - minS));
    const volValues  = Array.from({ length: GRID }, (_, i) => minSigma + (i / (GRID - 1)) * (maxSigma - minSigma));

    const z = volValues.map(sigma => {
        return spotValues.map(S => {
            if (model === "blackscholes") {
                if (type === "call") {
                    return hasDividend
                        ? lib._black_scholes_call_with_dividend(S, K, T, r, sigma, q)
                        : lib._black_scholes_call(S, K, T, r, sigma);
                } else {
                    return hasDividend
                        ? lib._black_scholes_put_with_dividend(S, K, T, r, sigma, q)
                        : lib._black_scholes_put(S, K, T, r, sigma);
                }
            } else {
                if (style === "european") {
                    if (type === "call") {
                        return hasDividend
                            ? lib._binomial_tree_call_european_with_dividend(S, K, T, r, sigma, n, q)
                            : lib._binomial_tree_call_european(S, K, T, r, sigma, n);
                    } else {
                        return hasDividend
                            ? lib._binomial_tree_put_european_with_dividend(S, K, T, r, sigma, n, q)
                            : lib._binomial_tree_put_european(S, K, T, r, sigma, n);
                    }
                } else {
                    if (type === "call") {
                        return hasDividend
                            ? lib._binomial_tree_call_american_with_dividend(S, K, T, r, sigma, n, q)
                            : lib._binomial_tree_call_american(S, K, T, r, sigma, n);
                    } else {
                        return hasDividend
                            ? lib._binomial_tree_put_american_with_dividend(S, K, T, r, sigma, n, q)
                            : lib._binomial_tree_put_american(S, K, T, r, sigma, n);
                    }
                }
            }
        });
    });

    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();

    Plotly.newPlot("sensitivity-plot", [{
        type: "surface",
        x: spotValues,
        y: volValues,
        z: z,
        colorscale: [
            [0,   "#DAC0A3"],
            [0.5, "#EADBC8"],
            [1,   "#102C57"]
        ],
        hovertemplate: "Spot: %{x:.2f}<br>Vol: %{y:.2f}<br>Price: %{z:.4f}<extra></extra>"
    }], {
        scene: {
            camera: {
                eye: { x: 2, y: 2, z: 1.5 }
            },
            xaxis: { title: "Spot Price" },
            yaxis: { title: "Volatility" },
            zaxis: { title: "Option Value" }
        },
        margin: { l: 0, r: 0, t: 0, b: 0 },
        paper_bgcolor: bgColor
    });
}

document.querySelector('label[for="min-volatility"] .vol-label-value').textContent = `(${parseFloat(volMin.value).toFixed(2)})`;
document.querySelector('label[for="max-volatility"] .vol-label-value').textContent = `(${parseFloat(volMax.value).toFixed(2)})`;

pricingModel.dispatchEvent(new Event("change"));
