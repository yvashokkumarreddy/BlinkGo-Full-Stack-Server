import mongoose from 'mongoose'

const orderAdminModel = new mongoose.Schema({
  user_id: {
    type: Number,
    ref: 'Customers',
    required: true,
  },
  order_Id: {
      type: String,
      required: true,
    },
  orderItems: [
    {
      productId: {
        type: Number,
        ref: 'Product',
      },
      product_details: {
      name: String,
      image: Array,
    },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      priceAtPurchase: {
        type: Number,
        required: true,
      },
      priceWithOutDiscount: {
        type: Number,
        required: true
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
    enum: ["Pending", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
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

export default mongoose.model('AdminOrders', orderAdminModel)
