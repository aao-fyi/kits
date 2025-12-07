"use strict";

document.addEventListener("DOMContentLoaded", function() {
    // Check namespace
    window.Kits = window.Kits || {};

    Kits.Base64 = {
        encoder: new TextEncoder(),
        decoder: new TextDecoder("utf-8"),
        chunkSize: 0x8000,

        // Binary to Base64
        encodeBinary(encodeString) {
            return btoa(encodeString);
        },

        // Base64 to Binary
        decodeBinary(decodeString) {
            return atob(decodeString);
        },

        // UTF-8 to Binary
        utf8_binary(utf8String) {
            const utf8Array = Kits.Base64.encoder.encode(utf8String);
            let binaryString = "";
            for (let utf8Index = 0; utf8Index < utf8Array.length; utf8Index += Kits.Base64.chunkSize) {
                binaryString += String.fromCharCode.apply(null, utf8Array.subarray(utf8Index, utf8Index + Kits.Base64.chunkSize));
            }
            return binaryString;
        },

        // Binary to UTF-8
        binary_utf8(binaryString) {
            let utf8String = "";
            for (let binaryIndex = 0; binaryIndex < binaryString.length; binaryIndex += Kits.Base64.chunkSize) {
                const binarySlice = binaryString.slice(binaryIndex, binaryIndex + Kits.Base64.chunkSize);
                const binaryChar = Uint8Array.from(binarySlice, char => char.charCodeAt(0));
                utf8String += Kits.Base64.decoder.decode(binaryChar, { stream: true });
            }
            utf8String += Kits.Base64.decoder.decode();
            return utf8String;
        },

        // Base64 to Base64URL
        rfc4648_rfc4648URL(base64String) {
            // Replace '+' with '-'
            // Replace '/' with '_'
            // Remove '='
            return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        },

        // Base64URL to Base64
        rfc4648URL_rfc4648(base64String) {
            // Replace '-' with '+'
            // Replace '_' with '/'
            const base64Out = base64String.replace(/-/g, '+').replace(/_/g, '/');
            // Add padding
            const base64Pad = (4 - (base64Out.length % 4)) % 4;
            return base64Out + '='.repeat(base64Pad);
        },

        // Base64 to PEM
        rfc4648_rfc7468(base64String) {
            // Split into 64 character lines with LF
            const base64Wrap = base64String.match(/.{1,64}/g).join('\n');
            // Add begin/end
            return `-----BEGIN DATA-----\n${base64Wrap}\n-----END DATA-----\n`;
        },

        // PEM to Base64
        rfc7468_rfc4648(base64String) {
            // Remove being/end
            // Remove LF (by removing spaces)
            return base64String.replace(/-----BEGIN [^-]+-----[\r\n]?/g, '').replace(/-----END [^-]+-----[\r\n]?/g, '').replace(/\s+/g, '');
        },

        // Base64 to MIME
        rfc4648_rfc2045(base64String) {
            // Split into 76 character lines with CRLF
            return (base64String.match(/.{1,76}/g) || []).join('\r\n') + '\r\n';
        },

        // MIME to Base64
        rfc2045_rfc4648(base64String) {
            // Remove CRLF (by removing spaces)
            return base64String.replace(/\s+/g, '');
        },

        encode(encodeString, stringType, encodeType) {
            let base64String = ""

            // ASCII, ISO-8859-1
            if (stringType === "ascii" || stringType === "iso-8859-1") {
                base64String = Kits.Base64.encodeBinary(encodeString);
            }
            // UTF-8
            else if (stringType === "utf-8") {
                base64String = Kits.Base64.utf8_binary(encodeString);
                base64String = Kits.Base64.encodeBinary(base64String);
            }
            // Error
            else {
                return false;
            }

            // Base64
            if (encodeType === "rfc-4648") {
                return base64String;
            }
            // Base64URL
            else if (encodeType === "rfc-4648-url") {
                return Kits.Base64.rfc4648_rfc4648URL(base64String);
            }
            // PEM
            else if (encodeType === "rfc-7468") {
                return Kits.Base64.rfc4648_rfc7468(base64String);
            }
            // MIME
            else if (encodeType === "rfc-2045") {
                return Kits.Base64.rfc4648_rfc2045(base64String);
            }
            // Error
            else {
                return false;
            }
        },

        decode(decodeString, stringType, decodeType) {
            let textString = "";

            // Base64
            if (decodeType === "rfc-4648") {
                textString = Kits.Base64.decodeBinary(decodeString);
            }
            // Base64URL
            else if (decodeType === "rfc-4648-url") {
                textString = Kits.Base64.rfc4648URL_rfc4648(decodeString);
                textString = Kits.Base64.decodeBinary(textString);
            }
            // PEM
            else if (decodeType === "rfc-7468") {
                textString = Kits.Base64.rfc7468_rfc4648(decodeString);
                textString = Kits.Base64.decodeBinary(textString);
            }
            // MIME
            else if (decodeType === "rfc-2045") {
                textString = Kits.Base64.rfc2045_rfc4648(decodeString);
                textString = Kits.Base64.decodeBinary(textString);
            }
            // Error
            else {
                return false;
            }

            // ASCII, ISO-8859-1
            if (stringType === "ascii" || stringType === "iso-8859-1") {
                return textString;
            }
            // UTF-8
            else if (stringType === "utf-8") {
                return Kits.Base64.binary_utf8(textString);
            }
            // Error
            else {
                return false;
            }
        },

        init() {
            const encodeButton = document.getElementById("base64-encode-form-submit");
            const decodeButton = document.getElementById("base64-decode-form-submit");
            const encodeType = document.getElementById("base64-form-type");
            const decodeType = document.getElementById("ascii-form-type");
            const encodeString = document.getElementById("base64-form-text");
            const decodeString = document.getElementById("ascii-form-text");

            encodeButton.addEventListener("click", function (event) {
                event.preventDefault();
                const encodeOutput = Kits.Base64.encode(decodeString.value, decodeType.value, encodeType.value);
                encodeString.value = encodeOutput;
            });
            decodeButton.addEventListener("click", function (event) {
                event.preventDefault();
                const decodeOutput = Kits.Base64.decode(encodeString.value, decodeType.value, encodeType.value);
                decodeString.value = decodeOutput;
            });
        }
    };

    Kits.Base64.init();
});

