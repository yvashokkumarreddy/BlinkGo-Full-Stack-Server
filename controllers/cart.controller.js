import CartModel from "../models/cartproduct.model.js";
import ProductModel from "../models/product.model.js";
import CounterModel from "../models/counterModel.js";

export const addToCartItemController = async (req, res) => {
  try {
    const { user_id, cartId, productId } = req.body;

    if (!user_id || !cartId || !productId) {
      return res.status(400).json({
        success: false,
        message: "user_id, cartId and productId are required",
      });
    }

    // Always define `cart` with let/const
    let cart = await CartModel.findOne({ cartId, user_id });
    if (!cart) {
      cart = new CartModel({
        cartId,
        user_id,
        items: [],
      });
    }

    const product = await ProductModel.findOne({ productId });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // ✅ Check if product already in cart
    const existingItem = cart.items.find((item) => item.productId === productId);

    if (existingItem) {
      // increment quantity if already exists
      existingItem.quantity += 1;
    } else {
      // find next cartItemId safely
      const counter = await CounterModel.findOneAndUpdate(
  { id: "cartItemId" },
  { $inc: { seq: 1 } },
  { new: true, upsert: true }
);

      cart.items.push({
        cartItemId: counter.seq,
        productId: product.productId,
        quantity: 1,
        price: product.price,
        discount: product.discount || null,
      });
    }

    await cart.save();

    return res.json({
      success: true,
      message: "Product added to cart",
      data: cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const getCartItemController = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Unauthorized",
      });
    }

    const cart = await CartModel.findOne({ user_id: userId });
    if (!cart || cart.items.length === 0) {
      return res.json({
        success: true,
        error: false,
        data: [],
      });
    }
    // console.log("cart====>",cart)

    const itemsWithProductDetails = await Promise.all(
      cart.items.map(async (item) => {
        const product = await ProductModel.findOne({ productId: item.productId }).lean();
        return {
          cartItemId: item.cartItemId,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          product: product || null,
        };
      })
    );

    return res.json({
      success: true,
      error: false,
      data: itemsWithProductDetails,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Something went wrong",
    });
  }
};

export const updateCartItemQtyController = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const { cartItemId, quantity } = req.body;
    // console.log("reg__Body",req.body)
    if (cartItemId === undefined || quantity === undefined) {
      return res.status(400).json({ success: false, message: "cartItemId and quantity are required ok naaa" });
    }

    const cart = await CartModel.findOne({ user_id: userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const itemIndex = cart. items.findIndex((i) => i.cartItemId === Number(cartItemId));
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    cart.items[itemIndex].quantity = Number(quantity);
    await cart.save();

    return res.json({
      success: true,
      message: "Quantity updated successfully",
      data: cart.items[itemIndex],
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteCartItemQtyController = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const { cartItemId } = req.body;

    if (!cartItemId) {
      return res.status(400).json({ success: false, message: "cartItemId is required" });
    }

    const cart = await CartModel.findOne({ user_id: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const cartItemIdNum = Number(cartItemId);
    const existingItem = cart.items.find((i) => i.cartItemId === cartItemIdNum);

    if (!existingItem) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    cart.items = cart.items.filter((i) => i.cartItemId !== cartItemIdNum);
    await cart.save();

    return res.json({
      success: true,
      message: "Cart item deleted",
      data: { cartItemId: cartItemIdNum },
    });
  } catch (error) {
    console.error("Delete cart item error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

