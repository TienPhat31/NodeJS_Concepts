import { EventModel } from '../models/event.model';
import { Request, Response } from 'express';
import voucherServices from '../services/voucher.services';
import eventServices from '../services/event.services';
import logger from '../config/logger';

class VoucherController {
  // Add new Event
  public async addNewEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventData = req.body;
      const newEvent = await eventServices.addEvent(eventData);
      res.status(200).json({ message: 'Add new event success', newEvent });
      logger.info('Add new event success', { newEvent });
    } catch (error) {
      logger.error('Error adding new event', { error });
      res.status(500).json(error);
    }
  }

  // Display all Event
  public async getAllEvent(req: Request, res: Response): Promise<void> {
    const user = res.locals.user.name;
    try {
      const events = await eventServices.getAllEvents();
      //res.status(200).json({ message: 'List of events', events })

      res.render('event.ejs', { events, user });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  // Get all voucher
  public async getAllVoucher(req: Request, res: Response): Promise<void> {
    try {
      const vouchers = await voucherServices.getAllVoucher();
      res.status(200).json({ message: 'List of vouchers', vouchers });
      logger.info('List of vouchers', { vouchers });
    } catch (error) {
      res.status(500).json(error);
      logger.error('Error', { error });
    }
  }

  // Request Voucher from Event
  public async requestVoucher(req: Request, res: Response): Promise<void> {
    const eventID = req.params.eventID;
    const { email } = req.body;

    try {
      const voucher = await voucherServices.requestVoucher(eventID, email);
      res.status(200).json({ message: 'Create voucher success', voucher });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  // Display Edit Page
  public async getEditModal(req: Request, res: Response): Promise<void> {
    const eventId = req.params.eventID;
    const event = await EventModel.findById(eventId);
    if (!event) {
      res.status(404).send('Event not found');
      return;
    }
    res.json({ event, user: res.locals.user });
  }

  // Check users is editing table or not ?
  public async checkEditable(req: Request, res: Response): Promise<void> {
    try {
      await eventServices.checkEditable(req, res);
    } catch (error) {
      console.error('Error in checkEditableController:', error);
      res.status(500).json({ message: 'Failed to check editability', error });
    }
  }

  // Release currently user is editing table for another user can edit
  public async releaseEditing(req: Request, res: Response): Promise<void> {
    const eventId = req.params.eventID;
    const userId = res.locals.user.id;
    try {
      const released = await eventServices.releaseEditing(eventId, userId);

      if (released) {
        res.status(200).json({ message: 'Released editing successfully.' });
      } else {
        res.status(404).json({ message: 'No editing session found to release.' });
      }
    } catch (error) {
      console.error('Error in releaseEditingController:', error);
      res.status(500).json({ message: 'Failed to release editing.', error });
    }
  }

  // Maintain Editing event
  public async maintainEditing(req: Request, res: Response): Promise<void> {
    const eventId = req.params.eventID;
    const userId = res.locals.user.id;
    try {
      const errorMessage = await eventServices.maintainEditing(eventId, userId);

      if (errorMessage) {
        res.status(409).json({ message: errorMessage });
      } else {
        res.status(200).json({ message: 'Editing status maintained successfully.' });
      }
    } catch (error) {
      console.error('Error in maintainEditingController:', error);
      res.status(500).json({ message: 'Failed to maintain editing status.', error });
    }
  }
}

export default new VoucherController();
