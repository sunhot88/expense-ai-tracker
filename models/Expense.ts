import mongoose, { InferSchemaType, Model } from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }, // 記帳的使用者
    rawText: { type: String, required: true }, // 使用者原始輸入
    type: { type: String, enum: ["expense", "income"], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "TWD" },
    category: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export type ExpenseDoc = InferSchemaType<typeof expenseSchema>;

export const Expense: Model<ExpenseDoc> =
  (mongoose.models.Expense as Model<ExpenseDoc>) ||
  mongoose.model<ExpenseDoc>("Expense", expenseSchema);
