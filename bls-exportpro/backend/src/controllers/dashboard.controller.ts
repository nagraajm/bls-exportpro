import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { dashboardService } from '../services/dashboard.service';

export const getMetrics = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const metrics = await dashboardService.getMetrics();
  
  res.json({
    status: 'success',
    data: metrics,
  });
});