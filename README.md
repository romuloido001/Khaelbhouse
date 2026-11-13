# Boarding House Billing & Receipt Portal

A GitHub Pages frontend with Google Sheets storage using Google Apps Script.

## Included features
- Tenant records (name, room, rent, Wi-Fi fee, contact, active/inactive status)
- Water and electricity previous/current meter readings
- Automatic consumption and charge calculations
- Wi-Fi, rent and other charges
- Duplicate bill protection per tenant and billing month
- Billing history dashboard and printable receipts
- Google Spreadsheet storage

## Part A — Prepare the Google Spreadsheet
1. Create a new Google Spreadsheet, for example **Boarding House Billing Database**.
2. Open **Extensions → Apps Script**.
3. Replace the editor contents with the code in `Code.gs`.
4. In `Code.gs`, replace `CHANGE-THIS-TO-A-STRONG-PIN` with a private administrator PIN.
5. Save the Apps Script project.

The script creates two sheets automatically: `Tenants` and `Bills`.

## Part B — Deploy Google Apps Script
1. In Apps Script, select **Deploy → New deployment**.
2. Select the gear icon and choose **Web app**.
3. Set **Execute as** to **Me**.
4. Set **Who has access** to **Anyone**.
5. Deploy and authorize the script when Google asks.
6. Copy the Web App URL ending in `/exec`.

Important: Anyone with the URL can reach the endpoint, but every data operation checks the administrator PIN. Do not share your PIN. Since a GitHub Pages site is public and the PIN is entered in the browser, this is basic access control rather than strong user authentication. For sensitive tenant data, use a proper authenticated backend and restrict access.

## Part C — Configure the portal
1. Open `index.html` locally in a browser, or publish it to GitHub Pages.
2. Select **Settings**.
3. Enter your boarding house name.
4. Paste the Apps Script Web App URL.
5. Enter the same administrator PIN you placed in `Code.gs`.
6. Click **Save settings & connect**.

## Part D — Publish using GitHub Pages
1. Create a GitHub repository, e.g. `boarding-house-receipt-portal`.
2. Upload `index.html` to the repository root.
3. Commit the changes.
4. Open **Settings → Pages**.
5. Under Build and deployment, select **Deploy from a branch**.
6. Select branch `main` and folder `/ (root)`, then Save.
7. Wait for GitHub Pages to publish the site.

## Monthly billing workflow
1. Add each tenant in **Tenants**.
2. Open **Create Bill** and select the tenant and billing month.
3. Enter previous/current water and electricity readings and the applicable rates.
4. Check the automatic computation.
5. Save the bill. It is stored in Google Sheets and a receipt can be printed from Billing Records.

## Important notes
- Amounts are in Philippine pesos (₱).
- Water is calculated as (current − previous) × water rate per m³.
- Electricity is calculated as (current − previous) × electricity rate per kWh.
- Wi-Fi, rent, and other charges are added to the utility charges.
- Each tenant can have only one bill per billing month. Correct mistakes in the spreadsheet before attempting to re-create that month's bill.
- The receipt's **Amount paid** is initially ₱0.00. Payment collection/editing is not included in this starter version.
- Rates are entered for each bill, so you can adjust them when provider rates change.
