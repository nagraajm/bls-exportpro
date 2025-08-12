import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { invoiceService } from '../services/invoice.service';
import { pdfService } from '../services/pdf.service';
import fs from 'fs';
import path from 'path';

export const generateInvoicePDF = asyncHandler(async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const invoice = await invoiceService.getInvoice(req.params.id);
  const filepath = await pdfService.generateInvoicePDF(invoice);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
  
  const stream = fs.createReadStream(filepath);
  stream.pipe(res);
  
  stream.on('end', () => {
    fs.unlinkSync(filepath);
  });
});