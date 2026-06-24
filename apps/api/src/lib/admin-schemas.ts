import { z } from "zod";

export const ProductFormSchema = z
  .object({
    name: z.string().min(2).max(100),
    brandId: z.string().min(1),
    categoryId: z.string().min(1),
    originalPrice: z.number().min(100).max(10_000_000),
    salePrice: z.number().min(0),
    description: z.string().min(10),
    shortDescription: z.string().max(200),
    volume: z.string().optional(),
    skinType: z.array(z.string()).optional(),
    tags: z.array(
      z.enum([
        "BEST",
        "NEW",
        "SALE",
        "TODAY_DEAL",
        "ONLINE_ONLY",
        "EDITOR_PICK",
        "GLOBAL",
      ]),
    ),
    salesChannels: z.array(z.enum(["ONLINE", "OFFLINE", "GLOBAL"])).min(1),
    status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK", "DISCONTINUED"]),
  })
  .refine((data) => data.salePrice <= data.originalPrice, {
    path: ["salePrice"],
  });

export const CustomerFormSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^01[0-9]-\d{3,4}-\d{4}$/),
  grade: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]).default("BRONZE"),
  status: z.enum(["ACTIVE", "DORMANT", "WITHDRAWN"]).default("ACTIVE"),
  joinChannel: z.enum(["ONLINE", "OFFLINE", "APP", "GLOBAL"]),
});
