import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.model.js";
import OrderModel from "../models/order.model.js"; // User orders
import AdminOrders from "../models/orderadmin.model.js"; // Admin orders
import AddressModel from "../models/address.model.js";
import CartProductModel from "../models/cartproduct.model.js";
import UserModel from "../models/user.model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// -------------------- CREATE RAZORPAY ORDER --------------------
export async function createOrder(req, res) {
  try {
    const { totalAmt, user_id, addressId, list_items } = req.body;

    if (!totalAmt) {
      return res.status(400).json({ success: false, message: "Amount required" });
    }

    // Create Razorpay order
    const options = {
      amount: totalAmt * 100, // in paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    // Save initial payment record
    await Payment.create({
      user: user_id,
      orderId: order.id,
      amount: totalAmt,
      status: "created",
      address: addressId,
    });

    await CartProductModel.deleteMany({ user_id: userId });
    await UserModel.updateOne({ user_id: userId }, { shopping_cart: [] });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// -------------------- VERIFY PAYMENT & CREATE ORDERS --------------------
export async function verifyPayment(req, res) {
  const user_id = req.user.user_id;
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      list_items,
      totalAmt,
      addressId,
      paymentMode,
    } = req.body;
console.log("reponsee",req.body)
    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // 1️⃣ Update Payment record
    await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: "paid",
      }
    );

    // 2️⃣ Determine next order number for user
    const lastOrder = await OrderModel.find({ user_id }).sort({ order_no: -1 }).limit(1);
    const order_no = lastOrder.length ? lastOrder[0].order_no + 1 : 1;
    const address = await AddressModel.findOne({ address_id: addressId });
    // 3️⃣ Create user order
    const userOrder = await OrderModel.create({
      user_id,
      order_no,
      orderId: `#ORD-${order_no}`,
      items: list_items.map(el => ({
              productId: el.product?.productId || el.productId,
              product_details: {
                name: el.product?.name || el.name,
                image: el.product?.image || el.image || [],
              },
              quantity: el.quantity || 1,
              subTotalAmt: el.subTotalAmt || (el.quantity || 1) * (el.product?.price || 0),
              delivery_date: Date()
            })),
      totalAmt,
      paymentMode,
      payment_status: "Paid",
      status: "Confirmed",
      delivery_address: addressId,
      razorpayOrderId:razorpay_order_id,
      paymentId: razorpay_payment_id,
    });

    // 4️⃣ Create admin order
    const adminItems = list_items.map(item => (
      // console.log("iemssss",item)
      {
      productId: item.product.productId,
      product_details: item.product_details,
      quantity: item.quantity,
      priceAtPurchase: item.product.price,
      priceWithOutDiscount: item.product.totalAmt,
    })
  );

    await AdminOrders.create({
      user_id,
      order_Id: `#ORD-${order_no}`,
      orderItems: adminItems,
      shippingAddress: {
        fullAddress: address.address_line,
        city: address.city,
        state: address.state,
        country: address.country,
        pincode: address.pincode,
        phone: address.mobile,
      },
      paymentMode,
      totalAmount: totalAmt,
      status: "Confirmed",
      paymentStatus: "Paid",
      transactionId: razorpay_payment_id,
    });

    res.json({ success: true,userOrder:userOrder, message: "Payment Verified & Order Created ✅", orderId: `#ORD-${order_no}` });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}



