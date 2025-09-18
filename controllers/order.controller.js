import Stripe from "../config/stripe.js";
import AddressModel from "../models/address.model.js";
import CartProductModel from "../models/cartproduct.model.js";
import CounterModel from "../models/CounterModel.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
// import  AdminOrders from "../models/orderadmin.model.js"
import mongoose from "mongoose";
import ProductModel from "../models/product.model.js"
import AdminOrderModel from "../models/orderadmin.model.js";
export async function CashOnDeliveryOrderController(request, response) {
  try {
    const userId = request.user.user_id;
    const { list_items, totalAmt, address_id, subTotalAmt } = request.body;

    console.log("order items list : -", list_items);

    const counter = await CounterModel.findOneAndUpdate(
      { id: "order_no" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const order_id = counter.seq + 100
    const orderData = {
      user_id : userId,
      order_no: order_id,
      orderId : `#ORD-${order_id}`,
      items : list_items.map((el) => ({
        productId: el.product?.productId || el.productId, // support both shapes
        product_details: {
          name: el.product?.name || el.name,
          image: el.product?.image || el.image || [],
        },
        quantity: el.quantity || 1,
        subTotalAmt: el.subTotalAmt || (el.quantity || 1) * (el.product?.price || 0),
      })),
      paymentId: "",
      payment_status: "CASH ON DELIVERY",
      delivery_address: address_id,
      totalAmt: totalAmt,
    };

    const generatedOrder = await OrderModel.create(orderData);
    const address = await AddressModel.findOne({ address_id });
    if (!address) {
      return res.status(400).json({ success: false, error: true, message: "Address not found" });
    }
    const adminItems = list_items.map(el => ({
      productId: el.product.productId, // numeric
      quantity: el.quantity || 1,
      priceAtPurchase: el.price - (el.discount || 0),
      priceWithOutDiscount:el.price,
      product_details: {
          name: el.product?.name || el.name,
          image: el.product?.image || el.image || [],
        },
    }));

    const adminOrder = await AdminOrderModel.create({
      user_id: userId,
      order_Id: `#ORD-${order_id}`, // numeric
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
      status: "Pending",
    });
    // cleanup cart after placing order
    await CartProductModel.deleteMany({ user_id: userId });
    await UserModel.updateOne({ user_id: userId }, { shopping_cart: [] });

    return response.json({
      success: true,
      error: false,
      data: generatedOrder,
      address: address_id,
    });
  } catch (error) {
    return response.status(500).json({
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
    const {order_no} = req.body
try{
    const order = OrderModel.findOne({order_no,user_id: userId})

    if(!order){
        res.status(400).json({status: 5, message: "order no not found"})
    }
    await OrderModel.deleteOne({order_no})
    res.status(200).json({status: 1, data:[{"order_deleted": order_no}]})
  } catch(error){
    console.log(error)
    next()
  }
}

export async function getAllOrdersController(req, res, next){
  try {
    const orders = await AdminOrderModel.find().lean();

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