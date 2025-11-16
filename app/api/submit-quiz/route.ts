import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function POST(req: NextRequest) {
  // Get environment variables
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  // NEW: Add a check to ensure all required variables are present.
  // This prevents the 'replace of undefined' error.
  if (!sheetId || !clientEmail || !privateKey) {
    console.error("CRITICAL ERROR: Missing Google Sheets environment variables in your .env.local file.");
    return NextResponse.json({ message: 'Server is not configured correctly.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { name, rollNumber, batch, score } = body;

    if (!name || !rollNumber || !batch || score === undefined) {
      return NextResponse.json({ message: 'Missing required fields from request' }, { status: 400 });
    }

    // Initialize auth using the checked variables
    const serviceAccountAuth = new JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, '\n'), // This line is now safe
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    await doc.loadInfo(); 
    const sheet = doc.sheetsByIndex[0];

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
    return NextResponse.json({ message: 'Internal Server Error while processing sheet' }, { status: 500 });
  }
}