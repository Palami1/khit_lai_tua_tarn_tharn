/**
 * EE-Tools Dashboard - Main JavaScript (Lao Version)
 * Handles tab switching, Ohm's law calculations, resistor color coding, unit conversion, and UI animations.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 0. Initialize Particles Background ---
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": { "value": 60, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#00d2ff" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.3, "random": true, "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false } },
                "size": { "value": 3, "random": true, "anim": { "enable": true, "speed": 2, "size_min": 0.1, "sync": false } },
                "line_linked": { "enable": true, "distance": 150, "color": "#00fa9a", "opacity": 0.2, "width": 1 },
                "move": { "enable": true, "speed": 1.5, "direction": "none", "random": true, "straight": false, "out_mode": "out", "bounce": false }
            },
            "interactivity": {
                "detect_on": "window",
                "events": {
                    "onhover": { "enable": true, "mode": "grab" },
                    "onclick": { "enable": true, "mode": "push" },
                    "resize": true
                },
                "modes": {
                    "grab": { "distance": 140, "line_linked": { "opacity": 0.8 } },
                    "push": { "particles_nb": 4 }
                }
            },
            "retina_detect": true
        });
    }

    // --- 1. Ripple Effect Logic ---
    const createRipple = (event) => {
        const button = event.currentTarget;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        const rect = button.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add("ripple-circle");

        const ripple = button.querySelector(".ripple-circle");
        if (ripple) {
            ripple.remove();
        }
        button.appendChild(circle);
    };

    document.querySelectorAll('.ripple').forEach(btn => {
        btn.addEventListener('click', createRipple);
    });

    // --- 2. Tab Navigation Logic ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => {
                p.classList.remove('active');
                p.classList.remove('slide-up'); // Reset animation
            });
            
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            const targetPane = document.getElementById(targetId);
            
            targetPane.classList.add('active');
            // Re-trigger reflow for animation
            void targetPane.offsetWidth;
            targetPane.classList.add('slide-up');
        });
    });

    // Helper: Add animation class dynamically to elements
    function animateValue(element, newValue) {
        element.classList.remove('bounce-in', 'scale-in');
        void element.offsetWidth; // trigger reflow
        element.textContent = newValue;
        element.classList.add('bounce-in');
    }

    // --- 3. Ohm's Law Calculator Logic ---
    const voltsInput = document.getElementById('voltage');
    const ampsInput = document.getElementById('current');
    const ohmsInput = document.getElementById('resistance');
    const powerResult = document.getElementById('power-result');
    const resetOhmsBtn = document.getElementById('reset-ohms');

    const inputs = [voltsInput, ampsInput, ohmsInput];

    inputs.forEach(input => {
        input.addEventListener('input', () => validateAndCalculateOhmsLaw(input));
    });

    resetOhmsBtn.addEventListener('click', () => {
        inputs.forEach(input => {
            input.value = '';
            input.disabled = false;
        });
        powerResult.textContent = '-- W';
        powerResult.classList.remove('bounce-in');
    });

    function validateAndCalculateOhmsLaw(changedInput) {
        if(changedInput.value < 0) changedInput.value = 0;

        let filledCount = 0;
        let v = parseFloat(voltsInput.value);
        let i = parseFloat(ampsInput.value);
        let r = parseFloat(ohmsInput.value);

        if (!isNaN(v)) filledCount++;
        if (!isNaN(i)) filledCount++;
        if (!isNaN(r)) filledCount++;

        if (filledCount >= 2) {
            if (isNaN(v)) voltsInput.disabled = true;
            if (isNaN(i)) ampsInput.disabled = true;
            if (isNaN(r)) ohmsInput.disabled = true;
            calculateOhmsLaw(v, i, r);
        } else {
            inputs.forEach(input => input.disabled = false);
            powerResult.textContent = '-- W';
        }
    }

    function calculateOhmsLaw(v, i, r) {
        let p = 0;
        let animatedField = null;
        
        if (isNaN(v) && !isNaN(i) && !isNaN(r)) {
            v = i * r;
            voltsInput.value = v.toFixed(3).replace(/\.?0+$/, "");
            animatedField = voltsInput;
        } else if (isNaN(i) && !isNaN(v) && !isNaN(r)) {
            if(r !== 0) {
                i = v / r;
                ampsInput.value = i.toFixed(3).replace(/\.?0+$/, "");
                animatedField = ampsInput;
            }
        } else if (isNaN(r) && !isNaN(v) && !isNaN(i)) {
            if(i !== 0) {
                r = v / i;
                ohmsInput.value = r.toFixed(3).replace(/\.?0+$/, "");
                animatedField = ohmsInput;
            }
        }

        v = parseFloat(voltsInput.value);
        i = parseFloat(ampsInput.value);
        
        if(!isNaN(v) && !isNaN(i)) {
            p = v * i;
            let currentPowerText = powerResult.textContent;
            let newPowerText = `${p.toFixed(3).replace(/\.?0+$/, "")} W`;
            if (currentPowerText !== newPowerText) {
                animateValue(powerResult, newPowerText);
            }
        }
    }

    // --- 4. Resistor Color Code Logic ---
    const bands = [
        document.getElementById('band1'),
        document.getElementById('band2'),
        document.getElementById('band3'),
        document.getElementById('band4')
    ];
    const visualBands = [
        document.getElementById('visual-band1'),
        document.getElementById('visual-band2'),
        document.getElementById('visual-band3'),
        document.getElementById('visual-band4')
    ];
    const resistorResult = document.getElementById('resistor-result');
    const visualContainer = document.querySelector('.resistor-visual');

    bands.forEach((select, index) => {
        updateSelectBg(select);
        select.addEventListener('change', () => {
            updateSelectBg(select);
            calculateResistor();
            
            // Add slight bump animation to visual resistor
            visualContainer.classList.remove('scale-in');
            void visualContainer.offsetWidth;
            visualContainer.classList.add('scale-in');
        });
    });

    function updateSelectBg(select) {
        const selectedOption = select.options[select.selectedIndex];
        const color = selectedOption.getAttribute('data-color');
        select.className = 'color-select interactive-hover color-' + color;
    }

    function formatOhms(value) {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(2).replace(/\.?0+$/, "") + " MΩ";
        } else if (value >= 1000) {
            return (value / 1000).toFixed(2).replace(/\.?0+$/, "") + " kΩ";
        } else {
            return Number.isInteger(value) ? value + " Ω" : value.toFixed(2).replace(/\.?0+$/, "") + " Ω";
        }
    }

    function calculateResistor() {
        bands.forEach((select, index) => {
            const color = select.options[select.selectedIndex].getAttribute('data-color');
            visualBands[index].className = `band band-${index===2?'mult':index===3?'tol':index+1} color-${color}`;
        });

        const digit1 = bands[0].value;
        const digit2 = bands[1].value;
        const multiplier = parseFloat(bands[2].value);
        const tolerance = bands[3].value;

        const baseValue = parseInt(digit1 + digit2);
        const totalResistance = baseValue * multiplier;
        
        const formatted = formatOhms(totalResistance);
        
        let newResText = `${formatted} ±${tolerance}%`;
        if (resistorResult.textContent !== newResText) {
            resistorResult.classList.remove('scale-in');
            void resistorResult.offsetWidth;
            resistorResult.textContent = newResText;
            resistorResult.classList.add('scale-in');
        }
    }

    calculateResistor();

    // --- 5. Unit Converter Logic ---
    const convertFromValue = document.getElementById('convert-from-value');
    const convertFromUnit = document.getElementById('convert-from-unit');
    const convertToValue = document.getElementById('convert-to-value');
    const convertToUnit = document.getElementById('convert-to-unit');
    const swapBtn = document.getElementById('swap-units');

    const prefixMultipliers = {
        'm': 1e-3,     
        'base': 1,     
        'k': 1e3,      
        'M': 1e6       
    };

    function convertUnits() {
        const val = parseFloat(convertFromValue.value);
        if (isNaN(val)) {
            convertToValue.value = "";
            return;
        }

        const fromFactor = prefixMultipliers[convertFromUnit.value];
        const toFactor = prefixMultipliers[convertToUnit.value];

        const baseValue = val * fromFactor;
        let result = baseValue / toFactor;

        result = parseFloat(result.toPrecision(10));
        
        convertToValue.value = result;
    }

    convertFromValue.addEventListener('input', convertUnits);
    convertFromUnit.addEventListener('change', convertUnits);
    convertToUnit.addEventListener('change', convertUnits);

    swapBtn.addEventListener('click', () => {
        // Swap units
        const tempUnit = convertFromUnit.value;
        convertFromUnit.value = convertToUnit.value;
        convertToUnit.value = tempUnit;

        // Swap values
        const tempVal = convertFromValue.value;
        if(tempVal) {
            convertFromValue.value = convertToValue.value;
        }

        convertUnits();
    });

});
