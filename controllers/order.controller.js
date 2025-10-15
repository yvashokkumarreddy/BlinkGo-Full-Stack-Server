import Stripe from "../config/stripe.js";
import AddressModel from "../models/address.model.js";
import CartProductModel from "../models/cartproduct.model.js";
import CounterModel from "../models/CounterModel.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import ShippingLabel from "../models/ShippingLabel.model.js";
import mongoose from "mongoose";
import ProductModel from "../models/product.model.js"
import AdminOrderModel from "../models/orderadmin.model.js";
import ShippingLabelModel from "../models/ShippingLabel.model.js";
export async function CashOnDeliveryOrderController(req, res) {
  try {
    const userId = req.user.user_id;
    const { list_items, totalAmt, address_id, subTotalAmt } = req.body;

    // 1️⃣ Generate order number
    // const counter = await CounterModel.findOneAndUpdate(
    //   { id: "order_no" },
    //   { $inc: { seq: 1 } },
    //   { new: true, upsert: true }
    // );

    const order_no = await getNextOrderNo();
    const orderId = `#ORD-${order_no}`;
    const order_Id = `#ORD-${order_no}`

    // 2️⃣ Create user order
    const userOrderData = {
      user_id: userId,
      order_no,
      orderId,
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
      paymentId: "",
      paymentMode: "COD",
      payment_status: "Pending",
      status: "Pending", // ✅ Must be string
      delivery_address: address_id,
      totalAmt,
    };

    const generatedOrder = await OrderModel.create(userOrderData);

    // 3️⃣ Get delivery address
    const address = await AddressModel.findOne({ address_id });
    if (!address) {
      return res.status(400).json({ success: false, error: true, message: "Address not found" });
    }

    // 4️⃣ Prepare admin order
    const adminItems = list_items.map(el => ({
      productId: el.product?.productId || el.productId,
      quantity: el.quantity || 1,
      priceAtPurchase: (el.product?.price || el.price) - (el.discount || 0),
      priceWithOutDiscount: el.product?.price || el.price || 0,
      product_details: {
        name: el.product?.name || el.name,
        image: el.product?.image || el.image || [],
      },
    }));

    const adminOrder = await AdminOrderModel.create({
      user_id: userId,
      order_Id,
      orderItems: adminItems,
      shippingAddress: {
        fullAddress: address.address_line,
        city: address.city,
        state: address.state,
        country: address.country,
        pincode: address.pincode,
        phone: address.mobile,
      },
      paymentMode: "COD",
      totalAmount: totalAmt,
      paymentStatus: "Pending",
      status: "Pending", // ✅ Must be string
    });

    // 5️⃣ Cleanup cart
    await CartProductModel.deleteMany({ user_id: userId });
    await UserModel.updateOne({ user_id: userId }, { shopping_cart: [] });

    return res.json({
      success: true,
      error: false,
      data: generatedOrder,
      address: address_id,
    });
  } catch (error) {
    console.error("COD Order Error:", error);
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}





// export async function CashOnDeliveryOrderController(req, res) {
//   try {
//     const userId = req.user.user_id; // numeric user ID
//     const { list_items, totalAmt, address_id, subTotalAmt } = req.body;

//     // Fetch full address
//     const address = await AddressModel.findOne({ address_id });
//     if (!address) {
//       return res.status(400).json({ success: false, error: true, message: "Address not found" });
//     }

//     // Generate unique order number
//     const counter = await CounterModel.findOneAndUpdate(
//       { id: "order_no" },
//       { $inc: { seq: 1 } },
//       { new: true, upsert: true }
//     );
//     const order_no = counter.seq + 100;
//     const orderId = `#ORD-${order_no}`;

//     // ===== User Order =====
//     const userItems = list_items.map(el => ({
//       productId: el.product.productId, // numeric
//       product_details: {
//         name: el.product.name,
//         image: el.product.image,
//       },
//       quantity: el.quantity || 1,
//       subTotalAmt: el.price - (el.discount || 0),
//     }));

//     const userOrder = await OrderModel.create({
//       user_id: userId,
//       order_no,
//       orderId,
//       items: userItems,
//       paymentId: "",
//       payment_status: "CASH ON DELIVERY",
//       delivery_address: {
//         address_line: address.address_line,
//         city: address.city,
//         state: address.state,
//         country: address.country,
//         pincode: address.pincode,
//         mobile: address.mobile,
//       },
//       subTotalAmt,
//       totalAmt,
//     });

//     // ===== Admin Order =====
//     const adminItems = list_items.map(el => ({
//       productId: el.product.productId, // numeric
//       quantity: el.quantity || 1,
//       priceAtPurchase: el.price - (el.discount || 0),
//     }));

//     // const adminOrder = await AdminOrderModel.create({
//     //   user_id: userId,
//     //   orderId: orderId, // numeric
//     //   cartItems: adminItems,
//     //   shippingAddress: {
//     //     fullAddress: address.address_line,
//     //     city: address.city,
//     //     state: address.state,
//     //     country: address.country,
//     //     pincode: address.pincode,
//     //     phone: address.mobile,
//     //   },
//     //   paymentMode: "COD",
//     //   totalAmount: totalAmt,
//     //   paymentStatus: "Pending",
//     //   status: "Pending",
//     // });

//     // Clear cart
//     await CartProductModel.deleteMany({ user_id: userId });
//     await UserModel.updateOne({ user_id: userId }, { shopping_cart: [] });

//     return res.json({
//       success: true,
//       error: false,
//       message: "Order placed successfully",
//       userOrder,
//       adminOrder
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, error: true, message: error.message || error });
//   }
// }

export const pricewithDiscount = (price,dis = 1)=>{
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
    const actualPrice = Number(price) - Number(discountAmout)
    return actualPrice
}

export async function paymentController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        const user = await UserModel.findById(userId)

        const line_items  = list_items.map(item =>{
            return{
               price_data : {
                    currency : 'inr',
                    product_data : {
                        name : item.productId.name,
                        images : item.productId.image,
                        metadata : {
                            productId : item.product.productId
                        }
                    },
                    unit_amount : pricewithDiscount(item.productId.price,item.productId.discount) * 100   
               },
               adjustable_quantity : {
                    enabled : true,
                    minimum : 1
               },
               quantity : item.quantity 
            }
        })

        const params = {
            submit_type : 'pay',
            mode : 'payment',
            payment_method_types : ['card'],
            customer_email : user.email,
            metadata : {
                userId : userId,
                addressId : addressId
            },
            line_items : line_items,
            success_url : `${process.env.FRONTEND_URL}/success`,
            cancel_url : `${process.env.FRONTEND_URL}/cancel`
        }

        const session = await Stripe.checkout.sessions.create(params)

        return response.status(200).json(session)

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
const getOrderProductItems = async({
    lineItems,
    userId,
    addressId,
    paymentId,
    payment_status,
 })=>{
    const productList = []

    if(lineItems?.data?.length){
        for(const item of lineItems.data){
            const product = await Stripe.products.retrieve(item.price.product)

            const paylod = {
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : product.metadata.productId, 
                product_details : {
                    name : product.name,
                    image : product.images
                } ,
                paymentId : paymentId,
                payment_status : payment_status,
                delivery_address : addressId,
                subTotalAmt  : Number(item.amount_total / 100),
                totalAmt  :  Number(item.amount_total / 100),
            }

            productList.push(paylod)
        }
    }

    return productList
}

//http://localhost:8080/api/order/webhook
export async function webhookStripe(request,response){
    const event = request.body;
    const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY

    console.log("event",event)

    // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const lineItems = await Stripe.checkout.sessions.listLineItems(session.id)
      const userId = session.metadata.userId
      const orderProduct = await getOrderProductItems(
        {
            lineItems : lineItems,
            userId : userId,
            addressId : session.metadata.addressId,
            paymentId  : session.payment_intent,
            payment_status : session.payment_status,
        })
    
      const order = await OrderModel.insertMany(orderProduct)

        console.log(order)
        if(Boolean(order[0])){
            const removeCartItems = await  UserModel.findByIdAndUpdate(userId,{
                shopping_cart : []
            })
            const removeCartProductDB = await CartProductModel.deleteMany({ userId : userId})
        }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
}


export async function getOrderDetailsController(req, res) {
  try {
    const userId = req.user.user_id;

    // 1. Fetch only this user's orders
    const orders = await OrderModel.find({ user_id: userId }).lean();

    if (!orders.length) {
      return res.json({ success: true, data: [] });
    }

    // 2. Collect address_ids from only this user’s orders
    const addressIds = [...new Set(orders.map(o => o.delivery_address))];

    // 3. Fetch address details for those ids
    const addresses = await AddressModel.find({
      address_id: { $in: addressIds }
    }).lean();

    // 4. Build a lookup map
    const addressMap = {};
    addresses.forEach(addr => {
      addressMap[addr.address_id] = addr;
    });

    // 5. Attach full address to each order
    const ordersWithAddress = orders.map(order => ({
      ...order,
      delivery_address: addressMap[order.delivery_address] || null
    }));

    return res.json({
      success: true,
      data: ordersWithAddress
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteOrder(req,res,next) {
    const userId = req.user.user_id
    const {order_id} = req.body
    // console.log("ashok",req.body)
try{
    const order = OrderModel.findOne({orderId:order_id,user_id: userId})
  const admin = AdminOrderModel.findOne({order_Id: order_id})
    if(!order){
        res.status(400).json({status: 5, message: "order no not found"})
    }
    // console.log("order_id",order_id)
    await OrderModel.deleteOne({orderId:order_id})
    await AdminOrderModel.deleteOne({order_Id: order_id})
    res.status(200).json({status: 1, data:[{"order_deleted": order_id}]})
  } catch(error){
    console.log(error)
    next()
  }
}

export async function getAllOrdersController(req, res, next){
  try {
    const orders = await AdminOrderModel.find().lean().sort({createdAt: -1});

    // const normalized = orders.map(order => ({
    //   orderId: order._id, // admin doesn’t have orderId, fallback to _id
    //   cartItems: order.cartItems || [],
    //   shippingAddress: order.shippingAddress || null,
    //   paymentStatus: order.paymentStatus,
    //   status: order.status,
    //   totalAmount: order.totalAmount,
    //   createdAt: order.createdAt,
    // }));

    return res.json({ success: true, orders: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function reserveItems(req,res,next){
  try {
    const { orderId, items } = req.body; // orderId + reserved items

    // Update stock for each product
    for (let item of items) {
      const product = await ProductModel.findById(item.productId); // or findByPk if Sequelize
      if (product) {
        product.stock = product.stock - item.reserved;
        await product.save();
      }
    }

    // Optionally update reserved qty in the order
    // const updatedOrder = await Order.findById(orderId).populate("products");
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error reserving items:", error);
    next(error)
    res.status(500).json({ message: "Failed to reserve items" });
  }
}


export const getOrderById = async (req, res) => {
  try {
    const { orderId ,userId} = req.body;
console.log("order",userId)
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }
    const deliverydateship= await ShippingLabelModel.findOne({orderId:orderId})
    console.log("deliverydateship",deliverydateship)
  const user = await UserModel.findOne({user_id: userId})
    // Fetch order and populate both user and product details
    const order = await AdminOrderModel.findOne({order_Id:orderId})
      // .populate("orderItems.productId"); // fetch complete product document
const orderItemsWithDetails = await Promise.all(
      order.orderItems.map(async (item) => {
        const product = await ProductModel.findOne({productId: item.productId}).lean();
        
        return {
          ...item,
          product
        };
      })
    );
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Send the full populated document
    res.json({
      success: true,
      order,
      user,
      shippingLabelDetails: deliverydateship,
      product_details: orderItemsWithDetails
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching order",
    });
  }
};


export async function updateOrderStatus(req, res) {
  try {
    const { orderId, status,paymentId, deliveryDate } = req.body;
    console.log("updateOrderStatus payload:", req.body);

    // Find order by custom field orderId / order_Id
    const order = await OrderModel.findOne({ orderId: orderId }); 
    const adminOrder = await AdminOrderModel.findOne({ order_Id: orderId });

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!adminOrder) return res.status(404).json({ message: "Admin order not found" });

    // Update fields
    order.status = status;
    order.paymentId = paymentId
    order.deliveryDate = deliveryDate || new Date();

    adminOrder.status = status;
    adminOrder.paymentId = paymentId
    adminOrder.deliveryDate = deliveryDate || new Date();

    await order.save();
    await adminOrder.save();

    res.status(200).json({ message: "Order status updated", order, adminOrder });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}





export async function createShippingLabel(req, res) {
  try {
    const {
      orderId,
      carrierService,
      serviceType,
      packageName,
      packageType,
      weight,
      dimensions,
      subtotal,
      total,
      trackingNumber,
      returnAddress,
      deliveryDate,
      products,
    } = req.body;

    // Check if a label already exists
    const existing = await ShippingLabel.findOne({ orderId });
    if (existing) {
      return res.status(400).json({
        message: "Shipping label already exists for this order",
        shippingLabel: existing
      });
    }

    // Create new shipping label
    const label = new ShippingLabel({
      orderId,
      carrierService,
      serviceType,
      packageName,
      packageType,
      weight,
      dimensions,
      subtotal,
      total,
      trackingNumber,
      returnAddress,
      deliveryDate,
      shippingDate: new Date(),
      product: products || [],
    });

    // Update Order Status
    await OrderModel.findOneAndUpdate(
      { orderId },
      { status: "Shipped", deliveryDate: deliveryDate || new Date() },
      { new: true }
    );

    await AdminOrderModel.findOneAndUpdate(
      { order_Id: orderId },
      { status: "Shipped", deliveryDate: deliveryDate || new Date() },
      { new: true }
    );

    await label.save();

    res.status(201).json({
      message: "Shipping label created successfully",
      shippingLabel: label,
    });
  } catch (err) {
    console.error("Error creating shipping label:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}





export async function getShippingLabelByOrderId(req, res) {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    const label = await ShippingLabel.findOne({ orderId });
    const order_details = await AdminOrderModel.findOne({order_Id:orderId})

    if (!label) {
      return res.status(404).json({ message: "Shipping label not found" });
    }

    res.json({status:1,data:label,order_details});
  } catch (err) {
    console.error("Error fetching shipping label:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}




// Generate unique order_no per user
async function getNextOrderNo() {
  const lastOrder = await OrderModel.findOne().sort({ order_no: -1 });
  return lastOrder ? lastOrder.order_no + 1 : 1;
}

export const createOnlineOrder = async (req, res) => {
  try {
    const { user_id, list_items, addressId, totalAmt, paymentMode } = req.body;

    if (!user_id || !list_items || list_items.length === 0 || !addressId || !totalAmt) {
      return res.status(400).json({ success: false, message: "Invalid order data" });
    }

    // 1️⃣ Generate unique order number
    const order_no = await getNextOrderNo(user_id);
    const orderId = `#ORD-${order_no}`;

    // 2️⃣ Prepare items for user order
    const userItems = list_items.map((item) => ({
      productId: item.productId,
      product_details: {
        name: item.name,
        image: item.image,
      },
      quantity: item.quantity,
      price: item.price,
      subTotalAmt: item.price * item.quantity,
      discount: item.discount || 0,
      order_date: new Date(),
    }));

    // 3️⃣ Save to User Orders
    const userOrder = await UserOrderModel.create({
      user_id,
      order_no,
      orderId,
      items: userItems,
      paymentMode,
      payment_status: "Paid",
      status: "Pending",
      delivery_address: addressId,
      totalAmt,
    });

    // 4️⃣ Prepare items for Admin Orders
    const adminItems = list_items.map((item) => ({
      productId: item.productId,
      product_details: {
        name: item.name,
        image: item.image,
      },
      quantity: item.quantity,
      priceAtPurchase: item.price,
      priceWithOutDiscount: item.price, // adjust if you have discount
    }));

    // 5️⃣ Save to Admin Orders
    await AdminOrderModel.create({
      user_id,
      order_Id: orderId,
      orderItems: adminItems,
      shippingAddress: addressId, // make sure your address schema matches
      totalAmount: totalAmt,
      paymentMode,
      paymentStatus: "Paid",
      status: "Pending",
    });

    res.json({ success: true, message: "Order placed successfully", orderId });
  } catch (err) {
    console.error("Create online order error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
