# ClassFlow — HTML/CSS/JS + Google Sheets

A creative class scheduling website that uses **GitHub Pages for the frontend** and **Google Apps Script + Google Sheets as the backend**.

## Features

- Student class booking
- Five-hour minimum advance scheduling rule
- Duplicate time protection
- Teacher portal
- Teacher dashboard
- Monthly teacher calendar
- Student feedback
- Data stored in Google Sheets
- No Firebase
- No Firestore
- No Google OAuth login required
- Responsive/mobile design

## 1. Create the Google Sheet

Create one Google Sheet. Open **Extensions → Apps Script**.

Create these three sheets (the Apps Script `setupSheets()` function can create them for you):

### Teachers

| username | password | name | active |
|---|---|---|---|
| teacher1 | ChangeMe123! | Your Teacher | TRUE |

### Bookings

| id | timestamp | student | email | date | time | datetime | subject | notes | status |
|---|---|---|---|---|---|---|---|---|---|

### Feedback

| id | timestamp | student | email | subject | rating | feedback |
|---|---|---|---|---|---|---|

## 2. Add Apps Script

Paste `apps-script/Code.gs` into Apps Script.

Run `setupSheets()` once from the Apps Script editor. Approve the Google permissions.

## 3. Deploy Apps Script

Choose:

**Deploy → New deployment → Web app**

Use:

- Execute as: **Me**
- Who has access: **Anyone**

Copy the URL ending in `/exec`.

## 4. Connect the website

Open:

`js/config.js`

Replace:

```text
PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE
```

with your Apps Script `/exec` URL.

Example:

```js
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
};
```

## 5. Test locally

Because the frontend uses JSONP, you can test it from a simple local server.

For example, in the project directory:

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

Do not double-click the HTML file if your browser blocks local scripts.

## 6. Put it on GitHub Pages

Create a GitHub repository and upload the project files.

In GitHub:

**Settings → Pages → Deploy from branch → main → / (root)**

Your website will then be available through your GitHub Pages URL.

## Important security note

This project intentionally follows your requirement of **manual teacher authentication using Google Sheets**.

That means:

- Teacher usernames/passwords are stored in the sheet.
- The frontend keeps the teacher username in `localStorage`.
- Every teacher-data request checks that username against the Teachers sheet.
- There is no Google login, Firebase Auth, or OAuth.

This is **not equivalent to secure production authentication**. Anyone who can call your public Apps Script endpoint can inspect the API behavior, and a Google Apps Script web app exposed to "Anyone" should not be treated as a private API.

For a school/internal prototype this can be acceptable. For sensitive student information, payments, private records, or a public commercial system, use proper authentication and authorization.

## Time zone

In Apps Script, set the project's time zone to the same time zone used by your school.

For India, use:

`Asia/Kolkata`

The browser's five-hour validation and Apps Script's five-hour validation both run before a booking is accepted.

## Data flow

```text
Student browser
      |
      | JSONP request
      v
Google Apps Script
      |
      +----> Teachers sheet
      |
      +----> Bookings sheet
      |
      +----> Feedback sheet
      |
      v
Teacher browser
```

## Files

```text
class_scheduler_google_sheets/
├── index.html
├── student.html
├── feedback.html
├── teacher-login.html
├── teacher.html
├── calendar.html
├── README.md
├── css/
│   ├── style.css
│   └── calendar.css
├── js/
│   ├── config.js
│   ├── api.js
│   ├── student.js
│   ├── feedback.js
│   ├── teacher-login.js
│   ├── teacher.js
│   └── calendar.js
└── apps-script/
    └── Code.gs
```
