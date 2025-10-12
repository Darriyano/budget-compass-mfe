import { Request, Response } from 'express'
import { TravelBotService } from '../services/TravelBotService'
import { TravelBotRequest } from '../types'

export class TravelBotController {
  static async askQuestion(req: Request, res: Response): Promise<void> {
    try {
      const { question } = req.body

      if (!question || typeof question !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Question is required and must be a string',
        })
        return
      }

      const request: TravelBotRequest = { question }
      const response = await TravelBotService.askQuestion(request)

      res.json({
        success: true,
        data: response,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to process question',
      })
    }
  }
}
