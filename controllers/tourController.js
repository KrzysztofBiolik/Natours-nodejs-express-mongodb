const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apifeatures');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    console.log('1', Tour.find(), '2', req.query);
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // EXECUTE QUERY
    const tours = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours: tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Failes',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    //wpisujemy id bo w tourRoutes ustaliliśmy route(/:id)
    const tour = await Tour.findById(req.params.id);
    //Tour.findOne({_id: req.params.id})
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Failes',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  // const newTour = new Tour({})
  //newTour.save()
  //można to zapisać prościej
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'sucess',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updateTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      // zwraca uwagę na użytą walidację
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour: updateTour,
      },
    });
  } catch (err) {}
};
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    const tours = await Tour.find();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

