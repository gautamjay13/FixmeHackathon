const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

const generateInvoicePDF = async (invoice, user, worker) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `${invoice.invoiceNumber}.pdf`;
      const uploadsDir = path.join(__dirname, '../../../uploads');
      
      // Ensure uploads dir exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const filePath = path.join(uploadsDir, fileName);
      const writeStream = fs.createWriteStream(filePath);
      
      doc.pipe(writeStream);

      // Header
      doc.fillColor('#444444')
         .fontSize(20)
         .text('FixNow', 50, 57)
         .fontSize(10)
         .text('FixNow Home Services', 200, 50, { align: 'right' })
         .text('123 Service Road, Tech Park', 200, 65, { align: 'right' })
         .text('Bangalore, India 560001', 200, 80, { align: 'right' })
         .moveDown();

      // Horizontal line
      doc.moveTo(50, 110).lineTo(550, 110).stroke();

      // Invoice info
      doc.fontSize(14).fillColor('#000000').text('INVOICE', 50, 130);
      doc.fontSize(10)
         .text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 150)
         .text(`Date: ${new Date(invoice.issuedAt).toLocaleDateString()}`, 50, 165)
         .text(`Status: ${invoice.paymentStatus.toUpperCase()}`, 50, 180)
         .moveDown();

      // Customer and Worker Details
      doc.text('Bill To:', 50, 210)
         .font('Helvetica-Bold')
         .text(user.name, 50, 225)
         .font('Helvetica')
         .text(user.phone, 50, 240)
         .text(user.email, 50, 255);

      doc.text('Service By:', 300, 210)
         .font('Helvetica-Bold')
         .text(worker.userId.name || 'Worker', 300, 225) // Assuming worker populated with userId
         .font('Helvetica')
         .text(`Service: ${worker.skills.join(', ')}`, 300, 240);

      doc.moveTo(50, 280).lineTo(550, 280).stroke();

      // Table Header
      let y = 300;
      doc.font('Helvetica-Bold')
         .text('Description', 50, y)
         .text('Qty', 300, y, { width: 50, align: 'right' })
         .text('Unit Price', 380, y, { width: 80, align: 'right' })
         .text('Total', 470, y, { width: 80, align: 'right' });

      doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
      doc.font('Helvetica');
      y += 25;

      // Table Items
      invoice.items.forEach(item => {
        doc.text(item.description, 50, y)
           .text(item.quantity.toString(), 300, y, { width: 50, align: 'right' })
           .text(item.unitPrice.toString(), 380, y, { width: 80, align: 'right' })
           .text(item.total.toString(), 470, y, { width: 80, align: 'right' });
        y += 20;
      });

      doc.moveTo(50, y + 10).lineTo(550, y + 10).stroke();
      y += 25;

      // Totals
      doc.font('Helvetica-Bold')
         .text('Subtotal:', 380, y, { width: 80, align: 'right' })
         .text(`${invoice.subtotal}`, 470, y, { width: 80, align: 'right' });
      y += 20;

      doc.font('Helvetica')
         .text(`Tax (${invoice.taxRate}%):`, 380, y, { width: 80, align: 'right' })
         .text(`${invoice.taxAmount}`, 470, y, { width: 80, align: 'right' });
      y += 20;
      
      if (invoice.discount > 0) {
        doc.text('Discount:', 380, y, { width: 80, align: 'right' })
           .text(`-${invoice.discount}`, 470, y, { width: 80, align: 'right' });
        y += 20;
      }

      doc.font('Helvetica-Bold')
         .fontSize(12)
         .text('Grand Total:', 380, y, { width: 80, align: 'right' })
         .text(`${invoice.currency} ${invoice.grandTotal}`, 470, y, { width: 80, align: 'right' });

      // Footer
      doc.fontSize(10)
         .font('Helvetica')
         .text('Thank you for choosing FixNow!', 50, 700, { align: 'center', width: 500 })
         .text('For any support, please contact support@fixnow.in', 50, 715, { align: 'center', width: 500 });

      doc.end();

      writeStream.on('finish', async () => {
        try {
          // Upload to cloudinary
          const result = await cloudinary.uploader.upload(filePath, {
            folder: 'fixnow_invoices',
            resource_type: 'raw', // for PDF
            public_id: invoice.invoiceNumber
          });

          // Delete local file
          fs.unlinkSync(filePath);

          resolve({ url: result.secure_url, publicId: result.public_id });
        } catch (uploadError) {
          reject(uploadError);
        }
      });

      writeStream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoicePDF };
