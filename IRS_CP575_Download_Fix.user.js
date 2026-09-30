// ==UserScript==
// @name         IRS CP575 Download Fix
// @namespace    local.irs.cp575
// @version      2.0
// @description  Opens the IRS-generated CP575 PDF correctly on iPhone Safari.
// @match        https://sa.www4.irs.gov/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const nativeClick = HTMLElement.prototype.click;

    HTMLElement.prototype.click = function () {
        try {
            const isPDFDownload =
                this.tagName === 'A' &&
                typeof this.href === 'string' &&
                this.href.startsWith(
                    'data:application/pdf;base64,'
                );

            if (!isPDFDownload) {
                return nativeClick.apply(this, arguments);
            }

            // IRS successfully generated the CP575.
            const comma = this.href.indexOf(',');
            const base64 = this.href.slice(comma + 1);

            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);

            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            const pdf = new Blob(
                [bytes],
                { type: 'application/pdf' }
            );

            const pdfURL = URL.createObjectURL(pdf);

            // Display PDF directly in Safari.
            // From there use Share -> Save to Files.
            location.href = pdfURL;

            return;

        } catch (error) {
            alert(
                'Could not open CP575 PDF: ' +
                error.message
            );

            return nativeClick.apply(this, arguments);
        }
    };

    // Small indicator so you know the fix loaded.
    function showReady() {
        if (!document.body) {
            setTimeout(showReady, 100);
            return;
        }

        const badge = document.createElement('div');

        badge.textContent = 'CP575 FIX READY';

        badge.style.cssText =
            'position:fixed;' +
            'top:8px;' +
            'right:8px;' +
            'z-index:2147483647;' +
            'background:#111;' +
            'color:#fff;' +
            'padding:7px 9px;' +
            'border-radius:5px;' +
            'font:12px sans-serif;';

        document.body.appendChild(badge);
    }

    showReady();

})();
