import sharedExamples from "./zh-CN";

export default {
  ...sharedExamples,
  commonFormat: `[2026-01-25 14:23:45.123] [INFO] [OrderService] - Start processing order creation request
[2026-01-25 14:23:45.156] [DEBUG] [OrderService] - Received order payload: {"orderId":"ORD2026012545678","customerId":"CUST001","customerName":"LoneKit","items":[{"productId":"PROD001","productName":"iPhone 15 Pro","quantity":2,"price":7999.00},{"productId":"PROD002","productName":"AirPods Pro 2","quantity":1,"price":1899.00}],"shippingAddress":{"province":"Beijing","city":"Chaoyang","street":"Jianguo Road 88","zipCode":"100020"},"paymentMethod":"ALIPAY","totalAmount":17897.05,"status":"PENDING"}
[2026-01-25 14:23:45.345] [INFO] [InventoryService] - Inventory check result: {"success":true,"availableStock":{"PROD001":150,"PROD002":89},"reservationId":"RSV20260125001","expireTime":"2026-01-25T14:33:45.000Z"}
[2026-01-25 14:23:45.678] [INFO] [NotificationService] - Notification payload: <?xml version="1.0" encoding="UTF-8"?><notification><type>ORDER_CREATED</type><orderId>ORD2026012545678</orderId><customer><id>CUST001</id><name>LoneKit</name><level>VIP</level></customer><order><totalAmount>17897.05</totalAmount><itemCount>3</itemCount><status>PENDING</status><timestamp>2026-01-25T14:23:45.000Z</timestamp></order></notification>
[2026-01-25 14:23:45.812] [INFO] [OrderService] - Request completed, elapsed: 667ms`,
  textCount: `Think Different

Here are the ones who think differently.
The builders.
The skeptics.
The people who keep asking better questions.
They do not accept a workflow just because it has always existed.
They turn repeated work into tools.
They turn small frictions into clean interfaces.
You can ignore a tiny improvement for a day.
But a tiny improvement repeated every day becomes a different way to work.
Good tools do not ask for attention.
They give attention back.`,
  textProcess: `alpha
beta
gamma`,
};
