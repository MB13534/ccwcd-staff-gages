const express = require('express');
const {checkAccessToken} = require('../../core/middleware/auth.js');
const {data_staff_gage_readings: model} = require('../../core/models');
const router = express.Router();

// Attach middleware to ensure that user is authenticated & has permissions
router.use(checkAccessToken(process.env.AUTH0_DOMAIN, process.env.AUDIENCE));

router.get('/', (req, res, next) => {
  model
    .findAll()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      next(err);
    });
});

// router.post('/:id', (req, res, next) => {
//   const where = {};
//   where.cuwcd_well_number = req.params.id;
//   model
//     .findAll({where})
//     .then((data) => {
//       res.json(data);
//     })
//     .catch((err) => {
//       next(err);
//     });
// });

router.post('/', (req, res, next) => {
  model
    .create(req.body)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      next(err);
    });
});

router.put('/:id', (req, res, next) => {
  model
    .update(req.body, {
      where: {
        data_ndx: req.params.id,
      },
      returning: true,
    })
    .then((data) => {
      res.json(data[1][0]);
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/:id', (req, res, next) => {
  model
    .destroy({
      where: {
        data_ndx: req.params.id,
      },
      returning: true,
    })
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
