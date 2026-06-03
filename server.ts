/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Product, Order, Subscription, InventoryAlert, BackupLog, ERPIntegrationLog, ServerState, ProductReview } from "./src/types";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT);
  if (isNaN(PORT) || PORT <= 0) {
    throw new Error("The PORT environment variable must be set to a valid positive number.");
  }

  app.use(express.json());

  // --- Seed Database ---
  let products: Product[] = [
    {
      id: "prod-1",
      name: "Jos Irish Potatoes",
      category: "Vegetables",
      price: 2.50,
      stock: 350,
      minStockThreshold: 50,
      unit: "kg",
      origin: "Vom Valley Farms",
      freshnessDays: 30,
      description: "Creamy, high-starch fresh Irish potatoes perfect for boiling, roasting, or mashing. Harvested from the altitudes of Vom.",
      image: "🥔",
      imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=500&q=80",
      organic: true
    },
    {
      id: "prod-2",
      name: "Vom Strawberries",
      category: "Fruits",
      price: 6.00,
      stock: 80,
      minStockThreshold: 20,
      unit: "box",
      origin: "Vom Heights Orchard",
      freshnessDays: 6,
      description: "Plump, sweet, handpicked strawberries. Grown in the pristine, cool microclimate of Vom heights.",
      image: "🍓",
      imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=500&q=80",
      organic: true
    },
    {
      id: "prod-3",
      name: "Miango Carrots",
      category: "Vegetables",
      price: 1.80,
      stock: 210,
      minStockThreshold: 40,
      unit: "kg",
      origin: "Miango Organic cooperative",
      freshnessDays: 14,
      description: "Crunchy, sweet, and bright orange carrots grown in moist red soil of Miango farm settlements.",
      image: "🥕",
      imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=500&q=80",
      organic: true
    },
    {
      id: "prod-4",
      name: "Rayfield Broccoli",
      category: "Vegetables",
      price: 4.50,
      stock: 12, // Critical stock simulation
      minStockThreshold: 25,
      unit: "kg",
      origin: "Rayfield Greenhouses",
      freshnessDays: 8,
      description: "Compact, tender, deep-green broccoli heads packed with nutrients.",
      image: "🥦",
      imageUrl: "https://images.unsplash.com/photo-1452967712862-0cca1839ff27?auto=format&fit=crop&w=500&q=80",
      organic: false
    },
    {
      id: "prod-5",
      name: "Shere Hills Cauliflower",
      category: "Vegetables",
      price: 3.80,
      stock: 45,
      minStockThreshold: 15,
      unit: "unit",
      origin: "Shere Foothill Gardens",
      freshnessDays: 10,
      description: "Crisp white heads of local cauliflower, sweet and excellent for roasting with spices.",
      image: "🥬",
      imageUrl: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=500&q=80",
      organic: true
    },
    {
      id: "prod-6",
      name: "Heipang Red Onions",
      category: "Vegetables",
      price: 1.20,
      stock: 400,
      minStockThreshold: 50,
      unit: "kg",
      origin: "Heipang Farms Ltd",
      freshnessDays: 45,
      description: "Pungent, highly flavorful red onions with dry outer skin. Exceptional shelf stability.",
      image: "🧅",
      imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=500&q=80",
      organic: false
    },
    {
      id: "prod-7",
      name: "Ropp Red Cabbage",
      category: "Vegetables",
      price: 1.50,
      stock: 180,
      minStockThreshold: 30,
      unit: "unit",
      origin: "Ropp District Plateau",
      freshnessDays: 21,
      description: "Densely packed purple red cabbages with superb crunch, ideal for healthy local salads and wraps.",
      image: "🥗",
      imageUrl: "https://images.unsplash.com/photo-1608797178974-15b35a61d121?auto=format&fit=crop&w=500&q=80",
      organic: true
    },
    {
      id: "prod-8",
      name: "Kassa Beefsteak Tomatoes",
      category: "Fruits",
      price: 3.00,
      stock: 4, // Critical low
      minStockThreshold: 30,
      unit: "box",
      origin: "Kassa Irrigation Farms",
      freshnessDays: 7,
      description: "Vine-ripened, meaty red tomatoes with amazing juice and flavor.",
      image: "🍅",
      imageUrl: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=500&q=80",
      organic: true
    },
    {
      id: "prod-9",
      name: "Kuru Golden Wild Honey",
      category: "Dairy",
      price: 8.50,
      stock: 120,
      minStockThreshold: 20,
      unit: "unit",
      origin: "Kuru Forest Apiary",
      freshnessDays: 365,
      description: "100% pure, unfiltered golden honey comb extract, locally sourced and packed with wildflower essence.",
      image: "🍯",
      imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=500&q=80",
      organic: true
    },
    {
      id: "prod-10",
      name: "Bokkos Wheat Grains",
      category: "Grains",
      price: 1.10,
      stock: 500,
      minStockThreshold: 80,
      unit: "kg",
      origin: "Bokkos Grain Fields",
      freshnessDays: 180,
      description: "High-yield whole wheat grain kernels. Stoneground ready for baking freshly milled flour.",
      image: "🌾",
      imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=500&q=80",
      organic: true
    },
    {
      id: "prod-11",
      name: "Farin Lada Mint Leaves",
      category: "Herbs",
      price: 1.00,
      stock: 65,
      minStockThreshold: 15,
      unit: "bunch",
      origin: "Farin Lada Herb Garden",
      freshnessDays: 5,
      description: "Super fragrant, handpicked fresh mint leaves. Excellent for herbal tea, garnish, and extracts.",
      image: "🌱",
      imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=80",
      organic: true
    }
  ];

  let reviews: ProductReview[] = [
    {
      id: "rev-1",
      productId: "prod-1",
      userName: "Gyang Pam",
      userEmail: "gyang@gmail.com",
      rating: 5,
      comment: "Absolutely top tier potatoes. Kept beautifully in local dry storage for weeks. The Vom soil flavor is distinct!",
      createdAt: "2026-05-28T09:12:00Z"
    },
    {
      id: "rev-2",
      productId: "prod-1",
      userName: "Esther Alao",
      userEmail: "esther.a@yahoo.com",
      rating: 4,
      comment: "Superb for roasting. Very starch-rich, just like we love.",
      createdAt: "2026-06-01T14:30:05Z"
    },
    {
      id: "rev-3",
      productId: "prod-2",
      userName: "Nuhu Bello",
      userEmail: "nuhu@outlook.com",
      rating: 5,
      comment: "Incredible preservation! They arrived with dry ice packs and the sweetness is unmatched in Nigeria.",
      createdAt: "2026-06-02T11:20:00Z"
    },
    {
      id: "rev-4",
      productId: "prod-3",
      userName: "Khadijah Sani",
      userEmail: "khadijah@gmail.com",
      rating: 4,
      comment: "Very sweet and crunchy, highly recommend combining with the forest wild honey.",
      createdAt: "2026-06-02T16:45:00Z"
    },
    {
      id: "rev-5",
      productId: "prod-9",
      userName: "Dr. Jerry",
      userEmail: "jerry.doc@gmail.com",
      rating: 5,
      comment: "Raw wild honey with standard crystallization! This is the real deal from Kuru woods.",
      createdAt: "2026-05-30T08:05:00Z"
    }
  ];

  let orders: Order[] = [
    {
      id: "ord-101",
      userId: "user-cust-1",
      items: [
        { productId: "prod-1", productName: "Jos Irish Potatoes", quantity: 5, price: 2.50, unit: "kg" },
        { productId: "prod-3", productName: "Miango Carrots", quantity: 3, price: 1.80, unit: "kg" }
      ],
      totalAmount: 17.90,
      status: "delivered",
      paymentStatus: "paid",
      paymentMethod: "card",
      trackingNumber: "JF-839210-CR",
      shippingLogistics: {
        carrier: "JosFresh Express",
        timeline: [
          { timestamp: "2026-06-01T08:00:00Z", status: "Order Placed", location: "Online Checkout", description: "Payment verified successfully." },
          { timestamp: "2026-06-01T10:30:00Z", status: "In Warehouse", location: "Jos Central Depot", description: "Items picked and packaged under refrigeration." },
          { timestamp: "2026-06-01T13:00:00Z", status: "Packed", location: "Jos Central Depot", description: "Vetted for quality control thresholds." },
          { timestamp: "2026-06-02T09:00:00Z", status: "Dispatched", location: "Rayfield Route", description: "Out with courier Jane Doe." },
          { timestamp: "2026-06-02T13:45:00Z", status: "Delivered", location: "Customer Residence", description: "Delivered in fresh refrigerated box." }
        ]
      },
      deliveryAddress: "Apartment 4B, Rayfield Villas, Jos, Nigeria",
      createdAt: "2026-06-01T07:55:00Z"
    },
    {
      id: "ord-102",
      userId: "user-cust-1",
      items: [
        { productId: "prod-2", productName: "Vom Strawberries", quantity: 2, price: 6.00, unit: "box" },
        { productId: "prod-9", productName: "Kuru Golden Wild Honey", quantity: 1, price: 8.50, unit: "unit" }
      ],
      totalAmount: 20.50,
      status: "shipped",
      paymentStatus: "paid",
      paymentMethod: "card",
      trackingNumber: "JF-410522-DL",
      shippingLogistics: {
        carrier: "DHL FarmDirect",
        timeline: [
          { timestamp: "2026-06-02T15:00:00Z", status: "Order Placed", location: "Online Checkout", description: "Credit card payment processed." },
          { timestamp: "2026-06-02T17:45:00Z", status: "In Warehouse", location: "Vom Packing Station", description: "Flash-chilled strawberries prepared." },
          { timestamp: "2026-06-03T07:00:00Z", status: "Packed", location: "Vom Packing Station", description: "Sealed with dry-ice packs." },
          { timestamp: "2026-06-03T09:15:00Z", status: "Dispatched", location: "Rayfield Transit Hub", description: "En route via logistics carrier DHL." }
        ]
      },
      deliveryAddress: "Apartment 4B, Rayfield Villas, Jos, Nigeria",
      createdAt: "2026-06-02T14:58:00Z"
    }
  ];

  let subscriptions: Subscription[] = [
    {
      id: "sub-201",
      userId: "user-cust-1",
      frequency: "weekly",
      dayOfWeek: "Saturday",
      items: [
        { productId: "prod-1", productName: "Jos Irish Potatoes", quantity: 10, priceAtSubscription: 2.50 },
        { productId: "prod-3", productName: "Miango Carrots", quantity: 5, priceAtSubscription: 1.80 },
        { productId: "prod-6", productName: "Heipang Red Onions", quantity: 2, priceAtSubscription: 1.20 }
      ],
      totalAmount: 36.40,
      status: "active",
      nextDeliveryDate: "2026-06-06",
      deliveryAddress: "Apartment 4B, Rayfield Villas, Jos, Nigeria",
      createdAt: "2026-05-15T10:00:00Z"
    }
  ];

  let alerts: InventoryAlert[] = [
    {
      id: "alt-1",
      productId: "prod-4",
      productName: "Rayfield Broccoli",
      type: "critical_low",
      message: "Rayfield Broccoli stock (12 kg) has fallen below min threshold (25 kg). Reorder initiated.",
      timestamp: "2026-06-03T06:10:00Z",
      resolved: false
    },
    {
      id: "alt-2",
      productId: "prod-8",
      productName: "Kassa Beefsteak Tomatoes",
      type: "urgent_stockout",
      message: "Kassa Beefsteak Tomatoes stock (4 boxes) is approaching zero. Critical fulfillment warning.",
      timestamp: "2026-06-03T08:45:00Z",
      resolved: false
    }
  ];

  let backups: BackupLog[] = [
    {
      id: "bak-301",
      timestamp: "2026-06-02T02:00:00Z",
      recordCount: 42,
      status: "success",
      sizeKB: 142.3,
      triggeredBy: "Automated System Crontab"
    },
    {
      id: "bak-302",
      timestamp: "2026-06-03T02:00:00Z",
      recordCount: 45,
      status: "success",
      sizeKB: 146.1,
      triggeredBy: "Automated System Crontab"
    }
  ];

  let erpLogs: ERPIntegrationLog[] = [
    {
      id: "erp-401",
      timestamp: "2026-06-02T23:55:00Z",
      system: "QuickBooks",
      endpoint: "/v3/company/ledger/sync",
      status: "success",
      message: "End-of-day sales ledger reconciled. Sync amount: $38.40. Zero discrepancies found."
    }
  ];

  // Helper function to check and generate inventory alerts
  function checkStockAlerts(product: Product) {
    if (product.stock <= product.minStockThreshold) {
      const activeAlert = alerts.find(a => a.productId === product.id && !a.resolved);
      if (!activeAlert) {
        const type = product.stock <= 5 ? "urgent_stockout" : "critical_low";
        alerts.unshift({
          id: `alt-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          type,
          message: `${product.name} stock (${product.stock} ${product.unit}) has fallen below threshold (${product.minStockThreshold} ${product.unit}).`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }
    }
  }

  // --- API ROUTING ---

  // 1. PRODUCTS
  app.get("/api/products", (req, res) => {
    res.json(products);
  });

  app.post("/api/products/stock", (req, res) => {
    const { id, adjustment, overrideStock, price, minStockThreshold } = req.body;
    const prod = products.find(p => p.id === id);
    if (!prod) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (overrideStock !== undefined) {
      prod.stock = overrideStock;
    } else if (adjustment !== undefined) {
      prod.stock = Math.max(0, prod.stock + adjustment);
    }

    if (price !== undefined) {
      prod.price = price;
    }

    if (minStockThreshold !== undefined) {
      prod.minStockThreshold = minStockThreshold;
    }

    // Check alerts
    checkStockAlerts(prod);

    // Dynamic ERP sync log on manual inventory changes
    erpLogs.unshift({
      id: `erp-${Date.now()}`,
      timestamp: new Date().toISOString(),
      system: "SAP Business One",
      endpoint: `/b1s/v1/Items('${prod.id}')`,
      status: "success",
      message: `Stock level synchronized. Item: ${prod.name}, Outbound sync quantity: ${prod.stock}.`
    });

    res.json({ success: true, product: prod });
  });

  // 2. ORDERS (Checkout & Tracking)
  app.get("/api/orders", (req, res) => {
    res.json(orders);
  });

  app.post("/api/orders", (req, res) => {
    const { items, totalAmount, paymentMethod, deliveryAddress, email } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cannot create empty order" });
    }

    // Process Stock changes
    const stockCheckPassed = items.every((item: any) => {
      const prod = products.find(p => p.id === item.productId);
      return prod && prod.stock >= item.quantity;
    });

    if (!stockCheckPassed) {
      return res.status(400).json({ error: "Insufficient stock for one or more grocery items" });
    }

    // Deduct stock
    items.forEach((item: any) => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock -= item.quantity;
        checkStockAlerts(prod);
      }
    });

    // Create tracking timeline
    const trackingNumber = `JF-${Math.floor(100000 + Math.random() * 900000)}-EX`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      userId: email || "user-cust-1",
      items,
      totalAmount,
      status: "pending",
      paymentStatus: paymentMethod === "card" ? "paid" : "unpaid",
      paymentMethod,
      trackingNumber,
      shippingLogistics: {
        carrier: "JosFresh Express",
        timeline: [
          { timestamp: new Date().toISOString(), status: "Order Placed", location: "Online Central Portal", description: "Order queued and payment verified." }
        ]
      },
      deliveryAddress: deliveryAddress || "Jos Plateau, Nigeria",
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder);

    // ERP Accounting Trigger
    erpLogs.unshift({
      id: `erp-${Date.now()}`,
      timestamp: new Date().toISOString(),
      system: "QuickBooks",
      endpoint: "/v3/company/salesreceipt/create",
      status: "success",
      message: `Outbound sales voucher synced. Receipt code: SB-${trackingNumber}. Amount: $${totalAmount.toFixed(2)}.`
    });

    res.json({ success: true, order: newOrder });
  });

  // LOGISTICS TRACKING UPDATER OVERVIEW
  app.post("/api/orders/:id/logistics", (req, res) => {
    const { id } = req.params;
    const { status, location, description } = req.body;
    const order = orders.find(o => o.id === id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const validStatus = ["Order Placed", "In Warehouse", "Packed", "Dispatched", "In Transit", "Out for Delivery", "Delivered"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: "Invalid status step" });
    }

    // Append event
    order.shippingLogistics.timeline.push({
      timestamp: new Date().toISOString(),
      status,
      location: location || "Transit Point",
      description: description || `Package moved to ${status}`
    });

    order.status = (status === "Delivered") ? "delivered" : (status === "Dispatched" || status === "In Transit" || status === "Out for Delivery") ? "shipped" : "processing";

    res.json({ success: true, order });
  });

  // 3. SUBSCRIPTIONS
  app.get("/api/subscriptions", (req, res) => {
    res.json(subscriptions);
  });

  app.post("/api/subscriptions", (req, res) => {
    const { items, totalAmount, frequency, dayOfWeek, deliveryAddress, email } = req.body;

    const newSub: Subscription = {
      id: `sub-${Math.floor(100 + Math.random() * 900)}`,
      userId: email || "user-cust-1",
      frequency: frequency || "weekly",
      dayOfWeek: dayOfWeek || "Saturday",
      items,
      totalAmount,
      status: "active",
      nextDeliveryDate: getNextDeliveryDate(dayOfWeek || "Saturday"),
      deliveryAddress: deliveryAddress || "Customer Residence, Jos",
      createdAt: new Date().toISOString()
    };

    subscriptions.unshift(newSub);

    res.json({ success: true, subscription: newSub });
  });

  app.post("/api/subscriptions/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const sub = subscriptions.find(s => s.id === id);
    if (!sub) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    if (status === "active" || status === "paused" || status === "cancelled") {
      sub.status = status;
      res.json({ success: true, subscription: sub });
    } else {
      res.status(400).json({ error: "Invalid status state" });
    }
  });

  // Helper date calculator
  function getNextDeliveryDate(dayName: string): string {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const targetIdx = days.indexOf(dayName);
    if (targetIdx === -1) return "2026-06-06"; // Fallback Saturday default

    const today = new Date();
    const todayIdx = today.getDay();
    let diff = targetIdx - todayIdx;
    if (diff <= 0) {
      diff += 7; // force next week same day
    }
    const targetDate = new Date(today.getTime() + diff * 24 * 60 * 60 * 1000);
    return targetDate.toISOString().split("T")[0];
  }

  // 4. INVENTORY ALERTS
  app.get("/api/alerts", (req, res) => {
    res.json(alerts);
  });

  app.post("/api/alerts/:id/resolve", (req, res) => {
    const { id } = req.params;
    const alert = alerts.find(a => a.id === id);
    if (alert) {
      alert.resolved = true;
      res.json({ success: true, alert });
    } else {
      res.status(404).json({ error: "Alert not found" });
    }
  });

  // 5. BACKUPS (Cloud system resilience)
  app.get("/api/backups", (req, res) => {
    res.json(backups);
  });

  app.post("/api/backups/trigger", (req, res) => {
    const { triggeredBy } = req.body;
    const recordCount = products.length + orders.length + subscriptions.length + alerts.length;
    const newBackup: BackupLog = {
      id: `bak-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      recordCount,
      status: "success",
      sizeKB: parseFloat((120 + Math.random() * 35).toFixed(1)),
      triggeredBy: triggeredBy || "Manual Admin Panel"
    };

    backups.unshift(newBackup);
    res.json({ success: true, backup: newBackup });
  });

  app.post("/api/backups/restore", (req, res) => {
    // Simulates full system restore - reverting critical stocks or alerts
    const originalPotatoes = products.find(p => p.id === "prod-1");
    if (originalPotatoes) {
      originalPotatoes.stock = 350; // Restore potato levels
    }
    const originalTomatoes = products.find(p => p.id === "prod-8");
    if (originalTomatoes) {
      originalTomatoes.stock = 45; // Restore tomato levels
    }

    // Resolve current resolved flags
    alerts.forEach(a => a.resolved = true);

    const restoreLog: BackupLog = {
      id: `bak-rst-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      recordCount: products.length,
      status: "success",
      sizeKB: 145.5,
      triggeredBy: "Automated Recover Tool"
    };
    backups.unshift(restoreLog);

    res.json({ success: true, restoredCount: products.length, message: "Restored potato levels to index 350 and tomatoes to 45. Critical alerts resolved." });
  });

  // 6. ERP INTEGRATION SYNC Trigger
  app.get("/api/erp-logs", (req, res) => {
    res.json(erpLogs);
  });

  app.post("/api/erp-sync", (req, res) => {
    const { system } = req.body;
    const systems: ('QuickBooks' | 'SAP Business One' | 'Local Accounting')[] = ["QuickBooks", "SAP Business One", "Local Accounting"];
    const targetSystem = system && systems.includes(system) ? system : "QuickBooks";

    const erpSync: ERPIntegrationLog = {
      id: `erp-${Date.now()}`,
      timestamp: new Date().toISOString(),
      system: targetSystem,
      endpoint: targetSystem === "SAP Business One" ? "/b1s/v1/JournalEntries" : "/v3/company/ledger/reconcile",
      status: "success",
      message: `Manual ERP reconciliation completed flawlessly. Synced item catalog of ${products.length} stock ledger IDs.`
    };

    erpLogs.unshift(erpSync);
    res.json({ success: true, erpSync });
  });

  // 6.5 CLIENT PRODUCT REVIEWS
  app.get("/api/reviews", (req, res) => {
    res.json(reviews);
  });

  app.post("/api/reviews", (req, res) => {
    const { productId, userName, userEmail, rating, comment } = req.body;

    if (!productId || !userName || !userEmail || !rating || !comment) {
      return res.status(400).json({ error: "Missing required review payload fields." });
    }

    const intRating = parseInt(rating, 10);
    if (isNaN(intRating) || intRating < 1 || intRating > 5) {
      return res.status(400).json({ error: "Rating must be a number between 1 and 5 stars." });
    }

    const prod = products.find(p => p.id === productId);
    if (!prod) {
      return res.status(404).json({ error: "Product not found." });
    }

    const newReview: ProductReview = {
      id: `rev-${Date.now()}`,
      productId,
      userName,
      userEmail,
      rating: intRating,
      comment,
      createdAt: new Date().toISOString()
    };

    reviews.unshift(newReview);

    // Also simulate ERP push for customer feedback registry:
    erpLogs.unshift({
      id: `erp-${Date.now()}`,
      timestamp: new Date().toISOString(),
      system: "Local Accounting",
      endpoint: `/api/products/${productId}/feedback`,
      status: "success",
      message: `Customer rating (${intRating} stars) submitted by ${userEmail} registered under ${prod.name}.`
    });

    res.json({ success: true, review: newReview });
  });

  // 7. OFFLINE SYNC API ENDPOINT
  app.post("/api/sync", (req, res) => {
    const { queue } = req.body; // array of OfflineActions
    if (!queue || queue.length === 0) {
      return res.json({ success: true, message: "No offline actions to synchronize." });
    }

    let processedCount = 0;
    queue.forEach((act: any) => {
      try {
        if (act.type === 'CREATE_ORDER') {
          const { items, totalAmount, paymentMethod, deliveryAddress, email } = act.payload;
          const stockCheckPassed = items.every((item: any) => {
            const prod = products.find(p => p.id === item.productId);
            return prod && prod.stock >= item.quantity;
          });
          if (stockCheckPassed) {
            items.forEach((item: any) => {
              const prod = products.find(p => p.id === item.productId);
              if (prod) {
                prod.stock -= item.quantity;
                checkStockAlerts(prod);
              }
            });
            const trackingNumber = `JF-${Math.floor(100000 + Math.random() * 900000)}-OFF`;
            orders.unshift({
              id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              userId: email || "user-cust-1",
              items,
              totalAmount,
              status: "pending",
              paymentStatus: "paid",
              paymentMethod,
              trackingNumber,
              shippingLogistics: {
                carrier: "JosFresh Express",
                timeline: [
                  { timestamp: act.timestamp, status: "Order Placed", location: "Offline Cash Queue", description: "Synchronized from offline device." }
                ]
              },
              deliveryAddress: deliveryAddress || "Offline Queued Address",
              createdAt: act.timestamp
            });
            processedCount++;
          }
        } else if (act.type === 'UPDATE_STOCK') {
          const { id, adjustment, overrideStock } = act.payload;
          const prod = products.find(p => p.id === id);
          if (prod) {
            if (overrideStock !== undefined) prod.stock = overrideStock;
            else if (adjustment !== undefined) prod.stock = Math.max(0, prod.stock + adjustment);
            checkStockAlerts(prod);
            processedCount++;
          }
        } else if (act.type === 'CREATE_SUBSCRIPTION') {
          const { items, totalAmount, frequency, dayOfWeek, deliveryAddress, email } = act.payload;
          subscriptions.unshift({
            id: `sub-${Math.floor(100 + Math.random() * 900)}`,
            userId: email || "user-cust-1",
            frequency: frequency || "weekly",
            dayOfWeek: dayOfWeek || "Saturday",
            items,
            totalAmount,
            status: "active",
            nextDeliveryDate: getNextDeliveryDate(dayOfWeek || "Saturday"),
            deliveryAddress: deliveryAddress || "Customer Residence (Offline Sync)",
            createdAt: act.timestamp
          });
          processedCount++;
        } else if (act.type === 'ADD_REVIEW') {
          const { productId, userName, userEmail, rating, comment } = act.payload;
          const prod = products.find(p => p.id === productId);
          if (prod) {
            reviews.unshift({
              id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              productId,
              userName,
              userEmail,
              rating: parseInt(rating, 10) || 5,
              comment,
              createdAt: act.timestamp
            });
            processedCount++;
          }
        }
      } catch (err) {
        console.error("Failed executing offline queue item sync:", err);
      }
    });

    // Add ERP entry reflecting synchronization session
    if (processedCount > 0) {
      erpLogs.unshift({
        id: `erp-${Date.now()}`,
        timestamp: new Date().toISOString(),
        system: "Local Accounting",
        endpoint: "/ledger/sync/offline",
        status: "success",
        message: `Offline synchronization completed for (${processedCount}) queued entries. Stock books balanced.`
      });
    }

    res.json({
      success: true,
      syncCount: processedCount,
      products,
      orders,
      subscriptions,
      alerts,
      reviews,
      erpLogs
    });
  });

  // --- VITE MIDDLEWARE INTERFACE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[JosFresh FullStack] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
