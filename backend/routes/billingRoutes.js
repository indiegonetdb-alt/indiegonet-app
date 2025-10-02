const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');

function rupiah(n){
  n = Math.round(n || 0);
  return 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

router.get('/:id/invoice.pdf', requireAuth, async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id)
      .populate('customerId','name type percent monthlyAmount');
    if (!bill) return res.status(404).json({ msg: 'Tagihan tidak ditemukan' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${bill._id}.pdf"`);

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    doc.pipe(res);

    doc.fontSize(16).text('INVOICE PENAGIHAN', { align: 'center' });
    doc.moveDown(0.5).fontSize(10).text(`Dicetak: ${dayjs().format('YYYY-MM-DD HH:mm')}`, { align: 'center' }).moveDown(1);
    doc.fontSize(12).text('Indiegonet').fontSize(10).text('Manajemen Pelanggan & Penagihan').moveDown(1);
    doc.fontSize(11).text(`Pelanggan: ${bill.customerId?.name || '-'}`);
    doc.text(`Jenis: ${bill.customerId?.type || '-'}`);
    doc.text(`Periode: ${dayjs(bill.startDate).format('YYYY-MM-DD')} s/d ${dayjs(bill.endDate).format('YYYY-MM-DD')}`).moveDown(1);

    if (bill.customerId?.type === 'toko') {
      const total2000 = bill.totalVoucher2000 || 0;
      const total5000 = bill.totalVoucher5000 || 0;
      const sisa2000 = bill.remaining2000 || 0;
      const sisa5000 = bill.remaining5000 || 0;
      const terpakai2000 = Math.max(total2000 - sisa2000, 0);
      const terpakai5000 = Math.max(total5000 - sisa5000, 0);
      const hasil2000 = terpakai2000 * 2000;
      const hasil5000 = terpakai5000 * 5000;
      const persen = (bill.percent>1) ? bill.percent/100 : (bill.percent||0);
      const totalHasil = hasil2000 + hasil5000;
      const penerimaanToko = Math.round(totalHasil * persen);
      const setoran = Math.max(Math.round(totalHasil - penerimaanToko), 0);

      doc.fontSize(12).text('Rincian Toko', { underline: true }).moveDown(0.5);
      doc.fontSize(10)
        .text(`Vocer 2.000 - Total: ${total2000}  |  Sisa: ${sisa2000}  |  Terpakai: ${terpakai2000}  |  Hasil: ${rupiah(hasil2000)}`)
        .text(`Vocer 5.000 - Total: ${total5000}  |  Sisa: ${sisa5000}  |  Terpakai: ${terpakai5000}  |  Hasil: ${rupiah(hasil5000)}`)
        .moveDown(0.5)
        .text(`Persenan Toko: ${(persen*100).toFixed(2)}%`)
        .text(`Penerimaan Toko: ${rupiah(penerimaanToko)}`)
        .text(`Setoran: ${rupiah(setoran)}`);
      doc.moveDown(1).fontSize(12).text('Ringkasan', { underline: true });
      doc.fontSize(11).text(`Total Hasil: ${rupiah(totalHasil)}`);
      doc.fontSize(11).text(`Setoran yang Harus Dibayar: ${rupiah(setoran)}`);
    } else {
      const jumlah = bill.setoran || bill.customerId?.monthlyAmount || 0;
      doc.fontSize(12).text('Rincian Bulanan', { underline: true }).moveDown(0.5);
      doc.fontSize(11).text(`Jumlah Pembayaran Bulanan: ${rupiah(jumlah)}`);
      doc.moveDown(1).fontSize(12).text('Ringkasan', { underline: true });
      doc.fontSize(11).text(`Setoran yang Harus Dibayar: ${rupiah(jumlah)}`);
    }

    doc.moveDown(2).fontSize(10).text('Catatan: Simpan invoice ini sebagai bukti penagihan.', { italics: true });
    doc.end();
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});
