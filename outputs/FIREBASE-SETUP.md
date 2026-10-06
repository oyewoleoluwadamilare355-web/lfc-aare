# LFC Aare book manager setup

The website is ready for Firebase. Complete these one-time steps before using the upload page.

1. Create a project at https://console.firebase.google.com.
2. Add a **Web app** to the project. Copy its configuration values into `firebase-config.js`.
3. In **Authentication**, enable **Email/Password** sign-in. Add `lfcaarestudiounits@gmail.com` as a user with a secure password.
4. In **Firestore Database**, create a database in Production mode.
5. In **Storage**, create the default storage bucket.
6. Deploy the `outputs` folder to a web host. In Firebase Authentication, add the final website domain under **Authorized domains**.

## Firestore rules

In Firestore Database > Rules, publish this rule. It lets everyone read published books, while only the studio email can add, edit or remove them.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /books/{bookId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.email == 'lfcaarestudiounits@gmail.com';
    }
    match /hymns/{hymnId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.email == 'lfcaarestudiounits@gmail.com';
    }
  
```

## Storage rules

In Storage > Rules, publish this rule. It makes uploaded book files readable to visitors but protects uploads from everyone except the studio account.

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /books/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.email == 'lfcaarestudiounits@gmail.com';
    }
  }
}
```

## Monthly workflow

1. Open `admin.html` on the live website.
2. Sign in with `lfcaarestudiounits@gmail.com`.
3. Enter the title and author, choose the cover image and PDF, then select **Publish book**.
4. The book appears automatically in the Book of the Month section.

## Weekly hymn workflow

1. Open `hymn-admin.html` on the live website.
2. Sign in with `lfcaarestudiounits@gmail.com`.
3. Add each hymn number, title, writer/source, and display order.
4. The hymn list appears automatically on `hymns.html`.
