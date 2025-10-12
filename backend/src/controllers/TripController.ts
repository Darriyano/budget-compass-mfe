import { Request, Response } from 'express'
import { TripModel } from '../models/TripModel'
import { SavedTrip, SearchParams, BudgetBreakdown } from '../types'

export class TripController {
  static async getAllTrips(req: Request, res: Response): Promise<void> {
    try {
      const trips = TripModel.getAllTrips()
      res.json({
        success: true,
        data: trips,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trips',
      })
    }
  }

  static async getTripById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const trip = TripModel.getTripById(id)

      if (!trip) {
        res.status(404).json({
          success: false,
          error: 'Trip not found',
        })
        return
      }

      res.json({
        success: true,
        data: trip,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trip',
      })
    }
  }

  static async saveTrip(req: Request, res: Response): Promise<void> {
    try {
      const { cityId, params, adjustedBudget, total } = req.body

      if (!cityId || !params || !adjustedBudget || !total) {
        res.status(400).json({
          success: false,
          error:
            'Missing required fields: cityId, params, adjustedBudget, total',
        })
        return
      }

      const trip = TripModel.saveTrip({
        cityId,
        params: params as SearchParams,
        adjustedBudget: adjustedBudget as BudgetBreakdown,
        total: Number(total),
      })

      res.status(201).json({
        success: true,
        data: trip,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to save trip',
      })
    }
  }

  static async deleteTrip(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const deleted = TripModel.deleteTrip(id)

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Trip not found',
        })
        return
      }

      res.json({
        success: true,
        message: 'Trip deleted successfully',
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete trip',
      })
    }
  }
}
