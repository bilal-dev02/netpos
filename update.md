I understand you want to add functionality for:

Direct selling without inventory management - For companies that don't maintain stock

Weight-based products - Integration with weight machines

Multiple products in single order - Already supported but needs enhancement

Here's how we can implement this:

1. Database Schema Changes
Add new product type field to products table:
sql
ALTER TABLE products ADD COLUMN product_type TEXT NOT NULL DEFAULT 'stock';
-- Values: 'stock' (normal inventory), 'non_stock' (direct selling), 'weight_based'
Add weight field for weight-based products:
sql
ALTER TABLE products ADD COLUMN weight_unit TEXT DEFAULT 'kg';
ALTER TABLE products ADD COLUMN weight_decimal_places INTEGER DEFAULT 3;
Modify orders table items structure to support weight:
The items JSON column will need to store weight information for weight-based products.

2. New API Endpoints
Add to /api/products/:
typescript
// New endpoints
POST /products/non-stock  // Create non-stock product
GET /products/non-stock   // List non-stock products
POST /products/weight-based  // Create weight-based product
Add weight machine integration:
typescript
POST /api/weight/connect    // Connect to weight machine
GET /api/weight/reading     // Get current weight reading
POST /api/weight/calibrate  // Calibrate weight machine
3. Frontend Components
New Product Type Selector in ProductForm.tsx:
tsx
// Add to product form
<Select onValueChange={setProductType}>
  <SelectTrigger>
    <SelectValue placeholder="Select product type" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="stock">Stock Item</SelectItem>
    <SelectItem value="non_stock">Direct Sale (No Inventory)</SelectItem>
    <SelectItem value="weight_based">Weight-based Item</SelectItem>
  </SelectContent>
</Select>
Weight-based Product Form:
tsx
{productType === 'weight_based' && (
  <div className="space-y-4">
    <Input 
      label="Weight Unit" 
      value={weightUnit} 
      onChange={(e) => setWeightUnit(e.target.value)}
      placeholder="kg, g, lb"
    />
    <Input 
      label="Decimal Places" 
      type="number"
      value={weightDecimalPlaces}
      onChange={(e) => setWeightDecimalPlaces(parseInt(e.target.value))}
      placeholder="3"
    />
    <Input 
      label="Price per Unit" 
      type="number"
      step="0.001"
      value={pricePerUnit}
      onChange={(e) => setPricePerUnit(parseFloat(e.target.value))}
    />
  </div>
)}
Direct Sale Product Interface:
tsx
// In express checkout page
<Dialog>
  <DialogTrigger asChild>
    <Button>Add Direct Sale Item</Button>
  </DialogTrigger>
  <DialogContent>
    <DirectSaleProductForm 
      onAddProduct={(productData) => addToCart(productData)}
    />
  </DialogContent>
</Dialog>
4. Weight Machine Integration Component
tsx
// src/components/weight/WeightMachineInterface.tsx
export const WeightMachineInterface: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const connectToScale = async () => {
    try {
      // Web Serial API for USB scales or WebSocket for network scales
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      setConnected(true);
      
      // Start reading weight data
      readWeightData(port);
    } catch (error) {
      console.error('Failed to connect to scale:', error);
    }
  };

  const addWeightProductToCart = () => {
    if (selectedProduct && currentWeight > 0) {
      const totalPrice = selectedProduct.pricePerUnit * currentWeight;
      const weightItem = {
        ...selectedProduct,
        weight: currentWeight,
        calculatedPrice: totalPrice,
        quantity: 1 // Use quantity 1 for weight items
      };
      
      // Add to cart
      addToCart(weightItem);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Weight Scale</h3>
        <Button 
          onClick={connectToScale} 
          disabled={connected}
          variant={connected ? "default" : "outline"}
        >
          {connected ? 'Connected' : 'Connect Scale'}
        </Button>
      </div>
      
      {connected && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{currentWeight.toFixed(3)} kg</div>
            <div className="text-sm text-gray-500">Current Weight</div>
          </div>
          
          <Select onValueChange={(productId) => setSelectedProduct(products.find(p => p.id === productId))}>
            <SelectTrigger>
              <SelectValue placeholder="Select weight-based product" />
            </SelectTrigger>
            <SelectContent>
              {products.filter(p => p.product_type === 'weight_based').map(product => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} - {product.pricePerUnit} OMR/{product.weight_unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={addWeightProductToCart}
            disabled={!selectedProduct || currentWeight <= 0}
            className="w-full"
          >
            Add to Cart ({selectedProduct ? (selectedProduct.pricePerUnit * currentWeight).toFixed(3) : '0'} OMR)
          </Button>
        </div>
      )}
    </div>
  );
};
5. Enhanced Cart System
Update cart item type:
typescript
interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  productType: 'stock' | 'non_stock' | 'weight_based';
  // For weight-based items
  weight?: number;
  weightUnit?: string;
  pricePerUnit?: number;
  // For non-stock items
  isDirectSale?: boolean;
}
Enhanced cart calculations:
typescript
const calculateItemTotal = (item: CartItem): number => {
  if (item.productType === 'weight_based' && item.weight && item.pricePerUnit) {
    return item.weight * item.pricePerUnit;
  }
  return item.price * item.quantity;
};
6. Order Processing Updates
Modify express checkout to handle mixed product types:
typescript
// In /api/express/checkout/route.ts
const processCheckout = async (orderData: OrderData) => {
  return await db.transaction(async (tx) => {
    // Create order
    const order = await createOrder(tx, orderData);
    
    // Process each item based on type
    for (const item of orderData.items) {
      if (item.productType === 'stock') {
        // Deduct from inventory
        await updateStock(tx, item.productId, -item.quantity);
      }
      // non_stock and weight_based items don't affect inventory
    }
    
    // Create payment
    await createPayment(tx, orderData.payment);
    
    return order;
  });
};
7. New Types Definition
typescript
// In src/types/index.ts
export type ProductType = 'stock' | 'non_stock' | 'weight_based';

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  productType: ProductType;
  // For weight-based products
  weightUnit?: string;
  pricePerUnit?: number;
  weightDecimalPlaces?: number;
  // For all products
  quantityInStock?: number; // Optional for non-stock items
}

export interface CartItem {
  id: string;
  productId: string;
  productType: ProductType;
  name: string;
  // Different pricing models
  price?: number; // Fixed price for stock/non-stock
  pricePerUnit?: number; // For weight-based
  weight?: number; // For weight-based
  quantity: number;
  weightUnit?: string;
}
8. Implementation Steps
Phase 1: Database schema updates and new product types

Phase 2: Product form enhancements for new types

Phase 3: Weight machine integration component

Phase 4: Cart system enhancements

Phase 5: Checkout process updates

Phase 6: Reporting and analytics for new product types

This approach allows you to:

Sell products without maintaining inventory

Integrate with weight scales for precise measurements

Handle mixed product types in single orders

Maintain proper pricing calculations for all types