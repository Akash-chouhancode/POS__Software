const express = require("express");
const router = express.Router();

const reservationController =require("../controllers/reservationController")
  //all unavailability page routs
  router.post('/unavailability', reservationController.createUnavailability);
  router.get('/unavailability',reservationController.getUnavailability);
  router.get('/unavailability/:id',reservationController.getUnavailabilitybyid)
  router.put('/unavailability/:id', reservationController.updateUnavailability);
  router.delete('/unavailability/:id',reservationController.deleteUnavailability);
  // get reservation data
  router.get('/reservation',reservationController.getReservations)
  // delete reservation
  router.delete('/reservation/:id',reservationController.deleteReservation)
  router.get('/tableunbookbyid/:tableid', reservationController.getTableByIdreservation)
  router.get("/reservation/:id",reservationController.getReservationById);
  router.put("/reservationbook/:reserveid",reservationController.updateReservationAndCustomer);
  // create reservation
  router.post("/reservationbook",reservationController.createReservation);
 
  // get all free table for booking
  router.get('/getavailablereservationtables',reservationController.getavailablereservationtables)

  // Reservation setting
  router.put('/setting/:id', reservationController.updatereservationsetting);

module.exports =router