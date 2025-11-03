# Prisma Workflow Guide

This document outlines the complete workflow for working with Prisma in our project, including initial setup and migration deployment procedures.

## 1. Initial Setup

### Creating a Schema-Only Branch in Neon Database

Before starting development, you need to create a dedicated schema-only branch for your database work:

1. **Access Neon Console**: Log into your [Neon Console](https://console.neon.tech)

2. **Create Schema-Only Branch**: 
   - Navigate to your project dashboard
   - Create a new child branch from the `staging` branch
   - **Important**: Select "Schema-only" option when creating the branch
   - This ensures you get the database structure without copying production data

3. **Branch Configuration**:
   - The schema-only branch will contain all tables, indexes, and constraints from staging
   - No actual data will be copied, keeping the branch lightweight
   - Perfect for development and testing schema changes

For detailed instructions, refer to the [Neon Schema-Only Branching Guide](https://neon.com/docs/guides/branching-schema-only).

### Local Environment Setup

1. **Install Dependencies**: Ensure Prisma is installed in your project
2. **Configure Database URL**: Update your `.env` file with the schema-only branch connection string
3. **Generate Prisma Client**: Run `pnpx prisma generate` to create the client

## 2. Migration Deployment

### Syncing Database Schema

Before making any changes, always sync your local environment with the current database state:

```bash
pnpx prisma migrate deploy
```

This command:
- Applies all pending migrations to your database
- Ensures your local schema matches the remote database
- Should be run before starting any new development work

### Creating New Migrations

When you modify existing models or create new ones, follow this naming convention:

```bash
pnpx prisma migrate dev --name MODEL_NAME-DATE-MONTH-YEAR
```

**Examples**:
- `pnpx prisma migrate dev --name user-15-12-2024`
- `pnpx prisma migrate dev --name product-inventory-20-12-2024`
- `pnpx prisma migrate dev --name order-status-update-25-12-2024`

### Migration Best Practices

1. **Descriptive Names**: Use clear, descriptive names that indicate what the migration does
2. **Date Format**: Always include the date in DD-MM-YYYY format
3. **Model Focus**: Reference the primary model being changed
4. **Sequential Development**: Complete one migration before starting another

## 🚨 CRITICAL RULES

### **ABSOLUTELY PROHIBITED ACTIONS**

**NEVER DIRECTLY MODIFY THE DATABASE SCHEMA OR CREATE VIEWS INSIDE IT**

All database operations MUST go through Prisma migrations and be deployed properly. This includes:

- ❌ **NO** direct SQL schema modifications
- ❌ **NO** creating views directly in the database
- ❌ **NO** manual table alterations
- ❌ **NO** bypassing the migration system

### **REQUIRED WORKFLOW**

✅ **ALWAYS** use Prisma schema files for changes  
✅ **ALWAYS** create migrations using `prisma migrate dev`  
✅ **ALWAYS** deploy migrations using `prisma migrate deploy`  
✅ **ALWAYS** commit migration files to version control  

### Why This Matters

- **Version Control**: All schema changes are tracked and versioned
- **Team Collaboration**: Everyone gets the same database structure
- **Rollback Capability**: Migrations can be reverted if needed
- **Production Safety**: Prevents inconsistent database states
- **Audit Trail**: Complete history of all database changes

## 3. Development Workflow Summary

1. **Start**: `pnpx prisma migrate deploy` (sync with remote)
2. **Develop**: Modify your `schema.prisma` files
3. **Migrate**: `pnpx prisma migrate dev --name DESCRIPTIVE-NAME-DD-MM-YYYY`
4. **Test**: Verify your changes work correctly
5. **Deploy**: Push migrations to staging/production environments
6. **Repeat**: Continue with next feature/fix

## 4. Troubleshooting

### Common Issues

- **Migration Conflicts**: Always pull latest changes before creating new migrations
- **Schema Drift**: Use `prisma db push` only for prototyping, never in production
- **Failed Migrations**: Check the migration SQL and database logs for errors

### Recovery Steps

If you encounter issues:
1. Check migration status: `pnpx prisma migrate status`
2. Reset if needed: `pnpx prisma migrate reset` (development only)
3. Regenerate client: `pnpx prisma generate`

---

**Remember**: Following this workflow ensures database consistency, team collaboration, and production stability. Always use Prisma's migration system for any database schema changes.