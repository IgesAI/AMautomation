# Local Development Setup Guide

This guide will help you run the AM Automation application locally on your machine.

## ✅ Setup Complete!

The following has been configured:
- ✅ `.env` file created with local development settings
- ✅ PostgreSQL database `am_inventory` created
- ✅ Database user `inventory` created with proper permissions
- ✅ Prisma Client generated
- ✅ Database schema pushed to database

## 🚀 Running the Application

### Start the Development Server

```powershell
npm run dev
```

The application will be available at: **http://localhost:3000**

### Access Points

- **Main Dashboard**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Inventory List**: http://localhost:3000/items
- **Quick Usage**: http://localhost:3000/use

### Default Admin Credentials

- **Password**: `super-secret-admin-password` (as set in `.env`)
- **Note**: Change this in production!

## 📊 Database Management

### View Database with Prisma Studio

```powershell
npm run db:studio
```

This opens a visual database browser at http://localhost:5555

### Database Connection Details

- **Host**: localhost
- **Port**: 5432
- **Database**: am_inventory
- **User**: inventory
- **Password**: inventory_password

### Useful Database Commands

```powershell
# Generate Prisma Client (after schema changes)
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and run migrations
npm run db:migrate
```

## 🔧 Environment Variables

Your `.env` file is configured for local development. Key settings:

- `DATABASE_URL`: Points to local PostgreSQL instance
- `NEXT_PUBLIC_APP_URL`: http://localhost:3000
- `ADMIN_PASSWORD`: Change this for security
- `JWT_SECRET`: Change this for security
- `SMTP_*`: Configure these if you want email notifications to work

## 📝 Next Steps

1. **Start the dev server**: `npm run dev`
2. **Access the app**: Open http://localhost:3000
3. **Login to admin**: Go to /admin and use the password from `.env`
4. **Configure email** (optional): Update SMTP settings in `.env` if you want notifications

## 🐳 Alternative: Using Docker for Database Only

If you prefer to use Docker for just the database:

1. Start Docker Desktop
2. Run: `docker-compose up -d db`
3. The `.env` file is already configured to use `localhost:5432`

## 🚢 Deployment Preparation

When you're ready to deploy:

1. Update `.env` with production values:
   - Strong `ADMIN_PASSWORD`
   - Secure `JWT_SECRET`
   - Production `DATABASE_URL`
   - Valid SMTP credentials
   - Production `NEXT_PUBLIC_APP_URL`

2. Build for production:
   ```powershell
   npm run build
   ```

3. Use Docker Compose for full deployment:
   ```powershell
   docker-compose up -d
   ```

## 🆘 Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `psql -U postgres -c "SELECT version();"`
- Check if database exists: `psql -U postgres -l`
- Verify `.env` file has correct `DATABASE_URL`

### Port Already in Use

If port 3000 is in use, you can change it:
```powershell
$env:PORT=3001; npm run dev
```

### Prisma Issues

If you get Prisma errors:
```powershell
# Regenerate client
npm run db:generate

# Reset and push schema (WARNING: deletes all data)
npx prisma migrate reset
npx prisma db push
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Material-UI Documentation](https://mui.com/)

