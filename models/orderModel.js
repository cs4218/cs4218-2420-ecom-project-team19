import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: {
      type: [
        {
          _id: false,
          type: mongoose.ObjectId,
          ref: "Products",
          required: true,
        },
      ],
      required: true,
      validate: {
        validator: function (value) {
          return value && value.length > 0;
        },
        message: "There must be at least one product."
      }
    },
    payment: {
      type: Object,
      required: true
    },
    buyer: {
      type: mongoose.ObjectId,
      ref: "users",
      required: true,
    },
    status: {
      type: String,
      default: "Not Process",
      enum: ["Not Process", "Processing", "Shipped", "deliverd", "cancel"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);