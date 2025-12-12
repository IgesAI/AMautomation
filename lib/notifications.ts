import { ConsumableItem, ItemStatus, NotificationType, NotificationRule } from '@prisma/client'
import { prisma } from './db'
import { calculateItemStatus } from './item-utils'
import { sendEmail, generateNotificationEmail } from './email'
import { differenceInDays } from 'date-fns'

export async function processItemNotifications(item: ConsumableItem) {
  const newStatus = calculateItemStatus(item)

  // Check if status changed from the last notified status
  if (item.lastNotifiedStatus === newStatus) {
    return // No change, no notification needed
  }

  // Get applicable notification rules
  const rules = await getApplicableNotificationRules(item)

  // Process each notification type based on state transition
  await processStatusTransition(item, item.lastNotifiedStatus, newStatus, rules)

  // Update the last notified status
  await prisma.consumableItem.update({
    where: { id: item.id },
    data: { lastNotifiedStatus: newStatus },
  })
}

async function getApplicableNotificationRules(item: ConsumableItem): Promise<NotificationRule[]> {
  const [itemRules, categoryRules] = await Promise.all([
    // Item-specific rules
    prisma.notificationRule.findMany({
      where: {
        itemId: item.id,
        isActive: true,
      },
      orderBy: { priority: 'desc' },
    }),
    // Category-wide rules
    prisma.notificationRule.findMany({
      where: {
        categoryId: item.categoryId,
        itemId: null, // Only category-wide rules
        isActive: true,
      },
      orderBy: { priority: 'desc' },
    }),
  ])

  return [...itemRules, ...categoryRules]
}

async function processStatusTransition(
  item: ConsumableItem,
  oldStatus: ItemStatus,
  newStatus: ItemStatus,
  rules: NotificationRule[]
) {
  const notificationsToSend: NotificationType[] = []

  // Determine which notifications to send based on transitions
  switch (newStatus) {
    case ItemStatus.OUT_OF_STOCK:
      if (oldStatus === ItemStatus.OK || oldStatus === ItemStatus.LOW) {
        notificationsToSend.push(NotificationType.OUT_OF_STOCK)
      }
      break
    case ItemStatus.LOW:
      if (oldStatus === ItemStatus.OK) {
        notificationsToSend.push(NotificationType.LOW_STOCK)
      }
      break
    case ItemStatus.EXPIRING_SOON:
      if (oldStatus === ItemStatus.OK) {
        notificationsToSend.push(NotificationType.EXPIRING_SOON)
      }
      break
  }

  // Send notifications for each type
  for (const notificationType of notificationsToSend) {
    await sendNotificationForType(item, notificationType, rules)
  }
}

async function sendNotificationForType(
  item: ConsumableItem,
  notificationType: NotificationType,
  rules: NotificationRule[]
) {
  // Filter rules that apply to this notification type
  const applicableRules = rules.filter(rule => {
    switch (notificationType) {
      case NotificationType.LOW_STOCK:
        return rule.notifyOnLowStock
      case NotificationType.OUT_OF_STOCK:
        return rule.notifyOnOutOfStock
      case NotificationType.EXPIRING_SOON:
        return rule.notifyOnExpiringSoon
      default:
        return false
    }
  })

  if (applicableRules.length === 0) {
    // Fall back to default recipients from environment
    const defaultRecipients = process.env.NOTIFY_DEFAULT_RECIPIENTS?.split(',').map(email => email.trim()) || []
    if (defaultRecipients.length > 0) {
      await sendNotificationToRecipients(item, notificationType, defaultRecipients)
    }
    return
  }

  // Collect all unique recipients from applicable rules
  const allRecipients = new Set<string>()
  applicableRules.forEach(rule => {
    rule.emails.forEach(email => allRecipients.add(email))
  })

  if (allRecipients.size > 0) {
    await sendNotificationToRecipients(item, notificationType, Array.from(allRecipients))
  }
}

async function sendNotificationToRecipients(
  item: ConsumableItem,
  notificationType: NotificationType,
  recipients: string[]
) {
  try {
    // Get item details with relations
    const itemWithDetails = await prisma.consumableItem.findUnique({
      where: { id: item.id },
      include: {
        category: { select: { name: true } },
        location: { select: { name: true } },
        supplier: { select: { name: true } },
      },
    })

    if (!itemWithDetails) return

    // Get recent transactions for context
    const recentTransactionsRaw = await prisma.inventoryTransaction.findMany({
      where: { itemId: item.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        type: true,
        quantityChange: true,
        createdAt: true,
        performedBy: true,
        machineOrArea: true,
        jobReference: true,
      },
    })

    // Convert Prisma types to plain types for email function
    const recentTransactions = recentTransactionsRaw.map(tx => ({
      type: tx.type as string,
      quantityChange: Number(tx.quantityChange),
      createdAt: tx.createdAt,
      performedBy: tx.performedBy,
      machineOrArea: tx.machineOrArea,
      jobReference: tx.jobReference,
    }))

    // Generate email content
    const { subject, html } = generateNotificationEmail(
      itemWithDetails.name,
      itemWithDetails.sku,
      itemWithDetails.category.name,
      Number(itemWithDetails.currentQuantity),
      Number(itemWithDetails.minimumQuantity),
      Number(itemWithDetails.reorderQuantity),
      itemWithDetails.unitOfMeasure,
      notificationType,
      recentTransactions,
      itemWithDetails.location?.name,
      itemWithDetails.supplier?.name
    )

    // Send email
    const emailSent = await sendEmail(recipients, subject, html)

    // Log the notification
    await prisma.notificationLog.create({
      data: {
        itemId: item.id,
        notificationType,
        recipients,
        subject,
        body: html,
        sentAt: new Date(),
        meta: {
          emailSent,
          itemStatus: calculateItemStatus(item),
        },
      },
    })

    console.log(`Notification sent: ${notificationType} for ${item.name} to ${recipients.join(', ')}`)

  } catch (error) {
    console.error('Error sending notification:', error)

    // Log failed notification
    await prisma.notificationLog.create({
      data: {
        itemId: item.id,
        notificationType,
        recipients,
        subject: `FAILED: ${notificationType} notification for ${item.name}`,
        body: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sentAt: new Date(),
        meta: {
          emailSent: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
    })
  }
}

export async function checkAllItemsForExpiringSoon() {
  // Find items that are expiring soon but not yet marked as such
  const expiringItems = await prisma.consumableItem.findMany({
    where: {
      isActive: true,
      expirationDate: {
        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        gte: new Date(),
      },
      lastNotifiedStatus: {
        not: ItemStatus.EXPIRING_SOON,
      },
    },
  })

  for (const item of expiringItems) {
    await processItemNotifications(item)
  }
}

export async function checkAllItemsForLowStock() {
  // Find items that are low stock but not yet marked as such
  const lowStockItems = await prisma.consumableItem.findMany({
    where: {
      isActive: true,
      currentQuantity: {
        gt: 0,
        lte: prisma.consumableItem.fields.minimumQuantity,
      },
      lastNotifiedStatus: {
        not: ItemStatus.LOW,
      },
    },
  })

  for (const item of lowStockItems) {
    await processItemNotifications(item)
  }
}
