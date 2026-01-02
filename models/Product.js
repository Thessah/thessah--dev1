import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  description: String,
  shortDescription: String,
  mrp: Number,
  price: Number,
  images: [String],
  category: String,
  sku: String,
  inStock: { type: Boolean, default: true },
  stockQuantity: { type: Number, default: 0 },
  hasVariants: { type: Boolean, default: false },
  variants: { type: Array, default: [] },
  attributes: { type: Object, default: {} },
  hasBulkPricing: { type: Boolean, default: false },
  bulkPricing: { type: Array, default: [] },
  fastDelivery: { type: Boolean, default: false },
  allowReturn: { type: Boolean, default: true },
  allowReplacement: { type: Boolean, default: true },
  storeId: String,
}, { timestamps: true });

// Add indexes for better query performance
ProductSchema.index({ inStock: 1, createdAt: -1 });
ProductSchema.index({ category: 1, inStock: 1 });
ProductSchema.index({ storeId: 1, inStock: 1 });
ProductSchema.index({ slug: 1 });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);