# AM Consumables Inventory & Auto-Reorder Portal

A production-ready web application for tracking Additive Manufacturing (AM) consumables with automated email notifications and a cyberpunk terminal aesthetic.

![Cyberpunk Terminal UI](https://via.placeholder.com/800x400/000011/00ffff?text=Cyberpunk+Terminal+UI)

## 🎯 Features

- **Real-time Inventory Tracking**: Track all AM consumables (powders, filters, PPE, gas, etc.)
- **Automated Notifications**: Email alerts when stock hits thresholds (low/out of stock/expiring)
- **Quick Usage Logging**: Streamlined forms for technicians to log consumption after jobs
- **Admin Management**: Comprehensive admin panel for managing items, categories, suppliers, and notification rules
- **Cyberpunk UI**: VT323 & Share Tech Mono fonts with CRT scanlines and neon glow effects
- **Production Ready**: Docker deployment with PostgreSQL and comprehensive API

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd am-consumables-inventory
   ```

2. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your settings
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec app npx prisma migrate dev --name init
   ```

5. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Admin login at [http://localhost:3000/admin](http://localhost:3000/admin)

### Local Development

1. **Prerequisites**
   - Node.js 18+
   - PostgreSQL 15+
   - npm or yarn

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database setup**
   ```bash
   # Configure your DATABASE_URL in .env
   npx prisma generate
   npx prisma db push
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/am_inventory"

# SMTP Configuration (for email notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@inventory.local"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Notification Defaults
NOTIFY_DEFAULT_RECIPIENTS="admin@company.com,manager@company.com"

# Admin Authentication
ADMIN_PASSWORD="super-secret-admin-password"
JWT_SECRET="your-jwt-secret-key-here-make-it-long-and-secure"
```

## 📋 API Reference

### Authentication Endpoints
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/me` - Check authentication status

### Data Endpoints
- `GET /api/summary` - Dashboard summary data
- `GET /api/items` - List items with filters
- `POST /api/items` - Create new item (admin only)
- `GET /api/items/[id]` - Get single item
- `PUT /api/items/[id]` - Update item (admin only)
- `DELETE /api/items/[id]` - Deactivate item (admin only)
- `POST /api/transactions` - Create inventory transaction
- `GET /api/transactions` - List transactions
- `GET /api/categories` - List categories

## 🎨 UI Components

### Core Components
- **StatusBadge**: Displays item status (OK/LOW/OUT/EXPIRING) with cyberpunk styling
- **DashboardCards**: Summary statistics cards with neon glow effects
- **ItemTable**: Data table for displaying inventory items
- **TransactionDialog**: Modal for logging usage or adding stock
- **RecentActivity**: Timeline of recent inventory transactions

### Pages
- **Dashboard (`/`)**: Overview with critical items and recent activity
- **Inventory List (`/items`)**: Searchable/filterable inventory table
- **Item Detail (`/items/[id]`)**: Detailed view with transaction history
- **Quick Usage (`/use`)**: Streamlined form for logging consumption
- **Admin Panel (`/admin`)**: Complete management interface

## 🔔 Notification System

The system automatically sends emails when inventory status changes:

### Notification Triggers
- **Low Stock**: When quantity drops below minimum threshold
- **Out of Stock**: When quantity reaches zero
- **Expiring Soon**: When items expire within 30 days (configurable)

### Email Features
- HTML emails with cyberpunk styling
- Item details, current/reorder quantities, supplier info
- Recent transaction history
- Direct links to inventory system

### Configuration
Notification rules can be configured per item or category via the admin panel, specifying:
- Email recipients
- Notification types (low stock, out of stock, expiring)
- Expiring soon threshold (days)

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Material-UI v7
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT with httpOnly cookies
- **Email**: Nodemailer with SMTP
- **Deployment**: Docker + Docker Compose

### Database Schema

#### Core Models
- **ConsumableCategory**: Item categories (Metal Powder, Filters, PPE, etc.)
- **ConsumableItem**: Individual inventory items with quantities and thresholds
- **Location**: Storage locations (Cabinets, Vaults, etc.)
- **Supplier**: Vendor information and contact details
- **InventoryTransaction**: All stock movements (additions, consumption, adjustments)

#### Notification Models
- **NotificationRule**: Configurable notification rules per item/category
- **NotificationLog**: History of all sent notifications

### Key Features
- **Atomic Transactions**: Database consistency for inventory updates
- **Status Calculation**: Automatic status determination based on thresholds
- **State Transitions**: Smart notification logic (only sends on status changes)
- **Audit Trail**: Complete transaction history for all inventory movements

## 🚀 Deployment

### Production Docker Deployment

1. **Build and deploy**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

2. **Database migrations**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

3. **Seed initial data (optional)**
   ```bash
   docker-compose exec app npx prisma db seed
   ```

### Environment Configuration

For production, ensure these environment variables are properly set:

- `NODE_ENV=production`
- Secure `JWT_SECRET` (long, random string)
- Strong `ADMIN_PASSWORD`
- Valid SMTP credentials
- Proper `DATABASE_URL` for production PostgreSQL

### Reverse Proxy (Recommended)

Use nginx or similar to proxy requests to the container:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Create and run migrations
npm run db:studio    # Open Prisma Studio
```

### Database Management
```bash
# Development
npx prisma migrate dev --name migration-name

# Production
npx prisma migrate deploy

# View database
npx prisma studio
```

### Adding New Items

1. **Via Admin Panel**: Use the web interface to add categories, items, locations, and suppliers
2. **Direct Database**: Use Prisma Studio or write scripts for bulk imports
3. **API**: Use the REST API endpoints for programmatic access

## 🎯 Usage Examples

### Quick Usage Logging
1. Navigate to `/use`
2. Select consumable from dropdown
3. Enter quantity used
4. Select machine/area
5. Add job reference (optional)
6. Submit - inventory updates automatically

### Admin Management
1. Login at `/admin` with admin password
2. Manage categories, items, suppliers, locations
3. Configure notification rules
4. View activity logs

### Monitoring Dashboard
- View critical items at a glance
- Monitor low stock alerts
- Track recent consumption patterns
- Access quick actions for common tasks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- Check the logs: `docker-compose logs app`
- View database: `npx prisma studio`
- Check API responses in browser dev tools

## 🔄 Updates

To update the application:
```bash
# Pull latest changes
git pull

# Rebuild containers
docker-compose build --no-cache

# Run migrations if schema changed
docker-compose exec app npx prisma migrate deploy

# Restart
docker-compose up -d
```

---

Built with ❤️ for Additive Manufacturing operations
