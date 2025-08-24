import mongoose from 'mongoose'

const orderAdminModel = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cartItems: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      priceAtPurchase: {
        type: Number,
        required: true,
      }
    }
  ],
  shippingAddress: {
    fullAddress: { type: String, required: true },
    pincode: String,
    city: String,
    state: String,
    country: String,
    phone: String,
  },
  paymentMode: {
    type: String,
    enum: ['COD', 'ONLINE'],
    default: 'COD'
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  transactionId: {
    type: String,
    default: '',
  }
}, {
  timestamps: true
})

export default mongoose.model('Order', orderAdminModel)
