import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import fs from 'fs';
import path from 'path';

// Serve static JSON configuration files for ports, shipping methods, incoterms, etc.
export const getPorts = asyncHandler(async (req: Request, res: Response) => {
  const portsData = await fs.promises.readFile(
    path.join(process.cwd(), 'data', 'ports.json'), 
    'utf-8'
  );
  
  res.json({
    success: true,
    data: JSON.parse(portsData),
    count: JSON.parse(portsData).length
  });
});

export const getShippingMethods = asyncHandler(async (req: Request, res: Response) => {
  const shippingData = await fs.promises.readFile(
    path.join(process.cwd(), 'data', 'shipping-methods.json'), 
    'utf-8'
  );
  
  res.json({
    success: true,
    data: JSON.parse(shippingData),
    count: JSON.parse(shippingData).length
  });
});

export const getIncoterms = asyncHandler(async (req: Request, res: Response) => {
  const incotermsData = await fs.promises.readFile(
    path.join(process.cwd(), 'data', 'incoterms.json'), 
    'utf-8'
  );
  
  res.json({
    success: true,
    data: JSON.parse(incotermsData),
    count: JSON.parse(incotermsData).length
  });
});

export const getExchangeRates = asyncHandler(async (req: Request, res: Response) => {
  const exchangeRatesData = await fs.promises.readFile(
    path.join(process.cwd(), 'data', 'exchange-rates.json'), 
    'utf-8'
  );
  
  res.json({
    success: true,
    data: JSON.parse(exchangeRatesData),
    count: JSON.parse(exchangeRatesData).length
  });
});

export const getPaymentTerms = asyncHandler(async (req: Request, res: Response) => {
  const paymentTermsData = await fs.promises.readFile(
    path.join(process.cwd(), 'data', 'payment-terms.json'), 
    'utf-8'
  );
  
  res.json({
    success: true,
    data: JSON.parse(paymentTermsData),
    count: JSON.parse(paymentTermsData).length
  });
});