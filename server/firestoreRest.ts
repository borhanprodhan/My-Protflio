import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

interface FirebaseAppletConfig {
  projectId: string;
  apiKey: string;
  firestoreDatabaseId: string;
}

function loadFirebaseConfig(): FirebaseAppletConfig {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  const raw = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(raw) as FirebaseAppletConfig;
}

export interface ContactSubmissionInput {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  serviceRequired: string;
  projectBudget: string;
  message: string;
}

export async function createContactMessageInFirestore(input: ContactSubmissionInput): Promise<string> {
  const config = loadFirebaseConfig();
  const messageId = `msg_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
  const docPath = `projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/contact_messages/${messageId}`;
  const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents:commit?key=${encodeURIComponent(config.apiKey)}`;

  const payload = {
    writes: [
      {
        update: {
          name: docPath,
          fields: {
            fullName: { stringValue: input.fullName },
            email: { stringValue: input.email },
            phone: { stringValue: input.phone },
            companyName: { stringValue: input.companyName },
            serviceRequired: { stringValue: input.serviceRequired },
            projectBudget: { stringValue: input.projectBudget },
            message: { stringValue: input.message },
            status: { stringValue: 'New' },
          },
        },
        currentDocument: { exists: false },
      },
      {
        transform: {
          document: docPath,
          fieldTransforms: [
            { fieldPath: 'submittedAt', setToServerValue: 'REQUEST_TIME' },
            { fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' },
          ],
        },
      },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Firestore commit failed (${response.status}): ${errText}`);
  }

  return messageId;
}

export async function verifyGoogleAdminIdToken(idToken: string): Promise<{ email: string; uid: string } | null> {
  const config = loadFirebaseConfig();
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(config.apiKey)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as {
    users?: Array<{ localId?: string; email?: string; emailVerified?: boolean }>;
  };

  const user = data.users?.[0];
  if (!user || !user.emailVerified || user.email !== 'mdborhprodhan@gmail.com' || !user.localId) {
    return null;
  }

  return { email: user.email, uid: user.localId };
}
