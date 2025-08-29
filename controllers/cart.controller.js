import CartModel from "../models/cartproduct.model.js";
import ProductModel from "../models/product.model.js";
import CounterModel from "../models/counterModel.js"; // for auto-increment cartItemId


// Add item to cart
export const addToCartItemController = async (req, res) => {
  try {
    const { user_id, productId } = req.body;

    if (!user_id || !productId) {
      return res.status(400).json({
        success: false,
        message: "user_id and productId are required",
      });
    }

    // Find user's cart
    let cart = await CartModel.findOne({ user_id });

    // Find product details (by Number)
    const product = await ProductModel.findOne({ productId: Number(productId) });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    // If no cart, create one
    if (!cart) {
      cart = new CartModel({
        cartId: user_id, // or any unique cartId
        user_id,
        items: [],
      });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(item => item.productId === product.productId);
    if (existingItem) {
      return res.status(400).json({ success: false, message: "Item already in cart" });
    }

    // Add to cart
    const cartItemId = cart.items.length ? cart.items[cart.items.length - 1].cartItemId + 1 : 1;
    cart.items.push({
      cartItemId,
      productId: product.productId, // ✅ Number
      quantity: 1,
      price: product.price,
      discount: product.discount || null,
    });

    await cart.save();

    return res.json({
      success: true,
      message: "Item added to cart successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};



// GET CART ITEMS
export const getCartItemController = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Unauthorized", error: true, success: false });

    // Fetch cart for this user
    const cart = await CartModel.findOne({ user_id: userId });
    if (!cart || !cart.items.length) {
      return res.json({ data: [], error: false, success: true });
    }

    // Map cart items to include full product details
    const itemsWithProductDetails = await Promise.all(
      cart.items.map(async (item) => {
        const product = await ProductModel.findOne({ productId: item.productId }); // numeric ID
        return {
          ...item._doc,
          productId: product, // overwrite with full product info
        };
      })
    );

    return res.json({ data: itemsWithProductDetails, error: false, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Something went wrong", error: true, success: false });
  }
};


// ------------------- UPDATE CART ITEM QUANTITY -------------------
export const updateCartItemQtyController = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const { cartItemId, quantity } = req.body;

    const cart = await CartProductModel.findOne({ user_id: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((i) => i.cartItemId === cartItemId);
    if (!item) return res.status(404).json({ message: "Cart item not found" });

    item.quantity = quantity;
    await cart.save();

    return res.json({ success: true, message: "Quantity updated", data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------- DELETE CART ITEM -------------------
export const deleteCartItemQtyController = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const { cartItemId } = req.body;

    const cart = await CartProductModel.findOne({ user_id: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((i) => i.cartItemId !== cartItemId);
    await cart.save();

    return res.json({ success: true, message: "Cart item deleted", data: { cartItemId } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
