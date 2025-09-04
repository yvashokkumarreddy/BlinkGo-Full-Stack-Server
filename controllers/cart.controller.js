import CartModel from "../models/cartproduct.model.js";
import ProductModel from "../models/product.model.js";
import CounterModel from "../models/CounterModel.js"; // for auto-increment cartItemId


// Add item to cart
export const addToCartItemController = async (req, res) => {
  try {
    const { user_id, cartId, productId } = req.body;

    if (!user_id || !cartId || !productId) {
      return res.status(400).json({
        success: false,
        message: "user_id, cartId and productId are required",
      });
    }

    // ✅ Get product details (for price)
    const product = await ProductModel.findOne({ productId });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // ✅ Find cart by cartId + user_id (double check ownership)
    let cart = await CartModel.findOne({ user_id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found for this user" });
    }

    // ✅ Find max cartItemId inside this cart
    const maxCartItemId = cart.items.length > 0
      ? Math.max(...cart.items.map((i) => i.cartItemId))
      : 0;

    // ✅ Check if product already exists in cart
    const existingItem = cart.items.find((i) => i.productId === productId);

    if (existingItem) {
      existingItem.quantity += 1; // increase qty if already in cart
    } else {
      cart.items.push({
        cartItemId: maxCartItemId + 1,
        productId,
        price: product.price,  // required
        quantity: 1,
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
      message: error.message || "Internal Server Error",
    });
  }
};





// GET CART ITEMS
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

    // Fetch the user's cart
    const cart = await CartModel.findOne({ user_id: userId });
    if (!cart || cart.items.length === 0) {
      return res.json({
        success: true,
        error: false,
        data: [],
      });
    }

    // Fetch products in parallel
    const itemsWithProductDetails = await Promise.all(
      cart.items.map(async (item) => {
        const product = await ProductModel.findOne({ productId: item.productId }).lean();

        return {
          cartItemId: item.cartItemId,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          product: product || null, // renamed to `product` for clarity
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



// ------------------- UPDATE CART ITEM QUANTITY -------------------
export const updateCartItemQtyController = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const { cartItemId, quantity } = req.body;

    if (!cartItemId || typeof quantity !== "number") {
      return res.status(400).json({ success: false, message: "cartItemId and quantity are required" });
    }

    // Find the user's cart
    const cart = await CartModel.findOne({ user_id: userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    // Find the item inside the cart
    const itemIndex = cart.items.findIndex(i => i.cartItemId === cartItemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
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



// ------------------- DELETE CART ITEM -------------------
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

    // Remove item
    cart.items = cart.items.filter((i) => i.cartItemId !== cartItemIdNum);

    // ✅ Reset numbering if cart becomes empty
    if (cart.items.length === 0) {
      cart.items = []; // clear cart fully, so next add starts from 1
    }

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

