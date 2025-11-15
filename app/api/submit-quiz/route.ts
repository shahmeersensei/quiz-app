import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { name, rollNumber, batch, score } = body;

    // Basic validation
    if (!name || !rollNumber || !batch || score === undefined) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Initialize auth - see https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      // The key must be correctly formatted in the .env file
      key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'), 
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth);

    await doc.loadInfo(); // loads document properties and worksheets

    const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsByTitle['YourSheetTitle'];

    // Append the new row
    await sheet.addRow({
      Timestamp: new Date().toLocaleString(),
      Name: name,
      RollNumber: rollNumber,
      Batch: batch,
      Score: score,
    });

    return NextResponse.json({ message: 'Data saved successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Error saving to Google Sheet:', error);
    // It's good practice to not expose detailed error messages to the client
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}