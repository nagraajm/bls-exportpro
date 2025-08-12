import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { invoiceService } from '../services/invoice.service';
import { packingListService } from '../services/packing-list.service';
import { purchaseOrderService } from '../services/purchase-order.service';
import { enhancedDocumentService } from '../services/document/document.service';
import fs from 'fs';
import path from 'path';

interface DocumentGenerationRequest {
  format?: 'pdf' | 'excel' | 'html';
  watermark?: string;
  includePageNumbers?: boolean;
  includeVersion?: boolean;
  version?: string;
  digitalSignaturePlaceholder?: boolean;
}

export const generateInvoiceDocuments = asyncHandler(async (
  req: Request<{ id: string }, {}, DocumentGenerationRequest>,
  res: Response
) => {
  const invoice = await invoiceService.getInvoice(req.params.id);
  const options = req.body || {};
  
  const results = await enhancedDocumentService.generateInvoice(invoice, options);
  
  // If specific format requested, return that file
  if (options.format && results[options.format]) {
    const filepath = results[options.format];
    if (!filepath) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate document'
      });
      return;
    }
    const ext = path.extname(filepath).slice(1);
    const contentType = getContentType(ext);
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.${ext}"`);
    
    if (ext === 'html') {
      res.send(fs.readFileSync(filepath, 'utf-8'));
    } else {
      const stream = fs.createReadStream(filepath);
      stream.pipe(res);
      stream.on('end', () => {
        // Don't delete files - they might be needed for versioning
      });
    }
  } else {
    // Return all generated files info
    res.json({
      status: 'success',
      data: {
        invoiceNumber: invoice.invoiceNumber,
        files: results
      }
    });
  }
});

export const generatePackingListDocuments = asyncHandler(async (
  req: Request<{ id: string }, {}, DocumentGenerationRequest>,
  res: Response
) => {
  const packingList = await packingListService.getPackingList(req.params.id);
  const options = req.body || {};
  
  const results = await enhancedDocumentService.generatePackingList(packingList, options);
  
  if (options.format && results[options.format]) {
    const filepath = results[options.format];
    if (!filepath) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate document'
      });
      return;
    }
    const ext = path.extname(filepath).slice(1);
    const contentType = getContentType(ext);
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="packing-list-${packingList.packingListNumber}.${ext}"`);
    
    if (ext === 'html') {
      res.send(fs.readFileSync(filepath, 'utf-8'));
    } else {
      const stream = fs.createReadStream(filepath);
      stream.pipe(res);
    }
  } else {
    res.json({
      status: 'success',
      data: {
        packingListNumber: packingList.packingListNumber,
        files: results
      }
    });
  }
});

export const generatePurchaseOrderDocuments = asyncHandler(async (
  req: Request<{ id: string }, {}, DocumentGenerationRequest>,
  res: Response
) => {
  const purchaseOrder = await purchaseOrderService.getPurchaseOrder(req.params.id);
  const options = req.body || {};
  
  const results = await enhancedDocumentService.generatePurchaseOrder(purchaseOrder, options);
  
  if (options.format && results[options.format]) {
    const filepath = results[options.format];
    if (!filepath) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate document'
      });
      return;
    }
    const ext = path.extname(filepath).slice(1);
    const contentType = getContentType(ext);
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="purchase-order-${purchaseOrder.poNumber}.${ext}"`);
    
    if (ext === 'html') {
      res.send(fs.readFileSync(filepath, 'utf-8'));
    } else {
      const stream = fs.createReadStream(filepath);
      stream.pipe(res);
    }
  } else {
    res.json({
      status: 'success',
      data: {
        poNumber: purchaseOrder.poNumber,
        files: results
      }
    });
  }
});

export const generateBulkInvoices = asyncHandler(async (
  req: Request<{}, {}, { orderIds: string[]; format?: 'pdf' | 'excel'; options?: DocumentGenerationRequest }>,
  res: Response
) => {
  const { orderIds, format, options } = req.body;
  
  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    res.status(400).json({
      status: 'error',
      message: 'Please provide an array of order IDs'
    });
    return;
  }
  
  const orders = await Promise.all(
    orderIds.map(async (orderId) => {
      // For now, just get the first invoice for the order
      const invoices = await invoiceService.listInvoices({ orderId });
      const invoice = invoices.data[0];
      return { id: orderId, invoice };
    })
  );
  
  const zipPath = await enhancedDocumentService.generateBulkDocuments(
    orders,
    'invoice',
    { ...options, format }
  );
  
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="bulk-invoices-${Date.now()}.zip"`);
  
  const stream = fs.createReadStream(zipPath);
  stream.pipe(res);
  stream.on('end', () => {
    fs.unlinkSync(zipPath);
  });
});

export const getDocumentVersions = asyncHandler(async (
  req: Request<{ documentNumber: string; type: string }>,
  res: Response
) => {
  const { documentNumber, type } = req.params;
  
  const versions = await enhancedDocumentService.getDocumentVersions(documentNumber, type);
  
  res.json({
    status: 'success',
    data: {
      documentNumber,
      type,
      versions
    }
  });
});

// Legacy endpoint for backward compatibility
export const generateInvoicePDF = asyncHandler(async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const invoice = await invoiceService.getInvoice(req.params.id);
  const results = await enhancedDocumentService.generateInvoice(invoice, { format: 'pdf' });
  
  if (results.pdf) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
    
    const stream = fs.createReadStream(results.pdf);
    stream.pipe(res);
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate PDF'
    });
  }
});

// Helper function
function getContentType(extension: string): string {
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'html':
      return 'text/html';
    default:
      return 'application/octet-stream';
  }
}