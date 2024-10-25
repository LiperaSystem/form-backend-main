import { google } from 'googleapis';
import * as stream from 'stream';
import { Data } from '../interfaces/userData';
import * as dotenv from 'dotenv';

dotenv.config();

const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID;

export async function uploadPDFToGoogleDrive(data: Data, pdf: Buffer) {
  const userName = data.user.name;

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: './src/credentials/googledrive.json',
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const driveService = google.drive({
      version: 'v3',
      auth,
    });

    const fileMetadata = {
      name: `${userName.trim()}.pdf`,
      parents: [DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: 'application/pdf',
      body: stream.Readable.from(pdf),
    };

    const existingFile = await driveService.files.list({
      q: `'${DRIVE_FOLDER_ID}' in parents and name='${fileMetadata.name}'`,
      fields: 'files(id)',
      spaces: 'drive',
    });

    if (existingFile.data.files.length > 0) {
      await driveService.files.delete({
        fileId: existingFile.data.files[0].id,
        supportsAllDrives: true,
      });
    }

    const response = await driveService.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
      supportsAllDrives: true,
      fileId:
        existingFile.data.files.length > 0
          ? existingFile.data.files[0].id
          : undefined,
    } as any);
    return {
      fileLink: `https://drive.google.com/file/d/${response.data.id}`,
    };
  } catch (err) {
    console.log(`Error on save PDF: ${err}`);
    return { error: 'Failed to upload PDF' };
  }
}
