import type { Request, Response } from "express";

export const successPageController = (req: Request, res: Response) => {
  res.send(`
    <html>
      <head>
        <title>Payment Successful</title>
      </head>
      <body>
        <h1>Payment Successful</h1>
        <p>Thank you for your payment. Your order has been confirmed.</p>
      </body>
    </html>
  `);
};

export const cancelPageController = (req: Request, res: Response) => {
  res.send(`
    <html>
      <head>
        <title>Payment Cancelled</title>
      </head>
      <body>
        <h1>Payment Cancelled</h1>
        <p>Your payment was not completed. Please try again.</p>
      </body>
    </html>
  `);
};
