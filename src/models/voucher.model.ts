import mongoose, { Document, Schema } from 'mongoose';

interface IVoucher extends Document {
  voucherID: string;
  eventID: string;
  voucherCode: string;
  issuedAt: Date;
}

const VoucherSchema = new Schema<IVoucher>({
  voucherID: { type: String, required: true, unique: true },
  eventID: { type: String, required: true },
  voucherCode: { type: String, required: true },
  issuedAt: {type: Date, default: Date.now()}
});

const VoucherModel = mongoose.model<IVoucher>("Voucher", VoucherSchema);

export {IVoucher, VoucherModel}
