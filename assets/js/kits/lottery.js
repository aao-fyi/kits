"use strict";

document.addEventListener("DOMContentLoaded", function() {
    // Check namespace
    window.Kits = window.Kits || {};

    Kits.Lottery = {
        generateNumber(min, max, count) {
            const drawNumbers = new Set();
            while (drawNumbers.size < count) {
                drawNumbers.add(rando(min, max));
            }
            return Array.from(drawNumbers).sort((a, b) => a - b);
        },

        listifyNumber(number, styles = {}) {
            const li = document.createElement("li");
            li.textContent = number;
            li.classList.add("rounded-circle","m-2","justify-content-center");
            li.style.fontSize = "2rem";
            li.style.height = "3.5rem";
            li.style.width = "3.5rem";
            for (const [style, value] of Object.entries(styles)) {
                li.style[style] = value;
            }
            return li;
        },

        draw(event) {
            const drawButton = event.currentTarget;

            // Title
            const drawTitle = drawButton.getAttribute('data-draw-title');
            document.getElementById("lottery-title").textContent = drawTitle;

            // Color
            const drawColor = drawButton.getAttribute('data-draw-color');
            drawButton.style.setProperty('background-color', drawColor, 'important');
            drawButton.style.setProperty('border-color', drawColor, 'important');

            const drawMin = parseInt(drawButton.getAttribute('data-draw-min'));
            const drawMax = parseInt(drawButton.getAttribute('data-draw-max'));
            const drawCount = parseInt(drawButton.getAttribute('data-draw-count'));

            const bonusMin = parseInt(drawButton.getAttribute('data-bonus-min'));
            const bonusMax = parseInt(drawButton.getAttribute('data-bonus-max'));
            const bonusCount = parseInt(drawButton.getAttribute('data-bonus-count'));

            // Draw numbers
            const drawNumbersArray = Kits.Lottery.generateNumber(drawMin, drawMax, drawCount);
            // Draw bonus numbers
            let drawBonusNumbersArray = [];
            if (bonusCount > 0) {
                drawBonusNumbersArray = Kits.Lottery.generateNumber(bonusMin, bonusMax, bonusCount);
            }

            // Get numbers div
            const lotteryDiv = drawButton.closest('.lottery');
            const ul = lotteryDiv.querySelector('.lottery-numbers');

            // Clear numbers div
            ul.innerHTML = '';

            // Append draw numbers
            drawNumbersArray.forEach(number => {
                const li = Kits.Lottery.listifyNumber(number, {
                    backgroundColor: "var(--bs-white)",
                                                          color: "var(--bs-black)"
                });
                ul.appendChild(li);
            });

            // Append bonus numbers
            drawBonusNumbersArray.forEach(number => {
                const li = Kits.Lottery.listifyNumber(number, {
                    backgroundColor: drawColor,
                    color: "var(--bs-white)"
                });
                ul.appendChild(li);
            });
        },

        drawOpt(event, drawButton) {
            const drawOptButton = event.currentTarget;

            // Get button attributes
            const drawButtonAttr = Array.from(drawButton.attributes);
            const drawOptButtonAttr = Array.from(drawOptButton.attributes);

            // Remove draw button data attributes
            drawButtonAttr.filter(dataAttr => dataAttr.name.startsWith("data-")).forEach(dataAttr => drawButton.removeAttribute(dataAttr.name));

            // Apply opt button attributes
            drawOptButtonAttr.filter(dataAttr => dataAttr.name.startsWith('data-')).forEach(dataAttr => drawButton.setAttribute(dataAttr.name, dataAttr.value));

            // Redraw
            drawButton.click();
        },

        init() {
            const lotteryButton = document.getElementById("lottery-draw");
            lotteryButton.addEventListener("click", Kits.Lottery.draw);
            lotteryButton.click();

            const lotteryOptButtons = document.querySelectorAll(".lottery-draw-opt");
            lotteryOptButtons.forEach(lotteryOptButton => {
                lotteryOptButton.addEventListener("click", drawOptEvent => Kits.Lottery.drawOpt(drawOptEvent, lotteryButton));
            });
        }
    };

    Kits.Lottery.init();
});
