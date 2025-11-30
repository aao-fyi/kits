"use strict";

document.addEventListener("DOMContentLoaded", function() {
    // Check namespace
    window.Kits = window.Kits || {};

    Kits.Prime = {
        checkBigInt(checkNumber) {
            // Check if BigInt
            if (typeof checkNumber === 'bigint') {
                return checkNumber;
            }
            // Check if numerical input
            if (!/^-?\d+$/.test(String(checkNumber))) {
                throw new TypeError('Enter a positive or negative number.');
            }
            // Return BigInt
            return BigInt(checkNumber);
        },

        generateBigInt(min, max) {
            min = BigInt(min);
            max = BigInt(max);
            const range = max - min + 1n;
            if (range === 1n) return min;

            // If range is less than max safe integer, use rando(Number, Number)
            if (range <= BigInt(Number.MAX_SAFE_INTEGER)) {
                return BigInt(rando(Number(min), Number(max)));
            }

            // If range is greater than max safe integer, calculate random BigInt from 32-bit chunk with rando(0, 2^32 - 1)
            const chunkBits = 32n;
            const chunkMax = 2n ** chunkBits;
            const bits = range.toString(2).length;
            const chunks = Math.ceil(bits / Number(chunkBits)); // number of 32-bit chunks needed

            // Rejection threshold
            const chunkMaxBigInt = chunkMax ** BigInt(chunks);
            const randomMaxAccept = chunkMaxBigInt - (chunkMaxBigInt % range);

            while (true) {
                // Calculate random BigInt
                let randomBigInt = 0n;
                for (let chunkCount = 0; chunkCount < chunks; chunkCount++) {
                    const chunkValue = BigInt(rando(0, 0xFFFFFFFF));
                    randomBigInt = (randomBigInt << chunkBits) + chunkValue;
                }
                // Accept and return
                if (randomBigInt < randomMaxAccept) {
                    return min + (randomBigInt % range);
                }
            }
        },

        modPow(a, e, m) {
            // Modular exponentiation - calculate r = a^e (mod m)
            a = BigInt(a) % m;
            e = BigInt(e);
            let r = 1n;
            while (e > 0n) {
                if (e & 1n) r = (r * a) % m;
                a = (a * a) % m;
                e >>= 1n;
            }
            return r;
        },

        isPrime(checkNumber, checks = 20) {
            // Check BigInt
            checkNumber = Kits.Prime.checkBigInt(checkNumber);

            // Check if 1 or less
            if (checkNumber <= 1n) {
                return false;
            }

            // Check small primes
            const smallPrimes = [2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n];
            for (const smallPrime of smallPrimes) {
                // Check if small prime
                if (checkNumber === smallPrime) {
                    return true;
                }
                // Check if small prime multiple
                if (checkNumber % smallPrime === 0n) {
                    return false;
                }
            }

            // Convert checkNumber to n-1 = 2^s * d
            let s = 0n;
            let d = checkNumber - 1n;
            while ((d & 1n) === 0n) {
                s += 1n;
                d >>= 1n;
            }

            // Check if prime with Miller-Rabin
            for (let checkCount = 0; checkCount < checks; checkCount++) {
                const a = Kits.Prime.generateBigInt(2n, checkNumber - 2n);
                let x = Kits.Prime.modPow(a, d, checkNumber);
                if (x === 1n || x === checkNumber - 1n) continue;
                let composite = true;
                for (let r = 1n; r < s; r++) {
                    x = (x * x) % checkNumber;
                    if (x === checkNumber - 1n) { composite = false; break; }
                }
                if (composite) return false;
            }
            return true;
        },

        nextPrime(checkNumber) {
            // Check BigInt
            checkNumber = Kits.Prime.checkBigInt(checkNumber);

            // Check if 1 or less
            if (checkNumber <= 1n) {
                return 2n;
            }

            // Increment checkNumber
            checkNumber = checkNumber + 1n;
            // Check if even - make odd
            if ((checkNumber & 1n) === 0n) {
                checkNumber += 1n;
            }

            // 6k+1 - Determine next step in prime checks
            const mod6Remainder = Number(checkNumber % 6n);
            const mod6Table = [
                [1n, 4n], // mod 0 = +1 = 6k+1, step 4
                [0n, 4n], // mod 1 = +0 = 6k+1, step 4
                [3n, 2n], // mod 2 = +3 = 6(k+1)-1, step 2
                [2n, 2n], // mod 3 = +2 = 6k+5, step 2
                [1n, 2n], // mod 4 = +1 = 6k+5, step 2
                [0n, 2n], // mod 5 = +0 = 6k-1, step 2
            ];
            const [mod6Offset, initialStep] = mod6Table[mod6Remainder];
            checkNumber = checkNumber + mod6Offset;

            // Define first step
            let currentStep = initialStep;

            // Define time limit
            const checkTimeLimit = 60_000; // 60s
            const checkStartTime = Date.now();

            while (true) {
                // Check time limit
                if (Date.now() - checkStartTime > checkTimeLimit) {
                    return null;
                }
                // Check prime
                if (Kits.Prime.isPrime(checkNumber)) {
                    return checkNumber;
                }

                // Increment checkNumber by currentStep
                checkNumber += currentStep;
                if (currentStep === 2n) {
                    currentStep = 4n;
                } else {
                    currentStep = 2n;
                }
            }
        },

        check(event) {
            // Prevent query submission
            event.preventDefault();

            // Define form attributes
            const submitForm = event.currentTarget;
            const submitButton = submitForm.querySelector(".prime-form-submit");

            // Define form data
            const submitFormData = new FormData(submitForm);

            // Define form values
            const checkNumber = submitFormData.get("prime-form-number").trim();

            // Get values
            const checkIsPrime = Kits.Prime.isPrime(checkNumber);
            const checkNextPrime = Kits.Prime.nextPrime(checkNumber);

            // Output values
            document.getElementById("prime-output-isprime").textContent = checkIsPrime;
            document.getElementById("prime-output-nextprime").textContent = checkNextPrime;
        },

        init() {
            const submitForms = document.querySelectorAll(".prime-form");
            submitForms.forEach(function(submitForm) {
                // Form submit event
                submitForm.addEventListener("submit", Kits.Prime.check);
            });
        },
    };

    Kits.Prime.init();
});

