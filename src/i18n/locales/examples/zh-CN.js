export default {
  jsonFormat: `{"status":200,"text":"","error":null,"data":[{"news_id":123456789012345678901234567890,"title":"iPhone X Review: Innovative future with real black technology","source":"Netease phone","rating":0.5},{"news_id":123456789012345678901234567891,"title":"Traffic paradise: How to design streets for people and unmanned vehicles in the future?","source":"Netease smart","link":"http://netease.smart/traffic-paradise/1235","rating":0.60},{"news_id":123456789012345678901234567892,"title":"Teslamask's American Business Relations: The government does not pay billions to build factories","source":"AI Finance","rating":0.8000,"members":["Daniel","Mike","John"]}]}`,
  xmlFormat: `<?xml version="1.0" encoding="UTF-8"?><library><book id="1" category="programming"><title lang="en">Learning TypeScript</title><author>Josh Goldberg</author><year>2022</year><price currency="USD">39.99</price><example><![CDATA[const add = (a, b) => a + b; console.log(add(2, 3)); // 5]]></example><publisher><name>O'Reilly Media</name><location>Sebastopol, CA</location></publisher><tags><tag>TypeScript</tag><tag>JavaScript</tag><tag>Web Development</tag></tags></book><book id="2" category="web"><title lang="en">Vue.js 3 Cookbook</title><author>Heitor Ramon Ribeiro</author><year>2023</year><price currency="USD">44.99</price><publisher><name>Packt Publishing</name><location>Birmingham, UK</location></publisher><tags><tag>Vue.js</tag><tag>Frontend</tag><tag>Framework</tag></tags></book></library>`,
  commonFormat: `[2026-01-25 14:23:45.123] [INFO] [OrderService] - 开始处理订单创建请求
[2026-01-25 14:23:45.156] [DEBUG] [OrderService] - 接收到订单请求数据: {"orderId":"ORD2026012545678","customerId":"CUST001","customerName":"LoneKit","items":[{"productId":"PROD001","productName":"iPhone 15 Pro","quantity":2,"price":7999.00,"discount":0.95},{"productId":"PROD002","productName":"AirPods Pro 2","quantity":1,"price":1899.00,"discount":1.0}],"shippingAddress":{"province":"北京市","city":"朝阳区","street":"建国路88号","zipCode":"100020","contact":"13800138000"},"paymentMethod":"ALIPAY","totalAmount":17897.05,"discount":799.95,"createTime":"2026-01-25T14:23:45.000Z","status":"PENDING"}
[2026-01-25 14:23:45.234] [INFO] [OrderService] - 订单数据验证通过，开始库存检查
[2026-01-25 14:23:45.267] [DEBUG] [InventoryService] - 调用库存服务 API: POST /api/v1/inventory/check
[2026-01-25 14:23:45.345] [INFO] [InventoryService] - 库存检查结果: {"success":true,"availableStock":{"PROD001":150,"PROD002":89},"reservationId":"RSV20260125001","expireTime":"2026-01-25T14:33:45.000Z"}
[2026-01-25 14:23:45.389] [DEBUG] [OrderService] - 生成支付请求，调用支付网关
[2026-01-25 14:23:45.445] [INFO] [PaymentGateway] - 创建支付订单，返回支付链接
[2026-01-25 14:23:45.501] [DEBUG] [MessageQueue] - 发送订单创建消息到 Kafka topic: order-events
[2026-01-25 14:23:45.534] [INFO] [MessageQueue] - 消息发送成功，partition: 3, offset: 123456789
[2026-01-25 14:23:45.578] [DEBUG] [AuditService] - 记录审计日志，写入数据库
[2026-01-25 14:23:45.612] [INFO] [AuditService] - 审计日志保存成功，日志ID: AUDIT20260125456789
[2026-01-25 14:23:45.645] [DEBUG] [NotificationService] - 发送 XML 格式通知到外部系统
[2026-01-25 14:23:45.678] [INFO] [NotificationService] - 通知消息内容: <?xml version="1.0" encoding="UTF-8"?><notification><type>ORDER_CREATED</type><orderId>ORD2026012545678</orderId><customer><id>CUST001</id><name>LoneKit</name><phone>13800138000</phone><level>VIP</level></customer><order><totalAmount>17897.05</totalAmount><itemCount>3</itemCount><status>PENDING</status><timestamp>2026-01-25T14:23:45.000Z</timestamp></order><actions><action type="email" to="customer.example.com" priority="high"/><action type="sms" to="13800138000" priority="medium"/></actions></notification>
[2026-01-25 14:23:45.723] [INFO] [NotificationService] - XML 通知发送完成，响应状态: 200
[2026-01-25 14:23:45.756] [INFO] [OrderService] - 订单创建流程完成，订单号: ORD2026012545678
[2026-01-25 14:23:45.789] [DEBUG] [OrderService] - 最终响应数据: {"success":true,"orderId":"ORD2026012545678","paymentUrl":"https://pay.example.com/checkout?token=abc123xyz","qrCode":"data:image/png;base64,iVBORw0KGgo...","estimatedDelivery":"2026-01-28","trackingEnabled":true,"message":"订单创建成功，请在15分钟内完成支付"}
[2026-01-25 14:23:45.812] [INFO] [OrderService] - 请求处理完成，总耗时: 667ms`,
  textCount: `改变世界的人\n\n献给疯狂的人。\n那些格格不入的人。\n那些反叛者。\n那些惹麻烦的人。\n他们像方孔里的圆钉。\n他们用不同的方式看世界。\n他们不喜欢循规蹈矩。\n他们也不尊重现状。\n你可以引用他们，反对他们，赞美他们，或者诋毁他们。\n但你唯一不能做的，就是忽视他们。\n因为他们改变事物。\n他们推动人类向前。\n有些人把他们看作疯子，而我们看到的是天才。\n因为那些疯狂到认为自己可以改变世界的人，正是改变世界的人。`,
  textProcess: `alpha
beta
gamma`,
  sqlFormat: `select supplier_name,city from
(select * from suppliers join addresses on suppliers.address_id=addresses.id)
as suppliers
where supplier_id > 500
order by supplier_name asc,city desc;`,
  time: {
    timestamps: [
      '2026-01-25 14:23:45',
      '2026/01/25 14:23:45',
      '2026.01.25 14:23:45.123',
      '20260125142345',
      '2026-01-25T14:23:45.123',
      '1769341425',
      '1769341425123',
    ],
    interval: {
      start: '2026-01-25 14:23:45',
      end: '2026-02-28 18:05:12',
      unit: 'day',
    },
    shift: {
      start: '2026-01-25 14:23:45',
      direction: 'forward',
      values: { year: null, month: 1, day: 3, hour: 2, minute: 30, second: null },
    },
  },
  codec: {
    plain: 'test',
    plainBatch: 'test\nLoneKit',
    base64: 'dGVzdA==',
    base64Batch: 'dGVzdA==\nTG9uZUtpdA==',
    unicode: '\\u0074\\u0065\\u0073\\u0074',
    unicodeBatch: '\\u0074\\u0065\\u0073\\u0074\n\\u004C\\u006F\\u006E\\u0065\\u004B\\u0069\\u0074',
    hex: '74657374',
    hexBatch: '74657374\n4c6f6e654b6974',
  },
  generator: {
    qr: ['https://kit.lonestack.com', 'LoneKit'],
    barcode: {
      CODE128: ['https://kit.lonestack.com', 'LoneKit'],
      CODE39: ['LONEKIT', 'HELLO-2024'],
      EAN13: ['5901234123457', '4006381333931'],
      EAN8: ['96385074', '55123457'],
      UPC: ['012345678905', '036000291452'],
      ITF14: ['98249880215004', '15400141288763'],
      MSI: ['80523', '1234567'],
      pharmacode: ['1234', '5678'],
      codabar: ['A12345B', 'C$25.00D'],
    },
  },
  sendpayDisplay: {
    sendpay: '0123456789'.repeat(26).slice(0, 256),
    sendpayMap: { 520: '1', 1002: '6', 1024: 9 },
  },
};
