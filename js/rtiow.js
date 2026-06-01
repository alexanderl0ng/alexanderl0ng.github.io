let lib = null;
RTIOW({ locateFile: (path) => path }).then(module => { lib = module });

const qualityMap = { preview: 400, medium: 800, high: 1200 }
const samples = document.getElementById("samples");
const samplesDisplay = document.getElementById("samples-display");
const defocusAngle = document.getElementById("defocus-angle");
const defocusAngleDisplay = document.getElementById("defocus-angle-display");
const canvas = document.getElementById("render-output")
const renderButton = document.querySelector(".render-button");
const downloadButton = document.querySelector(".download-render-button")
const ctx = canvas.getContext("2d");

samples.addEventListener("input", () => {
    const val = parseFloat(samples.value);
    samplesDisplay.textContent = val;
    document.querySelector('label[for="samples"] .samples-label-value').textContent = `(${val})`;
});

defocusAngle.addEventListener("input", () => {
    const val = parseFloat(defocusAngle.value);
    defocusAngleDisplay.textContent = val;
    document.querySelector('label[for="defocus-angle"] .defocus-angle-label-value').textContent = `(${val})`;
});

downloadButton.addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "render.png";
    link.click();
});

document.querySelector('label[for="samples"] .samples-label-value').textContent = `(${parseFloat(samples.value)})`;
document.querySelector('label[for="defocus-angle"] .defocus-angle-label-value').textContent = `(${parseFloat(defocusAngle.value)})`;

renderButton.addEventListener("click", () => {
    if (!lib) return;

    const width = qualityMap[document.getElementById("quality").value];
    const height = Math.floor(width / (16.0 / 9.0));

    canvas.width = width;
    canvas.height = height;

    const ptr = lib.ccall("create_buffer", "number", ["number", "number"], [width, height]);

    lib.ccall("render", null,
        ["number", "number", "number", "number", "number", "number", "number", "number", "number", "number"],
        [
            ptr,
            parseFloat(document.getElementById("look-from-x").value),
            parseFloat(document.getElementById("look-from-y").value),
            parseFloat(document.getElementById("look-from-z").value),
            parseFloat(document.getElementById("look-at-x").value),
            parseFloat(document.getElementById("look-at-y").value),
            parseFloat(document.getElementById("look-at-z").value),
            parseFloat(defocusAngle.value),
            parseInt(samples.value),
            width
        ]
    );

    downloadButton.style.display = "block";

    const pixels = new Uint8ClampedArray(lib.HEAPU8.buffer, ptr, width * height * 4);
    const imageData = new ImageData(pixels, width, height);
    ctx.putImageData(imageData, 0, 0);

    lib.ccall("destroy_buffer", null, ["number"], [ptr])
})
