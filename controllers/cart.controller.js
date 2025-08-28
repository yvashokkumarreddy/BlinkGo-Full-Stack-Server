import CartProductModel from "../models/cartproduct.model.js";
import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";

// ------------------- ADD TO CART -------------------
export const addToCartItemController = async (req, res) => {
  try {
    const userId = req.user?.user_id; // from auth
    const { productId, quentity, price } = req.body;

    if (!productId || !cartId) {
      return res.status(400).json({
        message: "Provide both productId and cartId",
        error: true,
        success: false,
      });
    }

    // ✅ Find the user
    const user = await UserModel.findOne({ user_id: userId });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    // ✅ Check if the product already exists in the cart
    const existingCartItem = await CartProductModel.findOne({ cartId, productId });
    if (existingCartItem) {
      return res.status(400).json({
        message: "Item already in cart",
        error: true,
        success: false,
      });
    }

    // ✅ Create new CartProduct
    const cartItem = new CartProductModel({
      cartId,
      productId,
      user_id: userId,
      quantity: 1,
    });

    await cartItem.save();

    // ✅ Optionally, push cartItemId to user's shopping_cart array
    if (!user.shopping_cart.includes(cartItem.cartItemId)) {
      user.shopping_cart.push(cartItem.cartItemId);
      await user.save();
    }

    return res.json({
      data: cartItem,
      message: "Item added successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
};





// ------------------- GET CART ITEMS -------------------
export const getCartItemController = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Unauthorized: user not found", error: true, success: false });

    // Populate product details
    const cartItems = await CartProductModel.find({ user_id: userId }).populate("productId");

    return res.json({ data: cartItems, error: false, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
};

// ------------------- UPDATE CART ITEM QUANTITY -------------------
export const updateCartItemQtyController = async (req, res) => {
  try {
    const { cartItemId, quantity } = req.body;
    if (!cartItemId || quantity == null) {
      return res.status(400).json({ success: false, message: "cartItemId and quantity are required" });
    }

    const cartItem = await CartProductModel.findOne({ _id: cartItemId });
    if (!cartItem) return res.status(404).json({ success: false, message: "Cart item not found" });

    cartItem.quantity = quantity;
    await cartItem.save();

    return res.json({ success: true, message: "Cart item quantity updated successfully", data: cartItem });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------- DELETE CART ITEM -------------------
export const deleteCartItemController = async (req, res) => {
  try {
    const { cartItemId } = req.body;
    if (!cartItemId) return res.status(400).json({ success: false, message: "cartItemId is required" });

    const cartItem = await CartProductModel.findOne({ _id: cartItemId });
    if (!cartItem) return res.status(404).json({ success: false, message: "Cart item not found" });

    await cartItem.deleteOne();

    return res.json({ success: true, message: "Cart item deleted successfully", data: { cartItemId } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------- DELETE CART ITEM (Mongoose) -------------------
export const deleteCartItemQtyController = async (req, res) => {
  try {
    const { cartItemId } = req.body;

    if (!cartItemId) {
      return res.status(400).json({
        success: false,
        message: "cartItemId is required",
      });
    }

    // Find the cart item by _id
    const cartItem = await CartProductModel.findOne({ _id: cartItemId });
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Delete the cart item
    await cartItem.deleteOne();

    return res.json({
      success: true,
      message: "Cart item deleted successfully",
      data: { cartItemId },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || error,
    });
  }
};
