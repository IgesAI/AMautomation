import nodemailer from 'nodemailer'
import { ItemStatus, NotificationType } from '@prisma/client'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail(to: string[], subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@inventory.local',
      to: to.join(', '),
      subject,
      html,
    })
    console.log('Email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Email send failed:', error)
    return false
  }
}

export function generateNotificationEmail(
  itemName: string,
  sku: string | null,
  categoryName: string,
  currentQuantity: number,
  minimumQuantity: number,
  reorderQuantity: number,
  unitOfMeasure: string,
  notificationType: NotificationType,
  recentTransactions: Array<{
    type: string
    quantityChange: number
    createdAt: Date
    performedBy?: string | null
    machineOrArea?: string | null
    jobReference?: string | null
  }>,
  locationName?: string | null,
  supplierName?: string | null
): { subject: string; html: string } {

  const quantityStr = `${currentQuantity} ${unitOfMeasure}`
  const minStr = `${minimumQuantity} ${unitOfMeasure}`
  const reorderStr = `${reorderQuantity} ${unitOfMeasure}`

  let subject: string
  let statusColor: string
  let statusText: string

  switch (notificationType) {
    case NotificationType.LOW_STOCK:
      subject = `[AM Inventory] LOW STOCK: ${itemName} (${quantityStr}, min ${minStr})`
      statusColor = '#ffaa00'
      statusText = 'LOW STOCK'
      break
    case NotificationType.OUT_OF_STOCK:
      subject = `[AM Inventory] OUT OF STOCK: ${itemName}`
      statusColor = '#ff4444'
      statusText = 'OUT OF STOCK'
      break
    case NotificationType.EXPIRING_SOON:
      subject = `[AM Inventory] EXPIRING SOON: ${itemName}`
      statusColor = '#ff00ff'
      statusText = 'EXPIRING SOON'
      break
    default:
      subject = `[AM Inventory] Status Update: ${itemName}`
      statusColor = '#00e5ff'
      statusText = 'STATUS UPDATE'
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Share Tech Mono', monospace;
          background-color: #000011;
          color: #ffffff;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: linear-gradient(135deg, rgba(0, 17, 34, 0.9), rgba(0, 34, 51, 0.9));
          border: 1px solid #00cccc;
          border-radius: 4px;
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 1px solid #00e5ff;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 10px;
          border: 1px solid ${statusColor};
          border-radius: 2px;
          color: ${statusColor};
          text-shadow: 0 0 5px ${statusColor};
          font-weight: bold;
          font-size: 14px;
          letter-spacing: 0.5px;
        }
        .item-details {
          background: rgba(0, 255, 255, 0.05);
          border: 1px solid #00cccc;
          border-radius: 2px;
          padding: 15px;
          margin: 15px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          padding: 2px 0;
        }
        .detail-label {
          font-weight: bold;
          color: #cccccc;
        }
        .detail-value {
          color: #00e5ff;
          text-shadow: 0 0 3px #00e5ff;
        }
        .transactions {
          margin-top: 20px;
        }
        .transaction-item {
          background: rgba(0, 34, 51, 0.5);
          border: 1px solid #004444;
          border-radius: 2px;
          padding: 8px;
          margin: 5px 0;
          font-size: 12px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #00cccc;
          color: #888888;
          font-size: 11px;
        }
        .action-button {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(0, 255, 255, 0.1);
          border: 1px solid #00e5ff;
          border-radius: 2px;
          color: #00e5ff;
          text-decoration: none;
          margin: 10px 5px;
          text-shadow: 0 0 3px #00e5ff;
          box-shadow: 0 0 5px rgba(0, 255, 255, 0.2);
        }
        .action-button:hover {
          background: rgba(0, 255, 255, 0.2);
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: #00e5ff; text-shadow: 0 0 10px #00e5ff; margin: 0; font-size: 24px;">
            AM INVENTORY ALERT
          </h1>
          <div class="status-badge">${statusText}</div>
        </div>

        <div class="item-details">
          <h2 style="color: #ffffff; margin: 0 0 10px 0; font-size: 18px;">${itemName}</h2>
          ${sku ? `<div class="detail-row"><span class="detail-label">SKU:</span> <span class="detail-value">${sku}</span></div>` : ''}
          <div class="detail-row">
            <span class="detail-label">Category:</span>
            <span class="detail-value">${categoryName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Current Quantity:</span>
            <span class="detail-value">${quantityStr}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Minimum Quantity:</span>
            <span class="detail-value">${minStr}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Suggested Reorder:</span>
            <span class="detail-value">${reorderStr}</span>
          </div>
          ${locationName ? `<div class="detail-row"><span class="detail-label">Location:</span> <span class="detail-value">${locationName}</span></div>` : ''}
          ${supplierName ? `<div class="detail-row"><span class="detail-label">Supplier:</span> <span class="detail-value">${supplierName}</span></div>` : ''}
        </div>

        ${recentTransactions.length > 0 ? `
        <div class="transactions">
          <h3 style="color: #00e5ff; margin: 15px 0 10px 0; font-size: 14px;">RECENT ACTIVITY</h3>
          ${recentTransactions.map(tx => `
            <div class="transaction-item">
              <strong>${tx.type}</strong> ${tx.quantityChange > 0 ? '+' : ''}${tx.quantityChange} ${unitOfMeasure}
              ${tx.machineOrArea ? ` • ${tx.machineOrArea}` : ''}
              ${tx.jobReference ? ` • Job: ${tx.jobReference}` : ''}
              ${tx.performedBy ? ` • ${tx.performedBy}` : ''}
              <br><small style="color: #888888;">${tx.createdAt.toLocaleString()}</small>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/items" class="action-button">
            VIEW INVENTORY SYSTEM
          </a>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin" class="action-button">
            ACCESS ADMIN PANEL
          </a>
        </div>

        <div class="footer">
          This notification was generated by the AM Consumables Inventory System<br>
          Please take appropriate action to maintain inventory levels.
        </div>
      </div>
    </body>
    </html>
  `

  return { subject, html }
}
