# Enable image uploads to Google Drive

The admin now supports both **paste image URL** and **upload image** for service
category covers, individual services, and blog cover images. The browser resizes
images to at most 1600 pixels and optimizes them before upload. JPEG, PNG and WebP
are supported; the original file can be up to 10 MB and the optimized upload must
fit within 1 MB. SVG and other file types are rejected.

## One-time update in your existing Apps Script project

1. Open your existing Google Sheet → **Extensions → Apps Script**.
2. Replace the website bridge code with the latest [apps-script/Code.gs](apps-script/Code.gs).
   Preserve any unrelated script files and check for function-name conflicts.
   Keep the same Apps Script project so its Script Properties, existing password,
   connection secret, Sheet ID and content remain in place.
3. Save, select **enableImageUploads**, and click **Run**. Review and authorize
   Google's new Drive permission. It creates a folder named
   **RAHUL G & ASSOCIATES Website Images** in the account running the script.
   If the folder was already created, it is reused.
4. Choose **Deploy → Manage deployments → Edit (pencil) → New version → Deploy**
   on the existing web app deployment. Keep **Execute as: Me** and **Access: Anyone**.
   Updating this existing deployment preserves its `/exec` URL.
5. Return to the admin, open **Services**, edit a category or individual service,
   and choose **Upload image to Drive**. After upload succeeds, click **Save changes**.

**Do not run setupWebsite again.** No new credentials, environment variables,
Google Cloud project, OAuth client or public Drive sharing are needed. The
existing Apps Script connection secret authenticates the server. The new Drive
permission must be approved by the Google account that owns/runs the web app.
An Apps Script editor login is not automatically accessible to the assistant.

Until the existing script is updated and Drive enabled, URL fields continue to
work. The upload API reports the required script update instead of pretending the
image was saved. Changing Script Properties alone is not enough; deploy the new
code version as in step 4.

## How storage and display work

Uploads require an authenticated admin session and the admin origin. Both the
Vercel API and Apps Script validate the byte size, file signature and MIME type.
Files are stored privately in the dedicated Drive folder. The resulting image URL
points to the admin project's `/api/media?id=...` endpoint, which fetches the image
from Drive through Apps Script. This avoids depending on Drive sharing-page or
thumbnail URLs as website image links. The proxy only serves JPEG, PNG or WebP
files in the managed folder; it cannot retrieve arbitrary private Drive files.

The public website can display these uploaded images, so images published this
way are website content even though their Drive permissions remain private.
The browser receives no Apps Script connection secret. Image responses use the
correct MIME type, nosniff protection and a public cache lasting up to one day.

Uploading adds the URL to the editor. Saving the service/category/blog persists
that URL in Google Sheets and publishes it according to the item's status. Saving
is disabled while an image upload is in progress. Other edits made during upload
are preserved. Switching away cancels the browser request; an upload that has
already reached Drive may still finish without being referenced by a saved item.

Replacing an image, discarding an edit or deleting a content record does not
remove Drive files. Clean up unreferenced files manually from the managed folder
when appropriate. Deleting or moving a referenced file outside that folder makes
it unavailable after caches expire. Keep the folder private and available to the
script owner. Drive storage and Apps Script execution/traffic quotas still apply;
this is suitable for a small website, not an unlimited media CDN.

Tests exercise upload/auth checks, script version readiness, supported bytes and
size limits, actual Apps Script upload/read logic in a mock Drive runtime, folder
isolation, serving image bytes, saving URLs to Sheets, and browser upload controls.
A live Drive upload still needs the one-time Google authorization and script
version update above before it can be verified.
