# IRS EIN Confirmation Letter (CP575) Button Fix for iPhone

On iPhone Safari, the **"Download your EIN confirmation letter"** button on the IRS EIN site often does nothing. This has been a long-standing issue. The letter (CP575) is actually generated fine; Safari just won't open it. This fix intercepts the download and opens the PDF directly so you can save it.

<img width="1290" height="1163" alt="IRS EIN confirmation page" src="https://github.com/user-attachments/assets/43cbe555-9965-4383-928f-1be9bf2bac9f" />

> ⚠️ **Keep the IRS page open and active.** The session times out after about 15 minutes of inactivity, and you may not be able to get back to the letter. Do the setup quickly or set it up before you apply.

## What you need

- [Scriptable](https://apps.apple.com/app/scriptable/id1405459188) (free)
- [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) (free Safari extension)

Make sure Userscripts is turned on in **Settings → Apps → Safari → Extensions → Userscripts**, and that it's allowed on `sa.www4.irs.gov`.

## Steps

1. Open **Scriptable**, create a new script, and paste in the code below.
2. Run the script. The iPhone share sheet will open.
3. Save the generated file `IRS_CP575_Download_Fix.user.js` into your **Userscripts** folder.
4. Go back to the IRS page in Safari and refresh it. You should see a small **"CP575 FIX READY"** badge in the top right.
5. Tap the download button. The PDF opens in Safari. Use **Share → Save to Files** to keep it.

<img width="1290" height="2796" alt="CP575 PDF opened in Safari" src="https://github.com/user-attachments/assets/038adae0-812a-4715-89bc-fffea79aeab4" />

## Scriptable code

```javascript
// Scriptable creator for the IRS CP575 Safari fix

const fm = FileManager.local();

const userscript = `// ==UserScript==
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
`;

const filename =
    "IRS_CP575_Download_Fix.user.js";

const path = fm.joinPath(
    fm.temporaryDirectory(),
    filename
);

fm.writeString(path, userscript);

// Opens iPhone Share Sheet
await ShareSheet.present([path]);
```

## How it works

The IRS page builds the PDF in your browser as a `data:` link and simulates a click on it, which iPhone Safari blocks. The userscript catches that click, converts the data into a normal PDF blob, and opens it in Safari instead.

**Privacy:** everything runs locally on your phone. The script doesn't send your data anywhere, and it only runs on `sa.www4.irs.gov`. Feel free to read through the code before using it.
