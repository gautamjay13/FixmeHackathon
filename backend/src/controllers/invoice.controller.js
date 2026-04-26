const Invoice = require('../models/Invoice.model');
const { generateInvoicePDF } = require('../utils/generateInvoicePDF');
const { sendResponse, ApiError } = require('../utils/apiResponse');

exports.getInvoiceByBooking = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ bookingId: req.params.bookingId })
      .populate('userId', 'name email phone address')
      .populate('workerId');

    if (!invoice) throw new ApiError(404, 'Invoice not found', 'NOT_FOUND');

    sendResponse(res, 200, 'Invoice fetched', { invoice });
  } catch (error) {
    next(error);
  }
};

exports.generatePDF = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ bookingId: req.params.bookingId })
      .populate('userId', 'name email phone address')
      .populate({
        path: 'workerId',
        populate: { path: 'userId', select: 'name phone email' }
      });

    if (!invoice) throw new ApiError(404, 'Invoice not found', 'NOT_FOUND');

    if (!invoice.pdfUrl) {
      const pdfData = await generateInvoicePDF(invoice, invoice.userId, invoice.workerId);
      invoice.pdfUrl = pdfData.url;
      invoice.pdfPublicId = pdfData.publicId;
      await invoice.save();
    }

    sendResponse(res, 200, 'PDF generated', { pdfUrl: invoice.pdfUrl });
  } catch (error) {
    next(error);
  }
};

exports.getMyInvoices = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const invoices = await Invoice.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Invoice.countDocuments({ userId: req.user.id });

    sendResponse(res, 200, 'Invoices fetched', invoices, {
      page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};
