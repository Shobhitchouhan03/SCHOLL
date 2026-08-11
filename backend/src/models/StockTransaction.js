import mongoose from 'mongoose';

const stockTransactionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    consumableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConsumableItem',
      required: true,
      index: true,
    },
    transactionType: {
      type: String,
      enum: ['stock_in', 'stock_out', 'adjustment', 'return'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPriceMinor: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmountMinor: {
      type: Number,
      default: 0,
      min: 0,
    },
    referenceNumber: {
      type: String,
      default: '',
      trim: true,
    },
    purpose: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const StockTransaction = mongoose.model('StockTransaction', stockTransactionSchema);
