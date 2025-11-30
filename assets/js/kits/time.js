"use strict";

document.addEventListener("DOMContentLoaded", function() {
    // Check namespace
    window.Kits = window.Kits || {};

    Kits.Time = {
        utcDateDifference(dateTarget, dateBase) {
            // Check inputs are valid Date objects
            if (!(dateTarget instanceof Date) || !(dateBase instanceof Date)) {
                throw new Error("utfDateDifference: Inputs must be valid date objects.");
            }

            // Calculate date difference
            const dateDifference = dateTarget - dateBase;

            return dateDifference;
        },

        utcDateHumanize(utcDate) {
            // Determine date relative position: before (-1), same (0), after (1)
            let relation;
            if (utcDate < 0) relation = -1;
            else if (utcDate === 0) relation = 0;
            else relation = 1;

            // Disregard +/- for maths
            let utCDateAbsolute = Math.abs(utcDate);

            // Conversion constants
            const utcDateInDay = 24 * 60 * 60 * 1000;
            const utcDateInYear = 365.25 * utcDateInDay;
            const utcDateInMonth = utcDateInYear / 12;

            // Humanize UTC dates
            const years = Math.floor(utCDateAbsolute / utcDateInYear);
            utCDateAbsolute %= utcDateInYear;
            const months = Math.floor(utCDateAbsolute / utcDateInMonth);
            utCDateAbsolute %= utcDateInMonth;
            const days = Math.floor(utCDateAbsolute / utcDateInDay);

            // Return humanized values object
            return {
                years,
                months,
                days,
                relation,
            };
        },

        getQueryValue(query) {
            const params = new URLSearchParams(window.location.search);
            return params.get(query);
        },

        getQueryDate(queryStringValue) {
            let queryDate;
            // Get query string value, use current date if none
            if (queryStringValue) {
                const [year, month, day] = queryStringValue.split('-');
                // Subtract one month for javascript 0 index months
                queryDate = new Date(year, month - 1, day);
            } else {
                queryDate = new Date();
            }

            return queryDate;
        },

        setQueryDateToInput() {
            const queryDateValue = Kits.Time.getQueryValue('date');
            const timeInput = document.querySelector('.time-input');
            // Get date from query, will return current date if query fails
            const queryDate = Kits.Time.getQueryDate(queryDateValue);
            // Set date, format as YYYY-MM-DD
            timeInput.value = queryDate.toISOString().split('T')[0];
        },

        calculateDateDifference(event) {
            // Get button
            const timeButton = event.currentTarget;
            const timeBase = timeButton.getAttribute('data-time-base');
            // Get date elements
            const timeDiv = timeButton.closest('.time');
            const timeInput = timeDiv.querySelector('.time-input');
            const timeYears = timeDiv.querySelector('.time-year');
            const timeMonths = timeDiv.querySelector('.time-month');
            const timeDays = timeDiv.querySelector('.time-day');
            const timeDiff = timeDiv.querySelector('.time-diff');
            // Get values
            const timeBaseValue = new Date(timeBase);
            const timeInputValue = new Date(timeInput.value);

            // Calculate
            const timeDiffValue = Kits.Time.utcDateDifference(timeInputValue, timeBaseValue);

            // Output
            const timeDiffOutput = Kits.Time.utcDateHumanize(timeDiffValue);
            timeYears.textContent = timeDiffOutput.years;
            timeMonths.textContent = timeDiffOutput.months;
            timeDays.textContent = timeDiffOutput.days;
            switch (timeDiffOutput.relation) {
                case -1:
                    timeDiff.textContent = "Before"
                    break;
                case 0:
                    timeDiff.textContent = "Is"
                    break;
                case 1:
                    timeDiff.textContent = "After"
                    break;
            }
        },

        init() {
            // Set input to query string '?t=' if present, else use current date
            Kits.Time.setQueryDateToInput();

            // Time calculate buttons
            const timeButtons = document.querySelectorAll(".time-button");
            timeButtons.forEach(timeButton => {
                timeButton.addEventListener("click", Kits.Time.calculateDateDifference);
                timeButton.click();
            });
        }
    };

    Kits.Time.init();
});
