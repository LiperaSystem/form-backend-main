import * as PDFDocument from "pdfkit";
import "pdfkit";
import { getLastForm, saveUserForm } from "../db/queries";
import { Request, Response } from "express";
import { formatPhoneNumber } from "../formatNumber";
import { background } from "../generateBackgroundColors";
import { uploadPDFToGoogleDrive } from "../../useCases/saveDocument";
import { Data } from "../../interfaces/userData";
import DateBR from "../dateFormatBR";
import capitalizeEachWord from "../capitalizeName";
import * as fs from "fs";
import { sendEmail } from "../sendEmail";
import { randomUUID } from "crypto";

function createHeader(doc: PDFKit.PDFDocument, data: Data) {
  const imageWidth = 200;
  const imageHeight = 200;
  const rightMargin = 10;
  const topMargin = 75;
  const imageX = doc.page.width - rightMargin - imageWidth;
  const imageY = topMargin;

  doc.image('src/lipera.png', imageX, imageY, {
    width: imageWidth,
    height: imageHeight,
  });


  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .text('Questionário de Avaliação Sintomática de Lipedema', {
      align: 'center',
    });
  doc.moveDown();

  doc
    .font('Helvetica-Bold')
    .fontSize(18)
    .text(`Informações`)
    .fillColor('#2b2d42');

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Paciente:', { continued: true }); // Use { continued: true } to indicate that the text will continue on the same line

  doc
    .font('Helvetica')
    .text(' ' + capitalizeEachWord(data.user.name)); // Add a space before the non-bold part

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Email:', { continued: true });

  doc
    .font('Helvetica')
    .text(' ' + data.user.email);

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Telefone:', { continued: true });

  doc
    .font('Helvetica')
    .text(' ' + formatPhoneNumber(data.user.phoneNumber));

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('Data:', { continued: true });

  doc
    .font('Helvetica')
    .text(' ' + DateBR());

  // Add header borders
  doc.rect(50, 230, doc.page.width - 100, 1).fill('#000000');  // Bottom border
  doc.rect(50, 120, doc.page.width - 100, 1).fill('#000000'); // Top border

  const verticalLineX = 50;
  const verticalLineY1 = 230;
  const verticalLineY2 = verticalLineY1 - 110;

  doc
    .moveTo(verticalLineX, verticalLineY1)
    .lineTo(verticalLineX, verticalLineY2)
    .stroke();

  doc
    .moveTo(doc.page.width - 50, verticalLineY1)
    .lineTo(doc.page.width - 50, verticalLineY2)
    .stroke();
}

export async function createPDF(
  request: Request,
  response: Response
): Promise<void> {
  const data: Data = request.body;

  const lastForm = await getLastForm(data.user.phoneNumber);

  const fileName = `${randomUUID()}`
  response.setHeader("Content-Type", "application/pdf");
  response.setHeader(
    "Content-Disposition",
    `attachment; filename=${encodeURIComponent(capitalizeEachWord(data.user.name.trim()))}.pdf`
  );

  const doc = new PDFDocument();
  const pdfStream = fs.createWriteStream(`/tmp/${fileName}.pdf`);
  doc.pipe(pdfStream);

  createHeader(doc, data);

  doc.moveDown(3);

  const questions = data.questions;
  const keys = Object.keys(questions);


  try {
    for (let i = 0; i < keys.length; i++) {
      const formattedQuestion = `${keys[i].split("?")[0].trim()}?`;
      const question = keys[i];
      const score = questions[question];

      const scoreIndex = Math.min(score, background.length - 1);
      const scoreColor = background[scoreIndex];
      const scoreBoxSize = 30;

      const scoreBoxX = (doc.page.width - scoreBoxSize) / 2;
      const scoreBoxY = doc.y;

      if (!lastForm) {
        let currentScoreBoxX = scoreBoxX + scoreBoxSize + 20;
        const scoreBoxYLabel = scoreBoxY + scoreBoxSize + 30;

        doc
          .font('Helvetica')
          .fontSize(13)
          .text(`${i + 1} • ${formattedQuestion}`, 100, scoreBoxY + scoreBoxSize - 20)
          .fillAndStroke('black');

        doc
          .roundedRect(
            currentScoreBoxX - 50,
            scoreBoxYLabel - 20,
            scoreBoxSize,
            scoreBoxSize,
            3
          )
          .fill(scoreColor);

        if (score >= 10) {
          currentScoreBoxX -= 3;
        }

        doc
          .font('Helvetica')
          .fontSize(15)
          .fillColor('white')
          .text(`${score}`, currentScoreBoxX - 40, scoreBoxYLabel - 10);

        if (i === 10) {
          doc.moveDown();
        } else {
          doc.y += 5;
        }

        if (i === 4 || i === 11) {
          doc.addPage();
        }

        // Total
        if (i === 14) {
          createTotalFirstForm(data, doc, currentScoreBoxX, scoreBoxYLabel);
        }

      } else {
        const previousScore = lastForm.questions[question];
        const previousScoreColor = background[previousScore];
        const previousScoreBoxX = scoreBoxX - 60;
        const currentScoreBoxX = scoreBoxX + scoreBoxSize + 20;
        const scoreBoxYLabel = scoreBoxY + scoreBoxSize + 30;

        // Common Logic for Both Cases
        doc
          .font('Helvetica')
          .fontSize(13)
          .text(`${i + 1} • ${formattedQuestion}`, 100, scoreBoxY + scoreBoxSize - 20)
          .fillAndStroke('black');

        // Labels
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .fillColor('black')
          .text('Anterior', scoreBoxX - 52, scoreBoxY + scoreBoxSize + 5);

        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .fillColor('black')
          .text('Atual', scoreBoxX + scoreBoxSize + 20, scoreBoxY + scoreBoxSize + 5);

        // Rectangles
        doc
          .roundedRect(
            doc.page.width / 2.5,
            scoreBoxYLabel - 12,
            scoreBoxSize,
            scoreBoxSize,
            3
          )
          .fill(previousScoreColor);

        doc
          .roundedRect(
            currentScoreBoxX,
            scoreBoxYLabel - 12,
            scoreBoxSize,
            scoreBoxSize,
            3
          )
          .fill(scoreColor);

        const previousScoreXOffset = `${previousScore}`.length >= 2 ? 20 : 25;
        const currentScoreXOffset = `${score}`.length >= 2 ? 6 : 12;

        doc
          .font('Helvetica')
          .fontSize(15)
          .fillColor('white')
          .text(`${previousScore}`, previousScoreBoxX + previousScoreXOffset, scoreBoxYLabel - 2);

        doc
          .font('Helvetica')
          .fontSize(15)
          .fillColor('white')
          .text(`${score}`, currentScoreBoxX + currentScoreXOffset, scoreBoxYLabel - 2);

        if (i === 10) {
          doc.moveDown();
        } else {
          doc.y += 5;
        }

        if (i === 4 || i === 11) {
          doc.addPage();
        }

        // Total
        if (i === 14) {
          createTotalFormComparations(data, lastForm, doc, currentScoreBoxX, previousScoreBoxX, scoreBoxYLabel);
        }
      }

      doc.font('Helvetica-Bold').fontSize(12).fillColor('black');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
  }

  // Finish the document
  doc.end()

  pdfStream.on("finish", async () => {
    console.log('PDF generation complete.');
    const file = fs.createReadStream(`/tmp/${fileName}.pdf`);
    file.pipe(response);

    fs.readFile(`/tmp/${fileName}.pdf`, async (err, PDFdata) => {
      if (err) {
        console.error('Error reading file:', err);
      } else {
        try {
          await uploadPDFToGoogleDrive(data, PDFdata);
          await sendEmail(data.user.email, PDFdata);
          console.log('PDF sent successfully');
        } catch (uploadSendError) {
          console.error('Error sending PDF:', uploadSendError);
          uploadPDFToGoogleDrive(data, PDFdata);
          sendEmail(data.user.email, PDFdata);
        }
      }
    });
  });


  saveUserForm(data);
}

function createTotalFirstForm(data: Data, doc: PDFKit.PDFDocument, currentScoreBoxX: number, scoreBoxYLabel: number) {
  const currentTotal = Object.values(data.questions).reduce(
    (a: number, b: number) => {
      return a + b;
    }
  );

  doc
    .font('Helvetica-Bold')
    .fontSize(15)
    .fillColor('black')
    .text(`Total`, currentScoreBoxX - 50, scoreBoxYLabel + 45);

  doc
    .font('Helvetica')
    .fontSize(15)
    .fillColor('black')
    .text(`${currentTotal}`, currentScoreBoxX - 40, scoreBoxYLabel + 65);

  doc
    .rect(50, scoreBoxYLabel + 30, doc.page.width - 100, 1)
    .fill('#000000');
}

function createTotalFormComparations(data: Data, lastForm: any,doc: PDFKit.PDFDocument, currentScoreBoxX: number, previousScoreBoxX: number, scoreBoxYLabel: number) {
  const previousTotal = Object.values(lastForm.questions).reduce(
    (a: number, b: number) => {
      return a + b;
    }
  );
  const currentTotal = Object.values(data.questions).reduce(
    (a: number, b: number) => {
      return a + b;
    }
  );

  doc
    .font('Helvetica-Bold')
    .fontSize(15)
    .fillColor('black')
    .text(`Total`, previousScoreBoxX + 10, scoreBoxYLabel + 45);

  doc
    .font('Helvetica')
    .fontSize(15)
    .fillColor('black')
    .text(`${previousTotal}`, previousScoreBoxX + 20, scoreBoxYLabel + 65);

  doc
    .font('Helvetica-Bold')
    .fontSize(15)
    .fillColor('black')
    .text(`Total`, currentScoreBoxX, scoreBoxYLabel + 45);

  doc
    .font('Helvetica')
    .fontSize(15)
    .fillColor('black')
    .text(`${currentTotal}`, currentScoreBoxX + 8, scoreBoxYLabel + 65);

  doc
    .rect(50, scoreBoxYLabel + 30, doc.page.width - 100, 1)
    .fill('#000000');
}

function deletePDF(fileName: string) {
  fs.unlink(`/tmp/${fileName}.pdf`, (unlinkErr) => {
    if (unlinkErr) {
      console.error('Error deleting PDF file:', unlinkErr);
    } else {
      console.log('PDF file deleted.');
    }
  });
}